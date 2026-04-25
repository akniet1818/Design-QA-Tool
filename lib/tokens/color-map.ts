import { rgbToLab, deltaE2000, hexToRgb } from "../utils/delta-e";

export interface ColorToken {
  token: string;
  hex: string;
  heroUI?: string;
}

export const TAILWIND_COLORS: ColorToken[] = [
  // slate
  { token: "slate-50", hex: "#f8fafc" },
  { token: "slate-100", hex: "#f1f5f9" },
  { token: "slate-200", hex: "#e2e8f0" },
  { token: "slate-300", hex: "#cbd5e1" },
  { token: "slate-400", hex: "#94a3b8" },
  { token: "slate-500", hex: "#64748b" },
  { token: "slate-600", hex: "#475569" },
  { token: "slate-700", hex: "#334155" },
  { token: "slate-800", hex: "#1e293b" },
  { token: "slate-900", hex: "#0f172a" },
  { token: "slate-950", hex: "#020617" },
  // gray
  { token: "gray-50", hex: "#f9fafb" },
  { token: "gray-100", hex: "#f3f4f6" },
  { token: "gray-200", hex: "#e5e7eb" },
  { token: "gray-300", hex: "#d1d5db" },
  { token: "gray-400", hex: "#9ca3af" },
  { token: "gray-500", hex: "#6b7280" },
  { token: "gray-600", hex: "#4b5563" },
  { token: "gray-700", hex: "#374151" },
  { token: "gray-800", hex: "#1f2937" },
  { token: "gray-900", hex: "#111827" },
  { token: "gray-950", hex: "#030712" },
  // zinc
  { token: "zinc-50", hex: "#fafafa" },
  { token: "zinc-100", hex: "#f4f4f5" },
  { token: "zinc-200", hex: "#e4e4e7" },
  { token: "zinc-300", hex: "#d4d4d8" },
  { token: "zinc-400", hex: "#a1a1aa" },
  { token: "zinc-500", hex: "#71717a" },
  { token: "zinc-600", hex: "#52525b" },
  { token: "zinc-700", hex: "#3f3f46" },
  { token: "zinc-800", hex: "#27272a" },
  { token: "zinc-900", hex: "#18181b" },
  { token: "zinc-950", hex: "#09090b" },
  // neutral
  { token: "neutral-50", hex: "#fafafa" },
  { token: "neutral-100", hex: "#f5f5f5" },
  { token: "neutral-200", hex: "#e5e5e5" },
  { token: "neutral-300", hex: "#d4d4d4" },
  { token: "neutral-400", hex: "#a3a3a3" },
  { token: "neutral-500", hex: "#737373" },
  { token: "neutral-600", hex: "#525252" },
  { token: "neutral-700", hex: "#404040" },
  { token: "neutral-800", hex: "#262626" },
  { token: "neutral-900", hex: "#171717" },
  { token: "neutral-950", hex: "#0a0a0a" },
  // stone
  { token: "stone-50", hex: "#fafaf9" },
  { token: "stone-100", hex: "#f5f5f4" },
  { token: "stone-200", hex: "#e7e5e4" },
  { token: "stone-300", hex: "#d6d3d1" },
  { token: "stone-400", hex: "#a8a29e" },
  { token: "stone-500", hex: "#78716c" },
  { token: "stone-600", hex: "#57534e" },
  { token: "stone-700", hex: "#44403c" },
  { token: "stone-800", hex: "#292524" },
  { token: "stone-900", hex: "#1c1917" },
  { token: "stone-950", hex: "#0c0a09" },
  // red
  { token: "red-50", hex: "#fef2f2" },
  { token: "red-100", hex: "#fee2e2" },
  { token: "red-200", hex: "#fecaca" },
  { token: "red-300", hex: "#fca5a5" },
  { token: "red-400", hex: "#f87171" },
  { token: "red-500", hex: "#ef4444", heroUI: "danger" },
  { token: "red-600", hex: "#dc2626" },
  { token: "red-700", hex: "#b91c1c" },
  { token: "red-800", hex: "#991b1b" },
  { token: "red-900", hex: "#7f1d1d" },
  { token: "red-950", hex: "#450a0a" },
  // orange
  { token: "orange-50", hex: "#fff7ed" },
  { token: "orange-100", hex: "#ffedd5" },
  { token: "orange-200", hex: "#fed7aa" },
  { token: "orange-300", hex: "#fdba74" },
  { token: "orange-400", hex: "#fb923c" },
  { token: "orange-500", hex: "#f97316" },
  { token: "orange-600", hex: "#ea580c" },
  { token: "orange-700", hex: "#c2410c" },
  { token: "orange-800", hex: "#9a3412" },
  { token: "orange-900", hex: "#7c2d12" },
  { token: "orange-950", hex: "#431407" },
  // amber
  { token: "amber-50", hex: "#fffbeb" },
  { token: "amber-100", hex: "#fef3c7" },
  { token: "amber-200", hex: "#fde68a" },
  { token: "amber-300", hex: "#fcd34d" },
  { token: "amber-400", hex: "#fbbf24", heroUI: "warning" },
  { token: "amber-500", hex: "#f59e0b" },
  { token: "amber-600", hex: "#d97706" },
  { token: "amber-700", hex: "#b45309" },
  { token: "amber-800", hex: "#92400e" },
  { token: "amber-900", hex: "#78350f" },
  { token: "amber-950", hex: "#451a03" },
  // yellow
  { token: "yellow-50", hex: "#fefce8" },
  { token: "yellow-100", hex: "#fef9c3" },
  { token: "yellow-200", hex: "#fef08a" },
  { token: "yellow-300", hex: "#fde047" },
  { token: "yellow-400", hex: "#facc15" },
  { token: "yellow-500", hex: "#eab308" },
  { token: "yellow-600", hex: "#ca8a04" },
  { token: "yellow-700", hex: "#a16207" },
  { token: "yellow-800", hex: "#854d0e" },
  { token: "yellow-900", hex: "#713f12" },
  { token: "yellow-950", hex: "#422006" },
  // lime
  { token: "lime-50", hex: "#f7fee7" },
  { token: "lime-100", hex: "#ecfccb" },
  { token: "lime-200", hex: "#d9f99d" },
  { token: "lime-300", hex: "#bef264" },
  { token: "lime-400", hex: "#a3e635" },
  { token: "lime-500", hex: "#84cc16" },
  { token: "lime-600", hex: "#65a30d" },
  { token: "lime-700", hex: "#4d7c0f" },
  { token: "lime-800", hex: "#3f6212" },
  { token: "lime-900", hex: "#365314" },
  { token: "lime-950", hex: "#1a2e05" },
  // green
  { token: "green-50", hex: "#f0fdf4" },
  { token: "green-100", hex: "#dcfce7" },
  { token: "green-200", hex: "#bbf7d0" },
  { token: "green-300", hex: "#86efac" },
  { token: "green-400", hex: "#4ade80" },
  { token: "green-500", hex: "#22c55e", heroUI: "success" },
  { token: "green-600", hex: "#16a34a" },
  { token: "green-700", hex: "#15803d" },
  { token: "green-800", hex: "#166534" },
  { token: "green-900", hex: "#14532d" },
  { token: "green-950", hex: "#052e16" },
  // emerald
  { token: "emerald-50", hex: "#ecfdf5" },
  { token: "emerald-100", hex: "#d1fae5" },
  { token: "emerald-200", hex: "#a7f3d0" },
  { token: "emerald-300", hex: "#6ee7b7" },
  { token: "emerald-400", hex: "#34d399" },
  { token: "emerald-500", hex: "#10b981" },
  { token: "emerald-600", hex: "#059669" },
  { token: "emerald-700", hex: "#047857" },
  { token: "emerald-800", hex: "#065f46" },
  { token: "emerald-900", hex: "#064e3b" },
  { token: "emerald-950", hex: "#022c22" },
  // teal
  { token: "teal-50", hex: "#f0fdfa" },
  { token: "teal-100", hex: "#ccfbf1" },
  { token: "teal-200", hex: "#99f6e4" },
  { token: "teal-300", hex: "#5eead4" },
  { token: "teal-400", hex: "#2dd4bf" },
  { token: "teal-500", hex: "#14b8a6" },
  { token: "teal-600", hex: "#0d9488" },
  { token: "teal-700", hex: "#0f766e" },
  { token: "teal-800", hex: "#115e59" },
  { token: "teal-900", hex: "#134e4a" },
  { token: "teal-950", hex: "#042f2e" },
  // cyan
  { token: "cyan-50", hex: "#ecfeff" },
  { token: "cyan-100", hex: "#cffafe" },
  { token: "cyan-200", hex: "#a5f3fc" },
  { token: "cyan-300", hex: "#67e8f9" },
  { token: "cyan-400", hex: "#22d3ee" },
  { token: "cyan-500", hex: "#06b6d4" },
  { token: "cyan-600", hex: "#0891b2" },
  { token: "cyan-700", hex: "#0e7490" },
  { token: "cyan-800", hex: "#155e75" },
  { token: "cyan-900", hex: "#164e63" },
  { token: "cyan-950", hex: "#083344" },
  // sky
  { token: "sky-50", hex: "#f0f9ff" },
  { token: "sky-100", hex: "#e0f2fe" },
  { token: "sky-200", hex: "#bae6fd" },
  { token: "sky-300", hex: "#7dd3fc" },
  { token: "sky-400", hex: "#38bdf8" },
  { token: "sky-500", hex: "#0ea5e9" },
  { token: "sky-600", hex: "#0284c7" },
  { token: "sky-700", hex: "#0369a1" },
  { token: "sky-800", hex: "#075985" },
  { token: "sky-900", hex: "#0c4a6e" },
  { token: "sky-950", hex: "#082f49" },
  // blue
  { token: "blue-50", hex: "#eff6ff" },
  { token: "blue-100", hex: "#dbeafe" },
  { token: "blue-200", hex: "#bfdbfe" },
  { token: "blue-300", hex: "#93c5fd" },
  { token: "blue-400", hex: "#60a5fa" },
  { token: "blue-500", hex: "#3b82f6", heroUI: "primary" },
  { token: "blue-600", hex: "#2563eb" },
  { token: "blue-700", hex: "#1d4ed8" },
  { token: "blue-800", hex: "#1e40af" },
  { token: "blue-900", hex: "#1e3a8a" },
  { token: "blue-950", hex: "#172554" },
  // indigo
  { token: "indigo-50", hex: "#eef2ff" },
  { token: "indigo-100", hex: "#e0e7ff" },
  { token: "indigo-200", hex: "#c7d2fe" },
  { token: "indigo-300", hex: "#a5b4fc" },
  { token: "indigo-400", hex: "#818cf8" },
  { token: "indigo-500", hex: "#6366f1" },
  { token: "indigo-600", hex: "#4f46e5" },
  { token: "indigo-700", hex: "#4338ca" },
  { token: "indigo-800", hex: "#3730a3" },
  { token: "indigo-900", hex: "#312e81" },
  { token: "indigo-950", hex: "#1e1b4b" },
  // violet
  { token: "violet-50", hex: "#f5f3ff" },
  { token: "violet-100", hex: "#ede9fe" },
  { token: "violet-200", hex: "#ddd6fe" },
  { token: "violet-300", hex: "#c4b5fd" },
  { token: "violet-400", hex: "#a78bfa" },
  { token: "violet-500", hex: "#8b5cf6" },
  { token: "violet-600", hex: "#7c3aed" },
  { token: "violet-700", hex: "#6d28d9" },
  { token: "violet-800", hex: "#5b21b6" },
  { token: "violet-900", hex: "#4c1d95" },
  { token: "violet-950", hex: "#2e1065" },
  // purple
  { token: "purple-50", hex: "#faf5ff" },
  { token: "purple-100", hex: "#f3e8ff" },
  { token: "purple-200", hex: "#e9d5ff" },
  { token: "purple-300", hex: "#d8b4fe" },
  { token: "purple-400", hex: "#c084fc" },
  { token: "purple-500", hex: "#a855f7", heroUI: "secondary" },
  { token: "purple-600", hex: "#9333ea" },
  { token: "purple-700", hex: "#7e22ce" },
  { token: "purple-800", hex: "#6b21a8" },
  { token: "purple-900", hex: "#581c87" },
  { token: "purple-950", hex: "#3b0764" },
  // fuchsia
  { token: "fuchsia-50", hex: "#fdf4ff" },
  { token: "fuchsia-100", hex: "#fae8ff" },
  { token: "fuchsia-200", hex: "#f5d0fe" },
  { token: "fuchsia-300", hex: "#f0abfc" },
  { token: "fuchsia-400", hex: "#e879f9" },
  { token: "fuchsia-500", hex: "#d946ef" },
  { token: "fuchsia-600", hex: "#c026d3" },
  { token: "fuchsia-700", hex: "#a21caf" },
  { token: "fuchsia-800", hex: "#86198f" },
  { token: "fuchsia-900", hex: "#701a75" },
  { token: "fuchsia-950", hex: "#4a044e" },
  // pink
  { token: "pink-50", hex: "#fdf2f8" },
  { token: "pink-100", hex: "#fce7f3" },
  { token: "pink-200", hex: "#fbcfe8" },
  { token: "pink-300", hex: "#f9a8d4" },
  { token: "pink-400", hex: "#f472b6" },
  { token: "pink-500", hex: "#ec4899" },
  { token: "pink-600", hex: "#db2777" },
  { token: "pink-700", hex: "#be185d" },
  { token: "pink-800", hex: "#9d174d" },
  { token: "pink-900", hex: "#831843" },
  { token: "pink-950", hex: "#500724" },
  // rose
  { token: "rose-50", hex: "#fff1f2" },
  { token: "rose-100", hex: "#ffe4e6" },
  { token: "rose-200", hex: "#fecdd3" },
  { token: "rose-300", hex: "#fda4af" },
  { token: "rose-400", hex: "#fb7185" },
  { token: "rose-500", hex: "#f43f5e" },
  { token: "rose-600", hex: "#e11d48" },
  { token: "rose-700", hex: "#be123c" },
  { token: "rose-800", hex: "#9f1239" },
  { token: "rose-900", hex: "#881337" },
  { token: "rose-950", hex: "#4c0519" },
  // white/black
  { token: "white", hex: "#ffffff" },
  { token: "black", hex: "#000000" },
  { token: "transparent", hex: "#00000000" },
];

