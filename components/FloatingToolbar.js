'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  MousePointer,
  Hand,
  Pencil,
  StickyNote,
  ImageIcon,
  Square,
  Circle,
  Diamond,
  ArrowUpRight,
  Minus,
  Type,
  Eraser,
  Undo2,
  Redo2,
  Sun,
  Moon,
  Laptop,
  Download,
  Trash2,
  Plus,
  Grid,
  Rows3,
  Grid3X3,
  Maximize2,
  Video,
  Film,
  Upload,
} from 'lucide-react';
import { useTheme } from './ThemeContext';
import CustomColorPicker from './CustomColorPicker';

const PENCIL_PRESETS = [1, 2, 4, 8, 16, 24, 36];

const PENCIL_COLORS = [
  { id: 'auto', name: 'Auto', color: '#18181A' },
  { id: '#F59E0B', name: 'Amber', color: '#F59E0B' },
  { id: '#14B8A6', name: 'Teal', color: '#14B8A6' },
  { id: '#F43F5E', name: 'Rose', color: '#F43F5E' },
  { id: '#0284C7', name: 'Blue', color: '#0284C7' },
  { id: '#8B5CF6', name: 'Violet', color: '#8B5CF6' },
  { id: '#10B981', name: 'Emerald', color: '#10B981' },
  { id: '#64748B', name: 'Slate', color: '#64748B' },
];

const STICKY_PRESETS = [
  { id: 'amber', name: 'Amber note', bg: '#FEF08A', hoverBg: 'hover:bg-amber-100 dark:hover:bg-amber-950/60' },
  { id: 'teal', name: 'Teal note', bg: '#99F6E4', hoverBg: 'hover:bg-teal-100 dark:hover:bg-teal-950/60' },
  { id: 'rose', name: 'Rose note', bg: '#FECDD3', hoverBg: 'hover:bg-rose-100 dark:hover:bg-rose-950/60' },
  { id: 'violet', name: 'Violet note', bg: '#DDD6FE', hoverBg: 'hover:bg-violet-100 dark:hover:bg-violet-950/60' },
  { id: 'emerald', name: 'Emerald note', bg: '#A7F3D0', hoverBg: 'hover:bg-emerald-100 dark:hover:bg-emerald-950/60' },
  { id: 'sky', name: 'Sky note', bg: '#BAE6FD', hoverBg: 'hover:bg-sky-100 dark:hover:bg-sky-950/60' },
  { id: 'slate', name: 'Slate note', bg: '#E2E8F0', hoverBg: 'hover:bg-slate-100 dark:hover:bg-slate-900/60' },
];

const ERASER_PRESETS = [12, 24, 48, 72, 96];

