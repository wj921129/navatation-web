import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ReactNode } from 'react';

interface SortableGridItemProps {
  id: string;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * SortableGridItem 组件/功能描述
 */
export function SortableGridItem({ id, children, className = '', style = {} }: SortableGridItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id,
    transition: {
      duration: 300,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    }
  });

  const combinedStyle = {
    ...style,
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={combinedStyle}
      {...attributes}
      {...listeners}
      className={`${className} ${isDragging ? 'z-50' : 'z-0'} cursor-pointer`}
    >
      {children}
    </div>
  );
}
