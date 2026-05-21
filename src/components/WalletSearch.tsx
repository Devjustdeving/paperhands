"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Chain } from "@/lib/types";

const CHAINS: { id: Chain; name: string; icon: string }[] = [
  { id: "solana", name: "Solana", icon: "◎" },
  { id: "ethereum", name: "Ethereum", icon: "Ξ" },
  { id: "base", name: "Base", icon: "🔵" },
];

export function WalletSearch() {
  const [address, setAddress] = useState("");
  const [chain, setChain] = useState<Chain>("solana");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (address.trim()) {
      router.push(`/wallet/${address.trim()}?chain=${chain}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto">
      <div className="flex gap-2 mb-4 justify-center">
        {CHAINS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setChain(c.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              chain === c.id
                ? "bg-accent/20 text-accent border border-accent/40"
                : "bg-card text-muted border border-border hover:border-muted"
            }`}
          >
            {c.icon} {c.name}
          </button>
        ))}
      </div>
      <div className="relative">
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter wallet address..."
          className="w-full px-5 py-4 bg-card border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-all text-lg font-mono"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-accent text-background font-semibold rounded-lg hover:bg-accent-dim transition-colors"
        >
          Check
        </button>
      </div>
      <p className="text-center text-muted text-xs mt-3">
        Paste any wallet address to see how much was left on the table
      </p>
    </form>
  );
}
