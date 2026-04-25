import { chromium } from "playwright-core";

const VIEWPORT = { width: 1280, height: 800 };
const API_KEY = process.env.BROWSERBASE_API_KEY!;
const PROJECT_ID = process.env.BROWSERBASE_PROJECT_ID!;
const BB_BASE = "https://www.browserbase.com";

const COOKIE_ATTR_NAMES = new Set([
  "path", "domain", "expires", "max-age", "secure", "httponly", "samesite",
]);

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

// Creates a remote Browserbase session, navigates to the URL, sets cookies,
// then disconnects the CDP client (browser stays alive in Browserbase).
// Returns the Browserbase sessionId — no global Map needed.
export async function createLiveSession(url: string, cookies: string): Promise<string> {
  const r = await fetch(`${BB_BASE}/v1/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-BB-API-Key": API_KEY },
    body: JSON.stringify({
      projectId: PROJECT_ID,
      browserSettings: { viewport: VIEWPORT, timeout: 600 },
    }),
  });
  if (!r.ok) throw new Error(`Browserbase: ${await r.text()}`);
  const { id: sessionId } = await r.json();

  const browser = await chromium.connectOverCDP(
    `wss://connect.browserbase.com?apiKey=${API_KEY}&sessionId=${sessionId}`
  );
  try {
    const context = browser.contexts()[0];
    if (cookies) {
      const parsed = parseCookies(cookies, new URL(url).origin);
      if (parsed.length) await context.addCookies(parsed);
    }
    const page = context.pages()[0];
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 });
    await page.waitForTimeout(2000);
  } finally {
    await browser.close(); // disconnect CDP — remote browser stays alive in Browserbase
  }
  return sessionId;
}

// Reconnects to an existing Browserbase session via CDP.
// Caller is responsible for calling browser.close() when done.
export async function connectToLiveSession(sessionId: string) {
  const browser = await chromium.connectOverCDP(
    `wss://connect.browserbase.com?apiKey=${API_KEY}&sessionId=${sessionId}`
  );
  const context = browser.contexts()[0];
  const page = context.pages()[0];
  return { browser, context, page };
}

export async function destroyLiveSession(sessionId: string) {
  await fetch(`${BB_BASE}/v1/sessions/${sessionId}`, {
    method: "DELETE",
    headers: { "X-BB-API-Key": API_KEY },
  }).catch(() => {});
}

export const BROWSER_VIEWPORT = VIEWPORT;
