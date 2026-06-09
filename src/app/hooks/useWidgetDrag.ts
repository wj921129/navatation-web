/**
 * 文件名：useWidgetDrag.ts
 * 描述：处理组件从菜单栏拖拽以及全局拖拽位置更新的自定义 Hook。
 * 创建时间：2026-06-09
 */
import { useState, useRef, useCallback, useEffect } from 'react';

type WidgetStyle = 'analog' | 'digital' | 'flip' | 'traditional' | 'pomodoro' | 'breathe' | 'month' | 'simple' | null;

interface UseWidgetDragProps {
  addWidget: (type: string, style: string, xPercent: number, yPercent: number) => void;
  updateWidgetPosition: (id: string, xPercent: number, yPercent: number) => void;
  triggerCloseClock: () => void;
}

export const useWidgetDrag = ({ addWidget, updateWidgetPosition, triggerCloseClock }: UseWidgetDragProps) => {
  const [activeDraggingId, setActiveDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const activeDraggingStyleRef = useRef<WidgetStyle>(null);

  const [menuDraggingStyle, setMenuDraggingStyle] = useState<WidgetStyle>(null);
  const [menuDragPos, setMenuDragPos] = useState({ x: 0, y: 0 });
  const [menuDragHasMoved, setMenuDragHasMoved] = useState(false);
  const menuDragStartPosRef = useRef({ x: 0, y: 0 });
  const menuDragHasMovedRef = useRef(false);
  const menuDraggingStyleRef = useRef<WidgetStyle>(null);

  /**
   * 获取组件宽高
   */
  const getWidgetDimensions = useCallback((style: string) => {
    switch (style) {
      case 'analog':
      case 'traditional':
        return { width: 160, height: 160 };
      case 'flip':
        return { width: 200, height: 100 };
      case 'pomodoro':
        return { width: 180, height: 220 };
      case 'breathe':
        return { width: 160, height: 160 };
      case 'month':
        return { width: 200, height: 220 };
      case 'simple':
        return { width: 140, height: 140 };
      default:
        return { width: 220, height: 100 };
    }
  }, []);

  /**
   * 获取组件类型
   */
  const getWidgetType = useCallback((style: string) => {
    switch (style) {
      case 'pomodoro': return 'pomodoro';
      case 'breathe': return 'breathe';
      case 'month': return 'calendar';
      case 'simple': return 'weather';
      default: return 'clock';
    }
  }, []);

  /**
   * 处理菜单项拖拽移动
   */
  const handleMenuDragMove = useCallback((e: PointerEvent) => {
    const style = menuDraggingStyleRef.current;
    if (!style) {
      return;
    }

    const dx = e.clientX - menuDragStartPosRef.current.x;
    const dy = e.clientY - menuDragStartPosRef.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 5) {
      menuDragHasMovedRef.current = true;
      setMenuDragHasMoved(true);
    }

    const { width: clockWidth, height: clockHeight } = getWidgetDimensions(style);
    const ox = clockWidth / 2;
    const oy = clockHeight / 2;

    let newX = e.clientX - ox;
    let newY = e.clientY - oy;

    const maxX = window.innerWidth - clockWidth;
    const maxY = window.innerHeight - clockHeight;

    newX = Math.max(0, Math.min(newX, maxX));
    newY = Math.max(0, Math.min(newY, maxY));

    setMenuDragPos({ x: newX, y: newY });
  }, [getWidgetDimensions]);

  /**
   * 处理菜单项拖拽结束
   */
  const handleMenuDragUp = useCallback((e: PointerEvent) => {
    const style = menuDraggingStyleRef.current;
    if (style) {
      const dx = e.clientX - menuDragStartPosRef.current.x;
      const dy = e.clientY - menuDragStartPosRef.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 5 || menuDragHasMovedRef.current) {
        const { width: clockWidth, height: clockHeight } = getWidgetDimensions(style);
        const ox = clockWidth / 2;
        const oy = clockHeight / 2;

        let newX = e.clientX - ox;
        let newY = e.clientY - oy;
        const maxX = window.innerWidth - clockWidth;
        const maxY = window.innerHeight - clockHeight;
        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));

        const xPercent = (newX / window.innerWidth) * 100;
        const yPercent = (newY / window.innerHeight) * 100;
        const type = getWidgetType(style);
        addWidget(type, style, xPercent, yPercent);
      } else {
        const type = getWidgetType(style);
        addWidget(type, style, 40, 30);
      }
    }

    menuDraggingStyleRef.current = null;
    setMenuDraggingStyle(null);
    menuDragHasMovedRef.current = false;
    setMenuDragHasMoved(false);
    triggerCloseClock();

    window.removeEventListener('pointermove', handleMenuDragMove);
    window.removeEventListener('pointerup', handleMenuDragUp);
  }, [addWidget, triggerCloseClock, handleMenuDragMove, getWidgetDimensions, getWidgetType]);

  /**
   * 处理从菜单开始拖拽
   */
  const handleDragStartFromMenu = useCallback((e: React.PointerEvent<HTMLButtonElement>, style: WidgetStyle) => {
    if (!style) {
      return;
    }
    e.preventDefault();
    menuDragStartPosRef.current = { x: e.clientX, y: e.clientY };
    menuDraggingStyleRef.current = style;
    setMenuDraggingStyle(style);
    menuDragHasMovedRef.current = false;
    setMenuDragHasMoved(false);

    const { width: clockWidth, height: clockHeight } = getWidgetDimensions(style);
    const ox = clockWidth / 2;
    const oy = clockHeight / 2;

    let newX = e.clientX - ox;
    let newY = e.clientY - oy;
    const maxX = window.innerWidth - clockWidth;
    const maxY = window.innerHeight - clockHeight;
    newX = Math.max(0, Math.min(newX, maxX));
    newY = Math.max(0, Math.min(newY, maxY));

    setMenuDragPos({ x: newX, y: newY });

    window.addEventListener('pointermove', handleMenuDragMove);
    window.addEventListener('pointerup', handleMenuDragUp);
  }, [handleMenuDragMove, handleMenuDragUp, getWidgetDimensions]);

  useEffect(() => {
    return () => {
      window.removeEventListener('pointermove', handleMenuDragMove);
      window.removeEventListener('pointerup', handleMenuDragUp);
    };
  }, [handleMenuDragMove, handleMenuDragUp]);

  /**
   * 处理全局指针移动
   */
  const handlePointerMoveGlobal = useCallback((e: PointerEvent) => {
    if (!activeDraggingId || !activeDraggingStyleRef.current) {
      return;
    }

    let newX = e.clientX - dragOffset.x;
    let newY = e.clientY - dragOffset.y;

    const { width: clockWidth, height: clockHeight } = getWidgetDimensions(activeDraggingStyleRef.current);

    const maxX = window.innerWidth - clockWidth;
    const maxY = window.innerHeight - clockHeight;

    newX = Math.max(0, Math.min(newX, maxX));
    newY = Math.max(0, Math.min(newY, maxY));

    const xPercent = (newX / window.innerWidth) * 100;
    const yPercent = (newY / window.innerHeight) * 100;

    updateWidgetPosition(activeDraggingId, xPercent, yPercent);
  }, [activeDraggingId, dragOffset, updateWidgetPosition, getWidgetDimensions]);

  /**
   * 处理全局指针松开
   */
  const handlePointerUpGlobal = useCallback(() => {
    setActiveDraggingId(null);
    activeDraggingStyleRef.current = null;
  }, []);

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
    handleDragStartFromMenu
  };
};
