"use client";

import { useState, useRef } from "react";
import { getErrorMessage } from "@/lib/utils/severity";

interface FigmaInputProps {
  onImageReady: (dataUrl: string) => void;
  onFigmaMetadata?: (fileKey: string, nodeId: string) => void;
}

function parseFigmaUrl(url: string): { fileKey: string; nodeId: string } | null {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("figma.com")) return null;
    const parts = parsed.pathname.split("/");
    const typeIdx = parts.findIndex((p) => p === "file" || p === "design" || p === "proto");
    const fileKey = typeIdx !== -1 ? parts[typeIdx + 1] : null;
    if (!fileKey) return null;
    const rawNodeId = parsed.searchParams.get("node-id");
    if (!rawNodeId) return null;
    // Figma uses both "1:2" and "1-2" formats in URLs; normalize to colon form
    const nodeId = rawNodeId.replace(/-(?=\d)/g, ":");
    return { fileKey, nodeId };
  } catch {
    return null;
  }
}

export function FigmaInput({ onImageReady, onFigmaMetadata }: FigmaInputProps) {
  const [mode, setMode] = useState<"upload" | "url">("upload");
  const [figmaUrl, setFigmaUrl] = useState("");
  const [fileKey, setFileKey] = useState("");
  const [nodeId, setNodeId] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFigmaUrl(val);
    const parsed = parseFigmaUrl(val);
    if (parsed) {
      setFileKey(parsed.fileKey);
      setNodeId(parsed.nodeId);
      setError(null);
    } else {
      setFileKey("");
      setNodeId("");
      if (val.length > 10) setError("Paste a Figma frame URL — right-click a frame → Copy link");
      else setError(null);
    }
  };

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

  const handleFigmaFetch = async () => {
    if (!fileKey.trim() || !nodeId.trim()) {
      setError("Enter both file key and node ID");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/figma/export?fileKey=${encodeURIComponent(fileKey)}&nodeId=${encodeURIComponent(nodeId)}`);
      if (!res.ok) throw new Error(await res.text());
      const { imageUrl } = await res.json();
      setPreview(imageUrl);
      onImageReady(imageUrl);
      onFigmaMetadata?.(fileKey, nodeId);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Figma Design</label>
        <div className="flex rounded overflow-hidden border border-zinc-300 dark:border-zinc-700 text-xs">
          {(["upload", "url"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { setMode(m); setError(null); }}
              className={`px-3 py-1 transition-colors ${mode === m ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:text-zinc-300"}`}
            >
              {m === "upload" ? "Upload" : "Figma URL"}
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
            <img src={preview} alt="Figma design" className="w-full h-auto max-h-32 object-contain rounded-md p-1" />
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
            placeholder="Paste Figma frame URL"
            value={figmaUrl}
            onChange={handleUrlChange}
            onKeyDown={(e) => e.key === "Enter" && fileKey && nodeId && handleFigmaFetch()}
            className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md px-3 py-2 text-xs font-mono text-zinc-800 dark:text-zinc-200 placeholder-neutral-500 focus:outline-none focus:border-blue-500"
          />
          {fileKey && nodeId && (
            <div className="flex gap-2 flex-wrap">
              <span className="text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 px-2 py-0.5 rounded truncate max-w-[50%]" title={fileKey}>
                key: {fileKey}
              </span>
              <span className="text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 px-2 py-0.5 rounded">
                node: {nodeId}
              </span>
            </div>
          )}
          <button
            type="button"
            onClick={handleFigmaFetch}
            disabled={loading}
            className="w-full bg-zinc-200 dark:bg-zinc-700 hover:bg-neutral-600 disabled:opacity-50 text-zinc-800 dark:text-zinc-200 text-xs rounded-md py-2 transition-colors"
          >
            {loading ? "Fetching..." : "Fetch Frame"}
          </button>
          {preview && (
            <img src={preview} alt="Figma frame" className="w-full max-h-32 object-contain rounded-md border border-zinc-300 dark:border-zinc-700" />
          )}
        </div>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
