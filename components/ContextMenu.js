'use client';

import React, { useEffect, useRef } from 'react';
import {
  Link2,
  Copy,
  BringToFront,
  SendToBack,
  Lock,
  Unlock,
  Trash2,
  ExternalLink,
  StickyNote,
  Square,
  Type,
  ImageIcon,
  Maximize2,
  RotateCcw,
} from 'lucide-react';
import { useTheme } from './ThemeContext';

export default function ContextMenu({
  x,
  y,
  selectedElement,
  onClose,
  onAddLink,
  onDuplicate,
  onBringToFront,
  onSendToBack,
  onToggleLock,
  onDelete,
  onAddStickyNote,
  onAddShape,
  onAddImageBlock,
  onFitView,
  onResetZoom,
  onClear,
}) {
  const { isDark } = useTheme();
  const menuRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('pointerdown', handleOutsideClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('pointerdown', handleOutsideClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const menuWidth = 220;
  const menuHeight = selectedElement ? 280 : 250;
  const posX = Math.min(x, typeof window !== 'undefined' ? window.innerWidth - menuWidth - 16 : x);
  const posY = Math.min(y, typeof window !== 'undefined' ? window.innerHeight - menuHeight - 16 : y);

  const itemClass =
    'w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition text-left cursor-pointer';

  return (
    <div
      ref={menuRef}
      onWheel={(e) => e.stopPropagation()}
      style={{ top: posY, left: posX }}
      className="fixed z-50 w-56 p-1.5 rounded-2xl bg-white/95 dark:bg-[#222225]/95 backdrop-blur-md border border-black/10 dark:border-white/10 shadow-2xl shadow-black/20 select-none animate-in fade-in zoom-in-95 duration-100 font-sans"
    >
      {selectedElement ? (
        <>
          {/* Add / Edit Link */}
          <button
            onClick={() => {
              onAddLink(selectedElement.id);
              onClose();
            }}
            className={itemClass}
          >
            <div className="flex items-center gap-2">
              <Link2 className="w-3.5 h-3.5 text-blue-500" />
              <span>{selectedElement.link ? 'Edit link' : 'Add link'}</span>
            </div>
            <span className="text-[10px] text-neutral-400 font-mono">Ctrl+K</span>
          </button>

          {selectedElement.link && (
            <a
              href={selectedElement.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className={itemClass}
            >
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open link in new tab</span>
              </div>
            </a>
          )}

          <div className="w-full h-[1px] bg-neutral-200/80 dark:bg-neutral-800 my-1" />

          {/* Duplicate */}
          <button
            onClick={() => {
              onDuplicate(selectedElement.id);
              onClose();
            }}
            className={itemClass}
          >
            <div className="flex items-center gap-2">
              <Copy className="w-3.5 h-3.5 text-neutral-500" />
              <span>Duplicate</span>
            </div>
            <span className="text-[10px] text-neutral-400 font-mono">Ctrl+D</span>
          </button>

          {/* Bring to front */}
          <button
            onClick={() => {
              onBringToFront(selectedElement.id);
              onClose();
            }}
            className={itemClass}
          >
            <div className="flex items-center gap-2">
              <BringToFront className="w-3.5 h-3.5 text-neutral-500" />
              <span>Bring to front</span>
            </div>
            <span className="text-[10px] text-neutral-400 font-mono">]</span>
          </button>

          {/* Send to back */}
          <button
            onClick={() => {
              onSendToBack(selectedElement.id);
              onClose();
            }}
            className={itemClass}
          >
            <div className="flex items-center gap-2">
              <SendToBack className="w-3.5 h-3.5 text-neutral-500" />
              <span>Send to back</span>
            </div>
            <span className="text-[10px] text-neutral-400 font-mono">[</span>
          </button>

          {/* Lock / Unlock */}
          <button
            onClick={() => {
              onToggleLock(selectedElement.id);
              onClose();
            }}
            className={itemClass}
          >
            <div className="flex items-center gap-2">
              {selectedElement.isLocked ? (
                <>
                  <Unlock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Unlock element</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Lock position</span>
                </>
              )}
            </div>
          </button>

          <div className="w-full h-[1px] bg-neutral-200/80 dark:bg-neutral-800 my-1" />

          {/* Delete */}
          <button
            onClick={() => {
              onDelete(selectedElement.id);
              onClose();
            }}
            className={`${itemClass} text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40`}
          >
            <div className="flex items-center gap-2">
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </div>
            <span className="text-[10px] text-rose-400 font-mono">Del</span>
          </button>
        </>
      ) : (
        <>
          <div className="px-3 py-1 text-[10px] font-semibold text-neutral-400 dark:text-neutral-500">
            Canvas actions
          </div>

          <button
            onClick={() => {
              onAddStickyNote && onAddStickyNote({ color: 'amber', isSquare: true });
              onClose();
            }}
            className={itemClass}
          >
            <div className="flex items-center gap-2">
              <StickyNote className="w-3.5 h-3.5 text-amber-500" />
              <span>Add sticky note</span>
            </div>
            <span className="text-[10px] text-neutral-400 font-mono">N</span>
          </button>

          <button
            onClick={() => {
              onAddShape && onAddShape('rectangle');
              onClose();
            }}
            className={itemClass}
          >
            <div className="flex items-center gap-2">
              <Square className="w-3.5 h-3.5 text-blue-500" />
              <span>Add rectangle</span>
            </div>
            <span className="text-[10px] text-neutral-400 font-mono">S</span>
          </button>

          <button
            onClick={() => {
              onAddShape && onAddShape('text');
              onClose();
            }}
            className={itemClass}
          >
            <div className="flex items-center gap-2">
              <Type className="w-3.5 h-3.5 text-emerald-500" />
              <span>Add text</span>
            </div>
            <span className="text-[10px] text-neutral-400 font-mono">T</span>
          </button>

          <button
            onClick={() => {
              onAddImageBlock && onAddImageBlock();
              onClose();
            }}
            className={itemClass}
          >
            <div className="flex items-center gap-2">
              <ImageIcon className="w-3.5 h-3.5 text-violet-500" />
              <span>Upload image</span>
            </div>
            <span className="text-[10px] text-neutral-400 font-mono">I</span>
          </button>

          <div className="w-full h-[1px] bg-neutral-200/80 dark:bg-neutral-800 my-1" />

          <button
            onClick={() => {
              onFitView && onFitView();
              onClose();
            }}
            className={itemClass}
          >
            <div className="flex items-center gap-2">
              <Maximize2 className="w-3.5 h-3.5 text-neutral-500" />
              <span>Fit to view</span>
            </div>
          </button>

          <button
            onClick={() => {
              onResetZoom && onResetZoom();
              onClose();
            }}
            className={itemClass}
          >
            <div className="flex items-center gap-2">
              <RotateCcw className="w-3.5 h-3.5 text-neutral-500" />
              <span>Reset zoom (100%)</span>
            </div>
            <span className="text-[10px] text-neutral-400 font-mono">0</span>
          </button>
        </>
      )}
    </div>
  );
}
