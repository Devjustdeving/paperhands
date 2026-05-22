"use client";

import { useState } from "react";
import { TokenTrade } from "@/lib/types";
import { formatUSD } from "@/lib/utils";

interface AlertsPanelProps {
  walletAddress: string;
  soldTokens: TokenTrade[];
}

interface Alert {
  tokenName: string;
  tokenSymbol: string;
  soldPrice: number;
  currentPrice: number;
  athPrice: number;
  active: boolean;
}

export function AlertsPanel({ walletAddress, soldTokens }: AlertsPanelProps) {
  const [connected, setConnected] = useState(false);
  const [email, setEmail] = useState("");
  const [telegramHandle, setTelegramHandle] = useState("");
  const [notifyMethod, setNotifyMethod] = useState<"email" | "telegram" | "browser">("browser");
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showSetup, setShowSetup] = useState(false);

  const handleConnect = () => {
    const mockAlerts: Alert[] = soldTokens.slice(0, 5).map((t) => ({
      tokenName: t.token.name,
      tokenSymbol: t.token.symbol,
      soldPrice: t.soldForUSD,
      currentPrice: t.totalValueUSD,
      athPrice: t.totalValueUSD * 1.5,
      active: true,
    }));
    setAlerts(mockAlerts);
    setConnected(true);
    setShowSetup(false);
  };

  const toggleAlert = (index: number) => {
    setAlerts((prev) =>
      prev.map((a, i) => (i === index ? { ...a, active: !a.active } : a))
    );
  };

  return (
    <div className="p-6 bg-card border border-border rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold">🔔 ATH Alerts</h3>
          <p className="text-muted text-sm">
            Get notified when tokens you sold hit new all-time highs
          </p>
        </div>
        {!connected && (
          <button
            onClick={() => setShowSetup(!showSetup)}
            className="px-4 py-2 bg-accent/20 text-accent border border-accent/30 rounded-lg text-sm font-medium hover:bg-accent/30 transition-all"
          >
            Set Up Alerts
          </button>
        )}
      </div>

      {showSetup && !connected && (
        <div className="animate-fade-in space-y-4 mb-4 p-4 bg-background rounded-xl border border-border">
          <p className="text-sm text-muted">
            Choose how you want to receive ATH notifications:
          </p>
          <div className="flex gap-2">
            {(["browser", "email", "telegram"] as const).map((method) => (
              <button
                key={method}
                onClick={() => setNotifyMethod(method)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  notifyMethod === method
                    ? "bg-accent/20 text-accent border border-accent/40"
                    : "bg-card text-muted border border-border"
                }`}
              >
                {method === "browser" && "🌐 Browser"}
                {method === "email" && "📧 Email"}
                {method === "telegram" && "✈️ Telegram"}
              </button>
            ))}
          </div>

          {notifyMethod === "email" && (
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:border-accent/50 text-sm"
            />
          )}

          {notifyMethod === "telegram" && (
            <input
              type="text"
              value={telegramHandle}
              onChange={(e) => setTelegramHandle(e.target.value)}
              placeholder="@your_telegram"
              className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:border-accent/50 text-sm"
            />
          )}

          <button
            onClick={handleConnect}
            className="w-full py-3 bg-accent text-background font-semibold rounded-xl hover:bg-accent-dim transition-colors"
          >
            Enable ATH Alerts
          </button>
        </div>
      )}

      {connected && (
        <div className="animate-fade-in space-y-2">
          <div className="flex items-center gap-2 mb-4 p-3 bg-accent/5 border border-accent/20 rounded-xl">
            <span className="text-accent">✓</span>
            <p className="text-sm text-accent">
              Alerts active via {notifyMethod}. You&apos;ll be notified when sold tokens hit new ATH.
            </p>
          </div>

          {alerts.map((alert, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 bg-background rounded-xl border border-border"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">🪙</span>
                <div>
                  <p className="text-sm font-semibold">{alert.tokenName}</p>
                  <p className="text-xs text-muted">
                    Sold at {formatUSD(alert.soldPrice)} · Current: {formatUSD(alert.currentPrice)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => toggleAlert(i)}
                className={`w-10 h-6 rounded-full transition-all relative ${
                  alert.active ? "bg-accent" : "bg-border"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${
                    alert.active ? "left-4" : "left-0.5"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
