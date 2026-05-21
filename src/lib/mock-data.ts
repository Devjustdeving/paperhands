import { WalletAnalysis, LeaderboardEntry, TokenStats, Badge } from "./types";

const BADGES: Badge[] = [
  { id: "diamond-hands", name: "Diamond Hands", description: "Held a token for 30+ days", icon: "💎", earned: true },
  { id: "early-bird", name: "Early Bird", description: "Bought within first hour of launch", icon: "🐦", earned: true },
  { id: "whale-spotter", name: "Whale Spotter", description: "Traded a token worth $1M+", icon: "🐋", earned: true },
  { id: "paper-tiger", name: "Paper Tiger", description: "Paperhanded 5+ tokens in one day", icon: "🐯", earned: false },
  { id: "round-tripper", name: "Round Tripper", description: "Completed 10+ full roundtrips", icon: "🔄", earned: true },
  { id: "degen-king", name: "Degen King", description: "Traded 50+ different tokens", icon: "👑", earned: false },
  { id: "bag-fumbler", name: "Bag Fumbler", description: "Fumbled $100K+ on a single token", icon: "💀", earned: true },
  { id: "sniper", name: "Sniper", description: "10x+ gain on a single trade", icon: "🎯", earned: true },
];

export function getMockWalletAnalysis(address: string): WalletAnalysis {
  return {
    address,
    chain: "solana",
    paperhandScore: 73,
    badges: BADGES,
    totalFumbledUSD: 48_291_000,
    totalGainedUSD: 456_780,
    paperhanded: [
      {
        token: { name: "Pnut", symbol: "PNUT", icon: "🥜", contractAddress: "2qEH...pump", platform: "pump.fun" },
        boughtWithSOL: 8, boughtWithUSD: 1364, soldForSOL: 3.34, soldForUSD: 569,
        fumbledSOL: 198335, fumbledUSD: 42_596_475, heldForHours: 0,
        tokenAmount: 17_990_000, totalValueUSD: 42_596_475, percentageGain: 7_490_000,
      },
      {
        token: { name: "ACT", symbol: "ACT", icon: "🎭", contractAddress: "GJAF...pump", platform: "pump.fun" },
        boughtWithSOL: 600, boughtWithUSD: 98332, soldForSOL: 727, soldForUSD: 116_474,
        fumbledSOL: 7530, fumbledUSD: 1_552_546, heldForHours: 87,
        tokenAmount: 6_440_000, totalValueUSD: 1_552_546, percentageGain: 1230,
      },
      {
        token: { name: "FRED", symbol: "FRED", icon: "🦝", contractAddress: "CNvi...pump", platform: "pump.fun" },
        boughtWithSOL: 45.5, boughtWithUSD: 7338, soldForSOL: 161, soldForUSD: 26_609,
        fumbledSOL: 4618, fumbledUSD: 1_006_437, heldForHours: 72,
        tokenAmount: 3_410_000, totalValueUSD: 1_006_437, percentageGain: 19_900,
      },
      {
        token: { name: "POPCAT", symbol: "POPCAT", icon: "🐱", contractAddress: "7GCi...W2hr", platform: "raydium" },
        boughtWithSOL: 4, boughtWithUSD: 273, soldForSOL: 122, soldForUSD: 9037,
        fumbledSOL: 30919, fumbledUSD: 5_316_684, heldForHours: 45,
        tokenAmount: 3_200_000, totalValueUSD: 5_316_684, percentageGain: 58_700,
      },
      {
        token: { name: "SHIBU", symbol: "SHIBU", icon: "🐕", contractAddress: "4xKm...doge", platform: "pump.fun" },
        boughtWithSOL: 12, boughtWithUSD: 2040, soldForSOL: 89, soldForUSD: 15_130,
        fumbledSOL: 1642, fumbledUSD: 279_430, heldForHours: 18,
        tokenAmount: 8_500_000, totalValueUSD: 279_430, percentageGain: 700,
      },
    ],
    roundtripped: [
      {
        token: { name: "GNON", symbol: "GNON", icon: "🧠", contractAddress: "HeJUF...pump", platform: "pump.fun" },
        boughtWithSOL: 50, boughtWithUSD: 8895, soldForSOL: 2380, soldForUSD: 423_420,
        fumbledSOL: 0, fumbledUSD: 0, heldForHours: 120,
        tokenAmount: 2_169_500, totalValueUSD: 423_420, percentageGain: 3782,
        athMarketcap: 192_900_000, nowWorth: 11_060,
        roundtrippedSOL: 2380, roundtrippedUSD: 423_420,
      },
      {
        token: { name: "SERCY", symbol: "SERCY", icon: "⚡", contractAddress: "8vFw...pump", platform: "pump.fun" },
        boughtWithSOL: 15, boughtWithUSD: 2550, soldForSOL: 195, soldForUSD: 33_150,
        fumbledSOL: 0, fumbledUSD: 0, heldForHours: 48,
        tokenAmount: 5_200_000, totalValueUSD: 173_470, percentageGain: 1200,
        athMarketcap: 45_000_000, nowWorth: 2_340,
        roundtrippedSOL: 195, roundtrippedUSD: 33_150,
      },
      {
        token: { name: "GAME", symbol: "GAME", icon: "🎮", contractAddress: "3kPq...pump", platform: "pump.fun" },
        boughtWithSOL: 25, boughtWithUSD: 4250, soldForSOL: 285, soldForUSD: 48_450,
        fumbledSOL: 0, fumbledUSD: 0, heldForHours: 96,
        tokenAmount: 12_000_000, totalValueUSD: 87_070, percentageGain: 1040,
        athMarketcap: 22_000_000, nowWorth: 890,
        roundtrippedSOL: 285, roundtrippedUSD: 48_450,
      },
    ],
    gained: [
      {
        token: { name: "BONK", symbol: "BONK", icon: "🐶", contractAddress: "DezX...bonk", platform: "raydium" },
        boughtWithSOL: 100, boughtWithUSD: 17_000, soldForSOL: 1450, soldForUSD: 246_500,
        fumbledSOL: 0, fumbledUSD: 0, heldForHours: 720,
        tokenAmount: 500_000_000, totalValueUSD: 246_500, percentageGain: 1350,
      },
      {
        token: { name: "WIF", symbol: "WIF", icon: "🧢", contractAddress: "EKpQ...wif", platform: "raydium" },
        boughtWithSOL: 50, boughtWithUSD: 8500, soldForSOL: 620, soldForUSD: 105_400,
        fumbledSOL: 0, fumbledUSD: 0, heldForHours: 336,
        tokenAmount: 25_000_000, totalValueUSD: 105_400, percentageGain: 1140,
      },
      {
        token: { name: "JTO", symbol: "JTO", icon: "✨", contractAddress: "jtoE...jto", platform: "jupiter" },
        boughtWithSOL: 200, boughtWithUSD: 34_000, soldForSOL: 618, soldForUSD: 104_880,
        fumbledSOL: 0, fumbledUSD: 0, heldForHours: 168,
        tokenAmount: 10_000, totalValueUSD: 104_880, percentageGain: 209,
      },
    ],
  };
}

