'use client';

import React, { useState, useRef } from 'react';
import {
  Video,
  Play,
  ExternalLink,
  Lock,
  Film,
  Sparkles,
} from 'lucide-react';
import ResizeHandles from './ResizeHandles';
import { useTheme } from './ThemeContext';

const InstagramIcon = ({ className, style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const YoutubeIcon = ({ className, style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

export function parseVideoEmbed(url) {
  if (!url) return { type: 'none', src: '' };
  const clean = url.trim();

  // 1. Instagram Reel / Post
  const igMatch = clean.match(/instagram\.com\/(?:p|reel|tv)\/([a-zA-Z0-9_-]+)/);
  if (igMatch) {
    return {
      type: 'instagram',
      platform: 'Instagram Reel',
      src: `https://www.instagram.com/reel/${igMatch[1]}/embed`,
      originalUrl: clean,
      icon: InstagramIcon,
      color: '#E1306C',
    };
  }

  // 2. YouTube (standard, shorts, youtu.be)
  const ytMatch = clean.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  if (ytMatch) {
    return {
      type: 'youtube',
      platform: 'YouTube',
      src: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=0&rel=0`,
      originalUrl: clean,
      icon: YoutubeIcon,
      color: '#FF0000',
    };
  }

  // 3. TikTok
  const ttMatch = clean.match(/tiktok\.com\/@[^\/]+\/video\/(\d+)/);
  if (ttMatch) {
    return {
      type: 'tiktok',
      platform: 'TikTok',
      src: `https://www.tiktok.com/embed/v2/${ttMatch[1]}`,
      originalUrl: clean,
      icon: Film,
      color: '#000000',
    };
  }

  // 4. Vimeo
  const vimeoMatch = clean.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)/);
  if (vimeoMatch && vimeoMatch[3]) {
    return {
      type: 'vimeo',
      platform: 'Vimeo',
      src: `https://player.vimeo.com/video/${vimeoMatch[3]}`,
      originalUrl: clean,
      icon: Video,
      color: '#1AB7EA',
    };
  }

  // 5. Loom
  const loomMatch = clean.match(/loom\.com\/share\/([a-zA-Z0-9_-]+)/);
  if (loomMatch) {
    return {
      type: 'loom',
      platform: 'Loom',
      src: `https://www.loom.com/embed/${loomMatch[1]}`,
      originalUrl: clean,
      icon: Video,
      color: '#625DF5',
    };
  }

  // 6. Direct Video File (mp4, webm, mov, ogg, blob, data)
  if (
    clean.match(/\.(mp4|webm|mov|ogg)(\?.*)?$/i) ||
    clean.startsWith('blob:') ||
    clean.startsWith('data:video')
  ) {
    return {
      type: 'file',
      platform: 'Video file',
      src: clean,
      originalUrl: clean,
      icon: Video,
      color: '#3B82F6',
    };
  }

  // 7. Generic Web Embed / Link
  return {
    type: 'generic',
    platform: 'Web media',
    src: clean,
    originalUrl: clean,
    icon: ExternalLink,
    color: '#6B7280',
  };
}

export default function VideoBlock({
  id,
  x,
  y,
  width = 360,
  height = 240,
  rotation = 0,
  videoUrl,
  title,
  isSelected,
  isLocked,
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
  const embedInfo = parseVideoEmbed(videoUrl);
  const PlatformIcon = embedInfo.icon || Video;

  return (
    <div
      data-element-id={id}
      onPointerDown={(e) => {
        onPointerDown && onPointerDown(e, id);
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect && onSelect(id);
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
        height: `${height}px`,
        touchAction: 'none',
      }}
      className={`group select-none cursor-move transition-shadow rounded-2xl ${
        isSelected
          ? 'ring-2 ring-blue-500 shadow-2xl z-30'
          : 'hover:shadow-lg hover:ring-1 hover:ring-black/10 dark:hover:ring-white/10 z-10'
      }`}
    >
      {/* Container Box */}
      <div className="relative w-full h-full rounded-2xl overflow-hidden bg-black/90 dark:bg-black/95 border border-black/10 dark:border-white/10 flex flex-col shadow-md">
        {/* Top Media Platform Bar */}
        <div
          onPointerDown={(e) => onPointerDown && onPointerDown(e, id)}
          className="h-8 px-3 bg-neutral-900/90 text-white flex items-center justify-between gap-2 select-none shrink-0 border-b border-white/10 z-20 cursor-grab active:cursor-grabbing"
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <PlatformIcon
              className="w-3.5 h-3.5 shrink-0"
              style={{ color: embedInfo.color || '#3B82F6' }}
            />
            <span className="text-[11px] font-semibold tracking-tight truncate">
              {title || embedInfo.platform}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {embedInfo.originalUrl && (
              <a
                href={embedInfo.originalUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-1 rounded hover:bg-white/10 text-neutral-400 hover:text-white transition"
                title="Open original source"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            {isLocked && <Lock className="w-3 h-3 text-amber-400" />}
          </div>
        </div>

        {/* Video / Embed Content Area */}
        <div className="relative flex-1 w-full h-[calc(100%-32px)] bg-black overflow-hidden flex items-center justify-center">
          {embedInfo.type === 'file' ? (
            <video
              src={embedInfo.src}
              controls
              className="w-full h-full object-contain"
              playsInline
            />
          ) : embedInfo.src ? (
            <iframe
              src={embedInfo.src}
              title={title || 'Social media embed'}
              className="w-full h-full border-0 bg-neutral-950"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-4 text-center text-neutral-400">
              <Video className="w-8 h-8 mb-1.5 opacity-50" />
              <span className="text-xs font-medium">No video source</span>
            </div>
          )}
        </div>
      </div>

      {/* Resize & Rotation Handles */}
      {isSelected && !isLocked && (
        <ResizeHandles
          onResizeStart={onResizeStart}
          onRotateStart={onRotateStart}
          onQuickConnect={onQuickConnect}
        />
      )}
    </div>
  );
}
