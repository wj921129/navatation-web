import { useState, useCallback, useEffect } from 'react';

export interface ClockItem {
  id: string;
  style: 'analog' | 'digital' | 'flip';
  x: number; // percentage from left (0 - 100)
  y: number; // percentage from top (0 - 100)
}

/**
  * 自定义时钟状态管理 Hook (useClocks)
  * 支持编辑态下的草稿隔离、新增时钟、删除时钟、移动位置，并在点击保存时统一持久化至 localStorage。
  */
export function useClocks(isEditMode: boolean) {
  const [clocks, setClocks] = useState<ClockItem[]>(() => {
    const saved = localStorage.getItem('navatation_clocks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved clocks, resetting to empty', e);
        return [];
      }
    }
    return [];
  });

  const [tempClocks, setTempClocks] = useState<ClockItem[]>([]);

  // 进入编辑模式时，同步备份当前生效的时钟数据到临时草稿态
  useEffect(() => {
    if (isEditMode) {
      setTempClocks(clocks.map((c) => ({ ...c })));
    }
  }, [isEditMode, clocks]);

  /**
    * 新增时钟
    * @param style 时钟样式
    * @param initialX 初始百分比 X 坐标
    * @param initialY 初始百分比 Y 坐标
    */
  const addClock = useCallback((style: 'analog' | 'digital' | 'flip', initialX = 40, initialY = 30) => {
    const newClock: ClockItem = {
      id: `clock-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      style,
      x: initialX,
      y: initialY,
    };
    setTempClocks((prev) => [...prev, newClock]);
    return newClock.id;
  }, []);

  /**
    * 删除时钟
    * @param id 时钟组件 ID
    */
  const removeClock = useCallback((id: string) => {
    setTempClocks((prev) => prev.filter((c) => c.id !== id));
  }, []);

  /**
    * 更新时钟百分比位置
    * @param id 时钟组件 ID
    * @param x 百分比 X 坐标 (0-100)
    * @param y 百分比 Y 坐标 (0-100)
    */
  const updateClockPosition = useCallback((id: string, x: number, y: number) => {
    setTempClocks((prev) =>
      prev.map((c) => (c.id === id ? { ...c, x, y } : c))
    );
  }, []);

  /**
    * 保存时钟配置
    * 应用临时草稿至生效状态并写入本地缓存。
    */
  const saveClocks = useCallback(() => {
    setClocks(tempClocks);
    localStorage.setItem('navatation_clocks', JSON.stringify(tempClocks));
  }, [tempClocks]);

  /**
    * 取消编辑，丢弃临时草稿并回滚至上次保存状态
    */
  const cancelClocks = useCallback(() => {
    setTempClocks(clocks.map((c) => ({ ...c })));
  }, [clocks]);

  return {
    clocks,
    tempClocks,
    setTempClocks,
    addClock,
    removeClock,
    updateClockPosition,
    saveClocks,
    cancelClocks,
  };
}
