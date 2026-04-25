"use client";

import { useState, useCallback, useEffect, useRef, type RefObject } from "react";

const BLUE = "#3b82f6";
const SKIP = new Set(["HTML", "BODY"]);

type VRect = { left: number; top: number; width: number; height: number };
type CSSInfo = {
  w: number; h: number;
  pt: number; pr: number; pb: number; pl: number;
  mt: number; mr: number; mb: number; ml: number;
  fs: number; fw: string; gap: number; br: number;
};

interface Props {
  iframeRef: RefObject<HTMLIFrameElement | null>;
  enabled: boolean;
}

function iframeWin(ref: RefObject<HTMLIFrameElement | null>) {
  try { return ref.current?.contentWindow ?? null; } catch { return null; }
}
function iframeDoc(ref: RefObject<HTMLIFrameElement | null>) {
  try { return ref.current?.contentDocument ?? null; } catch { return null; }
}

export function LiveMeasureOverlay({ iframeRef, enabled }: Props) {
  const [hoverRect, setHoverRect] = useState<VRect | null>(null);
  const [selected, setSelected] = useState<{ rect: VRect; info: CSSInfo } | null>(null);
  const [altDown, setAltDown] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);

  const toVRect = useCallback((r: DOMRect): VRect => {
    const ir = iframeRef.current?.getBoundingClientRect() ?? { left: 0, top: 0 };
    return { left: ir.left + r.left, top: ir.top + r.top, width: r.width, height: r.height };
  }, [iframeRef]);

  const elementAt = useCallback((cx: number, cy: number): HTMLElement | null => {
    const doc = iframeDoc(iframeRef);
    const ir = iframeRef.current?.getBoundingClientRect();
    if (!doc || !ir) return null;
    const x = cx - ir.left, y = cy - ir.top;
    if (x < 0 || y < 0 || x > ir.width || y > ir.height) return null;
    const els = doc.elementsFromPoint(x, y);
    return (els.find(el => !SKIP.has(el.tagName)) as HTMLElement | undefined) ?? null;
  }, [iframeRef]);

  const readCSS = useCallback((el: HTMLElement): CSSInfo => {
    const win = iframeWin(iframeRef);
    const r = el.getBoundingClientRect();
    const w = Math.round(r.width), h = Math.round(r.height);
    if (!win) return { w, h, pt: 0, pr: 0, pb: 0, pl: 0, mt: 0, mr: 0, mb: 0, ml: 0, fs: 0, fw: "", gap: 0, br: 0 };
    const cs = win.getComputedStyle(el);
    const n = (k: string) => Math.round(parseFloat(cs.getPropertyValue(k)) || 0);
    return {
      w, h,
      pt: n("padding-top"), pr: n("padding-right"), pb: n("padding-bottom"), pl: n("padding-left"),
      mt: n("margin-top"), mr: n("margin-right"), mb: n("margin-bottom"), ml: n("margin-left"),
      fs: n("font-size"), fw: cs.fontWeight, gap: n("gap"), br: n("border-radius"),
    };
  }, [iframeRef]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const el = elementAt(e.clientX, e.clientY);
    setHoverRect(el ? toVRect(el.getBoundingClientRect()) : null);
  }, [elementAt, toVRect]);

  const onClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    const el = elementAt(e.clientX, e.clientY);
    if (!el) { setSelected(null); return; }
    setSelected({ rect: toVRect(el.getBoundingClientRect()), info: readCSS(el) });
  }, [elementAt, toVRect, readCSS]);

  // Forward scroll to iframe (non-passive so we can preventDefault)
  useEffect(() => {
    const el = captureRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      iframeWin(iframeRef)?.scrollBy(e.deltaX, e.deltaY);
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, [iframeRef]);

  useEffect(() => {
    const kd = (e: KeyboardEvent) => {
      if (e.key === "Alt") { e.preventDefault(); setAltDown(true); }
      if (e.key === "Escape") setSelected(null);
    };
    const ku = (e: KeyboardEvent) => { if (e.key === "Alt") setAltDown(false); };
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    return () => { window.removeEventListener("keydown", kd); window.removeEventListener("keyup", ku); };
  }, []);

  useEffect(() => {
    if (!enabled) { setHoverRect(null); setSelected(null); setAltDown(false); }
  }, [enabled]);

  if (!enabled) return null;

  const showHover = hoverRect && (!selected || altDown);

  return (
    <>
      <div
        ref={captureRef}
        className="absolute inset-0 z-10 cursor-crosshair"
        onMouseMove={onMouseMove}
        onMouseLeave={() => setHoverRect(null)}
        onClick={onClick}
      />

      {showHover && <BoxOverlay rect={hoverRect} variant="hover" />}

      {selected && (
        <>
          <BoxOverlay rect={selected.rect} variant="selected" />
          <SizeLabel rect={selected.rect} w={selected.info.w} h={selected.info.h} />
          <InfoPanel rect={selected.rect} info={selected.info} />
        </>
      )}

      {altDown && selected && hoverRect && (
        <>
          <BoxOverlay rect={hoverRect} variant="alt-hover" />
          <DistanceLines selRect={selected.rect} hovRect={hoverRect} />
        </>
      )}
    </>
  );
}

