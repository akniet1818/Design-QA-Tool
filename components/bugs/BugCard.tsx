"use client";

import { useEffect, useRef } from "react";
import type { DesignBug } from "@/types";

const SEVERITY_STYLES = {
  critical: "bg-rose-50 dark:bg-rose-900/30 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400",
  warning: "bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400",
  info: "bg-sky-50 dark:bg-sky-900/30 border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-400",
};

const PIN_COLORS = {
  critical: "bg-rose-500",
  warning: "bg-amber-400",
  info: "bg-sky-400",
};

const TYPE_ICONS: Record<string, string> = {
  spacing: "⇿", typography: "T", color: "◉",
  sizing: "⬚", "border-radius": "⌒", shadow: "◫",
};

interface BugCardProps {
  bug: DesignBug;
  index: number;
  highlighted?: boolean;
  onDismissHighlight?: () => void;
}

export function BugCard({ bug, index, highlighted, onDismissHighlight }: BugCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (highlighted && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [highlighted]);

  return (
    <div
      ref={ref}
      onClick={onDismissHighlight}
      className={[
        "rounded-lg border p-3 flex flex-col gap-2 transition-all cursor-default",
        SEVERITY_STYLES[bug.severity],
        highlighted ? "ring-2 ring-offset-2 ring-offset-white dark:ring-offset-zinc-900 ring-blue-500 shadow-lg" : "",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0 ${PIN_COLORS[bug.severity]}`}>
            {index + 1}
          </span>
          <div>
            <span className="text-xs font-semibold capitalize">{bug.type}</span>
            <span className="ml-2 text-[10px] uppercase opacity-60">{bug.severity}</span>
          </div>
        </div>
        <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 flex-shrink-0 text-right">
          {TYPE_ICONS[bug.type] ?? "?"}
        </span>
      </div>

      {/* Tailwind token primary, px secondary */}
      <div className="grid grid-cols-2 gap-1 text-[11px] font-mono">
        <div className="bg-black/5 dark:bg-black/30 rounded px-2 py-1.5">
          <div className="text-[9px] opacity-50 mb-1 uppercase tracking-wide">Figma</div>
          {bug.figmaTailwindToken && (
            <div className="text-blue-600 dark:text-blue-400 font-semibold">{bug.figmaTailwindToken}</div>
          )}
          <div className="text-zinc-500 dark:text-zinc-400 text-[10px]">({bug.figmaValue})</div>
        </div>
        <div className="bg-black/5 dark:bg-black/30 rounded px-2 py-1.5">
          <div className="text-[9px] opacity-50 mb-1 uppercase tracking-wide">Staging</div>
          {bug.stagingTailwindToken && (
            <div className="text-amber-600 dark:text-amber-400 font-semibold">{bug.stagingTailwindToken}</div>
          )}
          <div className="text-zinc-500 dark:text-zinc-400 text-[10px]">({bug.stagingValue})</div>
        </div>
      </div>

      {bug.suggestedFix && (
        <div className="text-[10px] bg-black/5 dark:bg-black/30 rounded px-2 py-1.5 font-mono">
          <span className="opacity-50">Fix: </span>
          {bug.suggestedFix}
        </div>
      )}

      {bug.screenshot && (
        <img src={bug.screenshot} alt="bug region" className="rounded border border-zinc-200 dark:border-zinc-700 max-h-20 object-cover w-full" />
      )}
    </div>
  );
}
