import { NextRequest } from "next/server";
import { generateDiff } from "@/lib/analysis/pixelmatch";
import { detectColorBugs } from "@/lib/analysis/color-analysis";
import type { AnalysisResult, DesignBug } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { figmaImage, stagingImage, viewport, colorThreshold = 5 } = await req.json();

    if (!figmaImage || !stagingImage) {
      return new Response("Missing figmaImage or stagingImage", { status: 400 });
    }

    const { diffImageBase64, diffPercentage, width, height } = await generateDiff(
      figmaImage,
      stagingImage,
      0.1
    );

    const colorBugs: DesignBug[] = await detectColorBugs(
      figmaImage,
      stagingImage,
      colorThreshold,
      width,
      height
    );

    const allBugs = [...colorBugs].sort((a, b) => {
      const order = { critical: 0, warning: 1, info: 2 };
      return order[a.severity] - order[b.severity];
    });

    const result: AnalysisResult = {
      figmaImageUrl: figmaImage,
      stagingImageUrl: stagingImage,
      diffImageUrl: diffImageBase64,
      diffPercentage,
      bugs: allBugs,
      viewport,
      analyzedAt: new Date().toISOString(),
    };

    return Response.json(result);
  } catch (err) {
    console.error("[analyze]", err);
    return new Response(
      err instanceof Error ? err.message : "Analysis failed",
      { status: 500 }
    );
  }
}
