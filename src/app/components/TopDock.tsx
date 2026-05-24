import { CheckSquare, Shuffle, Sun, Moon, Timer, Square, Loader2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface TopDockProps {
  theme: string;
  onToggleTodo: () => void;
  onRandomWallpaper: () => Promise<void>;
  onToggleTheme: () => void;
}

/**
 * 首页顶部快捷多功能小组件工具栏 (TopDock)
 * 采用精致的 Glassmorphism 玻璃拟态设计，集成了待办事项、随机壁纸、快捷主题切换、专注时钟（番茄钟）微组件。
 */
export function TopDock({ theme, onToggleTodo, onRandomWallpaper, onToggleTheme }: TopDockProps) {
  const [shuffling, setShuffling] = useState(false);
  
  // 专注时钟 (Pomodoro Zen Timer) 状态
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25分钟
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
    <div className="flex items-center gap-1.5 px-4 py-1 rounded-b-2xl border-t-0 border border-white/25 dark:border-white/15 bg-white/15 dark:bg-black/15 backdrop-blur-md shadow-md opacity-70 hover:opacity-100 hover:bg-white/25 dark:hover:bg-black/25 hover:backdrop-blur-xl transition-all duration-300 cursor-default">
      {/* 待办事项小组件 */}
      <div className="relative group">
        <button
          onClick={onToggleTodo}
          className="p-2 rounded-full hover:bg-white/20 text-white transition-all duration-200 active:scale-95 flex items-center justify-center cursor-pointer"
          aria-label="待办事项"
        >
          <CheckSquare className="w-4 h-4" />
        </button>
        <span className="pointer-events-none absolute top-12 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/80 dark:bg-white/90 text-white dark:text-black text-[10px] rounded opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 whitespace-nowrap z-50">
          待办事项
        </span>
      </div>

      <div className="w-[1px] h-4 bg-white/20 dark:bg-white/10" />

      {/* 随机壁纸小组件 */}
      <div className="relative group">
        <button
          onClick={handleRandomWallpaperClick}
          className="p-2 rounded-full hover:bg-white/20 text-white transition-all duration-200 active:scale-95 flex items-center justify-center cursor-pointer"
          aria-label="随机壁纸"
          disabled={shuffling}
        >
          {shuffling ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Shuffle className="w-4 h-4 transition-transform duration-300 group-hover:rotate-45" />
          )}
        </button>
        <span className="pointer-events-none absolute top-12 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/80 dark:bg-white/90 text-white dark:text-black text-[10px] rounded opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 whitespace-nowrap z-50">
          随机壁纸
        </span>
      </div>

      <div className="w-[1px] h-4 bg-white/20 dark:bg-white/10" />

      {/* 快速主题切换小组件 */}
      <div className="relative group">
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-full hover:bg-white/20 text-white transition-all duration-200 active:scale-95 flex items-center justify-center cursor-pointer"
          aria-label="切换主题"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12" />
          ) : (
            <Moon className="w-4 h-4 transition-transform duration-300 group-hover:-rotate-12" />
          )}
        </button>
        <span className="pointer-events-none absolute top-12 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/80 dark:bg-white/90 text-white dark:text-black text-[10px] rounded opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 whitespace-nowrap z-50">
          切换主题
        </span>
      </div>

      <div className="w-[1px] h-4 bg-white/20 dark:bg-white/10" />

      {/* 专注番茄时钟小组件 */}
      <div className="relative group">
        <div 
          onClick={handleTimerToggle}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-full cursor-pointer hover:bg-white/20 text-white transition-all duration-300 select-none ${
            isTimerActive ? 'bg-red-500/30 border border-red-500/50 hover:bg-red-500/40' : ''
          }`}
        >
          {isTimerActive ? (
            <>
              <Square className="w-3.5 h-3.5 text-red-400 fill-red-400 animate-pulse" />
              <span className="text-[11px] font-medium font-mono text-red-200 tabular-nums">
                {formatTime(timeLeft)}
              </span>
            </>
          ) : (
            <>
              <Timer className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
              <span className="text-[11px] font-light max-w-0 overflow-hidden group-hover:max-w-[60px] transition-all duration-300 whitespace-nowrap text-white/70 group-hover:ml-0.5">
                专注
              </span>
            </>
          )}
        </div>
        <span className="pointer-events-none absolute top-12 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/80 dark:bg-white/90 text-white dark:text-black text-[10px] rounded opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 whitespace-nowrap z-50">
          {isTimerActive ? '结束专注' : '开启 25 分钟专注'}
        </span>
      </div>
    </div>
  );
}
