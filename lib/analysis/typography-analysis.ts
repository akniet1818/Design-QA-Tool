import type { ElementStyle, DesignBug, FigmaNodeStyle } from "@/types";
import {
  getNearestTextSize,
  getNearestFontWeight,
  getNearestLeading,
  getNearestTracking,
} from "@/lib/tokens/typography-map";
import { v4 as uuidv4 } from "uuid";

function parsePx(v: string): number { return parseFloat(v) || 0; }

export function analyzeTypographyFromElements(
  stagingElements: ElementStyle[],
  figmaNodes?: FigmaNodeStyle[]
): DesignBug[] {
  const bugs: DesignBug[] = [];
  if (!figmaNodes?.length) return bugs;

  const textEls = stagingElements.filter(el =>
    ["P", "H1", "H2", "H3", "H4", "H5", "H6", "SPAN", "A", "LABEL", "LI"].includes(el.tag)
  ).slice(0, 30);

  for (let i = 0; i < Math.min(textEls.length, figmaNodes.length); i++) {
    const el = textEls[i];
    const node = figmaNodes[i];
    const { rect } = el;

    const stagingFontSizePx = parsePx(el.fontSize);
    const stagingFontWeight = parsePx(el.fontWeight);
    const stagingLineHeightPx = parsePx(el.lineHeight);
    const stagingLetterSpacingPx = parsePx(el.letterSpacing);

    const figmaFontSizePx = node.fontSize ?? stagingFontSizePx;
    const figmaFontWeight = node.fontWeight ?? stagingFontWeight;

    if (Math.abs(figmaFontSizePx - stagingFontSizePx) > 1) {
      bugs.push({
        id: uuidv4(),
        type: "typography",
        severity: "warning",
        location: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
        figmaValue: `${figmaFontSizePx}px`,
        stagingValue: `${stagingFontSizePx}px`,
        figmaTailwindToken: getNearestTextSize(figmaFontSizePx),
        stagingTailwindToken: getNearestTextSize(stagingFontSizePx),
        suggestedFix: `Change font-size to ${getNearestTextSize(figmaFontSizePx)}`,
        screenshot: "",
      });
    }

    if (Math.abs(figmaFontWeight - stagingFontWeight) >= 100) {
      bugs.push({
        id: uuidv4(),
        type: "typography",
        severity: "warning",
        location: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
        figmaValue: `${figmaFontWeight}`,
        stagingValue: `${stagingFontWeight}`,
        figmaTailwindToken: getNearestFontWeight(figmaFontWeight),
        stagingTailwindToken: getNearestFontWeight(stagingFontWeight),
        suggestedFix: `Change font-weight to ${getNearestFontWeight(figmaFontWeight)}`,
        screenshot: "",
      });
    }

    if (node.fontFamily && !el.fontFamily.toLowerCase().includes(node.fontFamily.toLowerCase())) {
      bugs.push({
        id: uuidv4(),
        type: "typography",
        severity: "critical",
        location: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
        figmaValue: node.fontFamily,
        stagingValue: el.fontFamily,
        figmaTailwindToken: "font-sans",
        stagingTailwindToken: "font-sans",
        suggestedFix: `Font family mismatch: expected "${node.fontFamily}", got "${el.fontFamily}"`,
        screenshot: "",
      });
    }
  }

  return bugs;
}
