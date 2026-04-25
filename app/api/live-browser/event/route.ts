import { NextRequest } from "next/server";
import { getLiveSession } from "@/lib/live-sessions";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { sessionId, type, x, y, deltaX, deltaY, key } = await req.json();
  const session = getLiveSession(sessionId);
  if (!session) return new Response("Session not found", { status: 404 });

  const { page } = session;
  try {
    switch (type) {
      case "click":
        await page.mouse.click(x, y);
        break;
      case "scroll":
        await page.mouse.wheel(deltaX ?? 0, deltaY ?? 0);
        break;
      case "keydown":
        await page.keyboard.press(key);
        break;
    }
  } catch (err) {
    console.error("[live-browser/event]", err);
  }

  return new Response("ok");
}
