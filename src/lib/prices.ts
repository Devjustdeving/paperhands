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
      // continue
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

type TokenMeta = { name: string; symbol: string; icon: string };

async function getHeliusDASMetadata(
  mints: string[],
  apiKey: string
): Promise<Record<string, TokenMeta>> {
  const metadata: Record<string, TokenMeta> = {};

  const batchSize = 100;
  for (let i = 0; i < mints.length; i += batchSize) {
    const batch = mints.slice(i, i + batchSize);
    try {
      const res = await fetch(`https://mainnet.helius-rpc.com/?api-key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "meta",
          method: "getAssetBatch",
          params: { ids: batch },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const assets = data.result || [];
        for (const asset of assets) {
          if (!asset?.id) continue;
          const name = asset.content?.metadata?.name || "";
          const symbol = asset.content?.metadata?.symbol || "";
          const icon = asset.content?.links?.image
            || asset.content?.files?.[0]?.cdn_uri
            || asset.content?.files?.[0]?.uri
            || "";

          if (name || symbol) {
            metadata[asset.id] = {
              name: name.replace(/\0/g, "").trim(),
              symbol: symbol.replace(/\0/g, "").trim(),
              icon: icon || "🪙",
            };
          }
        }
      }
    } catch {
      // fallback to legacy endpoint
    }
  }

  if (Object.keys(metadata).length === 0) {
    return getHeliusLegacyMetadata(mints, apiKey);
  }

  return metadata;
}

async function getHeliusLegacyMetadata(
  mints: string[],
  apiKey: string
): Promise<Record<string, TokenMeta>> {
  const metadata: Record<string, TokenMeta> = {};

  const batchSize = 100;
  for (let i = 0; i < mints.length; i += batchSize) {
    const batch = mints.slice(i, i + batchSize);
    try {
      const res = await fetch(
        `https://api.helius.xyz/v0/tokens/metadata?api-key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mintAccounts: batch, includeOffChain: true }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        for (const item of data) {
          if (!item.account) continue;
          const name =
            item.onChainMetadata?.metadata?.data?.name ||
            item.offChainMetadata?.metadata?.name ||
            item.legacyMetadata?.name ||
            "";
          const symbol =
            item.onChainMetadata?.metadata?.data?.symbol ||
            item.offChainMetadata?.metadata?.symbol ||
            item.legacyMetadata?.symbol ||
            "";
          const icon =
            item.offChainMetadata?.metadata?.image ||
            "";

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
): Promise<Record<string, TokenMeta>> {
  const metadata: Record<string, TokenMeta> = {};

  const batchSize = 30;
  for (let i = 0; i < mints.length; i += batchSize) {
    const batch = mints.slice(i, i + batchSize).join(",");
    if (!batch) continue;

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
      // continue
    }
  }

  return metadata;
}

async function getJupiterTokenList(
  mints: string[]
): Promise<Record<string, TokenMeta>> {
  const metadata: Record<string, TokenMeta> = {};

  try {
    const res = await fetch("https://token.jup.ag/all", {
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const tokens = await res.json();
      const mintSet = new Set(mints);

      for (const token of tokens) {
        if (mintSet.has(token.address)) {
          metadata[token.address] = {
            name: token.name || "",
            symbol: token.symbol || "",
            icon: token.logoURI || "🪙",
          };
        }
      }
    }
  } catch {
    // continue
  }

  return metadata;
}

export async function getTokenMetadata(
  mints: string[]
): Promise<Record<string, TokenMeta>> {
  if (mints.length === 0) return {};

  const apiKey = process.env.HELIUS_API_KEY;

  const [heliusMeta, dexMeta, jupMeta] = await Promise.all([
    apiKey
      ? getHeliusDASMetadata(mints, apiKey)
      : Promise.resolve({} as Record<string, TokenMeta>),
    getDexScreenerMetadata(mints),
    getJupiterTokenList(mints),
  ]);

  const merged: Record<string, TokenMeta> = {};

  for (const mint of mints) {
    const helius = heliusMeta[mint];
    const dex = dexMeta[mint];
    const jup = jupMeta[mint];

    const name = helius?.name || jup?.name || dex?.name || "";
    const symbol = helius?.symbol || jup?.symbol || dex?.symbol || "";

    let icon = "🪙";
    if (dex?.icon && dex.icon.startsWith("http")) icon = dex.icon;
    else if (jup?.icon && jup.icon.startsWith("http")) icon = jup.icon;
    else if (helius?.icon && helius.icon.startsWith("http")) icon = helius.icon;

    if (name || symbol) {
      merged[mint] = { name, symbol, icon };
    }
  }

  return merged;
}
