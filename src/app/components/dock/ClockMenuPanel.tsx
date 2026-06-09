/**
 * @description 前端UI组件：ClockMenuPanel.tsx
 * @date 2026-06-10
 */
import React from 'react';
import { Clock, Calendar, Timer, Flower2, CloudSun } from 'lucide-react';

interface ClockMenuPanelProps {
  isClockOpen: boolean;
  isClockClosing: boolean;
  isEditMode: boolean;
  activeCategory: 'clock' | 'calendar' | 'timer' | 'breathe' | 'weather';
  setActiveCategory: (category: 'clock' | 'calendar' | 'timer' | 'breathe' | 'weather') => void;
  clocksVisible: boolean;
  calendarVisible: boolean;
  timerVisible: boolean;
  breatheVisible: boolean;
  weatherVisible: boolean;
  handleToggleClockVisibility: () => void;
  handleToggleCalendarVisibility: () => void;
  handleToggleTimerVisibility: () => void;
  handleToggleBreatheVisibility: () => void;
  handleToggleWeatherVisibility: () => void;
  setIsHoveringClock: (hovering: boolean) => void;
  setIsClockClosing: (closing: boolean) => void;
  clearClockTimer: () => void;
  clockTimerRef: React.MutableRefObject<NodeJS.Timeout | null>;
  triggerCloseClock: () => void;
  handleDragStartFromMenu: (e: React.PointerEvent<HTMLButtonElement>, style: 'analog' | 'digital' | 'flip' | 'traditional' | 'pomodoro' | 'breathe' | 'month' | 'simple') => void;
}

export const ClockMenuPanel: React.FC<ClockMenuPanelProps> = ({
  isClockOpen,
  isClockClosing,
  isEditMode,
  activeCategory,
  setActiveCategory,
  clocksVisible,
  calendarVisible,
  timerVisible,
  breatheVisible,
  weatherVisible,
  handleToggleClockVisibility,
  handleToggleCalendarVisibility,
  handleToggleTimerVisibility,
  handleToggleBreatheVisibility,
  handleToggleWeatherVisibility,
  setIsHoveringClock,
  setIsClockClosing,
  clearClockTimer,
  clockTimerRef,
  triggerCloseClock,
  handleDragStartFromMenu
}) => {
  if (!isClockOpen) {
    return null;
  }

  /**
   * 获取分类按钮样式
   */
  const getCategoryBtnClass = (isActive: boolean) => {
    return `flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-medium transition-all duration-300 ease-out cursor-pointer ${
      isActive
        ? 'bg-widget-bg text-text-primary shadow-sm border border-widget-border/30 opacity-100 scale-100'
        : isEditMode
          ? 'text-text-secondary hover:text-text-primary hover:bg-input-bg/20 border border-transparent scale-100'
          : 'text-text-secondary/60 opacity-40 border border-transparent bg-input-bg/30 shadow-inner scale-[0.96] hover:scale-[0.98] hover:opacity-60'
    }`;
  };

  return (
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
      <div className="w-fit bg-widget-bg/95 border border-widget-border shadow-xl backdrop-blur-xl rounded-2xl p-1.5 flex items-center justify-center">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-input-bg/40 border border-widget-border/40 w-fit justify-between">
          <button
            onMouseEnter={() => { if (isEditMode) setActiveCategory('clock'); }}
            onClick={() => { if (!isEditMode) handleToggleClockVisibility(); }}
            className={getCategoryBtnClass(isEditMode ? activeCategory === 'clock' : clocksVisible)}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>时钟</span>
          </button>

          <button
            onMouseEnter={() => { if (isEditMode) setActiveCategory('calendar'); }}
            onClick={() => { if (!isEditMode) handleToggleCalendarVisibility(); }}
            className={getCategoryBtnClass(isEditMode ? activeCategory === 'calendar' : calendarVisible)}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>日历</span>
          </button>

          <button
            onMouseEnter={() => { if (isEditMode) setActiveCategory('timer'); }}
            onClick={() => { if (!isEditMode) handleToggleTimerVisibility(); }}
            className={getCategoryBtnClass(isEditMode ? activeCategory === 'timer' : timerVisible)}
          >
            <Timer className="w-3.5 h-3.5" />
            <span>计时器</span>
          </button>

          <button
            onMouseEnter={() => { if (isEditMode) setActiveCategory('breathe'); }}
            onClick={() => { if (!isEditMode) handleToggleBreatheVisibility(); }}
            className={getCategoryBtnClass(isEditMode ? activeCategory === 'breathe' : breatheVisible)}
          >
            <Flower2 className="w-3.5 h-3.5" />
            <span>冥想</span>
          </button>

          <button
            onMouseEnter={() => { if (isEditMode) setActiveCategory('weather'); }}
            onClick={() => { if (!isEditMode) handleToggleWeatherVisibility(); }}
            className={getCategoryBtnClass(isEditMode ? activeCategory === 'weather' : weatherVisible)}
          >
            <CloudSun className="w-3.5 h-3.5" />
            <span>天气</span>
          </button>
        </div>
      </div>

      {isEditMode && (
        <div className="relative w-fit bg-widget-bg/95 border border-widget-border shadow-xl backdrop-blur-xl rounded-2xl p-3 flex items-center justify-center min-h-[82px] transition-all duration-300">
        {activeCategory === 'clock' && (
          <div className="flex items-center gap-3 animate-fade-in">
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
            <button
              onPointerDown={(e) => handleDragStartFromMenu(e, 'pomodoro')}
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
            <button
              onPointerDown={(e) => handleDragStartFromMenu(e, 'breathe')}
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
};
