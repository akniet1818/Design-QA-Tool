import { create } from "zustand";
import type { AnalysisResult, AnalysisStatus, Viewport } from "@/types";

interface AnalysisStore {
  figmaImage: string | null;
  stagingImage: string | null;
  stagingUrl: string | null;
  stagingCookies: string;
  figmaFileKey: string | null;
  figmaNodeId: string | null;
  stagingElements: unknown[];
  result: AnalysisResult | null;
  status: AnalysisStatus;
  viewport: Viewport;
  colorThreshold: number;
  highlightedBugId: string | null;

  setFigmaImage: (img: string | null) => void;
  setStagingImage: (img: string | null) => void;
  setStagingUrl: (url: string | null) => void;
  setStagingCookies: (cookies: string) => void;
  setFigmaMetadata: (fileKey: string, nodeId: string) => void;
  setStagingElements: (elements: unknown[]) => void;
  setResult: (result: AnalysisResult | null) => void;
  setStatus: (status: AnalysisStatus) => void;
  setViewport: (viewport: Viewport) => void;
  setColorThreshold: (threshold: number) => void;
  setHighlightedBugId: (id: string | null) => void;
  reset: () => void;
}

export const useAnalysisStore = create<AnalysisStore>((set) => ({
  figmaImage: null,
  stagingImage: null,
  stagingUrl: null,
  stagingCookies: "",
  figmaFileKey: null,
  figmaNodeId: null,
  stagingElements: [],
  result: null,
  status: { status: "idle" },
  viewport: "desktop",
  colorThreshold: 5,
  highlightedBugId: null,

  setFigmaImage: (img) => set({ figmaImage: img }),
  setStagingImage: (img) => set({ stagingImage: img }),
  setStagingUrl: (url) => set({ stagingUrl: url }),
  setStagingCookies: (cookies) => set({ stagingCookies: cookies }),
  setFigmaMetadata: (fileKey, nodeId) => set({ figmaFileKey: fileKey, figmaNodeId: nodeId }),
  setStagingElements: (elements) => set({ stagingElements: elements }),
  setResult: (result) => set({ result }),
  setStatus: (status) => set({ status }),
  setViewport: (viewport) => set({ viewport }),
  setColorThreshold: (colorThreshold) => set({ colorThreshold }),
  setHighlightedBugId: (id) => set({ highlightedBugId: id }),
  reset: () => set({
    figmaImage: null,
    stagingImage: null,
    stagingUrl: null,
    stagingCookies: "",
    figmaFileKey: null,
    figmaNodeId: null,
    stagingElements: [],
    result: null,
    status: { status: "idle" },
    highlightedBugId: null,
  }),
}));
