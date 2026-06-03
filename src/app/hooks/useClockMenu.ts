import { useState, useRef, useCallback } from 'react';

/**
 * 自定义时钟菜单状态管理 Hook (useClockMenu)
 * 封装与屏幕亮度控制一致的悬停展开、延迟关闭、交互防抖逻辑。
 */
export function useClockMenu() {
  const [isClockOpen, setIsClockOpen] = useState(false);
  const [isClockClosing, setIsClockClosing] = useState(false);
  const [isHoveringClock, setIsHoveringClock] = useState(false);
  const clockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * 清理延迟关闭定时器
   */
  const clearClockTimer = useCallback(() => {
    if (clockTimerRef.current) {
      clearTimeout(clockTimerRef.current);
      clockTimerRef.current = null;
    }
  }, []);

  /**
   * 重置时钟菜单的所有交互状态变量，安全归零
   */
  const resetClockState = useCallback(() => {
    setIsClockOpen(false);
    setIsClockClosing(false);
    setIsHoveringClock(false);
    clearClockTimer();
  }, [clearClockTimer]);

  /**
   * 触发时钟菜单退出折叠动画并延迟完全关闭
   */
  const triggerCloseClock = useCallback(() => {
    setIsClockClosing(true);
    setIsHoveringClock(false);
    clearClockTimer();
    clockTimerRef.current = setTimeout(() => {
      setIsClockOpen(false);
      setIsClockClosing(false);
    }, 280); // 与退出动效时间 280ms 保持一致
  }, [clearClockTimer]);

  const handleMouseEnterClock = useCallback(() => {
    setIsClockOpen(true);
    setIsClockClosing(false);
    clearClockTimer();
  }, [clearClockTimer]);

  const handleMouseLeaveClock = useCallback(() => {
    if (isClockOpen && !isClockClosing) {
      setIsHoveringClock(false);
      clearClockTimer();
      clockTimerRef.current = setTimeout(() => {
        triggerCloseClock();
      }, 1000); // 移出后 1 秒防抖关闭
    }
  }, [isClockOpen, isClockClosing, clearClockTimer, triggerCloseClock]);

  // 当鼠标移入其他小组件按钮时，立刻关闭时钟选择菜单
  const handleMouseEnterOtherWidget = useCallback(() => {
    resetClockState();
  }, [resetClockState]);

  return {
    isClockOpen,
    setIsClockOpen,
    isClockClosing,
    setIsClockClosing,
    isHoveringClock,
    setIsHoveringClock,
    clockTimerRef,
    clearClockTimer,
    resetClockState,
    triggerCloseClock,
    handleMouseEnterClock,
    handleMouseLeaveClock,
    handleMouseEnterOtherWidget,
  };
}
