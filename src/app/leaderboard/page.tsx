"use client";

import { useState, useEffect } from "react";
import { formatSOL, formatUSD, truncateAddress } from "@/lib/utils";
import Link from "next/link";

function SolLogo() {
  return (
    <img
      src="https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png"
      alt="SOL"
      className="w-4 h-4 inline-block rounded-full"
    />
  );
}

interface LeaderboardEntry {
  rank: number;
  walletAddress: string;
  paperhandedValueSOL: number;
  paperhandedValueUSD: number;
  paperhandScore?: number;
  chain?: string;
  tradeCount?: number;
}

const PAGE_SIZE = 10;

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/leaderboard?limit=${PAGE_SIZE}&offset=${page * PAGE_SIZE}`)
      .then((r) => r.json())
      .then((data) => {
        setEntries(data.entries || []);
        setTotal(data.total || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const medalIcons = ["🥇", "🥈", "🥉"];

  return (
    <div className="py-8 space-y-6 animate-fade-in">
      <div className="p-6 bg-gradient-to-r from-green-500/20 via-green-500/10 to-transparent border border-green-500/20 rounded-2xl flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Stop Being a Paperhand Jeeter!</h2>
          <p className="text-muted text-sm mt-1">
            Secure those gains and watch your memes 100x.
          </p>
        </div>
        <Link
          href="/"
          className="px-5 py-2.5 bg-foreground text-background rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
        >
          Check Wallet
        </Link>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold">📊 Top Giga Jeeters</h2>
          <p className="text-muted text-sm mt-1">Ranked by total paperhanded value</p>
        </div>

        {loading ? (
          <div className="p-12 text-center text-muted">Loading leaderboard...</div>
        ) : entries.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-muted text-lg">No data yet</p>
            <p className="text-muted text-sm mt-2">
              Search some wallets first to populate the leaderboard
            </p>
            <Link href="/" className="inline-block mt-4 px-5 py-2.5 bg-accent text-background rounded-lg font-medium text-sm hover:bg-accent-dim transition-colors">
              Search a Wallet
            </Link>
          </div>
        ) : (
          <>
            <div className="divide-y divide-border">
              <div className="grid grid-cols-[60px_1fr_1fr] md:grid-cols-[60px_1fr_100px_1fr] px-6 py-3 text-xs text-muted font-medium uppercase tracking-wider">
                <span>Rank</span>
                <span>Wallet</span>
                <span className="hidden md:block">Score</span>
                <span className="text-right">Paperhanded Value</span>
              </div>

              {entries.map((entry) => (
                <Link
                  key={entry.rank}
                  href={`/wallet/${entry.walletAddress}${entry.chain ? `?chain=${entry.chain}` : ""}`}
                  className="grid grid-cols-[60px_1fr_1fr] md:grid-cols-[60px_1fr_100px_1fr] px-6 py-4 hover:bg-card-hover transition-colors items-center"
                >
                  <span className="text-lg">
                    {entry.rank <= 3 ? medalIcons[entry.rank - 1] : entry.rank}
                  </span>
                  <span className="font-mono text-sm truncate pr-4">
                    {truncateAddress(entry.walletAddress, 6)}
                  </span>
                  <span className="hidden md:block">
                    {entry.paperhandScore !== undefined && (
                      <span className={`text-sm font-semibold ${
                        entry.paperhandScore >= 80 ? "text-red-400" :
                        entry.paperhandScore >= 60 ? "text-orange-400" :
                        entry.paperhandScore >= 40 ? "text-yellow-400" :
                        "text-green-400"
                      }`}>
                        {entry.paperhandScore}/100
                      </span>
                    )}
                  </span>
                  <span className="text-right">
                    <span className="font-semibold inline-flex items-center gap-1 justify-end">
                      {formatSOL(entry.paperhandedValueSOL)} <SolLogo />
                    </span>
                    <span className="text-muted ml-2 text-sm">
                      ({formatUSD(entry.paperhandedValueUSD)})
                    </span>
                  </span>
                </Link>
              ))}
            </div>

            <div className="p-4 border-t border-border flex items-center justify-between">
              <p className="text-sm text-muted">
                Showing {page * PAGE_SIZE + 1}-{Math.min((page + 1) * PAGE_SIZE, total)} of {total}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="px-4 py-2 bg-background border border-border rounded-lg text-sm disabled:opacity-30 hover:border-muted transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                  className="px-4 py-2 bg-background border border-border rounded-lg text-sm disabled:opacity-30 hover:border-muted transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
