import { chromium } from "playwright";
import { bufferToBase64 } from "@/lib/utils/image";
import type { ElementStyle } from "@/types";

export interface ViewportSize { width: number; height: number }

export async function captureScreenshot(
  url: string,
  viewport: ViewportSize,
  cookieHeader?: string
): Promise<{ screenshot: string; elements: ElementStyle[] }> {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext();

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

    const page = await context.newPage();
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
  }
}
