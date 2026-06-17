import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { ReactNode } from 'react'

interface SortableListItemProps {
  id: string
  children: ReactNode
  className?: string
  style?: React.CSSProperties
}

/**
 * 封装好的可拖动列表项组件 (基于 dnd-kit)
 * 与 SortableGridItem 类似，提供全局复用的列表拖动效果
 */
export function SortableListItem({
  id,
  children,
  className = '',
  style = {},
}: SortableListItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    transition: {
      duration: 300,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    },
  })

  const combinedStyle = {
    ...style,
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1, // 跟随 Grid 风格，拖动时原位置隐藏，由 Overlay 显示
  }

  return (
    <div
      ref={setNodeRef}
      style={combinedStyle}
      {...attributes}
      {...listeners}
      className={`${className} ${isDragging ? 'z-50' : 'z-0'} cursor-pointer touch-none`}
    >
      {children}
    </div>
  )
}
