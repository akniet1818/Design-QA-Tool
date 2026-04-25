export type Viewport = "desktop" | "tablet" | "mobile";
export type BugType =
  | "spacing"
  | "typography"
  | "color"
  | "sizing"
  | "border-radius"
  | "shadow";
export type Severity = "critical" | "warning" | "info";

export interface DesignBug {
  id: string;
  type: BugType;
  severity: Severity;
  location: { x: number; y: number; width: number; height: number };
  figmaValue: string;
  stagingValue: string;
  figmaTailwindToken: string;
  stagingTailwindToken: string;
  suggestedFix: string;
  screenshot: string;
}

export interface AnalysisResult {
  figmaImageUrl: string;
  stagingImageUrl: string;
  diffImageUrl: string;
  diffPercentage: number;
  bugs: DesignBug[];
  viewport: Viewport;
  analyzedAt: string;
}

export interface ElementStyle {
  tag: string;
  rect: { x: number; y: number; width: number; height: number; top: number; left: number; bottom: number; right: number };
  fontSize: string;
  fontWeight: string;
  fontFamily: string;
  color: string;
  backgroundColor: string;
  padding: string;
  margin: string;
  gap: string;
  letterSpacing: string;
  lineHeight: string;
}

export interface FigmaNodeStyle {
  id: string;
  name: string;
  fills?: Array<{ type: string; color?: { r: number; g: number; b: number; a: number } }>;
  fontSize?: number;
  fontWeight?: number;
  fontFamily?: string;
  lineHeight?: number | { value: number; unit: string };
  letterSpacing?: number | { value: number; unit: string };
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  itemSpacing?: number;
  width?: number;
  height?: number;
}

export interface ColorSample {
  x: number;
  y: number;
  hex: string;
  tailwindToken: string;
  heroUIToken?: string;
  deltaE?: number;
}

export interface AnalysisStatus {
  status: "idle" | "loading" | "success" | "error";
  error?: string;
  progress?: string;
}

export interface ViewportConfig {
  label: string;
  width: number;
  height: number;
}

export const VIEWPORTS: Record<Viewport, ViewportConfig> = {
  desktop: { label: "Desktop", width: 1440, height: 900 },
  tablet: { label: "Tablet", width: 768, height: 1024 },
  mobile: { label: "Mobile", width: 375, height: 812 },
};