export default function FloatingToolbar({
  activeTool,
  setActiveTool,
  pencilStrokeWidth,
  setPencilStrokeWidth,
  pencilColor,
  setPencilColor,
  eraserSize,
  setEraserSize,
  canvasPattern = 'dotted',
  onChangePattern,
  onAddStickyNote,
  onAddImageBlock,
  onAddVideo,
  onAddShape,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onClear,
  onExport,
}) {
  const { theme, isDark, setTheme } = useTheme();
  const [showPencilMenu, setShowPencilMenu] = useState(false);
  const [showEraserMenu, setShowEraserMenu] = useState(false);
  const [showShapeMenu, setShowShapeMenu] = useState(false);
  const [showNoteMenu, setShowNoteMenu] = useState(false);
  const [showVideoMenu, setShowVideoMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showPatternMenu, setShowPatternMenu] = useState(false);

  const [videoUrlInput, setVideoUrlInput] = useState('');
  const videoFileInputRef = useRef(null);

  const [showCustomStickyPicker, setShowCustomStickyPicker] = useState(false);
  const [showCustomPencilPicker, setShowCustomPencilPicker] = useState(false);

  const toolbarRef = useRef(null);

  const closeAllMenus = () => {
    setShowPencilMenu(false);
    setShowEraserMenu(false);
    setShowShapeMenu(false);
    setShowNoteMenu(false);
    setShowVideoMenu(false);
    setShowThemeMenu(false);
    setShowPatternMenu(false);
    setShowCustomStickyPicker(false);
    setShowCustomPencilPicker(false);
  };

  useEffect(() => {
    const handlePointerDownOutside = (e) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target)) {
        closeAllMenus();
      }
    };
    window.addEventListener('pointerdown', handlePointerDownOutside);
    return () => window.removeEventListener('pointerdown', handlePointerDownOutside);
  }, []);

  const buttonBase =
    'relative w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-150 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white cursor-pointer';
  const activeClass =
    'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm';
  const inactiveClass =
    'hover:bg-neutral-100 dark:hover:bg-neutral-800/80';

  const effectivePencilColor =
    pencilColor === 'auto' ? (isDark ? '#EDEDED' : '#18181A') : pencilColor;

  return (
    <aside
      ref={toolbarRef}
      aria-label="Whiteboard toolbar"
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
      className="absolute top-5 left-5 z-30 flex flex-col items-center gap-1.5 p-1.5 rounded-2xl bg-white/95 dark:bg-[#202024]/95 backdrop-blur-md border border-black/10 dark:border-white/10 shadow-lg shadow-black/5 select-none pointer-events-auto"
    >
      {/* Select / Move */}
      <button
        type="button"
        onClick={() => {
          setActiveTool('select');
          closeAllMenus();
        }}
        className={`${buttonBase} ${
          activeTool === 'select' ? activeClass : inactiveClass
        }`}
        title="Select / Move (V)"
      >
        <MousePointer className="w-4 h-4" />
      </button>

      {/* Hand Tool (Pan Canvas) */}
      <button
        type="button"
        onClick={() => {
          setActiveTool('hand');
          closeAllMenus();
        }}
        className={`${buttonBase} ${
          activeTool === 'hand' ? activeClass : inactiveClass
        }`}
        title="Hand tool (H) - Pan canvas without moving elements"
      >
        <Hand className="w-4 h-4" />
      </button>

      {/* Pencil / Freehand Draw with Slider */}
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setActiveTool('draw');
            setShowPencilMenu(!showPencilMenu);
            setShowEraserMenu(false);
            setShowShapeMenu(false);
            setShowNoteMenu(false);
            setShowThemeMenu(false);
            setShowCustomStickyPicker(false);
          }}
          className={`${buttonBase} ${
            activeTool === 'draw' ? activeClass : inactiveClass
          }`}
          title="Pencil / Freehand draw (P)"
        >
          <Pencil className="w-4 h-4" />
          <span
            className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full ring-1 ring-white/50"
            style={{ backgroundColor: effectivePencilColor }}
          />
        </button>

        {showPencilMenu && (
          <div className="absolute left-full top-0 ml-2.5 p-3 rounded-2xl bg-white dark:bg-[#222225] border border-black/10 dark:border-white/10 shadow-2xl flex flex-col gap-3 w-60 z-40 animate-in fade-in zoom-in-95 duration-100">
            {/* Stroke Thickness Slider */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400">
                  Stroke thickness
                </span>
                <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
                  {pencilStrokeWidth}px
                </span>
              </div>

              {/* Interactive Range Slider */}
              <input
                type="range"
                min="1"
                max="48"
                step="1"
                value={pencilStrokeWidth}
                onChange={(e) => setPencilStrokeWidth(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none"
              />

              {/* Quick Presets */}
              <div className="flex items-center justify-between gap-1 mt-2">
                {PENCIL_PRESETS.map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setPencilStrokeWidth(w)}
                    className={`px-1.5 py-0.5 text-[9px] rounded font-mono transition cursor-pointer ${
                      pencilStrokeWidth === w
                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold'
                        : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>

              {/* Visual Stroke Preview Circle */}
              <div className="mt-2.5 h-10 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-black/5 dark:border-white/5 flex items-center justify-center">
                <div
                  className="rounded-full transition-all duration-75"
                  style={{
                    width: `${Math.min(pencilStrokeWidth, 32)}px`,
                    height: `${Math.min(pencilStrokeWidth, 32)}px`,
                    backgroundColor: effectivePencilColor,
                  }}
                />
              </div>
            </div>

            {/* Stroke Color */}
            <div>
              <span className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400 block mb-1.5">
                Stroke color
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {PENCIL_COLORS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setPencilColor(c.id)}
                    className={`h-6 rounded-lg border flex items-center justify-center transition-transform cursor-pointer ${
                      pencilColor === c.id
                        ? 'ring-2 ring-blue-500 scale-105 border-transparent'
                        : 'border-black/10 dark:border-white/10 hover:scale-105 opacity-80 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor:
                        c.id === 'auto'
                          ? isDark
                            ? '#EDEDED'
                            : '#18181A'
                          : c.color,
                    }}
                    title={c.name}
                  />
                ))}

                {/* Custom Hex Color Picker Button */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setShowCustomPencilPicker(!showCustomPencilPicker)
                    }
                    className={`w-full h-6 rounded-lg border border-dashed flex items-center justify-center transition cursor-pointer ${
                      pencilColor.startsWith('#') &&
                      !PENCIL_COLORS.some((p) => p.color === pencilColor)
                        ? 'ring-2 ring-blue-500 scale-105 border-transparent'
                        : 'border-neutral-300 dark:border-neutral-600 hover:border-neutral-500'
                    }`}
                    style={{
                      backgroundColor:
                        pencilColor.startsWith('#') &&
                        !PENCIL_COLORS.some((p) => p.color === pencilColor)
                          ? pencilColor
                          : 'transparent',
                    }}
                    title="Custom hex color"
                  >
                    <Plus className="w-3 h-3 text-neutral-500 dark:text-neutral-400" />
                  </button>

                  {showCustomPencilPicker && (
                    <CustomColorPicker
                      value={
                        pencilColor.startsWith('#') ? pencilColor : '#3B82F6'
                      }
                      onChange={(hex) => setPencilColor(hex)}
                      onClose={() => setShowCustomPencilPicker(false)}
                      position="bottom"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Notes */}
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setShowNoteMenu(!showNoteMenu);
            setShowPencilMenu(false);
            setShowEraserMenu(false);
            setShowShapeMenu(false);
            setShowThemeMenu(false);
            setShowCustomPencilPicker(false);
          }}
          className={`${buttonBase} ${
            showNoteMenu ? activeClass : inactiveClass
          }`}
          title="Add sticky note (N)"
        >
          <StickyNote className="w-4 h-4" />
          <span className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-500 ring-1 ring-white/50" />
        </button>

        {showNoteMenu && (
          <div className="absolute left-full top-0 ml-2.5 p-2 rounded-2xl bg-white dark:bg-[#222225] border border-black/10 dark:border-white/10 shadow-xl flex flex-col gap-1 w-52 z-40 animate-in fade-in zoom-in-95 duration-100">
            <span className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400 px-2 py-0.5">
              Add sticky note
            </span>
            {STICKY_PRESETS.map((note) => (
              <button
                key={note.id}
                type="button"
                onClick={() => {
                  onAddStickyNote({ color: note.id, isSquare: true });
                  closeAllMenus();
                }}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium text-neutral-700 dark:text-neutral-200 ${note.hoverBg} transition text-left cursor-pointer`}
              >
                <span
                  className="w-3.5 h-3.5 rounded-none border border-black/10 shrink-0"
                  style={{ backgroundColor: note.bg }}
                />
                <span>{note.name}</span>
              </button>
            ))}

            {/* Custom Hex Color Sticky Note Option (App UI) */}
            <div className="pt-1 mt-0.5 border-t border-black/5 dark:border-white/5 relative">
              <button
                type="button"
                onClick={() =>
                  setShowCustomStickyPicker(!showCustomStickyPicker)
                }
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition text-left cursor-pointer"
              >
                <div className="w-3.5 h-3.5 rounded-none border border-dashed border-neutral-400 flex items-center justify-center shrink-0">
                  <Plus className="w-2.5 h-2.5 text-neutral-500" />
                </div>
                <span>Custom hex color...</span>
              </button>

              {showCustomStickyPicker && (
                <CustomColorPicker
                  value="#FEF08A"
                  onChange={(hex) => {
                    onAddStickyNote({ color: hex, isSquare: true });
                    closeAllMenus();
                  }}
                  onClose={() => setShowCustomStickyPicker(false)}
                  position="bottom"
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Image Reference Block */}
      <button
        type="button"
        onClick={() => {
          onAddImageBlock();
          closeAllMenus();
        }}
        className={`${buttonBase} ${inactiveClass}`}
        title="Image reference block (I)"
      >
        <ImageIcon className="w-4 h-4" />
      </button>

      {/* Video & Social Media Reels / Posts Embed Tool */}
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setShowVideoMenu(!showVideoMenu);
            setShowPencilMenu(false);
            setShowEraserMenu(false);
            setShowShapeMenu(false);
            setShowNoteMenu(false);
            setShowThemeMenu(false);
            setShowPatternMenu(false);
          }}
          className={`${buttonBase} ${
            showVideoMenu ? activeClass : inactiveClass
          }`}
          title="Video & Social Media Reels / Embeds"
        >
          <Video className="w-4 h-4" />
        </button>

        {showVideoMenu && (
          <div
            onWheel={(e) => e.stopPropagation()}
            className="absolute left-full top-0 ml-2.5 p-3 rounded-2xl bg-white dark:bg-[#222225] border border-black/10 dark:border-white/10 shadow-2xl flex flex-col gap-2.5 w-64 z-40 animate-in fade-in zoom-in-95 duration-100"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold tracking-tight text-neutral-700 dark:text-neutral-200">
                Insert Video or Reel
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium">
                Instagram / YouTube
              </span>
            </div>

            {/* Paste Link input */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-medium text-neutral-400">
                Paste video or reel URL
              </label>
              <input
                type="text"
                value={videoUrlInput}
                onChange={(e) => setVideoUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && videoUrlInput.trim()) {
                    onAddVideo && onAddVideo(videoUrlInput.trim());
                    setVideoUrlInput('');
                    closeAllMenus();
                  }
                }}
                placeholder="https://instagram.com/reel/... or YouTube"
                className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-neutral-100 dark:bg-neutral-800/80 border border-black/5 dark:border-white/10 outline-none focus:ring-2 focus:ring-blue-500/20 text-neutral-800 dark:text-neutral-100"
              />
              <button
                type="button"
                disabled={!videoUrlInput.trim()}
                onClick={() => {
                  if (videoUrlInput.trim()) {
                    onAddVideo && onAddVideo(videoUrlInput.trim());
                    setVideoUrlInput('');
                    closeAllMenus();
                  }
                }}
                className={`w-full py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer mt-1 ${
                  videoUrlInput.trim()
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                    : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed'
                }`}
              >
                Insert Link into Canvas
              </button>
            </div>

            <div className="flex items-center gap-2 my-0.5">
              <div className="flex-1 h-[1px] bg-neutral-200 dark:bg-neutral-800" />
              <span className="text-[9px] text-neutral-400 uppercase font-medium">or</span>
              <div className="flex-1 h-[1px] bg-neutral-200 dark:bg-neutral-800" />
            </div>

            {/* Upload Video File */}
            <input
              ref={videoFileInputRef}
              type="file"
              accept="video/mp4,video/webm,video/ogg,video/quicktime"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const url = URL.createObjectURL(file);
                  onAddVideo && onAddVideo(url, file.name);
                  closeAllMenus();
                }
              }}
            />
            <button
              type="button"
              onClick={() => videoFileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 text-xs font-medium text-neutral-700 dark:text-neutral-200 transition cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-blue-500" />
              <span>Upload .mp4 / .webm file</span>
            </button>
          </div>
        )}
      </div>

      {/* Shapes (Rectangle, Circle, Diamond, Arrow, Line) */}
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setShowShapeMenu(!showShapeMenu);
            setShowPencilMenu(false);
            setShowEraserMenu(false);
            setShowNoteMenu(false);
            setShowThemeMenu(false);
          }}
          className={`${buttonBase} ${
            showShapeMenu ? activeClass : inactiveClass
          }`}
          title="Shapes (S)"
        >
          <Square className="w-4 h-4" />
        </button>

        {showShapeMenu && (
          <div className="absolute left-full top-0 ml-2.5 p-2 rounded-2xl bg-white dark:bg-[#222225] border border-black/10 dark:border-white/10 shadow-xl grid grid-cols-2 gap-1.5 w-44 z-40 animate-in fade-in zoom-in-95 duration-100">
            <button
              type="button"
              onClick={() => {
                onAddShape('rectangle');
                closeAllMenus();
              }}
              className="p-2 rounded-xl flex flex-col items-center justify-center gap-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 transition cursor-pointer"
              title="Rectangle"
            >
              <Square className="w-4 h-4" />
              <span className="text-[10px]">Rectangle</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onAddShape('ellipse');
                closeAllMenus();
              }}
              className="p-2 rounded-xl flex flex-col items-center justify-center gap-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 transition cursor-pointer"
              title="Circle"
            >
              <Circle className="w-4 h-4" />
              <span className="text-[10px]">Circle</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onAddShape('diamond');
                closeAllMenus();
              }}
              className="p-2 rounded-xl flex flex-col items-center justify-center gap-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 transition cursor-pointer"
              title="Diamond"
            >
              <Diamond className="w-4 h-4" />
              <span className="text-[10px]">Diamond</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onAddShape('arrow');
                closeAllMenus();
              }}
              className="p-2 rounded-xl flex flex-col items-center justify-center gap-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 transition cursor-pointer"
              title="Arrow"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span className="text-[10px]">Arrow</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onAddShape('line');
                closeAllMenus();
              }}
              className="col-span-2 p-2 rounded-xl flex items-center justify-center gap-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 transition cursor-pointer"
              title="Line"
            >
              <Minus className="w-4 h-4" />
              <span className="text-[10px]">Line</span>
            </button>
          </div>
        )}
      </div>

      {/* Text Tool */}
      <button
        type="button"
        onClick={() => {
          onAddShape('text');
          closeAllMenus();
        }}
        className={`${buttonBase} ${
          activeTool === 'text' ? activeClass : inactiveClass
        }`}
        title="Text tool (T)"
      >
        <Type className="w-4 h-4" />
      </button>

      {/* Eraser with Slider */}
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setActiveTool('eraser');
            setShowEraserMenu(!showEraserMenu);
            setShowPencilMenu(false);
            setShowShapeMenu(false);
            setShowNoteMenu(false);
            setShowThemeMenu(false);
          }}
          className={`${buttonBase} ${
            activeTool === 'eraser' ? activeClass : inactiveClass
          }`}
          title="Eraser (E)"
        >
          <Eraser className="w-4 h-4" />
        </button>

        {showEraserMenu && (
          <div className="absolute left-full top-0 ml-2.5 p-3 rounded-2xl bg-white dark:bg-[#222225] border border-black/10 dark:border-white/10 shadow-2xl flex flex-col gap-3 w-56 z-40 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400">
                Eraser radius
              </span>
              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
                {eraserSize}px
              </span>
            </div>

            {/* Interactive Eraser Range Slider */}
            <input
              type="range"
              min="8"
              max="120"
              step="2"
              value={eraserSize}
              onChange={(e) => {
                setEraserSize(Number(e.target.value));
                setActiveTool('eraser');
              }}
              className="w-full accent-rose-500 cursor-pointer h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none"
            />

            {/* Quick Presets */}
            <div className="flex items-center justify-between gap-1">
              {ERASER_PRESETS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setEraserSize(s);
                    setActiveTool('eraser');
                  }}
                  className={`px-1.5 py-0.5 text-[9px] rounded font-mono transition cursor-pointer ${
                    eraserSize === s
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold'
                      : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Visual Eraser Circle Preview */}
            <div className="h-16 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-black/5 dark:border-white/5 flex items-center justify-center overflow-hidden">
              <div
                className="rounded-full border-2 border-dashed border-rose-500/80 bg-rose-500/10 transition-all duration-75"
                style={{
                  width: `${Math.min(eraserSize, 56)}px`,
                  height: `${Math.min(eraserSize, 56)}px`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="w-6 h-[1px] bg-neutral-200 dark:bg-neutral-800 my-0.5" />

      {/* Undo */}
      <button
        type="button"
        onClick={onUndo}
        disabled={!canUndo}
        className={`${buttonBase} ${
          canUndo
            ? inactiveClass
            : 'opacity-30 cursor-not-allowed pointer-events-none'
        }`}
        title="Undo (Ctrl+Z)"
      >
        <Undo2 className="w-4 h-4" />
      </button>

      {/* Redo */}
      <button
        type="button"
        onClick={onRedo}
        disabled={!canRedo}
        className={`${buttonBase} ${
          canRedo
            ? inactiveClass
            : 'opacity-30 cursor-not-allowed pointer-events-none'
        }`}
        title="Redo (Ctrl+Y)"
      >
        <Redo2 className="w-4 h-4" />
      </button>

      <div className="w-6 h-[1px] bg-neutral-200 dark:bg-neutral-800 my-0.5" />

      {/* Canvas Background Pattern Switcher (Dotted, Notebook Lines, Boxes, Blank) */}
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setShowPatternMenu(!showPatternMenu);
            setShowThemeMenu(false);
            setShowPencilMenu(false);
            setShowEraserMenu(false);
            setShowShapeMenu(false);
            setShowNoteMenu(false);
          }}
          className={`${buttonBase} ${showPatternMenu ? activeClass : inactiveClass}`}
          title={`Canvas background: ${canvasPattern} (Click to change)`}
        >
          {canvasPattern === 'dotted' && <Grid className="w-4 h-4" />}
          {canvasPattern === 'lines' && <Rows3 className="w-4 h-4" />}
          {canvasPattern === 'grid' && <Grid3X3 className="w-4 h-4" />}
          {canvasPattern === 'blank' && <Maximize2 className="w-4 h-4" />}
        </button>

        {showPatternMenu && (
          <div
            onWheel={(e) => e.stopPropagation()}
            className="absolute left-full top-0 ml-2.5 p-2 rounded-2xl bg-white dark:bg-[#222225] border border-black/10 dark:border-white/10 shadow-2xl flex flex-col gap-1 w-44 z-40 animate-in fade-in zoom-in-95 duration-100"
          >
            <span className="text-[10px] font-semibold text-neutral-400 px-2 py-0.5">
              Canvas pattern
            </span>
            <button
              type="button"
              onClick={() => {
                onChangePattern && onChangePattern('dotted');
                setShowPatternMenu(false);
              }}
              className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs transition cursor-pointer ${
                canvasPattern === 'dotted'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold shadow-xs'
                  : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Dotted</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onChangePattern && onChangePattern('lines');
                setShowPatternMenu(false);
              }}
              className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs transition cursor-pointer ${
                canvasPattern === 'lines'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold shadow-xs'
                  : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200'
              }`}
            >
              <Rows3 className="w-3.5 h-3.5" />
              <span>Notebook lines</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onChangePattern && onChangePattern('grid');
                setShowPatternMenu(false);
              }}
              className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs transition cursor-pointer ${
                canvasPattern === 'grid'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold shadow-xs'
                  : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200'
              }`}
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              <span>Boxes / Grid</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onChangePattern && onChangePattern('blank');
                setShowPatternMenu(false);
              }}
              className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs transition cursor-pointer ${
                canvasPattern === 'blank'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold shadow-xs'
                  : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200'
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Blank</span>
            </button>
          </div>
        )}
      </div>

      {/* Theme Switcher (Light / Dark / System) */}
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setShowThemeMenu(!showThemeMenu);
            setShowPencilMenu(false);
            setShowEraserMenu(false);
            setShowShapeMenu(false);
            setShowNoteMenu(false);
          }}
          className={`${buttonBase} ${inactiveClass}`}
          title={`Theme: ${theme} (Click to change)`}
        >
          {theme === 'system' ? (
            <Laptop className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
          ) : isDark ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-neutral-600" />
          )}
        </button>

        {showThemeMenu && (
          <div className="absolute left-full top-0 ml-2.5 p-2 rounded-2xl bg-white dark:bg-[#222225] border border-black/10 dark:border-white/10 shadow-xl flex flex-col gap-1 w-32 z-40 animate-in fade-in zoom-in-95 duration-100">
            <button
              type="button"
              onClick={() => {
                setTheme('light');
                setShowThemeMenu(false);
              }}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                theme === 'light'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                  : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Light</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setTheme('dark');
                setShowThemeMenu(false);
              }}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                theme === 'dark'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                  : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Dark</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setTheme('system');
                setShowThemeMenu(false);
              }}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                theme === 'system'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                  : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>System</span>
            </button>
          </div>
        )}
      </div>

      {/* Export */}
      <button
        type="button"
        onClick={onExport}
        className={`${buttonBase} ${inactiveClass}`}
        title="Export canvas (JSON)"
      >
        <Download className="w-4 h-4" />
      </button>

      {/* Clear Canvas */}
      <button
        type="button"
        onClick={onClear}
        className={`${buttonBase} hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400`}
        title="Clear canvas"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </aside>
  );
}
