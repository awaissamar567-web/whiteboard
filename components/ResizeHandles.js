'use client';

import React from 'react';
import { RotateCw, Plus } from 'lucide-react';

const HANDLES = [
  { dir: 'nw', cursor: 'nwse-resize', style: { top: -5, left: -5 } },
  { dir: 'n', cursor: 'ns-resize', style: { top: -5, left: '50%', transform: 'translateX(-50%)' } },
  { dir: 'ne', cursor: 'nesw-resize', style: { top: -5, right: -5 } },
  { dir: 'e', cursor: 'ew-resize', style: { top: '50%', right: -5, transform: 'translateY(-50%)' } },
  { dir: 'se', cursor: 'nwse-resize', style: { bottom: -5, right: -5 } },
  { dir: 's', cursor: 'ns-resize', style: { bottom: -5, left: '50%', transform: 'translateX(-50%)' } },
  { dir: 'sw', cursor: 'nesw-resize', style: { bottom: -5, left: -5 } },
  { dir: 'w', cursor: 'ew-resize', style: { top: '50%', left: -5, transform: 'translateY(-50%)' } },
];

export default function ResizeHandles({ onResizeStart, onRotateStart, onQuickConnect }) {
  return (
    <div className="absolute inset-0 pointer-events-none ring-1.5 ring-blue-500/80 rounded-[inherit]">
      {/* 8-Point Resize Square Handles */}
      {HANDLES.map(({ dir, cursor, style }) => (
        <div
          key={dir}
          style={{ ...style, cursor }}
          onPointerDown={(e) => {
            e.stopPropagation();
            onResizeStart && onResizeStart(e, dir);
          }}
          className="absolute w-2.5 h-2.5 bg-white dark:bg-[#18181A] border-2 border-blue-500 rounded-xs shadow-xs pointer-events-auto transition-transform hover:scale-130"
        />
      ))}

      {/* Sleek Minimalist Rotation Handle (with generous top gap) */}
      <div className="absolute top-[-34px] left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-auto">
        {/* Connecting vertical hairline */}
        <div className="w-[1px] h-5 bg-blue-500/70" />
        {/* Compact circular rotate handle */}
        <div
          onPointerDown={(e) => {
            e.stopPropagation();
            onRotateStart && onRotateStart(e);
          }}
          className="w-3.5 h-3.5 rounded-full bg-white dark:bg-[#202024] border-[1.5px] border-blue-500 shadow-xs flex items-center justify-center cursor-grab active:cursor-grabbing hover:scale-125 transition-transform"
          title="Drag to rotate element (Hold Shift to snap to 15°)"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
        </div>
      </div>

      {/* n8n-style Quick Connect "+" Trigger Handle (Right edge) */}
      {onQuickConnect && (
        <div
          className="absolute right-[-28px] top-1/2 -translate-y-1/2 pointer-events-auto flex items-center"
          title="Quick-connect next node (n8n / sitemap flow)"
        >
          {/* Subtle connecting horizontal dotted line */}
          <div className="w-2.5 h-[1.5px] bg-blue-400 dark:bg-blue-500" />
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onQuickConnect(e);
            }}
            className="w-5.5 h-5.5 rounded-full bg-blue-500 hover:bg-blue-600 active:scale-95 text-white shadow-md flex items-center justify-center transition-all duration-150 cursor-pointer ring-2 ring-white dark:ring-[#18181A]"
          >
            <Plus className="w-3 h-3 stroke-[2.5]" />
          </button>
        </div>
      )}
    </div>
  );
}
