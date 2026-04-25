"use client";

import { diffPercentageClass } from "@/lib/utils/severity";

type ViewMode = "slider" | "figma" | "staging" | "diff" | "live";

interface DiffOverlayProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
  diffPercentage?: number;
}

const MODES: { value: ViewMode; label: string }[] = [
  { value: "live", label: "Live" },
  { value: "slider", label: "Slider" },
  { value: "figma", label: "Figma" },
  { value: "staging", label: "Staging" },
  { value: "diff", label: "Diff" },
];

export function DiffOverlay({ mode, onChange, diffPercentage }: DiffOverlayProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex rounded-lg overflow-hidden border border-zinc-300 dark:border-zinc-700">
        {MODES.map((m, i) => (
          <button
            key={m.value}
            type="button"
            onClick={() => onChange(m.value)}
            className={[
              "px-3 py-1.5 text-xs font-medium transition-colors",
              i > 0 ? "border-l border-zinc-300 dark:border-zinc-700" : "",
              mode === m.value
                ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:text-zinc-300 hover:bg-neutral-750",
            ].join(" ")}
          >
            {m.label}
          </button>
        ))}
      </div>
      {diffPercentage !== undefined && (
        <span className={`text-xs font-mono px-2 py-1 rounded ${diffPercentageClass(diffPercentage)}`}>
          {diffPercentage.toFixed(1)}% diff
        </span>
      )}
    </div>
  );
}

export type { ViewMode };
