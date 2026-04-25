"use client";

import {
  ReactCompareSlider,
  ReactCompareSliderImage,
  ReactCompareSliderHandle,
} from "react-compare-slider";

interface ImageSliderProps {
  figmaUrl: string;
  stagingUrl: string;
  zoom: number;
}

export function ImageSlider({ figmaUrl, stagingUrl, zoom }: ImageSliderProps) {
  return (
    <div
      style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}
      className="w-full transition-transform duration-150"
    >
      <ReactCompareSlider
        handle={
          <ReactCompareSliderHandle
            buttonStyle={{
              backdropFilter: "blur(4px)",
              background: "rgba(37,99,235,0.85)",
              border: "2px solid rgba(147,197,253,0.6)",
              color: "#fff",
              width: "28px",
              height: "28px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
            }}
            linesStyle={{ color: "rgba(59,130,246,0.8)", width: "2px" }}
          />
        }
        itemOne={
          <div className="relative">
            <ReactCompareSliderImage src={figmaUrl} alt="Figma design" />
            <span className="absolute top-2 left-2 text-[10px] font-mono bg-blue-700/80 text-white px-2 py-0.5 rounded">
              Figma
            </span>
          </div>
        }
        itemTwo={
          <div className="relative">
            <ReactCompareSliderImage src={stagingUrl} alt="Staging" />
            <span className="absolute top-2 right-2 text-[10px] font-mono bg-zinc-200 dark:bg-zinc-700/80 text-white px-2 py-0.5 rounded">
              Staging
            </span>
          </div>
        }
        style={{ borderRadius: "8px", overflow: "hidden" }}
      />
    </div>
  );
}
