'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Square,
  Link2,
  PaintBucket,
  Plus,
  Minus,
  Type,
  ChevronDown,
  RotateCw,
  SlidersHorizontal,
} from 'lucide-react';
import { useTheme } from './ThemeContext';
import CustomColorPicker from './CustomColorPicker';
import { FONT_FAMILIES } from '../lib/fontLibrary';

const QUICK_FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64, 72, 96, 120];

const COLOR_PALETTE = [
  { id: 'auto', name: 'Auto adaptive', color: '#18181A' },
  { id: '#F59E0B', name: 'Amber', color: '#F59E0B' },
  { id: '#14B8A6', name: 'Teal', color: '#14B8A6' },
  { id: '#F43F5E', name: 'Rose', color: '#F43F5E' },
  { id: '#0284C7', name: 'Blue', color: '#0284C7' },
  { id: '#8B5CF6', name: 'Violet', color: '#8B5CF6' },
  { id: '#10B981', name: 'Emerald', color: '#10B981' },
  { id: '#64748B', name: 'Slate', color: '#64748B' },
];

const SHAPE_FILL_PRESETS = [
  { id: 'transparent', name: 'Transparent (No fill)', color: 'transparent' },
  { id: '#E0F2FE', name: 'Soft Sky Blue', color: '#E0F2FE' },
  { id: '#DCFCE7', name: 'Soft Green', color: '#DCFCE7' },
  { id: '#FEF3C7', name: 'Soft Amber', color: '#FEF3C7' },
  { id: '#FFE4E6', name: 'Soft Rose', color: '#FFE4E6' },
  { id: '#EDE9FE', name: 'Soft Violet', color: '#EDE9FE' },
  { id: '#F1F5F9', name: 'Soft Slate', color: '#F1F5F9' },
  { id: '#2E2E32', name: 'Dark Slate', color: '#2E2E32' },
  { id: '#FFFFFF', name: 'Solid White', color: '#FFFFFF' },
];

const STICKY_COLORS = [
  { id: 'amber', name: 'Amber', bg: '#FEF08A' },
  { id: 'teal', name: 'Teal', bg: '#99F6E4' },
  { id: 'rose', name: 'Rose', bg: '#FECDD3' },
  { id: 'violet', name: 'Violet', bg: '#DDD6FE' },
  { id: 'emerald', name: 'Emerald', bg: '#A7F3D0' },
  { id: 'sky', name: 'Sky', bg: '#BAE6FD' },
  { id: 'slate', name: 'Slate', bg: '#E2E8F0' },
];

