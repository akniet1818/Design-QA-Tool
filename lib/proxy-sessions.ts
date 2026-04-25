// Stateless: session data is encoded inside the token itself.
// No server-side Map → no module-isolation issues with Next.js Turbopack.

export function createSession(url: string, cookies: string): string {
  return Buffer.from(JSON.stringify({ url, cookies })).toString("base64url");
}

export function getSession(token: string): { url: string; cookies: string } | null {
  try {
    const data = JSON.parse(Buffer.from(token, "base64url").toString("utf8"));
    if (typeof data?.url !== "string") return null;
    return { url: data.url, cookies: data.cookies ?? "" };
  } catch {
    return null;
  }
}
