"use client";

import { useAnalysisStore } from "@/stores/analysis-store";
import { getErrorMessage } from "@/lib/utils/severity";

export function useAnalysis() {
  const {
    figmaImage,
    stagingImage,
    stagingUrl,
    viewport,
    colorThreshold,
    status,
    result,
    setStatus,
    setResult,
  } = useAnalysisStore();

  const canRun = !!figmaImage && !!stagingImage && status.status !== "loading";

  async function runAnalysis() {
    if (!canRun || !figmaImage || !stagingImage) return;
    setStatus({ status: "loading", progress: "Running analysis..." });
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          figmaImage,
          stagingImage,
          viewport,
          colorThreshold,
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Analysis failed");
      }
      const data = await res.json();
      setResult(data);
      setStatus({ status: "success" });

      // Auto-send to Slack after analysis completes (best-effort, non-blocking)
      const channel = localStorage.getItem("qa-slack-channel") || "#design-qa";
      fetch("/api/slack/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bugs: data.bugs,
          stagingUrl: stagingUrl ?? "",
          figmaUrl: "",
          channel,
          viewport,
          diffPercentage: data.diffPercentage,
        }),
      }).catch(() => { /* Slack token not configured — silently skip */ });
    } catch (e) {
      setStatus({
        status: "error",
        error: getErrorMessage(e),
      });
    }
  }

  return { canRun, runAnalysis, status, result };
}
