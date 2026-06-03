import { Plus, Edit3, Save, Settings, User } from 'lucide-react';
import { IconMap } from './components/ui/IconMap';
import { useState, useEffect, useCallback } from 'react';
import { SettingsDialog } from './components/SettingsDialog';
import { LoginDialog } from './components/LoginDialog';
import { AddShortcutDialog } from './components/AddShortcutDialog';
import { EditShortcutDialog } from './components/EditShortcutDialog';
import { LogoutConfirmDialog } from './components/LogoutConfirmDialog';
import { TodoPanel } from './components/TodoPanel';
import { TopDock } from './components/TopDock';
import { TodoListWidget } from './components/TodoListWidget';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useTheme } from 'next-themes';
import { authStore } from './stores/auth-store';
import { useWidgets } from './hooks/useWidgets';
import { useClockMenu } from './hooks/useClockMenu';
import ClockWidget from './components/widgets/ClockWidget';
import { useRef } from 'react';
import AnalogClock from './components/widgets/AnalogClock';
import DigitalClock from './components/widgets/DigitalClock';
import FlipClock from './components/widgets/FlipClock';
import TraditionalClock from './components/widgets/TraditionalClock';


import { SearchBox } from './components/SearchBox';
import { DraggableShortcut } from './components/DraggableShortcut';
import { AiSearchOverlay } from './components/AiSearchOverlay';

import { useBrightness } from './hooks/useBrightness';
import { useSettings } from './hooks/useSettings';
import { useShortcuts } from './hooks/useShortcuts';

import { DEFAULT_SHORTCUTS, DEFAULT_WALLPAPER } from '../config/app.config';

/**
 * 应用主组件，负责布局、搜索、捷径卡片展示与编辑、系统设置等核心功能。
 * 通过自定义 Hooks (useShortcuts, useSettings, useBrightness) 进行复杂业务解耦，确保高维护性。
 */
