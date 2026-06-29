import { useSortable } from '@dnd-kit/sortable'
import { useDndContext, useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { ReactNode } from 'react'

interface SortableGridItemProps {
  id: string
  children: ReactNode | ((props: { dragHandleProps: any }) => ReactNode)
  className?: string
  style?: React.CSSProperties
}

/**
 * SortableGridItem 组件：支持通过 children 函数传递 dragHandleProps，
 * 从而将拖拽手柄精确绑定在内部子元素上。如果传入普通 children 则默认绑定到最外层以向下兼容。
 */
export function SortableGridItem({
  id,
  children,
  className = '',
  style = {},
}: SortableGridItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    transition: {
      duration: 300,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    },
  })

  const { setNodeRef: setMergeNodeRef } = useDroppable({
    id: `${id}__merge`,
  })

  const { over } = useDndContext()
  const isMergeTarget = over?.id === `${id}__merge`

  const combinedStyle = {
    ...style,
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  }

  const dragHandleProps = { ...attributes, ...listeners }
  const isRenderFn = typeof children === 'function'

  const mergeClasses = isMergeTarget ? 'ring-4 ring-blue-500 rounded-2xl scale-105 transition-all duration-200 z-40' : ''

  return (
    <div
      ref={setNodeRef}
      style={combinedStyle}
      {...(isRenderFn ? {} : dragHandleProps)}
      className={`${className} ${isDragging ? 'z-50' : 'z-0'} ${isRenderFn ? '' : 'cursor-pointer'} ${mergeClasses} relative`}
    >
      <div ref={setMergeNodeRef} className="absolute inset-0 pointer-events-none" />
      {isRenderFn ? (children as Function)({ dragHandleProps }) : children}
    </div>
  )
}
