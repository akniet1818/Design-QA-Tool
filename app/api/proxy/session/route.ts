import { NextRequest } from "next/server";
import { createSession } from "@/lib/proxy-sessions";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { url, cookies = "" } = await req.json() as { url: string; cookies?: string };
  if (!url) return Response.json({ error: "url required" }, { status: 400 });
  const sessionId = createSession(url, cookies);
  return Response.json({ sessionId });
}
