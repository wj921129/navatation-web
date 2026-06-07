import { X, Play, Pause, RotateCcw, Coffee, Briefcase } from 'lucide-react';
import { useRef, useState, useEffect, useCallback } from 'react';

interface PomodoroWidgetProps {
  id: string;
  x: number;
  y: number;
  isEditMode: boolean;
  onStartDrag: (id: string, type: string, offsetX: number, offsetY: number) => void;
  onDelete: (id: string) => void;
  isDragging?: boolean;
}

export default function PomodoroWidget({
  id,
  x,
  y,
  isEditMode,
  onStartDrag,
  onDelete,
  isDragging = false,
}: PomodoroWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const toggleTimer = useCallback(() => {
    setIsRunning(prev => !prev);
  }, []);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(mode === 'work' ? 25 * 60 : 5 * 60);
  }, [mode]);

  const switchMode = useCallback(() => {
    const newMode = mode === 'work' ? 'break' : 'work';
    setMode(newMode);
    setIsRunning(false);
    setTimeLeft(newMode === 'work' ? 25 * 60 : 5 * 60);
  }, [mode]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            // 这里可以加入提示音或通知
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isEditMode) return;
    const target = e.target as HTMLElement;
    if (target.closest('.no-drag')) return;

    e.preventDefault();
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    onStartDrag(id, 'pomodoro', offsetX, offsetY);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const totalSeconds = mode === 'work' ? 25 * 60 : 5 * 60;
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      className={`absolute select-none z-20 group touch-none isolate ${
        isEditMode ? 'cursor-grab active:cursor-grabbing' : ''
      }`}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        isolation: 'isolate',
        willChange: isDragging ? 'transform' : 'auto',
        transform: isDragging ? 'translate3d(0, 0, 0)' : 'none',
        backfaceVisibility: isDragging ? 'hidden' : 'visible',
      }}
    >
      {isEditMode && (
        <div className="absolute -inset-1.5 border-2 border-dashed border-blue-500/60 group-hover:border-blue-500 group-hover:bg-blue-500/5 rounded-3xl transition-all duration-150 pointer-events-none z-10" />
      )}

      {isEditMode && (
        <button
          onClick={() => onDelete(id)}
          className="no-drag absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg flex items-center justify-center cursor-pointer scale-0 group-hover:scale-100 transition-all duration-200 z-30"
          aria-label="删除番茄钟"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}

      <div className="w-[180px] p-4 rounded-3xl widget-private-control flex flex-col items-center gap-3">
        <div className="flex items-center justify-between w-full px-2">
          <span className="text-[10px] font-medium tracking-wider text-text-secondary uppercase">
            {mode === 'work' ? '专注时间' : '休息时间'}
          </span>
          <button onClick={switchMode} className="no-drag text-text-secondary hover:text-text-primary transition-colors cursor-pointer">
            {mode === 'work' ? <Coffee className="w-3.5 h-3.5" /> : <Briefcase className="w-3.5 h-3.5" />}
          </button>
        </div>
        
        <div className="relative w-[110px] h-[110px] flex flex-col items-center justify-center">
          {/* 进度环 */}
          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
            <circle
              cx="55"
              cy="55"
              r="48"
              fill="none"
              stroke="currentColor"
              className="text-widget-border"
              strokeWidth="4"
            />
            <circle
              cx="55"
              cy="55"
              r="48"
              fill="none"
              stroke="currentColor"
              className={mode === 'work' ? 'text-blue-500' : 'text-green-500'}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={48 * 2 * Math.PI}
              strokeDashoffset={(48 * 2 * Math.PI) * (1 - progress / 100)}
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <span className="text-3xl font-mono tracking-tighter text-text-primary mt-1 font-semibold">
            {formatTime(timeLeft)}
          </span>
        </div>

        <div className="flex items-center gap-4 mt-1">
          <button
            onClick={toggleTimer}
            className="no-drag w-10 h-10 rounded-full bg-text-primary text-widget-bg flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer"
          >
            {isRunning ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>
          <button
            onClick={resetTimer}
            className="no-drag w-8 h-8 rounded-full border border-widget-border text-text-secondary flex items-center justify-center hover:text-text-primary hover:bg-input-bg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
