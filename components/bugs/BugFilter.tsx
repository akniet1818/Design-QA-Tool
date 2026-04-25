"use client";

import type { BugType, Severity } from "@/types";

interface BugFilterProps {
  selectedTypes: BugType[];
  selectedSeverities: Severity[];
  onTypeChange: (types: BugType[]) => void;
  onSeverityChange: (severities: Severity[]) => void;
}

const TYPES: BugType[] = ["spacing", "typography", "color", "sizing", "border-radius", "shadow"];
const SEVERITIES: Severity[] = ["critical", "warning", "info"];

const SEVERITY_COLORS: Record<Severity, string> = {
  critical: "bg-red-700 text-white",
  warning: "bg-amber-600 text-white",
  info: "bg-blue-700 text-white",
};

export function BugFilter({ selectedTypes, selectedSeverities, onTypeChange, onSeverityChange }: BugFilterProps) {
  const toggleType = (t: BugType) => {
    onTypeChange(
      selectedTypes.includes(t)
        ? selectedTypes.filter(x => x !== t)
        : [...selectedTypes, t]
    );
  };

  const toggleSeverity = (s: Severity) => {
    onSeverityChange(
      selectedSeverities.includes(s)
        ? selectedSeverities.filter(x => x !== s)
        : [...selectedSeverities, s]
    );
  };

  return (
    <div className="flex flex-col gap-3 p-3 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-800">
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Severity</span>
        <div className="flex gap-1.5 flex-wrap">
          {SEVERITIES.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => toggleSeverity(s)}
              className={`px-2 py-0.5 rounded text-[10px] font-medium capitalize transition-opacity border border-transparent ${
                selectedSeverities.includes(s)
                  ? SEVERITY_COLORS[s]
                  : "bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 opacity-50 hover:opacity-75"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Type</span>
        <div className="flex gap-1.5 flex-wrap">
          {TYPES.map(t => (
            <button
              key={t}
              type="button"
              onClick={() => toggleType(t)}
              className={`px-2 py-0.5 rounded text-[10px] font-medium capitalize transition-opacity ${
                selectedTypes.includes(t)
                  ? "bg-neutral-600 text-zinc-900 dark:text-zinc-100"
                  : "bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 opacity-50 hover:opacity-75"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
