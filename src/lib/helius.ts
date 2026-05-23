const HELIUS_BASE = "https://api.helius.xyz/v0";

interface HeliusTransaction {
  signature: string;
  timestamp: number;
  type: string;
  source: string;
  fee: number;
  description: string;
  tokenTransfers: {
    fromUserAccount: string;
    toUserAccount: string;
    mint: string;
    tokenAmount: number;
    tokenStandard: string;
  }[];
  nativeTransfers: {
    fromUserAccount: string;
    toUserAccount: string;
    amount: number;
  }[];
  events: {
    swap?: {
      nativeInput?: { account: string; amount: string };
      nativeOutput?: { account: string; amount: string };
      tokenInputs: { userAccount: string; tokenAccount: string; mint: string; rawTokenAmount: { tokenAmount: string; decimals: number } }[];
      tokenOutputs: { userAccount: string; tokenAccount: string; mint: string; rawTokenAmount: { tokenAmount: string; decimals: number } }[];
    };
  };
}

export interface ParsedSwap {
  signature: string;
  timestamp: number;
  source: string;
  solSpent: number;
  solReceived: number;
  tokenMint: string;
  tokenAmount: number;
  direction: "buy" | "sell";
  usdValue?: number;
}

export async function getWalletTransactions(
  address: string,
  apiKey: string
): Promise<HeliusTransaction[]> {
  const allTxs: HeliusTransaction[] = [];
  let lastSignature: string | undefined;

  for (let page = 0; page < 10; page++) {
    const params = new URLSearchParams({
      "api-key": apiKey,
    });
    if (lastSignature) params.set("before", lastSignature);

    const res = await fetch(
      `${HELIUS_BASE}/addresses/${address}/transactions?${params}`,
      { next: { revalidate: 300 } }
    );

    if (!res.ok) {
      if (res.status === 429) break;
      throw new Error(`Helius API error: ${res.status}`);
    }

    const txs: HeliusTransaction[] = await res.json();
    if (txs.length === 0) break;

    allTxs.push(...txs);
    lastSignature = txs[txs.length - 1].signature;

    if (txs.length < 100) break;
  }

  return allTxs;
}

const SOL_MINT = "So11111111111111111111111111111111111111112";

const STABLECOIN_MINTS = new Set([
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  "Es9vMFrzaCERmJfrF4H2FYBBnUDqyafMTpwdMiW68tB8",
]);

function isValueMint(mint: string): boolean {
  return mint === SOL_MINT || STABLECOIN_MINTS.has(mint);
}

function parseRawAmount(raw: { tokenAmount: string; decimals: number }): number {
  return Number(raw.tokenAmount) / Math.pow(10, raw.decimals);
}

