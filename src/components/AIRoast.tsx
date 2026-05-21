"use client";

import { useState } from "react";
import { WalletAnalysis } from "@/lib/types";
import { generateAIRoast } from "@/lib/mock-data";

interface AIRoastProps {
  analysis: WalletAnalysis;
}

export function AIRoast({ analysis }: AIRoastProps) {
  const [roast, setRoast] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRoast = () => {
    setLoading(true);
    setTimeout(() => {
      setRoast(generateAIRoast(analysis));
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="p-6 bg-card border border-border rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">🔥 AI Roast Mode</h3>
        <button
          onClick={handleRoast}
          disabled={loading}
          className="px-4 py-2 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-lg text-sm font-medium hover:bg-orange-500/30 transition-all disabled:opacity-50"
        >
          {loading ? "Roasting..." : roast ? "Roast Again" : "Roast This Wallet"}
        </button>
      </div>
      {loading && (
        <div className="flex items-center gap-2 text-muted text-sm">
          <span className="animate-spin">🔥</span>
          Analyzing trading history and preparing your roast...
        </div>
      )}
      {roast && !loading && (
        <div className="animate-fade-in">
          <div className="p-4 bg-orange-500/5 border border-orange-500/20 rounded-xl">
            <p className="text-sm leading-relaxed">{roast}</p>
          </div>
          <button className="mt-3 text-xs text-muted hover:text-foreground transition-colors">
            🔗 Share this roast
          </button>
        </div>
      )}
    </div>
  );
}
