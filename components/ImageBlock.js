'use client';

import React, { useRef, useState } from 'react';
import { ImageIcon, ExternalLink, Lock, RefreshCw } from 'lucide-react';
import { useTheme } from './ThemeContext';
import ResizeHandles from './ResizeHandles';

export default function ImageBlock({
  id,
  x,
  y,
  width = 320,
  height = 240,
  imageUrl = null,
  caption = '',
  link = '',
  rotation = 0,
  isLocked = false,
  isSelected = false,
  aspectRatio = null,
  onSelect,
  onChange,
  onPointerDown,
  onResizeStart,
  onRotateStart,
  onQuickConnect,
  onContextMenu,
}) {
  const { isDark } = useTheme();
  const fileInputRef = useRef(null);
  const [isEditingCaption, setIsEditingCaption] = useState(false);

  const processImageDataUrl = (dataUrl, fileName = '') => {
    const img = new Image();
    img.onload = () => {
      const nw = img.naturalWidth || 400;
      const nh = img.naturalHeight || 300;
      const ratio = nw / nh;

      let targetW = 400;
      let targetH = 300;

      if (ratio >= 1) {
        // Landscape or square
        targetW = Math.min(500, Math.max(240, nw));
        targetH = Math.round(targetW / ratio);
      } else {
        // Portrait
        targetH = Math.min(440, Math.max(240, nh));
        targetW = Math.round(targetH * ratio);
      }

      onChange(id, {
        imageUrl: dataUrl,
        width: targetW,
        height: targetH,
        aspectRatio: ratio,
        caption: caption || fileName.replace(/\.[^/.]+$/, ''),
      });
    };
    img.src = dataUrl;
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          processImageDataUrl(event.target.result, file.name);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          processImageDataUrl(event.target.result, file.name);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      data-element-id={id}
      style={{
        position: 'absolute',
        transform: `translate3d(${x}px, ${y}px, 0) rotate(${rotation || 0}deg)`,
        transformOrigin: 'center center',
        width: `${width}px`,
        height: `${height}px`,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect && onSelect(id);
      }}
      onPointerDown={(e) => {
        if (!isEditingCaption && !isLocked) onPointerDown && onPointerDown(e, id);
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onContextMenu && onContextMenu(e, id);
      }}
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      className={`group select-none cursor-grab active:cursor-grabbing relative ${
        isLocked ? 'cursor-not-allowed' : ''
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {isSelected && !isLocked && (
        <ResizeHandles
          onResizeStart={onResizeStart}
          onRotateStart={onRotateStart}
          onQuickConnect={onQuickConnect}
        />
      )}

      {imageUrl ? (
        <div
          className={`w-full h-full rounded-2xl overflow-hidden shadow-sm transition-all duration-150 relative outline outline-[3px] bg-neutral-100 dark:bg-neutral-900/50 ${
            isSelected
              ? 'outline-blue-500 shadow-xl'
              : 'outline-neutral-300 dark:outline-neutral-700/80 hover:outline-neutral-400 dark:hover:outline-neutral-600'
          }`}
        >
          <img
            src={imageUrl}
            alt={caption || 'Visual reference'}
            className="w-full h-full object-contain pointer-events-none select-none rounded-2xl"
            draggable={false}
          />

          {/* Hover overlay actions */}
          <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="p-1 rounded-lg bg-black/60 backdrop-blur-md text-white hover:bg-black/80 transition cursor-pointer"
              title="Replace image"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>

          {/* Caption chip (Single-click selects/drags, Double-click to edit) */}
          {isEditingCaption ? (
            <input
              type="text"
              autoFocus
              value={caption}
              onChange={(e) => onChange(id, { caption: e.target.value })}
              onBlur={() => setIsEditingCaption(false)}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === 'Enter' || e.key === 'Escape') setIsEditingCaption(false);
              }}
              className="absolute bottom-2 left-2 px-2.5 py-1 rounded-xl bg-black/80 backdrop-blur-md text-[10px] text-white font-medium max-w-[85%] outline-none border border-blue-400 z-10"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            caption && (
              <div
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  if (!isLocked) setIsEditingCaption(true);
                }}
                className="absolute bottom-2 left-2 px-2.5 py-1 rounded-xl bg-black/65 backdrop-blur-md text-[10px] text-white font-medium max-w-[85%] truncate hover:bg-black/80 transition z-10"
                title="Double-click to edit caption"
              >
                {caption}
              </div>
            )
          )}

          {/* External Link */}
          {link && (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/65 backdrop-blur-md text-white text-[10px] hover:bg-black/85 transition z-10"
              title={`Open: ${link}`}
            >
              <ExternalLink className="w-2.5 h-2.5" />
              <span>Link</span>
            </a>
          )}

          {isLocked && (
            <div className="absolute top-2 left-2 p-1 rounded-md bg-black/60 backdrop-blur-md text-white">
              <Lock className="w-3 h-3" />
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
          className="w-full h-full rounded-2xl border-2 border-dashed border-neutral-300 dark:border-neutral-700/80 bg-white/80 dark:bg-[#222225]/80 hover:bg-neutral-50 dark:hover:bg-[#28282c] transition p-4 flex flex-col items-center justify-center text-center cursor-pointer shadow-xs"
        >
          <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-2">
            <ImageIcon className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
          </div>
          <span className="text-xs font-medium text-neutral-700 dark:text-neutral-200">
            Upload image
          </span>
          <span className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-0.5">
            Click or drag &amp; drop file
          </span>
        </div>
      )}
    </div>
  );
}
