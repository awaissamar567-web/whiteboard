'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Lock, Link2, ExternalLink } from 'lucide-react';
import ResizeHandles from './ResizeHandles';
import { useTheme } from './ThemeContext';
import { getFontFamilyStyle } from '../lib/fontLibrary';

export default function TextElement({
  id,
  x = 100,
  y = 100,
  width = 240,
  height = 80,
  rotation = 0,
  text = 'Type something...',
  fontSize = 24,
  fontFamily = 'Inter',
  bold = false,
  italic = false,
  underline = false,
  strikethrough = false,
  align = 'left',
  lineHeight = 1.3,
  letterSpacing = 0,
  strokeColor = 'auto',
  fillColor = 'transparent',
  filled = false,
  borderWidth = 0,
  borderColor = 'transparent',
  borderRadius = 8,
  link,
  isLocked,
  isSelected,
  onSelect,
  onChange,
  onDelete,
  onDuplicate,
  onPointerDown,
  onResizeStart,
  onRotateStart,
  onQuickConnect,
  onContextMenu,
}) {
  const { isDark } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const textRef = useRef(null);

  // Sync content when text prop changes externally
  useEffect(() => {
    if (textRef.current && !isEditing) {
      if (textRef.current.innerHTML !== (text || '')) {
        textRef.current.innerHTML = text || '';
      }
    }
  }, [text, isEditing]);

  // Focus and place cursor at end when editing begins
  useEffect(() => {
    if (isEditing && textRef.current) {
      textRef.current.focus();
      try {
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(textRef.current);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
      } catch (err) {}
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    if (textRef.current) {
      const html = textRef.current.innerHTML;
      if (html !== text) {
        onChange && onChange(id, { text: html });
      }
    }
  };

  const handleInput = () => {
    if (textRef.current) {
      const html = textRef.current.innerHTML;
      onChange && onChange(id, { text: html });
    }
  };

  const textColor =
    strokeColor === 'auto' || !strokeColor
      ? isDark
        ? '#EDEDED'
        : '#18181A'
      : strokeColor;

  const bgStyle =
    filled && fillColor && fillColor !== 'transparent'
      ? fillColor
      : 'transparent';

  const fontStyle = getFontFamilyStyle(fontFamily);

  const textDecoration = [
    underline ? 'underline' : '',
    strikethrough ? 'line-through' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      data-element-id={id}
      onPointerDown={(e) => {
        if (!isEditing) {
          onPointerDown && onPointerDown(e, id);
        }
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect && onSelect(id);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        if (!isLocked) {
          setIsEditing(true);
        }
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onContextMenu && onContextMenu(e, id);
      }}
      style={{
        position: 'absolute',
        transform: `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg)`,
        transformOrigin: 'center center',
        width: `${width}px`,
        minHeight: `${height}px`,
        touchAction: 'none',
        backgroundColor: bgStyle,
        borderWidth: borderWidth ? `${borderWidth}px` : undefined,
        borderColor: borderWidth ? borderColor || textColor : undefined,
        borderRadius: `${borderRadius}px`,
      }}
      className={`group select-none transition-shadow ${
        isEditing
          ? 'cursor-text ring-1.5 ring-blue-500 shadow-sm z-30'
          : isSelected
          ? 'cursor-move ring-1.5 ring-blue-500 shadow-sm z-30'
          : 'cursor-move hover:ring-1 hover:ring-black/10 dark:hover:ring-white/10 z-10'
      }`}
    >
      {/* Text Content Box */}
      <div
        ref={textRef}
        contentEditable={isEditing && !isLocked}
        suppressContentEditableWarning
        onBlur={handleBlur}
        onInput={handleInput}
        style={{
          fontFamily: fontStyle,
          fontSize: `${typeof fontSize === 'number' ? fontSize : 24}px`,
          fontWeight: bold ? '700' : '400',
          fontStyle: italic ? 'italic' : 'normal',
          textDecoration: textDecoration || 'none',
          textAlign: align || 'left',
          lineHeight: lineHeight || 1.3,
          letterSpacing: `${letterSpacing || 0}px`,
          color: textColor,
          pointerEvents: isEditing ? 'auto' : 'none',
          wordBreak: 'break-word',
          whiteSpace: 'pre-wrap',
        }}
        className="w-full h-full p-2 outline-none break-words"
      />

      {/* Attached Web Link Pill */}
      {link && !isEditing && (
        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="absolute -bottom-7 left-0 max-w-[200px] truncate px-2 py-0.5 rounded-lg bg-blue-500 text-white text-[10px] flex items-center gap-1 shadow-md hover:bg-blue-600 transition"
        >
          <Link2 className="w-3 h-3 shrink-0" />
          <span className="truncate">{link.replace(/^https?:\/\//, '')}</span>
          <ExternalLink className="w-2.5 h-2.5 shrink-0" />
        </a>
      )}

      {/* Lock Indicator */}
      {isLocked && (
        <div className="absolute top-1 right-1 p-1 text-amber-500">
          <Lock className="w-3 h-3" />
        </div>
      )}

      {/* 8-Point Canva Resize & Rotation Handles */}
      {isSelected && !isLocked && !isEditing && (
        <ResizeHandles
          onResizeStart={onResizeStart}
          onRotateStart={onRotateStart}
          onQuickConnect={onQuickConnect}
        />
      )}
    </div>
  );
}
