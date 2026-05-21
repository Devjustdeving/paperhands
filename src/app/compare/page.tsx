"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { getMockWalletAnalysis } from "@/lib/mock-data";
import { formatUSD, truncateAddress } from "@/lib/utils";
import { PaperhandScore } from "@/components/PaperhandScore";
import { Suspense } from "react";

function CompareContent() {
  const searchParams = useSearchParams();
  const prefillA = searchParams.get("a") || "";

  const [walletA, setWalletA] = useState(prefillA);
  const [walletB, setWalletB] = useState("");
  const [comparing, setComparing] = useState(false);
  const [results, setResults] = useState<{ a: ReturnType<typeof getMockWalletAnalysis>; b: ReturnType<typeof getMockWalletAnalysis> } | null>(null);

  const handleCompare = () => {
    if (walletA.trim() && walletB.trim()) {
      setComparing(true);
      setTimeout(() => {
        const a = getMockWalletAnalysis(walletA.trim());
        const b = { ...getMockWalletAnalysis(walletB.trim()), paperhandScore: 45, totalFumbledUSD: 12_340_000, totalGainedUSD: 890_000 };
        setResults({ a, b });
        setComparing(false);
      }, 1000);
    }
  };

  return (
    <div className="py-8 space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">⚔️ Head-to-Head Compare</h1>
        <p className="text-muted mt-2">Who paperhanded harder?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-end">
        <div>
          <label className="text-sm text-muted block mb-2">Wallet A</label>
          <input
            type="text"
            value={walletA}
            onChange={(e) => setWalletA(e.target.value)}
            placeholder="Enter wallet address..."
            className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:border-accent/50 font-mono text-sm"
          />
        </div>
        <div className="flex items-center justify-center">
          <span className="text-2xl font-bold text-accent">VS</span>
        </div>
        <div>
          <label className="text-sm text-muted block mb-2">Wallet B</label>
          <input
            type="text"
            value={walletB}
            onChange={(e) => setWalletB(e.target.value)}
            placeholder="Enter wallet address..."
            className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:border-accent/50 font-mono text-sm"
          />
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={handleCompare}
          disabled={!walletA.trim() || !walletB.trim() || comparing}
          className="px-8 py-3 bg-accent text-background font-semibold rounded-xl hover:bg-accent-dim transition-colors disabled:opacity-50"
        >
          {comparing ? "Analyzing..." : "Compare Wallets"}
        </button>
      </div>

      {results && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-card border border-border rounded-xl">
              <p className="text-xs text-muted mb-1">Wallet A</p>
              <p className="font-mono text-sm">{truncateAddress(walletA, 6)}</p>
            </div>
            <div className="text-center p-4 bg-card border border-border rounded-xl">
              <p className="text-xs text-muted mb-1">Wallet B</p>
              <p className="font-mono text-sm">{truncateAddress(walletB, 6)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <PaperhandScore score={results.a.paperhandScore} />
            <PaperhandScore score={results.b.paperhandScore} />
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="grid grid-cols-[1fr_120px_1fr] text-center border-b border-border">
              <div className="p-4 text-sm font-medium text-muted">Wallet A</div>
              <div className="p-4 text-sm font-medium text-muted border-x border-border">Metric</div>
              <div className="p-4 text-sm font-medium text-muted">Wallet B</div>
            </div>

            <CompareRow
              label="Fumbled"
              valueA={formatUSD(results.a.totalFumbledUSD)}
              valueB={formatUSD(results.b.totalFumbledUSD)}
              aWorse={results.a.totalFumbledUSD > results.b.totalFumbledUSD}
            />
            <CompareRow
              label="Gained"
              valueA={formatUSD(results.a.totalGainedUSD)}
              valueB={formatUSD(results.b.totalGainedUSD)}
              aWorse={results.a.totalGainedUSD < results.b.totalGainedUSD}
            />
            <CompareRow
              label="Jeet Score"
              valueA={`${results.a.paperhandScore}/100`}
              valueB={`${results.b.paperhandScore}/100`}
              aWorse={results.a.paperhandScore > results.b.paperhandScore}
            />
            <CompareRow
              label="Tokens Jeeted"
              valueA={`${results.a.paperhanded.length}`}
              valueB={`${results.b.paperhanded.length}`}
              aWorse={results.a.paperhanded.length > results.b.paperhanded.length}
            />
            <CompareRow
              label="Badges"
              valueA={`${results.a.badges.filter((b) => b.earned).length}/${results.a.badges.length}`}
              valueB={`${results.b.badges.filter((b) => b.earned).length}/${results.b.badges.length}`}
              aWorse={
                results.a.badges.filter((b) => b.earned).length <
                results.b.badges.filter((b) => b.earned).length
              }
            />
          </div>

          <div className="text-center p-6 bg-accent/5 border border-accent/20 rounded-2xl">
            <p className="text-lg font-bold">
              {results.a.totalFumbledUSD > results.b.totalFumbledUSD
                ? `Wallet A fumbled ${formatUSD(results.a.totalFumbledUSD - results.b.totalFumbledUSD)} more!`
                : `Wallet B fumbled ${formatUSD(results.b.totalFumbledUSD - results.a.totalFumbledUSD)} more!`}
            </p>
            <p className="text-muted text-sm mt-1">
              {results.a.totalFumbledUSD > results.b.totalFumbledUSD
                ? "Wallet A is the bigger jeeter. Massive L."
                : "Wallet B is the bigger jeeter. Massive L."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function CompareRow({
  label,
  valueA,
  valueB,
  aWorse,
}: {
  label: string;
  valueA: string;
  valueB: string;
  aWorse: boolean;
}) {
  return (
    <div className="grid grid-cols-[1fr_120px_1fr] text-center border-b border-border last:border-0">
      <div className={`p-4 text-sm font-semibold ${aWorse ? "text-red-400" : "text-emerald-400"}`}>
        {valueA}
      </div>
      <div className="p-4 text-xs text-muted border-x border-border flex items-center justify-center">
        {label}
      </div>
      <div className={`p-4 text-sm font-semibold ${!aWorse ? "text-red-400" : "text-emerald-400"}`}>
        {valueB}
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="py-8 text-center text-muted">Loading...</div>}>
      <CompareContent />
    </Suspense>
  );
}
