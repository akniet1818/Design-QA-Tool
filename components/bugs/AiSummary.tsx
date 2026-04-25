"use client";

import { useState } from "react";
import type { DesignBug } from "@/types";
import { getErrorMessage } from "@/lib/utils/severity";

interface AiSummaryProps {
  bugs: DesignBug[];
}

export function AiSummary({ bugs }: AiSummaryProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bugs }),
      });
      if (!res.ok) throw new Error(await res.text());
      const { summary: text } = await res.json();
      setSummary(text);
      setOpen(true);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => summary ? setOpen(o => !o) : generate()}
        disabled={loading || bugs.length === 0}
        className="flex items-center gap-2 w-full bg-violet-900/40 hover:bg-violet-900/60 disabled:opacity-40 border border-violet-800 text-violet-300 text-xs py-2.5 px-3 rounded-lg transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        {loading ? "Generating AI Summary..." : summary ? (open ? "Hide AI Summary" : "Show AI Summary") : "Generate AI Summary"}
      </button>

      {error && <p className="text-xs text-red-400">{error}</p>}

      {summary && open && (
        <div className="bg-violet-950/40 border border-violet-900/60 rounded-lg p-3">
          <p className="text-xs text-violet-200 leading-relaxed whitespace-pre-wrap">{summary}</p>
        </div>
      )}
    </div>
  );
}
