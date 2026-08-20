'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Cloud, Check } from 'lucide-react';
import { ThemeProvider } from '@/components/ThemeContext';
import { ToastProvider, useToast } from '@/components/ToastContext';
import { getBoardsMeta, renameBoard } from '@/lib/boardStore';
import { fetchBoardFromCloud } from '@/lib/supabaseSync';

const WhiteboardCanvas = dynamic(
  () => import('@/components/WhiteboardCanvas'),
  {
    ssr: false,
    loading: () => (
      <div className="w-screen h-screen flex items-center justify-center bg-[#F1EFE8] dark:bg-[#18181A] text-neutral-600 dark:text-neutral-300">
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium">Loading canvas...</span>
        </div>
      </div>
    ),
  }
);

function BoardCanvasWrapper() {
  const params = useParams();
  const boardId = params?.id || 'board-main';
  const { showSuccess } = useToast();

  const [boardMeta, setBoardMeta] = useState(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [isCloudSynced, setIsCloudSynced] = useState(false);

  useEffect(() => {
    const metaList = getBoardsMeta();
    const current = metaList.find((b) => b.id === boardId) || {
      id: boardId,
      title: 'Personal workspace',
      color: '#3B82F6',
    };
    setBoardMeta(current);
    setTitleInput(current.title);

    // Initial Cloud Fetch & Realtime Hookup
    fetchBoardFromCloud(boardId).then((cloudData) => {
      if (cloudData) {
        setIsCloudSynced(true);
        setBoardMeta((prev) => ({
          ...prev,
          title: cloudData.title || prev.title,
          color: cloudData.color || prev.color,
        }));
        setTitleInput(cloudData.title || current.title);
      } else {
        setIsCloudSynced(true);
      }
    });
  }, [boardId]);

  const handleSaveTitle = () => {
    const formatted = titleInput.trim();
    if (formatted && boardMeta && formatted !== boardMeta.title) {
      renameBoard(boardId, formatted);
      setBoardMeta((prev) => ({ ...prev, title: formatted }));
      showSuccess(`Renamed to "${formatted}"`);
    }
    setIsEditingTitle(false);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden font-sans">
      <header className="absolute top-5 left-20 z-20 flex items-center gap-2 pointer-events-auto">
        <Link
          href="/"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 dark:bg-[#202024]/95 backdrop-blur-md border border-black/10 dark:border-white/10 shadow-xs text-xs font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All boards</span>
        </Link>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/90 dark:bg-[#202024]/90 backdrop-blur-md border border-black/10 dark:border-white/10 shadow-xs text-xs">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: boardMeta?.color || '#3B82F6' }}
          />

          {isEditingTitle ? (
            <input
              type="text"
              autoFocus
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveTitle();
                if (e.key === 'Escape') setIsEditingTitle(false);
              }}
              className="font-semibold text-neutral-800 dark:text-neutral-100 bg-transparent outline-none border-b border-blue-500 max-w-[200px]"
            />
          ) : (
            <span
              onClick={() => setIsEditingTitle(true)}
              className="font-semibold text-neutral-800 dark:text-neutral-100 cursor-text truncate max-w-[200px]"
              title="Click to rename board"
            >
              {boardMeta?.title || 'Whiteboard'}
            </span>
          )}

          <span className="text-neutral-300 dark:text-neutral-700">•</span>
          <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
            <Cloud className="w-3 h-3" />
            <span>Synced</span>
          </div>
        </div>
      </header>

      <WhiteboardCanvas boardId={boardId} />
    </div>
  );
}

export default function BoardPage() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BoardCanvasWrapper />
      </ToastProvider>
    </ThemeProvider>
  );
}
