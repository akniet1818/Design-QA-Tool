import { NextRequest } from "next/server";
import { getLiveSession } from "@/lib/live-sessions";

export const runtime = "nodejs";
export const maxDuration = 300;

const BOUNDARY = "mjpegboundary";

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("s");
  if (!sessionId) return new Response("Missing session", { status: 400 });

  const session = getLiveSession(sessionId);
  if (!session) return new Response("Session not found or expired", { status: 404 });

  let closed = false;
  req.signal.addEventListener("abort", () => { closed = true; });

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      while (!closed) {
        try {
          const buf = await session.page.screenshot({ type: "jpeg", quality: 70 });
          controller.enqueue(enc.encode(`--${BOUNDARY}\r\nContent-Type: image/jpeg\r\nContent-Length: ${buf.byteLength}\r\n\r\n`));
          controller.enqueue(buf);
          controller.enqueue(enc.encode("\r\n"));
        } catch {
          break;
        }
        await new Promise(r => setTimeout(r, 100));
      }
      try { controller.close(); } catch { /* already closed */ }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": `multipart/x-mixed-replace; boundary=${BOUNDARY}`,
      "Cache-Control": "no-cache, no-store",
      "Connection": "keep-alive",
    },
  });
}
