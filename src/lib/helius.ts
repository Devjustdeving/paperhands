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
}

export async function getWalletTransactions(
  address: string,
  apiKey: string
): Promise<HeliusTransaction[]> {
  const allTxs: HeliusTransaction[] = [];
  let lastSignature: string | undefined;

  for (let page = 0; page < 5; page++) {
    const params = new URLSearchParams({
      "api-key": apiKey,
      type: "SWAP",
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

export function parseSwaps(
  transactions: HeliusTransaction[],
  walletAddress: string
): ParsedSwap[] {
  const swaps: ParsedSwap[] = [];

  for (const tx of transactions) {
    const swap = tx.events?.swap;
    if (!swap) continue;

    const nativeInAmount = swap.nativeInput
      ? Number(swap.nativeInput.amount) / 1e9
      : 0;
    const nativeOutAmount = swap.nativeOutput
      ? Number(swap.nativeOutput.amount) / 1e9
      : 0;

    const tokenInputs = swap.tokenInputs.filter((t) => t.mint !== SOL_MINT);
    const tokenOutputs = swap.tokenOutputs.filter((t) => t.mint !== SOL_MINT);

    if (nativeInAmount > 0 && tokenOutputs.length > 0) {
      for (const out of tokenOutputs) {
        const amount =
          Number(out.rawTokenAmount.tokenAmount) /
          Math.pow(10, out.rawTokenAmount.decimals);
        swaps.push({
          signature: tx.signature,
          timestamp: tx.timestamp,
          source: tx.source,
          solSpent: nativeInAmount,
          solReceived: 0,
          tokenMint: out.mint,
          tokenAmount: amount,
          direction: "buy",
        });
      }
    }

    if (nativeOutAmount > 0 && tokenInputs.length > 0) {
      for (const inp of tokenInputs) {
        const amount =
          Number(inp.rawTokenAmount.tokenAmount) /
          Math.pow(10, inp.rawTokenAmount.decimals);
        swaps.push({
          signature: tx.signature,
          timestamp: tx.timestamp,
          source: tx.source,
          solSpent: 0,
          solReceived: nativeOutAmount,
          tokenMint: inp.mint,
          tokenAmount: amount,
          direction: "sell",
        });
      }
    }

    if (
      nativeInAmount === 0 &&
      nativeOutAmount === 0 &&
      tokenInputs.length > 0 &&
      tokenOutputs.length > 0
    ) {
      const solInput = swap.tokenInputs.find((t) => t.mint === SOL_MINT);
      const solOutput = swap.tokenOutputs.find((t) => t.mint === SOL_MINT);

      if (solInput && tokenOutputs.length > 0) {
        const solAmt =
          Number(solInput.rawTokenAmount.tokenAmount) /
          Math.pow(10, solInput.rawTokenAmount.decimals);
        for (const out of tokenOutputs) {
          const amount =
            Number(out.rawTokenAmount.tokenAmount) /
            Math.pow(10, out.rawTokenAmount.decimals);
          swaps.push({
            signature: tx.signature,
            timestamp: tx.timestamp,
            source: tx.source,
            solSpent: solAmt,
            solReceived: 0,
            tokenMint: out.mint,
            tokenAmount: amount,
            direction: "buy",
          });
        }
      }

      if (solOutput && tokenInputs.length > 0) {
        const solAmt =
          Number(solOutput.rawTokenAmount.tokenAmount) /
          Math.pow(10, solOutput.rawTokenAmount.decimals);
        for (const inp of tokenInputs) {
          const amount =
            Number(inp.rawTokenAmount.tokenAmount) /
            Math.pow(10, inp.rawTokenAmount.decimals);
          swaps.push({
            signature: tx.signature,
            timestamp: tx.timestamp,
            source: tx.source,
            solSpent: 0,
            solReceived: solAmt,
            tokenMint: inp.mint,
            tokenAmount: amount,
            direction: "sell",
          });
        }
      }
    }
  }

  return swaps;
}
