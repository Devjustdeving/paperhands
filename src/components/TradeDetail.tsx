"use client";

import { TokenTrade, AnalysisTab } from "@/lib/types";
import { formatUSD, formatSOL, formatNumber, formatHeldTime } from "@/lib/utils";
import { useState, ReactNode } from "react";

function SolLogo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <img
      src="https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png"
      alt="SOL"
      className={`${className} inline-block rounded-full`}
    />
  );
}

function SolAmount({ amount, className }: { amount: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 ${className || ""}`}>
      {formatSOL(amount)} <SolLogo className="w-4 h-4" />
    </span>
  );
}

interface TradeDetailProps {
  trade: TokenTrade;
  tab: AnalysisTab;
}

export function TradeDetail({ trade, tab }: TradeDetailProps) {
  const [copied, setCopied] = useState(false);

  const copyCA = () => {
    navigator.clipboard.writeText(trade.token.contractAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const headingText = tab === "paperhand"
    ? "You Paperhanded"
    : tab === "roundtrip"
    ? "Total Roundtripped"
    : "You Gained";

  const headingColor = tab === "paperhand"
    ? "text-accent"
    : tab === "roundtrip"
    ? "text-yellow-400"
    : "text-emerald-400";

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <p className="text-muted text-sm">{headingText}</p>
        <button
          onClick={copyCA}
          className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors font-mono"
        >
          CA: {trade.token.contractAddress}
          <span className="text-accent">{copied ? "✓" : "📋"}</span>
        </button>
      </div>

      <p className={`text-3xl md:text-4xl font-bold mb-6 ${headingColor}`}>
        {formatNumber(trade.tokenAmount)} {trade.token.symbol}
        <span className="text-lg md:text-xl text-muted ml-2">
          ({formatUSD(trade.totalValueUSD)})
        </span>
      </p>

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Bought with"
          value={<SolAmount amount={trade.boughtWithSOL} />}
          sub={formatUSD(trade.boughtWithUSD)}
        />
        {tab === "paperhand" || tab === "gained" ? (
          <StatCard
            label="Sold for"
            value={<SolAmount amount={trade.soldForSOL} />}
            sub={formatUSD(trade.soldForUSD)}
          />
        ) : (
          <StatCard
            label="ATH Marketcap"
            value={formatUSD(trade.athMarketcap || 0)}
          />
        )}
        {tab === "paperhand" ? (
          <StatCard
            label="Fumbled"
            value={<SolAmount amount={trade.fumbledSOL} />}
            sub={formatUSD(trade.fumbledUSD)}
            highlight
          />
        ) : tab === "roundtrip" ? (
          <StatCard
            label="Roundtripped"
            value={<SolAmount amount={trade.roundtrippedSOL || 0} />}
            sub={formatUSD(trade.roundtrippedUSD || 0)}
          />
        ) : (
          <StatCard
            label="Profit"
            value={<SolAmount amount={trade.soldForSOL - trade.boughtWithSOL} />}
            sub={formatUSD(trade.soldForUSD - trade.boughtWithUSD)}
            positive
          />
        )}
        {tab === "roundtrip" ? (
          <StatCard label="Now worth" value={formatUSD(trade.nowWorth || 0)} />
        ) : (
          <StatCard label="Held for" value={formatHeldTime(trade.heldForHours)} />
        )}
      </div>

      <div className="flex gap-3 mt-6">
        <button className="flex-1 py-3 rounded-xl bg-card border border-border text-sm font-medium text-muted hover:text-foreground hover:border-muted transition-all flex items-center justify-center gap-2">
          📊 Chart
        </button>
        <button className="flex-1 py-3 rounded-xl bg-accent/10 border border-accent/30 text-sm font-medium text-accent hover:bg-accent/20 transition-all flex items-center justify-center gap-2">
          🔗 Share
        </button>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  highlight,
  positive,
}: {
  label: string;
  value: ReactNode;
  sub?: string;
  highlight?: boolean;
  positive?: boolean;
}) {
  return (
    <div
      className={`p-4 rounded-xl border transition-colors ${
        highlight
          ? "bg-red-500/5 border-red-500/20"
          : positive
          ? "bg-emerald-500/5 border-emerald-500/20"
          : "bg-card border-border"
      }`}
    >
      <p className="text-muted text-xs mb-1">{label}</p>
      <p className={`font-bold text-lg ${highlight ? "text-red-400" : positive ? "text-emerald-400" : ""}`}>
        {value}
      </p>
      {sub && <p className="text-muted text-xs">{sub}</p>}
    </div>
  );
}
