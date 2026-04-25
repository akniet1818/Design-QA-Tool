"use client";

import { useState } from "react";
import type { DesignBug } from "@/types";

interface AnnotationPinsProps {
  bugs: DesignBug[];
  imageWidth: number;
  imageHeight: number;
  highlightedId: string | null;
  onPinClick: (id: string) => void;
}

const PIN_COLORS: Record<string, string> = {
  critical: "bg-rose-500 hover:bg-rose-400",
  warning: "bg-amber-400 hover:bg-amber-300",
  info: "bg-sky-400 hover:bg-sky-300",
};

const RING_COLORS: Record<string, string> = {
  critical: "ring-rose-300",
  warning: "ring-amber-200",
  info: "ring-sky-300",
};

export function AnnotationPins({ bugs, imageWidth, imageHeight, highlightedId, onPinClick }: AnnotationPinsProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (!imageWidth || !imageHeight) return null;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {bugs.map((bug, i) => {
        const left = ((bug.location.x + bug.location.width / 2) / imageWidth) * 100;
        const top = ((bug.location.y + bug.location.height / 2) / imageHeight) * 100;
        const isHovered = hoveredId === bug.id;
        const isHighlighted = highlightedId === bug.id;

        return (
          <div
            key={bug.id}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${left}%`, top: `${top}%` }}
          >
            {/* Tooltip */}
            {isHovered && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 bg-zinc-900 dark:bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-[11px] pointer-events-none z-50 shadow-xl">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className={`w-2 h-2 rounded-full ${PIN_COLORS[bug.severity].split(" ")[0]}`} />
                  <span className="font-semibold text-zinc-100 capitalize">{bug.type}</span>
                  <span className="text-zinc-500 text-[9px] uppercase ml-auto">{bug.severity}</span>
                </div>
                <div className="grid grid-cols-2 gap-1 mb-1.5">
                  <div className="bg-zinc-800 rounded p-1">
                    <div className="text-[9px] text-zinc-500 mb-0.5">Figma</div>
                    <div className="text-blue-400 font-mono">{bug.figmaTailwindToken}</div>
                    <div className="text-zinc-400 text-[9px]">{bug.figmaValue}</div>
                  </div>
                  <div className="bg-zinc-800 rounded p-1">
                    <div className="text-[9px] text-zinc-500 mb-0.5">Staging</div>
                    <div className="text-amber-400 font-mono">{bug.stagingTailwindToken}</div>
                    <div className="text-zinc-400 text-[9px]">{bug.stagingValue}</div>
                  </div>
                </div>
                <div className="text-zinc-400 text-[10px] font-mono">{bug.suggestedFix}</div>
                {/* Arrow */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-700" />
              </div>
            )}

            {/* Pin */}
            <button
              type="button"
              className={[
                "pointer-events-auto w-5 h-5 rounded-full flex items-center justify-center",
                "text-[9px] font-bold text-white shadow-lg transition-all",
                PIN_COLORS[bug.severity],
                isHighlighted ? `ring-2 ring-offset-1 ring-offset-transparent ${RING_COLORS[bug.severity]} scale-125` : "",
              ].join(" ")}
              onClick={() => onPinClick(bug.id)}
              onMouseEnter={() => setHoveredId(bug.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {i + 1}
            </button>
          </div>
        );
      })}
    </div>
  );
}
