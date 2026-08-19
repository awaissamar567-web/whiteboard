'use client';

import React from 'react';
import { Minus, Plus, Maximize2 } from 'lucide-react';
import { useTheme } from './ThemeContext';

export default function ZoomIndicator({
  zoom = 1,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onFitView,
}) {
  const { isDark } = useTheme();
  const percentage = Math.round(zoom * 100);

  return (
    <div
      role="region"
      aria-label="Zoom controls"
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      className="absolute bottom-5 right-5 z-30 flex items-center gap-1 px-2 py-1.5 rounded-full bg-white/95 dark:bg-[#202024]/95 backdrop-blur-md border border-black/10 dark:border-white/10 shadow-lg shadow-black/5 text-neutral-700 dark:text-neutral-200 select-none text-xs font-medium pointer-events-auto"
    >
      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          onZoomOut();
        }}
        className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white cursor-pointer"
        title="Zoom out (-)"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          onResetZoom();
        }}
        className="px-2 py-0.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition font-mono text-[11px] min-w-[48px] text-center cursor-pointer"
        title="Reset zoom to 100% (0)"
      >
        {percentage}%
      </button>

      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          onZoomIn();
        }}
        className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white cursor-pointer"
        title="Zoom in (+)"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>

      <div className="w-[1px] h-3.5 bg-neutral-200 dark:bg-neutral-800 mx-0.5" />

      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          onFitView();
        }}
        className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white cursor-pointer"
        title="Fit all elements to screen"
      >
        <Maximize2 className="w-3 h-3" />
      </button>
    </div>
  );
}
