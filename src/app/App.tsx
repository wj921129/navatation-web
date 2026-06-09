/**
 * @description 前端核心业务逻辑与组件
 * @date 2026-06-10
 */
import { Plus, Edit3, Save, Settings, User, Clock, Calendar, Timer, Flower2, CloudSun, LayoutGrid } from 'lucide-react';
import { IconMap } from './components/ui/IconMap';
import { Tooltip } from './components/ui/Tooltip';
import { useState, useEffect, useCallback } from 'react';
import { AppDialogs } from './components/layout/AppDialogs';

import { TopDock } from './components/dock/TopDock';
import { WidgetLayer } from './components/layout/WidgetLayer';
import { TodoListWidget } from './components/todo/TodoListWidget';
import { useTheme } from 'next-themes';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';
import { SortableGridItem } from './components/ui/SortableGridItem';
import { GridDragOverlay } from './components/ui/GridDragOverlay';
import { authStore } from './stores/auth-store';
import { useWidgets } from './hooks/useWidgets';
import { useClockMenu } from './hooks/useClockMenu';
import ClockWidget from './components/widgets/ClockWidget';
import PomodoroWidget from './components/widgets/PomodoroWidget';
import BreatheWidget from './components/widgets/BreatheWidget';
import { useRef } from 'react';
import AnalogClock from './components/widgets/AnalogClock';
import DigitalClock from './components/widgets/DigitalClock';
import FlipClock from './components/widgets/FlipClock';
import TraditionalClock from './components/widgets/TraditionalClock';
import CalendarWidget from './components/widgets/CalendarWidget';
import WeatherWidget from './components/widgets/WeatherWidget';
import MonthCalendar from './components/widgets/MonthCalendar';
import SimpleWeather from './components/widgets/SimpleWeather';


import { SearchBox } from './components/search/SearchBox';
import { ShortcutGrid } from './components/shortcut/ShortcutGrid';
import { AiSearchOverlay } from './components/search/AiSearchOverlay';

import { useBrightness } from './hooks/useBrightness';
import { useSettings } from './hooks/useSettings';
import { useShortcuts } from './hooks/useShortcuts';
import { useAppInit } from './hooks/useAppInit';
import { publicService } from './services/public-service';

