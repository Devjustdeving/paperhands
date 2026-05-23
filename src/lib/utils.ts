export function formatUSD(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`;
  return `$${value.toLocaleString()}`;
}

export function formatNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(2)}K`;
  return value.toLocaleString();
}

export function formatSOL(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export function formatPercent(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M%`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K%`;
  return `${value.toLocaleString()}%`;
}

export function truncateAddress(address: string, chars = 4): string {
  if (address.includes("...")) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function getScoreColor(score: number): string {
  if (score >= 80) return "text-red-400";
  if (score >= 60) return "text-orange-400";
  if (score >= 40) return "text-yellow-400";
  return "text-green-400";
}

export function formatHeldTime(hours: number): string {
  if (hours >= 720) {
    const days = Math.round(hours / 24);
    return `${days} Days`;
  }
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const rem = Math.round(hours % 24);
    return rem > 0 ? `${days}D ${rem}H` : `${days} Days`;
  }
  if (hours >= 1) return `${Math.round(hours)} Hours`;
  const mins = Math.round(hours * 60);
  if (mins > 0) return `${mins} Min`;
  return "< 1 Min";
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return "Legendary Jeeter";
  if (score >= 60) return "Advanced Jeeter";
  if (score >= 40) return "Moderate Jeeter";
  return "Minor Jeeter";
}
