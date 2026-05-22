"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { formatUSD, truncateAddress } from "@/lib/utils";
import { AnalysisTab, WalletAnalysis } from "@/lib/types";
import { TokenCarousel } from "@/components/TokenCarousel";
import { TradeDetail } from "@/components/TradeDetail";
import { PaperhandScore } from "@/components/PaperhandScore";
import { BadgeGrid } from "@/components/BadgeGrid";
import { AIRoast } from "@/components/AIRoast";
import { WhatIfSlider } from "@/components/WhatIfSlider";
import { AlertsPanel } from "@/components/AlertsPanel";
import { WeeklyDigest } from "@/components/WeeklyDigest";
import Link from "next/link";

const TABS: { id: AnalysisTab; label: string }[] = [
  { id: "paperhand", label: "Paperhand" },
  { id: "roundtrip", label: "Roundtrip" },
  { id: "gained", label: "Gained" },
];

function WalletContent() {
  const { address } = useParams<{ address: string }>();
  const searchParams = useSearchParams();
  const chain = searchParams.get("chain") || "solana";
  const [tab, setTab] = useState<AnalysisTab>("paperhand");
  const [activeIndex, setActiveIndex] = useState(0);
  const [analysis, setAnalysis] = useState<WalletAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(`/api/wallet/${address}?chain=${chain}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load wallet data");
        return res.json();
      })
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setAnalysis(data);
        }
      })
      .catch(() => setError("Failed to analyze wallet. Please try again."))
      .finally(() => setLoading(false));
  }, [address, chain]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
        <p className="text-muted text-sm">Analyzing wallet transactions...</p>
        <p className="text-muted text-xs">This may take a few seconds</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <span className="text-4xl">😕</span>
        <p className="text-foreground font-semibold">{error}</p>
        <Link href="/" className="text-accent text-sm hover:underline">
          ← Try another wallet
        </Link>
      </div>
    );
  }

  if (!analysis) return null;

  const trades =
    tab === "paperhand"
      ? analysis.paperhanded
      : tab === "roundtrip"
      ? analysis.roundtripped
      : analysis.gained;

  const activeTrade = trades[activeIndex];
  const allSoldTokens = [...analysis.paperhanded, ...analysis.gained];

  return (
    <div className="py-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-muted text-sm">Wallet Address</p>
            <span className="text-xs px-2 py-0.5 bg-accent/20 text-accent rounded-full">
              {chain}
            </span>
          </div>
          <p className="font-mono text-lg">{truncateAddress(address, 8)}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/compare?a=${address}`}
            className="px-4 py-2 bg-card border border-border rounded-lg text-sm text-muted hover:text-foreground transition-colors"
          >
            ⚔️ Compare
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
          <p className="text-muted text-xs">Total Fumbled</p>
          <p className="text-2xl font-bold text-red-400">{formatUSD(analysis.totalFumbledUSD)}</p>
        </div>
        <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
          <p className="text-muted text-xs">Total Gained</p>
          <p className="text-2xl font-bold text-emerald-400">{formatUSD(analysis.totalGainedUSD)}</p>
        </div>
      </div>

      <PaperhandScore score={analysis.paperhandScore} />

      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex rounded-xl bg-background border border-border p-1 mb-6">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTab(t.id);
                setActiveIndex(0);
              }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                tab === t.id
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {t.label}
              <span className="ml-1 text-xs text-muted">
                ({t.id === "paperhand"
                  ? analysis.paperhanded.length
                  : t.id === "roundtrip"
                  ? analysis.roundtripped.length
                  : analysis.gained.length})
              </span>
            </button>
          ))}
        </div>

        {trades.length > 0 ? (
          <>
            <TokenCarousel
              tokens={trades}
              activeIndex={activeIndex}
              onSelect={setActiveIndex}
            />
            <div className="mt-6">
              <TradeDetail trade={activeTrade} tab={tab} />
            </div>
          </>
        ) : (
          <p className="text-center text-muted py-8">
            No trades found for this category.
          </p>
        )}
      </div>

      {tab === "paperhand" && activeTrade && (
        <WhatIfSlider trade={activeTrade} />
      )}

      <AIRoast analysis={analysis} />

      <WeeklyDigest analysis={analysis} />

      <AlertsPanel walletAddress={address} soldTokens={allSoldTokens} />

      <BadgeGrid badges={analysis.badges} />
    </div>
  );
}

export default function WalletPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="w-12 h-12 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
          <p className="text-muted text-sm">Loading...</p>
        </div>
      }
    >
      <WalletContent />
    </Suspense>
  );
}
