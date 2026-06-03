import { useState, useCallback, useEffect, useRef } from 'react';
import { widgetService } from '../services/widget-service';

export interface WidgetItem {
  id: string;
  type: string; // e.g., 'clock'
  style: string; // e.g., 'analog' | 'digital' | 'flip' | 'traditional'
  x: number; // percentage from left (0 - 100)
  y: number; // percentage from top (0 - 100)
  meta?: Record<string, any>;
}

export interface AuthState {
  isLoggedIn: boolean;
  user?: any;
  loading?: boolean;
}

/**
 * 通用组件状态管理 Hook (useWidgets)
 * 支持编辑态下的草稿隔离、新增组件、删除组件、移动位置，并在保存时统一持久化。
 * 自动迁移旧版 `navatation_clocks` 到 `navatation_widgets`。
 * 整合云同步逻辑：登录状态下同步云端，未登录状态下本地持久化。
 *
 * @param isEditMode 是否处于编辑模式
 * @param authState 登录与授权状态数据
 */
export function useWidgets(isEditMode: boolean, authState: AuthState) {
  // 保存组件的主状态
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

  // 保存组件的编辑态草稿状态
  const [tempWidgets, setTempWidgets] = useState<WidgetItem[]>([]);
  // 用于记录前一次的登录状态，用以检测从未登录向登录的过渡
  const prevIsLoggedInRef = useRef(authState.isLoggedIn);

  /**
   * 拉取云端组件数据，并执行本地游客数据迁移上云或覆写本地缓存
   */
  const fetchWidgets = useCallback(async () => {
    // 卫语句：若用户未登录，不拉取云端数据，直接返回
    if (!authState.isLoggedIn) {
      return;
    }

    // 在进行异步操作前，同步记录当前是否为未登录切换到登录态
    const isTransitioningLogin = !prevIsLoggedInRef.current;

    try {
      // 从后端接口拉取最新的云端小组件配置
      const res = await widgetService.getWidgets();
      
      // 卫语句：若响应失败，直接返回
      if (res.code !== 200) {
        return;
      }

      // 获取当前 LocalStorage 中的本地缓存组件数据（主要用于游客态迁移）
      const local = localStorage.getItem('navatation_widgets');
      const localWidgets: WidgetItem[] = local ? JSON.parse(local) : [];

      // 卫语句判断：如果属于首次从游客态切换至登录态，且云端数据为空但本地有添加的组件数据，则自动迁移数据上云
      if (isTransitioningLogin && res.data.length === 0 && localWidgets.length > 0) {
        const uploadPayload = localWidgets.map((w) => ({
          type: w.type,
          style: w.style,
          x: w.x,
          y: w.y,
          meta: w.meta ?? {},
        }));
        
        // 调用接口全量保存组件，实现无缝上云
        await widgetService.saveWidgets(uploadPayload);
        
        // 迁移保存后，再次重新拉取以获取含有后端权威 ID 的最新列表
        const finalRes = await widgetService.getWidgets();
        if (finalRes.code === 200) {
          const loaded = finalRes.data.map((w) => ({
            id: w.widgetId ?? `clock-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            type: w.type,
            style: w.style,
            x: Number(w.x),
            y: Number(w.y),
            meta: w.meta ?? {},
          }));
          setWidgets(loaded);
          localStorage.setItem('navatation_widgets', JSON.stringify(loaded));
        }
        return;
      }

      // 正常流程：直接使用云端权威数据覆写本地 state 与 LocalStorage 缓存
      const loaded = res.data.map((w) => ({
        id: w.widgetId ?? `clock-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        type: w.type,
        style: w.style,
        x: Number(w.x),
        y: Number(w.y),
        meta: w.meta ?? {},
      }));
      setWidgets(loaded);
      localStorage.setItem('navatation_widgets', JSON.stringify(loaded));
    } catch (err) {
      // 捕获网络请求等异步错误，防异常逃逸
      console.error('[useWidgets] 同步云端组件配置出错:', err);
    }
  }, [authState.isLoggedIn]);

  // 监听登录态变化，处理拉取与迁移
  useEffect(() => {
    // 卫语句：若已登录，执行拉取云端组件逻辑
    if (authState.isLoggedIn) {
      fetchWidgets();
      prevIsLoggedInRef.current = true;
      return;
    }
    
    // 卫语句：若之前是登录态而现在退出了，则清空内存状态与 LocalStorage 缓存
    if (prevIsLoggedInRef.current) {
      localStorage.removeItem('navatation_widgets');
      setWidgets([]);
      setTempWidgets([]);
    }
    prevIsLoggedInRef.current = false;
  }, [authState.isLoggedIn, fetchWidgets]);

  // 进入编辑模式时，同步备份当前生效 of 组件数据到临时草稿态
  useEffect(() => {
    // 卫语句：若未开启编辑模式，则无需同步，直接返回
    if (!isEditMode) {
      return;
    }
    setTempWidgets(widgets.map((w) => ({ ...w, meta: w.meta ? { ...w.meta } : {} })));
  }, [isEditMode, widgets]);

  /**
   * 新增组件至草稿态
   *
   * @param type 组件类型
   * @param style 组件样式
   * @param initialX 初始 X 轴百分比位置
   * @param initialY 初始 Y 轴百分比位置
   * @param meta 组件可选元数据
   * @returns 新生成组件的临时 ID
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
   * 从草稿态中删除组件
   *
   * @param id 组件 ID
   */
  const removeWidget = useCallback((id: string) => {
    setTempWidgets((prev) => prev.filter((w) => w.id !== id));
  }, []);

  /**
   * 更新草稿态中组件的百分比位置
   *
   * @param id 组件 ID
   * @param x X 轴百分比位置
   * @param y Y 轴百分比位置
   */
  const updateWidgetPosition = useCallback((id: string, x: number, y: number) => {
    setTempWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, x, y } : w))
    );
  }, []);

  /**
   * 保存组件配置，写入 LocalStorage 并在登录时异步向后端提交
   */
  const saveWidgets = useCallback(async () => {
    // 1. 同步更新本地 state 状态与 LocalStorage 缓存
    setWidgets(tempWidgets);
    localStorage.setItem('navatation_widgets', JSON.stringify(tempWidgets));

    // 2. 卫语句：若用户未登录，不向后端保存，直接返回
    if (!authState.isLoggedIn) {
      return;
    }

    try {
      // 3. 构造提交到云端的 DTO 载荷
      const uploadPayload = tempWidgets.map((w) => {
        // 本地新增的临时 ID 以 clock- 等开头，这些 ID 过滤掉，让后端重新生成权威 ID (以 WG 开头)
        const widgetId = w.id.startsWith('WG') ? w.id : undefined;
        return {
          widgetId,
          type: w.type,
          style: w.style,
          x: w.x,
          y: w.y,
          meta: w.meta ?? {},
        };
      });

      // 4. 调用 API 同步至云端
      await widgetService.saveWidgets(uploadPayload);

      // 5. 保存完毕后重新拉取权威数据，确保本地 ID 与数据库保存的主键一致
      await fetchWidgets();
    } catch (err) {
      // 捕获异常，防止 Promise 错误逃逸
      console.error('[useWidgets] 异步保存组件配置到云端失败:', err);
    }
  }, [tempWidgets, authState.isLoggedIn, fetchWidgets]);

  /**
   * 取消编辑，丢弃临时草稿并从当前生效的 widgets 列表中重置回滚
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

