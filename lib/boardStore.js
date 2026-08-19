'use client';

const BOARDS_META_KEY = 'wb_boards_meta_v1';
const BOARD_DATA_PREFIX = 'wb_board_data_v1_';

const SAMPLE_DESIGN_REF_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="none"><rect width="600" height="400" rx="24" fill="%231E1E24"/><circle cx="150" cy="160" r="70" fill="%23F59E0B" fill-opacity="0.85"/><circle cx="230" cy="160" r="70" fill="%2314B8A6" fill-opacity="0.85" style="mix-blend-mode: multiply;"/><rect x="360" y="100" width="160" height="120" rx="16" fill="%238B5CF6" fill-opacity="0.9"/><rect x="80" y="270" width="440" height="12" rx="6" fill="%2352525B"/><rect x="80" y="295" width="280" height="10" rx="5" fill="%233F3F46"/><text x="80" y="70" fill="%23EDEDED" font-family="sans-serif" font-size="20" font-weight="bold">Design Systems &amp; Visual Tokens</text></svg>`;

export const STARTER_TEMPLATES = [
  {
    id: 'blank',
    name: 'Blank board',
    description: 'Start with a clean slate infinite canvas',
    color: '#3B82F6',
    elements: [],
  },
  {
    id: 'brainstorming',
    name: 'Brainstorming & notes',
    description: 'Amber, Teal, and Rose sticky notes with ideas & tasks',
    color: '#F59E0B',
    elements: [
      {
        id: 'note-1',
        type: 'sticky-note',
        color: 'amber',
        isSquare: true,
        text: 'Focus on minimal distraction-free creative workflows.',
        bold: true,
        fontSize: 'medium',
        x: 180,
        y: 160,
        width: 220,
        height: 220,
      },
      {
        id: 'note-2',
        type: 'sticky-note',
        color: 'teal',
        isSquare: true,
        text: '1. Wireframe layouts\n2. Review with team\n3. Ship v1 release',
        fontSize: 'medium',
        x: 440,
        y: 160,
        width: 220,
        height: 220,
      },
      {
        id: 'note-3',
        type: 'sticky-note',
        color: 'rose',
        isSquare: true,
        text: 'Keep UI snappy like Notion, Linear, and Canva.',
        fontSize: 'medium',
        x: 700,
        y: 160,
        width: 220,
        height: 220,
      },
    ],
  },
  {
    id: 'system-flow',
    name: 'System architecture',
    description: 'Connected flowcharts, nodes, and system diagrams',
    color: '#10B981',
    elements: [
      {
        id: 'shape-1',
        type: 'rectangle',
        rounded: true,
        filled: true,
        fillColor: '#E0F2FE',
        strokeColor: '#0284C7',
        strokeWidth: 2,
        text: 'Client web app\n(Next.js & React 19)',
        fontSize: 'medium',
        bold: true,
        x: 160,
        y: 200,
        width: 200,
        height: 100,
      },
      {
        id: 'shape-2',
        type: 'arrow',
        strokeColor: '#0284C7',
        strokeWidth: 2,
        x: 380,
        y: 240,
        width: 90,
        height: 24,
      },
      {
        id: 'shape-3',
        type: 'rectangle',
        rounded: true,
        filled: true,
        fillColor: '#DCFCE7',
        strokeColor: '#16A34A',
        strokeWidth: 2,
        text: 'Vector canvas engine\n(Infinite dot grid)',
        fontSize: 'medium',
        bold: true,
        x: 490,
        y: 200,
        width: 200,
        height: 100,
      },
      {
        id: 'shape-4',
        type: 'arrow',
        strokeColor: '#16A34A',
        strokeWidth: 2,
        x: 710,
        y: 240,
        width: 90,
        height: 24,
      },
      {
        id: 'shape-5',
        type: 'rectangle',
        rounded: true,
        filled: true,
        fillColor: '#FEF3C7',
        strokeColor: '#D97706',
        strokeWidth: 2,
        text: 'Local-first store\n(Auto-persisted)',
        fontSize: 'medium',
        bold: true,
        x: 820,
        y: 200,
        width: 200,
        height: 100,
      },
    ],
  },
  {
    id: 'moodboard',
    name: 'Design references',
    description: 'Visual image blocks and color cards',
    color: '#8B5CF6',
    elements: [
      {
        id: 'img-1',
        type: 'image-block',
        caption: 'Visual tokens & palette',
        imageUrl: SAMPLE_DESIGN_REF_SVG,
        x: 160,
        y: 140,
        width: 380,
        height: 260,
      },
      {
        id: 'note-m1',
        type: 'sticky-note',
        color: 'violet',
        isSquare: true,
        text: '• Warm canvas: #F1EFE8\n• Dark canvas: #18181A\n• Dot grid: 16px spacing\n• 3px clean image outlines',
        fontSize: 'medium',
        x: 580,
        y: 140,
        width: 240,
        height: 240,
      },
      {
        id: 'note-m2',
        type: 'sticky-note',
        color: 'emerald',
        isSquare: true,
        text: 'Sentence-case labels everywhere. Generous whitespace with minimal 0.5–1px borders.',
        fontSize: 'medium',
        x: 850,
        y: 140,
        width: 240,
        height: 240,
      },
    ],
  },
];

export const INITIAL_BOARDS = [
  {
    id: 'board-main',
    title: 'Personal workspace',
    description: 'Main creative whiteboard for ideas & architecture',
    color: '#F59E0B',
    isStarred: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    elementCount: 3,
  },
  {
    id: 'board-design',
    title: 'Product design & flows',
    description: 'Wireframes, UX flowcharts, and reference images',
    color: '#10B981',
    isStarred: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    elementCount: 5,
  },
];

export function getBoardsMeta() {
  if (typeof window === 'undefined') return INITIAL_BOARDS;
  try {
    const raw = localStorage.getItem(BOARDS_META_KEY);
    if (!raw) {
      localStorage.setItem(BOARDS_META_KEY, JSON.stringify(INITIAL_BOARDS));
      return INITIAL_BOARDS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_BOARDS;
  } catch (e) {
    console.error('Failed to load boards metadata:', e);
    return INITIAL_BOARDS;
  }
}

export function saveBoardsMeta(boards) {
  if (typeof window === 'undefined') return;
  try {
    const safeBoards = Array.isArray(boards) ? boards : [];
    localStorage.setItem(BOARDS_META_KEY, JSON.stringify(safeBoards));
  } catch (e) {
    console.error('Failed to save boards metadata:', e);
  }
}

export function getBoardElements(boardId) {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`${BOARD_DATA_PREFIX}${boardId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    }

    if (boardId === 'board-main') {
      return STARTER_TEMPLATES[1].elements;
    }
    if (boardId === 'board-design') {
      return STARTER_TEMPLATES[2].elements;
    }
    return [];
  } catch (e) {
    console.error('Failed to load board elements:', e);
    return [];
  }
}

