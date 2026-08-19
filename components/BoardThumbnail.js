'use client';

import React, { useMemo } from 'react';
import { useTheme } from './ThemeContext';
import { getBoardElements } from '../lib/boardStore';
import { getStickyColors } from './StickyNote';
import { getFontFamilyStyle } from '../lib/fontLibrary';

export function computeConnectorPath(fromEl, toEl) {
  if (!fromEl || !toEl) return null;

  const fromW = fromEl.width || 200;
  const fromH = fromEl.isSquare ? fromW : (fromEl.height || 140);
  const toW = toEl.width || 200;
  const toH = toEl.isSquare ? toW : (toEl.height || 140);

  const fromCenter = { x: (fromEl.x || 0) + fromW / 2, y: (fromEl.y || 0) + fromH / 2 };
  const toCenter = { x: (toEl.x || 0) + toW / 2, y: (toEl.y || 0) + toH / 2 };

  const dx = toCenter.x - fromCenter.x;
  const dy = toCenter.y - fromCenter.y;

  let startX, startY, endX, endY, cp1x, cp1y, cp2x, cp2y;

  if (Math.abs(dx) >= Math.abs(dy)) {
    // Horizontal dominant layout
    if (dx >= 0) {
      startX = (fromEl.x || 0) + fromW;
      startY = fromCenter.y;
      endX = toEl.x || 0;
      endY = toCenter.y;
      const curvature = Math.max(Math.abs(endX - startX) * 0.45, 25);
      cp1x = startX + curvature;
      cp1y = startY;
      cp2x = endX - curvature;
      cp2y = endY;
    } else {
      startX = fromEl.x || 0;
      startY = fromCenter.y;
      endX = (toEl.x || 0) + toW;
      endY = toCenter.y;
      const curvature = Math.max(Math.abs(endX - startX) * 0.45, 25);
      cp1x = startX - curvature;
      cp1y = startY;
      cp2x = endX + curvature;
      cp2y = endY;
    }
  } else {
    // Vertical dominant layout
    if (dy >= 0) {
      startX = fromCenter.x;
      startY = (fromEl.y || 0) + fromH;
      endX = toCenter.x;
      endY = toEl.y || 0;
      const curvature = Math.max(Math.abs(endY - startY) * 0.45, 25);
      cp1x = startX;
      cp1y = startY + curvature;
      cp2x = endX;
      cp2y = endY - curvature;
    } else {
      startX = fromCenter.x;
      startY = fromEl.y || 0;
      endX = toCenter.x;
      endY = (toEl.y || 0) + toH;
      const curvature = Math.max(Math.abs(endY - startY) * 0.45, 25);
      cp1x = startX;
      cp1y = startY - curvature;
      cp2x = endX;
      cp2y = endY + curvature;
    }
  }

  const d = `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`;
  return { d, startX, startY, endX, endY };
}

