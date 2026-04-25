"use client";

import { useState, useCallback } from "react";

export function useImageViewer(initialZoom = 1) {
  const [zoom, setZoom] = useState(initialZoom);

  const zoomIn = useCallback(() => setZoom(z => Math.min(z + 0.25, 4)), []);
  const zoomOut = useCallback(() => setZoom(z => Math.max(z - 0.25, 0.25)), []);
  const resetZoom = useCallback(() => setZoom(1), []);

  return { zoom, zoomIn, zoomOut, resetZoom };
}
