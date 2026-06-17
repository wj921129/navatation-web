/**
 * @description 首页图标（Home Shortcuts）状态管理 Hook
 * 负责管理 admin/游客模式首页已添加网页图标的 CRUD 操作。
 * 数据源：navatation_recommend_home_shortcut（admin 路由）/ navatation_nav_home_shortcut（用户路由）
 * @date 2026-06-15
 */
import { useState, useEffect, useCallback } from 'react';
import { navService } from '../services/nav-service';
import { publicService } from '../services/public-service';

export function useHomeShortcuts(authState: { isLoggedIn: boolean; user: any }) {
  const [homeShortcuts, setHomeShortcuts] = useState<any[]>([]);
  const [tempHomeShortcuts, setTempHomeShortcuts] = useState<any[]>([]);

  const fetchHomeShortcuts = useCallback(async () => {
    if (!authState.isLoggedIn) {
      // 游客模式：从 public 接口拉取
      try {
        const res = await publicService.getGuestHomeShortcuts();
        if (res.code === 200 && res.data) {
          const loaded = res.data.map((item: any) => ({
            id: item.shortcutId,
            dragId: item.shortcutId,
            name: item.name,
            url: item.url,
            color: item.iconColor || '#fff',
            iconType: item.iconType,
            iconValue: item.iconValue || 'Link',
          }));
          setHomeShortcuts(loaded);
          setTempHomeShortcuts(loaded);
        }
      } catch (err) {
        console.error('Failed to fetch guest home shortcuts', err);
      }
      return;
    }

    try {
      const res = await navService.getHomeShortcuts();
      if (res.code === 200 && res.data) {
        const loaded = res.data.map((item: any) => ({
          id: item.shortcutId,
          dragId: item.shortcutId,
          name: item.name,
          url: item.url,
          color: item.iconColor || '#fff',
          iconType: item.iconType,
          iconValue: item.iconValue || 'Link',
        }));
        setHomeShortcuts(loaded);
        setTempHomeShortcuts(loaded);
      }
    } catch (err) {
      console.error('Failed to fetch home shortcuts', err);
    }
  }, [authState.isLoggedIn]);

  // 拖拽排序
  const moveHomeShortcut = useCallback((fromIndex: number, toIndex: number) => {
    setTempHomeShortcuts(prev => {
      const updated = [...prev];
      const [removed] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, removed);
      return updated;
    });
  }, []);

  // 保存所有编辑（diff 出 deleted/updated/added，逐一调用 home-shortcut API）
  const handleSaveHomeShortcuts = useCallback(async () => {
    if (!authState.isLoggedIn) {
      setHomeShortcuts([...tempHomeShortcuts]);
      return;
    }

    const snapshotBeforeEdit = [...homeShortcuts];
    const optimisticShortcuts = [...tempHomeShortcuts];
    setHomeShortcuts(optimisticShortcuts);

    try {
      // 1. 删除的项
      const deleted = homeShortcuts.filter(s => s.id && !tempHomeShortcuts.some(t => t.id === s.id));
      // 2. 修改的项（包含属性修改和顺序修改）
      const updated = tempHomeShortcuts.filter((t, index) => {
        if (!t.id) return false;
        const originalIndex = homeShortcuts.findIndex(s => s.id === t.id);
        const original = homeShortcuts[originalIndex];
        return original && (
          original.name !== t.name ||
          original.url !== t.url ||
          original.iconType !== t.iconType ||
          original.iconValue !== t.iconValue ||
          original.color !== t.color ||
          originalIndex !== index
        );
      });
      // 3. 新增的项
      const added = tempHomeShortcuts.filter(t => !t.id);

      // 4. 并发执行删除与更新
      const writePromises: Promise<any>[] = [
        ...deleted.map(s => navService.deleteHomeShortcut(s.id)),
        ...updated.map(t => {
          const newIndex = tempHomeShortcuts.findIndex(temp => temp.id === t.id);
          return navService.updateHomeShortcut(t.id, {
            name: t.name,
            url: t.url,
            iconType: t.iconType,
            iconValue: t.iconValue,
            iconColor: t.color,
            sortOrder: newIndex,
          });
        }),
      ];
      await Promise.all(writePromises);

      // 5. 逐一创建新增项
      for (const s of added) {
        const newIndex = tempHomeShortcuts.findIndex(temp => temp === s);
        await navService.addHomeShortcut({
          name: s.name,
          url: s.url,
          iconType: s.iconType,
          iconValue: s.iconValue,
          iconColor: s.color,
          sortOrder: newIndex,
        });
      }

      // 6. 静默重新拉取以获取最新数据库 ID
      await fetchHomeShortcuts();
    } catch (err) {
      console.error('Failed to save home shortcuts', err);
      setHomeShortcuts(snapshotBeforeEdit);
    }
  }, [tempHomeShortcuts, homeShortcuts, authState.isLoggedIn, fetchHomeShortcuts]);

  // 登录态变化时重新拉取
  useEffect(() => {
    fetchHomeShortcuts();
  }, [fetchHomeShortcuts]);

  return {
    homeShortcuts,
    setHomeShortcuts,
    tempHomeShortcuts,
    setTempHomeShortcuts,
    fetchHomeShortcuts,
    moveHomeShortcut,
    handleSaveHomeShortcuts,
  };
}
