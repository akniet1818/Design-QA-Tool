import { chromium } from "playwright-core";
import { bufferToBase64 } from "@/lib/utils/image";
import type { ElementStyle } from "@/types";

const API_KEY = process.env.BROWSERBASE_API_KEY!;
const PROJECT_ID = process.env.BROWSERBASE_PROJECT_ID!;

export interface ViewportSize { width: number; height: number }

export async function captureScreenshot(
  url: string,
  viewport: ViewportSize,
  cookieHeader?: string
): Promise<{ screenshot: string; elements: ElementStyle[] }> {
  const createRes = await fetch("https://www.browserbase.com/v1/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-BB-API-Key": API_KEY },
    body: JSON.stringify({
      projectId: PROJECT_ID,
      browserSettings: { viewport, timeout: 120 },
    }),
  });
  if (!createRes.ok) throw new Error(`Browserbase: ${await createRes.text()}`);
  const { id: sessionId } = await createRes.json();

  const browser = await chromium.connectOverCDP(
    `wss://connect.browserbase.com?apiKey=${API_KEY}&sessionId=${sessionId}`
  );
  try {
    const context = browser.contexts()[0];

    if (cookieHeader) {
      const separator = cookieHeader.includes("; ") ? "; " : /;\s*/.test(cookieHeader) ? /;\s*/ : "; ";
      const pairs = cookieHeader.split(separator);
      const cookies = pairs
        .map(pair => {
          const eqIdx = pair.indexOf("=");
          if (eqIdx <= 0) return null;
          const name = pair.slice(0, eqIdx).trim();
          const value = pair.slice(eqIdx + 1).trim();
          if (!name || /[^\w!#$%&'*+\-.^`|~]/.test(name)) return null;
          return { name, value, url };
        })
        .filter((c): c is { name: string; value: string; url: string } => c !== null);
      if (cookies.length > 0) await context.addCookies(cookies);
    }

    const page = context.pages()[0];
    await page.setViewportSize(viewport);
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(2500);

    const elements: ElementStyle[] = await page.evaluate(() => {
      return Array.from(document.querySelectorAll("*"))
        .filter(el => {
          const rect = el.getBoundingClientRect();
          return rect.width > 5 && rect.height > 5;
        })
        .slice(0, 200)
        .map(el => {
          const rect = el.getBoundingClientRect();
          const styles = getComputedStyle(el);
          return {
            tag: el.tagName,
            rect: {
              x: rect.x, y: rect.y,
              width: rect.width, height: rect.height,
              top: rect.top, left: rect.left,
              bottom: rect.bottom, right: rect.right,
            },
            fontSize: styles.fontSize,
            fontWeight: styles.fontWeight,
            fontFamily: styles.fontFamily,
            color: styles.color,
            backgroundColor: styles.backgroundColor,
            padding: styles.padding,
            margin: styles.margin,
            gap: styles.gap,
            letterSpacing: styles.letterSpacing,
            lineHeight: styles.lineHeight,
          };
        });
    });

    const buf = await page.screenshot({ fullPage: true });
    return { screenshot: bufferToBase64(buf as Buffer), elements };
  } finally {
    await browser.close();
    await fetch(`https://www.browserbase.com/v1/sessions/${sessionId}`, {
      method: "DELETE",
      headers: { "X-BB-API-Key": API_KEY },
    }).catch(() => {});
  }
}