export default function App() {
  const { theme, setTheme } = useTheme();
  const [searchEngine, setSearchEngine] = useState(() => localStorage.getItem('navatation_search_engine') || 'google');
  const [isTodoOpen, setIsTodoOpen] = useState(false);
  const [isAiSearchOpen, setIsAiSearchOpen] = useState(false);
  const [aiSearchQuery, setAiSearchQuery] = useState('');
  const [aiSearchEngine, setAiSearchEngine] = useState('');
  const [clocksVisible, setClocksVisible] = useState<boolean>(() => {
    return localStorage.getItem('navatation_clocks_visible') !== '0';
  });

  const handleAiSearch = useCallback((query: string, engine: string) => {
    setAiSearchQuery(query);
    setAiSearchEngine(engine);
    setIsAiSearchOpen(true);
  }, []);

  const handleToggleClockVisibility = useCallback(() => {
    setClocksVisible(prev => {
      const next = !prev;
      localStorage.setItem('navatation_clocks_visible', next ? '1' : '0');
      return next;
    });
  }, []);

  // 1. 订阅登录状态
  const [authState, setAuthState] = useState(authStore.getState());
  useEffect(() => {
    const unsubscribe = authStore.subscribe((state) => {
      setAuthState(state);
    });
    return unsubscribe;
  }, []);

  // 2. 调用自定义业务逻辑 Hooks
  const shortcutsData = useShortcuts(authState);
  // 3. 解构解耦业务逻辑
  const {
    shortcuts,
    setShortcuts,
    tempShortcuts,
    setTempShortcuts,
    isEditMode,
    setIsEditMode,
    editingShortcut,
    setEditingShortcut,
    isAddShortcutOpen,
    setIsAddShortcutOpen,
    isLoginOpen,
    setIsLoginOpen,
    isLogoutConfirmOpen,
    setIsLogoutConfirmOpen,
    moveShortcut,
    handleAddShortcuts,
    handleStartEdit,
    handleSaveEdits: saveShortcutsEdits,
    handleCancelEdits: cancelShortcutsEdits,
    handleDeleteShortcut,
    handleEditShortcut,
    handleSaveEdit,
  } = shortcutsData;

  const settingsData = useSettings(authState, theme || 'light', setTheme, searchEngine, setSearchEngine);
  const brightnessData = useBrightness(theme || 'light', setTheme, authState);
  const widgetsData = useWidgets(isEditMode, authState);
  const clockMenuData = useClockMenu();

  const {
    widgets,
    tempWidgets,
    addWidget,
    removeWidget,
    updateWidgetPosition,
    saveWidgets,
    cancelWidgets,
  } = widgetsData;

  const {
    isClockOpen,
    setIsClockOpen,
    isClockClosing,
    setIsClockClosing,
    isHoveringClock,
    setIsHoveringClock,
    clockTimerRef,
    clearClockTimer,
    triggerCloseClock,
    handleMouseEnterClock,
    handleMouseLeaveClock,
    resetClockState,
  } = clockMenuData;

  const [activeDraggingId, setActiveDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const activeDraggingStyleRef = useRef<'analog' | 'digital' | 'flip' | 'traditional' | null>(null);

  // Menu drag-and-drop state & refs
  const [menuDraggingStyle, setMenuDraggingStyle] = useState<'analog' | 'digital' | 'flip' | 'traditional' | null>(null);
  const [menuDragPos, setMenuDragPos] = useState({ x: 0, y: 0 });
  const [menuDragHasMoved, setMenuDragHasMoved] = useState(false);
  const menuDragStartPosRef = useRef({ x: 0, y: 0 });
  const menuDragHasMovedRef = useRef(false);
  const menuDraggingStyleRef = useRef<'analog' | 'digital' | 'flip' | 'traditional' | null>(null);


  const {
    backgroundImage,
    setBackgroundImage,
    settings,
    isSettingsOpen,
    setIsSettingsOpen,
    handleOpenSettings,
    handleCloseSettings,
    handlePreviewSettings,
    handleSaveSettings,
    handleRandomWallpaper,
  } = settingsData;

  const {
    bgBrightness,
    setBgBrightness,
    isBrightnessOpen,
    isBrightnessClosing,
    isHoveringBrightness,
    setIsHoveringBrightness,
    brightnessTimerRef,
    clearBrightnessTimer,
    triggerCloseBrightness,
    handleToggleTheme,
    handleMouseEnterTheme,
    handleMouseLeaveTheme,
    handleMouseEnterOtherWidget,
  } = brightnessData;

  // 统一保存与取消逻辑
  const handleSaveEdits = useCallback(async () => {
    await saveShortcutsEdits();
    saveWidgets();
  }, [saveShortcutsEdits, saveWidgets]);

  const handleCancelEdits = useCallback(() => {
    cancelShortcutsEdits();
    cancelWidgets();
  }, [cancelShortcutsEdits, cancelWidgets]);

  // 悬停交互事件融合防重叠
  const handleMouseEnterOtherWidgetCombined = useCallback(() => {
    handleMouseEnterOtherWidget();
    resetClockState();
  }, [handleMouseEnterOtherWidget, resetClockState]);

  const handleMouseEnterThemeCombined = useCallback(() => {
    handleMouseEnterTheme();
    resetClockState();
  }, [handleMouseEnterTheme, resetClockState]);

  const handleMouseEnterClockCombined = useCallback(() => {
    handleMouseEnterClock();
    brightnessData.resetBrightnessState();
  }, [handleMouseEnterClock, brightnessData]);

  const handleMenuDragMove = useCallback((e: PointerEvent) => {
    const style = menuDraggingStyleRef.current;
    if (!style) return;

    const dx = e.clientX - menuDragStartPosRef.current.x;
    const dy = e.clientY - menuDragStartPosRef.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 5) {
      menuDragHasMovedRef.current = true;
      setMenuDragHasMoved(true);
    }

    let clockWidth = 220;
    let clockHeight = 100;
    if (style === 'analog' || style === 'traditional') {
      clockWidth = 160;
      clockHeight = 160;
    } else if (style === 'flip') {
      clockWidth = 200;
      clockHeight = 100;
    }

    const ox = clockWidth / 2;
    const oy = clockHeight / 2;

    let newX = e.clientX - ox;
    let newY = e.clientY - oy;

    const maxX = window.innerWidth - clockWidth;
    const maxY = window.innerHeight - clockHeight;

    newX = Math.max(0, Math.min(newX, maxX));
    newY = Math.max(0, Math.min(newY, maxY));

    setMenuDragPos({ x: newX, y: newY });
  }, []);

  const handleMenuDragUp = useCallback((e: PointerEvent) => {
    const style = menuDraggingStyleRef.current;
    if (style) {
      const dx = e.clientX - menuDragStartPosRef.current.x;
      const dy = e.clientY - menuDragStartPosRef.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 5 || menuDragHasMovedRef.current) {
        let clockWidth = 220;
        let clockHeight = 100;
        if (style === 'analog' || style === 'traditional') {
          clockWidth = 160;
          clockHeight = 160;
        } else if (style === 'flip') {
          clockWidth = 200;
          clockHeight = 100;
        }
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
        addWidget('clock', style, xPercent, yPercent);
      } else {
        addWidget('clock', style, 40, 30);
      }
    }

    menuDraggingStyleRef.current = null;
    setMenuDraggingStyle(null);
    menuDragHasMovedRef.current = false;
    setMenuDragHasMoved(false);
    triggerCloseClock();

    window.removeEventListener('pointermove', handleMenuDragMove);
    window.removeEventListener('pointerup', handleMenuDragUp);
  }, [addWidget, triggerCloseClock, handleMenuDragMove]);

  const handleDragStartFromMenu = useCallback((e: React.PointerEvent<HTMLButtonElement>, style: 'analog' | 'digital' | 'flip' | 'traditional') => {
    e.preventDefault();
    menuDragStartPosRef.current = { x: e.clientX, y: e.clientY };
    menuDraggingStyleRef.current = style;
    setMenuDraggingStyle(style);
    menuDragHasMovedRef.current = false;
    setMenuDragHasMoved(false);

    let clockWidth = 220;
    let clockHeight = 100;
    if (style === 'analog' || style === 'traditional') {
      clockWidth = 160;
      clockHeight = 160;
    } else if (style === 'flip') {
      clockWidth = 200;
      clockHeight = 100;
    }
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
  }, [handleMenuDragMove, handleMenuDragUp]);

  useEffect(() => {
    return () => {
      window.removeEventListener('pointermove', handleMenuDragMove);
      window.removeEventListener('pointerup', handleMenuDragUp);
    };
  }, [handleMenuDragMove, handleMenuDragUp]);


  // 全局指针移动与松开事件（处理边界限制）
  const handlePointerMoveGlobal = useCallback((e: PointerEvent) => {
    if (!activeDraggingId || !activeDraggingStyleRef.current) return;

    let newX = e.clientX - dragOffset.x;
    let newY = e.clientY - dragOffset.y;

    let clockWidth = 220;
    let clockHeight = 100;
    if (activeDraggingStyleRef.current === 'analog' || activeDraggingStyleRef.current === 'traditional') {
      clockWidth = 160;
      clockHeight = 160;
    } else if (activeDraggingStyleRef.current === 'flip') {
      clockWidth = 200;
      clockHeight = 100;
    }

    const maxX = window.innerWidth - clockWidth;
    const maxY = window.innerHeight - clockHeight;

    newX = Math.max(0, Math.min(newX, maxX));
    newY = Math.max(0, Math.min(newY, maxY));

    const xPercent = (newX / window.innerWidth) * 100;
    const yPercent = (newY / window.innerHeight) * 100;

    updateWidgetPosition(activeDraggingId, xPercent, yPercent);
  }, [activeDraggingId, dragOffset, updateWidgetPosition]);

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

  const clockMenuPanel = isClockOpen && (
    <div
      onMouseEnter={() => {
        setIsHoveringClock(true);
        setIsClockClosing(false);
        clearClockTimer();
      }}
      onMouseLeave={() => {
        setIsHoveringClock(false);
        clearClockTimer();
        clockTimerRef.current = setTimeout(() => {
          triggerCloseClock();
        }, 1000);
      }}
      className={`absolute top-[71px] left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 px-4 py-3 rounded-2xl bg-black/65 border border-white/10 shadow-2xl backdrop-blur-md text-white select-none cursor-default whitespace-nowrap ${
        isClockClosing ? 'brightness-panel-exit' : 'brightness-panel-enter'
      }`}
    >
      <span className="text-[11px] font-medium tracking-wide text-neutral-300 mr-1">选择样式</span>
      <div className="flex items-center gap-3">
        {/* Analog style */}
        <button
          onPointerDown={(e) => handleDragStartFromMenu(e, 'analog')}
          className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/10 transition-colors cursor-grab active:cursor-grabbing group/btn"
        >
          <div className="w-12 h-12 rounded-full border-2 border-white/40 group-hover/btn:border-white flex items-center justify-center relative">
            <div className="w-0.5 h-4 bg-white absolute top-2 rounded-full" />
            <div className="w-3 h-0.5 bg-white absolute top-6 left-6 rounded-full" />
            <div className="w-1 h-1 rounded-full bg-red-500 absolute top-[23px] left-[23px]" />
          </div>
          <span className="text-[10px] text-neutral-300 font-light group-hover/btn:text-white">模拟</span>
        </button>

        {/* Traditional style */}
        <button
          onPointerDown={(e) => handleDragStartFromMenu(e, 'traditional')}
          className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/10 transition-colors cursor-grab active:cursor-grabbing group/btn"
        >
          <div className="w-12 h-12 rounded-full border-2 border-white/40 group-hover/btn:border-white flex items-center justify-center relative">
            <span className="text-[8px] font-bold text-neutral-300 group-hover/btn:text-white absolute top-0.5">12</span>
            <span className="text-[8px] font-bold text-neutral-300 group-hover/btn:text-white absolute bottom-0.5">6</span>
            <span className="text-[8px] font-bold text-neutral-300 group-hover/btn:text-white absolute left-0.5">9</span>
            <span className="text-[8px] font-bold text-neutral-300 group-hover/btn:text-white absolute right-0.5">3</span>
            <div className="w-0.5 h-3 bg-neutral-300 group-hover/btn:bg-white absolute top-[16px] left-[23px] origin-bottom transform rotate-45" />
            <div className="w-0.5 h-4 bg-neutral-300 group-hover/btn:bg-white absolute top-[12px] left-[23px] origin-bottom transform -rotate-12" />
          </div>
          <span className="text-[10px] text-neutral-300 font-light group-hover/btn:text-white">传统</span>
        </button>

        {/* Digital style */}
        <button
          onPointerDown={(e) => handleDragStartFromMenu(e, 'digital')}
          className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/10 transition-colors cursor-grab active:cursor-grabbing group/btn"
        >
          <div className="w-16 h-12 rounded-xl border border-white/20 group-hover/btn:border-white/50 flex flex-col items-center justify-center bg-white/5">
            <span className="text-[10px] font-mono tracking-tight">12:00:00</span>
            <span className="text-[6px] text-neutral-400 scale-90">6月3日</span>
          </div>
          <span className="text-[10px] text-neutral-300 font-light group-hover/btn:text-white">数字</span>
        </button>

        {/* Flip style */}
        <button
          onPointerDown={(e) => handleDragStartFromMenu(e, 'flip')}
          className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/10 transition-colors cursor-grab active:cursor-grabbing group/btn"
        >
          <div className="w-16 h-12 flex items-center justify-center gap-1 bg-white/5 border border-white/20 group-hover/btn:border-white/50 rounded-xl px-1">
            <div className="w-6 h-8 rounded bg-neutral-900 border border-neutral-800 flex items-center justify-center">
              <span className="text-[10px] font-mono font-bold">12</span>
            </div>
            <div className="w-6 h-8 rounded bg-neutral-900 border border-neutral-800 flex items-center justify-center">
              <span className="text-[10px] font-mono font-bold">00</span>
            </div>
          </div>
          <span className="text-[10px] text-neutral-300 font-light group-hover/btn:text-white">翻页</span>
        </button>
      </div>
    </div>
  );

  // 当用户登出（未登录）时，强制退出编辑模式，清空临时状态与壁纸缓存，回归游客初始数据
  useEffect(() => {
    if (!authState.isLoggedIn) {
      setIsEditMode(false);
      localStorage.removeItem('navatation_wallpaper');
      setBackgroundImage(DEFAULT_WALLPAPER);
      setShortcuts(DEFAULT_SHORTCUTS);
      setTempShortcuts(DEFAULT_SHORTCUTS);
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

  const handleSearchEngineChange = (engine: string) => {
    setSearchEngine(engine);
    localStorage.setItem('navatation_search_engine', engine);
    if (authState.isLoggedIn) {
      const { settingsService } = require('./services/settings-service');
      settingsService.patchSettings({ searchEngine: engine }).catch(console.error);
    }
  };

  const handleLogout = () => {
    authStore.logout();
  };

  const iconInnerSize = settings.iconSize * 0.5;
  const borderRadius = `${settings.iconRadius}%`;

  // 编辑模式下使用临时草稿列表，非编辑模式下使用确认生效列表
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

        {/* Widgets Rendering */}
        {(isEditMode ? tempWidgets : (clocksVisible ? widgets : []))
          .filter((w) => w.type === 'clock')
          .map((widget) => (
            <ClockWidget
              key={widget.id}
              id={widget.id}
              style={widget.style as 'analog' | 'digital' | 'flip' | 'traditional'}
              x={widget.x}
              y={widget.y}
              isEditMode={isEditMode}
              onStartDrag={(id, style, ox, oy) => {
                activeDraggingStyleRef.current = style;
                setActiveDraggingId(id);
                setDragOffset({ x: ox, y: oy });
              }}
              onDelete={removeWidget}
            />
          ))}

        {menuDraggingStyle && menuDragHasMoved && (
          <div
            className="absolute pointer-events-none opacity-60 z-50 select-none border border-dashed border-blue-500/60 p-1 rounded-3xl bg-blue-500/5 shadow-xl"
            style={{
              left: `${menuDragPos.x}px`,
              top: `${menuDragPos.y}px`,
            }}
          >
            {menuDraggingStyle === 'analog' && <AnalogClock />}
            {menuDraggingStyle === 'traditional' && <TraditionalClock />}
            {menuDraggingStyle === 'digital' && <DigitalClock />}
            {menuDraggingStyle === 'flip' && <FlipClock />}
          </div>
        )}

        {/* Top Left Todo Widget */}
        <div className="absolute top-0 right-6 z-30">
          <TodoListWidget onOpenTodoPanel={() => setIsTodoOpen(true)} />
        </div>

        {/* Top Widgets Bar */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30">
          <TopDock
            theme={theme || 'light'}
            onToggleTodo={() => setIsTodoOpen((prev) => !prev)}
            onRandomWallpaper={handleRandomWallpaper}
            onToggleTheme={handleToggleTheme}
            onMouseEnterTheme={handleMouseEnterThemeCombined}
            onMouseLeaveTheme={handleMouseLeaveTheme}
            onMouseEnterOtherWidget={handleMouseEnterOtherWidgetCombined}
            isHoveringBrightness={isHoveringBrightness}
            isEditMode={isEditMode}
            onMouseEnterClock={handleMouseEnterClockCombined}
            onMouseLeaveClock={handleMouseLeaveClock}
            isHoveringClockMenu={isHoveringClock}
            clockMenuPanel={clockMenuPanel}
            clocksVisible={clocksVisible}
            onToggleClockVisibility={handleToggleClockVisibility}
            brightnessPanel={
              isBrightnessOpen && theme === 'dark' && (
                <div
                  onMouseEnter={() => {
                    setIsHoveringBrightness(true);
                    setIsBrightnessClosing(false);
                    clearBrightnessTimer();
                  }}
                  onMouseLeave={() => {
                    setIsHoveringBrightness(false);
                    clearBrightnessTimer();
                    brightnessTimerRef.current = setTimeout(() => {
                      triggerCloseBrightness();
                    }, 1000);
                  }}
                  className={`absolute top-[71px] left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-4 py-2.5 rounded-full bg-black/45 border border-white/10 shadow-xl backdrop-blur-md text-white select-none cursor-default whitespace-nowrap ${
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
            onAiSearch={handleAiSearch}
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
                      className="bg-icon-bg border border-widget-border flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 overflow-hidden"
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
                  className="bg-icon-bg/80 border border-widget-border/80 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 cursor-pointer hover:bg-icon-bg hover:border-widget-border"
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
                className="w-12 h-12 rounded-full glass-button flex items-center justify-center hover:scale-110 shadow-lg"
              >
                <Plus className="w-5 h-5 text-white rotate-45" />
              </button>

              {/* Save Button */}
              <button
                onClick={handleSaveEdits}
                className="w-12 h-12 rounded-full bg-green-500/80 backdrop-blur-xl border border-green-400/50 flex items-center justify-center hover:bg-green-600 hover:scale-110 transition-all duration-200 shadow-lg"
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
                  className="w-12 h-12 rounded-full glass-button flex items-center justify-center hover:scale-110 shadow-lg"
                >
                  <Edit3 className="w-5 h-5 text-white" />
                </button>
              ) : null}

              {/* Settings Button */}
              <button
                onClick={handleOpenSettings}
                className="w-12 h-12 rounded-full glass-button flex items-center justify-center hover:scale-110 shadow-lg"
              >
                <Settings className="w-5 h-5 text-white" />
              </button>

              {/* Account Button */}
              <button
                onClick={() => authState.isLoggedIn ? setIsLogoutConfirmOpen(true) : setIsLoginOpen(true)}
                className="w-12 h-12 rounded-full glass-button flex items-center justify-center hover:scale-110 shadow-lg relative"
              >
                {authState.isLoggedIn && authState.user ? (
                  <span className="text-white text-sm font-medium">{authState.user.username.charAt(0).toUpperCase()}</span>
                ) : (
                  <User className="w-5 h-5 text-white" />
                )}
                {authState.isLoggedIn ? (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-neutral-900" />
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
        <AiSearchOverlay
          isOpen={isAiSearchOpen}
          onClose={() => setIsAiSearchOpen(false)}
          initialQuery={aiSearchQuery}
          initialEngine={aiSearchEngine}
        />
      </div>
    </DndProvider>
  );
}