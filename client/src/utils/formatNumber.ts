export const formatNumber = (value: number): string => {
  if (value === null || value === undefined || isNaN(value as any)) return "0";
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1_000_000) {
    const m = (abs / 1_000_000);
    const rounded = m % 1 === 0 ? m.toFixed(0) : m.toFixed(1);
    return `${sign}${rounded}m`;
  }
  if (abs >= 1_000) {
    const k = (abs / 1_000);
    const rounded = k % 1 === 0 ? k.toFixed(0) : k.toFixed(1);
    return `${sign}${rounded}k`;
  }
  return `${sign}${abs.toLocaleString()}`;
};
