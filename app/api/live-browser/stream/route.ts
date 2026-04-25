import { NextRequest } from "next/server";
import { connectToLiveSession } from "@/lib/live-sessions";

export const runtime = "nodejs";
export const maxDuration = 300;

const BOUNDARY = "mjpegboundary";

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("s");
  if (!sessionId) return new Response("Missing session", { status: 400 });

  let handle: Awaited<ReturnType<typeof connectToLiveSession>>;
  try {
    handle = await connectToLiveSession(sessionId);
  } catch {
    return new Response("Session not found or could not connect", { status: 404 });
  }

  const { browser, page } = handle;
  let closed = false;
  req.signal.addEventListener("abort", () => { closed = true; });

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      try {
        while (!closed) {
          try {
            const buf = await page.screenshot({ type: "jpeg", quality: 70 });
            controller.enqueue(enc.encode(`--${BOUNDARY}\r\nContent-Type: image/jpeg\r\nContent-Length: ${buf.byteLength}\r\n\r\n`));
            controller.enqueue(buf);
            controller.enqueue(enc.encode("\r\n"));
          } catch {
            break;
          }
          await new Promise(r => setTimeout(r, 100));
        }
      } finally {
        await browser.close().catch(() => {}); // disconnect CDP — remote browser stays alive
        try { controller.close(); } catch { /* already closed */ }
      }
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
