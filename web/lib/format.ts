export function shortAddress(addr: string): string {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function countdown(deadlineIso: string): string {
  const ms = new Date(deadlineIso).getTime() - Date.now();
  if (ms <= 0) return "expired";
  const d = Math.floor(ms / 864e5);
  if (d > 0) return `${d}d left`;
  const h = Math.floor(ms / 36e5);
  if (h > 0) return `${h}h left`;
  return `${Math.max(1, Math.floor(ms / 6e4))}m left`;
}
