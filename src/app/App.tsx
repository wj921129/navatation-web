import { Search, Settings, User, Plus, Edit3, X as XIcon, Save, XCircle, CheckSquare } from 'lucide-react';
import { IconMap } from './components/ui/IconMap';
import { useState, useEffect, useCallback, useRef } from 'react';
import { SearchEngineSelect, searchEngines } from './components/SearchEngineSelect';
import { SettingsDialog } from './components/SettingsDialog';
import { LoginDialog } from './components/LoginDialog';
import { AddShortcutDialog } from './components/AddShortcutDialog';
import { EditShortcutDialog } from './components/EditShortcutDialog';
import { LogoutConfirmDialog } from './components/LogoutConfirmDialog';
import { TodoPanel } from './components/TodoPanel';
import { TopDock } from './components/TopDock';
import { TodoListWidget } from './components/TodoListWidget';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useTheme } from 'next-themes';
import { authStore } from './stores/auth-store';
import { navService } from './services/nav-service';
import { settingsService } from './services/settings-service';

import { DEFAULT_SETTINGS, DEFAULT_SHORTCUTS, DEFAULT_WALLPAPER } from '../config/app.config';


const SHORTCUT_DRAG_TYPE = 'SHORTCUT';

/**
 * 可拖拽的捷径卡片组件，仅在编辑模式下使用。
 * 通过 react-dnd 的 useDrag / useDrop 实现拖拽重新排序。
 */
function DraggableShortcut({
  shortcut,
  index,
  moveShortcut,
  iconInnerSize,
  iconSize,
  iconRadius,
  iconTextGap,
  textSize,
  onEdit,
  onDelete,
}: {
  shortcut: any;
  index: number;
  moveShortcut: (from: number, to: number) => void;
  iconInnerSize: number;
  iconSize: number;
  iconRadius: number;
  iconTextGap: number;
  textSize: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: SHORTCUT_DRAG_TYPE,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: SHORTCUT_DRAG_TYPE,
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        moveShortcut(item.index, index);
        item.index = index;
      }
    },
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      className="flex flex-col items-center group relative cursor-grab active:cursor-grabbing"
      style={{
        gap: `${iconTextGap}px`,
        opacity: isDragging ? 0.4 : 1,
      }}
    >
      {/* 删除按钮 */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDelete();
        }}
        className="absolute -top-2 -right-2 z-10 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg transition-all"
      >
        <XIcon className="w-3 h-3 text-white" strokeWidth={3} />
      </button>

      <div
        onClick={onEdit}
        className="flex flex-col items-center"
        style={{ gap: `${iconTextGap}px` }}
      >
        <div
          className="bg-white dark:bg-neutral-700 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden"
          style={{
            width: `${iconSize}px`,
            height: `${iconSize}px`,
            borderRadius: `${iconRadius}%`,
          }}
        >
          {(() => {
            if (shortcut.iconType === 'CUSTOM_URL' || shortcut.iconType === 'FAVICON' || shortcut.iconType === 'CUSTOM_UPLOAD') {
              return (
                <img
                  src={shortcut.iconValue}
                  alt={shortcut.name}
                  style={{ width: '50%', height: '50%', objectFit: 'contain' }}
                />
              );
            }
            let IconComp = IconMap.Link;
            const iconName = shortcut.iconValue;
            if (iconName && IconMap[iconName]) {
              IconComp = IconMap[iconName];
            }
            return (
              <IconComp
                style={{ color: shortcut.color || '#333', width: `${iconInnerSize}px`, height: `${iconInnerSize}px` }}
                strokeWidth={2}
              />
            );
          })()}
        </div>
        <span
          className="text-white font-light tracking-wide drop-shadow-lg"
          style={{ fontSize: `${textSize}px` }}
        >
          {shortcut.name}
        </span>
      </div>
    </div>
  );
}

interface SearchBoxProps {
  searchEngine: string;
  onSearchEngineChange: (engine: string) => void;
  settings: {
    searchBoxWidth: number;
    searchBoxHeight: number;
    iconsMarginTop: number;
  };
}

