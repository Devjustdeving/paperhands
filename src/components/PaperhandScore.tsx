"use client";

import { getScoreColor, getScoreLabel } from "@/lib/utils";

interface PaperhandScoreProps {
  score: number;
}

export function PaperhandScore({ score }: PaperhandScoreProps) {
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (score / 100) * circumference;
  const colorClass = getScoreColor(score);
  const label = getScoreLabel(score);

  const strokeColor =
    score >= 80
      ? "#f87171"
      : score >= 60
      ? "#fb923c"
      : score >= 40
      ? "#facc15"
      : "#4ade80";

  return (
    <div className="flex items-center gap-6 p-6 bg-card border border-border rounded-2xl">
      <div className="relative w-28 h-28 flex-shrink-0">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50" cy="50" r="45"
            fill="none"
            stroke="currentColor"
            className="text-border"
            strokeWidth="8"
          />
          <circle
            cx="50" cy="50" r="45"
            fill="none"
            stroke={strokeColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="score-ring"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-2xl font-bold ${colorClass}`}>{score}</span>
        </div>
      </div>
      <div>
        <p className="text-muted text-sm">Paperhand Score</p>
        <p className={`text-xl font-bold ${colorClass}`}>{label}</p>
        <p className="text-muted text-xs mt-1">
          {score >= 60
            ? "You sell way too early. Hold your bags longer."
            : "Not bad, but there's still room for diamond hands."}
        </p>
      </div>
    </div>
  );
}
