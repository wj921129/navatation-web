import { X } from 'lucide-react';
import { useRef } from 'react';
import AnalogClock from './AnalogClock';
import DigitalClock from './DigitalClock';
import FlipClock from './FlipClock';

interface ClockWidgetProps {
  id: string;
  style: 'analog' | 'digital' | 'flip';
  x: number; // percentage from left
  y: number; // percentage from top
  isEditMode: boolean;
  onStartDrag: (id: string, style: 'analog' | 'digital' | 'flip', offsetX: number, offsetY: number) => void;
  onDelete: (id: string) => void;
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
}: ClockWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // 指针按下开始拖动处理器
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // 仅在编辑模式下允许拖拽，并且避开删除按钮的触发
    if (!isEditMode) return;
    const target = e.target as HTMLElement;
    if (target.closest('.delete-clock-btn')) return;

    e.preventDefault();
    const container = containerRef.current;
    if (!container) return;

    // 记录初始按下时指针坐标及组件边框尺寸
    const rect = container.getBoundingClientRect();

    // 鼠标在组件内部的相对偏置偏移量
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    // 触发全局拖拽开始回调，传入时钟样式
    onStartDrag(id, style, offsetX, offsetY);
  };

  const renderClockStyle = () => {
    switch (style) {
      case 'analog':
        return <AnalogClock />;
      case 'digital':
        return <DigitalClock />;
      case 'flip':
        return <FlipClock />;
      default:
        return null;
    }
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      className={`absolute select-none z-20 group touch-none ${
        isEditMode ? 'cursor-grab active:cursor-grabbing' : ''
      }`}
      style={{
        left: `${x}%`,
        top: `${y}%`,
      }}
    >
      {/* 编辑模式下的虚线外框遮罩，防止由于边框和内边距引起容器尺寸变化与布局抖动 */}
      {isEditMode && (
        <div className="absolute -inset-1.5 border-2 border-dashed border-blue-500/60 group-hover:border-blue-500 group-hover:bg-blue-500/5 rounded-3xl transition-all duration-150 pointer-events-none z-10" />
      )}

      {/* 编辑模式下的删除按钮 */}
      {isEditMode && (
        <button
          onClick={() => onDelete(id)}
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
