import type { ElementStyle, DesignBug, FigmaNodeStyle } from "@/types";
import { getNearestTailwindSpacing, getPaddingToken, getGapToken } from "@/lib/tokens/spacing-map";
import { severityByDelta } from "@/lib/utils/severity";
import { v4 as uuidv4 } from "uuid";

function parsePx(value: string): number {
  return parseFloat(value) || 0;
}

function parsePadding(padding: string): { top: number; right: number; bottom: number; left: number } {
  const parts = padding.trim().split(/\s+/).map(parsePx);
  if (parts.length === 1) return { top: parts[0], right: parts[0], bottom: parts[0], left: parts[0] };
  if (parts.length === 2) return { top: parts[0], right: parts[1], bottom: parts[0], left: parts[1] };
  if (parts.length === 3) return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[1] };
  return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[3] };
}

export function analyzeSpacingFromElements(
  stagingElements: ElementStyle[],
  figmaNodes?: FigmaNodeStyle[]
): DesignBug[] {
  const bugs: DesignBug[] = [];

  if (!figmaNodes?.length) return bugs;

  for (const stagingEl of stagingElements.slice(0, 50)) {
    const { rect } = stagingEl;
    if (rect.width < 10 || rect.height < 10) continue;

    const padding = parsePadding(stagingEl.padding);
    const gap = parsePx(stagingEl.gap);

    for (const [side, px] of Object.entries(padding) as [string, number][]) {
      if (px === 0) continue;
      const { delta, isExact, token } = getNearestTailwindSpacing(px);
      if (!isExact && delta > 2) {
        bugs.push({
          id: uuidv4(),
          type: "spacing",
          severity: severityByDelta(delta),
          location: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
          figmaValue: `${Math.round(px)}px`,
          stagingValue: `${Math.round(px)}px`,
          figmaTailwindToken: token,
          stagingTailwindToken: token,
          suggestedFix: `Adjust padding-${side} to nearest Tailwind token: ${getPaddingToken(px)}`,
          screenshot: "",
        });
      }
    }

    if (gap > 0) {
      const { delta, isExact, token } = getNearestTailwindSpacing(gap);
      if (!isExact && delta > 2) {
        bugs.push({
          id: uuidv4(),
          type: "spacing",
          severity: severityByDelta(delta),
          location: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
          figmaValue: `${Math.round(gap)}px gap`,
          stagingValue: `${Math.round(gap)}px gap`,
          figmaTailwindToken: token,
          stagingTailwindToken: token,
          suggestedFix: `Adjust gap to nearest Tailwind token: ${getGapToken(gap)}`,
          screenshot: "",
        });
      }
    }
  }

  return bugs;
}

export function analyzeSpacingFromFigma(
  stagingElements: ElementStyle[],
  figmaNodes: FigmaNodeStyle[]
): DesignBug[] {
  const bugs: DesignBug[] = [];

  for (const figmaNode of figmaNodes) {
    const { paddingTop = 0, paddingBottom = 0, paddingLeft = 0, paddingRight = 0, itemSpacing = 0 } = figmaNode;
    const stagingEl = stagingElements[0];
    if (!stagingEl) continue;

    const stagingPad = parsePadding(stagingEl.padding);
    const stagingGap = parsePx(stagingEl.gap);

    const pairs: [string, number, number][] = [
      ["padding-top", paddingTop, stagingPad.top],
      ["padding-bottom", paddingBottom, stagingPad.bottom],
      ["padding-left", paddingLeft, stagingPad.left],
      ["padding-right", paddingRight, stagingPad.right],
      ["gap", itemSpacing, stagingGap],
    ];

    for (const [label, figmaPx, stagingPx] of pairs) {
      const delta = Math.abs(figmaPx - stagingPx);
      if (delta < 1) continue;

      bugs.push({
        id: uuidv4(),
        type: "spacing",
        severity: severityByDelta(delta),
        location: { x: 0, y: 0, width: figmaNode.width ?? 0, height: figmaNode.height ?? 0 },
        figmaValue: `${figmaPx}px`,
        stagingValue: `${stagingPx}px`,
        figmaTailwindToken: getPaddingToken(figmaPx),
        stagingTailwindToken: getPaddingToken(stagingPx),
        suggestedFix: `Change ${label}: ${stagingPx}px → ${figmaPx}px (${getPaddingToken(figmaPx)})`,
        screenshot: "",
      });
    }
  }

  return bugs;
}
