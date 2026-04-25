import { WebClient } from "@slack/web-api";

export const runtime = "nodejs";

export async function GET() {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) {
    return Response.json({ ok: false, error: "SLACK_BOT_TOKEN not set in .env.local" });
  }
  try {
    const slack = new WebClient(token);
    const res = await slack.auth.test();
    return Response.json({ ok: true, team: res.team, bot: res.user });
  } catch (err) {
    return Response.json({ ok: false, error: err instanceof Error ? err.message : "Auth failed" });
  }
}
