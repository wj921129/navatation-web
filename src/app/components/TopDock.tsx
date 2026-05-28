import { CheckSquare, Shuffle, Sun, Moon, Timer, Square, Loader2 } from 'lucide-react';
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
  dockMaxScale?: number;
  dockEffectRadius?: number;
}

/**
 * 首页顶部快捷多功能小组件工具栏 (TopDock)
 * 采用精致的 Glassmorphism 玻璃拟态设计，集成了待办事项、随机壁纸、快捷主题切换、专注时钟（番茄钟）微组件。
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
  dockMaxScale = 1.5,
  dockEffectRadius = 120
}: TopDockProps) {
  const [shuffling, setShuffling] = useState(false);
  
  // 专注时钟 (Pomodoro Zen Timer) 状态
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25分钟
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 鱼眼特效 Refs 数组，用于高性能直接修改 style 避免触发 React 重渲染
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // 鼠标在顶部工具栏移动时的鱼眼放大交互逻辑
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // 卫语句：如果正在调节屏幕亮度，强制恢复为原始大小，避免产生交互冲突
    if (isHoveringBrightness) {
      handleMouseLeave();
      return;
    }

    const mouseX = e.clientX;
    const mouseY = e.clientY;

    itemRefs.current.forEach((item) => {
      if (!item) return;
      const rect = item.getBoundingClientRect();
      // 获取当前子组件中心点视口坐标
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // 欧氏直线距离
      const distance = Math.sqrt(
        Math.pow(mouseX - centerX, 2) + Math.pow(mouseY - centerY, 2)
      );

      let scale = 1;
      if (distance < dockEffectRadius) {
        // 使用非常平滑饱满的二次衰减抛物线过渡效果
        const ratio = distance / dockEffectRadius;
        scale = 1 + (dockMaxScale - 1) * Math.pow(1 - ratio, 2);
      }

      // 移动时配置 0.05s 极短过渡以提供微弱阻尼感，同时保证卓越的跟手度和极致的 60fps 帧率
      item.style.transition = 'transform 0.05s ease-out';
      item.style.transform = `scale(${scale})`;
      item.style.transformOrigin = 'center center';
    });
  };

  // 鼠标移出顶部工具栏时，所有组件平滑回弹至原始大小
  const handleMouseLeave = () => {
    itemRefs.current.forEach((item) => {
      if (!item) return;
      // 移出时，使用经典的苹果贝塞尔缓动函数平滑过渡缩回
      item.style.transition = 'transform 0.25s cubic-bezier(0.25, 1, 0.5, 1)';
      item.style.transform = 'scale(1)';
    });
  };

  // 副作用：当调节亮度面板显示，或 hover 亮度面板状态改变时，主动触发平滑回弹，防止卡死在放大状态
  useEffect(() => {
    if (isHoveringBrightness) {
      handleMouseLeave();
    }
  }, [isHoveringBrightness]);

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

  // 专注时钟倒计时逻辑
  useEffect(() => {
    if (isTimerActive) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsTimerActive(false);
            // 振动或播放声音提示（可选）
            try { navigator.vibrate?.([200, 100, 200]); } catch {}
            return 25 * 60;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTimerActive]);

  // 格式化倒计时显示
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTimerToggle = () => {
    if (isTimerActive) {
      setIsTimerActive(false);
      setTimeLeft(25 * 60);
    } else {
      setIsTimerActive(true);
    }
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="flex items-center gap-1.5 px-4 py-1.5 rounded-b-2xl border-t-0 border border-widget-border bg-widget-bg backdrop-blur-md shadow-md opacity-70 hover:opacity-100 hover:bg-widget-bg/90 hover:backdrop-blur-xl transition-all duration-300 cursor-default text-text-primary overflow-visible"
    >
      {/* 待办事项小组件 */}
      <div 
        ref={(el) => { itemRefs.current[0] = el; }}
        className="relative group will-change-transform" 
        onMouseEnter={onMouseEnterOtherWidget}
      >
        <button
          onClick={onToggleTodo}
          className="p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-input-bg transition-all duration-200 active:scale-95 flex items-center justify-center cursor-pointer"
          aria-label="待办事项"
        >
          <CheckSquare className="w-4 h-4" />
        </button>
        <span className="pointer-events-none absolute top-[42px] left-1/2 -translate-x-1/2 px-2 py-1 bg-widget-bg/95 border border-widget-border text-text-primary shadow-md text-[10px] rounded opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 whitespace-nowrap z-50 backdrop-blur-md">
          待办事项
        </span>
      </div>

      <div className="w-[1px] h-4 bg-widget-border" />

      {/* 随机壁纸小组件 */}
      <div 
        ref={(el) => { itemRefs.current[1] = el; }}
        className="relative group will-change-transform" 
        onMouseEnter={onMouseEnterOtherWidget}
      >
        <button
          onClick={handleRandomWallpaperClick}
          className="p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-input-bg transition-all duration-200 active:scale-95 flex items-center justify-center cursor-pointer"
          aria-label="随机壁纸"
          disabled={shuffling}
        >
          {shuffling ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Shuffle className="w-4 h-4 transition-transform duration-300 group-hover:rotate-45" />
          )}
        </button>
        <span className="pointer-events-none absolute top-[42px] left-1/2 -translate-x-1/2 px-2 py-1 bg-widget-bg/95 border border-widget-border text-text-primary shadow-md text-[10px] rounded opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 whitespace-nowrap z-50 backdrop-blur-md">
          随机壁纸
        </span>
      </div>

      <div className="w-[1px] h-4 bg-widget-border" />

      {/* 快速主题切换小组件 */}
      <div 
        ref={(el) => { itemRefs.current[2] = el; }}
        className="relative group will-change-transform" 
        onMouseEnter={onMouseEnterTheme} 
        onMouseLeave={onMouseLeaveTheme}
      >
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-input-bg transition-all duration-200 active:scale-95 flex items-center justify-center cursor-pointer"
          aria-label="切换主题"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12" />
          ) : (
            <Moon className="w-4 h-4 transition-transform duration-300 group-hover:-rotate-12" />
          )}
        </button>
        <span className={`pointer-events-none absolute top-[42px] left-1/2 -translate-x-1/2 px-2 py-1 bg-widget-bg/95 border border-widget-border text-text-primary shadow-md text-[10px] rounded opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 whitespace-nowrap z-50 backdrop-blur-md ${
          isHoveringBrightness ? '!opacity-0 !scale-95' : ''
        }`}>
          切换主题
        </span>
        {brightnessPanel}
      </div>

      <div className="w-[1px] h-4 bg-widget-border" />

      {/* 专注番茄时钟小组件 */}
      <div 
        ref={(el) => { itemRefs.current[3] = el; }}
        className="relative group will-change-transform" 
        onMouseEnter={onMouseEnterOtherWidget}
      >
        <div 
          onClick={handleTimerToggle}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-full cursor-pointer transition-all duration-300 select-none ${
            isTimerActive 
              ? 'bg-red-500/30 border border-red-500/50 hover:bg-red-500/40 text-red-600 dark:text-red-200' 
              : 'text-text-secondary hover:text-text-primary hover:bg-input-bg'
          }`}
        >
          {isTimerActive ? (
            <>
              <Square className="w-3.5 h-3.5 text-red-500 dark:text-red-400 fill-red-500 dark:fill-red-400 animate-pulse" />
              <span className="text-[11px] font-medium font-mono text-red-600 dark:text-red-200 tabular-nums">
                {formatTime(timeLeft)}
              </span>
            </>
          ) : (
            <>
              <Timer className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
              <span className="text-[11px] font-light max-w-0 overflow-hidden group-hover:max-w-[60px] transition-all duration-300 whitespace-nowrap text-text-secondary/70 group-hover:ml-0.5">
                专注
              </span>
            </>
          )}
        </div>
        <span className="pointer-events-none absolute top-[42px] left-1/2 -translate-x-1/2 px-2 py-1 bg-widget-bg/95 border border-widget-border text-text-primary shadow-md text-[10px] rounded opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 whitespace-nowrap z-50 backdrop-blur-md">
          {isTimerActive ? '结束专注' : '开启 25 分钟专注'}
        </span>
      </div>
    </div>
  );
}
