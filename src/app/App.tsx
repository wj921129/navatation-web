import { Search, Mail, Youtube, Twitter, Github, Linkedin, Instagram, Facebook, ShoppingCart, Film, Music, MessageCircle, Video, MessageSquare, Slack, Dribbble, Settings, User, Plus, Edit3, X as XIcon, Save, XCircle, CheckSquare } from 'lucide-react';
import * as Icons from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { SearchEngineSelect, searchEngines } from './components/SearchEngineSelect';
import { SettingsDialog } from './components/SettingsDialog';
import { LoginDialog } from './components/LoginDialog';
import { AddShortcutDialog } from './components/AddShortcutDialog';
import { EditShortcutDialog } from './components/EditShortcutDialog';
import { LogoutConfirmDialog } from './components/LogoutConfirmDialog';
import { TodoPanel } from './components/TodoPanel';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useTheme } from 'next-themes';
import { authStore } from './stores/auth-store';
import { navService } from './services/nav-service';
import { settingsService } from './services/settings-service';

const defaultShortcuts = [
  // First row - 9 icons
  { name: 'Google', iconValue: 'Search', iconType: 'BUILTIN', color: '#4285F4', url: 'https://google.com' },
  { name: 'YouTube', iconValue: 'Youtube', iconType: 'BUILTIN', color: '#FF0000', url: 'https://youtube.com' },
  { name: 'Facebook', iconValue: 'Facebook', iconType: 'BUILTIN', color: '#1877F2', url: 'https://facebook.com' },
  { name: 'Twitter', iconValue: 'Twitter', iconType: 'BUILTIN', color: '#1DA1F2', url: 'https://twitter.com' },
  { name: 'Instagram', iconValue: 'Instagram', iconType: 'BUILTIN', color: '#E4405F', url: 'https://instagram.com' },
  { name: 'LinkedIn', iconValue: 'Linkedin', iconType: 'BUILTIN', color: '#0A66C2', url: 'https://linkedin.com' },
  { name: 'GitHub', iconValue: 'Github', iconType: 'BUILTIN', color: '#181717', url: 'https://github.com' },
  { name: 'Amazon', iconValue: 'ShoppingCart', iconType: 'BUILTIN', color: '#FF9900', url: 'https://amazon.com' },
  { name: 'Netflix', iconValue: 'Film', iconType: 'BUILTIN', color: '#E50914', url: 'https://netflix.com' },
  // Second row - 7 icons
  { name: 'Spotify', iconValue: 'Music', iconType: 'BUILTIN', color: '#1DB954', url: 'https://spotify.com' },
  { name: 'Reddit', iconValue: 'MessageCircle', iconType: 'BUILTIN', color: '#FF4500', url: 'https://reddit.com' },
  { name: 'Gmail', iconValue: 'Mail', iconType: 'BUILTIN', color: '#EA4335', url: 'https://gmail.com' },
  { name: 'Twitch', iconValue: 'Video', iconType: 'BUILTIN', color: '#9146FF', url: 'https://twitch.tv' },
  { name: 'Discord', iconValue: 'MessageSquare', iconType: 'BUILTIN', color: '#5865F2', url: 'https://discord.com' },
  { name: 'Slack', iconValue: 'Slack', iconType: 'BUILTIN', color: '#4A154B', url: 'https://slack.com' },
  { name: 'Dribbble', iconValue: 'Dribbble', iconType: 'BUILTIN', color: '#EA4C89', url: 'https://dribbble.com' },
];

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
          className="bg-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden"
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
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              );
            }
            let IconComp = Icons.Link;
            const iconName = shortcut.iconValue;
            if (iconName && (Icons as any)[iconName]) {
              IconComp = (Icons as any)[iconName];
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

/**
 * 应用主组件，负责布局、搜索、捷径卡片展示与编辑、系统设置等核心功能。
 */
export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchEngine, setSearchEngine] = useState('google');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isAddShortcutOpen, setIsAddShortcutOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingShortcut, setEditingShortcut] = useState<{ index: number; shortcut: any } | null>(null);
  const [isTodoOpen, setIsTodoOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  
  // Auth state from store
  const [authState, setAuthState] = useState(authStore.getState());
  
  // 订阅登录状态存储的变化，以便实时响应登录、登出状态
  useEffect(() => {
    const unsubscribe = authStore.subscribe((state) => {
      setAuthState(state);
    });
    return unsubscribe;
  }, []);

  const [shortcuts, setShortcuts] = useState<any[]>(defaultShortcuts);
  const [tempShortcuts, setTempShortcuts] = useState<any[]>(defaultShortcuts);
  const [backgroundImage, setBackgroundImage] = useState('https://images.unsplash.com/photo-1598439473183-42c9301db5dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=2400');
  const [settings, setSettings] = useState({
    searchBoxWidth: 100,
    searchBoxHeight: 64,
    searchBoxMarginTop: 192,
    iconSize: 64,
    iconRadius: 50,
    iconSpacingX: 32,
    iconSpacingY: 48,
    iconTextGap: 12,
    textSize: 14,
    iconsMarginTop: 64,
  });

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
      setShortcuts(defaultShortcuts);
      setTempShortcuts(defaultShortcuts);
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
          }
          if (data.searchEngine) {
            setSearchEngine(data.searchEngine);
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

  /**
   * 执行搜索。
   * 根据当前选中的搜索引擎跳转至对应搜索结果页。
   */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // 查找当前所选搜索引擎的配置
      const engine = searchEngines.find(e => e.value === searchEngine);
      if (engine) {
        // 拼接查询参数并进行页面跳转
        window.location.href = `${engine.url}${encodeURIComponent(searchQuery)}`;
      }
    }
  };

  /**
   * 登录成功回调。
   * 关闭登录对话框。
   */
  const handleLogin = async (username: string) => {
    setIsLoginOpen(false);
  };

  /**
   * 执行退出登录。
   * 调用全局认证存储的登出方法，清除令牌及用户信息。
   */
  const handleLogout = () => {
    authStore.logout();
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
  const handleAddShortcuts = async (newShortcuts: any[]) => {
    if (authState.isLoggedIn) {
      try {
        // 先获取用户分类，将捷径保存至第一个分类中
        const catRes = await navService.getCategories();
        if (catRes.code === 200 && catRes.data.length > 0) {
          const categoryId = catRes.data[0].categoryId;
          
          // 将前端传入的数据格式化为后端保存接口所需格式
          const payload = newShortcuts.map(s => {
            // 优先使用透传的 iconType/iconValue（如自动检测的 FAVICON）
            if (s.iconType && s.iconType !== 'BUILTIN') {
              return {
                name: s.name,
                url: s.url,
                iconType: s.iconType,
                iconValue: s.iconValue,
                iconColor: s.color,
              };
            }
            let iconName = 'Link';
            if (s.icon && s.icon.displayName) {
              iconName = s.icon.displayName;
            } else if (s.icon && s.icon.name) {
              iconName = s.icon.name;
            } else if (typeof s.iconValue === 'string') {
              iconName = s.iconValue;
            }

            return {
              name: s.name,
              url: s.url,
              iconType: 'BUILTIN' as any,
              iconValue: iconName,
              iconColor: s.color,
            };
          });
          
          // 调用后端批量创建接口并重新获取最新列表
          await navService.batchCreateShortcuts({ categoryId, shortcuts: payload });
          fetchShortcuts();
        }
      } catch (err) {
        console.error('Failed to save shortcuts', err);
      }
    } else {
      // 本地非登录态直接追加到 shortcuts 状态中
      const formatted = newShortcuts.map(s => ({
        ...s,
        iconType: s.iconType || 'BUILTIN',
        iconValue: s.iconValue || s.icon?.displayName || s.icon?.name || 'Link'
      }));
      setShortcuts([...shortcuts, ...formatted]);
      setTempShortcuts([...shortcuts, ...formatted]);
    }
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

      // 2. 找出所有在编辑模式下被修改了名称或 URL 的快捷网址
      const updated = tempShortcuts.filter(t => {
        if (!t.id) return false;
        const original = shortcuts.find(s => s.id === t.id);
        return original && (original.name !== t.name || original.url !== t.url);
      });

      // 3. 检查顺序是否有变化
      const orderChanged = tempShortcuts.some((t, i) => {
        const orig = shortcuts[i];
        return t.id && orig?.id && t.id !== orig.id;
      });

      // 4. 并发执行删除与更新 API 请求
      const promises: Promise<any>[] = [
        ...deleted.map(s => navService.deleteShortcut(s.id)),
        ...updated.map(t => navService.updateShortcut(t.id, {
          name: t.name,
          url: t.url,
          iconType: t.iconType,
          iconValue: t.iconValue,
          iconColor: t.color
        })),
      ];

      // 5. 如果顺序有变化，同步排序到后端
      if (orderChanged) {
        const sortItems = tempShortcuts
          .filter(t => t.id)
          .map((t, idx) => ({ shortcutId: t.id, sortOrder: idx }));
        promises.push(navService.sortShortcuts(sortItems));
      }

      await Promise.all(promises);

      // 6. 重新拉取最新的云端捷径数据
      await fetchShortcuts();
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
  const handleSaveEdit = (updatedShortcut: { name: string; url: string; iconUrl?: string }) => {
    if (editingShortcut) {
      const newShortcuts = [...tempShortcuts];
      newShortcuts[editingShortcut.index] = {
        ...newShortcuts[editingShortcut.index],
        name: updatedShortcut.name,
        url: updatedShortcut.url,
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
        }}
      />

      {/* Content Container */}
      <div className="relative z-10 w-full px-8" style={{ paddingTop: `${settings.searchBoxMarginTop}px` }}>
        {/* Search Box */}
        <form onSubmit={handleSearch} style={{ marginBottom: `${settings.iconsMarginTop}px` }}>
          <div className="relative mx-auto flex items-center" style={{ maxWidth: `${(settings.searchBoxWidth / 100) * 768}px` }}>
            {/* Search Input with embedded icons */}
            <div className="relative w-full">
              {/* Left: Search Engine Select */}
              <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                <SearchEngineSelect value={searchEngine} onChange={setSearchEngine} />
              </div>

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索或输入网址..."
                className="w-full px-16 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 text-white placeholder-white/70 text-lg outline-none focus:bg-white/25 focus:border-white/40 transition-all"
                style={{ height: `${settings.searchBoxHeight}px` }}
              />

              {/* Right: Search Button */}
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
              >
                <Search className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </form>

        {/* Shortcuts Grid */}
        <div className="flex flex-col items-center" style={{ gap: `${settings.iconSpacingY}px` }}>
          {/* Render all shortcuts dynamically */}
          {Array.from({ length: Math.ceil(displayShortcuts.length / 9) + 1 }, (_, rowIndex) => {
            const startIdx = rowIndex * 9;
            const endIdx = Math.min(startIdx + 9, displayShortcuts.length);
            const rowShortcuts = displayShortcuts.slice(startIdx, endIdx);

            // Show add button on the row after all shortcuts (but not in edit mode)
            const showAddButton = !isEditMode && (startIdx === displayShortcuts.length || (rowShortcuts.length > 0 && rowShortcuts.length < 9));

            if (rowShortcuts.length === 0 && !showAddButton) return null;

            return (
              <div key={rowIndex} className="flex items-center" style={{ gap: `${settings.iconSpacingX}px` }}>
                {rowShortcuts.map((shortcut, idx) => {
                  const globalIndex = startIdx + idx;
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
                          className="bg-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 overflow-hidden"
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
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                              );
                            } else {
                              let IconComp = Icons.Link;
                              const iconName = shortcut.iconValue;
                              if (iconName && (Icons as any)[iconName]) {
                                IconComp = (Icons as any)[iconName];
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
                {showAddButton && (
                  <button
                    onClick={() => setIsAddShortcutOpen(true)}
                    className="flex flex-col items-center group"
                    style={{ gap: `${settings.iconTextGap}px` }}
                  >
                    <div
                      className="bg-white/80 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 cursor-pointer hover:bg-white"
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
                )}
              </div>
            );
          })}
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
            <button
              onClick={handleStartEdit}
              className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center hover:bg-white/30 hover:scale-110 transition-all duration-200 shadow-lg"
            >
              <Edit3 className="w-5 h-5 text-white" />
            </button>

            {/* Settings Button */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center hover:bg-white/30 hover:scale-110 transition-all duration-200 shadow-lg"
            >
              <Settings className="w-5 h-5 text-white" />
            </button>

            {/* Todo Button */}
            <button
              onClick={() => setIsTodoOpen(true)}
              className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center hover:bg-white/30 hover:scale-110 transition-all duration-200 shadow-lg"
            >
              <CheckSquare className="w-5 h-5 text-white" />
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
              {authState.isLoggedIn && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
              )}
            </button>
          </>
        )}
      </div>

      {/* Dialogs */}
      <SettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => {
          setIsSettingsOpen(false);
          // 如果已登录，在关闭设置对话框时，自动向后端保存最新配置
          if (authState.isLoggedIn) {
            settingsService.saveSettings({
              ...settings,
              backgroundImage: backgroundImage,
              backgroundType: 'URL',
              searchEngine: searchEngine,
              theme: theme || 'light'
            }).catch(console.error);
          }
        }}
        settings={settings}
        onSettingsChange={setSettings}
        backgroundImage={backgroundImage}
        onBackgroundChange={setBackgroundImage}
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
      {editingShortcut && (
        <EditShortcutDialog
          isOpen={!!editingShortcut}
          onClose={() => setEditingShortcut(null)}
          onSave={handleSaveEdit}
          shortcut={editingShortcut.shortcut}
        />
      )}
    </div>
    </DndProvider>
  );
}