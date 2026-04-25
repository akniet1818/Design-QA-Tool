import { NextRequest } from "next/server";
import { generateAiSummary } from "@/lib/claude/summary";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { bugs } = await req.json();
    if (!bugs?.length) return new Response("No bugs provided", { status: 400 });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey === "your_anthropic_api_key_here") {
      return new Response("ANTHROPIC_API_KEY not configured", { status: 503 });
    }

    const summary = await generateAiSummary(bugs);
    return Response.json({ summary });
  } catch (err) {
    console.error("[ai-summary]", err);
    return new Response(err instanceof Error ? err.message : "AI summary failed", { status: 500 });
  }
}