export function getMockLeaderboard(): LeaderboardEntry[] {
  const entries: LeaderboardEntry[] = [];
  const bases = [
    { sol: 761680, usd: 183_000_000 },
    { sol: 705582, usd: 170_000_000 },
    { sol: 581882, usd: 140_000_000 },
    { sol: 503124, usd: 121_000_000 },
    { sol: 475228, usd: 114_000_000 },
    { sol: 443614, usd: 107_000_000 },
    { sol: 436922, usd: 105_000_000 },
    { sol: 386763, usd: 93_000_000 },
    { sol: 354613, usd: 85_000_000 },
    { sol: 348777, usd: 84_000_000 },
    { sol: 312450, usd: 75_000_000 },
    { sol: 298100, usd: 72_000_000 },
    { sol: 276543, usd: 66_000_000 },
    { sol: 254321, usd: 61_000_000 },
    { sol: 243210, usd: 58_000_000 },
    { sol: 231099, usd: 55_000_000 },
    { sol: 219876, usd: 53_000_000 },
    { sol: 208765, usd: 50_000_000 },
    { sol: 198654, usd: 48_000_000 },
    { sol: 187543, usd: 45_000_000 },
  ];

  const walletPrefixes = [
    "8FWU", "1234", "32GO", "8MV3", "ALAS", "C2N9", "DPBJ", "5KDW", "E57H", "75X5",
    "9kLm", "BvNx", "FqWr", "HjYt", "KpZs", "MnRu", "PwVe", "RxCf", "TyDg", "UzEh",
  ];
  const walletSuffixes = [
    "Z5TD", "SFAZ", "QXVW", "CV8P", "1Q8Z", "F47C", "X31A", "5USC", "RGZR", "VMBH",
    "3kLn", "7mPq", "2nRs", "8pTu", "4rVw", "6sXy", "1tZa", "9uBc", "5vDe", "3wFg",
  ];

  for (let i = 0; i < 20; i++) {
    entries.push({
      rank: i + 1,
      walletAddress: `${walletPrefixes[i]}...${walletSuffixes[i]}`,
      paperhandedValueSOL: bases[i].sol,
      paperhandedValueUSD: bases[i].usd,
      chain: "solana",
    });
  }
  return entries;
}

