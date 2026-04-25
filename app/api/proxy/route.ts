import { NextRequest } from "next/server";
import { getSession } from "@/lib/proxy-sessions";

export const runtime = "nodejs";
export const maxDuration = 30;

const API_PROXY_PATH = "/api/proxy-api";

const COOKIE_ATTR_NAMES = new Set([
  "path", "domain", "expires", "max-age", "secure", "httponly", "samesite",
]);

// Normalize a raw cookie string pasted from DevTools (any format) into a clean Cookie header value.
function normalizeCookies(raw: string): string {
  return raw
    .split(/[\r\n]+/)            // handle newline-separated (Application tab copy)
    .flatMap(line => line.split(";"))
    .map(s => s.trim())
    .filter(s => {
      if (!s || !s.includes("=")) return false;
      const name = s.slice(0, s.indexOf("=")).trim().toLowerCase();
      return !COOKIE_ATTR_NAMES.has(name);
    })
    .join("; ");
}

function buildAuthScript(sessionId: string, cookies: string, targetOrigin: string): string {
  const sid = JSON.stringify(sessionId);
  const origin = JSON.stringify(targetOrigin);
  const api = JSON.stringify(API_PROXY_PATH);
  const cookiePairs = JSON.stringify(
    cookies.split(";").map(c => c.trim()).filter(Boolean)
  );
  return `<script>(function(){
var _s=${sid},_o=${origin},_a=${api};
${cookiePairs}.forEach(function(c){try{document.cookie=c+';path=/';}catch(e){}});
var _f=window.fetch;
window.fetch=function(u,opts){
  if(typeof u==='string'){
    if(u[0]==='/')u=_a+'?s='+_s+'&p='+encodeURIComponent(u);
    else if(u.indexOf(_o)===0)u=_a+'?s='+_s+'&p='+encodeURIComponent(u.slice(_o.length)||'/');
  } else if(u && typeof u==='object' && u.url){
    var url=u.url;
    if(url[0]==='/')u=new Request(_a+'?s='+_s+'&p='+encodeURIComponent(url),u);
    else if(url.indexOf(_o)===0)u=new Request(_a+'?s='+_s+'&p='+encodeURIComponent(url.slice(_o.length)||'/'),u);
  }
  return _f.call(this,u,opts);
};
var _x=XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open=function(){
  var args=Array.prototype.slice.call(arguments);
  if(typeof args[1]==='string'){
    if(args[1][0]==='/')args[1]=_a+'?s='+_s+'&p='+encodeURIComponent(args[1]);
    else if(args[1].indexOf(_o)===0)args[1]=_a+'?s='+_s+'&p='+encodeURIComponent(args[1].slice(_o.length)||'/');
  }
  return _x.apply(this,args);
};
})();</script>`;
}

const ERROR_HTML = (msg: string) =>
  `<html><body style="font-family:system-ui,sans-serif;padding:2rem;color:#71717a;background:#09090b">
    <p style="font-size:14px">⚠ ${msg}</p>
    <p style="font-size:12px;margin-top:.5rem">Re-enter your staging URL in the left panel to reload.</p>
  </body></html>`;

export async function GET(req: NextRequest) {
  const params = new URL(req.url).searchParams;

  // Session-based lookup (preferred — no secrets in URL)
  let targetUrl: string | null = null;
  let cookieHeader = "";
  const sessionId = params.get("s");
  if (sessionId) {
    const session = getSession(sessionId);
    if (session) { targetUrl = session.url; cookieHeader = normalizeCookies(session.cookies); }
  }

  // Fall back to direct params (backward compat)
  if (!targetUrl) {
    targetUrl = params.get("url");
    cookieHeader = normalizeCookies(params.get("cookies") ?? "");
  }

  if (!targetUrl) {
    return new Response(ERROR_HTML("Live preview session expired or URL missing."), {
      status: 400,
      headers: { "content-type": "text/html" },
    });
  }

  let parsed: URL;
  try {
    parsed = new URL(targetUrl);
  } catch {
    return new Response(ERROR_HTML("Invalid URL."), {
      status: 400,
      headers: { "content-type": "text/html" },
    });
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return new Response("Only http/https allowed", { status: 400 });
  }

  try {
    const res = await fetch(targetUrl, {
      headers: {
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Cache-Control": "no-cache",
      },
      redirect: "follow",
    });

    const contentType = res.headers.get("content-type") ?? "text/html";
    const outHeaders = new Headers();
    outHeaders.set("content-type", contentType);
    outHeaders.set("cache-control", "no-store");
    // Deliberately omit X-Frame-Options and Content-Security-Policy
    // so the browser allows our iframe to display the response.

    if (contentType.includes("text/html")) {
      let html = await res.text();

      const origin = `${parsed.protocol}//${parsed.host}`;
      const baseTag = `<base href="${origin}/">`;
      const authScript = cookieHeader && sessionId
        ? buildAuthScript(sessionId, cookieHeader, origin)
        : "";
      const headInjection = baseTag + authScript;
      if (/<head[\s>]/i.test(html)) {
        html = html.replace(/<head(\s[^>]*)?>/i, (m) => `${m}${headInjection}`);
      } else {
        html = headInjection + html;
      }

      return new Response(html, { status: 200, headers: outHeaders });
    }

    // Non-HTML assets: proxy bytes through unchanged
    const body = await res.arrayBuffer();
    return new Response(body, { status: res.status, headers: outHeaders });
  } catch (err) {
    return new Response(
      err instanceof Error ? err.message : "Proxy failed",
      { status: 500 }
    );
  }
}
