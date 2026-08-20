'use client';

import { supabase } from './supabaseClient';
import {
  getBoardsMeta,
  saveBoardsMeta,
  getBoardElements,
  saveBoardElements,
} from './boardStore';

let syncDebounceTimers = {};

/**
 * Upserts a board and its elements into Supabase cloud table `whiteboards`
 */
export async function syncBoardToCloud(boardId, customMeta = null, customElements = null, customPattern = null) {
  if (!supabase) return { success: false, reason: 'Supabase client not initialized' };

  if (syncDebounceTimers[boardId]) {
    clearTimeout(syncDebounceTimers[boardId]);
  }

  return new Promise((resolve) => {
    syncDebounceTimers[boardId] = setTimeout(async () => {
      try {
        const metaList = getBoardsMeta();
        const currentMeta =
          customMeta || metaList.find((b) => b.id === boardId) || {
            id: boardId,
            title: 'Personal workspace',
            description: '',
            color: '#3B82F6',
            isStarred: false,
          };

        const elements = customElements || getBoardElements(boardId) || [];
        const pattern =
          customPattern ||
          (typeof window !== 'undefined'
            ? localStorage.getItem(`whiteboard-pattern-${boardId}`) || 'dotted'
            : 'dotted');

        const payload = {
          id: boardId,
          title: currentMeta.title || 'Untitled Board',
          description: currentMeta.description || '',
          color: currentMeta.color || '#3B82F6',
          is_starred: !!currentMeta.isStarred,
          elements: elements,
          canvas_pattern: pattern,
          updated_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
          .from('whiteboards')
          .upsert(payload, { onConflict: 'id' })
          .select();

        if (error) {
          console.warn('Supabase sync warning (table may need creation):', error.message);
          resolve({ success: false, error });
        } else {
          resolve({ success: true, data });
        }
      } catch (err) {
        console.error('Failed to sync board to Supabase:', err);
        resolve({ success: false, error: err });
      }
    }, 500);
  });
}

/**
 * Fetches a single board and its elements from Supabase cloud
 */
export async function fetchBoardFromCloud(boardId) {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('whiteboards')
      .select('*')
      .eq('id', boardId)
      .single();

    if (error || !data) return null;

    // Cache to local storage
    if (data.elements && Array.isArray(data.elements)) {
      saveBoardElements(boardId, data.elements);
    }
    if (data.canvas_pattern && typeof window !== 'undefined') {
      localStorage.setItem(`whiteboard-pattern-${boardId}`, data.canvas_pattern);
    }

    const metaList = getBoardsMeta();
    const updatedMeta = {
      id: data.id,
      title: data.title,
      description: data.description,
      color: data.color,
      isStarred: data.is_starred,
      updatedAt: data.updated_at,
      createdAt: data.created_at,
      elementCount: data.elements?.length || 0,
    };

    const exists = metaList.some((b) => b.id === data.id);
    const nextMeta = exists
      ? metaList.map((b) => (b.id === data.id ? { ...b, ...updatedMeta } : b))
      : [updatedMeta, ...metaList];

    saveBoardsMeta(nextMeta);
    return data;
  } catch (err) {
    console.error('Failed to fetch board from Supabase:', err);
    return null;
  }
}

/**
 * Fetches all boards metadata from Supabase cloud and updates local list
 */
export async function fetchAllBoardsFromCloud() {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('whiteboards')
      .select('id, title, description, color, is_starred, canvas_pattern, created_at, updated_at, elements')
      .order('updated_at', { ascending: false });

    if (error || !data || data.length === 0) return [];

    const cloudMetaList = data.map((b) => {
      // Cache elements
      if (b.elements && Array.isArray(b.elements)) {
        saveBoardElements(b.id, b.elements);
      }
      return {
        id: b.id,
        title: b.title,
        description: b.description,
        color: b.color,
        isStarred: b.is_starred,
        updatedAt: b.updated_at,
        createdAt: b.created_at,
        elementCount: b.elements?.length || 0,
      };
    });

    // Merge with local boards
    const local = getBoardsMeta() || [];
    const merged = [...cloudMetaList];
    local.forEach((loc) => {
      if (!merged.some((m) => m.id === loc.id)) {
        merged.push(loc);
      }
    });

    saveBoardsMeta(merged);
    return merged;
  } catch (err) {
    console.error('Failed to fetch all boards from Supabase:', err);
    return [];
  }
}

/**
 * Deletes a board from Supabase cloud
 */
export async function deleteBoardFromCloud(boardId) {
  if (!supabase) return;
  try {
    await supabase.from('whiteboards').delete().eq('id', boardId);
  } catch (err) {
    console.error('Failed to delete board from Supabase:', err);
  }
}

/**
 * Subscribes to Realtime Postgres Changes for a board
 */
export function subscribeToBoardRealtime(boardId, onRemoteChange) {
  if (!supabase) return () => {};

  const channel = supabase
    .channel(`board-realtime-${boardId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'whiteboards',
        filter: `id=eq.${boardId}`,
      },
      (payload) => {
        if (payload.new && payload.new.id === boardId) {
          onRemoteChange && onRemoteChange(payload.new);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
