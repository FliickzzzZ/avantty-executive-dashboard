export function formatInteger(val: number): string {
  return new Intl.NumberFormat("en-US").format(val);
}

export function formatCompact(val: number): string {
  return new Intl.NumberFormat("en-US", { notation: "compact" }).format(val);
}

export function formatCompactNumber(val: number): string {
  return formatCompact(val);
}
