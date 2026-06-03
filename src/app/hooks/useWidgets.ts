import { useState, useCallback, useEffect } from 'react';

export interface WidgetItem {
  id: string;
  type: string; // e.g., 'clock'
  style: string; // e.g., 'analog' | 'digital' | 'flip' | 'traditional'
  x: number; // percentage from left (0 - 100)
  y: number; // percentage from top (0 - 100)
  meta?: Record<string, any>;
}

/**
 * 通用组件状态管理 Hook (useWidgets)
 * 支持编辑态下的草稿隔离、新增组件、删除组件、移动位置，并在保存时统一持久化。
 * 自动迁移旧版 `navatation_clocks` 到 `navatation_widgets`。
 */
export function useWidgets(isEditMode: boolean) {
  const [widgets, setWidgets] = useState<WidgetItem[]>(() => {
    const savedWidgets = localStorage.getItem('navatation_widgets');
    if (savedWidgets) {
      try {
        return JSON.parse(savedWidgets);
      } catch (e) {
        console.error('Failed to parse saved widgets, resetting to empty', e);
      }
    }

    // 历史数据兼容：自动迁移旧版 navatation_clocks
    const savedClocks = localStorage.getItem('navatation_clocks');
    if (savedClocks) {
      try {
        const clocks = JSON.parse(savedClocks);
        if (Array.isArray(clocks)) {
          const migrated: WidgetItem[] = clocks.map((clock) => ({
            id: clock.id || `clock-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            type: 'clock',
            style: clock.style,
            x: clock.x,
            y: clock.y,
            meta: {},
          }));
          localStorage.setItem('navatation_widgets', JSON.stringify(migrated));
          return migrated;
        }
      } catch (e) {
        console.error('Failed to migrate historic clocks to widgets', e);
      }
    }

    return [];
  });

  const [tempWidgets, setTempWidgets] = useState<WidgetItem[]>([]);

  // 进入编辑模式时，同步备份当前生效的组件数据到临时草稿态
  useEffect(() => {
    if (isEditMode) {
      setTempWidgets(widgets.map((w) => ({ ...w, meta: w.meta ? { ...w.meta } : {} })));
    }
  }, [isEditMode, widgets]);

  /**
   * 新增组件
   */
  const addWidget = useCallback(
    (type: string, style: string, initialX = 40, initialY = 30, meta: Record<string, any> = {}) => {
      const newWidget: WidgetItem = {
        id: `${type}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        type,
        style,
        x: initialX,
        y: initialY,
        meta,
      };
      setTempWidgets((prev) => [...prev, newWidget]);
      return newWidget.id;
    },
    []
  );

  /**
   * 删除组件
   */
  const removeWidget = useCallback((id: string) => {
    setTempWidgets((prev) => prev.filter((w) => w.id !== id));
  }, []);

  /**
   * 更新组件百分比位置
   */
  const updateWidgetPosition = useCallback((id: string, x: number, y: number) => {
    setTempWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, x, y } : w))
    );
  }, []);

  /**
   * 保存组件配置
   */
  const saveWidgets = useCallback(() => {
    setWidgets(tempWidgets);
    localStorage.setItem('navatation_widgets', JSON.stringify(tempWidgets));
  }, [tempWidgets]);

  /**
   * 取消编辑，丢弃临时草稿并回滚
   */
  const cancelWidgets = useCallback(() => {
    setTempWidgets(widgets.map((w) => ({ ...w, meta: w.meta ? { ...w.meta } : {} })));
  }, [widgets]);

  return {
    widgets,
    tempWidgets,
    setTempWidgets,
    addWidget,
    removeWidget,
    updateWidgetPosition,
    saveWidgets,
    cancelWidgets,
  };
}
