import { chromium, type Page } from "playwright";

const VIEWPORT = { width: 1280, height: 800 };

const COOKIE_ATTR_NAMES = new Set([
  "path", "domain", "expires", "max-age", "secure", "httponly", "samesite",
]);

interface Session {
  page: Page;
  lastActivity: number;
}

// Module-level map persists across requests in a persistent Node.js process (next dev, Railway, Render, etc.)
declare global { var __liveSessions: Map<string, Session> | undefined; }
const sessions: Map<string, Session> = (globalThis.__liveSessions ??= new Map());

// Auto-close sessions idle for > 10 minutes
setInterval(() => {
  const cutoff = Date.now() - 10 * 60_000;
  for (const [id, s] of sessions) {
    if (s.lastActivity < cutoff) {
      s.page.context().browser()?.close().catch(() => {});
      sessions.delete(id);
    }
  }
}, 60_000).unref();

function parseCookies(raw: string, origin: string) {
  return raw
    .split(/[\r\n]+/)
    .flatMap(line => line.split(";"))
    .map(s => s.trim())
    .filter(s => {
      if (!s || !s.includes("=")) return false;
      const name = s.slice(0, s.indexOf("=")).trim().toLowerCase();
      return !COOKIE_ATTR_NAMES.has(name);
    })
    .map(s => {
      const eq = s.indexOf("=");
      return { name: s.slice(0, eq).trim(), value: s.slice(eq + 1).trim(), url: origin };
    });
}

export async function createLiveSession(url: string, cookies: string): Promise<string> {
  const id = crypto.randomUUID();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: VIEWPORT });

  if (cookies) {
    const parsed = parseCookies(cookies, new URL(url).origin);
    if (parsed.length) await context.addCookies(parsed);
  }

  const page = await context.newPage();
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 });
  await page.waitForTimeout(2000);

  sessions.set(id, { page, lastActivity: Date.now() });
  return id;
}

export function getLiveSession(id: string): Session | null {
  const s = sessions.get(id);
  if (!s) return null;
  s.lastActivity = Date.now();
  return s;
}

export async function destroyLiveSession(id: string) {
  const s = sessions.get(id);
  if (!s) return;
  sessions.delete(id);
  await s.page.context().browser()?.close().catch(() => {});
}

export const BROWSER_VIEWPORT = VIEWPORT;
