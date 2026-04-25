/*
  SLACK SETUP:
  1. Go to api.slack.com/apps → Create New App → From Scratch
  2. Under "OAuth & Permissions" add Bot Token Scopes:
       chat:write  |  files:write  |  channels:read  |  groups:read
  3. Install app to your workspace
  4. Copy "Bot User OAuth Token" → set as SLACK_BOT_TOKEN in .env.local
  5. Set SLACK_DEFAULT_CHANNEL=#design-qa in .env.local
  6. Invite the bot to your channel: /invite @your-bot-name
*/

import { NextRequest } from "next/server";
import { WebClient, type KnownBlock } from "@slack/web-api";
import type { DesignBug } from "@/types";

export const runtime = "nodejs";

const SEVERITY_EMOJI: Record<string, string> = {
  critical: "🔴",
  warning: "🟡",
  info: "🔵",
};

function tokenLabel(token: string, raw: string): string {
  return token ? `${token} (${raw})` : raw;
}

function bugLine(bug: DesignBug): string {
  return [
    `• [${bug.severity.toUpperCase()}] ${bug.type}`,
    `  Expected (Figma):  ${tokenLabel(bug.figmaTailwindToken, bug.figmaValue)}`,
    `  Found (Staging):   ${tokenLabel(bug.stagingTailwindToken, bug.stagingValue)}`,
    `  Fix: ${bug.suggestedFix}`,
  ].join("\n");
}

export async function POST(req: NextRequest) {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) {
    return Response.json({ error: "SLACK_BOT_TOKEN not configured in .env.local" }, { status: 500 });
  }

  const { bugs, stagingUrl, figmaUrl, channel, viewport, diffPercentage } = await req.json() as {
    bugs: DesignBug[];
    stagingUrl: string;
    figmaUrl: string;
    channel: string;
    viewport: string;
    diffPercentage: number;
  };

  const slack = new WebClient(token);
  const ch = channel || process.env.SLACK_DEFAULT_CHANNEL || "#design-qa";

  const critical = bugs.filter(b => b.severity === "critical");
  const warnings = bugs.filter(b => b.severity === "warning");
  const info = bugs.filter(b => b.severity === "info");

  const summaryText = bugs.length === 0
    ? "✅ No design bugs found — implementation matches the Figma design!"
    : `${SEVERITY_EMOJI.critical} Critical: ${critical.length}  |  ${SEVERITY_EMOJI.warning} Warning: ${warnings.length}  |  ${SEVERITY_EMOJI.info} Info: ${info.length}  |  Total: ${bugs.length} bugs  |  Diff: ${diffPercentage.toFixed(1)}%`;

  const blocks: KnownBlock[] = [
    {
      type: "header",
      text: { type: "plain_text", text: `🔍 Design QA Report${stagingUrl ? ` — ${stagingUrl}` : ""}`, emoji: true },
    },
    { type: "divider" },
    {
      type: "section",
      text: { type: "mrkdwn", text: summaryText },
    },
  ];

  if (critical.length > 0) {
    blocks.push(
      { type: "divider" },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*🔴 Top Critical Issues*\n\`\`\`${critical.slice(0, 3).map(bugLine).join("\n\n")}\`\`\``,
        },
      }
    );
  }

  if (warnings.length > 0) {
    blocks.push(
      { type: "divider" },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*🟡 Top Warnings*\n\`\`\`${warnings.slice(0, 3).map(bugLine).join("\n\n")}\`\`\``,
        },
      }
    );
  }

  const footerParts = [
    stagingUrl && `*Staging:* ${stagingUrl}`,
    figmaUrl && `*Figma:* ${figmaUrl}`,
    `*Viewport:* ${viewport}`,
  ].filter(Boolean);

  if (footerParts.length > 0) {
    blocks.push({ type: "divider" }, {
      type: "section",
      text: { type: "mrkdwn", text: footerParts.join("   |   ") },
    });
  }

  try {
    const msg = await slack.chat.postMessage({ channel: ch, blocks, text: summaryText });

    // Upload full bug list as JSON attachment
    let fileId: string | undefined;
    try {
      const upload = await slack.files.uploadV2({
        channel_id: ch,
        content: JSON.stringify(bugs, null, 2),
        filename: `qa-report-${Date.now()}.json`,
        title: "Full Bug List (JSON)",
      });
      fileId = (upload as { files?: Array<{ id?: string }> }).files?.[0]?.id;
    } catch {
      // File upload is best-effort; don't fail the whole request
    }

    // Get permalink for the message
    let permalink: string | undefined;
    try {
      const pl = await slack.chat.getPermalink({ channel: msg.channel!, message_ts: msg.ts! });
      permalink = pl.permalink ?? undefined;
    } catch {
      // Non-critical
    }

    return Response.json({ ok: true, messageTs: msg.ts, fileId, permalink });
  } catch (err) {
    console.error("[slack/report]", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Slack API error" },
      { status: 500 }
    );
  }
}
