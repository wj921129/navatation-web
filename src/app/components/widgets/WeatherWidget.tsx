import { Settings, X } from 'lucide-react'
import { useRef, useState } from 'react'
import SimpleWeather from './SimpleWeather'
import { type LocationData, WeatherSettingsModal } from './WeatherSettingsModal'

interface WeatherWidgetProps {
  id: string
  style: 'simple' | string
  x: number
  y: number
  meta?: Record<string, any>
  isEditMode: boolean
  onStartDrag: (
    id: string,
    type: 'weather',
    style: string,
    offsetX: number,
    offsetY: number,
  ) => void
  onDelete: (id: string) => void
  updateWidgetMeta?: (id: string, updater: (prev: any) => any) => void
  isDragging?: boolean
}

/**
 * WeatherWidget 组件/功能描述
 */
export default function WeatherWidget({
  id,
  style,
  x,
  y,
  meta,
  isEditMode,
  onStartDrag,
  onDelete,
  updateWidgetMeta,
  isDragging = false,
}: WeatherWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isClosing, setIsClosing] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  /**
   * 处理指针按下事件，用于拖拽
   * @param e 指针事件对象
   */
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isEditMode) {
      return
    }
    const target = e.target as HTMLElement
    if (target.closest('.delete-btn') || target.closest('.settings-btn')) {
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

    onStartDrag(id, 'weather', style, offsetX, offsetY)
  }

  /**
   * 根据样式渲染天气组件
   * @returns 渲染的天气组件
   */
  const renderStyle = () => {
    switch (style) {
      case 'simple':
      default:
        return <SimpleWeather meta={meta} />
    }
  }

  const locations = meta?.locations || []

  const handleLocationsChange = (newLocations: LocationData[]) => {
    if (updateWidgetMeta) {
      updateWidgetMeta(id, (prev) => ({ ...prev, locations: newLocations }))
    }
  }

  return (
    <>
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
          <>
            <button
              onClick={() => {
                setIsClosing(true)
                setTimeout(() => onDelete(id), 300)
              }}
              className="delete-btn absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg flex items-center justify-center cursor-pointer scale-0 group-hover:scale-100 transition-all duration-200 z-30"
              aria-label="删除天气"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="settings-btn absolute -top-2.5 -left-2.5 w-6 h-6 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg flex items-center justify-center cursor-pointer scale-0 group-hover:scale-100 transition-all duration-200 z-30"
              aria-label="设置天气"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </>
        )}
        {renderStyle()}
      </div>

      <WeatherSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        locations={locations}
        onLocationsChange={handleLocationsChange}
      />
    </>
  )
}
