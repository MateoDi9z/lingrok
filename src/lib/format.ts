import type { Q } from "./lp/fraction";

export function formatQ(q: Q, mode: "dec" | "frac" = "dec"): string {
  if (mode === "frac") return q.toFraction();
  const s = q.toDecimal(6);
  if (s === "-0") return "0";
  return s;
}

export function formatNum(n: number, digits = 4): string {
  if (!Number.isFinite(n)) return "—";
  const s = n.toFixed(digits).replace(/\.?0+$/, "");
  return s === "-0" ? "0" : s;
}

export function formatRange(v: Q | null | undefined, mode: "dec" | "frac"): string {
  if (v === null || v === undefined) return "∞";
  return formatQ(v, mode);
}

export function statusLabel(status: string): string {
  switch (status) {
    case "optimal":
      return "Óptimo global";
    case "integer-optimal":
      return "Óptimo entero";
    case "infeasible":
      return "Infactible";
    case "unbounded":
      return "No acotado";
    default:
      return "Error";
  }
}
