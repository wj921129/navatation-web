/**
 * @description 前端核心业务逻辑与组件
 * @date 2026-06-10
 */
import { Plus, Edit3, Settings, Sun, Moon, ListTodo } from 'lucide-react';
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from './components/ui/context-menu';


import { useState, useEffect, useCallback } from 'react';
import { AppDialogs } from './components/layout/AppDialogs';

import { TopDock } from './components/dock/TopDock';
import { WidgetLayer } from './components/layout/WidgetLayer';
import { TodoListWidget } from './components/todo/TodoListWidget';
import { useTheme } from 'next-themes';
import { KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates, } from '@dnd-kit/sortable';


import { authStore } from './stores/auth-store';
import { useWidgets } from './hooks/useWidgets';
import { WidgetGalleryModal } from './components/dock/WidgetGalleryModal';



import { useRef } from 'react';
import AnalogClock from './components/widgets/AnalogClock';
import DigitalClock from './components/widgets/DigitalClock';
import FlipClock from './components/widgets/FlipClock';
import FlipClockSeconds from './components/widgets/FlipClockSeconds';
import TraditionalClock from './components/widgets/TraditionalClock';






import { SearchBox } from './components/search/SearchBox';
import { ShortcutGrid } from './components/shortcut/ShortcutGrid';

import { BottomRightDock } from './components/dock/BottomRightDock';
import { BrightnessPanel } from './components/dock/BrightnessPanel';

import { useBrightness } from './hooks/useBrightness';
import { useSettings } from './hooks/useSettings';
import { useShortcuts } from './hooks/useShortcuts';
import { useHomeShortcuts } from './hooks/useHomeShortcuts';
import { useAppInit } from './hooks/useAppInit';


import { DEFAULT_SHORTCUTS,  } from '../config/app.config';
import { useWidgetDrag } from './hooks/useWidgetDrag';

/**
 * 文件名：App.tsx
 * 描述：应用主组件，负责布局、搜索、捷径卡片展示与编辑、系统设置等核心功能。
 * 通过自定义 Hooks (useShortcuts, useSettings, useBrightness) 进行复杂业务解耦，确保高维护性。
 * 创建时间：2026-06-09
 */
