/**
 * 文件名：useWidgetDrag.ts
 * 描述：负责统一处理桌面小组件（时钟、日历等）的拖拽逻辑，包括从菜单栏拖拽出新组件以及在桌面上移动已有组件。
 * 创建时间：2026-06-09
 */
import { useState, useRef, useCallback, useEffect } from 'react';

type WidgetStyle = 'analog' | 'digital' | 'flip' | 'flip-seconds' | 'traditional' | 'pomodoro' | 'breathe' | 'month' | 'simple' | null;

interface UseWidgetDragProps {
  addWidget: (type: string, style: string, xPercent: number, yPercent: number) => void;
  updateWidgetPosition: (id: string, x: number, y: number) => void;
  triggerCloseClock: () => void;
  onDragEnd?: () => void;
}

export function useWidgetDrag({ addWidget, updateWidgetPosition, triggerCloseClock, onDragEnd }: UseWidgetDragProps) {
  const [activeDraggingId, setActiveDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const activeDraggingStyleRef = useRef<WidgetStyle>(null);

  // Menu drag-and-drop state & refs
  const [menuDraggingStyle, setMenuDraggingStyle] = useState<WidgetStyle>(null);
  const [menuDragPos, setMenuDragPos] = useState({ x: 0, y: 0 });
  const [menuDragHasMoved, setMenuDragHasMoved] = useState(false);
  const menuDragStartPosRef = useRef({ x: 0, y: 0 });
  const menuDragHasMovedRef = useRef(false);
  const menuDraggingStyleRef = useRef<WidgetStyle>(null);

  const getWidgetDimensions = (style: WidgetStyle) => {
    let w = 220, h = 100;
    if (style === 'analog' || style === 'traditional' || style === 'breathe') {
      w = 160; h = 160;
    } else if (style === 'flip') {
      w = 200; h = 100;
    } else if (style === 'pomodoro') {
      w = 180; h = 220;
    } else if (style === 'month') {
      w = 200; h = 220;
    } else if (style === 'simple') {
      w = 140; h = 140;
    }
    return { w, h };
  };

  const getWidgetType = (style: WidgetStyle) => {
    if (style === 'pomodoro') {
      return 'pomodoro';
    }
    if (style === 'breathe') {
      return 'breathe';
    }
    if (style === 'month') {
      return 'calendar';
    }
    if (style === 'simple') {
      return 'weather';
    }
    return 'clock';
  };

  const handleMenuDragMove = useCallback((e: PointerEvent) => {
    const style = menuDraggingStyleRef.current;
    if (!style) {
      return;
    }

    const dx = e.clientX - menuDragStartPosRef.current.x;
    const dy = e.clientY - menuDragStartPosRef.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 5) {
      if (!menuDragHasMovedRef.current) {
        triggerCloseClock();
      }
      menuDragHasMovedRef.current = true;
      setMenuDragHasMoved(true);
    }

    const { w, h } = getWidgetDimensions(style);
    let newX = e.clientX - w / 2;
    let newY = e.clientY - h / 2;
    newX = Math.max(0, Math.min(newX, window.innerWidth - w));
    newY = Math.max(0, Math.min(newY, window.innerHeight - h));

    setMenuDragPos({ x: newX, y: newY });
  }, []);

  const handleMenuDragUp = useCallback((e: PointerEvent) => {
    const style = menuDraggingStyleRef.current;
    if (style) {
      const dx = e.clientX - menuDragStartPosRef.current.x;
      const dy = e.clientY - menuDragStartPosRef.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 5 || menuDragHasMovedRef.current) {
        const { w, h } = getWidgetDimensions(style);
        let newX = e.clientX - w / 2;
        let newY = e.clientY - h / 2;
        newX = Math.max(0, Math.min(newX, window.innerWidth - w));
        newY = Math.max(0, Math.min(newY, window.innerHeight - h));

        const xPercent = (newX / window.innerWidth) * 100;
        const yPercent = (newY / window.innerHeight) * 100;
        addWidget(getWidgetType(style), style, xPercent, yPercent);
      } else {
        addWidget(getWidgetType(style), style, 40, 30);
      }
    }

    // 不论是点击还是拖拽结束，都关闭画廊面板
    triggerCloseClock();

    menuDraggingStyleRef.current = null;
    setMenuDraggingStyle(null);
    menuDragHasMovedRef.current = false;
    setMenuDragHasMoved(false);

    window.removeEventListener('pointermove', handleMenuDragMove);
    window.removeEventListener('pointerup', handleMenuDragUp);
    window.removeEventListener('pointercancel', handleMenuDragUp);

    if (onDragEnd) {
      onDragEnd();
    }
  }, [addWidget, triggerCloseClock, handleMenuDragMove, onDragEnd]);

  const handleDragStartFromMenu = useCallback((e: React.PointerEvent<HTMLButtonElement>, style: NonNullable<WidgetStyle>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    menuDragStartPosRef.current = { x: e.clientX, y: e.clientY };
    menuDraggingStyleRef.current = style;
    setMenuDraggingStyle(style);
    menuDragHasMovedRef.current = false;
    setMenuDragHasMoved(false);

    const { w, h } = getWidgetDimensions(style);
    let newX = Math.max(0, Math.min(e.clientX - w / 2, window.innerWidth - w));
    let newY = Math.max(0, Math.min(e.clientY - h / 2, window.innerHeight - h));

    setMenuDragPos({ x: newX, y: newY });

    window.addEventListener('pointermove', handleMenuDragMove);
    window.addEventListener('pointerup', handleMenuDragUp);
    window.addEventListener('pointercancel', handleMenuDragUp);
  }, [handleMenuDragMove, handleMenuDragUp]);

  useEffect(() => {
    return () => {
      window.removeEventListener('pointermove', handleMenuDragMove);
      window.removeEventListener('pointerup', handleMenuDragUp);
      window.removeEventListener('pointercancel', handleMenuDragUp);
    };
  }, [handleMenuDragMove, handleMenuDragUp]);

  const handlePointerMoveGlobal = useCallback((e: PointerEvent) => {
    if (!activeDraggingId || !activeDraggingStyleRef.current) {
      return;
    }
    const { w, h } = getWidgetDimensions(activeDraggingStyleRef.current);
    let newX = Math.max(0, Math.min(e.clientX - dragOffset.x, window.innerWidth - w));
    let newY = Math.max(0, Math.min(e.clientY - dragOffset.y, window.innerHeight - h));

    updateWidgetPosition(activeDraggingId, (newX / window.innerWidth) * 100, (newY / window.innerHeight) * 100);
  }, [activeDraggingId, dragOffset, updateWidgetPosition]);

  const handlePointerUpGlobal = useCallback(() => {
    setActiveDraggingId(null);
    activeDraggingStyleRef.current = null;
    window.removeEventListener('pointermove', handlePointerMoveGlobal);
    window.removeEventListener('pointerup', handlePointerUpGlobal);
    if (onDragEnd) onDragEnd();
  }, [handlePointerMoveGlobal, onDragEnd]);

  const handlePointerDownClock = useCallback((e: React.PointerEvent<HTMLDivElement>, id: string, style: string) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveDraggingId(id);
    activeDraggingStyleRef.current = style as any;

    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });

    window.addEventListener('pointermove', handlePointerMoveGlobal);
    window.addEventListener('pointerup', handlePointerUpGlobal);
  }, [handlePointerMoveGlobal, handlePointerUpGlobal]);

  useEffect(() => {
    if (activeDraggingId) {
      window.addEventListener('pointermove', handlePointerMoveGlobal);
      window.addEventListener('pointerup', handlePointerUpGlobal);
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMoveGlobal);
      window.removeEventListener('pointerup', handlePointerUpGlobal);
    };
  }, [activeDraggingId, handlePointerMoveGlobal, handlePointerUpGlobal]);

  return {
    activeDraggingId,
    setActiveDraggingId,
    dragOffset,
    setDragOffset,
    activeDraggingStyleRef,
    menuDraggingStyle,
    menuDragPos,
    menuDragHasMoved,
    handleDragStartFromMenu,
    handlePointerDownClock
  };
}
