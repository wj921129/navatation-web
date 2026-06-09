/**
 * @description ǰ�˺���ҵ���߼������
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
import { BottomRightDock } from './components/dock/BottomRightDock';
import { BrightnessPanel } from './components/dock/BrightnessPanel';

import { useBrightness } from './hooks/useBrightness';
import { useSettings } from './hooks/useSettings';
import { useShortcuts } from './hooks/useShortcuts';
import { useAppInit } from './hooks/useAppInit';
import { publicService } from './services/public-service';

import { DEFAULT_SHORTCUTS, DEFAULT_WALLPAPER } from '../config/app.config';
import { useWidgetDrag } from './hooks/useWidgetDrag';
import { ClockMenuPanel } from './components/dock/ClockMenuPanel';/**
 * 文件名：App.tsx
 * 描述：应用主组件，负责布局、搜索、捷径卡片展示与编辑、系统设置等核心功能�?
 * 通过自定�?Hooks (useShortcuts, useSettings, useBrightness) 进行复杂业务解耦，确保高维护性�?
 * 创建时间�?026-06-09
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
   * 切换时钟组件可见�?
   */
  const handleToggleClockVisibility = useCallback(() => {
    setClocksVisible(prev => {
      const next = !prev;
      localStorage.setItem('navatation_clocks_visible', next ? '1' : '0');
      return next;
    });
  }, []);
  /** 切换日历组件可见�?*/
  const handleToggleCalendarVisibility = useCallback(() => setCalendarVisible(prev => { localStorage.setItem('navatation_calendar_visible', !prev ? '1' : '0'); return !prev; }), []);
  /** 切换计时器组件可见�?*/
  const handleToggleTimerVisibility = useCallback(() => setTimerVisible(prev => { localStorage.setItem('navatation_timer_visible', !prev ? '1' : '0'); return !prev; }), []);
  /** 切换冥想组件可见�?*/
  const handleToggleBreatheVisibility = useCallback(() => setBreatheVisible(prev => { localStorage.setItem('navatation_breathe_visible', !prev ? '1' : '0'); return !prev; }), []);
  /** 切换天气组件可见�?*/
  const handleToggleWeatherVisibility = useCallback(() => setWeatherVisible(prev => { localStorage.setItem('navatation_weather_visible', !prev ? '1' : '0'); return !prev; }), []);

  // 1. 订阅登录状�?
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
    setWidgets, // 解构�?setWidgets 供依赖项使用，避免直接依赖整�?widgetsData 对象
    tempWidgets,
    setTempWidgets, // 解构�?setTempWidgets 供依赖项使用，避免直接依赖整�?widgetsData 对象
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
    setSettings, // 解构�?setSettings 供依赖项使用，避免直接依赖整�?settingsData 对象
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

  // 悬停交互事件融合防重�?
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
   * 处理网格捷径拖拽开�?
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
            handleDeleteShortcut={handleDeleteShortcut}
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
