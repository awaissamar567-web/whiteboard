'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  Star,
  Trash2,
  Copy,
  Edit2,
  LayoutGrid,
  Sun,
  Moon,
  Laptop,
  ArrowRight,
  X,
  Clock,
} from 'lucide-react';
import { useTheme } from './ThemeContext';
import { useToast } from './ToastContext';
import BoardThumbnail from './BoardThumbnail';
import {
  getBoardsMeta,
  createBoard,
  deleteBoard,
  duplicateBoard,
  toggleStarBoard,
  renameBoard,
  STARTER_TEMPLATES,
} from '../lib/boardStore';
import {
  fetchAllBoardsFromCloud,
  syncBoardToCloud,
  deleteBoardFromCloud,
} from '../lib/supabaseSync';

function formatRelativeTime(isoDate) {
  if (!isoDate) return 'Edited recently';
  try {
    const now = Date.now();
    const diff = Math.max(0, (now - new Date(isoDate).getTime()) / 1000);
    if (diff < 60) return 'Edited just now';
    if (diff < 3600) return `Edited ${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `Edited ${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `Edited ${Math.floor(diff / 86400)}d ago`;
    return `Edited ${new Date(isoDate).toLocaleDateString()}`;
  } catch (e) {
    return 'Edited recently';
  }
}

export default function BoardsDashboard() {
  const { theme, isDark, setTheme } = useTheme();
  const { showSuccess, showInfo, confirm } = useToast();
  const router = useRouter();

  const [boards, setBoards] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // New Board form state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('blank');
  const [selectedColor, setSelectedColor] = useState('#3B82F6');

  // Inline rename state
  const [renamingId, setRenamingId] = useState(null);
  const [renameInput, setRenameInput] = useState('');

  useEffect(() => {
    setBoards(getBoardsMeta());
    fetchAllBoardsFromCloud().then((cloudList) => {
      if (cloudList && cloudList.length > 0) {
        setBoards(cloudList);
      }
    });
  }, []);

  const handleCreateNew = (e) => {
    e.preventDefault();
    const created = createBoard({
      title: newTitle,
      description: newDescription,
      templateId: selectedTemplate,
      color: selectedColor,
    });
    syncBoardToCloud(created.id, created);
    setIsNewModalOpen(false);
    setNewTitle('');
    setNewDescription('');
    setSelectedTemplate('blank');
    showSuccess(`Created "${created.title}"`);
    router.push(`/board/${created.id}`);
  };

  const handleDelete = (e, b) => {
    e.preventDefault();
    e.stopPropagation();
    confirm({
      title: `Delete "${b.title}"?`,
      message:
        'Are you sure you want to permanently delete this whiteboard? All notes, drawings, and visual blocks will be lost.',
      confirmLabel: 'Delete whiteboard',
      cancelLabel: 'Cancel',
      isDanger: true,
      onConfirm: () => {
        const next = deleteBoard(b.id);
        deleteBoardFromCloud(b.id);
        setBoards(next);
        showSuccess(`Deleted "${b.title}"`);
      },
    });
  };

  const handleDuplicate = (e, b) => {
    e.preventDefault();
    e.stopPropagation();
    const next = duplicateBoard(b.id);
    const newBoard = next[0];
    if (newBoard) {
      syncBoardToCloud(newBoard.id, newBoard);
    }
    setBoards(next);
    showSuccess(`Duplicated "${b.title}"`);
  };

  const handleToggleStar = (e, b) => {
    e.preventDefault();
    e.stopPropagation();
    const next = toggleStarBoard(b.id);
    setBoards(next);
    const updated = next.find((item) => item.id === b.id);
    if (updated) {
      syncBoardToCloud(b.id, updated);
      if (updated.isStarred) {
        showInfo(`Starred "${b.title}"`);
      } else {
        showInfo(`Unstarred "${b.title}"`);
      }
    }
  };

  const handleStartRename = (e, b) => {
    e.preventDefault();
    e.stopPropagation();
    setRenamingId(b.id);
    setRenameInput(b.title);
  };

  const handleSaveRename = (b) => {
    const formatted = renameInput.trim();
    if (formatted && formatted !== b.title) {
      const next = renameBoard(b.id, formatted);
      setBoards(next);
      const updated = next.find((item) => item.id === b.id);
      if (updated) {
        syncBoardToCloud(b.id, updated);
      }
      showSuccess(`Renamed to "${formatted}"`);
    }
    setRenamingId(null);
  };

  const filteredBoards = boards
    .filter((b) => (activeFilter === 'starred' ? b.isStarred : true))
    .filter(
      (b) =>
        b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.description &&
          b.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  const colors = [
    '#3B82F6',
    '#F59E0B',
    '#10B981',
    '#8B5CF6',
    '#F43F5E',
    '#0284C7',
    '#64748B',
  ];

  const handleCycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  return (
    <div className="min-h-screen bg-[#F1EFE8] dark:bg-[#18181A] text-neutral-800 dark:text-neutral-100 font-sans transition-colors selection:bg-blue-500/20">
      {/* Header */}
      <header className="border-b border-black/5 dark:border-white/5 bg-white/70 dark:bg-[#202024]/70 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/icon.png"
              alt="Whiteboard Studio"
              className="w-8 h-8 rounded-lg object-contain shadow-xs shrink-0"
            />
            <div>
              <h1 className="text-base font-bold tracking-tight">
                Whiteboard Studio
              </h1>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Personal infinite canvas &amp; visual thinking
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCycleTheme}
              className="p-2 rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer"
              title={`Current theme: ${theme} (Click to cycle)`}
            >
              {theme === 'system' ? (
                <Laptop className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
              ) : isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-neutral-600" />
              )}
            </button>

            <button
              onClick={() => setIsNewModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold hover:opacity-90 transition cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>New whiteboard</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Area */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/80 dark:bg-[#202024]/80 border border-black/5 dark:border-white/5 w-fit shadow-xs">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              All boards ({boards.length})
            </button>
            <button
              onClick={() => setActiveFilter('starred')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 cursor-pointer ${
                activeFilter === 'starred'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Star className="w-3 h-3 text-amber-500" />
              <span>Starred</span>
            </button>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search your boards..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white/80 dark:bg-[#202024]/80 border border-black/5 dark:border-white/5 outline-none focus:ring-2 focus:ring-blue-500/20 shadow-xs"
            />
          </div>
        </div>

        {filteredBoards.length === 0 ? (
          <div className="rounded-3xl p-12 text-center border border-dashed border-neutral-300 dark:border-neutral-700/80 bg-white/40 dark:bg-[#202024]/40">
            <div className="w-12 h-12 rounded-2xl bg-neutral-200/70 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-3">
              <LayoutGrid className="w-6 h-6 text-neutral-400" />
            </div>
            <h3 className="text-sm font-semibold mb-1">No whiteboards found</h3>
            <p className="text-xs text-neutral-400 mb-4">
              Create your first board to start drawing and organizing notes.
            </p>
            <button
              onClick={() => setIsNewModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium text-xs cursor-pointer shadow-xs"
            >
              Create new board
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Create New Board Card */}
            <div
              onClick={() => setIsNewModalOpen(true)}
              className="group rounded-3xl border-2 border-dashed border-neutral-300 dark:border-neutral-800 hover:border-blue-500/60 dark:hover:border-blue-400/60 bg-white/40 dark:bg-[#202024]/40 hover:bg-white/90 dark:hover:bg-[#202024]/90 transition-all p-6 flex flex-col items-center justify-center text-center cursor-pointer min-h-[260px] shadow-xs hover:shadow-md"
            >
              <div className="w-12 h-12 rounded-2xl bg-neutral-200/80 dark:bg-neutral-800 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all text-neutral-600 dark:text-neutral-300">
                <Plus className="w-6 h-6" />
              </div>
              <span className="text-sm font-semibold">New whiteboard</span>
              <span className="text-xs text-neutral-400 mt-1">
                Start from scratch or template
              </span>
            </div>

            {/* Visual Canvas Project Cards (Canva-style Live Thumbnails) */}
            {filteredBoards.map((b) => (
              <Link
                key={b.id}
                href={`/board/${b.id}`}
                className="group relative rounded-3xl border border-black/5 dark:border-white/5 bg-white/95 dark:bg-[#202024]/95 p-3.5 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between overflow-hidden"
              >
                {/* Live Visual Canvas Thumbnail */}
                <div className="relative mb-3">
                  <BoardThumbnail boardId={b.id} />

                  {/* Top-Right Quick Action Hover Bar */}
                  <div
                    className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20 bg-white/90 dark:bg-[#18181A]/90 backdrop-blur-md p-1 rounded-xl shadow-md border border-black/5 dark:border-white/5"
                    onClick={(e) => e.preventDefault()}
                  >
                    <button
                      onClick={(e) => handleToggleStar(e, b)}
                      className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-neutral-400 hover:text-amber-500 transition cursor-pointer"
                      title={b.isStarred ? 'Unstar board' : 'Star board'}
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${
                          b.isStarred ? 'fill-amber-500 text-amber-500' : ''
                        }`}
                      />
                    </button>
                    <button
                      onClick={(e) => handleStartRename(e, b)}
                      className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition cursor-pointer"
                      title="Rename board"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDuplicate(e, b)}
                      className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition cursor-pointer"
                      title="Duplicate board"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, b)}
                      className="p-1 rounded-lg hover:bg-rose-500/15 text-neutral-400 hover:text-rose-500 transition cursor-pointer"
                      title="Delete whiteboard"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Star Badge if Starred and not hovered */}
                  {b.isStarred && (
                    <div className="absolute top-2.5 left-2.5 p-1 rounded-lg bg-amber-500/90 text-white shadow-xs group-hover:opacity-0 transition-opacity">
                      <Star className="w-3 h-3 fill-white" />
                    </div>
                  )}
                </div>

                {/* Bottom Metadata & Title */}
                <div className="px-1.5 pb-1">
                  <div className="flex items-center justify-between mb-1">
                    {renamingId === b.id ? (
                      <div
                        className="flex items-center gap-1.5 w-full"
                        onClick={(e) => e.preventDefault()}
                      >
                        <input
                          type="text"
                          autoFocus
                          value={renameInput}
                          onChange={(e) => setRenameInput(e.target.value)}
                          onBlur={() => handleSaveRename(b)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveRename(b);
                            if (e.key === 'Escape') setRenamingId(null);
                          }}
                          className="text-sm font-semibold px-2 py-0.5 rounded-lg border border-blue-500 bg-transparent outline-none w-full"
                        />
                      </div>
                    ) : (
                      <h2 className="text-sm font-semibold tracking-tight text-neutral-800 dark:text-neutral-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                        {b.title}
                      </h2>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-neutral-400 dark:text-neutral-500 mt-1.5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatRelativeTime(b.updatedAt || b.createdAt)}</span>
                    </span>
                    <span className="font-mono text-[10px]">
                      {b.elementCount || 0} items
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* New Whiteboard Modal */}
      {isNewModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setIsNewModalOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#202024] border border-black/10 dark:border-white/10 shadow-2xl p-6 text-neutral-800 dark:text-neutral-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold">New whiteboard</h3>
                <p className="text-xs text-neutral-400">
                  Configure title and starting workspace layout
                </p>
              </div>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNew} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-medium block mb-1.5 text-neutral-700 dark:text-neutral-300">
                  Board title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Brainstorming session, System architecture"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-black/10 dark:border-white/10 outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="text-xs font-medium block mb-1.5 text-neutral-700 dark:text-neutral-300">
                  Description (optional)
                </label>
                <input
                  type="text"
                  placeholder="Brief note about the purpose of this canvas"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-black/10 dark:border-white/10 outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Starter Templates */}
              <div>
                <label className="text-xs font-medium block mb-1.5 text-neutral-700 dark:text-neutral-300">
                  Template
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {STARTER_TEMPLATES.map((tmpl) => (
                    <div
                      key={tmpl.id}
                      onClick={() => {
                        setSelectedTemplate(tmpl.id);
                        setSelectedColor(tmpl.color);
                      }}
                      className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                        selectedTemplate === tmpl.id
                          ? 'border-blue-500 bg-blue-500/5 ring-2 ring-blue-500/20 shadow-xs'
                          : 'border-black/5 dark:border-white/5 bg-neutral-50/50 dark:bg-neutral-900/40 hover:border-black/15'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: tmpl.color }}
                        />
                        <span className="text-xs font-semibold">
                          {tmpl.name}
                        </span>
                      </div>
                      <p className="text-[10px] text-neutral-400 line-clamp-2">
                        {tmpl.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Color Tag */}
              <div>
                <label className="text-xs font-medium block mb-1.5 text-neutral-700 dark:text-neutral-300">
                  Color tag
                </label>
                <div className="flex items-center gap-2">
                  {colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSelectedColor(c)}
                      className={`w-6 h-6 rounded-full transition-transform cursor-pointer ${
                        selectedColor === c
                          ? 'ring-2 ring-blue-500 scale-110'
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 mt-2 pt-3 border-t border-black/5 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold hover:opacity-90 transition cursor-pointer shadow-sm"
                >
                  Create whiteboard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
