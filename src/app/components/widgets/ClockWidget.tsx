/**
 * @description 前端UI组件：ClockWidget.tsx
 * @date 2026-06-10
 */
import { X } from 'lucide-react';
import { useRef, useState } from 'react';
import AnalogClock from './AnalogClock';
import DigitalClock from './DigitalClock';
import FlipClock from './FlipClock';
import FlipClockSeconds from './FlipClockSeconds';
import TraditionalClock from './TraditionalClock';

interface ClockWidgetProps {
  id: string;
  style: 'analog' | 'digital' | 'flip' | 'flip-seconds' | 'traditional';
  x: number; // percentage from left
  y: number; // percentage from top
  isEditMode: boolean;
  onStartDrag: (id: string, style: 'analog' | 'digital' | 'flip' | 'flip-seconds' | 'traditional', offsetX: number, offsetY: number) => void;
  onDelete: (id: string) => void;
  isDragging?: boolean; // 新增可选属性，代表当前时钟是否正在被拖拽
}

/**
 * 时钟组件容器包装器 (ClockWidget)
 * 负责绝对定位渲染、指针拖动事件代理、编辑状态下的悬停高亮与删除按钮。
 */
export default function ClockWidget({
  id,
  style,
  x,
  y,
  isEditMode,
  onStartDrag,
  onDelete,
  isDragging = false, // 解构并默认赋值为 false
}: ClockWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isClosing, setIsClosing] = useState(false);

  /**
   * 指针按下开始拖动处理器
   * @param e 指针事件对象
   */
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isEditMode) {
      return;
    }
    const target = e.target as HTMLElement;
    if (target.closest('.delete-clock-btn')) {
      return;
    }

    e.preventDefault();
    const container = containerRef.current;
    if (!container) {
      return;
    }

    // 记录初始按下时指针坐标及组件边框尺寸
    const rect = container.getBoundingClientRect();

    // 鼠标在组件内部的相对偏置偏移量
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    // 触发全局拖拽开始回调，传入时钟样式
    onStartDrag(id, style, offsetX, offsetY);
  };

  /**
   * 根据样式渲染具体时钟组件
   * @returns 渲染的时钟组件
   */
  const renderClockStyle = () => {
    switch (style) {
      case 'analog':
        return <AnalogClock />;
      case 'digital':
        return <DigitalClock />;
      case 'flip':
        return <FlipClock />;
      case 'flip-seconds':
        return <FlipClockSeconds />;
      case 'traditional':
        return <TraditionalClock />;
      default:
        return null;
    }
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      className={`absolute select-none z-20 group touch-none isolate transition-all duration-300 ease-in-out ${
        isClosing ? 'scale-50 opacity-0' : 'scale-100 opacity-100'
      } ${
        isEditMode ? 'cursor-pointer' : ''
      }`}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        isolation: 'isolate',
        // 1. 动态 will-change：仅在拖拽时设为 transform，平时设为 auto，防止 backdrop-filter 和 GPU 硬件加速的合成层冲突导致背景毛玻璃闪烁
        willChange: isDragging ? 'transform' : 'auto',
        // 2. 仅在拖拽时开启 3D 加速并触发 GPU 合成层，静止时设为 none 以消除背景毛玻璃闪烁
        transform: isDragging ? 'translate3d(0, 0, 0)' : 'none',
        backfaceVisibility: isDragging ? 'hidden' : 'visible',
      }}
    >
      {/* 编辑模式下的虚线外框遮罩，防止由于边框和内边距引起容器尺寸变化与布局抖动 */}
      {isEditMode && (
        <div className="absolute -inset-1.5 border-2 border-dashed border-blue-500/60 group-hover:border-blue-500 group-hover:bg-blue-500/5 rounded-3xl transition-all duration-150 pointer-events-none z-10" />
      )}

      {/* 编辑模式下的删除按钮 */}
      {isEditMode && (
        <button
          onClick={() => {
            setIsClosing(true);
            setTimeout(() => onDelete(id), 300);
          }}
          className="delete-clock-btn absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg flex items-center justify-center cursor-pointer scale-0 group-hover:scale-100 transition-all duration-200 z-30"
          aria-label="删除时钟"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}

      {/* 渲染具体时钟样式 */}
      {renderClockStyle()}
    </div>
  );
}