/**
 * 隔离搜索输入框状态的局部组件，防止打字输入时导致整个 App 巨型组件频繁重渲染。
 */
function SearchBox({ searchEngine, onSearchEngineChange, settings }: SearchBoxProps) {
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      const engine = searchEngines.find(ev => ev.value === searchEngine);
      if (engine) {
        window.open(`${engine.url}${encodeURIComponent(query)}`, '_blank');
      }
    }
  };

  return (
    <form onSubmit={handleSearch} style={{ marginBottom: `${settings.iconsMarginTop}px` }}>
      <div className="relative mx-auto flex items-center" style={{ width: `${settings.searchBoxWidth}%` }}>
        <div className="relative w-full">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
            <SearchEngineSelect value={searchEngine} onChange={onSearchEngineChange} />
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索或输入网址..."
            className="w-full px-16 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 text-white placeholder-white/70 text-lg outline-none focus:bg-white/25 focus:border-white/40 transition-all"
            style={{ height: `${settings.searchBoxHeight}px` }}
          />

          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
          >
            <Search className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </form>
  );
}

/**
 * 应用主组件，负责布局、搜索、捷径卡片展示与编辑、系统设置等核心功能。
 */
export default function App() {
  const [searchEngine, setSearchEngine] = useState(() => localStorage.getItem('navatation_search_engine') || 'google');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isAddShortcutOpen, setIsAddShortcutOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingShortcut, setEditingShortcut] = useState<{ index: number; shortcut: any } | null>(null);
  const [isTodoOpen, setIsTodoOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  // 屏幕背景亮度控制小功能 (仅在深色模式下支持变暗调节，且暂存在本地浏览器缓存中)
  const [bgBrightness, setBgBrightness] = useState(() => {
    const saved = localStorage.getItem('navatation_bg_brightness');
    if (saved !== null) return Number(saved);
    return 80; // 默认深色模式亮度为 80%
  });
  const [isBrightnessOpen, setIsBrightnessOpen] = useState(false);
  const [isBrightnessClosing, setIsBrightnessClosing] = useState(false);
  const [isHoveringBrightness, setIsHoveringBrightness] = useState(false);
  const brightnessTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auth state from store
  const [authState, setAuthState] = useState(authStore.getState());
  
  // 订阅登录状态存储的变化，以便实时响应登录、登出状态
  useEffect(() => {
    const unsubscribe = authStore.subscribe((state) => {
      setAuthState(state);
    });
    return unsubscribe;
  }, []);

  // 当用户登出（未登录）时，强制退出编辑模式，清空临时状态与壁纸缓存，回归游客初始数据
  useEffect(() => {
    if (!authState.isLoggedIn) {
      setIsEditMode(false);
      localStorage.removeItem('navatation_wallpaper');
      setBackgroundImage(DEFAULT_WALLPAPER);
      setShortcuts(DEFAULT_SHORTCUTS);
      setTempShortcuts(DEFAULT_SHORTCUTS);
    }
  }, [authState.isLoggedIn]);

  const [shortcuts, setShortcuts] = useState<any[]>(() => authStore.getState().isLoggedIn ? [] : DEFAULT_SHORTCUTS);
  const [tempShortcuts, setTempShortcuts] = useState<any[]>(() => authStore.getState().isLoggedIn ? [] : DEFAULT_SHORTCUTS);
  const [backgroundImage, setBackgroundImage] = useState(() => {
    return localStorage.getItem('navatation_wallpaper') || DEFAULT_WALLPAPER;
  });
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [backupSettings, setBackupSettings] = useState<any>(null);
  const [backupBackgroundImage, setBackupBackgroundImage] = useState<string>('');
  const [backupTheme, setBackupTheme] = useState<string>('');

  // 缓存最新的快捷方式列表，避免 fetchShortcuts 闭包捕获旧状态
  const shortcutsRef = useRef(shortcuts);
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  // 跟踪上一次登录状态以检测登录切换动作
  const prevIsLoggedInRef = useRef(authState.isLoggedIn);

  /**
   * 获取用户已保存的捷径列表。
   * 如果已登录，则从后端 API 获取；未登录则使用默认本地捷径。
   * 若用户属首次登录且云端列表为空，则将当前游客模式下的网址批量同步保存至云端。
   */
  const fetchShortcuts = useCallback(async () => {
    // 捕获本次调用的登录切换标识（同步执行，避免异步竞态）
    const isTransitioningLogin = !prevIsLoggedInRef.current && authState.isLoggedIn;

    if (!authState.isLoggedIn) {
      // 未登录状态下重置登录切换追踪标识以备下次切换
      prevIsLoggedInRef.current = false;
      // 使用默认快捷方式
      setShortcuts(DEFAULT_SHORTCUTS);
      setTempShortcuts(DEFAULT_SHORTCUTS);
      return;
    }

    // 已登录状态，记录当前状态为已登录，避免后续重复检测到 transition
    prevIsLoggedInRef.current = true;

    try {
      // 从后端接口拉取捷径数据
      const res = await navService.getShortcuts();
      if (res.code !== 200) {
        return;
      }

      // 如果属登录切换且云端网址列表为空，则将游客模式下的本地捷径数据同步至云端
      if (isTransitioningLogin && res.data.length === 0) {
        const guestShortcuts = shortcutsRef.current;
        if (guestShortcuts && guestShortcuts.length > 0) {
          // 获取当前用户的第一个分类
          const catRes = await navService.getCategories();
          const categoryId = catRes.code === 200 && catRes.data.length > 0 ? catRes.data[0].categoryId : undefined;
          
          // 封装批量保存请求体
          const payload = guestShortcuts.map(s => {
            let iconName = 'Link';
            if (typeof s.iconValue === 'string') {
              iconName = s.iconValue;
            } else if (s.icon && s.icon.displayName) {
              iconName = s.icon.displayName;
            } else if (s.icon && s.icon.name) {
              iconName = s.icon.name;
            }
            return {
              name: s.name,
              url: s.url,
              iconType: s.iconType || 'BUILTIN',
              iconValue: iconName,
              iconColor: s.color || s.iconColor || '#fff',
            };
          });

          // 调用批量创建接口同步数据
          await navService.batchCreateShortcuts({ categoryId: categoryId as any, shortcuts: payload });
          
          // 重新拉取同步后的云端数据
          const newRes = await navService.getShortcuts();
          if (newRes.code === 200) {
            const loaded = newRes.data.map(item => ({
              id: item.shortcutId,
              categoryId: item.categoryId,
              name: item.name,
              url: item.url,
              color: item.iconColor || '#fff',
              iconType: item.iconType,
              iconValue: item.iconValue || 'Link'
            }));
            setShortcuts(loaded);
            setTempShortcuts(loaded);
          }
          return;
        }
      }

      // 正常加载并将云端数据转换为前端格式
      const loaded = res.data.map(item => ({
        id: item.shortcutId,
        categoryId: item.categoryId,
        name: item.name,
        url: item.url,
        color: item.iconColor || '#fff',
        iconType: item.iconType,
        iconValue: item.iconValue || 'Link'
      }));
      setShortcuts(loaded);
      setTempShortcuts(loaded);
    } catch (err) {
      console.error('Failed to fetch shortcuts', err);
    }
  }, [authState.isLoggedIn]);

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
          // 更新前端对应的主题与尺寸配置
          setSettings({
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
          });
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
  }, [authState.isLoggedIn]);

  useEffect(() => {
    fetchShortcuts();
    fetchSettings();
  }, [fetchShortcuts, fetchSettings]);

  const handleSearchEngineChange = (engine: string) => {
    setSearchEngine(engine);
    localStorage.setItem('navatation_search_engine', engine);
    if (authState.isLoggedIn) {
      settingsService.patchSettings({ searchEngine: engine }).catch(console.error);
    }
  };

  const handleRandomWallpaper = async () => {
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
  };

  const triggerCloseBrightness = () => {
    setIsBrightnessClosing(true);
    if (brightnessTimerRef.current) clearTimeout(brightnessTimerRef.current);
    brightnessTimerRef.current = setTimeout(() => {
      setIsBrightnessOpen(false);
      setIsBrightnessClosing(false);
    }, 280);
  };

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);

    if (nextTheme === 'dark') {
      setIsBrightnessOpen(true);
      setIsBrightnessClosing(false);
      if (brightnessTimerRef.current) clearTimeout(brightnessTimerRef.current);
      brightnessTimerRef.current = setTimeout(() => {
        triggerCloseBrightness();
      }, 1000);
    } else {
      setIsBrightnessOpen(false);
      setIsBrightnessClosing(false);
      if (brightnessTimerRef.current) clearTimeout(brightnessTimerRef.current);
    }

    if (authState.isLoggedIn) {
      settingsService.patchSettings({ theme: nextTheme }).catch(console.error);
    }
  };

  const handleMouseEnterTheme = () => {
    if (theme === 'dark') {
      setIsBrightnessOpen(true);
      setIsBrightnessClosing(false);
      if (brightnessTimerRef.current) clearTimeout(brightnessTimerRef.current);
      brightnessTimerRef.current = setTimeout(() => {
        triggerCloseBrightness();
      }, 1000);
    }
  };

  const handleMouseEnterOtherWidget = () => {
    setIsBrightnessOpen(false);
    setIsBrightnessClosing(false);
    if (brightnessTimerRef.current) clearTimeout(brightnessTimerRef.current);
  };



  /**
   * 执行退出登录。
   * 调用全局认证存储的登出方法，清除令牌及用户信息。
   */
  const handleLogout = () => {
    authStore.logout();
  };

  /**
   * 打开设置面板，备份当前生效状态以供取消时回滚。
   */
  const handleOpenSettings = () => {
    setBackupSettings(settings);
    setBackupBackgroundImage(backgroundImage);
    setBackupTheme(theme || 'light');
    setIsSettingsOpen(true);
  };

  /**
   * 关闭设置面板（不保存），回滚所有预览配置。
   */
  const handleCloseSettings = () => {
    if (backupSettings !== null) setSettings(backupSettings);
    if (backupBackgroundImage) setBackgroundImage(backupBackgroundImage);
    if (backupTheme) setTheme(backupTheme);
    setIsSettingsOpen(false);
  };

  /**
   * 实时预览设置（不落盘、不保存到数据库）。
   */
  const handlePreviewSettings = (previewSettings: any, previewBg: string, previewTheme: string) => {
    setSettings(previewSettings);
    setBackgroundImage(previewBg);
    setTheme(previewTheme);
  };

  /**
   * 保存个性化设置。
   * 支持本地草稿批量保存及后端持久化。
   */
  const handleSaveSettings = (draftSettings: any, draftBackgroundImage: string, draftTheme: string) => {
    // 1. 同步更新前端生效状态
    setSettings(draftSettings);
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
  };

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

  // 拖拽排序 - 移动快捷方式在临时列表中的位置
  const moveShortcut = useCallback((fromIndex: number, toIndex: number) => {
    const updated = [...tempShortcuts];
    const [removed] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, removed);
    setTempShortcuts(updated);
  }, [tempShortcuts]);

  /**
   * 批量添加捷径。
   * 登录状态下同步提交给后端，未登录状态下仅在本地内存中更新。
   */
  /**
   * 批量添加捷径。
   * 仅在临时编辑列表 tempShortcuts 中追加，等最终保存时统一持久化。
   */
  const handleAddShortcuts = (newShortcuts: any[]) => {
    const formatted = newShortcuts.map(s => {
      let iconName = 'Link';
      if (s.iconType && s.iconType !== 'BUILTIN') {
        iconName = s.iconValue;
      } else if (s.icon && s.icon.displayName) {
        iconName = s.icon.displayName;
      } else if (s.icon && s.icon.name) {
        iconName = s.icon.name;
      } else if (typeof s.iconValue === 'string') {
        iconName = s.iconValue;
      }

      return {
        name: s.name,
        url: s.url,
        color: s.color || '#fff',
        iconType: s.iconType || 'BUILTIN',
        iconValue: iconName,
      };
    });
    setTempShortcuts([...tempShortcuts, ...formatted]);
  };

  /**
   * 开启编辑模式。
   * 备份当前捷径至临时编辑列表，确保取消操作时可完美还原。
   */
  const handleStartEdit = () => {
    setTempShortcuts([...shortcuts]);
    setIsEditMode(true);
  };

  /**
   * 保存编辑后的全部捷径。
   * 将临时编辑列表应用到正式展示列表并退出编辑模式。
   * 如果已登录，则同步执行增删改请求将修改保存至云端。
   */
  const handleSaveEdits = async () => {
    if (!authState.isLoggedIn) {
      // 未登录状态下，直接将本地编辑应用到展示列表并退出编辑模式
      setShortcuts([...tempShortcuts]);
      setIsEditMode(false);
      return;
    }

    try {
      // 1. 找出所有在编辑模式下被删除的快捷网址
      const deleted = shortcuts.filter(s => s.id && !tempShortcuts.some(t => t.id === s.id));

      // 2. 找出所有在编辑模式下被修改了的快捷网址（对比名称、URL、图标类型、图标值及颜色）
      const updated = tempShortcuts.filter(t => {
        if (!t.id) return false;
        const original = shortcuts.find(s => s.id === t.id);
        return original && (
          original.name !== t.name ||
          original.url !== t.url ||
          original.iconType !== t.iconType ||
          original.iconValue !== t.iconValue ||
          original.color !== t.color
        );
      });

      // 3. 找出所有在编辑模式下新增的快捷网址（无 id 的项）
      const added = tempShortcuts.filter(t => !t.id);

      // 4. 并发执行删除与更新 API 请求
      const writePromises: Promise<any>[] = [
        ...deleted.map(s => navService.deleteShortcut(s.id)),
        ...updated.map(t => navService.updateShortcut(t.id, {
          name: t.name,
          url: t.url,
          iconType: t.iconType,
          iconValue: t.iconValue,
          iconColor: t.color
        })),
      ];
      await Promise.all(writePromises);

      // 5. 如果有新增项，批量同步到云端
      if (added.length > 0) {
        const catRes = await navService.getCategories();
        const categoryId = catRes.code === 200 && catRes.data.length > 0 ? catRes.data[0].categoryId : undefined;
        if (categoryId) {
          const addedPayload = added.map(s => ({
            name: s.name,
            url: s.url,
            iconType: s.iconType,
            iconValue: s.iconValue,
            iconColor: s.color
          }));
          await navService.batchCreateShortcuts({ categoryId, shortcuts: addedPayload });
        }
      }

      // 6. 重新拉取最新的云端捷径数据（获取带有真实数据库 id 的全量数据）
      const res = await navService.getShortcuts();
      if (res.code === 200 && res.data) {
        const loaded = res.data.map(item => ({
          id: item.shortcutId,
          categoryId: item.categoryId,
          name: item.name,
          url: item.url,
          color: item.iconColor || '#fff',
          iconType: item.iconType,
          iconValue: item.iconValue || 'Link'
        }));

        // 7. 按 tempShortcuts 中设定的最终相对顺序将带有 ID 的项目重排组装起来
        const orderedShortcuts: any[] = [];
        tempShortcuts.forEach((temp) => {
          let matched: any = null;
          if (temp.id) {
            matched = loaded.find(l => l.id === temp.id);
          } else {
            // 用 name & url 匹配新创建项
            matched = loaded.find(l => l.name === temp.name && l.url === temp.url && !orderedShortcuts.some(o => o.id === l.id));
          }
          if (matched) {
            orderedShortcuts.push(matched);
          }
        });

        // 兜底补齐：防止有遗漏未匹配项
        loaded.forEach(l => {
          if (!orderedShortcuts.some(o => o.id === l.id)) {
            orderedShortcuts.push(l);
          }
        });

        // 8. 统一对最终排好序的列表在后端执行排序接口持久化
        const sortItems = orderedShortcuts.map((item, idx) => ({
          shortcutId: item.id,
          sortOrder: idx
        }));
        await navService.sortShortcuts(sortItems);
      }

      // 9. 全局重新加载以同步 React 界面状态
      await fetchShortcuts();
    } catch (err) {
      console.error('Failed to save shortcut edits to backend', err);
    }
    
    // 退出编辑模式并清除选择项
    setIsEditMode(false);
  };

  /**
   * 取消编辑模式。
   * 还原临时编辑列表，清空正在编辑的单项，并退出编辑模式。
   */
  const handleCancelEdits = () => {
    setTempShortcuts([...shortcuts]);
    setIsEditMode(false);
    setEditingShortcut(null);
  };

  /**
   * 删除捷径。
   * 过滤临时列表中的对应项。
   */
  const handleDeleteShortcut = (index: number) => {
    setTempShortcuts(tempShortcuts.filter((_, i) => i !== index));
  };

  /**
   * 点击单项捷径以启动编辑。
   * 记录正在编辑的捷径下标和具体内容。
   */
  const handleEditShortcut = (index: number) => {
    setEditingShortcut({ index, shortcut: tempShortcuts[index] });
  };

  /**
   * 保存单个捷径的编辑修改。
   * 更新临时列表中的指定项信息。
   */
  const handleSaveEdit = (updatedShortcut: { name: string; url: string; iconType: string; iconValue: string }) => {
    if (editingShortcut) {
      const newShortcuts = [...tempShortcuts];
      newShortcuts[editingShortcut.index] = {
        ...newShortcuts[editingShortcut.index],
        name: updatedShortcut.name,
        url: updatedShortcut.url,
        iconType: updatedShortcut.iconType,
        iconValue: updatedShortcut.iconValue,
      };
      setTempShortcuts(newShortcuts);
      setEditingShortcut(null);
    }
  };

  const iconInnerSize = settings.iconSize * 0.5;
  const borderRadius = `${settings.iconRadius}%`;

  // Use tempShortcuts in edit mode, shortcuts otherwise
  const displayShortcuts = isEditMode ? tempShortcuts : shortcuts;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="size-full relative flex flex-col items-center justify-start overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          filter: theme === 'dark' ? `brightness(${bgBrightness}%)` : 'none',
        }}
      />

      {/* Top Left Todo Widget */}
      <div className="absolute top-0 left-6 z-30">
        <TodoListWidget onOpenTodoPanel={() => setIsTodoOpen(true)} />
      </div>

      {/* Top Widgets Bar */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30">
        <TopDock
          theme={theme || 'light'}
          onToggleTodo={() => setIsTodoOpen((prev) => !prev)}
          onRandomWallpaper={handleRandomWallpaper}
          onToggleTheme={handleToggleTheme}
          onMouseEnterTheme={handleMouseEnterTheme}
          onMouseEnterOtherWidget={handleMouseEnterOtherWidget}
          brightnessPanel={
            isBrightnessOpen && theme === 'dark' && (
              <div
                onMouseEnter={() => {
                  setIsBrightnessClosing(false);
                  if (brightnessTimerRef.current) clearTimeout(brightnessTimerRef.current);
                }}
                onMouseLeave={() => {
                  if (brightnessTimerRef.current) clearTimeout(brightnessTimerRef.current);
                  brightnessTimerRef.current = setTimeout(() => {
                    triggerCloseBrightness();
                  }, 1000);
                }}
                className={`absolute top-[68px] left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-4 py-2.5 rounded-full bg-black/45 border border-white/10 shadow-xl backdrop-blur-md text-white select-none cursor-default whitespace-nowrap ${
                  isBrightnessClosing ? 'brightness-panel-exit' : 'brightness-panel-enter'
                }`}
              >
                <span className="text-[11px] font-medium tracking-wide text-neutral-200">屏幕亮度</span>
                <input
                  type="range"
                  min="30"
                  max="100"
                  value={bgBrightness}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setBgBrightness(val);
                    localStorage.setItem('navatation_bg_brightness', val.toString());
                  }}
                  className="w-24 h-1 rounded-lg appearance-none cursor-pointer bg-white/20 accent-white outline-none focus:outline-none"
                  style={{
                    WebkitAppearance: 'none',
                    background: `linear-gradient(to right, #fff 0%, #fff ${(bgBrightness - 30) / 70 * 100}%, rgba(255, 255, 255, 0.2) ${(bgBrightness - 30) / 70 * 100}%, rgba(255, 255, 255, 0.2) 100%)`
                  }}
                />
                <span className="text-[10px] font-mono font-semibold text-neutral-300 min-w-[28px] text-right">
                  {bgBrightness}%
                </span>
              </div>
            )
          }
        />
      </div>
      {/* Content Container */}
      <div className="relative z-10 w-full px-8" style={{ paddingTop: `${settings.searchBoxMarginTop}px` }}>
        {/* Search Box (Isolated State for Performance) */}
        <SearchBox
          searchEngine={searchEngine}
          onSearchEngineChange={handleSearchEngineChange}
          settings={settings}
        />

        {/* Shortcuts Grid */}
        <div 
          className="flex flex-wrap justify-center w-full mx-auto" 
          style={{ 
            gap: `${settings.iconSpacingY}px ${settings.iconSpacingX}px`,
            maxWidth: '1200px',
            paddingLeft: `${settings.iconsMarginX}%`,
            paddingRight: `${settings.iconsMarginX}%`
          }}
        >
          {/* Render all shortcuts dynamically */}
          {displayShortcuts.map((shortcut, globalIndex) => {
            if (isEditMode) {
                    return (
                      <DraggableShortcut
                        key={`${shortcut.name}-${globalIndex}`}
                        shortcut={shortcut}
                        index={globalIndex}
                        moveShortcut={moveShortcut}
                        iconInnerSize={iconInnerSize}
                        iconSize={settings.iconSize}
                        iconRadius={settings.iconRadius}
                        iconTextGap={settings.iconTextGap}
                        textSize={settings.textSize}
                        onEdit={() => handleEditShortcut(globalIndex)}
                        onDelete={() => handleDeleteShortcut(globalIndex)}
                      />
                    );
                  }
                  return (
                    <div
                      key={`${shortcut.name}-${globalIndex}`}
                      className="flex flex-col items-center group relative"
                      style={{ gap: `${settings.iconTextGap}px` }}
                    >
                      <a
                        href={shortcut.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center"
                        style={{ gap: `${settings.iconTextGap}px` }}
                      >
                        <div
                          className="bg-white dark:bg-neutral-700 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 overflow-hidden"
                          style={{
                            width: `${settings.iconSize}px`,
                            height: `${settings.iconSize}px`,
                            borderRadius: borderRadius
                          }}
                        >
                          {(() => {
                            if (shortcut.iconType === 'CUSTOM_URL' || shortcut.iconType === 'FAVICON' || shortcut.iconType === 'CUSTOM_UPLOAD') {
                              return (
                                <img
                                  src={shortcut.iconValue}
                                  alt={shortcut.name}
                                  style={{ width: '50%', height: '50%', objectFit: 'contain' }}
                                />
                              );
                            } else {
                              let IconComp = IconMap.Link;
                              const iconName = shortcut.iconValue;
                              if (iconName && IconMap[iconName]) {
                                IconComp = IconMap[iconName];
                              }
                              return (
                                <IconComp
                                  style={{ color: shortcut.color || '#333', width: `${iconInnerSize}px`, height: `${iconInnerSize}px` }}
                                  strokeWidth={2}
                                />
                              );
                            }
                          })()}
                        </div>
                        <span
                          className="text-white font-light tracking-wide drop-shadow-lg"
                          style={{ fontSize: `${settings.textSize}px` }}
                        >
                          {shortcut.name}
                        </span>
                      </a>
                    </div>
                  );
          })}

          {/* Add Shortcut Button */}
          {isEditMode ? (
            <button
              onClick={() => setIsAddShortcutOpen(true)}
              className="flex flex-col items-center group"
              style={{ gap: `${settings.iconTextGap}px` }}
            >
              <div
                className="bg-white/80 dark:bg-neutral-700/80 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 cursor-pointer hover:bg-white dark:hover:bg-neutral-600"
                style={{
                  width: `${settings.iconSize}px`,
                  height: `${settings.iconSize}px`,
                  borderRadius: borderRadius
                }}
              >
                <Plus
                  className="text-gray-400 group-hover:text-gray-600 transition-colors"
                  style={{ width: `${iconInnerSize}px`, height: `${iconInnerSize}px` }}
                  strokeWidth={2}
                />
              </div>
              <span
                className="text-white font-light tracking-wide drop-shadow-lg opacity-0"
                style={{ fontSize: `${settings.textSize}px` }}
              >
                添加
              </span>
            </button>
          ) : null}
        </div>
      </div>

      {/* Bottom Right Controls */}
      <div className="fixed bottom-8 right-8 flex items-center gap-4 z-30">
        {/* Edit Mode Buttons */}
        {isEditMode ? (
          <>
            {/* Cancel Button */}
            <button
              onClick={handleCancelEdits}
              className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center hover:bg-white/30 hover:scale-110 transition-all duration-200 shadow-lg"
            >
              <XCircle className="w-5 h-5 text-white" />
            </button>

            {/* Save Button */}
            <button
              onClick={handleSaveEdits}
              className="w-12 h-12 rounded-full bg-green-500 backdrop-blur-xl border border-green-400 flex items-center justify-center hover:bg-green-600 hover:scale-110 transition-all duration-200 shadow-lg"
            >
              <Save className="w-5 h-5 text-white" />
            </button>
          </>
        ) : (
          <>
             {/* Edit Button */}
             {authState.isLoggedIn ? (
               <button
                 onClick={handleStartEdit}
                 className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center hover:bg-white/30 hover:scale-110 transition-all duration-200 shadow-lg"
               >
                 <Edit3 className="w-5 h-5 text-white" />
               </button>
             ) : null}

            {/* Settings Button */}
            <button
              onClick={handleOpenSettings}
              className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center hover:bg-white/30 hover:scale-110 transition-all duration-200 shadow-lg"
            >
              <Settings className="w-5 h-5 text-white" />
            </button>


            {/* Account Button */}
            <button
              onClick={() => authState.isLoggedIn ? setIsLogoutConfirmOpen(true) : setIsLoginOpen(true)}
              className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center hover:bg-white/30 hover:scale-110 transition-all duration-200 shadow-lg relative"
            >
              {authState.isLoggedIn && authState.user ? (
                <span className="text-white text-sm font-medium">{authState.user.username.charAt(0).toUpperCase()}</span>
              ) : (
                <User className="w-5 h-5 text-white" />
              )}
              {authState.isLoggedIn ? (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
              ) : null}
            </button>
          </>
        )}
      </div>

      {/* Dialogs */}
      <SettingsDialog
        isOpen={isSettingsOpen}
        onClose={handleCloseSettings}
        onSave={handleSaveSettings}
        onPreview={handlePreviewSettings}
        settings={settings}
        backgroundImage={backgroundImage}
        currentTheme={theme || 'light'}
      />
      <LoginDialog
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />
      <TodoPanel
        isOpen={isTodoOpen}
        onClose={() => setIsTodoOpen(false)}
      />
      <LogoutConfirmDialog
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={handleLogout}
        username={authState.user?.username}
      />
      <AddShortcutDialog
        isOpen={isAddShortcutOpen}
        onClose={() => setIsAddShortcutOpen(false)}
        onAdd={handleAddShortcuts}
        iconSize={settings.iconSize}
        iconRadius={settings.iconRadius}
      />
      {editingShortcut ? (
        <EditShortcutDialog
          isOpen={!!editingShortcut}
          onClose={() => setEditingShortcut(null)}
          onSave={handleSaveEdit}
          shortcut={editingShortcut.shortcut}
        />
      ) : null}
    </div>
    </DndProvider>
  );
}