export function getMockTokenStats(address: string): TokenStats {
  return {
    token: {
      name: "Pnut",
      symbol: "PNUT",
      icon: "🥜",
      contractAddress: address,
    },
    totalPaperhanded: 2_450,
    totalPaperhandedUSD: 892_000_000,
    athMarketcap: 2_400_000_000,
    currentMarketcap: 340_000_000,
    topPaperhanders: getMockLeaderboard().slice(0, 10),
  };
}

export function generateAIRoast(analysis: WalletAnalysis): string {
  const roasts = [
    `This wallet fumbled $${(analysis.totalFumbledUSD / 1_000_000).toFixed(1)}M. That's not paper hands, that's tissue paper hands. A toddler with a crayon would've made better trading decisions.`,
    `You held ${analysis.paperhanded[0]?.token.name || "tokens"} for ${analysis.paperhanded[0]?.heldForHours || 0} hours. Most people hold their breath longer than that. The fumbled bag? ${analysis.paperhanded[0] ? "$" + (analysis.paperhanded[0].fumbledUSD / 1_000_000).toFixed(1) + "M" : "massive"}. Somewhere, a financial advisor just felt a disturbance in the force.`,
    `With a Paperhand Score of ${analysis.paperhandScore}/100, you're in the Hall of Shame. You bought the dip, sold the dip, and missed the rip. Classic.`,
    `Your trading strategy appears to be: buy high, panic, sell low, watch it moon, cry. You've fumbled more bags than an airport baggage handler on their first day.`,
    `Congratulations! You've earned the "Bag Fumbler" badge. That's not a badge of honor. That's a warning label. Your wallet should come with a surgeon general's warning: "Trading may cause extreme financial regret."`,
  ];

  const score = analysis.paperhandScore;
  let baseRoast = "";
  if (score >= 80) {
    baseRoast = `JEET LEVEL: LEGENDARY. With a Paperhand Score of ${score}/100, you're basically allergic to profits. `;
  } else if (score >= 60) {
    baseRoast = `JEET LEVEL: ADVANCED. Score: ${score}/100. You've graduated from the School of Selling Too Early. `;
  } else if (score >= 40) {
    baseRoast = `JEET LEVEL: INTERMEDIATE. Score: ${score}/100. You paperhand sometimes, diamond hand others. Make up your mind. `;
  } else {
    baseRoast = `JEET LEVEL: MINOR. Score: ${score}/100. Not bad, but you still fumbled some bags. `;
  }

  const randomRoast = roasts[Math.floor(Math.random() * roasts.length)];
  return baseRoast + randomRoast;
}