import { DEFAULT_SHORTCUTS, DEFAULT_WALLPAPER } from '../config/app.config';
import { useWidgetDrag } from './hooks/useWidgetDrag';
import { ClockMenuPanel } from './components/dock/ClockMenuPanel';/**
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
  const [timerVisible, setTimerVisible] = useState<boolean>(() => localStorage.getItem('navatation_timer_visible') !== '0');
  const [breatheVisible, setBreatheVisible] = useState<boolean>(() => localStorage.getItem('navatation_breathe_visible') !== '0');
  const [weatherVisible, setWeatherVisible] = useState<boolean>(() => localStorage.getItem('navatation_weather_visible') !== '0');
  const [activeCategory, setActiveCategory] = useState<'clock' | 'calendar' | 'timer' | 'breathe' | 'weather'>('clock');

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
  /** 切换日历组件可见性 */
  const handleToggleCalendarVisibility = useCallback(() => setCalendarVisible(prev => { localStorage.setItem('navatation_calendar_visible', !prev ? '1' : '0'); return !prev; }), []);
  /** 切换计时器组件可见性 */
  const handleToggleTimerVisibility = useCallback(() => setTimerVisible(prev => { localStorage.setItem('navatation_timer_visible', !prev ? '1' : '0'); return !prev; }), []);
  /** 切换冥想组件可见性 */
  const handleToggleBreatheVisibility = useCallback(() => setBreatheVisible(prev => { localStorage.setItem('navatation_breathe_visible', !prev ? '1' : '0'); return !prev; }), []);
  /** 切换天气组件可见性 */
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
  // 3. 解构解耦业务逻辑
  const {
    shortcuts,
    fetchShortcuts,
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
    setWidgets, // 解构出 setWidgets 供依赖项使用，避免直接依赖整个 widgetsData 对象
    tempWidgets,
    setTempWidgets, // 解构出 setTempWidgets 供依赖项使用，避免直接依赖整个 widgetsData 对象
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

  useEffect(() => {
    if (!isClockOpen) {
      setActiveCategory('clock');
    }
  }, [isClockOpen]);

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
    setSettings
  );

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
  } = useWidgetDrag({ addWidget, updateWidgetPosition, triggerCloseClock });

  const clockMenuPanel = (
    <ClockMenuPanel
      isClockOpen={isClockOpen}
      isClockClosing={isClockClosing}
      isEditMode={isEditMode}
      activeCategory={activeCategory}
      setActiveCategory={setActiveCategory}
      clocksVisible={clocksVisible}
      calendarVisible={calendarVisible}
      timerVisible={timerVisible}
      breatheVisible={breatheVisible}
      weatherVisible={weatherVisible}
      handleToggleClockVisibility={handleToggleClockVisibility}
      handleToggleCalendarVisibility={handleToggleCalendarVisibility}
      handleToggleTimerVisibility={handleToggleTimerVisibility}
      handleToggleBreatheVisibility={handleToggleBreatheVisibility}
      handleToggleWeatherVisibility={handleToggleWeatherVisibility}
      setIsHoveringClock={setIsHoveringClock}
      setIsClockClosing={setIsClockClosing}
      clearClockTimer={clearClockTimer}
      clockTimerRef={clockTimerRef}
      triggerCloseClock={triggerCloseClock}
      handleDragStartFromMenu={handleDragStartFromMenu}
    />
  );



  /**
   * 处理搜索引擎变更
   */
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

  // 编辑模式下使用临时草稿列表，非编辑模式下使用确认生效列表
  const displayShortcuts = isEditMode ? tempShortcuts : shortcuts;

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
      const oldIndex = displayShortcuts.findIndex(item => item.dragId === active.id);
      const newIndex = displayShortcuts.findIndex(item => item.dragId === over.id);
      
      const newItems = arrayMove(displayShortcuts, oldIndex, newIndex);
      if (isEditMode) {
        setTempShortcuts(newItems);
      } else {
        setShortcuts(newItems);
      }
    }
  }, [isEditMode, displayShortcuts, setTempShortcuts, setShortcuts]);

  /**
   * 处理网格捷径拖拽取消
   */
  const handleDragCancelGrid = useCallback(() => {
    setActiveDragId(null);
  }, []);

  const activeDragShortcut = activeDragId ? displayShortcuts.find(s => s.dragId === activeDragId) : null;

  return (
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
        />

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
            handleDeleteShortcut={handleDeleteShortcut}
            setIsAddShortcutOpen={setIsAddShortcutOpen}
          />
        </div>

        {/* Bottom Right Controls */}
        <div className="fixed bottom-8 right-8 flex items-center gap-4 z-30">
          {/* Edit Mode Buttons */}
          {isEditMode ? (
            <>
              {/* Cancel Button */}
              <Tooltip content="取消编辑" side="top">
                <button
                  onClick={handleCancelEdits}
                  className="w-12 h-12 rounded-full glass-button flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-5 h-5 text-white rotate-45" />
                </button>
              </Tooltip>

              {/* Save Button */}
              <Tooltip content="保存布局" side="top">
                <button
                  onClick={handleSaveEdits}
                  className="w-12 h-12 rounded-full bg-green-500/80 backdrop-blur-xl border border-green-400/50 flex items-center justify-center hover:bg-green-600 hover:scale-110 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Save className="w-5 h-5 text-white" />
                </button>
              </Tooltip>
            </>
          ) : (
            <>
              {/* Manage Homepage Shortcuts Button (Admin only) */}
              {authState.isLoggedIn && authState.user?.role === 'ADMIN' ? (
                <Tooltip content="管理首页图标" side="top">
                  <button
                    onClick={() => setIsManageHomepageOpen(true)}
                    className="w-12 h-12 rounded-full glass-button flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg hover:shadow-xl"
                  >
                    <LayoutGrid className="w-5 h-5 text-white" />
                  </button>
                </Tooltip>
              ) : null}

              {/* Edit Button */}
              {authState.isLoggedIn ? (
                <Tooltip content="编辑布局" side="top">
                  <button
                    onClick={handleStartEdit}
                    className="w-12 h-12 rounded-full glass-button flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg hover:shadow-xl"
                  >
                    <Edit3 className="w-5 h-5 text-white" />
                  </button>
                </Tooltip>
              ) : null}

              {/* Settings Button */}
              <Tooltip content="个性化设置" side="top">
                <button
                  onClick={handleOpenSettings}
                  className="w-12 h-12 rounded-full glass-button flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg hover:shadow-xl"
                >
                  <Settings className="w-5 h-5 text-white" />
                </button>
              </Tooltip>

              {/* Account Button */}
              <Tooltip content={authState.isLoggedIn ? "账号设置" : "登录/注册"} side="top">
                <button
                  onClick={() => authState.isLoggedIn ? setIsLogoutConfirmOpen(true) : setIsLoginOpen(true)}
                  className="w-12 h-12 rounded-full glass-button flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg hover:shadow-xl relative"
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
              </Tooltip>
            </>
          )}
        </div>

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
          handleAddShortcuts={handleAddShortcuts}
          editingShortcut={editingShortcut}
          setEditingShortcut={setEditingShortcut}
          handleSaveEdit={handleSaveEdit}
          isManageHomepageOpen={isManageHomepageOpen}
          setIsManageHomepageOpen={setIsManageHomepageOpen}
          shortcuts={shortcuts}
          fetchShortcuts={fetchShortcuts}
          isAiSearchOpen={isAiSearchOpen}
          setIsAiSearchOpen={setIsAiSearchOpen}
          aiSearchQuery={aiSearchQuery}
          aiSearchEngine={aiSearchEngine}
        />
      </div>
  );
}