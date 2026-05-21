"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { getMockWalletAnalysis } from "@/lib/mock-data";
import { formatUSD, truncateAddress } from "@/lib/utils";
import { AnalysisTab } from "@/lib/types";
import { TokenCarousel } from "@/components/TokenCarousel";
import { TradeDetail } from "@/components/TradeDetail";
import { PaperhandScore } from "@/components/PaperhandScore";
import { BadgeGrid } from "@/components/BadgeGrid";
import { AIRoast } from "@/components/AIRoast";
import { WhatIfSlider } from "@/components/WhatIfSlider";
import Link from "next/link";

const TABS: { id: AnalysisTab; label: string }[] = [
  { id: "paperhand", label: "Paperhand" },
  { id: "roundtrip", label: "Roundtrip" },
  { id: "gained", label: "Gained" },
];

export default function WalletPage() {
  const { address } = useParams<{ address: string }>();
  const [tab, setTab] = useState<AnalysisTab>("paperhand");
  const [activeIndex, setActiveIndex] = useState(0);

  const analysis = getMockWalletAnalysis(address);

  const trades =
    tab === "paperhand"
      ? analysis.paperhanded
      : tab === "roundtrip"
      ? analysis.roundtripped
      : analysis.gained;

  const activeTrade = trades[activeIndex];

  return (
    <div className="py-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted text-sm">Wallet Address</p>
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
              onClick={() => { setTab(t.id); setActiveIndex(0); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                tab === t.id
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {trades.length > 0 ? (
          <>
            <TokenCarousel tokens={trades} activeIndex={activeIndex} onSelect={setActiveIndex} />
            <div className="mt-6">
              <TradeDetail trade={activeTrade} tab={tab} />
            </div>
          </>
        ) : (
          <p className="text-center text-muted py-8">No trades found for this category.</p>
        )}
      </div>

      {tab === "paperhand" && activeTrade && (
        <WhatIfSlider trade={activeTrade} />
      )}

      <AIRoast analysis={analysis} />

      <BadgeGrid badges={analysis.badges} />
    </div>
  );
}
