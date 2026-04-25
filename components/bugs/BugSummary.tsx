"use client";

import type { DesignBug, Severity } from "@/types";
import { diffPercentageClass } from "@/lib/utils/severity";

interface BugSummaryProps {
  bugs: DesignBug[];
  diffPercentage: number;
}

const SEVERITY_LABEL: Record<Severity, { label: string; class: string }> = {
  critical: { label: "Critical", class: "bg-red-950 text-red-400 border border-red-900" },
  warning: { label: "Warning", class: "bg-amber-950 text-amber-400 border border-amber-900" },
  info: { label: "Info", class: "bg-blue-950 text-blue-400 border border-blue-900" },
};

export function BugSummary({ bugs, diffPercentage }: BugSummaryProps) {
  const counts = bugs.reduce(
    (acc, b) => { acc[b.severity] = (acc[b.severity] ?? 0) + 1; return acc; },
    {} as Record<Severity, number>
  );

  return (
    <div className="flex flex-col gap-2 p-3 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{bugs.length} bugs found</span>
        <span className={`text-xs font-mono px-2 py-0.5 rounded ${diffPercentageClass(diffPercentage)}`}>
          {diffPercentage.toFixed(1)}% visual diff
        </span>
      </div>
      <div className="flex gap-2 flex-wrap">
        {(["critical", "warning", "info"] as Severity[]).map(s => (
          <span key={s} className={`text-[10px] font-medium px-2 py-0.5 rounded ${SEVERITY_LABEL[s].class}`}>
            {counts[s] ?? 0} {SEVERITY_LABEL[s].label}
          </span>
        ))}
      </div>
    </div>
  );
}
