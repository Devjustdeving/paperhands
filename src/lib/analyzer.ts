import { ParsedSwap } from "./helius";
import { getTokenPrices, getSOLPrice, getTokenMetadata } from "./prices";
import { TokenTrade, WalletAnalysis, Badge } from "./types";

interface TokenPosition {
  mint: string;
  buys: ParsedSwap[];
  sells: ParsedSwap[];
  totalBoughtTokens: number;
  totalSoldTokens: number;
  totalSolSpent: number;
  totalSolReceived: number;
  firstBuyTimestamp: number;
  lastSellTimestamp: number;
}

function computeBadges(analysis: {
  paperhanded: TokenTrade[];
  roundtripped: TokenTrade[];
  gained: TokenTrade[];
  totalFumbledUSD: number;
}): Badge[] {
  const allTrades = [
    ...analysis.paperhanded,
    ...analysis.roundtripped,
    ...analysis.gained,
  ];

  return [
    {
      id: "diamond-hands",
      name: "Diamond Hands",
      description: "Held a token for 30+ days",
      icon: "💎",
      earned: allTrades.some((t) => t.heldForHours >= 720),
    },
    {
      id: "early-bird",
      name: "Early Bird",
      description: "Traded 10+ different tokens",
      icon: "🐦",
      earned: allTrades.length >= 10,
    },
    {
      id: "whale-spotter",
      name: "Whale Spotter",
      description: "Traded a token worth $1M+",
      icon: "🐋",
      earned: allTrades.some((t) => t.totalValueUSD >= 1_000_000),
    },
    {
      id: "paper-tiger",
      name: "Paper Tiger",
      description: "Paperhanded 5+ tokens",
      icon: "🐯",
      earned: analysis.paperhanded.length >= 5,
    },
    {
      id: "round-tripper",
      name: "Round Tripper",
      description: "Completed 3+ full roundtrips",
      icon: "🔄",
      earned: analysis.roundtripped.length >= 3,
    },
    {
      id: "degen-king",
      name: "Degen King",
      description: "Traded 20+ different tokens",
      icon: "👑",
      earned: allTrades.length >= 20,
    },
    {
      id: "bag-fumbler",
      name: "Bag Fumbler",
      description: "Fumbled $100K+ on a single token",
      icon: "💀",
      earned: analysis.paperhanded.some((t) => t.fumbledUSD >= 100_000),
    },
    {
      id: "sniper",
      name: "Sniper",
      description: "10x+ gain on a single trade",
      icon: "🎯",
      earned: allTrades.some((t) => t.percentageGain >= 1000),
    },
  ];
}

