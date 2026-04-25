"use client";

import type { AnalysisResult, DesignBug } from "@/types";
import { saveAs } from "file-saver";

interface ExportControlsProps {
  result: AnalysisResult;
}

function bugsToMarkdown(result: AnalysisResult): string {
  const { bugs, diffPercentage, viewport, analyzedAt } = result;
  const lines = [
    "# Design QA Report",
    "",
    `**Analyzed at:** ${new Date(analyzedAt).toLocaleString()}`,
    `**Viewport:** ${viewport}`,
    `**Visual diff:** ${diffPercentage.toFixed(1)}%`,
    `**Total bugs:** ${bugs.length}`,
    "",
    "## Bug List",
    "",
    "| # | Type | Severity | Figma | Staging | Suggested Fix |",
    "|---|------|----------|-------|---------|---------------|",
    ...bugs.map((b, i) =>
      `| ${i + 1} | ${b.type} | ${b.severity} | \`${b.figmaValue}\` (${b.figmaTailwindToken}) | \`${b.stagingValue}\` (${b.stagingTailwindToken}) | ${b.suggestedFix} |`
    ),
  ];
  return lines.join("\n");
}

export function ExportControls({ result }: ExportControlsProps) {
  const copyMarkdown = () => {
    navigator.clipboard.writeText(bugsToMarkdown(result));
  };

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    saveAs(blob, `design-qa-${Date.now()}.json`);
  };

  const downloadPdf = async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
    const margin = 15;
    let y = margin;

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Design QA Report", margin, y);
    y += 10;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Viewport: ${result.viewport} | Diff: ${result.diffPercentage.toFixed(1)}% | Bugs: ${result.bugs.length}`, margin, y);
    y += 8;
    doc.text(`Analyzed: ${new Date(result.analyzedAt).toLocaleString()}`, margin, y);
    y += 10;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Bug List", margin, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    for (const [i, bug] of result.bugs.entries()) {
      if (y > 270) { doc.addPage(); y = margin; }
      const line = `${i + 1}. [${bug.severity.toUpperCase()}] ${bug.type}: ${bug.figmaValue} → ${bug.stagingValue} — ${bug.suggestedFix}`;
      const wrapped = doc.splitTextToSize(line, 180);
      doc.text(wrapped, margin, y);
      y += wrapped.length * 5 + 2;
    }

    doc.save(`design-qa-${Date.now()}.pdf`);
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Export</span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={copyMarkdown}
          className="flex-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 transition-colors"
        >
          Copy MD
        </button>
        <button
          type="button"
          onClick={downloadJson}
          className="flex-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 transition-colors"
        >
          JSON
        </button>
        <button
          type="button"
          onClick={downloadPdf}
          className="flex-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 transition-colors"
        >
          PDF
        </button>
      </div>
    </div>
  );
}