export function parseSwaps(
  transactions: HeliusTransaction[],
  walletAddress: string
): ParsedSwap[] {
  const swaps: ParsedSwap[] = [];

  for (const tx of transactions) {
    if (tx.type !== "SWAP") {
      if (tx.tokenTransfers && tx.tokenTransfers.length > 0) {
        const solOut = (tx.nativeTransfers || [])
          .filter((n) => n.fromUserAccount === walletAddress)
          .reduce((sum, n) => sum + n.amount, 0) / 1e9;
        const solIn = (tx.nativeTransfers || [])
          .filter((n) => n.toUserAccount === walletAddress)
          .reduce((sum, n) => sum + n.amount, 0) / 1e9;

        const wsolOut = tx.tokenTransfers
          .filter((t) => t.mint === SOL_MINT && t.fromUserAccount === walletAddress)
          .reduce((sum, t) => sum + t.tokenAmount, 0);
        const wsolIn = tx.tokenTransfers
          .filter((t) => t.mint === SOL_MINT && t.toUserAccount === walletAddress)
          .reduce((sum, t) => sum + t.tokenAmount, 0);

        const stableOut = tx.tokenTransfers
          .filter((t) => STABLECOIN_MINTS.has(t.mint) && t.fromUserAccount === walletAddress)
          .reduce((sum, t) => sum + t.tokenAmount, 0);
        const stableIn = tx.tokenTransfers
          .filter((t) => STABLECOIN_MINTS.has(t.mint) && t.toUserAccount === walletAddress)
          .reduce((sum, t) => sum + t.tokenAmount, 0);

        const totalSolSpent = solOut + wsolOut;
        const totalSolReceived = solIn + wsolIn;

        for (const transfer of tx.tokenTransfers) {
          if (isValueMint(transfer.mint)) continue;
          if (transfer.tokenAmount <= 0) continue;

          if (transfer.toUserAccount === walletAddress) {
            swaps.push({
              signature: tx.signature,
              timestamp: tx.timestamp,
              source: tx.source || "transfer",
              solSpent: totalSolSpent,
              solReceived: 0,
              tokenMint: transfer.mint,
              tokenAmount: transfer.tokenAmount,
              direction: "buy",
              usdValue: totalSolSpent === 0 && stableOut > 0 ? stableOut : undefined,
            });
          } else if (transfer.fromUserAccount === walletAddress) {
            swaps.push({
              signature: tx.signature,
              timestamp: tx.timestamp,
              source: tx.source || "transfer",
              solSpent: 0,
              solReceived: totalSolReceived,
              tokenMint: transfer.mint,
              tokenAmount: transfer.tokenAmount,
              direction: "sell",
              usdValue: totalSolReceived === 0 && stableIn > 0 ? stableIn : undefined,
            });
          }
        }
      }
      continue;
    }

    const swap = tx.events?.swap;
    if (!swap) continue;

    const nativeInAmount = swap.nativeInput
      ? Number(swap.nativeInput.amount) / 1e9
      : 0;
    const nativeOutAmount = swap.nativeOutput
      ? Number(swap.nativeOutput.amount) / 1e9
      : 0;

    const solInput = swap.tokenInputs.find((t) => t.mint === SOL_MINT);
    const solOutput = swap.tokenOutputs.find((t) => t.mint === SOL_MINT);
    const solInputAmt = solInput ? parseRawAmount(solInput.rawTokenAmount) : 0;
    const solOutputAmt = solOutput ? parseRawAmount(solOutput.rawTokenAmount) : 0;

    const totalSolIn = nativeInAmount + solInputAmt;
    const totalSolOut = nativeOutAmount + solOutputAmt;

    const stableInput = swap.tokenInputs.find((t) => STABLECOIN_MINTS.has(t.mint));
    const stableOutput = swap.tokenOutputs.find((t) => STABLECOIN_MINTS.has(t.mint));
    const stableInAmt = stableInput ? parseRawAmount(stableInput.rawTokenAmount) : 0;
    const stableOutAmt = stableOutput ? parseRawAmount(stableOutput.rawTokenAmount) : 0;

    const tokenInputs = swap.tokenInputs.filter((t) => !isValueMint(t.mint));
    const tokenOutputs = swap.tokenOutputs.filter((t) => !isValueMint(t.mint));

    if (totalSolIn > 0 && tokenOutputs.length > 0) {
      for (const out of tokenOutputs) {
        swaps.push({
          signature: tx.signature,
          timestamp: tx.timestamp,
          source: tx.source,
          solSpent: totalSolIn,
          solReceived: 0,
          tokenMint: out.mint,
          tokenAmount: parseRawAmount(out.rawTokenAmount),
          direction: "buy",
        });
      }
    } else if (stableInAmt > 0 && tokenOutputs.length > 0) {
      for (const out of tokenOutputs) {
        swaps.push({
          signature: tx.signature,
          timestamp: tx.timestamp,
          source: tx.source,
          solSpent: 0,
          solReceived: 0,
          tokenMint: out.mint,
          tokenAmount: parseRawAmount(out.rawTokenAmount),
          direction: "buy",
          usdValue: stableInAmt,
        });
      }
    }

    if (totalSolOut > 0 && tokenInputs.length > 0) {
      for (const inp of tokenInputs) {
        swaps.push({
          signature: tx.signature,
          timestamp: tx.timestamp,
          source: tx.source,
          solSpent: 0,
          solReceived: totalSolOut,
          tokenMint: inp.mint,
          tokenAmount: parseRawAmount(inp.rawTokenAmount),
          direction: "sell",
        });
      }
    } else if (stableOutAmt > 0 && tokenInputs.length > 0) {
      for (const inp of tokenInputs) {
        swaps.push({
          signature: tx.signature,
          timestamp: tx.timestamp,
          source: tx.source,
          solSpent: 0,
          solReceived: 0,
          tokenMint: inp.mint,
          tokenAmount: parseRawAmount(inp.rawTokenAmount),
          direction: "sell",
          usdValue: stableOutAmt,
        });
      }
    }
  }

  return swaps;
}
