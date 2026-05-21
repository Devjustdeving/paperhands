"use client";

import { useState } from "react";
import { getMockLeaderboard } from "@/lib/mock-data";
import { formatSOL, formatUSD } from "@/lib/utils";
import Link from "next/link";

const PAGE_SIZE = 10;

export default function LeaderboardPage() {
  const allEntries = getMockLeaderboard();
  const [page, setPage] = useState(0);

  const entries = allEntries.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(allEntries.length / PAGE_SIZE);

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
        <button className="px-5 py-2.5 bg-foreground text-background rounded-lg font-medium text-sm hover:opacity-90 transition-opacity">
          Lock In
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold">📊 Top Giga Jeeters</h2>
        </div>

        <div className="divide-y divide-border">
          <div className="grid grid-cols-[80px_1fr_1fr] px-6 py-3 text-xs text-muted font-medium uppercase tracking-wider">
            <span>Rank</span>
            <span>Wallet Address</span>
            <span className="text-right">Paperhanded Value</span>
          </div>

          {entries.map((entry) => (
            <Link
              key={entry.rank}
              href={`/wallet/${entry.walletAddress}`}
              className="grid grid-cols-[80px_1fr_1fr] px-6 py-4 hover:bg-card-hover transition-colors items-center"
            >
              <span className="text-lg">
                {entry.rank <= 3 ? medalIcons[entry.rank - 1] : entry.rank}
              </span>
              <span className="font-mono text-sm">{entry.walletAddress}</span>
              <span className="text-right">
                <span className="font-semibold">{formatSOL(entry.paperhandedValueSOL)} ◎</span>
                <span className="text-muted ml-2 text-sm">({formatUSD(entry.paperhandedValueUSD)})</span>
              </span>
            </Link>
          ))}
        </div>

        <div className="p-4 border-t border-border flex items-center justify-between">
          <p className="text-sm text-muted">
            Showing {page * PAGE_SIZE + 1}-{Math.min((page + 1) * PAGE_SIZE, allEntries.length)} of {allEntries.length}
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
      </div>
    </div>
  );
}
