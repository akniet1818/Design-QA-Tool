import { NextRequest } from "next/server";
import { connectToLiveSession } from "@/lib/live-sessions";
import type { Browser, Page } from "playwright-core";

export const runtime = "nodejs";

// Per-instance connection cache — reuse CDP connections for rapid consecutive events (e.g. typing).
// Evicted after 5 seconds of inactivity.
const cache = new Map<string, { browser: Browser; page: Page; timer: ReturnType<typeof setTimeout> }>();

async function getConn(sessionId: string) {
  const hit = cache.get(sessionId);
  if (hit) {
    clearTimeout(hit.timer);
    hit.timer = setTimeout(() => evict(sessionId), 5000);
    return hit;
  }
  const conn = await connectToLiveSession(sessionId);
  const entry = { ...conn, timer: setTimeout(() => evict(sessionId), 5000) };
  cache.set(sessionId, entry);
  return entry;
}

function evict(id: string) {
  const e = cache.get(id);
  if (!e) return;
  cache.delete(id);
  e.browser.close().catch(() => {});
}

export async function POST(req: NextRequest) {
  const { sessionId, type, x, y, deltaX, deltaY, key } = await req.json();
  if (!sessionId) return new Response("Missing sessionId", { status: 400 });

  let conn: { page: Page };
  try {
    conn = await getConn(sessionId);
  } catch {
    return new Response("Session not found", { status: 404 });
  }

  const { page } = conn;
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
