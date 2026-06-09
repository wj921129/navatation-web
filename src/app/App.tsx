import { Plus, Edit3, Save, Settings, User, Clock, Calendar, Timer, Flower2, CloudSun, LayoutGrid } from 'lucide-react';
import { IconMap } from './components/ui/IconMap';
import { useState, useEffect, useCallback } from 'react';
import { SettingsDialog } from './components/settings/SettingsDialog';
import { LoginDialog } from './components/auth/LoginDialog';
import { AddShortcutDialog } from './components/shortcut/AddShortcutDialog';
import { EditShortcutDialog } from './components/shortcut/EditShortcutDialog';
import { ManageHomepageShortcutsDialog } from './components/shortcut/ManageHomepageShortcutsDialog';
import { LogoutConfirmDialog } from './components/auth/LogoutConfirmDialog';
import { TodoPanel } from './components/todo/TodoPanel';
import { TopDock } from './components/dock/TopDock';
import { TodoListWidget } from './components/todo/TodoListWidget';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useTheme } from 'next-themes';
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
import { DraggableShortcut } from './components/shortcut/DraggableShortcut';
import { AiSearchOverlay } from './components/search/AiSearchOverlay';

import { useBrightness } from './hooks/useBrightness';
import { useSettings } from './hooks/useSettings';
import { useShortcuts } from './hooks/useShortcuts';
import { publicService } from './services/public-service';

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

  const [activeDraggingId, setActiveDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const activeDraggingStyleRef = useRef<'analog' | 'digital' | 'flip' | 'traditional' | 'pomodoro' | 'breathe' | 'month' | 'simple' | null>(null);

  // Menu drag-and-drop state & refs
  const [menuDraggingStyle, setMenuDraggingStyle] = useState<'analog' | 'digital' | 'flip' | 'traditional' | 'pomodoro' | 'breathe' | 'month' | 'simple' | null>(null);
  const [menuDragPos, setMenuDragPos] = useState({ x: 0, y: 0 });
  const [menuDragHasMoved, setMenuDragHasMoved] = useState(false);
  const menuDragStartPosRef = useRef({ x: 0, y: 0 });
  const menuDragHasMovedRef = useRef(false);
  const menuDraggingStyleRef = useRef<'analog' | 'digital' | 'flip' | 'traditional' | 'pomodoro' | 'breathe' | 'month' | 'simple' | null>(null);


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
    } else if (style === 'pomodoro') {
      clockWidth = 180;
      clockHeight = 220;
    } else if (style === 'breathe') {
      clockWidth = 160;
      clockHeight = 160;
    } else if (style === 'month') {
      clockWidth = 200;
      clockHeight = 220;
    } else if (style === 'simple') {
      clockWidth = 140;
      clockHeight = 140;
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
        } else if (style === 'pomodoro') {
          clockWidth = 180;
          clockHeight = 220;
        } else if (style === 'breathe') {
          clockWidth = 160;
          clockHeight = 160;
        } else if (style === 'month') {
          clockWidth = 200;
          clockHeight = 220;
        } else if (style === 'simple') {
          clockWidth = 140;
          clockHeight = 140;
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
        let type = 'clock';
        if (style === 'pomodoro') type = 'pomodoro';
        if (style === 'breathe') type = 'breathe';
        if (style === 'month') type = 'calendar';
        if (style === 'simple') type = 'weather';
        addWidget(type, style, xPercent, yPercent);
      } else {
        let type = 'clock';
        if (style === 'pomodoro') type = 'pomodoro';
        if (style === 'breathe') type = 'breathe';
        if (style === 'month') type = 'calendar';
        if (style === 'simple') type = 'weather';
        addWidget(type, style, 40, 30);
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

  const handleDragStartFromMenu = useCallback((e: React.PointerEvent<HTMLButtonElement>, style: 'analog' | 'digital' | 'flip' | 'traditional' | 'pomodoro' | 'breathe' | 'month' | 'simple') => {
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
    } else if (style === 'pomodoro') {
      clockWidth = 180;
      clockHeight = 220;
    } else if (style === 'breathe') {
      clockWidth = 160;
      clockHeight = 160;
    } else if (style === 'month') {
      clockWidth = 200;
      clockHeight = 220;
    } else if (style === 'simple') {
      clockWidth = 140;
      clockHeight = 140;
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
    } else if (activeDraggingStyleRef.current === 'pomodoro') {
      clockWidth = 180;
      clockHeight = 220;
    } else if (activeDraggingStyleRef.current === 'breathe') {
      clockWidth = 160;
      clockHeight = 160;
    } else if (activeDraggingStyleRef.current === 'month') {
      clockWidth = 200;
      clockHeight = 220;
    } else if (activeDraggingStyleRef.current === 'simple') {
      clockWidth = 140;
      clockHeight = 140;
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

  const getCategoryBtnClass = (isActive: boolean) => `flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-medium transition-all duration-300 ease-out cursor-pointer ${
    isActive
      ? 'bg-widget-bg text-text-primary shadow-sm border border-widget-border/30 opacity-100 scale-100'
      : isEditMode
        ? 'text-text-secondary hover:text-text-primary hover:bg-input-bg/20 border border-transparent scale-100'
        : 'text-text-secondary/60 opacity-40 border border-transparent bg-input-bg/30 shadow-inner scale-[0.96] hover:scale-[0.98] hover:opacity-60'
  }`;

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
      onMouseMove={(e) => e.stopPropagation()}
      className={`absolute top-[71px] left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-[30px] text-text-primary select-none cursor-default whitespace-nowrap transition-all duration-300 pointer-events-auto ${
        isClockClosing ? 'brightness-panel-exit' : 'brightness-panel-enter'
      }`}
    >
      {/* 级联菜单：第二级分类栏 */}
      <div className="w-fit bg-widget-bg/95 border border-widget-border shadow-xl backdrop-blur-xl rounded-2xl p-1.5 flex items-center justify-center">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-input-bg/40 border border-widget-border/40 w-fit justify-between">
          <button
            onMouseEnter={() => isEditMode && setActiveCategory('clock')}
            onClick={() => !isEditMode && handleToggleClockVisibility()}
            className={getCategoryBtnClass(isEditMode ? activeCategory === 'clock' : clocksVisible)}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>时钟</span>
          </button>

          <button
            onMouseEnter={() => isEditMode && setActiveCategory('calendar')}
            onClick={() => !isEditMode && handleToggleCalendarVisibility()}
            className={getCategoryBtnClass(isEditMode ? activeCategory === 'calendar' : calendarVisible)}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>日历</span>
          </button>

          <button
            onMouseEnter={() => isEditMode && setActiveCategory('timer')}
            onClick={() => !isEditMode && handleToggleTimerVisibility()}
            className={getCategoryBtnClass(isEditMode ? activeCategory === 'timer' : timerVisible)}
          >
            <Timer className="w-3.5 h-3.5" />
            <span>计时器</span>
          </button>

          <button
            onMouseEnter={() => isEditMode && setActiveCategory('breathe')}
            onClick={() => !isEditMode && handleToggleBreatheVisibility()}
            className={getCategoryBtnClass(isEditMode ? activeCategory === 'breathe' : breatheVisible)}
          >
            <Flower2 className="w-3.5 h-3.5" />
            <span>冥想</span>
          </button>

          <button
            onMouseEnter={() => isEditMode && setActiveCategory('weather')}
            onClick={() => !isEditMode && handleToggleWeatherVisibility()}
            className={getCategoryBtnClass(isEditMode ? activeCategory === 'weather' : weatherVisible)}
          >
            <CloudSun className="w-3.5 h-3.5" />
            <span>天气</span>
          </button>
        </div>
      </div>

      {/* 级联菜单：第三级具体功能栏 - 仅编辑模式下显示 */}
      {isEditMode && (
        <div className="relative w-fit bg-widget-bg/95 border border-widget-border shadow-xl backdrop-blur-xl rounded-2xl p-3 flex items-center justify-center min-h-[82px] transition-all duration-300">
        {activeCategory === 'clock' && (
          <div className="flex items-center gap-3 animate-fade-in">
            {/* Analog style */}
            <button
              onPointerDown={(e) => handleDragStartFromMenu(e, 'analog')}
              className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-input-bg/50 transition-colors cursor-grab active:cursor-grabbing group/btn"
            >
              <div className="w-12 h-12 rounded-full border border-widget-border group-hover/btn:border-text-primary flex items-center justify-center relative bg-input-bg/20 shadow-sm transition-all">
                <div className="w-0.5 h-4 bg-text-primary absolute top-2 rounded-full" />
                <div className="w-3 h-0.5 bg-text-primary absolute top-6 left-6 rounded-full" />
                <div className="w-1 h-1 rounded-full bg-red-500 absolute top-[23px] left-[23px]" />
              </div>
              <span className="text-[10px] text-text-secondary font-light group-hover/btn:text-text-primary">模拟</span>
            </button>

            {/* Traditional style */}
            <button
              onPointerDown={(e) => handleDragStartFromMenu(e, 'traditional')}
              className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-input-bg/50 transition-colors cursor-grab active:cursor-grabbing group/btn"
            >
              <div className="w-12 h-12 rounded-full border border-widget-border group-hover/btn:border-text-primary flex items-center justify-center relative bg-input-bg/20 shadow-sm transition-all">
                <span className="text-[8px] font-bold text-text-secondary group-hover/btn:text-text-primary absolute top-0.5">12</span>
                <span className="text-[8px] font-bold text-text-secondary group-hover/btn:text-text-primary absolute bottom-0.5">6</span>
                <span className="text-[8px] font-bold text-text-secondary group-hover/btn:text-text-primary absolute left-0.5">9</span>
                <span className="text-[8px] font-bold text-text-secondary group-hover/btn:text-text-primary absolute right-0.5">3</span>
                <div className="w-0.5 h-3 bg-text-secondary group-hover/btn:bg-text-primary absolute top-[16px] left-[23px] origin-bottom transform rotate-45" />
                <div className="w-0.5 h-4 bg-text-secondary group-hover/btn:bg-text-primary absolute top-[12px] left-[23px] origin-bottom transform -rotate-12" />
              </div>
              <span className="text-[10px] text-text-secondary font-light group-hover/btn:text-text-primary">传统</span>
            </button>

            {/* Digital style */}
            <button
              onPointerDown={(e) => handleDragStartFromMenu(e, 'digital')}
              className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-input-bg/50 transition-colors cursor-grab active:cursor-grabbing group/btn"
            >
              <div className="w-16 h-12 rounded-xl border border-widget-border group-hover/btn:border-text-secondary flex flex-col items-center justify-center bg-input-bg">
                <span className="text-[10px] font-mono tracking-tight">12:00:00</span>
                <span className="text-[6px] text-text-secondary scale-90">6月3日</span>
              </div>
              <span className="text-[10px] text-text-secondary font-light group-hover/btn:text-text-primary">数字</span>
            </button>

            {/* Flip style */}
            <button
              onPointerDown={(e) => handleDragStartFromMenu(e, 'flip')}
              className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-input-bg/50 transition-colors cursor-grab active:cursor-grabbing group/btn"
            >
              <div className="w-16 h-12 flex items-center justify-center gap-1 bg-input-bg border border-widget-border group-hover/btn:border-text-secondary rounded-xl px-1">
                <div className="w-6 h-8 rounded bg-widget-bg border border-widget-border flex items-center justify-center">
                  <span className="text-[10px] font-mono font-bold">12</span>
                </div>
                <div className="w-6 h-8 rounded bg-widget-bg border border-widget-border flex items-center justify-center">
                  <span className="text-[10px] font-mono font-bold">00</span>
                </div>
              </div>
              <span className="text-[10px] text-text-secondary font-light group-hover/btn:text-text-primary">翻页</span>
            </button>
          </div>
        )}

        {activeCategory === 'calendar' && (
          <div className="flex items-center gap-3 animate-fade-in">
            {/* Month Calendar style */}
            <button
              onPointerDown={(e) => handleDragStartFromMenu(e, 'month')}
              className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-input-bg/50 transition-colors cursor-grab active:cursor-grabbing group/btn"
            >
              <div className="w-16 h-16 flex items-center justify-center relative bg-input-bg/20 border border-widget-border rounded-xl shadow-sm transition-all overflow-hidden p-1">
                <div className="w-full h-full flex flex-col gap-0.5">
                  <div className="w-full h-2 bg-blue-500/20 rounded-sm mb-1" />
                  <div className="flex justify-between w-full"><div className="w-2 h-2 rounded-sm bg-widget-border" /><div className="w-2 h-2 rounded-sm bg-widget-border" /><div className="w-2 h-2 rounded-sm bg-widget-border" /></div>
                  <div className="flex justify-between w-full"><div className="w-2 h-2 rounded-sm bg-widget-border" /><div className="w-2 h-2 rounded-sm bg-blue-500" /><div className="w-2 h-2 rounded-sm bg-widget-border" /></div>
                </div>
              </div>
              <span className="text-[10px] text-text-secondary font-light group-hover/btn:text-text-primary">月历</span>
            </button>
          </div>
        )}

        {activeCategory === 'timer' && (
          <div className="flex items-center gap-3 animate-fade-in">
            {/* Pomodoro style */}
            <button
              onPointerDown={(e) => handleDragStartFromMenu(e, 'pomodoro' as any)}
              className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-input-bg/50 transition-colors cursor-grab active:cursor-grabbing group/btn"
            >
              <div className="w-12 h-12 flex items-center justify-center relative bg-input-bg/20 border border-widget-border rounded-xl shadow-sm transition-all">
                <div className="w-8 h-8 rounded-full border-2 border-blue-500/60 group-hover/btn:border-blue-500 flex items-center justify-center">
                  <div className="w-1 h-3 bg-blue-500/60 group-hover/btn:bg-blue-500 absolute top-2" />
                </div>
              </div>
              <span className="text-[10px] text-text-secondary font-light group-hover/btn:text-text-primary">番茄钟</span>
            </button>
          </div>
        )}

        {activeCategory === 'breathe' && (
          <div className="flex items-center gap-3 animate-fade-in">
            {/* Breathe style */}
            <button
              onPointerDown={(e) => handleDragStartFromMenu(e, 'breathe' as any)}
              className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-input-bg/50 transition-colors cursor-grab active:cursor-grabbing group/btn"
            >
              <div className="w-12 h-12 flex items-center justify-center relative bg-input-bg/20 border border-widget-border rounded-xl shadow-sm transition-all">
                <div className="w-8 h-8 rounded-full border border-teal-500/30 group-hover/btn:border-teal-500 flex items-center justify-center bg-teal-500/10">
                  <div className="w-4 h-4 rounded-full bg-teal-500/40 group-hover/btn:bg-teal-500/80" />
                </div>
              </div>
              <span className="text-[10px] text-text-secondary font-light group-hover/btn:text-text-primary">冥想</span>
            </button>
          </div>
        )}

        {activeCategory === 'weather' && (
          <div className="flex items-center gap-3 animate-fade-in">
            {/* Simple Weather style */}
            <button
              onPointerDown={(e) => handleDragStartFromMenu(e, 'simple')}
              className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-input-bg/50 transition-colors cursor-grab active:cursor-grabbing group/btn"
            >
              <div className="w-16 h-16 flex items-center justify-center relative bg-input-bg/20 border border-widget-border rounded-xl shadow-sm transition-all">
                <CloudSun className="w-6 h-6 text-text-secondary group-hover/btn:text-yellow-400 transition-colors" />
              </div>
              <span className="text-[10px] text-text-secondary font-light group-hover/btn:text-text-primary">天气</span>
            </button>
          </div>
        )}
      </div>
      )}
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

  // 游客模式下自动拉取超级管理员的配置
  useEffect(() => {
    if (!authState.isLoggedIn) {
      publicService.getGuestConfig().then(res => {
        if (res.code === 200 && res.data) {
          const config = res.data;
          
          if (config.shortcuts && config.shortcuts.length > 0) {
            const loaded = config.shortcuts.map(item => ({
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
            // 写入本地游客快捷方式缓存，防止首屏加载闪跃
            localStorage.setItem('navatation_guest_shortcuts', JSON.stringify(loaded));
          }

          if (config.widgets && config.widgets.length > 0) {
            const loadedW = config.widgets.map((w: any) => ({
              id: w.widgetId || `clock-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              type: w.type,
              style: w.style,
              x: Number(w.x),
              y: Number(w.y),
              meta: w.meta || {},
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
        }
      }).catch(err => {
        console.error('Failed to load guest config:', err);
      });
    }
    // 细化依赖项，不直接依赖 widgetsData 和 settingsData 对象引用，防止每次渲染由于对象引用改变而重复拉取游客配置
  }, [authState.isLoggedIn, setShortcuts, setTempShortcuts, setWidgets, setTempWidgets, setSettings, setBackgroundImage]);

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
              // 传入 isDragging 属性，当 activeDraggingId 与当前组件 id 一致时为 true，借此动态控制 will-change 以避免毛玻璃背景闪烁
              isDragging={activeDraggingId === widget.id}
              onStartDrag={(id, style, ox, oy) => {
                activeDraggingStyleRef.current = style;
                setActiveDraggingId(id);
                setDragOffset({ x: ox, y: oy });
              }}
              onDelete={removeWidget}
            />
          ))}

        {(isEditMode ? tempWidgets : (clocksVisible ? widgets : []))
          .filter((w) => w.type === 'pomodoro')
          .map((widget) => (
            <PomodoroWidget
              key={widget.id}
              id={widget.id}
              x={widget.x}
              y={widget.y}
              isEditMode={isEditMode}
              isDragging={activeDraggingId === widget.id}
              onStartDrag={(id, type, ox, oy) => {
                activeDraggingStyleRef.current = type as any;
                setActiveDraggingId(id);
                setDragOffset({ x: ox, y: oy });
              }}
              onDelete={removeWidget}
            />
          ))}

        {(isEditMode ? tempWidgets : (clocksVisible ? widgets : []))
          .filter((w) => w.type === 'breathe')
          .map((widget) => (
            <BreatheWidget
              key={widget.id}
              id={widget.id}
              x={widget.x}
              y={widget.y}
              isEditMode={isEditMode}
              isDragging={activeDraggingId === widget.id}
              onStartDrag={(id, type, ox, oy) => {
                activeDraggingStyleRef.current = type as any;
                setActiveDraggingId(id);
                setDragOffset({ x: ox, y: oy });
              }}
              onDelete={removeWidget}
            />
          ))}

        {(isEditMode ? tempWidgets : (calendarVisible ? widgets : []))
          .filter((w) => w.type === 'calendar')
          .map((widget) => (
            <CalendarWidget
              key={widget.id}
              id={widget.id}
              style={widget.style}
              x={widget.x}
              y={widget.y}
              isEditMode={isEditMode}
              isDragging={activeDraggingId === widget.id}
              onStartDrag={(id, type, style, ox, oy) => {
                activeDraggingStyleRef.current = style as any;
                setActiveDraggingId(id);
                setDragOffset({ x: ox, y: oy });
              }}
              onDelete={removeWidget}
            />
          ))}

        {(isEditMode ? tempWidgets : (weatherVisible ? widgets : []))
          .filter((w) => w.type === 'weather')
          .map((widget) => (
            <WeatherWidget
              key={widget.id}
              id={widget.id}
              style={widget.style}
              x={widget.x}
              y={widget.y}
              isEditMode={isEditMode}
              isDragging={activeDraggingId === widget.id}
              onStartDrag={(id, type, style, ox, oy) => {
                activeDraggingStyleRef.current = style as any;
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
                  style={{ width: `${settings.iconSize + 32}px` }}
                >
                  <a
                    href={shortcut.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center w-full"
                    style={{ gap: `${settings.iconTextGap}px` }}
                  >
                    <div
                      className="bg-icon-bg border border-widget-border flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 overflow-hidden shrink-0"
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
                      className="text-white font-light tracking-wide drop-shadow-lg text-center w-full truncate px-1"
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
                style={{ gap: `${settings.iconTextGap}px`, width: `${settings.iconSize + 32}px` }}
              >
                <div
                  className="bg-icon-bg/80 border border-widget-border/80 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 cursor-pointer hover:bg-icon-bg hover:border-widget-border shrink-0"
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
                  className="text-white font-light tracking-wide drop-shadow-lg opacity-0 text-center w-full truncate px-1"
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
              {/* Manage Homepage Shortcuts Button (Admin only) */}
              {authState.isLoggedIn && authState.user?.role === 'ADMIN' ? (
                <button
                  onClick={() => setIsManageHomepageOpen(true)}
                  className="w-12 h-12 rounded-full glass-button flex items-center justify-center hover:scale-110 shadow-lg relative group"
                >
                  <LayoutGrid className="w-5 h-5 text-white" />
                  <div className="absolute bottom-full mb-2 px-3 py-1.5 bg-black/80 backdrop-blur-sm text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-all shadow-xl translate-y-2 group-hover:translate-y-0">
                    一键管理首页图标
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-x-4 border-x-transparent border-t-4 border-t-black/80" />
                  </div>
                </button>
              ) : null}

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
          iconSpacingX={settings.iconSpacingX}
          iconSpacingY={settings.iconSpacingY}
          iconTextGap={settings.iconTextGap}
          textSize={settings.textSize}
          userRole={authState.user?.role}
        />
        {editingShortcut ? (
          <EditShortcutDialog
            isOpen={!!editingShortcut}
            onClose={() => setEditingShortcut(null)}
            onSave={handleSaveEdit}
            shortcut={editingShortcut.shortcut}
          />
        ) : null}
        <ManageHomepageShortcutsDialog
          isOpen={isManageHomepageOpen}
          onClose={() => setIsManageHomepageOpen(false)}
          shortcuts={shortcuts}
          iconSize={settings.iconSize}
          iconRadius={settings.iconRadius}
          iconSpacingX={settings.iconSpacingX}
          iconSpacingY={settings.iconSpacingY}
          iconTextGap={settings.iconTextGap}
          textSize={settings.textSize}
          onSaveComplete={() => fetchShortcuts()}
        />
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