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

interface HeliusAsset {
  id: string;
  content?: {
    metadata?: {
      name?: string;
      symbol?: string;
    };
    links?: {
      image?: string;
    };
    files?: { uri?: string; cdn_uri?: string }[];
  };
}

async function getHeliusMetadata(
  mints: string[],
  apiKey: string
): Promise<Record<string, { name: string; symbol: string; icon: string }>> {
  const metadata: Record<string, { name: string; symbol: string; icon: string }> = {};

  const batchSize = 100;
  for (let i = 0; i < mints.length; i += batchSize) {
    const batch = mints.slice(i, i + batchSize);
    try {
      const res = await fetch(`https://api.helius.xyz/v0/tokens/metadata?api-key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mintAccounts: batch, includeOffChain: true }),
      });

      if (res.ok) {
        const data = await res.json();
        for (const item of data) {
          if (!item.account) continue;
          const name = item.onChainMetadata?.metadata?.data?.name
            || item.offChainMetadata?.metadata?.name
            || item.legacyMetadata?.name
            || "";
          const symbol = item.onChainMetadata?.metadata?.data?.symbol
            || item.offChainMetadata?.metadata?.symbol
            || item.legacyMetadata?.symbol
            || "";
          const icon = item.offChainMetadata?.metadata?.image
            || item.onChainMetadata?.metadata?.data?.uri
            || "";

          if (name || symbol) {
            metadata[item.account] = {
              name: name.replace(/\0/g, "").trim(),
              symbol: symbol.replace(/\0/g, "").trim(),
              icon: icon || "🪙",
            };
          }
        }
      }
    } catch {
      // continue
    }
  }

  return metadata;
}

async function getDexScreenerMetadata(
  mints: string[]
): Promise<Record<string, { name: string; symbol: string; icon: string }>> {
  const metadata: Record<string, { name: string; symbol: string; icon: string }> = {};

  const batch = mints.slice(0, 30).join(",");
  if (!batch) return metadata;

  try {
    const res = await fetch(
      `https://api.dexscreener.com/tokens/v1/solana/${batch}`,
      { next: { revalidate: 3600 } }
    );

    if (res.ok) {
      const data = await res.json();
      const pairs = Array.isArray(data) ? data : data.pairs || [];
      for (const pair of pairs) {
        const token = pair.baseToken;
        if (token?.address && !metadata[token.address]) {
          metadata[token.address] = {
            name: token.name || "",
            symbol: token.symbol || "",
            icon: pair.info?.imageUrl || "🪙",
          };
        }
      }
    }
  } catch {
    // fallback
  }

  return metadata;
}

export async function getTokenMetadata(
  mints: string[]
): Promise<Record<string, { name: string; symbol: string; icon: string }>> {
  if (mints.length === 0) return {};

  const apiKey = process.env.HELIUS_API_KEY;

  const [heliusMeta, dexMeta] = await Promise.all([
    apiKey ? getHeliusMetadata(mints, apiKey) : Promise.resolve({} as Record<string, { name: string; symbol: string; icon: string }>),
    getDexScreenerMetadata(mints),
  ]);

  const merged: Record<string, { name: string; symbol: string; icon: string }> = {};

  for (const mint of mints) {
    const helius = heliusMeta[mint];
    const dex = dexMeta[mint];

    if (helius && helius.name) {
      merged[mint] = {
        name: helius.name,
        symbol: helius.symbol || (dex?.symbol || ""),
        icon: (dex?.icon && dex.icon.startsWith("http")) ? dex.icon : helius.icon,
      };
    } else if (dex && dex.name) {
      merged[mint] = dex;
    }
  }

  return merged;
}