export function saveBoardElements(boardId, elements) {
  if (typeof window === 'undefined') return;
  try {
    const safeElements = Array.isArray(elements) ? elements : [];
    localStorage.setItem(
      `${BOARD_DATA_PREFIX}${boardId}`,
      JSON.stringify(safeElements)
    );

    const boards = getBoardsMeta();
    const updatedBoards = (boards || []).map((b) =>
      b.id === boardId
        ? {
            ...b,
            updatedAt: new Date().toISOString(),
            elementCount: safeElements.length,
          }
        : b
    );
    saveBoardsMeta(updatedBoards);
  } catch (e) {
    console.error('Failed to save board elements:', e);
  }
}

export function createBoard({ title, description, templateId, color }) {
  const newId = `board-${Date.now()}`;
  const template =
    STARTER_TEMPLATES.find((t) => t.id === templateId) || STARTER_TEMPLATES[0];

  const newBoardMeta = {
    id: newId,
    title: title.trim() || 'Untitled board',
    description: description.trim() || 'Custom whiteboard',
    color: color || template.color,
    isStarred: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    elementCount: (template.elements || []).length,
  };

  const currentBoards = getBoardsMeta();
  const nextBoards = [newBoardMeta, ...(currentBoards || [])];
  saveBoardsMeta(nextBoards);
  saveBoardElements(newId, template.elements || []);

  return newBoardMeta;
}

export function deleteBoard(boardId) {
  const currentBoards = getBoardsMeta();
  const nextBoards = (currentBoards || []).filter((b) => b.id !== boardId);
  saveBoardsMeta(nextBoards);
  if (typeof window !== 'undefined') {
    localStorage.removeItem(`${BOARD_DATA_PREFIX}${boardId}`);
  }
  return nextBoards;
}

export function duplicateBoard(boardId) {
  const boards = getBoardsMeta();
  const target = (boards || []).find((b) => b.id === boardId);
  if (!target) return boards || [];

  const elements = getBoardElements(boardId);
  const newId = `board-${Date.now()}`;
  const duplicatedMeta = {
    ...target,
    id: newId,
    title: `${target.title} (Copy)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const nextBoards = [duplicatedMeta, ...(boards || [])];
  saveBoardsMeta(nextBoards);
  saveBoardElements(newId, elements || []);
  return nextBoards;
}

export function toggleStarBoard(boardId) {
  const boards = getBoardsMeta();
  const nextBoards = (boards || []).map((b) =>
    b.id === boardId ? { ...b, isStarred: !b.isStarred } : b
  );
  saveBoardsMeta(nextBoards);
  return nextBoards;
}

export function renameBoard(boardId, newTitle) {
  const boards = getBoardsMeta();
  const nextBoards = (boards || []).map((b) =>
    b.id === boardId
      ? {
          ...b,
          title: newTitle.trim() || 'Untitled board',
          updatedAt: new Date().toISOString(),
        }
      : b
  );
  saveBoardsMeta(nextBoards);
  return nextBoards;
}