export async function analyzeWallet(
  swaps: ParsedSwap[],
  walletAddress: string
): Promise<WalletAnalysis> {
  const positions = new Map<string, TokenPosition>();

  for (const swap of swaps) {
    if (!positions.has(swap.tokenMint)) {
      positions.set(swap.tokenMint, {
        mint: swap.tokenMint,
        buys: [],
        sells: [],
        totalBoughtTokens: 0,
        totalSoldTokens: 0,
        totalSolSpent: 0,
        totalSolReceived: 0,
        firstBuyTimestamp: swap.timestamp,
        lastSellTimestamp: swap.timestamp,
      });
    }

    const pos = positions.get(swap.tokenMint)!;
    if (swap.direction === "buy") {
      pos.buys.push(swap);
      pos.totalBoughtTokens += swap.tokenAmount;
      pos.totalSolSpent += swap.solSpent;
      if (swap.timestamp < pos.firstBuyTimestamp) {
        pos.firstBuyTimestamp = swap.timestamp;
      }
    } else {
      pos.sells.push(swap);
      pos.totalSoldTokens += swap.tokenAmount;
      pos.totalSolReceived += swap.solReceived;
      if (swap.timestamp > pos.lastSellTimestamp) {
        pos.lastSellTimestamp = swap.timestamp;
      }
    }
  }

  const allMints = Array.from(positions.keys());
  const [tokenPrices, solPrice, tokenMeta] = await Promise.all([
    getTokenPrices(allMints),
    getSOLPrice(),
    getTokenMetadata(allMints),
  ]);

  const paperhanded: TokenTrade[] = [];
  const roundtripped: TokenTrade[] = [];
  const gained: TokenTrade[] = [];

  for (const [mint, pos] of positions) {
    if (pos.buys.length === 0) continue;

    const meta = tokenMeta[mint] || {
      name: mint.slice(0, 6),
      symbol: mint.slice(0, 4).toUpperCase(),
      icon: "🪙",
    };

    const currentPrice = tokenPrices[mint] || 0;
    const remainingTokens = pos.totalBoughtTokens - pos.totalSoldTokens;
    const currentValueOfRemaining = remainingTokens * currentPrice;

    const boughtUSD = pos.totalSolSpent * solPrice;
    const soldUSD = pos.totalSolReceived * solPrice;

    const heldHours = pos.sells.length > 0
      ? Math.round((pos.lastSellTimestamp - pos.firstBuyTimestamp) / 3600)
      : Math.round((Date.now() / 1000 - pos.firstBuyTimestamp) / 3600);

    const allTokenValueAtCurrentPrice = pos.totalBoughtTokens * currentPrice;
    const fumbledUSD = Math.max(0, allTokenValueAtCurrentPrice - soldUSD);
    const fumbledSOL = fumbledUSD / solPrice;

    const profitSOL = pos.totalSolReceived - pos.totalSolSpent;
    const profitUSD = soldUSD - boughtUSD;
    const percentageGain = boughtUSD > 0 ? Math.round((profitUSD / boughtUSD) * 100) : 0;

    const trade: TokenTrade = {
      token: {
        name: meta.name,
        symbol: meta.symbol,
        icon: meta.icon,
        contractAddress: mint,
        platform: pos.buys[0]?.source || "unknown",
      },
      boughtWithSOL: pos.totalSolSpent,
      boughtWithUSD: boughtUSD,
      soldForSOL: pos.totalSolReceived,
      soldForUSD: soldUSD,
      fumbledSOL,
      fumbledUSD,
      heldForHours: Math.abs(heldHours),
      tokenAmount: pos.totalBoughtTokens,
      totalValueUSD: allTokenValueAtCurrentPrice,
      percentageGain: Math.abs(percentageGain),
    };

    const soldAll = pos.totalSoldTokens >= pos.totalBoughtTokens * 0.9;

    if (soldAll && fumbledUSD > 100) {
      trade.totalValueUSD = fumbledUSD;
      paperhanded.push(trade);
    } else if (soldAll && profitUSD > 0) {
      trade.totalValueUSD = profitUSD;
      trade.roundtrippedSOL = profitSOL;
      trade.roundtrippedUSD = profitUSD;
      trade.nowWorth = currentValueOfRemaining;
      gained.push(trade);
    } else if (soldAll) {
      trade.roundtrippedSOL = pos.totalSolReceived;
      trade.roundtrippedUSD = soldUSD;
      trade.nowWorth = currentValueOfRemaining;
      trade.athMarketcap = allTokenValueAtCurrentPrice * 1000;
      roundtripped.push(trade);
    }
  }

  paperhanded.sort((a, b) => b.fumbledUSD - a.fumbledUSD);
  gained.sort((a, b) => b.totalValueUSD - a.totalValueUSD);
  roundtripped.sort((a, b) => (b.roundtrippedUSD || 0) - (a.roundtrippedUSD || 0));

  const totalFumbledUSD = paperhanded.reduce((s, t) => s + t.fumbledUSD, 0);
  const totalGainedUSD = gained.reduce((s, t) => s + t.totalValueUSD, 0);

  const totalTrades = paperhanded.length + roundtripped.length + gained.length;
  const paperhandRatio = totalTrades > 0 ? paperhanded.length / totalTrades : 0;
  const fumbleWeight = Math.min(totalFumbledUSD / 1_000_000, 1);
  const paperhandScore = Math.round(
    Math.min(100, paperhandRatio * 60 + fumbleWeight * 40)
  );

  const partialAnalysis = {
    paperhanded: paperhanded.slice(0, 20),
    roundtripped: roundtripped.slice(0, 20),
    gained: gained.slice(0, 20),
    totalFumbledUSD,
  };

  const badges = computeBadges(partialAnalysis);

  return {
    address: walletAddress,
    chain: "solana",
    paperhanded: partialAnalysis.paperhanded,
    roundtripped: partialAnalysis.roundtripped,
    gained: partialAnalysis.gained,
    paperhandScore,
    badges,
    totalFumbledUSD,
    totalGainedUSD,
  };
}
