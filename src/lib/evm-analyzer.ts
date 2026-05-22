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
    apiBase: "https://api.etherscan.io/api",
    nativeSymbol: "ETH",
    nativePrice: 3500,
    scanApiKey: "", // uses free tier
  },
  base: {
    apiBase: "https://api.basescan.org/api",
    nativeSymbol: "ETH",
    nativePrice: 3500,
    scanApiKey: "",
  },
  bsc: {
    apiBase: "https://api.bscscan.com/api",
    nativeSymbol: "BNB",
    nativePrice: 600,
    scanApiKey: "",
  },
};

async function getERC20Transfers(
  address: string,
  chain: keyof typeof CHAIN_CONFIG,
  apiKey?: string
): Promise<EtherscanTx[]> {
  const config = CHAIN_CONFIG[chain];
  const params = new URLSearchParams({
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

  const res = await fetch(`${config.apiBase}?${params}`, {
    next: { revalidate: 300 },
  });

  if (!res.ok) return [];

  const data = await res.json();
  if (data.status !== "1" || !Array.isArray(data.result)) return [];

  return data.result;
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
  const paperhanded: TokenTrade[] = [];
  const roundtripped: TokenTrade[] = [];
  const gained: TokenTrade[] = [];

  for (const [, pos] of positions) {
    if (pos.inTxs.length === 0 || pos.outTxs.length === 0) continue;
    if (pos.totalIn < 0.001) continue;

    const soldRatio = pos.totalOut / pos.totalIn;
    if (soldRatio < 0.5) continue;

    const firstIn = Math.min(...pos.inTxs.map((t) => t.timestamp));
    const lastOut = Math.max(...pos.outTxs.map((t) => t.timestamp));
    const heldHours = Math.round((lastOut - firstIn) / 3600);

    const estimatedBuyValue = pos.totalIn * 0.001 * config.nativePrice;
    const estimatedSellValue = pos.totalOut * 0.0008 * config.nativePrice;
    const estimatedCurrentValue = pos.totalIn * 0.002 * config.nativePrice;
    const fumbled = Math.max(0, estimatedCurrentValue - estimatedSellValue);

    const trade: TokenTrade = {
      token: {
        name: pos.name || pos.contractAddress.slice(0, 8),
        symbol: pos.symbol || "???",
        icon: "🪙",
        contractAddress: pos.contractAddress,
        platform: chain,
      },
      boughtWithSOL: estimatedBuyValue / config.nativePrice,
      boughtWithUSD: estimatedBuyValue,
      soldForSOL: estimatedSellValue / config.nativePrice,
      soldForUSD: estimatedSellValue,
      fumbledSOL: fumbled / config.nativePrice,
      fumbledUSD: fumbled,
      heldForHours: Math.abs(heldHours),
      tokenAmount: pos.totalIn,
      totalValueUSD: fumbled > 100 ? fumbled : estimatedSellValue - estimatedBuyValue,
      percentageGain: estimatedBuyValue > 0
        ? Math.round(((estimatedSellValue - estimatedBuyValue) / estimatedBuyValue) * 100)
        : 0,
    };

    if (fumbled > 100) {
      paperhanded.push(trade);
    } else if (estimatedSellValue > estimatedBuyValue) {
      gained.push(trade);
    } else {
      trade.roundtrippedSOL = trade.soldForSOL;
      trade.roundtrippedUSD = trade.soldForUSD;
      trade.nowWorth = 0;
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
