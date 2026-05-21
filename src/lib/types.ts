export interface TokenTrade {
  token: {
    name: string;
    symbol: string;
    icon: string;
    contractAddress: string;
    platform: string;
  };
  boughtWithSOL: number;
  boughtWithUSD: number;
  soldForSOL: number;
  soldForUSD: number;
  fumbledSOL: number;
  fumbledUSD: number;
  heldForHours: number;
  tokenAmount: number;
  totalValueUSD: number;
  percentageGain: number;
  athMarketcap?: number;
  nowWorth?: number;
  roundtrippedSOL?: number;
  roundtrippedUSD?: number;
}

export interface WalletAnalysis {
  address: string;
  chain: string;
  paperhanded: TokenTrade[];
  roundtripped: TokenTrade[];
  gained: TokenTrade[];
  paperhandScore: number;
  badges: Badge[];
  totalFumbledUSD: number;
  totalGainedUSD: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  walletAddress: string;
  paperhandedValueSOL: number;
  paperhandedValueUSD: number;
  chain: string;
}

export interface TokenStats {
  token: {
    name: string;
    symbol: string;
    icon: string;
    contractAddress: string;
  };
  totalPaperhanded: number;
  totalPaperhandedUSD: number;
  topPaperhanders: LeaderboardEntry[];
  athMarketcap: number;
  currentMarketcap: number;
}

export type AnalysisTab = "paperhand" | "roundtrip" | "gained";
export type Chain = "solana" | "ethereum" | "base";
