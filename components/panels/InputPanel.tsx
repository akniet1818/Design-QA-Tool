"use client";

import { FigmaInput } from "@/components/input/FigmaInput";
import { StagingInput } from "@/components/input/StagingInput";
import { DeviceSelector } from "@/components/input/DeviceSelector";
import { useAnalysisStore } from "@/stores/analysis-store";
import { useAnalysis } from "@/hooks/useAnalysis";

export function InputPanel() {
  const {
    setFigmaImage,
    setStagingImage,
    setStagingUrl,
    setStagingCookies,
    setFigmaMetadata,
    setStagingElements,
    setViewport,
    viewport,
    colorThreshold,
    setColorThreshold,
    reset,
  } = useAnalysisStore();

  const { canRun, runAnalysis, status } = useAnalysis();

  return (
    <aside className="flex flex-col gap-5 p-4 overflow-y-auto border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      <div className="flex items-center justify-between">
        <h1 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 tracking-tight">Design QA</h1>
        <button
          type="button"
          onClick={reset}
          className="text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:text-zinc-300 transition-colors"
        >
          Reset
        </button>
      </div>

      <FigmaInput
        onImageReady={setFigmaImage}
        onFigmaMetadata={setFigmaMetadata}
      />

      <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

      <StagingInput
        onImageReady={setStagingImage}
        onElementsReady={setStagingElements}
        onUrlReady={setStagingUrl}
        onCookiesReady={setStagingCookies}
      />

      <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

      <DeviceSelector value={viewport} onChange={setViewport} />

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Color Threshold (ΔE)</label>
          <span className="text-xs font-mono text-zinc-600 dark:text-zinc-300">{colorThreshold}</span>
        </div>
        <input
          type="range"
          min={1}
          max={20}
          step={1}
          value={colorThreshold}
          onChange={(e) => setColorThreshold(Number(e.target.value))}
          className="w-full accent-blue-500"
        />
        <div className="flex justify-between text-[10px] text-zinc-400 dark:text-zinc-600 font-mono">
          <span>1 (strict)</span>
          <span>20 (loose)</span>
        </div>
      </div>

      <div className="mt-auto pt-4">
        {status.status === "error" && (
          <p className="text-xs text-red-400 mb-3 p-2 bg-red-950/50 rounded-md">{status.error}</p>
        )}
        <button
          type="button"
          onClick={runAnalysis}
          disabled={!canRun}
          className={[
            "w-full py-3 rounded-lg text-sm font-medium transition-all",
            canRun
              ? "bg-blue-600 hover:bg-blue-500 text-white"
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed",
          ].join(" ")}
        >
          {status.status === "loading" ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Analyzing...
            </span>
          ) : (
            "Run Analysis"
          )}
        </button>
        {!canRun && status.status === "idle" && (
          <p className="text-[10px] text-zinc-400 dark:text-zinc-600 text-center mt-2">
            Upload both images to continue
          </p>
        )}
      </div>
    </aside>
  );
}
