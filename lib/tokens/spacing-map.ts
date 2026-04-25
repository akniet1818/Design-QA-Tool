export const TAILWIND_SPACING: Record<number, string> = {
  0: "0",
  2: "0.5",
  4: "1",
  6: "1.5",
  8: "2",
  10: "2.5",
  12: "3",
  14: "3.5",
  16: "4",
  20: "5",
  24: "6",
  28: "7",
  32: "8",
  36: "9",
  40: "10",
  44: "11",
  48: "12",
  56: "14",
  64: "16",
  80: "20",
  96: "24",
  112: "28",
  128: "32",
  144: "36",
  160: "40",
  176: "44",
  192: "48",
  208: "52",
  224: "56",
  240: "60",
  256: "64",
  288: "72",
  320: "80",
  384: "96",
};

const SPACING_VALUES = Object.keys(TAILWIND_SPACING).map(Number).sort((a, b) => a - b);

export function getNearestTailwindSpacing(px: number): {
  token: string;
  scale: string;
  delta: number;
  isExact: boolean;
} {
  if (px < 0) px = Math.abs(px);
  const nearest = SPACING_VALUES.reduce((a, b) =>
    Math.abs(b - px) < Math.abs(a - px) ? b : a
  );
  const scale = TAILWIND_SPACING[nearest];
  return {
    token: `space-${scale}`,
    scale,
    delta: Math.abs(nearest - px),
    isExact: nearest === px,
  };
}

export function getPaddingToken(px: number): string {
  const { scale } = getNearestTailwindSpacing(px);
  return `p-${scale}`;
}

export function getMarginToken(px: number): string {
  const { scale } = getNearestTailwindSpacing(px);
  return `m-${scale}`;
}

export function getGapToken(px: number): string {
  const { scale } = getNearestTailwindSpacing(px);
  return `gap-${scale}`;
}

export function getSizeToken(px: number, dimension: "w" | "h"): string {
  const { scale } = getNearestTailwindSpacing(px);
  return `${dimension}-${scale}`;
}
