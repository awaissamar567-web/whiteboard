'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ExternalLink, Lock } from 'lucide-react';
import { useTheme } from './ThemeContext';
import ResizeHandles from './ResizeHandles';
import { getFontFamilyStyle, getFontWeight } from '../lib/fontLibrary';

const FONT_SIZE_MAP = {
  small: 'text-[12px] leading-snug',
  medium: 'text-[15px] leading-normal',
  large: 'text-[18px] leading-normal',
  heading: 'text-[24px] font-bold leading-tight',
};

export default function ShapeElement({
  id,
  type,
  x,
  y,
  width = 180,
  height = 120,
  text = '',
  points = [],
  fontFamily = 'Inter',
  rotation = 0,
  strokeColor = 'auto',
  fillColor = 'transparent',
  filled = false,
  rounded = true,
  strokeWidth = 2,
  bold = false,
  italic = false,
  underline = false,
  strikethrough = false,
  fontSize = 'medium',
  align = 'center',
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

  const defaultStroke = isDark ? '#EDEDED' : '#18181A';
  const effectiveStroke = strokeColor === 'auto' || !strokeColor ? defaultStroke : strokeColor;
  const effectiveFill = filled
    ? (fillColor === 'transparent' ? (isDark ? '#2E2E32' : '#E0F2FE') : fillColor)
    : 'transparent';

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

  // Draw stroke element (Freehand pencil)
  if (type === 'draw') {
    if (!points || points.length === 0) return null;
    const d = points.reduce((acc, pt, idx) => {
      return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, '');

    return (
      <g
        data-element-id={id}
        onClick={(e) => {
          e.stopPropagation();
          onSelect && onSelect(id);
        }}
        onPointerDown={(e) => {
          if (!isLocked) onPointerDown && onPointerDown(e, id);
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onContextMenu && onContextMenu(e, id);
        }}
        className="cursor-grab active:cursor-grabbing"
      >
        {/* Invisible wider hit-target for effortless clicking/selecting */}
        <path
          d={d}
          fill="none"
          stroke="transparent"
          strokeWidth={Math.max(strokeWidth + 16, 24)}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Visible crisp stroke */}
        <path
          d={d}
          fill="none"
          stroke={effectiveStroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={isSelected ? 'filter drop-shadow-[0_0_5px_rgba(59,130,246,0.9)]' : ''}
        />
      </g>
    );
  }

  // Text block tool (Single-click selects/drags, double-click edits)
  if (type === 'text') {
    return (
      <div
        data-element-id={id}
        style={{
          position: 'absolute',
          transform: `translate3d(${x}px, ${y}px, 0) rotate(${rotation || 0}deg)`,
          transformOrigin: 'center center',
          width: `${width}px`,
          minHeight: `${height}px`,
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect && onSelect(id);
        }}
        onDoubleClick={handleDoubleClick}
        onPointerDown={(e) => {
          if (!isEditing && !isLocked) onPointerDown && onPointerDown(e, id);
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onContextMenu && onContextMenu(e, id);
        }}
        className={`group p-2.5 select-none cursor-grab active:cursor-grabbing relative rounded-xl transition-all ${
          isSelected ? 'ring-2 ring-blue-500/80 bg-blue-500/5' : ''
        } ${isLocked ? 'cursor-not-allowed' : ''}`}
      >
        {isSelected && !isLocked && (
          <ResizeHandles
            onResizeStart={onResizeStart}
            onRotateStart={onRotateStart}
            onQuickConnect={onQuickConnect}
          />
        )}

        <div className={`relative w-full h-full ${isEditing ? 'cursor-text' : 'pointer-events-none'}`}>
          <div
            ref={editorRef}
            contentEditable={isEditing && !isLocked}
            suppressContentEditableWarning
            onInput={handleInput}
            onBlur={() => setIsEditing(false)}
            onPointerDown={(e) => isEditing && e.stopPropagation()}
            onKeyDown={(e) => isEditing && e.stopPropagation()}
            onKeyUp={(e) => isEditing && e.stopPropagation()}
            className={`w-full h-full bg-transparent outline-none break-words select-text ${textClasses}`}
            style={{
              fontFamily: fontStyle,
              fontWeight: baseWeight,
              color: effectiveStroke,
              pointerEvents: isEditing ? 'auto' : 'none',
            }}
          />

          {isEmpty && !isEditing && (
            <div
              className={`absolute inset-0 pointer-events-none opacity-40 italic ${textClasses}`}
              style={{ fontFamily: fontStyle, color: effectiveStroke }}
            >
              Double-click to type...
            </div>
          )}
        </div>

        {link && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="absolute -top-3.5 right-1 flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-600 dark:text-blue-300 text-[10px] font-medium hover:underline shadow-xs z-10"
            title={`Open: ${link}`}
          >
            <ExternalLink className="w-2.5 h-2.5" />
            <span>Link</span>
          </a>
        )}

        {isLocked && (
          <div className="absolute top-1 right-1 opacity-60">
            <Lock className="w-3 h-3" />
          </div>
        )}
      </div>
    );
  }

  // Geometric shapes & Connectors (Rectangle, Ellipse, Diamond, Arrow, Line, Flow-Connector)
  const rx = rounded !== false ? 16 : 0;

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
      onDoubleClick={handleDoubleClick}
      onPointerDown={(e) => {
        if (!isEditing && !isLocked) onPointerDown && onPointerDown(e, id);
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onContextMenu && onContextMenu(e, id);
      }}
      className={`group select-none cursor-grab active:cursor-grabbing relative ${
        isSelected ? 'ring-2 ring-blue-500/80 rounded-2xl' : ''
      } ${isLocked ? 'cursor-not-allowed' : ''}`}
    >
      {isSelected && !isLocked && (
        <ResizeHandles
          onResizeStart={onResizeStart}
          onRotateStart={onRotateStart}
          onQuickConnect={onQuickConnect}
        />
      )}

      <svg className="w-full h-full overflow-visible pointer-events-none">
        {type === 'rectangle' && (
          <rect
            x={strokeWidth / 2}
            y={strokeWidth / 2}
            width={Math.max(width - strokeWidth, 2)}
            height={Math.max(height - strokeWidth, 2)}
            rx={rx}
            fill={effectiveFill}
            stroke={effectiveStroke}
            strokeWidth={strokeWidth}
          />
        )}
        {type === 'ellipse' && (
          <ellipse
            cx={width / 2}
            cy={height / 2}
            rx={Math.max((width - strokeWidth) / 2, 2)}
            ry={Math.max((height - strokeWidth) / 2, 2)}
            fill={effectiveFill}
            stroke={effectiveStroke}
            strokeWidth={strokeWidth}
          />
        )}
        {type === 'diamond' && (
          <polygon
            points={`${width / 2},${strokeWidth} ${width - strokeWidth},${height / 2} ${width / 2},${height - strokeWidth} ${strokeWidth},${height / 2}`}
            fill={effectiveFill}
            stroke={effectiveStroke}
            strokeWidth={strokeWidth}
          />
        )}
        {/* Flow Connectors and Lines: Clean connecting wire with NO arrowhead */}
        {(type === 'line' || type === 'flow-connector' || type === 'flow-line') && (
          <line
            x1={2}
            y1={height / 2}
            x2={Math.max(width - 2, 4)}
            y2={height / 2}
            stroke={effectiveStroke}
            strokeWidth={strokeWidth || 2}
            strokeLinecap="round"
          />
        )}
        {/* Regular Directional Arrow with Pointed Arrowhead */}
        {type === 'arrow' && (
          <g>
            <defs>
              <marker
                id={`arrow-${id}`}
                markerWidth="8"
                markerHeight="8"
                refX="7"
                refY="4"
                orient="auto"
              >
                <polygon points="0 0, 8 4, 0 8" fill={effectiveStroke} />
              </marker>
            </defs>
            <line
              x1={2}
              y1={height / 2}
              x2={Math.max(width - 12, 4)}
              y2={height / 2}
              stroke={effectiveStroke}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              markerEnd={`url(#arrow-${id})`}
            />
          </g>
        )}
      </svg>

      {/* Internal Rich Text for Rectangles, Ellipses, Diamonds (Double-click to edit) */}
      {(type === 'rectangle' || type === 'ellipse' || type === 'diamond') && (
        <div
          className={`absolute inset-0 flex items-center justify-center p-4 text-center ${
            isEditing ? 'pointer-events-auto cursor-text' : 'pointer-events-none'
          }`}
        >
          <div className="relative w-full">
            <div
              ref={editorRef}
              contentEditable={isEditing && !isLocked}
              suppressContentEditableWarning
              onInput={handleInput}
              onBlur={() => setIsEditing(false)}
              onPointerDown={(e) => isEditing && e.stopPropagation()}
              onKeyDown={(e) => isEditing && e.stopPropagation()}
              onKeyUp={(e) => isEditing && e.stopPropagation()}
              className={`w-full bg-transparent outline-none break-words select-text ${textClasses}`}
              style={{
                fontFamily: fontStyle,
                fontWeight: baseWeight,
                color: effectiveStroke,
                pointerEvents: isEditing ? 'auto' : 'none',
              }}
            />

            {isEmpty && !isEditing && (
              <div
                className={`pointer-events-none opacity-40 italic ${textClasses}`}
                style={{ fontFamily: fontStyle, color: effectiveStroke }}
              >
                Double-click to label...
              </div>
            )}
          </div>
        </div>
      )}

      {link && (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="absolute -top-3.5 right-1 flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-600 dark:text-blue-300 text-[10px] font-medium hover:underline shadow-xs z-10"
          title={`Open: ${link}`}
        >
          <ExternalLink className="w-2.5 h-2.5" />
          <span>Link</span>
        </a>
      )}

      {isLocked && (
        <div className="absolute top-2 right-2 opacity-60">
          <Lock className="w-3 h-3" />
        </div>
      )}
    </div>
  );
}
