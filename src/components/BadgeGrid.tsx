"use client";

import { Badge } from "@/lib/types";

interface BadgeGridProps {
  badges: Badge[];
}

export function BadgeGrid({ badges }: BadgeGridProps) {
  return (
    <div className="p-6 bg-card border border-border rounded-2xl">
      <h3 className="text-lg font-bold mb-4">Achievements</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className={`p-3 rounded-xl border text-center transition-all ${
              badge.earned
                ? "bg-accent/5 border-accent/20 hover:border-accent/40"
                : "bg-card border-border opacity-40 grayscale"
            }`}
          >
            <span className="text-2xl block mb-1">{badge.icon}</span>
            <p className="text-xs font-semibold">{badge.name}</p>
            <p className="text-[10px] text-muted mt-0.5">{badge.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
