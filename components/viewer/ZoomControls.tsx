"use client";

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

export function ZoomControls({ zoom, onZoomIn, onZoomOut, onReset }: ZoomControlsProps) {
  return (
    <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-1">
      <button
        type="button"
        onClick={onZoomOut}
        className="w-6 h-6 flex items-center justify-center rounded text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:bg-zinc-700 transition-colors text-sm"
      >
        −
      </button>
      <button
        type="button"
        onClick={onReset}
        className="px-2 py-0.5 text-xs font-mono text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:bg-zinc-700 rounded transition-colors min-w-[48px] text-center"
      >
        {Math.round(zoom * 100)}%
      </button>
      <button
        type="button"
        onClick={onZoomIn}
        className="w-6 h-6 flex items-center justify-center rounded text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:bg-zinc-700 transition-colors text-sm"
      >
        +
      </button>
    </div>
  );
}
