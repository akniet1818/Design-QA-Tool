"use client";

import { useState, useEffect } from "react";
import { useAnalysisStore } from "@/stores/analysis-store";
import { BugCard } from "@/components/bugs/BugCard";
import { BugFilter } from "@/components/bugs/BugFilter";
import { BugSummary } from "@/components/bugs/BugSummary";
import { AiSummary } from "@/components/bugs/AiSummary";
import { ExportControls } from "@/components/bugs/ExportControls";
import type { BugType, Severity } from "@/types";

const ALL_TYPES: BugType[] = ["spacing", "typography", "color", "sizing", "border-radius", "shadow"];
const ALL_SEVERITIES: Severity[] = ["critical", "warning", "info"];

const SlackIcon = () => (
  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
    <path d="M5.042 15.165a2.528 2.528 0 01-2.52 2.523A2.528 2.528 0 010 15.165a2.527 2.527 0 012.522-2.52h2.52v2.52zm1.27 0a2.527 2.527 0 012.521-2.52 2.527 2.527 0 012.521 2.52v6.313A2.528 2.528 0 018.833 24a2.528 2.528 0 01-2.521-2.522v-6.313zM8.833 5.042a2.528 2.528 0 01-2.521-2.52A2.528 2.528 0 018.833 0a2.528 2.528 0 012.521 2.522v2.52H8.833zm0 1.27a2.528 2.528 0 012.521 2.521 2.528 2.528 0 01-2.521 2.521H2.522A2.528 2.528 0 010 8.833a2.528 2.528 0 012.522-2.521h6.311zm10.122 2.521a2.528 2.528 0 012.522-2.521A2.528 2.528 0 0124 8.833a2.528 2.528 0 01-2.522 2.521h-2.522V8.833zm-1.268 0a2.528 2.528 0 01-2.523 2.521 2.527 2.527 0 01-2.52-2.521V2.522A2.527 2.527 0 0115.165 0a2.528 2.528 0 012.523 2.522v6.311zm-2.523 10.122a2.528 2.528 0 012.523 2.522A2.528 2.528 0 0115.165 24a2.527 2.527 0 01-2.52-2.522v-2.522h2.52zm0-1.268a2.527 2.527 0 01-2.52-2.523 2.526 2.526 0 012.52-2.52h6.313A2.527 2.527 0 0124 15.165a2.528 2.528 0 01-2.522 2.523h-6.313z"/>
  </svg>
);

export function BugPanel() {
  const { result, status, stagingUrl, highlightedBugId, setHighlightedBugId } = useAnalysisStore();
  const [selectedTypes, setSelectedTypes] = useState<BugType[]>(ALL_TYPES);
  const [selectedSeverities, setSelectedSeverities] = useState<Severity[]>(ALL_SEVERITIES);
  const [slackChannel, setSlackChannel] = useState("#design-qa");
  const [slackOpen, setSlackOpen] = useState(false);
  const [slackStatus, setSlackStatus] = useState<{ ok: boolean; msg: string; url?: string } | null>(null);
  const [slackSending, setSlackSending] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("qa-slack-channel");
    if (saved) setSlackChannel(saved);
  }, []);

  const saveChannel = (ch: string) => {
    setSlackChannel(ch);
    localStorage.setItem("qa-slack-channel", ch);
  };

  const sendToSlack = async () => {
    if (!result) return;
    setSlackSending(true);
    setSlackStatus(null);
    try {
      const res = await fetch("/api/slack/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bugs: result.bugs,
          stagingUrl: stagingUrl ?? "",
          figmaUrl: "",
          channel: slackChannel,
          viewport: result.viewport,
          diffPercentage: result.diffPercentage,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setSlackStatus({ ok: true, msg: `✅ Sent to ${slackChannel}`, url: data.permalink });
    } catch (e) {
      setSlackStatus({ ok: false, msg: `❌ ${e instanceof Error ? e.message : "Failed — check SLACK_BOT_TOKEN in .env.local"}` });
    } finally {
      setSlackSending(false);
    }
  };

  const testSlack = async () => {
    try {
      const res = await fetch("/api/slack/test");
      const data = await res.json();
      setSlackStatus({ ok: data.ok, msg: data.ok ? "✅ Connected" : `❌ ${data.error}` });
    } catch {
      setSlackStatus({ ok: false, msg: "❌ Could not reach server" });
    }
  };

  const filteredBugs = result?.bugs.filter(
    b => selectedTypes.includes(b.type) && selectedSeverities.includes(b.severity)
  ) ?? [];

  return (
    <aside className="flex flex-col gap-4 p-4 overflow-y-auto bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 tracking-tight">Bug Report</h2>
        {result && (
          <button
            type="button"
            onClick={sendToSlack}
            disabled={slackSending}
            title="Resend to Slack"
            className="flex items-center gap-1.5 text-[10px] px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 disabled:opacity-50 transition-colors"
          >
            <SlackIcon />
            {slackSending ? "Sending…" : "Resend"}
          </button>
        )}
      </div>

      {/* Slack toast */}
      {slackStatus && (
        <div className={`text-[10px] px-2 py-1.5 rounded flex items-center gap-1 ${slackStatus.ok ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400" : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"}`}>
          <span className="flex-1">{slackStatus.msg}</span>
          {slackStatus.url && <a href={slackStatus.url} target="_blank" rel="noreferrer" className="underline">View</a>}
          <button onClick={() => setSlackStatus(null)} className="opacity-50 hover:opacity-100 ml-1">×</button>
        </div>
      )}

      {/* Slack settings */}
      <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => setSlackOpen(o => !o)}
          className="w-full flex items-center justify-between px-3 py-2 text-[10px] text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          <span className="flex items-center gap-1.5"><SlackIcon /> Slack settings</span>
          <span>{slackOpen ? "▲" : "▼"}</span>
        </button>
        {slackOpen && (
          <div className="px-3 pb-3 flex flex-col gap-2 border-t border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
            <input
              type="text"
              value={slackChannel}
              onChange={e => saveChannel(e.target.value)}
              placeholder="#design-qa"
              className="mt-2 w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1.5 text-xs font-mono text-zinc-700 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none focus:border-blue-500"
            />
            <button type="button" onClick={testSlack} className="text-[10px] text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors self-start">
              Test connection →
            </button>
          </div>
        )}
      </div>

      {status.status === "loading" && (
        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Analyzing…
        </div>
      )}

      {!result && status.status !== "loading" && (
        <p className="text-xs text-zinc-400 dark:text-zinc-600">Run an analysis to see detected bugs</p>
      )}

      {result && (
        <>
          <BugSummary bugs={result.bugs} diffPercentage={result.diffPercentage} />
          <BugFilter selectedTypes={selectedTypes} selectedSeverities={selectedSeverities} onTypeChange={setSelectedTypes} onSeverityChange={setSelectedSeverities} />
          <AiSummary bugs={result.bugs} />
          <ExportControls result={result} />
          <div className="h-px bg-zinc-200 dark:bg-zinc-800" />
          {filteredBugs.length === 0 ? (
            <p className="text-xs text-zinc-400 dark:text-zinc-600 text-center py-4">No bugs match the current filters</p>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredBugs.map((bug, i) => (
                <BugCard
                  key={bug.id}
                  bug={bug}
                  index={i}
                  highlighted={highlightedBugId === bug.id}
                  onDismissHighlight={() => setHighlightedBugId(null)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </aside>
  );
}
