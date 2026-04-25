export const TEXT_SIZES: Record<number, string> = {
  12: "text-xs",
  14: "text-sm",
  16: "text-base",
  18: "text-lg",
  20: "text-xl",
  24: "text-2xl",
  30: "text-3xl",
  36: "text-4xl",
  48: "text-5xl",
  60: "text-6xl",
  72: "text-7xl",
  96: "text-8xl",
  128: "text-9xl",
};

export const FONT_WEIGHTS: Record<number, string> = {
  100: "font-thin",
  200: "font-extralight",
  300: "font-light",
  400: "font-normal",
  500: "font-medium",
  600: "font-semibold",
  700: "font-bold",
  800: "font-extrabold",
  900: "font-black",
};

export const LEADING: Record<number, string> = {
  12: "leading-none",
  16: "leading-tight",
  20: "leading-snug",
  24: "leading-normal",
  28: "leading-relaxed",
  32: "leading-loose",
};

export const LEADING_MULTIPLIERS: Record<string, number> = {
  "leading-none": 1,
  "leading-tight": 1.25,
  "leading-snug": 1.375,
  "leading-normal": 1.5,
  "leading-relaxed": 1.625,
  "leading-loose": 2,
};

export const TRACKING: Record<number, string> = {
  [-0.8]: "tracking-tighter",
  [-0.4]: "tracking-tight",
  [0]: "tracking-normal",
  [0.4]: "tracking-wide",
  [0.8]: "tracking-wider",
  [1.6]: "tracking-widest",
};

const TEXT_SIZE_VALUES = Object.keys(TEXT_SIZES).map(Number);
const FONT_WEIGHT_VALUES = Object.keys(FONT_WEIGHTS).map(Number);
const LEADING_ENTRIES = Object.entries(LEADING_MULTIPLIERS) as [string, number][];
const TRACKING_VALUES = Object.keys(TRACKING).map(Number);

export function getNearestTextSize(px: number): string {
  const nearest = TEXT_SIZE_VALUES.reduce((a, b) =>
    Math.abs(b - px) < Math.abs(a - px) ? b : a
  );
  return TEXT_SIZES[nearest];
}

export function getNearestFontWeight(weight: number): string {
  const nearest = FONT_WEIGHT_VALUES.reduce((a, b) =>
    Math.abs(b - weight) < Math.abs(a - weight) ? b : a
  );
  return FONT_WEIGHTS[nearest];
}

export function getNearestLeading(lineHeightPx: number, fontSizePx: number): string {
  if (fontSizePx === 0) return "leading-normal";
  const ratio = lineHeightPx / fontSizePx;
  const nearest = LEADING_ENTRIES.reduce((a, b) =>
    Math.abs(b[1] - ratio) < Math.abs(a[1] - ratio) ? b : a
  );
  return nearest[0];
}

export function getNearestTracking(letterSpacingPx: number): string {
  const nearest = TRACKING_VALUES.reduce((a, b) =>
    Math.abs(b - letterSpacingPx) < Math.abs(a - letterSpacingPx) ? b : a
  );
  return TRACKING[nearest];
}
