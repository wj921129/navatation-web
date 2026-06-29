import {
  CollisionDetection,
  pointerWithin,
  ClientRect,
} from '@dnd-kit/core'

/**
 * 自定义碰撞检测策略
 * - 始终使用 pointerWithin 获取碰撞目标，避免 closestCenter 的位置计算引发的抖动
 * - 如果鼠标悬停在某个目标的中心 60% 区域内，判定为“合并 (Merge)”目标，返回附加后缀的 ID
 * - 否则返回原始 ID，由 SortableContext 处理正常的拖拽排序
 */
export const mergeCollisionDetection: CollisionDetection = (args) => {
  // 先通过 pointerWithin 获取当前鼠标位于哪个容器内部
  const pointerCollisions = pointerWithin(args)
  
  if (pointerCollisions.length > 0) {
    const collision = pointerCollisions[0]
    const activeId = args.active.id
    const overId = String(collision.id)
    
    if (activeId !== overId) {
      // 在 droppableContainers 中找到这个目标，计算它是否处于中心区域
      const container = args.droppableContainers.find(c => String(c.id) === overId)
      if (container && container.rect.current) {
        const rect = container.rect.current as ClientRect
        
        if (args.pointerCoordinates) {
          const { x, y } = args.pointerCoordinates
          const rectX = rect.left
          const rectY = rect.top
          const width = rect.width
          const height = rect.height
          
          // 中心区域的比例 60%
          const innerRatio = 0.6
          const marginX = (width * (1 - innerRatio)) / 2
          const marginY = (height * (1 - innerRatio)) / 2
          
          const innerLeft = rectX + marginX
          const innerRight = rectX + width - marginX
          const innerTop = rectY + marginY
          const innerBottom = rectY + height - marginY
          
          // 如果指针进入了中心区域，返回 merge 后缀
          if (x >= innerLeft && x <= innerRight && y >= innerTop && y <= innerBottom) {
            return [{ id: `${overId}__merge` }]
          }
        }
      }
      
      // 不在中心区域，返回原始的 collision，交由 SortableContext 排序
      return [collision]
    }
  }

  return []
}