export default function BoardThumbnail({ boardId, className = '' }) {
  const { isDark } = useTheme();

  const elements = useMemo(() => {
    if (typeof window === 'undefined') return [];
    return getBoardElements(boardId) || [];
  }, [boardId]);

  const { scale, offsetX, offsetY, isEmpty } = useMemo(() => {
    if (!elements || elements.length === 0) {
      return { scale: 1, offsetX: 0, offsetY: 0, isEmpty: true };
    }

    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;

    elements.forEach((el) => {
      if (el.type === 'connector') return;

      const x = el.x || 0;
      const y = el.y || 0;
      const w = el.width || 120;
      const h = el.height || 80;

      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + w);
      maxY = Math.max(maxY, y + h);

      if (el.type === 'draw' && el.points?.length) {
        el.points.forEach((pt) => {
          minX = Math.min(minX, pt.x);
          minY = Math.min(minY, pt.y);
          maxX = Math.max(maxX, pt.x);
          maxY = Math.max(maxY, pt.y);
        });
      }
    });

    if (minX === Infinity) {
      return { scale: 1, offsetX: 0, offsetY: 0, isEmpty: true };
    }

    const pad = 60;
    const contentW = Math.max(maxX - minX + pad * 2, 280);
    const contentH = Math.max(maxY - minY + pad * 2, 160);

    const scale = Math.min(280 / contentW, 160 / contentH, 0.65);
    const offsetX = (280 - (maxX + minX) * scale) / 2;
    const offsetY = (160 - (maxY + minY) * scale) / 2;

    return {
      scale,
      offsetX,
      offsetY,
      isEmpty: false,
    };
  }, [elements]);

  const canvasBg = isDark ? '#1C1C1F' : '#ECEAE2';
  const dotColor = isDark ? '#333336' : '#D1CFCA';

  return (
    <div
      className={`relative w-full aspect-[16/9.5] rounded-2xl overflow-hidden select-none border border-black/5 dark:border-white/5 transition-transform duration-300 group-hover:scale-[1.01] ${className}`}
      style={{
        backgroundColor: canvasBg,
        backgroundImage: `radial-gradient(${dotColor} 1px, transparent 1px)`,
        backgroundSize: '12px 12px',
      }}
    >
      {isEmpty ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
          <div className="w-8 h-8 rounded-xl bg-black/5 dark:bg-white/5 border border-dashed border-neutral-300 dark:border-neutral-700 flex items-center justify-center mb-1.5">
            <span className="text-neutral-400 text-xs">+</span>
          </div>
          <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium">
            Blank canvas
          </span>
        </div>
      ) : (
        <div
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{
            transformOrigin: '0 0',
          }}
        >
          {/* SVG Elements Layer */}
          <svg className="absolute inset-0 w-full h-full overflow-hidden">
            <g transform={`translate(${offsetX}, ${offsetY}) scale(${scale})`}>
              {/* Dynamic Sticky Wavy Connectors */}
              {elements
                .filter((el) => el.type === 'connector')
                .map((conn) => {
                  const fromEl = elements.find((e) => e.id === conn.fromId);
                  const toEl = elements.find((e) => e.id === conn.toId);
                  const pathInfo = computeConnectorPath(fromEl, toEl);
                  if (!pathInfo) return null;

                  const stroke =
                    conn.strokeColor === 'auto' || !conn.strokeColor
                      ? (isDark ? '#A1A1AA' : '#71717A')
                      : conn.strokeColor;

                  return (
                    <g key={conn.id}>
                      <path
                        d={pathInfo.d}
                        fill="none"
                        stroke={stroke}
                        strokeWidth={Math.max((conn.strokeWidth || 2.5) * 1.5, 3)}
                        strokeLinecap="round"
                      />
                      <circle cx={pathInfo.startX} cy={pathInfo.startY} r={4} fill={stroke} />
                      <circle cx={pathInfo.endX} cy={pathInfo.endY} r={4} fill={stroke} />
                    </g>
                  );
                })}

              {elements.map((el) => {
                const stroke = el.strokeColor === 'auto' || !el.strokeColor ? (isDark ? '#EDEDED' : '#18181A') : el.strokeColor;
                const fill = el.filled ? (el.fillColor === 'transparent' ? (isDark ? '#2E2E32' : '#E0F2FE') : el.fillColor) : 'transparent';
                const rx = el.rounded !== false ? 12 : 0;
                const w = el.width || 140;
                const h = el.height || 90;

                if (el.type === 'draw' && el.points?.length) {
                  const d = el.points.reduce((acc, pt, idx) => {
                    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
                  }, '');
                  return (
                    <path
                      key={el.id}
                      d={d}
                      fill="none"
                      stroke={stroke}
                      strokeWidth={Math.max((el.strokeWidth || 3) * 1.5, 3)}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  );
                }

                if (el.type === 'rectangle') {
                  return (
                    <rect
                      key={el.id}
                      x={el.x}
                      y={el.y}
                      width={w}
                      height={h}
                      rx={rx}
                      fill={fill}
                      stroke={stroke}
                      strokeWidth={el.strokeWidth || 2}
                    />
                  );
                }

                if (el.type === 'ellipse') {
                  return (
                    <ellipse
                      key={el.id}
                      cx={el.x + w / 2}
                      cy={el.y + h / 2}
                      rx={w / 2}
                      ry={h / 2}
                      fill={fill}
                      stroke={stroke}
                      strokeWidth={el.strokeWidth || 2}
                    />
                  );
                }

                if (el.type === 'diamond') {
                  return (
                    <polygon
                      key={el.id}
                      points={`${el.x + w / 2},${el.y} ${el.x + w},${el.y + h / 2} ${el.x + w / 2},${el.y + h} ${el.x},${el.y + h / 2}`}
                      fill={fill}
                      stroke={stroke}
                      strokeWidth={el.strokeWidth || 2}
                    />
                  );
                }

                if (el.type === 'line' || el.type === 'flow-connector' || el.type === 'arrow') {
                  return (
                    <line
                      key={el.id}
                      x1={el.x}
                      y1={el.y + h / 2}
                      x2={el.x + w}
                      y2={el.y + h / 2}
                      stroke={stroke}
                      strokeWidth={Math.max((el.strokeWidth || 2) * 1.5, 2.5)}
                      strokeLinecap="round"
                    />
                  );
                }

                return null;
              })}
            </g>
          </svg>

          {/* HTML Elements Layer (Sticky Notes, Images, Text) */}
          <div
            className="absolute top-0 left-0 w-full h-full"
            style={{
              transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`,
              transformOrigin: '0 0',
            }}
          >
            {elements.map((el) => {
              const rot = el.rotation || 0;
              const w = el.width || 200;
              const h = el.height || 160;

              if (el.type === 'sticky-note') {
                const palette = getStickyColors(el.color, isDark);
                const font = getFontFamilyStyle(el.fontFamily);
                const cleanText = (el.text || '').replace(/<[^>]*>?/gm, ' ').trim();

                return (
                  <div
                    key={el.id}
                    style={{
                      position: 'absolute',
                      transform: `translate3d(${el.x}px, ${el.y}px, 0) rotate(${rot}deg)`,
                      width: `${w}px`,
                      height: el.isSquare ? `${w}px` : `${h}px`,
                      backgroundColor: palette.bg,
                      borderColor: palette.border,
                      color: palette.text,
                      fontFamily: font,
                    }}
                    className="border rounded-none p-3 shadow-md overflow-hidden flex flex-col justify-start text-[13px] leading-snug break-words"
                  >
                    <p className="line-clamp-4 font-medium opacity-90">
                      {cleanText || 'Note...'}
                    </p>
                  </div>
                );
              }

              if (el.type === 'image-block') {
                return (
                  <div
                    key={el.id}
                    style={{
                      position: 'absolute',
                      transform: `translate3d(${el.x}px, ${el.y}px, 0) rotate(${rot}deg)`,
                      width: `${w}px`,
                      height: `${h}px`,
                    }}
                    className="rounded-xl overflow-hidden border-2 border-neutral-300 dark:border-neutral-700 bg-neutral-200 dark:bg-neutral-800 shadow-md flex items-center justify-center"
                  >
                    {el.imageUrl ? (
                      <img
                        src={el.imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[11px] text-neutral-400 font-medium">Image</span>
                    )}
                  </div>
                );
              }

              if (el.type === 'text') {
                const cleanText = (el.text || '').replace(/<[^>]*>?/gm, ' ').trim();
                const font = getFontFamilyStyle(el.fontFamily);
                const stroke = el.strokeColor === 'auto' || !el.strokeColor ? (isDark ? '#EDEDED' : '#18181A') : el.strokeColor;

                return (
                  <div
                    key={el.id}
                    style={{
                      position: 'absolute',
                      transform: `translate3d(${el.x}px, ${el.y}px, 0) rotate(${rot}deg)`,
                      width: `${w}px`,
                      minHeight: `${h}px`,
                      color: stroke,
                      fontFamily: font,
                    }}
                    className="p-1 text-sm font-semibold overflow-hidden line-clamp-2"
                  >
                    {cleanText || 'Text'}
                  </div>
                );
              }

              if (el.type === 'video-block') {
                return (
                  <div
                    key={el.id}
                    style={{
                      position: 'absolute',
                      transform: `translate3d(${el.x}px, ${el.y}px, 0) rotate(${rot}deg)`,
                      width: `${w}px`,
                      height: `${h}px`,
                    }}
                    className="rounded-xl overflow-hidden border border-neutral-700 bg-neutral-950 shadow-md flex flex-col items-center justify-center text-white p-2 text-center"
                  >
                    <div className="w-7 h-7 rounded-full bg-blue-600/80 flex items-center justify-center mb-1">
                      <span className="text-[10px] ml-0.5">▶</span>
                    </div>
                    <span className="text-[9px] font-semibold truncate max-w-full px-1 opacity-80">
                      {el.title || 'Video / Reel'}
                    </span>
                  </div>
                );
              }

              return null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}
