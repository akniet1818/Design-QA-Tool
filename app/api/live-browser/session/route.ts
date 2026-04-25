import { NextRequest } from "next/server";
import { createLiveSession, destroyLiveSession } from "@/lib/live-sessions";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { url, cookies } = await req.json();
  if (!url) return new Response("Missing url", { status: 400 });
  try {
    const sessionId = await createLiveSession(url, cookies ?? "");
    return Response.json({ sessionId });
  } catch (err) {
    console.error("[live-browser/session]", err);
    return new Response(err instanceof Error ? err.message : "Failed to open browser", { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { sessionId } = await req.json();
  if (sessionId) await destroyLiveSession(sessionId);
  return new Response("ok");
}
