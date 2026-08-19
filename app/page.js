'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { ThemeProvider } from '@/components/ThemeContext';
import { ToastProvider } from '@/components/ToastContext';

const BoardsDashboard = dynamic(
  () => import('@/components/BoardsDashboard'),
  {
    ssr: false,
    loading: () => (
      <div className="w-screen h-screen flex items-center justify-center bg-[#F1EFE8] dark:bg-[#18181A] text-neutral-600 dark:text-neutral-300">
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium">Loading Whiteboard Studio...</span>
        </div>
      </div>
    ),
  }
);

export default function HomePage() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BoardsDashboard />
      </ToastProvider>
    </ThemeProvider>
  );
}