function BoxOverlay({ rect, variant }: { rect: VRect; variant: "hover" | "selected" | "alt-hover" }) {
  const s =
    variant === "hover"
      ? { border: `1px solid ${BLUE}99`, background: `${BLUE}10` }
      : variant === "selected"
      ? { border: `2px solid ${BLUE}`, background: `${BLUE}18` }
      : { border: `1px dashed ${BLUE}cc`, background: "transparent" };

  return (
    <div
      className="pointer-events-none"
      style={{
        position: "fixed",
        left: rect.left, top: rect.top,
        width: rect.width, height: rect.height,
        boxSizing: "border-box",
        zIndex: 2147483640,
        ...s,
      }}
    />
  );
}

function SizeLabel({ rect, w, h }: { rect: VRect; w: number; h: number }) {
  const below = rect.top + rect.height + 4;
  const top = below + 20 > window.innerHeight ? rect.top - 20 : below;
  return (
    <div
      className="pointer-events-none"
      style={{
        position: "fixed",
        left: rect.left + rect.width / 2,
        top,
        transform: "translateX(-50%)",
        background: BLUE,
        color: "white",
        fontSize: 10,
        fontFamily: "monospace",
        padding: "1px 6px",
        borderRadius: 3,
        whiteSpace: "nowrap",
        zIndex: 2147483641,
      }}
    >
      {w} × {h}
    </div>
  );
}

function InfoPanel({ rect, info }: { rect: VRect; info: CSSInfo }) {
  const { pt, pr, pb, pl, mt, mr, mb, ml } = info;
  const rows: [string, string][] = [["size", `${info.w} × ${info.h}`]];
  if (pt || pr || pb || pl) {
    rows.push(
      pt === pr && pt === pb && pt === pl
        ? ["pad", `${pt}px`]
        : ["pad", `↑${pt} →${pr} ↓${pb} ←${pl}`]
    );
  }
  if (mt || mr || mb || ml) rows.push(["margin", `↑${mt} →${mr} ↓${mb} ←${ml}`]);
  if (info.gap) rows.push(["gap", `${info.gap}px`]);
  if (info.fs) rows.push(["font", `${info.fs}px / ${info.fw}`]);
  if (info.br) rows.push(["radius", `${info.br}px`]);

  const panelW = 180;
  const idealLeft = rect.left + rect.width + 8;
  const left = idealLeft + panelW > window.innerWidth - 8 ? rect.left - panelW - 8 : idealLeft;
  const top = Math.max(8, Math.min(rect.top, window.innerHeight - rows.length * 22 - 24));

  return (
    <div
      className="pointer-events-none"
      style={{
        position: "fixed",
        left, top,
        background: "#18181b",
        color: "#e4e4e7",
        borderRadius: 8,
        padding: "8px 12px",
        fontSize: 11,
        fontFamily: "monospace",
        lineHeight: 1.7,
        border: "1px solid #3f3f46",
        boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
        zIndex: 2147483642,
        minWidth: panelW,
      }}
    >
      {rows.map(([k, v]) => (
        <div key={k} style={{ display: "flex", gap: 8 }}>
          <span style={{ color: "#71717a", minWidth: 44 }}>{k}</span>
          <span>{v}</span>
        </div>
      ))}
    </div>
  );
}

function DistanceLines({ selRect, hovRect }: { selRect: VRect; hovRect: VRect }) {
  const selRight = selRect.left + selRect.width;
  const hovRight = hovRect.left + hovRect.width;
  const selBottom = selRect.top + selRect.height;
  const hovBottom = hovRect.top + hovRect.height;

  let hLine: { x1: number; x2: number; y: number; dist: number } | null = null;
  if (selRect.left > hovRight) hLine = { x1: hovRight, x2: selRect.left, y: selRect.top + selRect.height / 2, dist: Math.round(selRect.left - hovRight) };
  else if (hovRect.left > selRight) hLine = { x1: selRight, x2: hovRect.left, y: selRect.top + selRect.height / 2, dist: Math.round(hovRect.left - selRight) };

  let vLine: { x: number; y1: number; y2: number; dist: number } | null = null;
  if (selRect.top > hovBottom) vLine = { x: selRect.left + selRect.width / 2, y1: hovBottom, y2: selRect.top, dist: Math.round(selRect.top - hovBottom) };
  else if (hovRect.top > selBottom) vLine = { x: selRect.left + selRect.width / 2, y1: selBottom, y2: hovRect.top, dist: Math.round(hovRect.top - selBottom) };

  return (
    <>
      {hLine && (
        <div
          className="pointer-events-none"
          style={{ position: "fixed", left: hLine.x1, top: hLine.y, width: hLine.x2 - hLine.x1, height: 1, background: BLUE, zIndex: 2147483641 }}
        >
          <span style={{ position: "absolute", left: "50%", top: -10, transform: "translateX(-50%)", background: BLUE, color: "white", fontSize: 10, fontFamily: "monospace", padding: "0 4px", borderRadius: 2, whiteSpace: "nowrap" }}>
            {hLine.dist}px
          </span>
        </div>
      )}
      {vLine && (
        <div
          className="pointer-events-none"
          style={{ position: "fixed", left: vLine.x, top: vLine.y1, width: 1, height: vLine.y2 - vLine.y1, background: BLUE, zIndex: 2147483641 }}
        >
          <span style={{ position: "absolute", top: "50%", left: 4, transform: "translateY(-50%)", background: BLUE, color: "white", fontSize: 10, fontFamily: "monospace", padding: "0 4px", borderRadius: 2, whiteSpace: "nowrap" }}>
            {vLine.dist}px
          </span>
        </div>
      )}
    </>
  );
}
