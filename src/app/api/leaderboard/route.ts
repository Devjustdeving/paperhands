import { NextRequest, NextResponse } from "next/server";
import { getLeaderboard } from "@/lib/storage";

export async function GET(request: NextRequest) {
  const limit = parseInt(request.nextUrl.searchParams.get("limit") || "20");
  const offset = parseInt(request.nextUrl.searchParams.get("offset") || "0");

  const { entries, total } = await getLeaderboard(limit, offset);

  const formatted = entries.map((entry, i) => ({
    rank: offset + i + 1,
    walletAddress: entry.address,
    paperhandedValueSOL: entry.totalFumbledSOL,
    paperhandedValueUSD: entry.totalFumbledUSD,
    paperhandScore: entry.paperhandScore,
    chain: entry.chain,
    tradeCount: entry.paperhanded + entry.roundtripped + entry.gained,
  }));

  return NextResponse.json({ entries: formatted, total });
}
