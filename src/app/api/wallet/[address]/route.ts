import { NextRequest, NextResponse } from "next/server";
import { getWalletTransactions, parseSwaps } from "@/lib/helius";
import { analyzeWallet } from "@/lib/analyzer";
import { getMockWalletAnalysis } from "@/lib/mock-data";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params;
  const apiKey = process.env.HELIUS_API_KEY;

  if (!apiKey) {
    return NextResponse.json(getMockWalletAnalysis(address));
  }

  try {
    const transactions = await getWalletTransactions(address, apiKey);

    if (transactions.length === 0) {
      return NextResponse.json(
        { error: "No swap transactions found for this wallet" },
        { status: 404 }
      );
    }

    const swaps = parseSwaps(transactions, address);
    const analysis = await analyzeWallet(swaps, address);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Wallet analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze wallet. Please try again." },
      { status: 500 }
    );
  }
}
