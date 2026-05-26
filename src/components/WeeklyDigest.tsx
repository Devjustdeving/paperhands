"use client";

import { useRef, useState } from "react";
import { WalletAnalysis } from "@/lib/types";
import { formatUSD, truncateAddress, getScoreColor, getScoreLabel } from "@/lib/utils";

interface WeeklyDigestProps {
  analysis: WalletAnalysis;
}

export function WeeklyDigest({ analysis }: WeeklyDigestProps) {
  const [generated, setGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerated(true);
      setGenerating(false);
    }, 1000);
  };

  const handleShare = () => {
    const text = `My Weekly Paperhand Report 📊\n\n` +
      `Paperhand Score: ${analysis.paperhandScore}/100 (${getScoreLabel(analysis.paperhandScore)})\n` +
      `Total Fumbled: ${formatUSD(analysis.totalFumbledUSD)}\n` +
      `Total Gained: ${formatUSD(analysis.totalGainedUSD)}\n` +
      `Tokens Jeeted: ${analysis.paperhanded.length}\n` +
      `Biggest Fumble: ${analysis.paperhanded[0]?.token.name || "N/A"} - ${formatUSD(analysis.paperhanded[0]?.fumbledUSD || 0)}\n\n` +
      `Check yours at paperhands.club`;

    if (navigator.share) {
      navigator.share({ title: "My Paperhand Report", text });
    } else {
      navigator.clipboard.writeText(text);
    }
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(
      `My Weekly Paperhand Report 📊\n\n` +
      `Score: ${analysis.paperhandScore}/100 (${getScoreLabel(analysis.paperhandScore)})\n` +
      `Fumbled: ${formatUSD(analysis.totalFumbledUSD)} 💀\n` +
      `Biggest miss: ${analysis.paperhanded[0]?.token.name || "N/A"}\n\n` +
      `Check yours 👇`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
  };

  const scoreColor = getScoreColor(analysis.paperhandScore);
  const topFumble = analysis.paperhanded[0];

  return (
    <div className="p-6 bg-card border border-border rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold">📰 Weekly Digest</h3>
          <p className="text-muted text-sm">
            Generate a shareable weekly paperhand report card
          </p>
        </div>
        {!generated && (
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-sm font-medium hover:bg-blue-500/30 transition-all disabled:opacity-50"
          >
            {generating ? "Generating..." : "Generate Report"}
          </button>
        )}
      </div>

      {generated && (
        <div className="animate-fade-in space-y-4">
          <div
            ref={cardRef}
            className="p-6 bg-gradient-to-br from-[#0f0f1a] via-[#111120] to-[#0a0a15] rounded-2xl border border-accent/20 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-accent text-xs font-medium uppercase tracking-widest">
                  Weekly Paperhand Report
                </p>
                <p className="font-mono text-sm text-muted mt-1">
                  {truncateAddress(analysis.address, 6)}
                </p>
              </div>
              <div className="text-right">
                <p className={`text-3xl font-bold ${scoreColor}`}>
                  {analysis.paperhandScore}
                </p>
                <p className="text-xs text-muted">/ 100</p>
              </div>
            </div>

            <div className="h-px bg-border" />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted">Total Fumbled</p>
                <p className="text-lg font-bold text-red-400">
                  {formatUSD(analysis.totalFumbledUSD)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted">Total Gained</p>
                <p className="text-lg font-bold text-emerald-400">
                  {formatUSD(analysis.totalGainedUSD)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted">Tokens Jeeted</p>
                <p className="text-lg font-bold">{analysis.paperhanded.length}</p>
              </div>
              <div>
                <p className="text-xs text-muted">Badges Earned</p>
                <p className="text-lg font-bold">
                  {analysis.badges.filter((b) => b.earned).length}/{analysis.badges.length}
                </p>
              </div>
            </div>

            {topFumble && (
              <>
                <div className="h-px bg-border" />
                <div>
                  <p className="text-xs text-muted mb-1">Biggest Fumble</p>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{topFumble.token.name}</span>
                    <span className="text-red-400 font-bold">
                      {formatUSD(topFumble.fumbledUSD)}
                    </span>
                  </div>
                </div>
              </>
            )}

            <div className="text-center pt-2">
              <p className="text-[10px] text-muted">
                paperhands.club
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleShareTwitter}
              className="flex-1 py-3 rounded-xl bg-[#1d9bf0]/10 border border-[#1d9bf0]/30 text-sm font-medium text-[#1d9bf0] hover:bg-[#1d9bf0]/20 transition-all flex items-center justify-center gap-2"
            >
              Share on 𝕏
            </button>
            <button
              onClick={handleShare}
              className="flex-1 py-3 rounded-xl bg-card border border-border text-sm font-medium text-muted hover:text-foreground transition-all flex items-center justify-center gap-2"
            >
              📋 Copy to Clipboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