const COLOR_LABS = TAILWIND_COLORS.map(c => ({
  ...c,
  lab: (() => {
    try {
      return rgbToLab(hexToRgb(c.hex));
    } catch {
      return null;
    }
  })(),
}));

export function getNearestColor(hex: string): { token: string; heroUI?: string; deltaE: number } {
  hex = hex.toLowerCase().trim();
  if (!hex.startsWith("#")) hex = "#" + hex;
  if (hex.length === 4) hex = "#" + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
  if (hex === "#00000000" || hex === "transparent") return { token: "transparent", deltaE: 0 };

  try {
    const targetLab = rgbToLab(hexToRgb(hex));
    let bestToken = "unknown";
    let bestHeroUI: string | undefined;
    let bestDelta = Infinity;

    for (const entry of COLOR_LABS) {
      if (!entry.lab) continue;
      const d = deltaE2000(targetLab, entry.lab);
      if (d < bestDelta) {
        bestDelta = d;
        bestToken = entry.token;
        bestHeroUI = entry.heroUI;
      }
    }
    return { token: bestToken, heroUI: bestHeroUI, deltaE: bestDelta };
  } catch {
    return { token: "unknown", deltaE: 999 };
  }
}

export function rgbStringToHex(rgb: string): string {
  const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return "#000000";
  const r = parseInt(match[1]);
  const g = parseInt(match[2]);
  const b = parseInt(match[3]);
  return "#" + [r, g, b].map(v => v.toString(16).padStart(2, "0")).join("");
}