export default function App() {
  const { theme, setTheme } = useTheme();
  const [searchEngine, setSearchEngine] = useState(() => localStorage.getItem('navatation_search_engine') || 'google');
  const [isTodoOpen, setIsTodoOpen] = useState(false);
  const [isAiSearchOpen, setIsAiSearchOpen] = useState(false);
  const [isManageHomepageOpen, setIsManageHomepageOpen] = useState(false);
  const [aiSearchQuery, setAiSearchQuery] = useState('');
  const [aiSearchEngine, setAiSearchEngine] = useState('');
  const [clocksVisible, setClocksVisible] = useState<boolean>(() => {
    return localStorage.getItem('navatation_clocks_visible') !== '0';
  });
  const [calendarVisible, setCalendarVisible] = useState<boolean>(() => localStorage.getItem('navatation_calendar_visible') !== '0');


  const [weatherVisible, setWeatherVisible] = useState<boolean>(() => localStorage.getItem('navatation_weather_visible') !== '0');

  const [isWidgetGalleryOpen, setIsWidgetGalleryOpen] = useState(false);

  /**
   * 处理 AI 搜索请求，打开 AI 搜索面板
   */
  const handleAiSearch = useCallback((query: string, engine: string) => {
    setAiSearchQuery(query);
    setAiSearchEngine(engine);
    setIsAiSearchOpen(true);
  }, []);

  /**
   * 切换时钟组件可见性
   */
  const handleToggleClockVisibility = useCallback(() => {
    setClocksVisible(prev => {
      const next = !prev;
      localStorage.setItem('navatation_clocks_visible', next ? '1' : '0');
      return next;
    });
  }, []);

  const handleToggleCalendarVisibility = useCallback(() => setCalendarVisible(prev => { localStorage.setItem('navatation_calendar_visible', !prev ? '1' : '0'); return !prev; }), []);

  const handleToggleTimerVisibility = useCallback(() => setTimerVisible(prev => { localStorage.setItem('navatation_timer_visible', !prev ? '1' : '0'); return !prev; }), []);

  const handleToggleBreatheVisibility = useCallback(() => setBreatheVisible(prev => { localStorage.setItem('navatation_breathe_visible', !prev ? '1' : '0'); return !prev; }), []);

  const handleToggleWeatherVisibility = useCallback(() => setWeatherVisible(prev => { localStorage.setItem('navatation_weather_visible', !prev ? '1' : '0'); return !prev; }), []);

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
  const homeShortcutsData = useHomeShortcuts(authState);
  // 3. 解构解耦业务逻辑
  const {
    setShortcuts,
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
    handleStartEdit,
    handleEditShortcut,
  } = shortcutsData;

  // 解构首页图标数据
  const {
    homeShortcuts,
    setHomeShortcuts,
    tempHomeShortcuts,
    setTempHomeShortcuts,
    fetchHomeShortcuts,
    handleSaveHomeShortcuts,
  } = homeShortcutsData;

  const settingsData = useSettings(authState, theme || 'light', setTheme, searchEngine, setSearchEngine);
  const brightnessData = useBrightness(theme || 'light', setTheme, authState);
  const widgetsData = useWidgets(isEditMode, authState);

  const {
    widgets,
    setWidgets, // 解构出 setWidgets 供依赖项使用，避免直接依赖整个 widgetsData 对象
    tempWidgets,
    setTempWidgets, // 解构出 setTempWidgets 供依赖项使用，避免直接依赖整个 widgetsData 对象
    addWidget,
    removeWidget,
    updateWidgetPosition,
    updateWidgetMeta,
    saveWidgets,
    cancelWidgets,
  } = widgetsData;

  const {
    backgroundImage,
    setBackgroundImage,
    settings,
    setSettings, // 解构出 setSettings 供依赖项使用，避免直接依赖整个 settingsData 对象
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
    setIsBrightnessClosing,
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

  useAppInit(
    authState,
    setIsEditMode,
    setBackgroundImage,
    setShortcuts,
    setTempShortcuts,
    setWidgets,
    setTempWidgets,
    setSettings,
    setHomeShortcuts,
    setTempHomeShortcuts
  );

  // 统一保存与取消逻辑
  const handleSaveEdits = useCallback(async () => {
    saveWidgets();
    await handleSaveHomeShortcuts();
    setIsEditMode(false);
    setEditingShortcut(null);
  }, [handleSaveHomeShortcuts, saveWidgets, setIsEditMode, setEditingShortcut]);

  const handleCancelEdits = useCallback(() => {
    setTempHomeShortcuts([...homeShortcuts]);
    cancelWidgets();
    setIsEditMode(false);
    setEditingShortcut(null);
  }, [homeShortcuts, setTempHomeShortcuts, cancelWidgets, setIsEditMode, setEditingShortcut]);

  // 全局键盘交互优化：编辑模式下且无弹窗遮挡时，支持 ESC 取消、Enter 保存
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isAnyModalOpen =
        isSettingsOpen ||
        isAddShortcutOpen ||
        isLoginOpen ||
        isLogoutConfirmOpen ||
        isManageHomepageOpen ||
        isAiSearchOpen;

      if (isEditMode && !isAnyModalOpen) {
        if (e.key === 'Escape') {
          e.preventDefault();
          handleCancelEdits();
        } else if (e.key === 'Enter') {
          e.preventDefault();
          handleSaveEdits();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isEditMode,
    isSettingsOpen,
    isAddShortcutOpen,
    isLoginOpen,
    isLogoutConfirmOpen,
    isManageHomepageOpen,
    isAiSearchOpen,
    handleCancelEdits,
    handleSaveEdits,
  ]);

  // 悬停交互事件融合防重发
  const handleMouseEnterOtherWidgetCombined = useCallback(() => {
    handleMouseEnterOtherWidget();
  }, [handleMouseEnterOtherWidget]);

  const handleMouseEnterThemeCombined = useCallback(() => {
    handleMouseEnterTheme();
  }, [handleMouseEnterTheme]);

  const handleTriggerCloseClock = useCallback(() => {
    setIsWidgetGalleryOpen(false);
  }, []);

  const handleDragEnd = useCallback(() => {
    if (!isEditMode) saveWidgets();
  }, [isEditMode, saveWidgets]);

  const {
    activeDraggingId,
    setActiveDraggingId,
    dragOffset,
    setDragOffset,
    activeDraggingStyleRef,
    menuDraggingStyle,
    menuDragPos,
    menuDragHasMoved,
    handleDragStartFromMenu
  } = useWidgetDrag({ 
    addWidget, 
    updateWidgetPosition, 
    triggerCloseClock: handleTriggerCloseClock,
    onDragEnd: handleDragEnd
  });





  /**
   * 处理搜索引擎变更
   */
  // 首页图标添加处理（添加到 tempHomeShortcuts）
  const handleAddHomeShortcuts = useCallback((newShortcuts: any[]) => {
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
    setTempHomeShortcuts(prev => [...prev, ...formatted]);
  }, [setTempHomeShortcuts]);

  const handleSearchEngineChange = (engine: string) => {
    setSearchEngine(engine);
    localStorage.setItem('navatation_search_engine', engine);
    if (authState.isLoggedIn) {
      const { settingsService } = require('./services/settings-service');
      settingsService.patchSettings({ searchEngine: engine }).catch(console.error);
    }
  };

  /**
   * 处理登出逻辑
   */
  const handleLogout = () => {
    authStore.logout();
  };

  const iconInnerSize = settings.iconSize * 0.5;
  const borderRadius = `${settings.iconRadius}%`;

  // 首页图标使用 home shortcuts 数据
  const displayShortcuts = isEditMode ? tempHomeShortcuts : homeShortcuts;

  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  /**
   * 处理网格捷径拖拽开始
   */
  const handleDragStartGrid = useCallback((event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  }, []);

  /**
   * 处理网格捷径拖拽结束
   */
  const handleDragEndGrid = useCallback((event: DragEndEvent) => {
    setActiveDragId(null);
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = displayShortcuts.findIndex((item, idx) => (item.dragId || `shortcut-edit-${idx}`) === active.id);
      const newIndex = displayShortcuts.findIndex((item, idx) => (item.dragId || `shortcut-edit-${idx}`) === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newItems = arrayMove(displayShortcuts, oldIndex, newIndex);
        if (isEditMode) {
          setTempHomeShortcuts(newItems);
        } else {
          setHomeShortcuts(newItems);
        }
      }
    }
  }, [isEditMode, displayShortcuts, setTempHomeShortcuts, setHomeShortcuts]);

  /**
   * 处理网格捷径拖拽取消
   */
  const handleDragCancelGrid = useCallback(() => {
    setActiveDragId(null);
  }, []);

  // 首页图标删除处理（操作 tempHomeShortcuts）
  const handleDeleteHomeShortcut = useCallback((index: number) => {
    setTempHomeShortcuts(prev => prev.filter((_, i) => i !== index));
  }, [setTempHomeShortcuts]);

  // 首页图标单项编辑保存（操作 tempHomeShortcuts）
  const handleSaveHomeShortcutEdit = useCallback((updatedShortcut: { name: string; url: string; iconType: string; iconValue: string }) => {
    if (editingShortcut) {
      setTempHomeShortcuts(prev => {
        const newShortcuts = [...prev];
        newShortcuts[editingShortcut.index] = {
          ...newShortcuts[editingShortcut.index],
          name: updatedShortcut.name,
          url: updatedShortcut.url,
          iconType: updatedShortcut.iconType,
          iconValue: updatedShortcut.iconValue,
        };
        return newShortcuts;
      });
      setEditingShortcut(null);
    }
  }, [editingShortcut, setTempHomeShortcuts, setEditingShortcut]);

  const activeDragShortcut = activeDragId ? displayShortcuts.find((s, idx) => (s.dragId || `shortcut-edit-${idx}`) === activeDragId) : null;

  return (
    <ContextMenu>
      <ContextMenuTrigger className="size-full relative flex flex-col items-center justify-start overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-500"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            filter: theme === 'dark' ? `brightness(${bgBrightness}%)` : 'none',
          }}
        />

        {/* Pixelated Dot Grid Layer */}
        <div 
          className={`absolute inset-0 pointer-events-none transition-opacity duration-500 z-0 ${isEditMode ? 'opacity-100' : 'opacity-0'}`}
          style={{
            backgroundImage: theme === 'dark' 
              ? 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)' 
              : 'radial-gradient(circle, rgba(0,0,0,0.1) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />

        {/* Widgets Rendering */}
        <WidgetLayer
          isEditMode={isEditMode}
          tempWidgets={tempWidgets}
          widgets={widgets}
          clocksVisible={clocksVisible}
          calendarVisible={calendarVisible}
          weatherVisible={weatherVisible}
          activeDraggingId={activeDraggingId}
          activeDraggingStyleRef={activeDraggingStyleRef}
          setActiveDraggingId={setActiveDraggingId}
          setDragOffset={setDragOffset}
          removeWidget={removeWidget}
          updateWidgetMeta={updateWidgetMeta}
        />

        {menuDraggingStyle && menuDragHasMoved && (
          <div
            className="absolute pointer-events-none opacity-60 z-[200] select-none border border-dashed border-blue-500/60 p-1 rounded-3xl bg-blue-500/5 shadow-xl"
            style={{
              left: `${menuDragPos.x}px`,
              top: `${menuDragPos.y}px`,
            }}
          >
            {menuDraggingStyle === 'analog' && <AnalogClock />}
            {menuDraggingStyle === 'traditional' && <TraditionalClock />}
            {menuDraggingStyle === 'digital' && <DigitalClock />}
            {menuDraggingStyle === 'flip' && <FlipClock />}
            {menuDraggingStyle === 'flip-seconds' && <FlipClockSeconds />}
            {menuDraggingStyle === 'pomodoro' && (
              <div className="w-[180px] h-[220px] rounded-3xl border-2 border-widget-border bg-widget-bg backdrop-blur-md" />
            )}
            {menuDraggingStyle === 'breathe' && (
              <div className="w-[160px] h-[160px] rounded-[2rem] border-2 border-widget-border bg-widget-bg backdrop-blur-md" />
            )}
            {menuDraggingStyle === 'month' && (
              <div className="w-[200px] h-[220px] rounded-3xl border-2 border-widget-border bg-widget-bg backdrop-blur-md" />
            )}
            {menuDraggingStyle === 'simple' && (
              <div className="w-[140px] h-[140px] rounded-3xl border-2 border-widget-border bg-widget-bg backdrop-blur-md" />
            )}
          </div>
        )}

        {/* Todo Widget */}
        <TodoListWidget onOpenTodoPanel={() => setIsTodoOpen(true)} />

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
            clocksVisible={clocksVisible}
            onToggleClockVisibility={handleToggleClockVisibility}
            onOpenWidgetGallery={() => setIsWidgetGalleryOpen(true)}
            brightnessPanel={
              <BrightnessPanel
                isBrightnessOpen={isBrightnessOpen}
                isBrightnessClosing={isBrightnessClosing}
                theme={theme || 'light'}
                bgBrightness={bgBrightness}
                setBgBrightness={setBgBrightness}
                setIsHoveringBrightness={setIsHoveringBrightness}
                setIsBrightnessClosing={setIsBrightnessClosing}
                clearBrightnessTimer={clearBrightnessTimer}
                brightnessTimerRef={brightnessTimerRef}
                triggerCloseBrightness={triggerCloseBrightness}
              />
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
          <ShortcutGrid
            settings={settings}
            isEditMode={isEditMode}
            displayShortcuts={displayShortcuts}
            sensors={sensors}
            handleDragStartGrid={handleDragStartGrid}
            handleDragEndGrid={handleDragEndGrid}
            handleDragCancelGrid={handleDragCancelGrid}
            activeDragShortcut={activeDragShortcut}
            handleEditShortcut={handleEditShortcut}
            handleDeleteShortcut={handleDeleteHomeShortcut}
            setIsAddShortcutOpen={setIsAddShortcutOpen}
          />
        </div>

        {/* Bottom Right Controls */}
        <BottomRightDock
          isEditMode={isEditMode}
          authState={authState}
          handleCancelEdits={handleCancelEdits}
          handleSaveEdits={handleSaveEdits}
          handleStartEdit={handleStartEdit}
          handleOpenSettings={handleOpenSettings}
          setIsLogoutConfirmOpen={setIsLogoutConfirmOpen}
          setIsLoginOpen={setIsLoginOpen}
          setIsManageHomepageOpen={setIsManageHomepageOpen}
        />

      </ContextMenuTrigger>

        {/* Dialogs */}
        <AppDialogs
          isSettingsOpen={isSettingsOpen}
          handleCloseSettings={handleCloseSettings}
          handleSaveSettings={handleSaveSettings}
          handlePreviewSettings={handlePreviewSettings}
          settings={settings}
          backgroundImage={backgroundImage}
          theme={theme || 'light'}
          isLoginOpen={isLoginOpen}
          setIsLoginOpen={setIsLoginOpen}
          isTodoOpen={isTodoOpen}
          setIsTodoOpen={setIsTodoOpen}
          isLogoutConfirmOpen={isLogoutConfirmOpen}
          setIsLogoutConfirmOpen={setIsLogoutConfirmOpen}
          handleLogout={handleLogout}
          authState={authState}
          isAddShortcutOpen={isAddShortcutOpen}
          setIsAddShortcutOpen={setIsAddShortcutOpen}
          handleAddShortcuts={handleAddHomeShortcuts}
          editingShortcut={editingShortcut}
          setEditingShortcut={setEditingShortcut}
          handleSaveEdit={handleSaveHomeShortcutEdit}
          isManageHomepageOpen={isManageHomepageOpen}
          setIsManageHomepageOpen={setIsManageHomepageOpen}
          shortcuts={homeShortcuts}
          fetchShortcuts={fetchHomeShortcuts}
          isAiSearchOpen={isAiSearchOpen}
          setIsAiSearchOpen={setIsAiSearchOpen}
          aiSearchQuery={aiSearchQuery}
          aiSearchEngine={aiSearchEngine}
        />

        <ContextMenuContent className="w-56 z-[100] bg-widget-bg/95 backdrop-blur-xl border border-widget-border text-foreground shadow-2xl p-1.5 rounded-xl">
          <ContextMenuItem onClick={handleStartEdit} className="gap-3 cursor-pointer rounded-lg p-2.5 text-[15px] font-medium transition-colors">
            <Edit3 className="w-[18px] h-[18px] text-muted-foreground" />
            <span>编辑布局</span>
          </ContextMenuItem>
          <ContextMenuItem onClick={() => handleOpenSettings()} className="gap-3 cursor-pointer rounded-lg p-2.5 text-[15px] font-medium transition-colors">
            <Settings className="w-[18px] h-[18px] text-muted-foreground" />
            <span>个性化设置</span>
          </ContextMenuItem>
          <ContextMenuItem onClick={() => setIsAddShortcutOpen(true)} className="gap-3 cursor-pointer rounded-lg p-2.5 text-[15px] font-medium transition-colors">
            <Plus className="w-[18px] h-[18px] text-muted-foreground" />
            <span>添加网址</span>
          </ContextMenuItem>
          <ContextMenuSeparator className="bg-border/60 my-1.5" />
          <ContextMenuItem onClick={handleToggleTheme} className="gap-3 cursor-pointer rounded-lg p-2.5 text-[15px] font-medium transition-colors">
            {theme === 'dark' ? <Sun className="w-[18px] h-[18px] text-muted-foreground" /> : <Moon className="w-[18px] h-[18px] text-muted-foreground" />}
            <span>切换{theme === 'dark' ? '浅色' : '深色'}主题</span>
          </ContextMenuItem>
          <ContextMenuItem onClick={() => setIsTodoOpen(true)} className="gap-3 cursor-pointer rounded-lg p-2.5 text-[15px] font-medium transition-colors">
            <ListTodo className="w-[18px] h-[18px] text-muted-foreground" />
            <span>待办事项</span>
          </ContextMenuItem>
        </ContextMenuContent>
  
      {/* Widget Gallery Modal */}
      <WidgetGalleryModal 
        isOpen={isWidgetGalleryOpen} 
        onClose={() => setIsWidgetGalleryOpen(false)} 
        onDragStart={handleDragStartFromMenu} 
        isHidden={menuDragHasMoved}
      />
    </ContextMenu>
  );
}
