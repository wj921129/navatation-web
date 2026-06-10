import { X } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BreatheWidgetProps {
  id: string;
  x: number;
  y: number;
  isEditMode: boolean;
  onStartDrag: (id: string, type: string, offsetX: number, offsetY: number) => void;
  onDelete: (id: string) => void;
  isDragging?: boolean;
}

/**
 * BreatheWidget 组件/功能描述
 */
export default function BreatheWidget({
  id,
  x,
  y,
  isEditMode,
  onStartDrag,
  onDelete,
  isDragging = false,
}: BreatheWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<'idle' | 'inhale' | 'hold' | 'exhale'>('idle');

  // 在副作用中处理呼吸状态切换
  useEffect(() => {
    if (phase === 'idle') {
      return;
    }

    let timeout: NodeJS.Timeout;
    if (phase === 'inhale') {
      timeout = setTimeout(() => setPhase('hold'), 4000); // 吸气 4 秒
    } else if (phase === 'hold') {
      timeout = setTimeout(() => setPhase('exhale'), 4000); // 屏气 4 秒
    } else if (phase === 'exhale') {
      timeout = setTimeout(() => setPhase('inhale'), 4000); // 呼气 4 秒
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [phase]);

  /**
   * 切换呼吸状态
   */
  const toggleBreathe = () => {
    if (phase === 'idle') {
      setPhase('inhale');
    } else {
      setPhase('idle');
    }
  };

  /**
   * 处理指针按下事件，用于拖拽
   * @param e 指针事件对象
   */
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isEditMode) {
      return;
    }
    const target = e.target as HTMLElement;
    if (target.closest('.no-drag')) {
      return;
    }

    e.preventDefault();
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const rect = container.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    onStartDrag(id, 'breathe', offsetX, offsetY);
  };

  /**
   * 获取当前呼吸阶段提示文本
   * @returns 提示文本
   */
  const getPhaseText = () => {
    switch (phase) {
      case 'idle': 
        return '点击开始';
      case 'inhale': 
        return '吸气...';
      case 'hold': 
        return '屏气...';
      case 'exhale': 
        return '呼气...';
      default: 
        return '';
    }
  };

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
          aria-label="删除冥想组件"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}

      <div 
        className="w-[160px] h-[160px] rounded-[2rem] widget-private-control flex flex-col items-center justify-center gap-2 cursor-pointer no-drag"
        onClick={toggleBreathe}
      >
        <div className="relative w-24 h-24 flex items-center justify-center">
          <motion.div
            initial={false}
            animate={{
              scale: phase === 'inhale' || phase === 'hold' ? 1.5 : 0.8,
              opacity: phase === 'idle' ? 0.3 : (phase === 'exhale' ? 0.5 : 1),
            }}
            transition={{
              duration: 4,
              ease: "easeInOut"
            }}
            className="absolute w-12 h-12 rounded-full bg-teal-400/40 blur-md"
          />
          <motion.div
            initial={false}
            animate={{
              scale: phase === 'inhale' || phase === 'hold' ? 1.2 : 0.5,
              opacity: phase === 'idle' ? 0.5 : 1,
            }}
            transition={{
              duration: 4,
              ease: "easeInOut"
            }}
            className="absolute w-12 h-12 rounded-full bg-teal-500/60 backdrop-blur-sm border border-teal-300/30 shadow-[0_0_15px_rgba(45,212,191,0.5)]"
          />
        </div>
        <AnimatePresence mode="wait">
          <motion.span
            key={phase}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-4 text-[11px] font-medium tracking-widest text-text-secondary"
          >
            {getPhaseText()}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}
