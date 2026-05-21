"use client";

import { TokenTrade } from "@/lib/types";
import { formatUSD, formatPercent } from "@/lib/utils";

interface TokenCarouselProps {
  tokens: TokenTrade[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

function TokenIcon({ icon }: { icon: string }) {
  if (icon.startsWith("http")) {
    return (
      <img
        src={icon}
        alt=""
        className="w-8 h-8 rounded-full object-cover"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
          (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
        }}
      />
    );
  }
  return <span className="text-2xl">{icon}</span>;
}

export function TokenCarousel({ tokens, activeIndex, onSelect }: TokenCarouselProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
      {tokens.map((trade, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          className={`flex-shrink-0 flex items-center gap-3 px-4 py-3 rounded-xl border transition-all min-w-[200px] ${
            activeIndex === i
              ? "bg-accent/10 border-accent/40 shadow-lg shadow-accent/5"
              : "bg-card border-border hover:border-muted"
          }`}
        >
          <div className="relative">
            <TokenIcon icon={trade.token.icon} />
            <span className="hidden text-2xl">🪙</span>
            <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-accent text-background text-[10px] font-bold flex items-center justify-center">
              {i + 1}
            </span>
          </div>
          <div className="text-left">
            <p className="font-semibold text-sm">{trade.token.name}</p>
            <p className="text-xs text-muted">{trade.token.symbol}</p>
            <p className="text-xs text-accent font-medium">
              {formatUSD(trade.totalValueUSD)} ({formatPercent(trade.percentageGain)})
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}
