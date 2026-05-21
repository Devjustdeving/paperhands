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

export function getScoreLabel(score: number): string {
  if (score >= 80) return "Legendary Jeeter";
  if (score >= 60) return "Advanced Jeeter";
  if (score >= 40) return "Moderate Jeeter";
  return "Minor Jeeter";
}
