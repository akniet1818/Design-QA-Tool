import { NextRequest } from "next/server";
import { captureScreenshot } from "@/lib/playwright/screenshot";
import { VIEWPORTS } from "@/types";
import type { Viewport } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { url, viewport = "desktop", cookies } = await req.json();
    if (!url) return new Response("Missing url", { status: 400 });

    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return new Response("Only http/https URLs allowed", { status: 400 });
    }

    const { width, height } = VIEWPORTS[viewport as Viewport] ?? VIEWPORTS.desktop;
    const result = await captureScreenshot(url, { width, height }, cookies || undefined);

    return Response.json(result);
  } catch (err) {
    console.error("[screenshot]", err);
    return new Response(err instanceof Error ? err.message : "Screenshot failed", { status: 500 });
  }
}
