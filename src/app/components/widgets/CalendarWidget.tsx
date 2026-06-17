import { X } from 'lucide-react'
import { useRef, useState } from 'react'
import MonthCalendar from './MonthCalendar'

interface CalendarWidgetProps {
  id: string
  style: 'month' | 'agenda' | string
  x: number
  y: number
  isEditMode: boolean
  onStartDrag: (
    id: string,
    type: 'calendar',
    style: string,
    offsetX: number,
    offsetY: number,
  ) => void
  onDelete: (id: string) => void
  isDragging?: boolean
}

/**
 * CalendarWidget 组件/功能描述
 */
export default function CalendarWidget({
  id,
  style,
  x,
  y,
  isEditMode,
  onStartDrag,
  onDelete,
  isDragging = false,
}: CalendarWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isClosing, setIsClosing] = useState(false)

  /**
   * 处理指针按下事件，用于拖拽
   * @param e 指针事件对象
   */
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isEditMode) {
      return
    }
    const target = e.target as HTMLElement
    if (target.closest('.delete-btn')) {
      return
    }

    e.preventDefault()
    const container = containerRef.current
    if (!container) {
      return
    }

    const rect = container.getBoundingClientRect()
    const offsetX = e.clientX - rect.left
    const offsetY = e.clientY - rect.top

    onStartDrag(id, 'calendar', style, offsetX, offsetY)
  }

  /**
   * 根据样式渲染日历组件
   * @returns 渲染的日历组件
   */
  const renderStyle = () => {
    switch (style) {
      case 'month':
      default:
        return <MonthCalendar />
    }
  }

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      className={`absolute select-none z-20 group touch-none isolate ${isDragging ? '!transition-none' : 'transition-all duration-300 ease-in-out'} ${
        isClosing ? 'scale-50 opacity-0' : 'scale-100 opacity-100'
      } ${isEditMode ? 'cursor-pointer' : ''}`}
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
          onClick={() => {
            setIsClosing(true)
            setTimeout(() => onDelete(id), 300)
          }}
          className="delete-btn absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg flex items-center justify-center cursor-pointer scale-0 group-hover:scale-100 transition-all duration-200 z-30"
          aria-label="删除日历"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
      {renderStyle()}
    </div>
  )
}
