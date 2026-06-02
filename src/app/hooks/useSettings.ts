import { useState, useCallback, useEffect } from 'react';
import { settingsService } from '../services/settings-service';
import { DEFAULT_SETTINGS, DEFAULT_WALLPAPER } from '../../config/app.config';

export function useSettings(
  authState: any,
  theme: string,
  setTheme: (theme: string) => void,
  searchEngine: string,
  setSearchEngine: (engine: string) => void
) {
  const [backgroundImage, setBackgroundImage] = useState(() => {
    return localStorage.getItem('navatation_wallpaper') || DEFAULT_WALLPAPER;
  });
  
  const [settings, setSettings] = useState(() => {
    const local = localStorage.getItem('navatation_settings');
    if (local) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(local) };
      } catch {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // 草稿备份
  const [backupSettings, setBackupSettings] = useState<any>(null);
  const [backupBackgroundImage, setBackupBackgroundImage] = useState('');
  const [backupTheme, setBackupTheme] = useState('');

  /**
   * 获取用户的个性化设置。
   * 仅在已登录状态下从后端 API 加载，包括搜索框大小、图标间距、背景图及搜索引擎等。
   */
  const fetchSettings = useCallback(async () => {
    if (authState.isLoggedIn) {
      try {
        // 请求用户个性化配置接口
        const res = await settingsService.getSettings();
        if (res.code === 200 && res.data) {
          const data = res.data;
          const serverSettings = {
            searchBoxWidth: data.searchBoxWidth,
            searchBoxHeight: data.searchBoxHeight,
            searchBoxMarginTop: data.searchBoxMarginTop,
            iconSize: data.iconSize,
            iconRadius: data.iconRadius,
            iconSpacingX: data.iconSpacingX,
            iconSpacingY: data.iconSpacingY,
            iconTextGap: data.iconTextGap,
            textSize: data.textSize,
            iconsMarginTop: data.iconsMarginTop,
            iconsMarginX: data.iconsMarginX || 0,
          };
          // 更新前端对应的主题与尺寸配置并缓存至本地
          setSettings(serverSettings);
          localStorage.setItem('navatation_settings', JSON.stringify(serverSettings));
          
          // 单独更新背景图和默认搜索引擎
          if (data.backgroundImage) {
            setBackgroundImage(data.backgroundImage);
            localStorage.setItem('navatation_wallpaper', data.backgroundImage);
          }
          if (data.searchEngine) {
            setSearchEngine(data.searchEngine);
            localStorage.setItem('navatation_search_engine', data.searchEngine);
          }
        }
      } catch (err) {
        console.error('Failed to fetch settings', err);
      }
    }
  }, [authState.isLoggedIn, setSearchEngine]);

  // 当登录状态改变时，自动拉取后端配置，并在登出时回滚至本地或默认配置
  useEffect(() => {
    if (authState.isLoggedIn) {
      fetchSettings();
    } else {
      const local = localStorage.getItem('navatation_settings');
      if (local) {
        try {
          setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(local) });
        } catch {
          setSettings(DEFAULT_SETTINGS);
        }
      } else {
        setSettings(DEFAULT_SETTINGS);
      }
      const localWallpaper = localStorage.getItem('navatation_wallpaper');
      setBackgroundImage(localWallpaper || DEFAULT_WALLPAPER);
    }
  }, [authState.isLoggedIn, fetchSettings]);

  /**
   * 打开设置面板，备份当前生效状态以供取消时回滚。
   */
  const handleOpenSettings = useCallback(() => {
    setBackupSettings(settings);
    setBackupBackgroundImage(backgroundImage);
    setBackupTheme(theme || 'light');
    setIsSettingsOpen(true);
  }, [settings, backgroundImage, theme]);

  /**
   * 关闭设置面板（不保存），回滚所有预览配置。
   */
  const handleCloseSettings = useCallback(() => {
    if (backupSettings !== null) setSettings(backupSettings);
    if (backupBackgroundImage) setBackgroundImage(backupBackgroundImage);
    if (backupTheme) setTheme(backupTheme);
    setIsSettingsOpen(false);
  }, [backupSettings, backupBackgroundImage, backupTheme, setTheme]);

  /**
   * 实时预览设置（不落盘、不保存到数据库）。
   */
  const handlePreviewSettings = useCallback((previewSettings: any, previewBg: string, previewTheme: string) => {
    setSettings(previewSettings);
    setBackgroundImage(previewBg);
    setTheme(previewTheme);
  }, [setTheme]);

  /**
   * 保存个性化设置。
   * 支持本地草稿批量保存及后端持久化。
   */
  const handleSaveSettings = useCallback((draftSettings: any, draftBackgroundImage: string, draftTheme: string) => {
    // 1. 同步更新前端生效状态与本地缓存
    setSettings(draftSettings);
    localStorage.setItem('navatation_settings', JSON.stringify(draftSettings));
    setBackgroundImage(draftBackgroundImage);
    localStorage.setItem('navatation_wallpaper', draftBackgroundImage);
    setTheme(draftTheme);

    // 2. 异步保存至后端数据库 (若登录)
    if (authState.isLoggedIn) {
      settingsService.saveSettings({
        ...draftSettings,
        backgroundImage: draftBackgroundImage,
        backgroundType: 'URL',
        searchEngine: searchEngine,
        theme: draftTheme
      }).catch(console.error);
    }

    // 3. 清除备份数据并关闭对话框
    setBackupSettings(null);
    setBackupBackgroundImage('');
    setBackupTheme('');
    setIsSettingsOpen(false);
  }, [authState.isLoggedIn, searchEngine, setTheme]);

  const handleRandomWallpaper = useCallback(async () => {
    try {
      const res = await settingsService.getRandomWallpaper();
      if (res && res.code === 200 && res.data) {
        const newBg = res.data.wallpaperUrl;
        setBackgroundImage(newBg);
        localStorage.setItem('navatation_wallpaper', newBg);
        if (authState.isLoggedIn) {
          await settingsService.patchSettings({ backgroundImage: newBg });
        }
      }
    } catch (err) {
      console.error('Failed to trigger random wallpaper', err);
    }
  }, [authState.isLoggedIn]);

  return {
    backgroundImage,
    setBackgroundImage,
    settings,
    setSettings,
    isSettingsOpen,
    setIsSettingsOpen,
    fetchSettings,
    handleOpenSettings,
    handleCloseSettings,
    handlePreviewSettings,
    handleSaveSettings,
    handleRandomWallpaper,
  };
}
