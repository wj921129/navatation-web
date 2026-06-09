import { DragOverlay, DropAnimation } from '@dnd-kit/core';
import { ReactNode } from 'react';

const dropAnimationConfig: DropAnimation = {
  duration: 300,
  easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
};

interface GridDragOverlayProps {
  children: ReactNode;
}

export function GridDragOverlay({ children }: GridDragOverlayProps) {
  return (
    <DragOverlay dropAnimation={dropAnimationConfig}>
      {children}
    </DragOverlay>
  );
}
