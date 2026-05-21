"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-md z-50">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl font-bold text-accent">Ph</span>
          <div className="leading-tight">
            <span className="text-sm font-bold text-foreground group-hover:text-accent transition-colors">
              paperhands
            </span>
            <span className="text-[10px] ml-1 px-1.5 py-0.5 bg-accent/20 text-accent rounded-full font-medium">
              BETA
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/leaderboard"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              pathname === "/leaderboard"
                ? "bg-card text-accent"
                : "text-muted hover:text-foreground"
            }`}
          >
            Leaderboard
          </Link>
          <Link
            href="/compare"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              pathname === "/compare"
                ? "bg-card text-accent"
                : "text-muted hover:text-foreground"
            }`}
          >
            Compare
          </Link>
          <Link
            href="/"
            className="px-4 py-2 rounded-lg text-sm font-medium bg-card text-foreground hover:bg-card-hover border border-border transition-colors"
          >
            Search
          </Link>
        </div>
      </div>
    </nav>
  );
}
