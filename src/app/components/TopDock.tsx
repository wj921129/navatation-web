import { CheckSquare, Shuffle, Sun, Moon, Loader2, Clock } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface TopDockProps {
  theme: string;
  onToggleTodo: () => void;
  onRandomWallpaper: () => Promise<void>;
  onToggleTheme: () => void;
  onMouseEnterTheme?: () => void;
  onMouseLeaveTheme?: () => void;
  brightnessPanel?: React.ReactNode;
  onMouseEnterOtherWidget?: () => void;
  isHoveringBrightness?: boolean;
  isEditMode?: boolean;
  onMouseEnterClock?: () => void;
  onMouseLeaveClock?: () => void;
  isHoveringClockMenu?: boolean;
  clockMenuPanel?: React.ReactNode;
  clocksVisible?: boolean;
  onToggleClockVisibility?: () => void;
}

/**
 * 首页顶部快捷多功能小组件工具栏 (TopDock)
 * 采用精致的 Glassmorphism 玻璃拟态设计，集成了待办事项、随机壁纸、快捷主题切换、时钟添加小组件。
 */
export function TopDock({
  theme,
  onToggleTodo,
  onRandomWallpaper,
  onToggleTheme,
  onMouseEnterTheme,
  onMouseLeaveTheme,
  brightnessPanel,
  onMouseEnterOtherWidget,
  isHoveringBrightness = false,
  isEditMode = false,
  onMouseEnterClock,
  onMouseLeaveClock,
  isHoveringClockMenu = false,
  clockMenuPanel,
  clocksVisible = true,
  onToggleClockVisibility
}: TopDockProps) {
  const [shuffling, setShuffling] = useState(false);

  // 苹果鱼眼放大效果 (macOS Dock Magnification Effect) 相关 Refs 和事件处理器
  const containerRef = useRef<HTMLDivElement>(null);
  const item1Ref = useRef<HTMLDivElement>(null);
  const item2Ref = useRef<HTMLDivElement>(null);
  const item3Ref = useRef<HTMLDivElement>(null);
  const item4Ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;

    const mouseX = e.clientX;
    const items = [
      item1Ref.current,
      item2Ref.current,
      item3Ref.current,
      item4Ref.current
    ].filter(Boolean);

    items.forEach((item) => {
      if (!item) return;
      const rect = item.getBoundingClientRect();
      const itemCenterX = rect.left + rect.width / 2;
      const distance = Math.abs(mouseX - itemCenterX);

      // 鱼眼效果参数：最大放大倍数为 1.45 倍，影响范围为水平方向 80 像素内
      const maxScale = 1.45;
      const range = 80;

      let scale = 1.0;
      if (distance < range) {
        // 使用余弦函数（平滑钟形曲线）实现类似苹果 Dock 栏的丝滑过渡
        const t = distance / range;
        scale = 1 + (maxScale - 1) * Math.cos((t * Math.PI) / 2);
      }

      const iconWrapper = item.querySelector('.dock-icon-wrapper') as HTMLElement;
      if (iconWrapper) {
        iconWrapper.style.transform = `scale(${scale})`;
      }
    });
  };

  const handleMouseLeave = () => {
    const items = [
      item1Ref.current,
      item2Ref.current,
      item3Ref.current,
      item4Ref.current
    ].filter(Boolean);
    items.forEach((item) => {
      if (!item) return;
      const iconWrapper = item.querySelector('.dock-icon-wrapper') as HTMLElement;
      if (iconWrapper) {
        iconWrapper.style.transform = 'scale(1)';
      }
    });
  };

  // 随机壁纸触发处理器
  const handleRandomWallpaperClick = async () => {
    if (shuffling) return;
    setShuffling(true);
    try {
      await onRandomWallpaper();
    } finally {
      // 保持旋转动画至少 800ms，以防接口速度过快没有视觉动效
      setTimeout(() => setShuffling(false), 800);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="flex items-center gap-1.5 px-4 py-1 rounded-b-2xl border-t-0 border border-widget-border bg-widget-bg backdrop-blur-xl shadow-md opacity-80 hover:opacity-100 transition-opacity duration-300 cursor-default text-text-primary"
    >
      {/* 待办事项小组件 */}
      <div ref={item1Ref} className="relative group" onMouseEnter={onMouseEnterOtherWidget}>
        <button
          onClick={onToggleTodo}
          className="p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-input-bg transition-all duration-200 active:scale-95 flex items-center justify-center cursor-pointer"
          aria-label="待办事项"
        >
          <span className="dock-icon-wrapper transition-transform duration-150 ease-out flex items-center justify-center" style={{ willChange: 'transform' }}>
            <CheckSquare className="w-4 h-4" />
          </span>
        </button>
        <span className="pointer-events-none absolute top-[42px] left-1/2 -translate-x-1/2 px-2 py-1 bg-widget-bg/95 border border-widget-border text-text-primary shadow-md text-[10px] rounded opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 whitespace-nowrap z-50 backdrop-blur-md">
          待办事项
        </span>
      </div>

      <div className="w-[1px] h-4 bg-widget-border" />

      {/* 随机壁纸小组件 */}
      <div ref={item2Ref} className="relative group" onMouseEnter={onMouseEnterOtherWidget}>
        <button
          onClick={handleRandomWallpaperClick}
          className="p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-input-bg transition-all duration-200 active:scale-95 flex items-center justify-center cursor-pointer"
          aria-label="随机壁纸"
          disabled={shuffling}
        >
          <span className="dock-icon-wrapper transition-transform duration-150 ease-out flex items-center justify-center" style={{ willChange: 'transform' }}>
            {shuffling ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Shuffle className="w-4 h-4 transition-transform duration-300 group-hover:rotate-45" />
            )}
          </span>
        </button>
        <span className="pointer-events-none absolute top-[42px] left-1/2 -translate-x-1/2 px-2 py-1 bg-widget-bg/95 border border-widget-border text-text-primary shadow-md text-[10px] rounded opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 whitespace-nowrap z-50 backdrop-blur-md">
          随机壁纸
        </span>
      </div>

      <div className="w-[1px] h-4 bg-widget-border" />

      {/* 快速主题切换小组件 */}
      <div ref={item3Ref} className="relative group" onMouseEnter={onMouseEnterTheme} onMouseLeave={onMouseLeaveTheme}>
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-input-bg transition-all duration-200 active:scale-95 flex items-center justify-center cursor-pointer"
          aria-label="切换主题"
        >
          <span className="dock-icon-wrapper transition-transform duration-150 ease-out flex items-center justify-center" style={{ willChange: 'transform' }}>
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12" />
            ) : (
              <Moon className="w-4 h-4 transition-transform duration-300 group-hover:-rotate-12" />
            )}
          </span>
        </button>
        <span className={`pointer-events-none absolute top-[42px] left-1/2 -translate-x-1/2 px-2 py-1 bg-widget-bg/95 border border-widget-border text-text-primary shadow-md text-[10px] rounded opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 whitespace-nowrap z-50 backdrop-blur-md ${
          isHoveringBrightness ? '!opacity-0 !scale-95' : ''
        }`}>
          切换主题
        </span>
        {brightnessPanel}
      </div>

      <>
        <div className="w-[1px] h-4 bg-widget-border" />
        {/* 时钟小组件按钮 - 编辑模式下悬停弹出样式选单，非编辑模式下点击切换显示/隐藏 */}
        <div
          ref={item4Ref}
          className="relative group"
          onMouseEnter={isEditMode ? onMouseEnterClock : undefined}
          onMouseLeave={isEditMode ? onMouseLeaveClock : undefined}
        >
          <button
            onClick={isEditMode ? undefined : onToggleClockVisibility}
            className={`p-2 rounded-full transition-all duration-200 active:scale-95 flex items-center justify-center ${
              isEditMode
                ? 'text-text-secondary hover:text-text-primary hover:bg-input-bg cursor-pointer'
                : clocksVisible
                  ? 'text-text-secondary hover:text-text-primary hover:bg-input-bg cursor-pointer'
                  : 'text-text-secondary/40 hover:text-text-secondary hover:bg-input-bg cursor-pointer'
            }`}
            aria-label={isEditMode ? '添加时钟小组件' : clocksVisible ? '隐藏时钟' : '显示时钟'}
          >
            <span className="dock-icon-wrapper transition-transform duration-150 ease-out flex items-center justify-center" style={{ willChange: 'transform' }}>
              <Clock className="w-4 h-4" />
            </span>
          </button>
          <span className={`pointer-events-none absolute top-[42px] left-1/2 -translate-x-1/2 px-2 py-1 bg-widget-bg/95 border border-widget-border text-text-primary shadow-md text-[10px] rounded opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 whitespace-nowrap z-50 backdrop-blur-md ${
            isEditMode && isHoveringClockMenu ? '!opacity-0 !scale-95' : ''
          }`}>
            {isEditMode ? '添加时钟' : clocksVisible ? '隐藏时钟' : '显示时钟'}
          </span>
          {isEditMode && clockMenuPanel}
        </div>
      </>
    </div>
  );
}
