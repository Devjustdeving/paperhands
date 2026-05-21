"use client";

import { useParams } from "next/navigation";
import { getMockTokenStats } from "@/lib/mock-data";
import { formatUSD, formatSOL, formatNumber } from "@/lib/utils";
import Link from "next/link";

export default function TokenPage() {
  const { address } = useParams<{ address: string }>();
  const stats = getMockTokenStats(address);

  const medalIcons = ["🥇", "🥈", "🥉"];

  return (
    <div className="py-8 space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <span className="text-4xl">{stats.token.icon}</span>
        <div>
          <h1 className="text-2xl font-bold">{stats.token.name}</h1>
          <p className="text-muted font-mono text-sm">{stats.token.symbol}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 bg-card border border-border rounded-xl">
          <p className="text-xs text-muted">Total Paperhanded</p>
          <p className="text-lg font-bold text-red-400">{formatNumber(stats.totalPaperhanded)} wallets</p>
        </div>
        <div className="p-4 bg-card border border-border rounded-xl">
          <p className="text-xs text-muted">Value Paperhanded</p>
          <p className="text-lg font-bold text-red-400">{formatUSD(stats.totalPaperhandedUSD)}</p>
        </div>
        <div className="p-4 bg-card border border-border rounded-xl">
          <p className="text-xs text-muted">ATH Marketcap</p>
          <p className="text-lg font-bold">{formatUSD(stats.athMarketcap)}</p>
        </div>
        <div className="p-4 bg-card border border-border rounded-xl">
          <p className="text-xs text-muted">Current Marketcap</p>
          <p className="text-lg font-bold">{formatUSD(stats.currentMarketcap)}</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-bold">Top Paperhanders of {stats.token.symbol}</h2>
          <p className="text-muted text-sm">Wallets that fumbled the hardest on this token</p>
        </div>

        <div className="divide-y divide-border">
          <div className="grid grid-cols-[80px_1fr_1fr] px-6 py-3 text-xs text-muted font-medium uppercase tracking-wider">
            <span>Rank</span>
            <span>Wallet Address</span>
            <span className="text-right">Paperhanded Value</span>
          </div>

          {stats.topPaperhanders.map((entry) => (
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
      </div>
    </div>
  );
}
