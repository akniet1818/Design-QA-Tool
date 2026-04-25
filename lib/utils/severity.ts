import type { Severity } from "@/types";

export function severityByDelta(delta: number): Severity {
  return delta > 8 ? "critical" : delta > 4 ? "warning" : "info";
}

export function severityByDeltaE(deltaE: number): Severity {
  return deltaE > 15 ? "critical" : deltaE > 5 ? "warning" : "info";
}

export function diffPercentageClass(pct: number): string {
  return pct < 1
    ? "bg-green-900/50 text-green-400"
    : pct < 5
    ? "bg-yellow-900/50 text-yellow-400"
    : "bg-red-900/50 text-red-400";
}

export function getErrorMessage(e: unknown): string {
  return e instanceof Error ? e.message : "An unknown error occurred";
}
