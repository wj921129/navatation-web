import {
  CollisionDetection,
  pointerWithin,
  closestCenter,
  ClientRect,
} from '@dnd-kit/core'

/**
 * 自定义碰撞检测策略
 * - 如果鼠标悬停在某个目标的中心 50% 区域内，判定为“合并 (Merge)”目标，返回附加后缀的 ID，
 *   这样 SortableContext 就不会将其视作排序目标，从而避免目标发生避让（跑开）。
 * - 否则，回退到 closestCenter 进行正常的拖拽排序。
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
        
        // 我们只在鼠标实际存在的坐标下（args.pointerCoordinates）进行计算
        if (args.pointerCoordinates) {
          const { x, y } = args.pointerCoordinates
          const rectX = rect.left
          const rectY = rect.top
          const width = rect.width
          const height = rect.height
          
          // 定义中心区域的比例，比如 60%
          const innerRatio = 0.6
          const marginX = (width * (1 - innerRatio)) / 2
          const marginY = (height * (1 - innerRatio)) / 2
          
          const innerLeft = rectX + marginX
          const innerRight = rectX + width - marginX
          const innerTop = rectY + marginY
          const innerBottom = rectY + height - marginY
          
          // 如果指针进入了中心区域
          if (x >= innerLeft && x <= innerRight && y >= innerTop && y <= innerBottom) {
            // 返回带有特殊后缀的 ID，这样 SortableContext 就不会触发重排
            return [{ id: `${overId}__merge` }]
          }
        }
      }
    }
  }

  // 否则，正常进行重排碰撞检测
  return closestCenter(args)
}
