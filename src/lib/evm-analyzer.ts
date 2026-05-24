import { WalletAnalysis, TokenTrade, Badge } from "./types";

interface EtherscanTx {
  hash: string;
  timeStamp: string;
  from: string;
  to: string;
  value: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimal: string;
  contractAddress: string;
}

const CHAIN_CONFIG = {
  ethereum: {
    chainId: 1,
    nativeSymbol: "ETH",
  },
  base: {
    chainId: 8453,
    nativeSymbol: "ETH",
  },
  bsc: {
    chainId: 56,
    nativeSymbol: "BNB",
  },
};

async function getERC20Transfers(
  address: string,
  chain: keyof typeof CHAIN_CONFIG,
  apiKey?: string
): Promise<EtherscanTx[]> {
  const config = CHAIN_CONFIG[chain];
  const params = new URLSearchParams({
    chainid: String(config.chainId),
    module: "account",
    action: "tokentx",
    address,
    startblock: "0",
    endblock: "99999999",
    sort: "desc",
    offset: "500",
    page: "1",
  });
  if (apiKey) params.set("apikey", apiKey);

  const res = await fetch(`https://api.etherscan.io/v2/api?${params}`, {
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    throw new Error(`${chain} API returned status ${res.status}`);
  }

  const data = await res.json();

  if (data.status === "0" && data.message === "No transactions found") {
    return [];
  }

  if (data.status === "0" && typeof data.result === "string") {
    throw new Error(data.result);
  }

  if (data.status !== "1" || !Array.isArray(data.result)) return [];

  return data.result;
}

async function getTokenPrice(contractAddress: string): Promise<number> {
  try {
    const res = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${contractAddress}`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return 0;
    const data = await res.json();
    if (data.pairs && data.pairs.length > 0) {
      return parseFloat(data.pairs[0].priceUsd || "0");
    }
    return 0;
  } catch {
    return 0;
  }
}

async function getNativePrice(symbol: string): Promise<number> {
  try {
    const id = symbol === "BNB" ? "binancecoin" : "ethereum";
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return symbol === "BNB" ? 600 : 3500;
    const data = await res.json();
    return data[id]?.usd || (symbol === "BNB" ? 600 : 3500);
  } catch {
    return symbol === "BNB" ? 600 : 3500;
  }
}

interface TokenPosition {
  contractAddress: string;
  name: string;
  symbol: string;
  decimals: number;
  totalIn: number;
  totalOut: number;
  inTxs: { amount: number; timestamp: number }[];
  outTxs: { amount: number; timestamp: number }[];
}

export async function analyzeEVMWallet(
  address: string,
  chain: "ethereum" | "base" | "bsc",
  apiKey?: string
): Promise<WalletAnalysis> {
  const transfers = await getERC20Transfers(address, chain, apiKey);
  const lowerAddr = address.toLowerCase();

  const positions = new Map<string, TokenPosition>();

  for (const tx of transfers) {
    const ca = tx.contractAddress.toLowerCase();
    if (!positions.has(ca)) {
      positions.set(ca, {
        contractAddress: tx.contractAddress,
        name: tx.tokenName,
        symbol: tx.tokenSymbol,
        decimals: parseInt(tx.tokenDecimal) || 18,
        totalIn: 0,
        totalOut: 0,
        inTxs: [],
        outTxs: [],
      });
    }

    const pos = positions.get(ca)!;
    const amount = parseFloat(tx.value) / Math.pow(10, pos.decimals);

    if (tx.to.toLowerCase() === lowerAddr) {
      pos.totalIn += amount;
      pos.inTxs.push({ amount, timestamp: parseInt(tx.timeStamp) });
    } else if (tx.from.toLowerCase() === lowerAddr) {
      pos.totalOut += amount;
      pos.outTxs.push({ amount, timestamp: parseInt(tx.timeStamp) });
    }
  }

  const config = CHAIN_CONFIG[chain];
  const nativePrice = await getNativePrice(config.nativeSymbol);
  const paperhanded: TokenTrade[] = [];
  const roundtripped: TokenTrade[] = [];
  const gained: TokenTrade[] = [];

  const contractAddresses = Array.from(positions.keys());
  const prices: Record<string, number> = {};
  const priceBatches = [];
  for (let i = 0; i < contractAddresses.length; i += 30) {
    priceBatches.push(contractAddresses.slice(i, i + 30));
  }
  await Promise.all(
    priceBatches.map(async (batch) => {
      for (const ca of batch) {
        const pos = positions.get(ca)!;
        prices[ca] = await getTokenPrice(pos.contractAddress);
      }
    })
  );

  for (const [ca, pos] of positions) {
    if (pos.inTxs.length === 0 || pos.outTxs.length === 0) continue;
    if (pos.totalIn < 0.001) continue;

    const soldRatio = pos.totalOut / pos.totalIn;
    if (soldRatio < 0.5) continue;

    const firstIn = Math.min(...pos.inTxs.map((t) => t.timestamp));
    const lastOut = Math.max(...pos.outTxs.map((t) => t.timestamp));
    const heldSeconds = Math.abs(lastOut - firstIn);
    const heldHours = heldSeconds / 3600;

    const currentPrice = prices[ca] || 0;
    const remainingTokens = pos.totalIn - pos.totalOut;
    const currentValueOfAll = pos.totalIn * currentPrice;
    const currentValueOfRemaining = Math.max(0, remainingTokens) * currentPrice;
    const soldValueUSD = pos.totalOut * currentPrice;
    const boughtValueUSD = pos.totalIn * currentPrice * 0.5;

    const boughtNative = boughtValueUSD > 0 && nativePrice > 0 ? boughtValueUSD / nativePrice : 0;
    const soldNative = soldValueUSD > 0 && nativePrice > 0 ? soldValueUSD / nativePrice : 0;
    const fumbledUSD = Math.max(0, currentValueOfAll - soldValueUSD);
    const fumbledNative = nativePrice > 0 ? fumbledUSD / nativePrice : 0;

    const referenceUSD = soldValueUSD > 0 ? soldValueUSD : boughtValueUSD > 0 ? boughtValueUSD : 1;
    const percentageGain = Math.max(0, Math.round(((currentValueOfAll / referenceUSD) - 1) * 100));

    const trade: TokenTrade = {
      token: {
        name: pos.name || pos.contractAddress.slice(0, 8),
        symbol: pos.symbol || "???",
        icon: "🪙",
        contractAddress: pos.contractAddress,
        platform: chain,
      },
      boughtWithSOL: boughtNative,
      boughtWithUSD: boughtValueUSD,
      soldForSOL: soldNative,
      soldForUSD: soldValueUSD,
      fumbledSOL: fumbledNative,
      fumbledUSD: fumbledUSD,
      heldForHours: heldHours,
      tokenAmount: pos.totalIn,
      totalValueUSD: currentValueOfAll,
      percentageGain,
    };

    const soldAll = pos.totalOut >= pos.totalIn * 0.9;

    if (soldAll && fumbledUSD > 1) {
      trade.totalValueUSD = fumbledUSD;
      paperhanded.push(trade);
    } else if (soldAll && soldValueUSD > boughtValueUSD) {
      trade.totalValueUSD = soldValueUSD - boughtValueUSD;
      gained.push(trade);
    } else if (soldAll) {
      trade.roundtrippedSOL = soldNative;
      trade.roundtrippedUSD = soldValueUSD;
      trade.nowWorth = currentValueOfRemaining;
      roundtripped.push(trade);
    }
  }

  paperhanded.sort((a, b) => b.fumbledUSD - a.fumbledUSD);
  gained.sort((a, b) => b.totalValueUSD - a.totalValueUSD);

  const totalFumbledUSD = paperhanded.reduce((s, t) => s + t.fumbledUSD, 0);
  const totalGainedUSD = gained.reduce((s, t) => s + t.totalValueUSD, 0);

  const totalTrades = paperhanded.length + roundtripped.length + gained.length;
  const ratio = totalTrades > 0 ? paperhanded.length / totalTrades : 0;
  const fumbleW = Math.min(totalFumbledUSD / 1_000_000, 1);
  const paperhandScore = Math.round(Math.min(100, ratio * 60 + fumbleW * 40));

  const allTrades = [...paperhanded, ...roundtripped, ...gained];
  const badges: Badge[] = [
    { id: "diamond-hands", name: "Diamond Hands", description: "Held a token for 30+ days", icon: "💎", earned: allTrades.some((t) => t.heldForHours >= 720) },
    { id: "early-bird", name: "Early Bird", description: "Traded 10+ different tokens", icon: "🐦", earned: allTrades.length >= 10 },
    { id: "whale-spotter", name: "Whale Spotter", description: "Traded a token worth $1M+", icon: "🐋", earned: allTrades.some((t) => t.totalValueUSD >= 1_000_000) },
    { id: "paper-tiger", name: "Paper Tiger", description: "Paperhanded 5+ tokens", icon: "🐯", earned: paperhanded.length >= 5 },
    { id: "round-tripper", name: "Round Tripper", description: "Completed 3+ full roundtrips", icon: "🔄", earned: roundtripped.length >= 3 },
    { id: "degen-king", name: "Degen King", description: "Traded 20+ different tokens", icon: "👑", earned: allTrades.length >= 20 },
    { id: "bag-fumbler", name: "Bag Fumbler", description: "Fumbled $100K+ on a single token", icon: "💀", earned: paperhanded.some((t) => t.fumbledUSD >= 100_000) },
    { id: "sniper", name: "Sniper", description: "10x+ gain on a single trade", icon: "🎯", earned: allTrades.some((t) => t.percentageGain >= 1000) },
  ];

  return {
    address,
    chain,
    paperhanded: paperhanded.slice(0, 20),
    roundtripped: roundtripped.slice(0, 20),
    gained: gained.slice(0, 20),
    paperhandScore,
    badges,
    totalFumbledUSD,
    totalGainedUSD,
  };
}
