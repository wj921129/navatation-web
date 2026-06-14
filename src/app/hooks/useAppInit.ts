/**
 * @description 应用初始化 Hook
 * @date 2026-06-09
 */
import { useEffect } from 'react';
import { toast } from 'sonner';
import { publicService } from '../services/public-service';
import { authStore } from '../stores/auth-store';
import { DEFAULT_WALLPAPER } from '../../config/app.config';
import { UserSettings } from '../services/settings-service';

export function useAppInit(
  authState: { isLoggedIn: boolean; user: any },
  setIsEditMode: (v: boolean) => void,
  setBackgroundImage: (v: string) => void,
  setShortcuts: (v: any[]) => void,
  setTempShortcuts: (v: any[]) => void,
  setWidgets: (v: any[]) => void,
  setTempWidgets: (v: any[]) => void,
  setSettings: (v: UserSettings) => void
) {
  // 当用户登出（未登录）时，强制退出编辑模式，清空临时状态与壁纸缓存，回归游客初始数据
  useEffect(() => {
    if (!authState.isLoggedIn) {
      setIsEditMode(false);
      localStorage.removeItem('navatation_wallpaper');
      localStorage.removeItem('navatation_guest_categories');
      setBackgroundImage(DEFAULT_WALLPAPER);
      setShortcuts([]);
      setTempShortcuts([]);
    }
  }, [authState.isLoggedIn, setBackgroundImage, setShortcuts, setTempShortcuts, setIsEditMode]);

  // 初始化挂载：如果本地存在 Token，则尝试获取用户信息
  useEffect(() => {
    authStore.fetchUser();
  }, []);

  // 监听来自 API 客户端的强制登出事件（如 401 未授权时触发）
  useEffect(() => {
    const handler = () => authStore.logout();
    window.addEventListener('auth:logout', handler);
    return () => window.removeEventListener('auth:logout', handler);
  }, []);

  // 游客模式下自动拉取超级管理员的配置
  useEffect(() => {
    if (authState.isLoggedIn) {
      return;
    }

    const fetchGuestConfig = async () => {
      try {
        const res = await publicService.getGuestConfig();
        if (res.code !== 200 || !res.data) {
          return;
        }

        const config = res.data;

        if (config.shortcuts?.length > 0) {
          const loaded = config.shortcuts.map((item: any) => ({
            id: item.shortcutId,
            categoryId: item.categoryId,
            name: item.name,
            url: item.url,
            color: item.iconColor ?? '#fff',
            iconType: item.iconType,
            iconValue: item.iconValue ?? 'Link',
            dragId: item.shortcutId ?? Math.random().toString(36).substring(7)
          }));
          setShortcuts(loaded);
          setTempShortcuts(loaded);
          // 写入本地游客快捷方式缓存，防止首屏加载闪跃
          localStorage.setItem('navatation_guest_shortcuts', JSON.stringify(loaded));
        }

        if (config.widgets?.length > 0) {
          const loadedW = config.widgets.map((w: any) => ({
            id: w.widgetId ?? `clock-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            type: w.type,
            style: w.style,
            x: Number(w.x),
            y: Number(w.y),
            meta: w.meta ?? {},
          }));
          setWidgets(loadedW);
          setTempWidgets(loadedW);
          // 写入小组件物理位置本地缓存，消灭首屏浮现跳跃 Bug
          localStorage.setItem('navatation_widgets', JSON.stringify(loadedW));
        }

        if (config.settings) {
          setSettings(config.settings);
          // 写入设置本地缓存
          localStorage.setItem('navatation_settings', JSON.stringify(config.settings));
          if (config.settings.backgroundImage) {
            setBackgroundImage(config.settings.backgroundImage);
            // 写入壁纸本地缓存，避免壁纸闪烁
            localStorage.setItem('navatation_wallpaper', config.settings.backgroundImage);
          }
        }

        if (config.categories && config.categories.length > 0) {
          // 写入本地游客分类缓存
          localStorage.setItem('navatation_guest_categories', JSON.stringify(config.categories));
        }
      } catch (err) {
        console.error('Failed to load guest config:', err);
        toast.error('拉取游客配置失败');
      }
    };

    fetchGuestConfig();
  }, [authState.isLoggedIn, setShortcuts, setTempShortcuts, setWidgets, setTempWidgets, setSettings, setBackgroundImage]);
}
