import { resolveAssetUrl } from '@/app/services/api-client'
import { DragOverlay, type DropAnimation } from '@dnd-kit/core'
import type { ReactNode } from 'react'

const dropAnimationConfig: DropAnimation = {
  duration: 300,
  easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
}

interface GridDragOverlayProps {
  children: ReactNode
}

/**
 * GridDragOverlay 组件/功能描述
 */
export function GridDragOverlay({ children }: GridDragOverlayProps) {
  return <DragOverlay dropAnimation={dropAnimationConfig}>{children}</DragOverlay>
}

import { IconMap } from './IconMap'

export interface UnifiedDragItemProps {
  shortcut: any
  iconSize: number
  borderRadius: string | number
  iconInnerSize?: number
  showText?: boolean
  textSize?: number
  className?: string
  wrapperClassName?: string
}

export function UnifiedDragItem({
  shortcut,
  iconSize,
  borderRadius,
  iconInnerSize,
  showText = false,
  textSize = 14,
  className = 'bg-card border-blue-500',
  wrapperClassName = '',
}: UnifiedDragItemProps) {
  if (!shortcut) return null
  const innerSize = iconInnerSize || iconSize * 0.5
  const radius = typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius

  return (
    <div
      className={`flex flex-col items-center relative cursor-pointer ${wrapperClassName}`}
      style={{ width: `${iconSize + 32}px` }}
    >
      <div
        className={`flex items-center justify-center shadow-2xl scale-110 border overflow-hidden pointer-events-none transition-transform ${className}`}
        style={{
          width: `${iconSize}px`,
          height: `${iconSize}px`,
          borderRadius: radius,
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
                src={resolveAssetUrl(shortcut.iconValue)}
                alt={shortcut.name}
                style={{ width: '50%', height: '50%', objectFit: 'contain' }}
              />
            )
          }
          if (shortcut.icon && typeof shortcut.icon !== 'string') {
            const IconComp = shortcut.icon
            return (
              <IconComp
                style={{
                  color: shortcut.color || shortcut.iconColor || '#333',
                  width: `${innerSize}px`,
                  height: `${innerSize}px`,
                }}
                strokeWidth={2}
              />
            )
          }
          const IconComp = IconMap[shortcut.iconValue] || IconMap.Link
          return (
            <IconComp
              style={{
                color: shortcut.color || shortcut.iconColor || '#333',
                width: `${innerSize}px`,
                height: `${innerSize}px`,
              }}
              strokeWidth={2}
            />
          )
        })()}
      </div>
      {showText && (
        <span
          className="mt-2 font-medium tracking-wide text-center w-full truncate px-1 opacity-0 pointer-events-none"
          style={{ fontSize: `${textSize}px` }}
        >
          {shortcut.name || '未命名'}
        </span>
      )}
    </div>
  )
}
