'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  StickyNote as StickyIcon,
  Square,
  Diamond,
  ImageIcon,
  Type,
  Video,
  X,
  ArrowRight,
} from 'lucide-react';
import { useTheme } from './ThemeContext';
import { useToast } from './ToastContext';
import FloatingToolbar from './FloatingToolbar';
import ZoomIndicator from './ZoomIndicator';
import ElementInspector from './ElementInspector';
import ContextMenu from './ContextMenu';
import LinkModal from './LinkModal';
import StickyNote from './StickyNote';
import ImageBlock from './ImageBlock';
import ShapeElement from './ShapeElement';
import TextElement from './TextElement';
import VideoBlock from './VideoBlock';
import { getBoardElements, saveBoardElements } from '../lib/boardStore';
import { computeConnectorPath } from './BoardThumbnail';
import { syncBoardToCloud, subscribeToBoardRealtime } from '../lib/supabaseSync';

export default function WhiteboardCanvas({ boardId = 'board-main' }) {
  const { isDark } = useTheme();
  const { showSuccess, showInfo, confirm } = useToast();

  const [camera, setCamera] = useState({ x: 0, y: 0, zoom: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0, cameraX: 0, cameraY: 0 });

  const [elements, setElements] = useState([]);
  const latestElementsRef = useRef([]);
  latestElementsRef.current = elements;

  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const [activeTool, setActiveTool] = useState('select');
  const [selectedIds, setSelectedIds] = useState([]);

  const [pencilStrokeWidth, setPencilStrokeWidth] = useState(4);
  const [pencilColor, setPencilColor] = useState('auto');
  const [eraserSize, setEraserSize] = useState(32);

  const [canvasPattern, setCanvasPattern] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(`whiteboard-pattern-${boardId}`) || 'dotted';
    }
    return 'dotted';
  });

  const handleChangePattern = (newPattern) => {
    setCanvasPattern(newPattern);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`whiteboard-pattern-${boardId}`, newPattern);
    }
    showSuccess(`Canvas style: ${newPattern}`);
  };

  const [draggingElement, setDraggingElement] = useState(null);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, elemX: 0, elemY: 0 });

  const [resizing, setResizing] = useState(null);
  const [rotating, setRotating] = useState(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const currentPathRef = useRef([]);

  const [isEraserDragging, setIsEraserDragging] = useState(false);

  const [selectionBox, setSelectionBox] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [linkModal, setLinkModal] = useState({ isOpen: false, elementId: null });
  const [quickConnectMenu, setQuickConnectMenu] = useState(null);

  const containerRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const loaded = getBoardElements(boardId);
    const safeLoaded = Array.isArray(loaded) ? loaded : [];
    setElements(safeLoaded);
    setHistory([safeLoaded]);
    setHistoryIndex(0);
    setSelectedIds([]);

    // Subscribe to realtime updates
    const unsubscribe = subscribeToBoardRealtime(boardId, (remoteBoard) => {
      if (remoteBoard?.elements && Array.isArray(remoteBoard.elements)) {
        setElements(remoteBoard.elements);
        saveBoardElements(boardId, remoteBoard.elements);
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [boardId]);

  const saveToHistory = useCallback(
    (newElements) => {
      if (!Array.isArray(newElements)) return;
      setElements(newElements);
      setHistory((prev) => {
        const safePrev = Array.isArray(prev) ? prev : [];
        const next = safePrev.slice(0, historyIndex + 1);
        return [...next, newElements];
      });
      setHistoryIndex((prev) => prev + 1);
      saveBoardElements(boardId, newElements);
      syncBoardToCloud(boardId, null, newElements, canvasPattern);
    },
    [boardId, historyIndex, canvasPattern]
  );

  const handleUndo = useCallback(() => {
    if (historyIndex > 0 && Array.isArray(history) && history[historyIndex - 1]) {
      const nextIdx = historyIndex - 1;
      const targetElements = history[nextIdx];
      if (Array.isArray(targetElements)) {
        setHistoryIndex(nextIdx);
        setElements(targetElements);
        saveBoardElements(boardId, targetElements);
        syncBoardToCloud(boardId, null, targetElements, canvasPattern);
        showInfo('Undo');
      }
    }
  }, [historyIndex, history, boardId, canvasPattern, showInfo]);

  const handleRedo = useCallback(() => {
    if (
      Array.isArray(history) &&
      historyIndex < history.length - 1 &&
      history[historyIndex + 1]
    ) {
      const nextIdx = historyIndex + 1;
      const targetElements = history[nextIdx];
      if (Array.isArray(targetElements)) {
        setHistoryIndex(nextIdx);
        setElements(targetElements);
        saveBoardElements(boardId, targetElements);
        syncBoardToCloud(boardId, null, targetElements, canvasPattern);
        showInfo('Redo');
      }
    }
  }, [historyIndex, history, boardId, canvasPattern, showInfo]);

  const screenToWorld = useCallback(
    (screenX, screenY) => {
      return {
        x: (screenX - camera.x) / camera.zoom,
        y: (screenY - camera.y) / camera.zoom,
      };
    },
    [camera]
  );

  const handleWheel = (e) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      const zoomFactor = 1.08;
      const newZoom =
        e.deltaY < 0
          ? Math.min(camera.zoom * zoomFactor, 3.5)
          : Math.max(camera.zoom / zoomFactor, 0.25);

      const mouseX = e.clientX;
      const mouseY = e.clientY;

      const newCameraX = mouseX - (mouseX - camera.x) * (newZoom / camera.zoom);
      const newCameraY = mouseY - (mouseY - camera.y) * (newZoom / camera.zoom);

      setCamera({
        x: newCameraX,
        y: newCameraY,
        zoom: newZoom,
      });
    } else {
      setCamera((prev) => ({
        ...prev,
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY,
      }));
    }
  };

  const handleZoomIn = () => {
    setCamera((prev) => {
      const newZoom = Math.min(prev.zoom * 1.25, 3.5);
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      return {
        x: centerX - (centerX - prev.x) * (newZoom / prev.zoom),
        y: centerY - (centerY - prev.y) * (newZoom / prev.zoom),
        zoom: newZoom,
      };
    });
  };

  const handleZoomOut = () => {
    setCamera((prev) => {
      const newZoom = Math.max(prev.zoom / 1.25, 0.25);
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      return {
        x: centerX - (centerX - prev.x) * (newZoom / prev.zoom),
        y: centerY - (centerY - prev.y) * (newZoom / prev.zoom),
        zoom: newZoom,
      };
    });
  };

  const handleResetZoom = () => {
    setCamera({ x: 0, y: 0, zoom: 1 });
  };

  const handleFitView = () => {
    if (elements.length === 0) {
      setCamera({ x: 0, y: 0, zoom: 1 });
      return;
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

    if (minX === Infinity) return;

    const padding = 120;
    const contentW = maxX - minX + padding * 2;
    const contentH = maxY - minY + padding * 2;

    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

    const scaleX = screenW / contentW;
    const scaleY = screenH / contentH;
    const fitZoom = Math.max(0.25, Math.min(scaleX, scaleY, 1.2));

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    setCamera({
      x: screenW / 2 - centerX * fitZoom,
      y: screenH / 2 - centerY * fitZoom,
      zoom: fitZoom,
    });
    showInfo('Fit elements to view');
  };

  const handleAddStickyNote = (extra = {}) => {
    const center = screenToWorld(
      window.innerWidth / 2 - 110 + (Math.random() * 40 - 20),
      window.innerHeight / 2 - 110 + (Math.random() * 40 - 20)
    );
    const newNote = {
      id: `note-${Date.now()}`,
      type: 'sticky-note',
      color: extra.color || 'amber',
      isSquare: extra.isSquare !== undefined ? extra.isSquare : true,
      text: '',
      fontFamily: 'Inter',
      fontSize: 'medium',
      x: Math.round(center.x),
      y: Math.round(center.y),
      width: 220,
      height: 220,
      rotation: 0,
    };
    saveToHistory([...elements, newNote]);
    setSelectedIds([newNote.id]);
    setActiveTool('select');
  };

  const handleAddImageBlock = (imageUrl = null) => {
    const center = screenToWorld(
      window.innerWidth / 2 - 140 + (Math.random() * 40 - 20),
      window.innerHeight / 2 - 100 + (Math.random() * 40 - 20)
    );
    const newImage = {
      id: `image-${Date.now()}`,
      type: 'image-block',
      imageUrl: imageUrl || null,
      caption: '',
      x: Math.round(center.x),
      y: Math.round(center.y),
      width: 280,
      height: 200,
      aspectRatio: 1.4,
      rotation: 0,
    };
    saveToHistory([...elements, newImage]);
    setSelectedIds([newImage.id]);
    setActiveTool('select');
  };

  const handleAddVideo = (videoUrl, title = '') => {
    const center = screenToWorld(
      window.innerWidth / 2 - 190 + (Math.random() * 40 - 20),
      window.innerHeight / 2 - 130 + (Math.random() * 40 - 20)
    );
    const newVideo = {
      id: `video-${Date.now()}`,
      type: 'video-block',
      videoUrl: videoUrl,
      title: title || 'Video / Social Reel',
      x: Math.round(center.x),
      y: Math.round(center.y),
      width: 380,
      height: 260,
      aspectRatio: 1.46,
      rotation: 0,
    };
    saveToHistory([...elements, newVideo]);
    setSelectedIds([newVideo.id]);
    setActiveTool('select');
    showSuccess('Inserted video / reel into canvas');
  };

  const handleAddShape = (shapeType) => {
    const center = screenToWorld(
      window.innerWidth / 2 - 110 + (Math.random() * 40 - 20),
      window.innerHeight / 2 - 60 + (Math.random() * 40 - 20)
    );

    if (shapeType === 'text') {
      const newText = {
        id: `text-${Date.now()}`,
        type: 'text',
        x: Math.round(center.x),
        y: Math.round(center.y),
        width: 240,
        height: 70,
        text: 'Type something...',
        fontSize: 24,
        fontFamily: 'Inter',
        bold: false,
        italic: false,
        underline: false,
        strikethrough: false,
        align: 'left',
        lineHeight: 1.3,
        letterSpacing: 0,
        strokeColor: 'auto',
        fillColor: 'transparent',
        filled: false,
        rotation: 0,
      };
      saveToHistory([...elements, newText]);
      setSelectedIds([newText.id]);
      setActiveTool('select');
      return;
    }

    const newShape = {
      id: `shape-${Date.now()}`,
      type: shapeType,
      x: Math.round(center.x),
      y: Math.round(center.y),
      width: shapeType === 'line' || shapeType === 'arrow' ? 160 : 180,
      height: shapeType === 'arrow' || shapeType === 'line' ? 24 : 120,
      text: '',
      fontFamily: 'Inter',
      filled: false,
      fillColor: 'transparent',
      rounded: true,
      strokeColor: 'auto',
      strokeWidth: 2,
      fontSize: 'medium',
      bold: false,
      italic: false,
      align: 'center',
      rotation: 0,
    };
    saveToHistory([...elements, newShape]);
    setSelectedIds([newShape.id]);
    setActiveTool('select');
  };

  const handleElementChange = (id, updates) => {
    const next = elements.map((el) =>
      el.id === id ? { ...el, ...updates } : el
    );
    saveToHistory(next);
  };

  const handleDeleteElement = (id) => {
    const next = elements.filter(
      (el) => el.id !== id && el.fromId !== id && el.toId !== id
    );
    saveToHistory(next);
    setSelectedIds((prev) => prev.filter((i) => i !== id));
  };

  const handleDuplicateElement = (id) => {
    const target = elements.find((e) => e.id === id);
    if (!target) return;
    const duplicated = {
      ...target,
      id: `${target.type}-${Date.now()}`,
      x: target.x + 30,
      y: target.y + 30,
    };
    saveToHistory([...elements, duplicated]);
    setSelectedIds([duplicated.id]);
    showSuccess('Element duplicated');
  };

  const handleBringToFront = (id) => {
    const target = elements.find((e) => e.id === id);
    if (!target) return;
    const filtered = elements.filter((e) => e.id !== id);
    saveToHistory([...filtered, target]);
  };

  const handleSendToBack = (id) => {
    const target = elements.find((e) => e.id === id);
    if (!target) return;
    const filtered = elements.filter((e) => e.id !== id);
    saveToHistory([target, ...filtered]);
  };

  const handleToggleLock = (id) => {
    const target = elements.find((e) => e.id === id);
    if (!target) return;
    const nextState = !target.isLocked;
    handleElementChange(id, { isLocked: nextState });
    showInfo(nextState ? 'Element locked' : 'Element unlocked');
  };

  // Universal Process Incoming Data (Files, Images, Videos, Instagram Reels, URLs, Texts)
  const handleProcessIncomingData = useCallback(
    async (dataTransfer, clientX, clientY) => {
      const worldPos = screenToWorld(
        clientX || window.innerWidth / 2,
        clientY || window.innerHeight / 2
      );

      // 1. Check for dropped files
      const files = Array.from(dataTransfer.files || []);
      if (files.length > 0) {
        for (const file of files) {
          if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (ev) => {
              const img = new Image();
              img.onload = () => {
                const maxDim = 400;
                let w = img.naturalWidth || 300;
                let h = img.naturalHeight || 200;
                if (w > maxDim || h > maxDim) {
                  const scale = maxDim / Math.max(w, h);
                  w = Math.round(w * scale);
                  h = Math.round(h * scale);
                }
                const newImg = {
                  id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                  type: 'image-block',
                  x: Math.round(worldPos.x - w / 2),
                  y: Math.round(worldPos.y - h / 2),
                  width: w,
                  height: h,
                  imageUrl: ev.target.result,
                  caption: file.name.replace(/\.[^/.]+$/, ''),
                  aspectRatio: w / h || 4 / 3,
                  rotation: 0,
                };
                saveToHistory([...latestElementsRef.current, newImg]);
                showSuccess(`Added image "${file.name}"`);
              };
              img.src = ev.target.result;
            };
            reader.readAsDataURL(file);
          } else if (file.type.startsWith('video/')) {
            const blobUrl = URL.createObjectURL(file);
            const newVideo = {
              id: `video-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              type: 'video-block',
              x: Math.round(worldPos.x - 190),
              y: Math.round(worldPos.y - 130),
              width: 380,
              height: 260,
              videoUrl: blobUrl,
              title: file.name,
              rotation: 0,
            };
            saveToHistory([...latestElementsRef.current, newVideo]);
            showSuccess(`Added video "${file.name}"`);
          }
        }
        return;
      }

      // 2. Check for text or URL
      const textData =
        dataTransfer.getData('text/uri-list') ||
        dataTransfer.getData('text/plain') ||
        '';

      if (!textData) return;
      const cleanText = textData.trim();
      const isUrl = /^https?:\/\//i.test(cleanText);

      if (isUrl) {
        const isVideoOrSocial =
          cleanText.includes('instagram.com') ||
          cleanText.includes('youtube.com') ||
          cleanText.includes('youtu.be') ||
          cleanText.includes('tiktok.com') ||
          cleanText.includes('vimeo.com') ||
          cleanText.includes('loom.com') ||
          cleanText.match(/\.(mp4|webm|mov|ogg)(\?.*)?$/i);

        if (isVideoOrSocial) {
          const newVideo = {
            id: `video-${Date.now()}`,
            type: 'video-block',
            x: Math.round(worldPos.x - 190),
            y: Math.round(worldPos.y - 130),
            width: 380,
            height: 260,
            videoUrl: cleanText,
            title: cleanText.includes('instagram.com')
              ? 'Instagram Reel'
              : cleanText.includes('youtube')
              ? 'YouTube'
              : cleanText.includes('tiktok')
              ? 'TikTok'
              : 'Video Media',
            rotation: 0,
          };
          saveToHistory([...latestElementsRef.current, newVideo]);
          showSuccess('Embedded social media reel into canvas');
          return;
        }

        if (cleanText.match(/\.(png|jpg|jpeg|webp|gif|svg)(\?.*)?$/i)) {
          const newImg = {
            id: `img-${Date.now()}`,
            type: 'image-block',
            x: Math.round(worldPos.x - 160),
            y: Math.round(worldPos.y - 120),
            width: 320,
            height: 240,
            imageUrl: cleanText,
            caption: '',
            rotation: 0,
          };
          saveToHistory([...latestElementsRef.current, newImg]);
          showSuccess('Added image link');
          return;
        }
      }

      // 3. Plain Text snippet dropped or pasted (Canva-style Text Element)
      const newText = {
        id: `text-${Date.now()}`,
        type: 'text',
        x: Math.round(worldPos.x - 120),
        y: Math.round(worldPos.y - 40),
        width: Math.min(Math.max(cleanText.length * 10, 200), 500),
        height: 70,
        text: cleanText,
        fontSize: 24,
        fontFamily: 'Inter',
        bold: false,
        italic: false,
        underline: false,
        strikethrough: false,
        align: 'left',
        lineHeight: 1.3,
        letterSpacing: 0,
        strokeColor: 'auto',
        fillColor: 'transparent',
        filled: false,
        rotation: 0,
      };
      saveToHistory([...latestElementsRef.current, newText]);
      setSelectedIds([newText.id]);
      showSuccess('Created text on canvas');
    },
    [screenToWorld, saveToHistory, showSuccess]
  );

  // Global Clipboard Paste Listener
  useEffect(() => {
    const handleGlobalPaste = (e) => {
      const active = document.activeElement;
      const isTyping =
        active &&
        (active.tagName === 'INPUT' ||
          active.tagName === 'TEXTAREA' ||
          active.isContentEditable ||
          active.getAttribute('contenteditable') === 'true' ||
          active.closest?.('[contenteditable="true"]'));

      if (isTyping) return;

      if (e.clipboardData) {
        e.preventDefault();
        handleProcessIncomingData(
          e.clipboardData,
          window.innerWidth / 2,
          window.innerHeight / 2
        );
      }
    };

    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, [handleProcessIncomingData]);

  const handleResizeStart = (e, dir, elemId) => {
    e.stopPropagation();
    const target = elements.find((el) => el.id === elemId);
    if (!target || target.isLocked) return;

    setResizing({
      id: elemId,
      dir,
      initialX: target.x,
      initialY: target.y,
      initialW: target.width || 180,
      initialH: target.height || 140,
      initialFontSize: typeof target.fontSize === 'number' ? target.fontSize : 24,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
    });
  };

  const handleRotateStart = (e, elemId) => {
    e.stopPropagation();
    const target = elements.find((el) => el.id === elemId);
    if (!target || target.isLocked) return;

    const centerX = target.x + (target.width || 180) / 2;
    const centerY = target.y + (target.height || 140) / 2;
    const worldMouse = screenToWorld(e.clientX, e.clientY);
    const startAngle = Math.atan2(worldMouse.y - centerY, worldMouse.x - centerX) * (180 / Math.PI);

    setRotating({
      id: elemId,
      centerX,
      centerY,
      startAngle,
      initialRotation: target.rotation || 0,
    });
  };

  const handleQuickConnectOpen = (e, elemId) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setQuickConnectMenu({
      sourceId: elemId,
      screenX: Math.min(rect.right + 12, window.innerWidth - 220),
      screenY: Math.max(20, rect.top - 40),
    });
  };

  const handleQuickConnectCreate = (nodeType, extra = {}) => {
    if (!quickConnectMenu) return;
    const source = elements.find((el) => el.id === quickConnectMenu.sourceId);
    if (!source) return;

    const sourceW = source.width || 220;
    const newX = source.x + sourceW + 110;
    const newY = source.y;

    let newNode;
    if (nodeType === 'sticky-note') {
      newNode = {
        id: `note-${Date.now()}`,
        type: 'sticky-note',
        color: extra.color || 'teal',
        isSquare: true,
        text: '',
        fontFamily: source.fontFamily || 'Inter',
        fontSize: 'medium',
        x: Math.round(newX),
        y: Math.round(newY),
        width: 220,
        height: 220,
        rotation: 0,
      };
    } else if (nodeType === 'rectangle') {
      newNode = {
        id: `shape-${Date.now()}`,
        type: 'rectangle',
        rounded: true,
        filled: true,
        fillColor: isDark ? '#2E2E32' : '#E0F2FE',
        strokeColor: isDark ? '#A1A1AA' : '#0284C7',
        strokeWidth: 2,
        text: '',
        fontFamily: 'Inter',
        fontSize: 'medium',
        x: Math.round(newX),
        y: Math.round(newY),
        width: 180,
        height: 100,
        rotation: 0,
      };
    } else if (nodeType === 'diamond') {
      newNode = {
        id: `shape-${Date.now()}`,
        type: 'diamond',
        filled: true,
        fillColor: isDark ? '#2E2E32' : '#FEF3C7',
        strokeColor: '#F59E0B',
        strokeWidth: 2,
        text: '',
        fontFamily: 'Inter',
        fontSize: 'medium',
        x: Math.round(newX),
        y: Math.round(newY),
        width: 160,
        height: 120,
        rotation: 0,
      };
    } else if (nodeType === 'image-block') {
      newNode = {
        id: `image-${Date.now()}`,
        type: 'image-block',
        imageUrl: null,
        caption: '',
        x: Math.round(newX),
        y: Math.round(newY),
        width: 240,
        height: 170,
        rotation: 0,
      };
    } else if (nodeType === 'text') {
      newNode = {
        id: `text-${Date.now()}`,
        type: 'text',
        text: 'Connected text',
        fontSize: 24,
        fontFamily: 'Inter',
        x: Math.round(newX),
        y: Math.round(newY),
        width: 180,
        height: 60,
        rotation: 0,
      };
    }

    // Dynamic sticky wavy connector
    const newConnector = {
      id: `conn-${Date.now()}`,
      type: 'connector',
      fromId: source.id,
      toId: newNode.id,
      strokeColor: isDark ? '#A1A1AA' : '#52525B',
      strokeWidth: 2.5,
    };

    const nextElements = [...elements, newConnector, newNode];
    saveToHistory(nextElements);
    setSelectedIds([newNode.id]);
    setQuickConnectMenu(null);
    showSuccess('Connected next node');
  };

  const handleContextMenu = (e, elemId = null) => {
    e.preventDefault();
    if (elemId) {
      setSelectedIds([elemId]);
    }
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      elementId: elemId,
    });
  };

  const handleElementPointerDown = (e, id) => {
    if (activeTool === 'hand') {
      setIsPanning(true);
      panStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        cameraX: camera.x,
        cameraY: camera.y,
      };
      return;
    }
    if (activeTool === 'eraser') {
      handleDeleteElement(id);
      return;
    }
    if (e.button !== 0) return;

    setSelectedIds([id]);
    const el = elements.find((item) => item.id === id);
    if (!el || el.isLocked) return;

    setDraggingElement(id);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      elemX: el.x,
      elemY: el.y,
    };
  };

  const eraseAtPoint = (worldX, worldY) => {
    const radius = eraserSize / camera.zoom / 2;
    const toDelete = elements.filter((el) => {
      if (el.type === 'draw') {
        return el.points?.some(
          (pt) => Math.hypot(pt.x - worldX, pt.y - worldY) < radius + (el.strokeWidth || 4)
        );
      }
      const elX = el.x;
      const elY = el.y;
      const elW = el.width || 100;
      const elH = el.height || 100;
      return (
        worldX >= elX - radius &&
        worldX <= elX + elW + radius &&
        worldY >= elY - radius &&
        worldY <= elY + elH + radius
      );
    });

    if (toDelete.length > 0) {
      const deleteIds = new Set(toDelete.map((el) => el.id));
      const next = elements.filter((el) => !deleteIds.has(el.id));
      saveToHistory(next);
      setSelectedIds((prev) => prev.filter((id) => !deleteIds.has(id)));
    }
  };

  const handleCanvasPointerDown = (e) => {
    setContextMenu(null);
    setQuickConnectMenu(null);

    if (
      activeTool === 'hand' ||
      e.button === 1 ||
      e.buttons === 4 ||
      isSpacePressed ||
      e.altKey
    ) {
      e.preventDefault();
      setIsPanning(true);
      panStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        cameraX: camera.x,
        cameraY: camera.y,
      };
      return;
    }

    if (activeTool === 'eraser') {
      setIsEraserDragging(true);
      const worldPos = screenToWorld(e.clientX, e.clientY);
      eraseAtPoint(worldPos.x, worldPos.y);
      return;
    }

    if (activeTool === 'draw') {
      const worldPos = screenToWorld(e.clientX, e.clientY);
      setIsDrawing(true);
      currentPathRef.current = [worldPos];
      return;
    }

    if (activeTool === 'select') {
      const worldPos = screenToWorld(e.clientX, e.clientY);
      setSelectedIds([]);
      setSelectionBox({
        startX: worldPos.x,
        startY: worldPos.y,
        currentX: worldPos.x,
        currentY: worldPos.y,
      });
    }
  };

  // High-performance 60fps RAF batched pointer movement
  const handleCanvasPointerMove = (e) => {
    if (isPanning) {
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      setCamera((prev) => ({
        ...prev,
        x: panStartRef.current.cameraX + dx,
        y: panStartRef.current.cameraY + dy,
      }));
      return;
    }

    if (isEraserDragging && activeTool === 'eraser') {
      const worldPos = screenToWorld(e.clientX, e.clientY);
      eraseAtPoint(worldPos.x, worldPos.y);
      return;
    }

    if (rotating) {
      const worldPos = screenToWorld(e.clientX, e.clientY);
      const currentAngle =
        Math.atan2(worldPos.y - rotating.centerY, worldPos.x - rotating.centerX) *
        (180 / Math.PI);
      const diff = currentAngle - rotating.startAngle;
      let newRot = Math.round(rotating.initialRotation + diff);
      if (e.shiftKey) {
        newRot = Math.round(newRot / 15) * 15;
      }
      newRot = ((newRot % 360) + 360) % 360;

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        setElements((prev) =>
          prev.map((el) =>
            el.id === rotating.id ? { ...el, rotation: newRot } : el
          )
        );
      });
      return;
    }

    if (resizing) {
      const deltaX = (e.clientX - resizing.startMouseX) / camera.zoom;
      const deltaY = (e.clientY - resizing.startMouseY) / camera.zoom;
      const minSize = 40;

      let newX = resizing.initialX;
      let newY = resizing.initialY;
      let newW = resizing.initialW;
      let newH = resizing.initialH;
      let newFontSize = undefined;

      const dir = resizing.dir;
      const isCorner = dir === 'nw' || dir === 'ne' || dir === 'se' || dir === 'sw';
      const targetEl = elements.find((el) => el.id === resizing.id);

      if (targetEl?.type === 'text') {
        if (isCorner) {
          // CANVA SPEC A: CORNER DRAG scales BOTH text size and box size proportionally
          if (dir === 'se') {
            newW = Math.max(resizing.initialW + deltaX, minSize);
          } else if (dir === 'sw') {
            newW = Math.max(resizing.initialW - deltaX, minSize);
            newX = resizing.initialX + (resizing.initialW - newW);
          } else if (dir === 'ne') {
            newW = Math.max(resizing.initialW + deltaX, minSize);
            newY = resizing.initialY - (newW * (resizing.initialH / resizing.initialW) - resizing.initialH);
          } else if (dir === 'nw') {
            newW = Math.max(resizing.initialW - deltaX, minSize);
            newX = resizing.initialX + (resizing.initialW - newW);
            newY = resizing.initialY - (newW * (resizing.initialH / resizing.initialW) - resizing.initialH);
          }
          const scale = newW / resizing.initialW;
          newH = Math.round(resizing.initialH * scale);
          newFontSize = Math.max(8, Math.min(220, Math.round(resizing.initialFontSize * scale)));
        } else {
          // CANVA SPEC B: SIDE/EDGE DRAG reflows text within new width without changing fontSize
          if (dir.includes('e')) newW = Math.max(resizing.initialW + deltaX, minSize);
          if (dir.includes('w')) {
            const potW = resizing.initialW - deltaX;
            if (potW >= minSize) {
              newW = potW;
              newX = resizing.initialX + deltaX;
            }
          }
          if (dir.includes('s')) newH = Math.max(resizing.initialH + deltaY, minSize);
          if (dir.includes('n')) {
            const potH = resizing.initialH - deltaY;
            if (potH >= minSize) {
              newH = potH;
              newY = resizing.initialY + deltaY;
            }
          }
        }
      } else {
        if (dir.includes('e')) newW = Math.max(resizing.initialW + deltaX, minSize);
        if (dir.includes('s')) newH = Math.max(resizing.initialH + deltaY, minSize);
        if (dir.includes('w')) {
          const potentialW = resizing.initialW - deltaX;
          if (potentialW >= minSize) {
            newW = potentialW;
            newX = resizing.initialX + deltaX;
          }
        }
        if (dir.includes('n')) {
          const potentialH = resizing.initialH - deltaY;
          if (potentialH >= minSize) {
            newH = potentialH;
            newY = resizing.initialY + deltaY;
          }
        }

        if (targetEl?.type === 'image-block' || targetEl?.type === 'video-block' || targetEl?.aspectRatio) {
          const ratio = targetEl.aspectRatio || resizing.initialW / resizing.initialH;
          if (dir.includes('e') || dir.includes('w')) {
            newH = Math.max(minSize, Math.round(newW / ratio));
          } else {
            newW = Math.max(minSize, Math.round(newH * ratio));
          }
        }
      }

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        setElements((prev) =>
          prev.map((el) =>
            el.id === resizing.id
              ? {
                  ...el,
                  x: Math.round(newX),
                  y: Math.round(newY),
                  width: Math.round(newW),
                  height: Math.round(newH),
                  ...(newFontSize !== undefined ? { fontSize: newFontSize } : {}),
                }
              : el
          )
        );
      });
      return;
    }

    if (draggingElement) {
      const dx = (e.clientX - dragStartRef.current.mouseX) / camera.zoom;
      const dy = (e.clientY - dragStartRef.current.mouseY) / camera.zoom;

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        setElements((prev) =>
          prev.map((el) =>
            el.id === draggingElement
              ? {
                  ...el,
                  x: Math.round(dragStartRef.current.elemX + dx),
                  y: Math.round(dragStartRef.current.elemY + dy),
                }
              : el
          )
        );
      });
      return;
    }

    if (isDrawing && activeTool === 'draw') {
      const worldPos = screenToWorld(e.clientX, e.clientY);
      currentPathRef.current.push(worldPos);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        setElements((prev) => [...prev]);
      });
      return;
    }

    if (selectionBox) {
      const worldPos = screenToWorld(e.clientX, e.clientY);
      setSelectionBox((prev) => ({
        ...prev,
        currentX: worldPos.x,
        currentY: worldPos.y,
      }));

      const minX = Math.min(selectionBox.startX, worldPos.x);
      const maxX = Math.max(selectionBox.startX, worldPos.x);
      const minY = Math.min(selectionBox.startY, worldPos.y);
      const maxY = Math.max(selectionBox.startY, worldPos.y);

      const enclosed = elements.filter((el) => {
        if (el.type === 'connector') return false;
        const elX = el.x || 0;
        const elY = el.y || 0;
        const elW = el.width || 50;
        const elH = el.height || 50;
        return (
          elX >= minX &&
          elX + elW <= maxX &&
          elY >= minY &&
          elY + elH <= maxY
        );
      });

      setSelectedIds(enclosed.map((el) => el.id));
    }
  };

  const handleCanvasPointerUp = () => {
    if (isPanning) setIsPanning(false);
    if (isEraserDragging) setIsEraserDragging(false);

    if (rotating) {
      setRotating(null);
      saveToHistory(latestElementsRef.current);
    }

    if (resizing) {
      setResizing(null);
      saveToHistory(latestElementsRef.current);
    }

    if (draggingElement) {
      setDraggingElement(null);
      saveToHistory(latestElementsRef.current);
    }

    if (isDrawing && activeTool === 'draw') {
      setIsDrawing(false);
      if (currentPathRef.current.length > 1) {
        const newStroke = {
          id: `draw-${Date.now()}`,
          type: 'draw',
          points: [...currentPathRef.current],
          strokeColor: pencilColor,
          strokeWidth: pencilStrokeWidth,
        };
        saveToHistory([...latestElementsRef.current, newStroke]);
      }
      currentPathRef.current = [];
    }

    if (selectionBox) setSelectionBox(null);
  };

  const handleClearCanvasPrompt = () => {
    confirm({
      title: 'Clear whiteboard',
      message:
        'Are you sure you want to remove all elements and drawings from this whiteboard? This action cannot be undone.',
      confirmLabel: 'Clear whiteboard',
      cancelLabel: 'Cancel',
      isDanger: true,
      onConfirm: () => {
        saveToHistory([]);
        setSelectedIds([]);
        showSuccess('Whiteboard cleared');
      },
    });
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      const active = document.activeElement;
      const isTyping =
        active &&
        (active.tagName === 'INPUT' ||
          active.tagName === 'TEXTAREA' ||
          active.isContentEditable ||
          active.getAttribute('contenteditable') === 'true' ||
          active.closest?.('[contenteditable="true"]') ||
          active.closest?.('[role="dialog"]'));

      if (isTyping) return;

      if (e.code === 'Space') {
        setIsSpacePressed(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        e.shiftKey ? handleRedo() : handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        if (selectedIds.length > 0) handleDuplicateElement(selectedIds[0]);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        if (selectedIds.length > 0) {
          e.preventDefault();
          setLinkModal({ isOpen: true, elementId: selectedIds[0] });
        }
      } else if (e.key === ']' && selectedIds.length > 0) {
        e.preventDefault();
        handleBringToFront(selectedIds[0]);
      } else if (e.key === '[' && selectedIds.length > 0) {
        e.preventDefault();
        handleSendToBack(selectedIds[0]);
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedIds.length > 0) {
          e.preventDefault();
          const next = elements.filter((el) => {
            if (selectedIds.includes(el.id)) return false;
            if (
              el.type === 'connector' &&
              (selectedIds.includes(el.fromId) || selectedIds.includes(el.toId))
            )
              return false;
            return true;
          });
          saveToHistory(next);
          setSelectedIds([]);
        }
      } else if (e.key.toLowerCase() === 'v') {
        setActiveTool('select');
      } else if (e.key.toLowerCase() === 'h') {
        setActiveTool('hand');
      } else if (e.key.toLowerCase() === 'p') {
        setActiveTool('draw');
      } else if (e.key.toLowerCase() === 'n') {
        handleAddStickyNote({ color: 'amber', isSquare: true });
      } else if (e.key.toLowerCase() === 'i') {
        handleAddImageBlock();
      } else if (e.key.toLowerCase() === 't') {
        handleAddShape('text');
      } else if (e.key.toLowerCase() === 's') {
        handleAddShape('rectangle');
      } else if (e.key.toLowerCase() === 'e') {
        setActiveTool('eraser');
      } else if (e.key === '0') {
        handleResetZoom();
      } else if (e.key === '=' || e.key === '+') {
        handleZoomIn();
      } else if (e.key === '-') {
        handleZoomOut();
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [
    elements,
    selectedIds,
    history,
    historyIndex,
    handleUndo,
    handleRedo,
    saveToHistory,
  ]);

  const safeElements = Array.isArray(elements) ? elements : [];
  const selectedElement =
    safeElements.find((e) => e.id === selectedIds[0]) || null;

  const canvasBg = isDark ? '#18181A' : '#F1EFE8';
  const patternDotColor = isDark ? '#36363B' : '#C7C5BE';
  const patternLineColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';
  const ruledLineColor = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(70, 110, 180, 0.20)';

  let bgImage = 'none';
  let bgSize = 'auto';
  let bgPosition = '0 0';

  if (canvasPattern === 'dotted') {
    const gridSize = 18 * camera.zoom;
    const offX = ((camera.x % gridSize) + gridSize) % gridSize;
    const offY = ((camera.y % gridSize) + gridSize) % gridSize;
    bgImage = `radial-gradient(${patternDotColor} 1.5px, transparent 1.5px)`;
    bgSize = `${gridSize}px ${gridSize}px`;
    bgPosition = `${offX}px ${offY}px`;
  } else if (canvasPattern === 'lines') {
    const lineSpacing = 28 * camera.zoom;
    const offY = ((camera.y % lineSpacing) + lineSpacing) % lineSpacing;
    bgImage = `linear-gradient(to bottom, transparent ${lineSpacing - 1}px, ${ruledLineColor} ${lineSpacing - 1}px)`;
    bgSize = `100% ${lineSpacing}px`;
    bgPosition = `0px ${offY}px`;
  } else if (canvasPattern === 'grid') {
    const boxSize = 24 * camera.zoom;
    const offX = ((camera.x % boxSize) + boxSize) % boxSize;
    const offY = ((camera.y % boxSize) + boxSize) % boxSize;
    bgImage = `linear-gradient(to right, ${patternLineColor} 1px, transparent 1px), linear-gradient(to bottom, ${patternLineColor} 1px, transparent 1px)`;
    bgSize = `${boxSize}px ${boxSize}px`;
    bgPosition = `${offX}px ${offY}px`;
  } else if (canvasPattern === 'blank') {
    bgImage = 'none';
  }

  return (
    <div
      ref={containerRef}
      onPointerDown={handleCanvasPointerDown}
      onPointerMove={handleCanvasPointerMove}
      onPointerUp={handleCanvasPointerUp}
      onWheel={handleWheel}
      onContextMenu={(e) => handleContextMenu(e, null)}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
      }}
      onDrop={(e) => {
        e.preventDefault();
        handleProcessIncomingData(e.dataTransfer, e.clientX, e.clientY);
      }}
      style={{
        backgroundColor: canvasBg,
        backgroundImage: bgImage,
        backgroundSize: bgSize,
        backgroundPosition: bgPosition,
        cursor:
          activeTool === 'hand' || isSpacePressed || isPanning
            ? isPanning
              ? 'grabbing'
              : 'grab'
            : activeTool === 'draw'
            ? 'crosshair'
            : activeTool === 'eraser'
            ? 'cell'
            : 'default',
      }}
      className="relative w-screen h-screen overflow-hidden select-none touch-none"
    >
      <FloatingToolbar
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        pencilStrokeWidth={pencilStrokeWidth}
        setPencilStrokeWidth={setPencilStrokeWidth}
        pencilColor={pencilColor}
        setPencilColor={setPencilColor}
        eraserSize={eraserSize}
        setEraserSize={setEraserSize}
        canvasPattern={canvasPattern}
        onChangePattern={handleChangePattern}
        onAddStickyNote={handleAddStickyNote}
        onAddImageBlock={handleAddImageBlock}
        onAddVideo={handleAddVideo}
        onAddShape={handleAddShape}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={historyIndex > 0}
        canRedo={Array.isArray(history) && historyIndex < history.length - 1}
        onClear={handleClearCanvasPrompt}
        onExport={() => {
          const dataStr =
            'data:text/json;charset=utf-8,' +
            encodeURIComponent(JSON.stringify(safeElements, null, 2));
          const dl = document.createElement('a');
          dl.setAttribute('href', dataStr);
          dl.setAttribute('download', `whiteboard-${boardId}.json`);
          document.body.appendChild(dl);
          dl.click();
          dl.remove();
          showSuccess('Exported canvas data as JSON');
        }}
      />

      {selectedElement && !selectedElement.isLocked && (
        <ElementInspector
          selectedElement={selectedElement}
          onChange={handleElementChange}
          onOpenLinkModal={(id) => setLinkModal({ isOpen: true, elementId: id })}
        />
      )}

      <ZoomIndicator
        zoom={camera.zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
        onFitView={handleFitView}
      />

      {/* Quick Connect Popover */}
      {quickConnectMenu && (
        <div
          role="dialog"
          aria-label="Quick connect node"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          onWheel={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            left: `${quickConnectMenu.screenX}px`,
            top: `${quickConnectMenu.screenY}px`,
          }}
          className="z-40 p-2 rounded-2xl bg-white/95 dark:bg-[#222225]/95 backdrop-blur-md border border-black/10 dark:border-white/10 shadow-2xl flex flex-col gap-1 w-52 animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="flex items-center justify-between px-2 py-1 border-b border-black/5 dark:border-white/5">
            <span className="text-[10px] font-semibold tracking-tight text-neutral-500 dark:text-neutral-400">
              Connect next node
            </span>
            <button
              onClick={() => setQuickConnectMenu(null)}
              className="p-0.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          <button
            onClick={() => handleQuickConnectCreate('sticky-note', { color: 'teal' })}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-teal-50 dark:hover:bg-teal-950/40 text-neutral-700 dark:text-neutral-200 text-xs transition text-left cursor-pointer"
          >
            <StickyIcon className="w-3.5 h-3.5 text-teal-500 shrink-0" />
            <span>Sticky note</span>
            <ArrowRight className="w-2.5 h-2.5 opacity-40 ml-auto" />
          </button>

          <button
            onClick={() => handleQuickConnectCreate('rectangle')}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/40 text-neutral-700 dark:text-neutral-200 text-xs transition text-left cursor-pointer"
          >
            <Square className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span>Process box</span>
            <ArrowRight className="w-2.5 h-2.5 opacity-40 ml-auto" />
          </button>

          <button
            onClick={() => handleQuickConnectCreate('diamond')}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-950/40 text-neutral-700 dark:text-neutral-200 text-xs transition text-left cursor-pointer"
          >
            <Diamond className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Decision / Trigger</span>
            <ArrowRight className="w-2.5 h-2.5 opacity-40 ml-auto" />
          </button>

          <button
            onClick={() => handleQuickConnectCreate('image-block')}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/40 text-neutral-700 dark:text-neutral-200 text-xs transition text-left cursor-pointer"
          >
            <ImageIcon className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span>Image reference</span>
            <ArrowRight className="w-2.5 h-2.5 opacity-40 ml-auto" />
          </button>

          <button
            onClick={() => handleQuickConnectCreate('text')}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 text-xs transition text-left cursor-pointer"
          >
            <Type className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
            <span>Text block</span>
            <ArrowRight className="w-2.5 h-2.5 opacity-40 ml-auto" />
          </button>
        </div>
      )}

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          selectedElement={safeElements.find((e) => e.id === contextMenu.elementId)}
          onClose={() => setContextMenu(null)}
          onAddLink={(id) => setLinkModal({ isOpen: true, elementId: id })}
          onDuplicate={handleDuplicateElement}
          onBringToFront={handleBringToFront}
          onSendToBack={handleSendToBack}
          onToggleLock={handleToggleLock}
          onDelete={handleDeleteElement}
          onAddStickyNote={handleAddStickyNote}
          onAddShape={handleAddShape}
          onAddImageBlock={handleAddImageBlock}
          onFitView={handleFitView}
          onResetZoom={handleResetZoom}
          onClear={handleClearCanvasPrompt}
        />
      )}

      <LinkModal
        isOpen={linkModal.isOpen}
        initialUrl={
          safeElements.find((e) => e.id === linkModal.elementId)?.link || ''
        }
        onSave={(url) => {
          if (linkModal.elementId) {
            handleElementChange(linkModal.elementId, { link: url });
            showSuccess(url ? 'Web link saved' : 'Web link removed');
          }
        }}
        onClose={() => setLinkModal({ isOpen: false, elementId: null })}
      />

      {/* Viewport Transform Layer */}
      <div
        style={{
          transform: `matrix(${camera.zoom}, 0, 0, ${camera.zoom}, ${camera.x}, ${camera.y})`,
          transformOrigin: '0 0',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        {/* Draw vector strokes & Connectors SVG layer */}
        <svg className="absolute top-0 left-0 w-[50000px] h-[50000px] -translate-x-[25000px] -translate-y-[25000px] overflow-visible pointer-events-none">
          <g transform="translate(25000, 25000)">
            {/* Dynamic Sticky Wavy Connectors */}
            {safeElements
              .filter((el) => el.type === 'connector')
              .map((conn) => {
                const fromEl = safeElements.find((e) => e.id === conn.fromId);
                const toEl = safeElements.find((e) => e.id === conn.toId);
                const pathInfo = computeConnectorPath(fromEl, toEl);
                if (!pathInfo) return null;

                const stroke =
                  conn.strokeColor === 'auto' || !conn.strokeColor
                    ? isDark
                      ? '#A1A1AA'
                      : '#71717A'
                    : conn.strokeColor;
                const isSelected = selectedIds.includes(conn.id);

                return (
                  <g
                    key={conn.id}
                    data-element-id={conn.id}
                    onClick={(e) => {
                      if (activeTool === 'hand') return;
                      e.stopPropagation();
                      setSelectedIds([conn.id]);
                    }}
                    onContextMenu={(e) => {
                      if (activeTool === 'hand') return;
                      e.preventDefault();
                      e.stopPropagation();
                      handleContextMenu(e, conn.id);
                    }}
                    className={activeTool === 'hand' ? 'pointer-events-none' : 'cursor-pointer pointer-events-auto'}
                  >
                    <path
                      d={pathInfo.d}
                      fill="none"
                      stroke="transparent"
                      strokeWidth={24}
                      strokeLinecap="round"
                    />
                    <path
                      d={pathInfo.d}
                      fill="none"
                      stroke={isSelected ? '#3B82F6' : stroke}
                      strokeWidth={conn.strokeWidth || 2.5}
                      strokeLinecap="round"
                      className={`transition-colors duration-75 ${
                        isSelected
                          ? 'filter drop-shadow-[0_0_5px_rgba(59,130,246,0.9)]'
                          : 'hover:stroke-blue-400'
                      }`}
                    />
                    <circle
                      cx={pathInfo.startX}
                      cy={pathInfo.startY}
                      r={4}
                      fill={isSelected ? '#3B82F6' : stroke}
                    />
                    <circle
                      cx={pathInfo.endX}
                      cy={pathInfo.endY}
                      r={4}
                      fill={isSelected ? '#3B82F6' : stroke}
                    />
                  </g>
                );
              })}

            {safeElements
              .filter((el) => el.type === 'draw')
              .map((el) => (
                <ShapeElement
                  key={el.id}
                  {...el}
                  isSelected={selectedIds.includes(el.id)}
                  onSelect={(id) => {
                    if (activeTool !== 'hand') setSelectedIds([id]);
                  }}
                  onPointerDown={handleElementPointerDown}
                  onContextMenu={(e, id) => {
                    if (activeTool !== 'hand') handleContextMenu(e, id);
                  }}
                />
              ))}

            {isDrawing && currentPathRef.current.length > 0 && (
              <path
                d={currentPathRef.current.reduce((acc, pt, idx) => {
                  return idx === 0
                    ? `M ${pt.x} ${pt.y}`
                    : `${acc} L ${pt.x} ${pt.y}`;
                }, '')}
                fill="none"
                stroke={
                  pencilColor === 'auto'
                    ? isDark
                      ? '#EDEDED'
                      : '#18181A'
                    : pencilColor
                }
                strokeWidth={pencilStrokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </g>
        </svg>

        {/* DOM Canvas Elements Layer */}
        <div
          className={`absolute top-0 left-0 w-full h-full ${
            activeTool === 'hand' ? 'pointer-events-none' : 'pointer-events-auto'
          }`}
        >
          {safeElements
            .filter((el) => el.type !== 'draw' && el.type !== 'connector')
            .map((el) => {
              if (el.type === 'sticky-note') {
                return (
                  <StickyNote
                    key={el.id}
                    {...el}
                    isSelected={selectedIds.includes(el.id)}
                    onSelect={(id) => setSelectedIds([id])}
                    onChange={handleElementChange}
                    onDelete={handleDeleteElement}
                    onDuplicate={handleDuplicateElement}
                    onPointerDown={handleElementPointerDown}
                    onResizeStart={(e, dir) => handleResizeStart(e, dir, el.id)}
                    onRotateStart={(e) => handleRotateStart(e, el.id)}
                    onQuickConnect={(e) => handleQuickConnectOpen(e, el.id)}
                    onContextMenu={(e, id) => handleContextMenu(e, id)}
                  />
                );
              }

              if (el.type === 'text') {
                return (
                  <TextElement
                    key={el.id}
                    {...el}
                    isSelected={selectedIds.includes(el.id)}
                    onSelect={(id) => setSelectedIds([id])}
                    onChange={handleElementChange}
                    onDelete={handleDeleteElement}
                    onDuplicate={handleDuplicateElement}
                    onPointerDown={handleElementPointerDown}
                    onResizeStart={(e, dir) => handleResizeStart(e, dir, el.id)}
                    onRotateStart={(e) => handleRotateStart(e, el.id)}
                    onQuickConnect={(e) => handleQuickConnectOpen(e, el.id)}
                    onContextMenu={(e, id) => handleContextMenu(e, id)}
                  />
                );
              }

              if (el.type === 'image-block') {
                return (
                  <ImageBlock
                    key={el.id}
                    {...el}
                    isSelected={selectedIds.includes(el.id)}
                    onSelect={(id) => setSelectedIds([id])}
                    onChange={handleElementChange}
                    onDelete={handleDeleteElement}
                    onDuplicate={handleDuplicateElement}
                    onPointerDown={handleElementPointerDown}
                    onResizeStart={(e, dir) => handleResizeStart(e, dir, el.id)}
                    onRotateStart={(e) => handleRotateStart(e, el.id)}
                    onQuickConnect={(e) => handleQuickConnectOpen(e, el.id)}
                    onContextMenu={(e, id) => handleContextMenu(e, id)}
                  />
                );
              }

              if (el.type === 'video-block') {
                return (
                  <VideoBlock
                    key={el.id}
                    {...el}
                    isSelected={selectedIds.includes(el.id)}
                    onSelect={(id) => setSelectedIds([id])}
                    onChange={handleElementChange}
                    onDelete={handleDeleteElement}
                    onDuplicate={handleDuplicateElement}
                    onPointerDown={handleElementPointerDown}
                    onResizeStart={(e, dir) => handleResizeStart(e, dir, el.id)}
                    onRotateStart={(e) => handleRotateStart(e, el.id)}
                    onQuickConnect={(e) => handleQuickConnectOpen(e, el.id)}
                    onContextMenu={(e, id) => handleContextMenu(e, id)}
                  />
                );
              }

              return (
                <ShapeElement
                  key={el.id}
                  {...el}
                  isSelected={selectedIds.includes(el.id)}
                  onSelect={(id) => setSelectedIds([id])}
                  onChange={handleElementChange}
                  onDelete={handleDeleteElement}
                  onDuplicate={handleDuplicateElement}
                  onPointerDown={handleElementPointerDown}
                  onResizeStart={(e, dir) => handleResizeStart(e, dir, el.id)}
                  onRotateStart={(e) => handleRotateStart(e, el.id)}
                  onQuickConnect={(e) => handleQuickConnectOpen(e, el.id)}
                  onContextMenu={(e, id) => handleContextMenu(e, id)}
                />
              );
            })}
        </div>

        {/* Selection box overlay */}
        {selectionBox && (
          <div
            style={{
              position: 'absolute',
              left: `${Math.min(selectionBox.startX, selectionBox.currentX)}px`,
              top: `${Math.min(selectionBox.startY, selectionBox.currentY)}px`,
              width: `${Math.abs(selectionBox.currentX - selectionBox.startX)}px`,
              height: `${Math.abs(selectionBox.currentY - selectionBox.startY)}px`,
            }}
            className="border border-blue-500 bg-blue-500/10 pointer-events-none rounded-sm"
          />
        )}
      </div>
    </div>
  );
}
