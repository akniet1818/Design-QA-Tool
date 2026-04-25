"use client";

import { useRef, useEffect, useCallback } from "react";
import { useMeasurement } from "@/hooks/useMeasurement";

interface MeasurementOverlayProps {
  zoom: number;
}

export function MeasurementOverlay({ zoom }: MeasurementOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { points, hoverPoint, setHoverPoint, addPoint, clearPoints, dx, dy, showGrid, gridSize } = useMeasurement();

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Grid
    if (showGrid) {
      ctx.strokeStyle = "rgba(99,102,241,0.15)";
      ctx.lineWidth = 0.5;
      const step = gridSize * zoom;
      for (let x = 0; x < canvas.width; x += step) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += step) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }
    }

    // Crosshair on hover
    if (hoverPoint) {
      ctx.strokeStyle = "rgba(139,92,246,0.55)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(hoverPoint.x, 0); ctx.lineTo(hoverPoint.x, canvas.height); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, hoverPoint.y); ctx.lineTo(canvas.width, hoverPoint.y); ctx.stroke();
      ctx.setLineDash([]);

      const label = `${Math.round(hoverPoint.x / zoom)}, ${Math.round(hoverPoint.y / zoom)} px`;
      ctx.font = "10px monospace";
      const tw = ctx.measureText(label).width + 8;
      const lx = Math.min(hoverPoint.x + 10, canvas.width - tw - 4);
      const ly = Math.max(hoverPoint.y - 20, 16);
      ctx.fillStyle = "rgba(139,92,246,0.85)";
      ctx.fillRect(lx, ly - 11, tw, 15);
      ctx.fillStyle = "#fff";
      ctx.fillText(label, lx + 4, ly);
    }

    // Click points
    for (const p of points) {
      ctx.fillStyle = "#3b82f6";
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // H + V rulers between two points
    if (points.length === 2 && dx !== null && dy !== null) {
      const [p1, p2] = points;
      // Corner point
      const corner = { x: p2.x, y: p1.y };

      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 3]);

      // Horizontal ruler (p1 → corner)
      ctx.strokeStyle = "#f59e0b";
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(corner.x, corner.y);
      ctx.stroke();

      // Vertical ruler (corner → p2)
      ctx.strokeStyle = "#22d3ee";
      ctx.beginPath();
      ctx.moveTo(corner.x, corner.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();

      ctx.setLineDash([]);

      // Corner dot
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.beginPath();
      ctx.arc(corner.x, corner.y, 3, 0, Math.PI * 2);
      ctx.fill();

      // Horizontal label
      const hPx = Math.round(dx / zoom);
      const hLabel = `${hPx} px`;
      ctx.font = "bold 10px monospace";
      const hTw = ctx.measureText(hLabel).width + 8;
      const hMx = (p1.x + corner.x) / 2;
      ctx.fillStyle = "rgba(245,158,11,0.9)";
      ctx.fillRect(hMx - hTw / 2, p1.y - 18, hTw, 15);
      ctx.fillStyle = "#000";
      ctx.fillText(hLabel, hMx - hTw / 2 + 4, p1.y - 7);

      // Vertical label
      const vPx = Math.round(dy / zoom);
      const vLabel = `${vPx} px`;
      const vTw = ctx.measureText(vLabel).width + 8;
      const vMy = (corner.y + p2.y) / 2;
      ctx.fillStyle = "rgba(34,211,238,0.9)";
      ctx.fillRect(corner.x + 6, vMy - 8, vTw, 15);
      ctx.fillStyle = "#000";
      ctx.fillText(vLabel, corner.x + 10, vMy + 3);
    }
  }, [points, hoverPoint, showGrid, gridSize, zoom, dx, dy]);

  const getEventPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resize = () => {
      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;
      draw();
    };

    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();
    return () => ro.disconnect();
  }, [draw]);

  return (
    <div ref={containerRef} className="absolute inset-0 z-10">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 cursor-crosshair"
        onMouseMove={(e) => { setHoverPoint(getEventPos(e)); }}
        onMouseLeave={() => setHoverPoint(null)}
        onClick={(e) => addPoint(getEventPos(e))}
        onDoubleClick={clearPoints}
      />
      {(dx !== null || dy !== null) && (
        <div className="absolute bottom-2 right-2 flex items-center gap-2 bg-neutral-900/90 border border-neutral-700 rounded-md px-3 py-1.5 text-xs font-mono">
          {dx !== null && <span className="text-amber-400">W {Math.round(dx / zoom)} px</span>}
          {dy !== null && <span className="text-cyan-400">H {Math.round(dy / zoom)} px</span>}
          <button onClick={clearPoints} className="text-neutral-500 hover:text-neutral-300 ml-1">×</button>
        </div>
      )}
    </div>
  );
}
