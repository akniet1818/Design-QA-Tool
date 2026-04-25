"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useAnalysisStore } from "@/stores/analysis-store";
import { ImageSlider } from "@/components/viewer/ImageSlider";
import { DiffOverlay, type ViewMode } from "@/components/viewer/DiffOverlay";
import { ZoomControls } from "@/components/viewer/ZoomControls";
import { MeasurementOverlay } from "@/components/viewer/MeasurementOverlay";
import { LiveMeasureOverlay } from "@/components/viewer/LiveMeasureOverlay";
import { AnnotationPins } from "@/components/viewer/AnnotationPins";
import { useImageViewer } from "@/hooks/useImageViewer";

export function ViewerPanel() {
  const {
    figmaImage, stagingImage, stagingUrl, stagingCookies,
    result, highlightedBugId, setHighlightedBugId,
  } = useAnalysisStore();

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("live");
  const [measureActive, setMeasureActive] = useState(false);
  const [showPins, setShowPins] = useState(true);
  const [overlayOpacity, setOverlayOpacity] = useState(0.4);
  const [figmaScale, setFigmaScale] = useState(100);
  const [imageDims, setImageDims] = useState<{ w: number; h: number } | null>(null);
  const { zoom, zoomIn, zoomOut, resetZoom } = useImageViewer();

  const liveContainerRef = useRef<HTMLDivElement>(null);

  const [sessionId, setSessionId] = useState<string | null>(null);
  useEffect(() => {
    if (!stagingUrl) { setSessionId(null); return; }
    const ac = new AbortController();
    fetch("/api/proxy/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: stagingUrl, cookies: stagingCookies }),
      signal: ac.signal,
    })
      .then(r => r.json())
      .then(({ sessionId: id }) => setSessionId(id))
      .catch(() => {});
    return () => ac.abort();
  }, [stagingUrl, stagingCookies]);

  const proxyUrl = sessionId ? `/api/proxy?s=${sessionId}` : null;

  // If the proxied SPA navigates the iframe away from our proxy, reload it
  const reloadCountRef = useRef(0);
  useEffect(() => { reloadCountRef.current = 0; }, [proxyUrl]);
  const handleIframeLoad = useCallback(() => {
    if (!iframeRef.current || !proxyUrl) return;
    try {
      const loc = iframeRef.current.contentWindow?.location;
      const stillOnProxy = loc?.pathname === "/api/proxy" && loc?.search.includes("s=");
      if (!stillOnProxy && reloadCountRef.current < 3) {
        reloadCountRef.current += 1;
        iframeRef.current.src = proxyUrl;
      }
    } catch {
      // cross-origin — can't inspect location, leave it
    }
  }, [proxyUrl]);

  const hasContent = !!figmaImage || !!stagingImage || !!stagingUrl;
  const bugs = result?.bugs ?? [];

  // "diff" tab is repurposed as "pins" — we show staging + pins instead of red diff
  const currentImage =
    viewMode === "figma" ? figmaImage :
    viewMode === "staging" || viewMode === "diff" ? stagingImage :
    stagingImage ?? figmaImage ?? null;

  const handleMeasure = () => setMeasureActive(m => !m);

  const MeasureBtn = () => (
    <button
      type="button"
      onClick={handleMeasure}
      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-colors ${
        measureActive
          ? "bg-violet-600 border-violet-500 text-white"
          : "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
      }`}
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
      </svg>
      Measure
    </button>
  );

  return (
    <main className="flex flex-col overflow-hidden border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex-shrink-0">
        <DiffOverlay mode={viewMode} onChange={(m) => { setViewMode(m); if (m !== "live") setMeasureActive(false); }} diffPercentage={result?.diffPercentage} />
        <div className="flex items-center gap-2">
          <MeasureBtn />
          {/* Pin toggle — only relevant in staging/diff/figma modes */}
          {viewMode !== "live" && viewMode !== "slider" && bugs.length > 0 && (
            <button
              type="button"
              onClick={() => setShowPins(p => !p)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                showPins
                  ? "bg-rose-600 border-rose-500 text-white"
                  : "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              Pins {showPins ? "on" : "off"}
            </button>
          )}
          {viewMode !== "live" && (
            <ZoomControls zoom={zoom} onZoomIn={zoomIn} onZoomOut={zoomOut} onReset={resetZoom} />
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        {/* ── Live view ── */}
        <div
          ref={liveContainerRef}
          className="relative overflow-hidden"
          style={{ display: viewMode === "live" ? "flex" : "none", flex: 1, flexDirection: "column" }}
        >
          <LiveMeasureOverlay iframeRef={iframeRef} enabled={measureActive && viewMode === "live"} />
          {proxyUrl ? (
            <>
              <iframe
                key={proxyUrl}
                ref={iframeRef}
                src={proxyUrl}
                onLoad={handleIframeLoad}
                className="flex-1 w-full border-none"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
                title="Live staging"
              />
              {figmaImage && (
                <img
                  src={figmaImage}
                  alt="Figma overlay"
                  style={{ position: "absolute", top: 0, left: 0, width: `${figmaScale}%`, height: "auto", opacity: overlayOpacity, pointerEvents: "none" }}
                />
              )}
              {figmaImage && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm px-4 py-2.5 rounded-full border border-zinc-200 dark:border-zinc-700 shadow-xl z-20 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-500">Opacity</span>
                    <input type="range" min={0} max={100} value={Math.round(overlayOpacity * 100)} onChange={(e) => setOverlayOpacity(Number(e.target.value) / 100)} className="w-24 accent-blue-500" />
                    <span className="text-[10px] font-mono text-zinc-700 dark:text-zinc-300 w-7 text-right">{Math.round(overlayOpacity * 100)}%</span>
                  </div>
                  <div className="w-px h-4 bg-zinc-300 dark:bg-zinc-700" />
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-500">Scale</span>
                    <input type="range" min={50} max={150} value={figmaScale} onChange={(e) => setFigmaScale(Number(e.target.value))} className="w-24 accent-violet-500" />
                    <span className="text-[10px] font-mono text-zinc-700 dark:text-zinc-300 w-8 text-right">{figmaScale}%</span>
                  </div>
                  <div className="w-px h-4 bg-zinc-300 dark:bg-zinc-700" />
                  <button type="button" onClick={() => { setOverlayOpacity(0.4); setFigmaScale(100); }} className="text-[10px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">Reset</button>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-zinc-400 dark:text-zinc-600">
              <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <p className="text-sm">Paste a staging URL to view the live site</p>
              <p className="text-xs opacity-60">Add auth cookies if login is required</p>
            </div>
          )}
        </div>

        {/* ── Screenshot / analysis views ── */}
        {viewMode !== "live" && (
          <div className="flex-1 overflow-auto p-4 flex items-start justify-center">
            {!hasContent ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-zinc-400 dark:text-zinc-600">
                <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm">Upload Figma design and staging screenshot</p>
                <p className="text-xs opacity-60">Then click Run Analysis</p>
              </div>
            ) : (
              <div className="relative w-full">
                {viewMode === "slider" && figmaImage && stagingImage ? (
                  <div className="relative">
                    <ImageSlider figmaUrl={figmaImage} stagingUrl={stagingImage} zoom={zoom} />
                    {measureActive && <MeasurementOverlay zoom={zoom} />}
                  </div>
                ) : currentImage ? (
                  <div className="relative inline-block w-full">
                    <img
                      src={currentImage}
                      alt={viewMode}
                      style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}
                      className="max-w-full rounded-lg border border-zinc-200 dark:border-zinc-800 transition-transform duration-150"
                      onLoad={(e) => {
                        const img = e.currentTarget;
                        setImageDims({ w: img.naturalWidth, h: img.naturalHeight });
                      }}
                    />
                    {showPins && imageDims && bugs.length > 0 && (
                      <AnnotationPins
                        bugs={bugs}
                        imageWidth={imageDims.w}
                        imageHeight={imageDims.h}
                        highlightedId={highlightedBugId}
                        onPinClick={setHighlightedBugId}
                      />
                    )}
                    {measureActive && <MeasurementOverlay zoom={zoom} />}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-48 text-zinc-400 dark:text-zinc-600 text-sm">
                    Run analysis to see {viewMode} view
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
