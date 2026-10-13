"use client";

import React, { useEffect, useRef, useState } from "react";
import { ZoomIn, ZoomOut, RotateCcw, Maximize2 } from "lucide-react";

export interface ResponsivePdfPreviewProps {
  children: React.ReactNode;
  pageCount?: number;
  title?: string;
  className?: string;
}

const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;
const PAGE_GAP_PX = 20;

export const ResponsivePdfPreview: React.FC<ResponsivePdfPreviewProps> = ({
  children,
  pageCount = 1,
  title,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(A4_WIDTH_PX);
  const [zoomMode, setZoomMode] = useState<"fit" | "actual" | "custom">("fit");
  const [customScale, setCustomScale] = useState<number>(1);

  // Measure available width responsively
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateWidth = () => {
      const width = el.clientWidth;
      if (width > 0) {
        setContainerWidth(width);
      }
    };

    updateWidth();

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        if (width > 0) {
          setContainerWidth(width);
        }
      }
    });

    observer.observe(el);
    window.addEventListener("resize", updateWidth);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateWidth);
    };
  }, []);

  // Compute fit-to-width scale factor (subtle padding subtracted to prevent edge hugging)
  const availableWidth = Math.max(280, containerWidth - 24);
  const fitScale = Math.min(1, Math.max(0.28, availableWidth / A4_WIDTH_PX));

  // Determine current effective scale
  let effectiveScale = fitScale;
  if (zoomMode === "actual") {
    effectiveScale = 1;
  } else if (zoomMode === "custom") {
    effectiveScale = customScale;
  }

  // Calculate scaled dimensions for the container
  const scaledWidth = Math.round(A4_WIDTH_PX * effectiveScale);
  const totalUnscaledHeight = pageCount * A4_HEIGHT_PX + Math.max(0, pageCount - 1) * PAGE_GAP_PX;
  const scaledHeight = Math.round(totalUnscaledHeight * effectiveScale);

  const handleZoomIn = () => {
    const next = Math.min(1.5, Math.round((effectiveScale + 0.1) * 10) / 10);
    setZoomMode("custom");
    setCustomScale(next);
  };

  const handleZoomOut = () => {
    const next = Math.max(0.3, Math.round((effectiveScale - 0.1) * 10) / 10);
    setZoomMode("custom");
    setCustomScale(next);
  };

  const handleFit = () => {
    setZoomMode("fit");
  };

  const handleActual = () => {
    setZoomMode("actual");
    setCustomScale(1);
  };

  return (
    <div
      ref={containerRef}
      className={`w-full flex flex-col items-center ${className}`}
    >
      {/* Responsive Document Toolbar (Screen Only) */}
      <div className="w-full max-w-[210mm] mb-2 px-2 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-300 print:hidden select-none">
        <div className="flex items-center gap-2">
          {title && (
            <span className="font-bold text-slate-800 dark:text-slate-100 text-[11px] uppercase tracking-wider hidden sm:inline">
              {title}
            </span>
          )}
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
            {zoomMode === "fit" ? `Fit (${Math.round(fitScale * 100)}%)` : `${Math.round(effectiveScale * 100)}%`}
          </span>
          <span className="text-[10px] text-slate-400 hidden md:inline">
            A4 Standard (210 × 297 mm)
          </span>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-0.5 shadow-2xs">
          <button
            type="button"
            onClick={handleZoomOut}
            title="Zoom Out"
            disabled={effectiveScale <= 0.3}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={handleZoomIn}
            title="Zoom In"
            disabled={effectiveScale >= 1.5}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>

          <div className="h-3 w-px bg-slate-200 dark:bg-slate-700 mx-0.5" />

          <button
            type="button"
            onClick={handleFit}
            title="Fit to Screen"
            className={`px-2 py-0.5 text-[10px] font-bold rounded transition-colors cursor-pointer flex items-center gap-1 ${
              zoomMode === "fit"
                ? "bg-blue-600 text-white"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <RotateCcw className="h-2.5 w-2.5" />
            Fit
          </button>

          <button
            type="button"
            onClick={handleActual}
            title="100% Actual Size"
            className={`px-2 py-0.5 text-[10px] font-bold rounded transition-colors cursor-pointer flex items-center gap-1 ${
              zoomMode === "actual" || (zoomMode === "custom" && customScale === 1)
                ? "bg-blue-600 text-white"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Maximize2 className="h-2.5 w-2.5" />
            100%
          </button>
        </div>
      </div>

      {/* Scaled Preview Frame */}
      <div
        className="w-full overflow-x-auto overflow-y-visible flex justify-center scrollbar-thin py-1"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div
          className="relative transition-[width,height] duration-150 ease-out shrink-0"
          style={{
            width: `${scaledWidth}px`,
            height: `${scaledHeight}px`,
          }}
        >
          <div
            className="origin-top-left shrink-0 shadow-2xl rounded-xs overflow-hidden bg-white"
            style={{
              width: `${A4_WIDTH_PX}px`,
              transform: `scale(${effectiveScale})`,
              transformOrigin: "top left",
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
