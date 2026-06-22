/**
 * @description 可拖拽快捷方式组件
 * @date 2026-06-09
 */
import { X as XIcon } from 'lucide-react'
import { IconMap } from '../ui/IconMap'

interface DraggableShortcutProps {
  shortcut: any
  index: number
  moveShortcut: (from: number, to: number) => void
  iconInnerSize: number
  iconSize: number
  iconRadius: number
  iconTextGap: number
  textSize: number
  onEdit: () => void
  onDelete: () => void
  dragHandleProps?: any
}

/**
 * 可拖拽的快捷方式展示组件
 * 支持在编辑模式下的拖拽排序以及快捷方式信息的编辑和删除操作
 *
 * @param props 组件属性
 */
export function DraggableShortcut({
  shortcut,
  iconInnerSize,
  iconSize,
  iconRadius,
  iconTextGap,
  textSize,
  onEdit,
  onDelete,
  dragHandleProps,
}: Omit<DraggableShortcutProps, 'index' | 'moveShortcut'>) {
  return (
    <div
      className="flex flex-col items-center group relative"
      style={{
        width: `${iconSize + 32}px`,
      }}
    >
      {/* 删除按钮 */}
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onDelete()
        }}
        className="absolute -top-2 -right-2 z-10 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg transition-all"
      >
        <XIcon className="w-3 h-3 text-white" strokeWidth={3} />
      </button>

      <div className="flex flex-col items-center w-full" style={{ gap: `${iconTextGap}px` }}>
        <div
          {...dragHandleProps}
          onClick={(e) => {
            e.stopPropagation()
            onEdit()
          }}
          className="bg-icon-bg border border-widget-border flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 overflow-hidden shrink-0 cursor-grab active:cursor-grabbing"
          style={{
            width: `${iconSize}px`,
            height: `${iconSize}px`,
            borderRadius: `${iconRadius}%`,
          }}
        >
          {(() => {
            if (
              shortcut.iconType === 'CUSTOM_URL' ||
              shortcut.iconType === 'FAVICON' ||
              shortcut.iconType === 'CUSTOM_UPLOAD'
            ) {
              return (
                <img
                  src={shortcut.iconValue}
                  alt={shortcut.name}
                  style={{ width: '50%', height: '50%', objectFit: 'contain' }}
                />
              )
            }
            let IconComp = IconMap.Link
            const iconName = shortcut.iconValue
            if (iconName && IconMap[iconName]) {
              IconComp = IconMap[iconName]
            }
            return (
              <IconComp
                style={{
                  color: shortcut.color || '#333',
                  width: `${iconInnerSize}px`,
                  height: `${iconInnerSize}px`,
                }}
                strokeWidth={2}
              />
            )
          })()}
        </div>
        <span
          className="text-white font-light tracking-wide drop-shadow-lg text-center w-full truncate px-1"
          style={{ fontSize: `${textSize}px` }}
        >
          {shortcut.name}
        </span>
      </div>
    </div>
  )
}
