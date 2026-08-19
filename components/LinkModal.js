'use client';

import React, { useState } from 'react';
import { Link2, X, Check, ExternalLink } from 'lucide-react';
import { useTheme } from './ThemeContext';

export default function LinkModal({ isOpen, initialUrl = '', onSave, onClose }) {
  const { isDark } = useTheme();
  const [url, setUrl] = useState(initialUrl);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    let formatted = url.trim();
    if (formatted && !/^https?:\/\//i.test(formatted)) {
      formatted = `https://${formatted}`;
    }
    onSave(formatted);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-4 bg-white dark:bg-[#222225] border border-black/10 dark:border-white/10 shadow-2xl space-y-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-800 dark:text-neutral-100">
            <Link2 className="w-4 h-4 text-blue-500" />
            <span>Attach web link</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-3">
          <input
            type="text"
            autoFocus
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="e.g. https://linear.app or notion.so"
            className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-transparent focus:border-blue-500 outline-none text-neutral-800 dark:text-neutral-200"
          />

          <div className="flex items-center justify-between pt-1">
            {url ? (
              <button
                type="button"
                onClick={() => {
                  onSave('');
                  onClose();
                }}
                className="text-[11px] text-rose-500 hover:underline cursor-pointer"
              >
                Remove link
              </button>
            ) : (
              <span />
            )}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-xl text-xs text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-xl text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3 h-3" />
                <span>Save link</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
