"use client";

import { useState, useRef } from "react";
import { getErrorMessage } from "@/lib/utils/severity";

interface StagingInputProps {
  onImageReady: (dataUrl: string) => void;
  onElementsReady?: (elements: unknown[]) => void;
  onUrlReady?: (url: string | null) => void;
  onCookiesReady?: (cookies: string) => void;
}

export function StagingInput({ onImageReady, onElementsReady, onUrlReady, onCookiesReady }: StagingInputProps) {
  const [mode, setMode] = useState<"upload" | "url">("upload");
  const [url, setUrl] = useState("");
  const [cookies, setCookies] = useState("");
  const [showCookies, setShowCookies] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please upload a PNG or JPG file");
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setPreview(result);
      onImageReady(result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file?.type.startsWith("image/")) return;
    setError(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setPreview(result);
      onImageReady(result);
    };
    reader.readAsDataURL(file);
  };

  const handleUrlCapture = async () => {
    if (!url.trim()) { setError("Enter a URL"); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/screenshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, cookies: cookies.trim() || undefined }),
      });
      if (!res.ok) throw new Error(await res.text());
      const { screenshot, elements } = await res.json();
      setPreview(screenshot);
      onImageReady(screenshot);
      onElementsReady?.(elements);
      onUrlReady?.(url);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Staging / Production</label>
        <div className="flex rounded overflow-hidden border border-zinc-300 dark:border-zinc-700 text-xs">
          {(["upload", "url"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { setMode(m); setError(null); }}
              className={`px-3 py-1 transition-colors ${mode === m ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:text-zinc-300"}`}
            >
              {m === "upload" ? "Upload" : "URL"}
            </button>
          ))}
        </div>
      </div>

      {mode === "upload" ? (
        <div
          key="upload"
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed cursor-pointer transition-colors min-h-[100px] ${
            preview ? "border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800/50" : "border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800/30 hover:bg-zinc-100 dark:bg-zinc-800/60 hover:border-neutral-600"
          }`}
        >
          <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFileChange} className="hidden" />
          {preview ? (
            <img src={preview} alt="Staging screenshot" className="w-full h-auto max-h-32 object-contain rounded-md p-1" />
          ) : (
            <div className="flex flex-col items-center gap-1 py-4 text-zinc-400 dark:text-zinc-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span className="text-xs">Drop PNG or click to upload</span>
            </div>
          )}
        </div>
      ) : (
        <div key="url" className="flex flex-col gap-2">
          <input
            type="url"
            placeholder="https://your-staging-url.com"
            value={url}
            onChange={(e) => {
                const val = e.target.value;
                setUrl(val);
                if (!val) { onUrlReady?.(null); return; }
                try { new URL(val); onUrlReady?.(val); } catch { /* wait for a complete URL */ }
              }}
            onBlur={(e) => {
                const val = e.target.value.trim();
                if (!val) { onUrlReady?.(null); return; }
                try { new URL(val); onUrlReady?.(val); } catch { setError("Enter a valid URL starting with https://"); }
              }}
            onKeyDown={(e) => e.key === "Enter" && handleUrlCapture()}
            className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md px-3 py-2 text-xs font-mono text-zinc-800 dark:text-zinc-200 placeholder-neutral-500 focus:outline-none focus:border-blue-500"
          />
          <button
            type="button"
            onClick={() => setShowCookies(s => !s)}
            className="flex items-center gap-1.5 text-[10px] text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:text-zinc-300 transition-colors self-start"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            {showCookies ? "Hide" : "Add auth cookies"} {cookies.trim() && "✓"}
          </button>
          {showCookies && (
            <div className="flex flex-col gap-1">
              <textarea
                rows={3}
                placeholder={"Paste cookies from DevTools:\nname1=value1; name2=value2"}
                value={cookies}
                onChange={(e) => { setCookies(e.target.value); onCookiesReady?.(e.target.value); }}
                className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md px-3 py-2 text-[10px] font-mono text-zinc-800 dark:text-zinc-200 placeholder-neutral-600 focus:outline-none focus:border-blue-500 resize-none"
              />
              <p className="text-[10px] text-zinc-400 dark:text-zinc-600">
                DevTools → Network → any request → Headers → find <span className="font-mono">Cookie:</span> → copy the full value
              </p>
            </div>
          )}
          <button
            type="button"
            onClick={handleUrlCapture}
            disabled={loading}
            className="w-full bg-zinc-200 dark:bg-zinc-700 hover:bg-neutral-600 disabled:opacity-50 text-zinc-800 dark:text-zinc-200 text-xs rounded-md py-2 transition-colors"
          >
            {loading ? "Capturing..." : "Capture Screenshot"}
          </button>
          {preview && (
            <img src={preview} alt="Staging screenshot" className="w-full max-h-32 object-contain rounded-md border border-zinc-300 dark:border-zinc-700" />
          )}
        </div>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