export default function ElementInspector({
  selectedElement,
  onChange,
  onOpenLinkModal,
}) {
  const { isDark } = useTheme();
  const [showStickyPicker, setShowStickyPicker] = useState(false);
  const [showStrokePicker, setShowStrokePicker] = useState(false);
  const [showFillMenu, setShowFillMenu] = useState(false);
  const [showCustomFillPicker, setShowCustomFillPicker] = useState(false);
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [showSizeMenu, setShowSizeMenu] = useState(false);
  const [showSpacingMenu, setShowSpacingMenu] = useState(false);

  const fontMenuRef = useRef(null);
  const fillMenuRef = useRef(null);
  const sizeMenuRef = useRef(null);
  const spacingMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (fontMenuRef.current && !fontMenuRef.current.contains(e.target)) {
        setShowFontMenu(false);
      }
      if (fillMenuRef.current && !fillMenuRef.current.contains(e.target)) {
        setShowFillMenu(false);
        setShowCustomFillPicker(false);
      }
      if (sizeMenuRef.current && !sizeMenuRef.current.contains(e.target)) {
        setShowSizeMenu(false);
      }
      if (spacingMenuRef.current && !spacingMenuRef.current.contains(e.target)) {
        setShowSpacingMenu(false);
      }
    };
    window.addEventListener('pointerdown', handleClickOutside);
    return () => window.removeEventListener('pointerdown', handleClickOutside);
  }, []);

  if (!selectedElement) return null;

  const isSticky = selectedElement.type === 'sticky-note';
  const isText = selectedElement.type === 'text';
  const isClosedShape =
    selectedElement.type === 'rectangle' ||
    selectedElement.type === 'ellipse' ||
    selectedElement.type === 'diamond';
  const isLineOrArrow =
    selectedElement.type === 'line' ||
    selectedElement.type === 'flow-connector' ||
    selectedElement.type === 'arrow';
  const isShape = isClosedShape || isLineOrArrow;
  const isVideo = selectedElement.type === 'video-block';
  const hasTextCapabilities = isSticky || isText || isClosedShape;

  const btnBase =
    'p-1.5 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition flex items-center justify-center cursor-pointer';
  const activeBtn =
    'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold shadow-xs';

  // Execute rich text formatting
  const handleExecFormat = (command, toggleField) => {
    const sel = typeof window !== 'undefined' ? window.getSelection() : null;
    if (sel && sel.toString().length > 0) {
      document.execCommand(command, false, null);
    } else {
      onChange(selectedElement.id, {
        [toggleField]: !selectedElement[toggleField],
      });
    }
  };

  const currentFontId = selectedElement.fontFamily || 'Inter';
  const currentFont =
    FONT_FAMILIES.find((f) => f.id === currentFontId) || FONT_FAMILIES[0];

  const currentFontSize =
    typeof selectedElement.fontSize === 'number'
      ? selectedElement.fontSize
      : selectedElement.fontSize === 'small'
      ? 14
      : selectedElement.fontSize === 'large'
      ? 28
      : selectedElement.fontSize === 'heading'
      ? 36
      : 24;

  const handleStepFontSize = (delta) => {
    const next = Math.max(8, Math.min(180, currentFontSize + delta));
    onChange(selectedElement.id, { fontSize: next });
  };

  return (
    <div
      role="toolbar"
      aria-label="Element formatting"
      onPointerDown={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
      className="absolute top-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/95 dark:bg-[#202024]/95 backdrop-blur-md border border-black/10 dark:border-white/10 shadow-xl shadow-black/5 text-xs select-none animate-in fade-in slide-in-from-top-2 duration-150 pointer-events-auto max-w-[95vw] overflow-x-auto custom-scrollbar"
    >
      {/* Sticky Note: Color Presets, In-App Custom Hex Picker & Square/Rect Toggle */}
      {isSticky && (
        <>
          <div className="flex items-center gap-1 px-1 relative">
            {STICKY_COLORS.map((c) => (
              <button
                key={c.id}
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(selectedElement.id, { color: c.id });
                  setShowStickyPicker(false);
                }}
                className={`w-4 h-4 rounded-none transition-transform cursor-pointer border border-black/10 dark:border-white/10 ${
                  selectedElement.color === c.id
                    ? 'ring-2 ring-blue-500 scale-110'
                    : 'opacity-80 hover:opacity-100 hover:scale-105'
                }`}
                style={{ backgroundColor: c.bg }}
                title={`${c.name} note`}
              />
            ))}

            {/* Custom Hex Color Picker with Done Button */}
            <div className="relative">
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowStickyPicker(!showStickyPicker);
                }}
                className={`w-5 h-5 rounded-none border border-dashed flex items-center justify-center transition cursor-pointer ${
                  selectedElement.color?.startsWith('#')
                    ? 'ring-2 ring-blue-500 scale-110 border-transparent shadow-xs'
                    : 'border-neutral-300 dark:border-neutral-600 hover:border-neutral-500'
                }`}
                style={{
                  backgroundColor: selectedElement.color?.startsWith('#')
                    ? selectedElement.color
                    : 'transparent',
                }}
                title="Custom color (Hex picker with Done button)"
              >
                {!selectedElement.color?.startsWith('#') && (
                  <Plus className="w-2.5 h-2.5 text-neutral-500 dark:text-neutral-400" />
                )}
              </button>

              {showStickyPicker && (
                <CustomColorPicker
                  value={
                    selectedElement.color?.startsWith('#')
                      ? selectedElement.color
                      : '#FEF08A'
                  }
                  onChange={(hex) =>
                    onChange(selectedElement.id, { color: hex })
                  }
                  onClose={() => setShowStickyPicker(false)}
                  position="bottom"
                />
              )}
            </div>
          </div>

          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onChange(selectedElement.id, {
                isSquare: !selectedElement.isSquare,
                height: !selectedElement.isSquare
                  ? selectedElement.width || 220
                  : 160,
              });
            }}
            className={`${btnBase} ${
              selectedElement.isSquare ? activeBtn : ''
            } px-2`}
            title="Toggle square / rectangular mode"
          >
            <Square className="w-3.5 h-3.5 mr-1" />
            <span className="text-[10px]">
              {selectedElement.isSquare ? 'Square' : 'Rectangle'}
            </span>
          </button>

          <div className="w-[1px] h-4 bg-neutral-200 dark:bg-neutral-800 mx-0.5" />
        </>
      )}

      {/* Font Family Library Dropdown (Canva typography) */}
      {hasTextCapabilities && (
        <div ref={fontMenuRef} className="relative">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onClick={() => setShowFontMenu(!showFontMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800/80 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition cursor-pointer font-medium text-[11px]"
            title="Choose typography font"
          >
            <Type className="w-3 h-3 text-neutral-400" />
            <span className="max-w-[85px] truncate" style={currentFont.style}>
              {currentFont.name.split(' ')[0]}
            </span>
            <ChevronDown className="w-2.5 h-2.5 opacity-60" />
          </button>

          {showFontMenu && (
            <div
              onWheel={(e) => e.stopPropagation()}
              className="absolute top-full left-0 mt-1.5 p-1.5 rounded-2xl bg-white dark:bg-[#222225] border border-black/10 dark:border-white/10 shadow-2xl flex flex-col gap-1 w-56 z-50 animate-in fade-in zoom-in-95 duration-100"
            >
              <span className="text-[10px] font-medium text-neutral-400 px-2 py-0.5">
                Font library
              </span>
              <div
                onWheel={(e) => e.stopPropagation()}
                className="max-h-60 overflow-y-auto custom-scrollbar flex flex-col gap-0.5 pr-1"
              >
                {FONT_FAMILIES.map((font) => (
                  <button
                    key={font.id}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={() => {
                      onChange(selectedElement.id, { fontFamily: font.id });
                      setShowFontMenu(false);
                    }}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left transition cursor-pointer ${
                      currentFontId === font.id
                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold'
                        : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200'
                    }`}
                  >
                    <span className="text-xs" style={font.style}>
                      {font.name}
                    </span>
                    <span className="text-[9px] opacity-50 uppercase tracking-tight">
                      {font.category}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Canva Numeric Font Size Stepper & Input */}
      {hasTextCapabilities && (
        <div ref={sizeMenuRef} className="relative flex items-center bg-neutral-100 dark:bg-neutral-800/80 rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => handleStepFontSize(-2)}
            className="p-1 hover:bg-white dark:hover:bg-neutral-700 rounded text-neutral-600 dark:text-neutral-300 transition"
            title="Decrease font size"
          >
            <Minus className="w-2.5 h-2.5" />
          </button>

          <input
            type="number"
            value={currentFontSize}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val) && val > 4) {
                onChange(selectedElement.id, { fontSize: val });
              }
            }}
            className="w-8 text-center bg-transparent font-mono text-[11px] font-semibold text-neutral-800 dark:text-neutral-100 outline-none"
            title="Font size (px)"
          />

          <button
            type="button"
            onClick={() => handleStepFontSize(2)}
            className="p-1 hover:bg-white dark:hover:bg-neutral-700 rounded text-neutral-600 dark:text-neutral-300 transition"
            title="Increase font size"
          >
            <Plus className="w-2.5 h-2.5" />
          </button>

          <button
            type="button"
            onClick={() => setShowSizeMenu(!showSizeMenu)}
            className="p-0.5 hover:bg-white dark:hover:bg-neutral-700 rounded text-neutral-400"
          >
            <ChevronDown className="w-2.5 h-2.5" />
          </button>

          {showSizeMenu && (
            <div
              onWheel={(e) => e.stopPropagation()}
              className="absolute top-full left-0 mt-1.5 p-1 rounded-xl bg-white dark:bg-[#222225] border border-black/10 dark:border-white/10 shadow-2xl flex flex-col gap-0.5 w-24 max-h-48 overflow-y-auto custom-scrollbar z-50 animate-in fade-in zoom-in-95 duration-100"
            >
              {QUICK_FONT_SIZES.map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => {
                    onChange(selectedElement.id, { fontSize: sz });
                    setShowSizeMenu(false);
                  }}
                  className={`px-2 py-1 text-xs text-left rounded-lg transition ${
                    currentFontSize === sz
                      ? 'bg-blue-500 text-white font-semibold'
                      : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200'
                  }`}
                >
                  {sz} px
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Closed Shapes Fill Color Selector */}
      {isClosedShape && (
        <div ref={fillMenuRef} className="relative">
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => setShowFillMenu(!showFillMenu)}
            className={`${btnBase} ${showFillMenu ? activeBtn : ''} px-2 gap-1.5`}
            title="Change shape fill color"
          >
            <PaintBucket className="w-3.5 h-3.5 text-blue-500" />
            <div
              className="w-3.5 h-3.5 rounded-sm border border-black/20 dark:border-white/20"
              style={{
                backgroundColor:
                  selectedElement.filled && selectedElement.fillColor !== 'transparent'
                    ? selectedElement.fillColor
                    : 'transparent',
                backgroundImage:
                  !selectedElement.filled || selectedElement.fillColor === 'transparent'
                    ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)'
                    : 'none',
                backgroundSize: '4px 4px',
              }}
            />
            <span className="text-[10px]">
              {selectedElement.filled && selectedElement.fillColor !== 'transparent'
                ? 'Fill'
                : 'No fill'}
            </span>
          </button>

          {showFillMenu && (
            <div
              onWheel={(e) => e.stopPropagation()}
              className="absolute top-full left-0 mt-1.5 p-2.5 rounded-2xl bg-white dark:bg-[#222225] border border-black/10 dark:border-white/10 shadow-2xl flex flex-col gap-2 w-56 z-50 animate-in fade-in zoom-in-95 duration-100"
            >
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400">
                  Fill color
                </span>
                <button
                  type="button"
                  onClick={() => setShowFillMenu(false)}
                  className="text-neutral-400 hover:text-neutral-600 text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-5 gap-1.5 p-1">
                {SHAPE_FILL_PRESETS.map((p) => {
                  const isSelected =
                    p.id === 'transparent'
                      ? !selectedElement.filled || selectedElement.fillColor === 'transparent'
                      : selectedElement.filled && selectedElement.fillColor === p.color;

                  return (
                    <button
                      key={p.id}
                      type="button"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={() => {
                        if (p.id === 'transparent') {
                          onChange(selectedElement.id, {
                            filled: false,
                            fillColor: 'transparent',
                          });
                        } else {
                          onChange(selectedElement.id, {
                            filled: true,
                            fillColor: p.color,
                          });
                        }
                        setShowFillMenu(false);
                      }}
                      className={`w-6 h-6 rounded-lg border transition-transform cursor-pointer relative ${
                        isSelected
                          ? 'ring-2 ring-blue-500 scale-110 border-transparent shadow-xs'
                          : 'border-black/10 dark:border-white/15 hover:scale-110'
                      }`}
                      style={{
                        backgroundColor: p.color === 'transparent' ? 'transparent' : p.color,
                        backgroundImage:
                          p.color === 'transparent'
                            ? 'linear-gradient(45deg, #bbb 25%, transparent 25%), linear-gradient(-45deg, #bbb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #bbb 75%), linear-gradient(-45deg, transparent 75%, #bbb 75%)'
                            : 'none',
                        backgroundSize: '4px 4px',
                      }}
                      title={p.name}
                    />
                  );
                })}

                {/* Custom Fill Hex Button */}
                <div className="relative">
                  <button
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => setShowCustomFillPicker(!showCustomFillPicker)}
                    className={`w-6 h-6 rounded-lg border border-dashed flex items-center justify-center transition cursor-pointer ${
                      selectedElement.filled &&
                      selectedElement.fillColor?.startsWith('#') &&
                      !SHAPE_FILL_PRESETS.some((p) => p.color === selectedElement.fillColor)
                        ? 'ring-2 ring-blue-500 scale-110 border-transparent shadow-xs'
                        : 'border-neutral-300 dark:border-neutral-600 hover:border-neutral-500'
                    }`}
                    style={{
                      backgroundColor:
                        selectedElement.filled && selectedElement.fillColor?.startsWith('#')
                          ? selectedElement.fillColor
                          : 'transparent',
                    }}
                    title="Custom fill color (Hex picker with Done button)"
                  >
                    <Plus className="w-3 h-3 text-neutral-500 dark:text-neutral-400" />
                  </button>

                  {showCustomFillPicker && (
                    <CustomColorPicker
                      value={
                        selectedElement.fillColor?.startsWith('#')
                          ? selectedElement.fillColor
                          : '#E0F2FE'
                      }
                      onChange={(hex) =>
                        onChange(selectedElement.id, { filled: true, fillColor: hex })
                      }
                      onClose={() => setShowCustomFillPicker(false)}
                      position="bottom"
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Shape Controls: Rounded Corners & Stroke Width */}
      {isShape && (
        <>
          {selectedElement.type === 'rectangle' && (
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onChange(selectedElement.id, {
                  rounded: selectedElement.rounded === false ? true : false,
                });
              }}
              className={`${btnBase} ${
                selectedElement.rounded !== false ? activeBtn : ''
              } px-2`}
              title="Toggle rounded corners vs sharp edges"
            >
              <span className="text-[10px]">
                {selectedElement.rounded !== false ? 'Rounded' : 'Sharp'}
              </span>
            </button>
          )}

          <div className="flex items-center gap-0.5 bg-neutral-100 dark:bg-neutral-800 p-0.5 rounded-lg">
            {[1, 2, 4, 8].map((w) => (
              <button
                key={w}
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(selectedElement.id, { strokeWidth: w });
                }}
                className={`px-1.5 py-0.5 text-[10px] rounded transition cursor-pointer ${
                  (selectedElement.strokeWidth || 2) === w
                    ? 'bg-white dark:bg-neutral-900 font-bold shadow-xs text-neutral-900 dark:text-neutral-100'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
                title={`Stroke width: ${w}px`}
              >
                {w}px
              </button>
            ))}
          </div>

          <div className="w-[1px] h-4 bg-neutral-200 dark:bg-neutral-800 mx-0.5" />
        </>
      )}

      {/* Rich Formatting Buttons (Canva Bold, Italic, Underline, Strikethrough) */}
      {hasTextCapabilities && (
        <>
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleExecFormat('bold', 'bold');
              }}
              className={`${btnBase} ${selectedElement.bold ? activeBtn : ''}`}
              title="Bold text (Ctrl+B)"
            >
              <Bold className="w-3 h-3" />
            </button>

            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleExecFormat('italic', 'italic');
              }}
              className={`${btnBase} ${
                selectedElement.italic ? activeBtn : ''
              }`}
              title="Italic text (Ctrl+I)"
            >
              <Italic className="w-3 h-3" />
            </button>

            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleExecFormat('underline', 'underline');
              }}
              className={`${btnBase} ${
                selectedElement.underline ? activeBtn : ''
              }`}
              title="Underline text (Ctrl+U)"
            >
              <Underline className="w-3 h-3" />
            </button>

            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleExecFormat('strikeThrough', 'strikethrough');
              }}
              className={`${btnBase} ${
                selectedElement.strikethrough ? activeBtn : ''
              }`}
              title="Strikethrough"
            >
              <Strikethrough className="w-3 h-3" />
            </button>
          </div>

          {/* Text Alignment */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => onChange(selectedElement.id, { align: 'left' })}
              className={`${btnBase} ${
                selectedElement.align === 'left' || !selectedElement.align
                  ? activeBtn
                  : ''
              }`}
              title="Align left"
            >
              <AlignLeft className="w-3 h-3" />
            </button>
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() =>
                onChange(selectedElement.id, { align: 'center' })
              }
              className={`${btnBase} ${
                selectedElement.align === 'center' ? activeBtn : ''
              }`}
              title="Align center"
            >
              <AlignCenter className="w-3 h-3" />
            </button>
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() =>
                onChange(selectedElement.id, { align: 'right' })
              }
              className={`${btnBase} ${
                selectedElement.align === 'right' ? activeBtn : ''
              }`}
              title="Align right"
            >
              <AlignRight className="w-3 h-3" />
            </button>
            {isText && (
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() =>
                  onChange(selectedElement.id, { align: 'justify' })
                }
                className={`${btnBase} ${
                  selectedElement.align === 'justify' ? activeBtn : ''
                }`}
                title="Justify"
              >
                <AlignJustify className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Canva Spacing Controls (Line spacing & Letter spacing) */}
          {isText && (
            <div ref={spacingMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setShowSpacingMenu(!showSpacingMenu)}
                className={`${btnBase} ${showSpacingMenu ? activeBtn : ''}`}
                title="Line spacing & Letter spacing"
              >
                <SlidersHorizontal className="w-3 h-3" />
              </button>

              {showSpacingMenu && (
                <div
                  onWheel={(e) => e.stopPropagation()}
                  className="absolute top-full left-0 mt-1.5 p-3 rounded-2xl bg-white dark:bg-[#222225] border border-black/10 dark:border-white/10 shadow-2xl flex flex-col gap-3 w-56 z-50 animate-in fade-in zoom-in-95 duration-100"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-200">
                      Spacing
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowSpacingMenu(false)}
                      className="text-neutral-400 hover:text-neutral-600 text-xs"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Letter Spacing Slider */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[10px] text-neutral-500">
                      <span>Letter spacing</span>
                      <span className="font-mono font-semibold text-neutral-700 dark:text-neutral-300">
                        {selectedElement.letterSpacing || 0}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-2"
                      max="12"
                      step="0.5"
                      value={selectedElement.letterSpacing || 0}
                      onChange={(e) =>
                        onChange(selectedElement.id, {
                          letterSpacing: parseFloat(e.target.value),
                        })
                      }
                      className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>

                  {/* Line Spacing Slider */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[10px] text-neutral-500">
                      <span>Line spacing</span>
                      <span className="font-mono font-semibold text-neutral-700 dark:text-neutral-300">
                        {(selectedElement.lineHeight || 1.3).toFixed(1)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.8"
                      max="2.5"
                      step="0.1"
                      value={selectedElement.lineHeight || 1.3}
                      onChange={(e) =>
                        onChange(selectedElement.id, {
                          lineHeight: parseFloat(e.target.value),
                        })
                      }
                      className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="w-[1px] h-4 bg-neutral-200 dark:bg-neutral-800 mx-0.5" />
        </>
      )}

      {/* Color Palette & Custom Hex with Done Button for Text / Shapes */}
      {!isSticky && (
        <div className="flex items-center gap-1 px-1 relative">
          <span className="text-[9px] font-semibold text-neutral-400 mr-0.5">
            {isShape ? 'Border:' : 'Color:'}
          </span>
          {COLOR_PALETTE.map((c) => (
            <button
              key={c.id}
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => {
                onChange(selectedElement.id, {
                  strokeColor: c.id === 'auto' ? 'auto' : c.color,
                });
                setShowStrokePicker(false);
              }}
              className={`w-3.5 h-3.5 rounded-full border transition-transform cursor-pointer ${
                selectedElement.strokeColor === c.color ||
                (selectedElement.strokeColor === 'auto' && c.id === 'auto')
                  ? 'ring-2 ring-blue-500 scale-110'
                  : 'border-black/10 dark:border-white/20 hover:scale-115 opacity-80 hover:opacity-100'
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

          {/* Custom Hex Picker with Done Button */}
          <div className="relative">
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => setShowStrokePicker(!showStrokePicker)}
              className={`w-4 h-4 rounded-full border border-dashed flex items-center justify-center transition cursor-pointer ${
                selectedElement.strokeColor?.startsWith('#') &&
                !COLOR_PALETTE.some((p) => p.color === selectedElement.strokeColor)
                  ? 'ring-2 ring-blue-500 scale-110 border-transparent shadow-xs'
                  : 'border-neutral-300 dark:border-neutral-600 hover:border-neutral-500'
              }`}
              style={{
                backgroundColor: selectedElement.strokeColor?.startsWith('#')
                  ? selectedElement.strokeColor
                  : 'transparent',
              }}
              title="Custom color (Hex picker with Done button)"
            >
              <Plus className="w-2.5 h-2.5 text-neutral-500 dark:text-neutral-400" />
            </button>

            {showStrokePicker && (
              <CustomColorPicker
                value={
                  selectedElement.strokeColor?.startsWith('#')
                    ? selectedElement.strokeColor
                    : '#3B82F6'
                }
                onChange={(hex) =>
                  onChange(selectedElement.id, { strokeColor: hex })
                }
                onClose={() => setShowStrokePicker(false)}
                position="bottom"
              />
            )}
          </div>
        </div>
      )}

      {/* 90-degree rotate button */}
      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          const currentRot = selectedElement.rotation || 0;
          onChange(selectedElement.id, { rotation: (currentRot + 90) % 360 });
        }}
        className={btnBase}
        title={`Rotate 90° (Current: ${selectedElement.rotation || 0}°)`}
      >
        <RotateCw className="w-3.5 h-3.5" />
        {selectedElement.rotation ? (
          <span className="text-[9px] font-mono ml-0.5">{selectedElement.rotation}°</span>
        ) : null}
      </button>

      {/* Link button */}
      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          onOpenLinkModal(selectedElement.id);
        }}
        className={`${btnBase} ${
          selectedElement.link ? 'text-blue-500 font-semibold' : ''
        }`}
        title={selectedElement.link ? 'Edit attached link' : 'Attach web link'}
      >
        <Link2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
