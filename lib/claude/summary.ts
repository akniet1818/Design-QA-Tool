import Anthropic from "@anthropic-ai/sdk";
import type { DesignBug } from "@/types";

const SYSTEM_PROMPT = `You are an expert design QA engineer. You analyze design discrepancies between Figma designs and their implementations. Write clear, actionable reports for frontend developers using Tailwind CSS.

Your reports should:
1. Identify the most critical issues to fix first
2. Point out patterns (e.g., "spacing is consistently 4px smaller than design")
3. Suggest specific Tailwind class changes
4. Be concise and developer-friendly`;

export async function generateAiSummary(bugs: DesignBug[]): Promise<string> {
  const client = new Anthropic();

  const criticalCount = bugs.filter(b => b.severity === "critical").length;
  const warningCount = bugs.filter(b => b.severity === "warning").length;
  const byType = bugs.reduce((acc, b) => {
    acc[b.type] = (acc[b.type] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Here are the detected design discrepancies (${bugs.length} total: ${criticalCount} critical, ${warningCount} warnings):

Summary by type: ${JSON.stringify(byType)}

Detailed bugs:
${JSON.stringify(bugs.slice(0, 30), null, 2)}

Write a concise QA report (3-5 paragraphs) summarizing patterns, priorities, and specific Tailwind fixes needed. Format as plain text, no markdown headers.`,
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type");
  return content.text;
}
