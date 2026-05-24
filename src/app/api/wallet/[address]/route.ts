import { NextRequest, NextResponse } from "next/server";
import { getWalletTransactions, parseSwaps } from "@/lib/helius";
import { analyzeWallet } from "@/lib/analyzer";
import { analyzeEVMWallet } from "@/lib/evm-analyzer";
import { getMockWalletAnalysis } from "@/lib/mock-data";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params;
  const chain = request.nextUrl.searchParams.get("chain") || "solana";

  if (chain === "ethereum" || chain === "base" || chain === "bsc") {
    try {
      const apiKey = process.env.ETHERSCAN_API_KEY;

      const analysis = await analyzeEVMWallet(
        address,
        chain as "ethereum" | "base" | "bsc",
        apiKey || undefined
      );

      if (
        analysis.paperhanded.length === 0 &&
        analysis.roundtripped.length === 0 &&
        analysis.gained.length === 0
      ) {
        return NextResponse.json(
          { error: "No token trades found for this wallet on " + chain },
          { status: 404 }
        );
      }

      return NextResponse.json(analysis);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      console.error("EVM analysis error:", msg);
      if (msg.includes("Max rate limit")) {
        return NextResponse.json(
          { error: "Rate limited by " + chain + " API. Please wait a moment and try again." },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { error: "Failed to analyze wallet on " + chain + ". Please try again." },
        { status: 500 }
      );
    }
  }

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
