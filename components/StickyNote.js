'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ExternalLink, Lock } from 'lucide-react';
import { useTheme } from './ThemeContext';
import ResizeHandles from './ResizeHandles';
import { getFontFamilyStyle, getFontWeight } from '../lib/fontLibrary';

const PALETTES = {
  amber: {
    light: { bg: '#FEF3C7', border: '#D97706', text: '#78350F' },
    dark: { bg: '#451A03', border: '#B45309', text: '#FEF3C7' },
  },
  teal: {
    light: { bg: '#CCFBF1', border: '#0D9488', text: '#115E59' },
    dark: { bg: '#042F2E', border: '#14B8A6', text: '#CCFBF1' },
  },
  rose: {
    light: { bg: '#FFE4E6', border: '#E11D48', text: '#881337' },
    dark: { bg: '#4C0519', border: '#BE123C', text: '#FFE4E6' },
  },
  violet: {
    light: { bg: '#EDE9FE', border: '#7C3AED', text: '#4C1D95' },
    dark: { bg: '#2E1065', border: '#6D28D9', text: '#EDE9FE' },
  },
  emerald: {
    light: { bg: '#D1FAE5', border: '#059669', text: '#064E3B' },
    dark: { bg: '#022C22', border: '#047857', text: '#D1FAE5' },
  },
  sky: {
    light: { bg: '#E0F2FE', border: '#0284C7', text: '#0C4A6E' },
    dark: { bg: '#082F49', border: '#0369A1', text: '#E0F2FE' },
  },
  slate: {
    light: { bg: '#F1F5F9', border: '#64748B', text: '#1E293B' },
    dark: { bg: '#0F172A', border: '#475569', text: '#F1F5F9' },
  },
};

export function getStickyColors(color, isDark) {
  if (PALETTES[color]) {
    return isDark ? PALETTES[color].dark : PALETTES[color].light;
  }

  if (typeof color === 'string' && color.startsWith('#')) {
    let hex = color.replace('#', '');
    if (hex.length === 3) {
      hex = hex.split('').map((c) => c + c).join('');
    }
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;

    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    const isBright = luminance > 0.55;

    return {
      bg: color,
      border: isBright ? 'rgba(0, 0, 0, 0.16)' : 'rgba(255, 255, 255, 0.22)',
      text: isBright ? '#18181A' : '#FFFFFF',
    };
  }

  return isDark ? PALETTES.amber.dark : PALETTES.amber.light;
}

const FONT_SIZE_MAP = {
  small: 'text-[12px] leading-snug',
  medium: 'text-[15px] leading-relaxed',
  large: 'text-[18px] leading-relaxed',
  heading: 'text-[24px] font-bold leading-tight',
};

export default function StickyNote({
  id,
  x,
  y,
  width = 220,
  height = 220,
  text = '',
  color = 'amber',
  fontFamily = 'Inter',
  rotation = 0,
  isSquare = true,
  bold = false,
  italic = false,
  underline = false,
  strikethrough = false,
  fontSize = 'medium',
  align = 'left',
  link = '',
  isLocked = false,
  isSelected = false,
  onSelect,
  onChange,
  onPointerDown,
  onResizeStart,
  onRotateStart,
  onQuickConnect,
  onContextMenu,
}) {
  const { isDark } = useTheme();
  const editorRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (editorRef.current && !isEditing) {
      if (editorRef.current.innerHTML !== (text || '')) {
        editorRef.current.innerHTML = text || '';
      }
    }
  }, [text, isEditing]);

  const currentStyle = getStickyColors(color, isDark);
  const fontStyle = getFontFamilyStyle(fontFamily);
  const baseWeight = getFontWeight(fontFamily);

  const textClasses = `
    ${FONT_SIZE_MAP[fontSize] || FONT_SIZE_MAP.medium}
    ${bold ? 'font-bold' : ''}
    ${italic ? 'italic' : ''}
    ${underline ? 'underline' : ''}
    ${strikethrough ? 'line-through' : ''}
    text-${align}
  `;

  const handleInput = (e) => {
    const html = e.currentTarget.innerHTML;
    onChange(id, { text: html });
  };

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    if (isLocked) return;
    setIsEditing(true);
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.focus();
      }
    }, 20);
  };

  const isEmpty = !text || text === '<br>' || text === '<div><br></div>' || text.trim() === '';

  return (
    <div
      data-element-id={id}
      style={{
        position: 'absolute',
        transform: `translate3d(${x}px, ${y}px, 0) rotate(${rotation || 0}deg)`,
        transformOrigin: 'center center',
        width: `${width}px`,
        height: isSquare ? `${width}px` : `${height}px`,
        backgroundColor: currentStyle.bg,
        borderColor: currentStyle.border,
        color: currentStyle.text,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect && onSelect(id);
      }}
      onDoubleClick={handleDoubleClick}
      onPointerDown={(e) => {
        if (!isEditing && !isLocked) {
          onPointerDown && onPointerDown(e, id);
        }
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onContextMenu && onContextMenu(e, id);
      }}
      className={`group rounded-none border p-4 flex flex-col justify-between select-none cursor-grab active:cursor-grabbing transition-shadow duration-150 relative ${
        isSelected
          ? 'shadow-xl ring-2 ring-blue-500/80'
          : 'shadow-md hover:shadow-lg'
      } ${isLocked ? 'cursor-not-allowed opacity-90' : ''}`}
    >
      {isSelected && !isLocked && (
        <ResizeHandles
          onResizeStart={onResizeStart}
          onRotateStart={onRotateStart}
          onQuickConnect={onQuickConnect}
        />
      )}

      {/* Top right badges: Link and Lock */}
      {(link || isLocked) && (
        <div className="absolute top-2 right-2 flex items-center gap-1 z-20 pointer-events-auto">
          {link && (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-sm bg-black/20 hover:bg-black/30 text-current text-[10px] font-medium transition shrink-0 shadow-xs"
              title={`Open: ${link}`}
            >
              <ExternalLink className="w-2.5 h-2.5" />
              <span>Link</span>
            </a>
          )}
          {isLocked && <Lock className="w-3 h-3 opacity-60 shrink-0 ml-1" />}
        </div>
      )}

      {/* Note Rich Text Editor (Double-click to edit) */}
      <div className={`w-full h-full relative z-10 ${isEditing ? 'cursor-text' : 'pointer-events-none'}`}>
        <div
          ref={editorRef}
          contentEditable={isEditing && !isLocked}
          suppressContentEditableWarning
          onInput={handleInput}
          onBlur={() => setIsEditing(false)}
          onPointerDown={(e) => isEditing && e.stopPropagation()}
          onKeyDown={(e) => isEditing && e.stopPropagation()}
          onKeyUp={(e) => isEditing && e.stopPropagation()}
          className={`w-full h-full bg-transparent outline-none overflow-y-auto break-words select-text ${textClasses}`}
          style={{
            fontFamily: fontStyle,
            fontWeight: baseWeight,
            color: currentStyle.text,
            pointerEvents: isEditing ? 'auto' : 'none',
          }}
        />

        {isEmpty && !isEditing && (
          <div
            className={`absolute inset-0 pointer-events-none opacity-40 italic ${textClasses}`}
            style={{ fontFamily: fontStyle, color: currentStyle.text }}
          >
            Double-click to write...
          </div>
        )}
      </div>
    </div>
  );
}
