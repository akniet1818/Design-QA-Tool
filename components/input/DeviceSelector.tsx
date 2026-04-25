"use client";

import type { Viewport } from "@/types";

const DEVICES: { value: Viewport; label: string; px: string }[] = [
  { value: "desktop", label: "Desktop", px: "1440" },
  { value: "tablet", label: "Tablet", px: "768" },
  { value: "mobile", label: "Mobile", px: "375" },
];

interface DeviceSelectorProps {
  value: Viewport;
  onChange: (viewport: Viewport) => void;
}

export function DeviceSelector({ value, onChange }: DeviceSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Viewport</label>
      <div className="flex rounded-lg overflow-hidden border border-zinc-300 dark:border-zinc-700">
        {DEVICES.map((d, i) => (
          <button
            key={d.value}
            type="button"
            onClick={() => onChange(d.value)}
            className={[
              "flex-1 flex flex-col items-center py-2 px-1 text-xs transition-colors",
              i > 0 ? "border-l border-zinc-300 dark:border-zinc-700" : "",
              value === d.value
                ? "bg-blue-600 text-white"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:bg-zinc-700 hover:text-zinc-800 dark:text-zinc-200",
            ].join(" ")}
          >
            <span className="font-medium">{d.label}</span>
            <span className="font-mono text-[10px] opacity-70">{d.px}px</span>
          </button>
        ))}
      </div>
    </div>
  );
}
