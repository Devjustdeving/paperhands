import { Redis } from "@upstash/redis";
import { WalletAnalysis } from "./types";

interface LeaderboardRecord {
  address: string;
  chain: string;
  paperhandScore: number;
  totalFumbledUSD: number;
  totalFumbledSOL: number;
  totalGainedUSD: number;
  paperhanded: number;
  roundtripped: number;
  gained: number;
  updatedAt: number;
}

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export async function saveWalletAnalysis(analysis: WalletAnalysis): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  try {
    const solPrice = analysis.totalFumbledUSD > 0 && analysis.paperhanded.length > 0
      ? analysis.paperhanded[0].fumbledUSD / (analysis.paperhanded[0].fumbledSOL || 1)
      : 170;

    const totalFumbledSOL = solPrice > 0 ? analysis.totalFumbledUSD / solPrice : 0;

    const record: LeaderboardRecord = {
      address: analysis.address,
      chain: analysis.chain,
      paperhandScore: analysis.paperhandScore,
      totalFumbledUSD: analysis.totalFumbledUSD,
      totalFumbledSOL: totalFumbledSOL,
      totalGainedUSD: analysis.totalGainedUSD,
      paperhanded: analysis.paperhanded.length,
      roundtripped: analysis.roundtripped.length,
      gained: analysis.gained.length,
      updatedAt: Date.now(),
    };

    await redis.hset(`wallet:${analysis.address}`, record as unknown as Record<string, unknown>);

    if (analysis.totalFumbledUSD > 0) {
      await redis.zadd("leaderboard:fumbled", {
        score: analysis.totalFumbledUSD,
        member: analysis.address,
      });
    }
  } catch (e) {
    console.error("Failed to save wallet analysis:", e);
  }
}

export async function getLeaderboard(
  limit = 20,
  offset = 0
): Promise<{ entries: LeaderboardRecord[]; total: number }> {
  const redis = getRedis();
  if (!redis) return { entries: [], total: 0 };

  try {
    const total = await redis.zcard("leaderboard:fumbled");
    const addresses = await redis.zrange("leaderboard:fumbled", offset, offset + limit - 1, {
      rev: true,
    }) as string[];

    if (addresses.length === 0) return { entries: [], total };

    const pipeline = redis.pipeline();
    for (const addr of addresses) {
      pipeline.hgetall(`wallet:${addr}`);
    }
    const results = await pipeline.exec();

    const entries: LeaderboardRecord[] = results
      .filter((r): r is LeaderboardRecord => r !== null && typeof r === "object" && "address" in (r as object))
      .map((r) => r as LeaderboardRecord);

    return { entries, total };
  } catch (e) {
    console.error("Failed to fetch leaderboard:", e);
    return { entries: [], total: 0 };
  }
}
