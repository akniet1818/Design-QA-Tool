"use client";

import { useState, useCallback } from "react";

export interface Point { x: number; y: number }

export function useMeasurement() {
  const [points, setPoints] = useState<Point[]>([]);
  const [hoverPoint, setHoverPoint] = useState<Point | null>(null);
  const [showGrid, setShowGrid] = useState(false);
  const [gridSize, setGridSize] = useState<4 | 8>(8);

  const addPoint = useCallback((p: Point) => {
    setPoints(prev => prev.length >= 2 ? [p] : [...prev, p]);
  }, []);

  const clearPoints = useCallback(() => setPoints([]), []);

  const dx = points.length === 2 ? Math.abs(points[1].x - points[0].x) : null;
  const dy = points.length === 2 ? Math.abs(points[1].y - points[0].y) : null;

  return { points, hoverPoint, setHoverPoint, addPoint, clearPoints, dx, dy, showGrid, setShowGrid, gridSize, setGridSize };
}
