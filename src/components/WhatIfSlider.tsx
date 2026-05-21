"use client";

import { useState } from "react";
import { TokenTrade } from "@/lib/types";
import { formatUSD } from "@/lib/utils";

interface WhatIfSliderProps {
  trade: TokenTrade;
}

export function WhatIfSlider({ trade }: WhatIfSliderProps) {
  const maxDays = 90;
  const [days, setDays] = useState(30);

  const growthFactor = 1 + (trade.percentageGain / 100) * (days / 30);
  const hypotheticalValue = trade.boughtWithUSD * growthFactor;
  const actualValue = trade.soldForUSD;
  const difference = hypotheticalValue - actualValue;

  return (
    <div className="p-6 bg-card border border-border rounded-2xl">
      <h3 className="text-lg font-bold mb-4">🔮 What If Simulator</h3>
      <p className="text-muted text-sm mb-4">
        What if you held <span className="text-accent font-semibold">{trade.token.name}</span> for {days} more days?
      </p>

      <input
        type="range"
        min={1}
        max={maxDays}
        value={days}
        onChange={(e) => setDays(Number(e.target.value))}
        className="w-full h-2 bg-border rounded-full appearance-none cursor-pointer accent-accent mb-6"
      />
      <div className="flex justify-between text-xs text-muted mb-6">
        <span>1 day</span>
        <span className="text-accent font-medium">{days} days</span>
        <span>90 days</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 bg-background rounded-xl border border-border text-center">
          <p className="text-xs text-muted mb-1">You sold for</p>
          <p className="text-lg font-bold text-red-400">{formatUSD(actualValue)}</p>
        </div>
        <div className="p-4 bg-accent/5 rounded-xl border border-accent/20 text-center">
          <p className="text-xs text-muted mb-1">Could have been</p>
          <p className="text-lg font-bold text-accent">{formatUSD(hypotheticalValue)}</p>
        </div>
        <div className="p-4 bg-background rounded-xl border border-border text-center">
          <p className="text-xs text-muted mb-1">Difference</p>
          <p className="text-lg font-bold text-yellow-400">+{formatUSD(difference)}</p>
        </div>
      </div>
    </div>
  );
}
