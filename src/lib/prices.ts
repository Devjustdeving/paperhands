interface JupiterPriceResponse {
  data: Record<
    string,
    {
      id: string;
      type: string;
      price: string;
    }
  >;
}

interface DexScreenerToken {
  pairs: {
    baseToken: {
      address: string;
      name: string;
      symbol: string;
    };
    priceUsd: string;
    fdv: number;
    marketCap: number;
    info?: {
      imageUrl?: string;
    };
  }[];
}

export async function getTokenPrices(
  mints: string[]
): Promise<Record<string, number>> {
  if (mints.length === 0) return {};

  const prices: Record<string, number> = {};
  const batchSize = 100;

  for (let i = 0; i < mints.length; i += batchSize) {
    const batch = mints.slice(i, i + batchSize);
    const ids = batch.join(",");

    try {
      const res = await fetch(`https://api.jup.ag/price/v2?ids=${ids}`, {
        next: { revalidate: 60 },
      });

      if (res.ok) {
        const data: JupiterPriceResponse = await res.json();
        for (const [mint, info] of Object.entries(data.data)) {
          if (info?.price) {
            prices[mint] = parseFloat(info.price);
          }
        }
      }
    } catch {
      // continue with what we have
    }
  }

  return prices;
}

export async function getSOLPrice(): Promise<number> {
  try {
    const res = await fetch(
      "https://api.jup.ag/price/v2?ids=So11111111111111111111111111111111111111112",
      { next: { revalidate: 60 } }
    );
    if (res.ok) {
      const data: JupiterPriceResponse = await res.json();
      const sol = data.data["So11111111111111111111111111111111111111112"];
      if (sol?.price) return parseFloat(sol.price);
    }
  } catch {
    // fallback
  }
  return 170;
}

export async function getTokenMetadata(
  mints: string[]
): Promise<Record<string, { name: string; symbol: string; icon: string }>> {
  const metadata: Record<
    string,
    { name: string; symbol: string; icon: string }
  > = {};

  for (const mint of mints.slice(0, 20)) {
    try {
      const res = await fetch(
        `https://api.dexscreener.com/tokens/v1/solana/${mint}`,
        { next: { revalidate: 3600 } }
      );

      if (res.ok) {
        const data: DexScreenerToken = await res.json();
        if (data.pairs && data.pairs.length > 0) {
          const pair = data.pairs[0];
          metadata[mint] = {
            name: pair.baseToken.name,
            symbol: pair.baseToken.symbol,
            icon: pair.info?.imageUrl || "🪙",
          };
        }
      }
    } catch {
      // skip
    }
  }

  return metadata;
}
