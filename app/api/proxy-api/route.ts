import { NextRequest } from "next/server";
import { getSession } from "@/lib/proxy-sessions";

export const runtime = "nodejs";
export const maxDuration = 30;

async function handleProxy(req: NextRequest): Promise<Response> {
  const params = new URL(req.url).searchParams;
  const sessionId = params.get("s");
  const path = params.get("p");

  if (!path) return new Response("Missing path", { status: 400 });

  const session = sessionId ? getSession(sessionId) : null;
  if (!session) return new Response("Session not found", { status: 400 });

  const baseOrigin = new URL(session.url).origin;
  const targetUrl = path.startsWith("http") ? path : baseOrigin + path;

  const forwardHeaders: Record<string, string> = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/124.0 Safari/537.36",
    "Accept": req.headers.get("accept") ?? "*/*",
    "Accept-Language": req.headers.get("accept-language") ?? "en-US,en;q=0.9",
    "Cache-Control": "no-cache",
  };
  if (session.cookies) forwardHeaders["Cookie"] = session.cookies;
  const auth = req.headers.get("authorization");
  if (auth) forwardHeaders["Authorization"] = auth;
  const ct = req.headers.get("content-type");
  if (ct) forwardHeaders["Content-Type"] = ct;

  const body = ["GET", "HEAD"].includes(req.method) ? undefined : await req.arrayBuffer();

  try {
    const res = await fetch(targetUrl, {
      method: req.method,
      headers: forwardHeaders,
      body: body && body.byteLength > 0 ? body : undefined,
      redirect: "follow",
    });

    const out = new Headers();
    ["content-type", "content-length", "cache-control", "set-cookie"].forEach(h => {
      const v = res.headers.get(h);
      if (v) out.set(h, v);
    });
    out.set("Access-Control-Allow-Origin", "*");
    out.set("Access-Control-Allow-Methods", "*");
    out.set("Access-Control-Allow-Headers", "*");

    return new Response(res.body, { status: res.status, headers: out });
  } catch (err) {
    return new Response(err instanceof Error ? err.message : "API proxy failed", { status: 500 });
  }
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const PATCH = handleProxy;
export const DELETE = handleProxy;

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    },
  });
}
