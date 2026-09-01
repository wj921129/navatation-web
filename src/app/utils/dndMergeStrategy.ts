import {
  CollisionDetection,
  closestCenter,
  pointerWithin,
  ClientRect,
} from '@dnd-kit/core'

// 全局变量保存当前要合并的目标ID，供外部监听和拖拽结束时使用
export let currentMergeTargetId: string | null = null

/**
 * 自定义碰撞检测策略
 * - 使用 closestCenter 避免由于 pointerWithin 获取碰撞目标引起的位置跳动
 * - 如果鼠标悬停在某个目标的中心 60% 区域内，判定为“合并 (Merge)”目标，将其ID记录到全局变量并返回 active.id (避免打乱排序挤压列表)
 * - 否则返回原始 ID，由 SortableContext 处理正常的拖拽排序
 */
export const mergeCollisionDetection: CollisionDetection = (args) => {
  // 每次检测先清空
  currentMergeTargetId = null

  // 使用 closestCenter 获取碰撞，这比 pointerWithin 能有效避免边界处的乱窜
  const centerCollisions = closestCenter(args)
  
  if (centerCollisions.length > 0) {
    const collision = centerCollisions[0]
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
          
          // 如果指针进入了中心区域，表示意图合并文件夹，不进行位置互换
          if (x >= innerLeft && x <= innerRight && y >= innerTop && y <= innerBottom) {
            currentMergeTargetId = overId
            // 返回 activeId，欺骗 Sortable 认为悬停在自己身上，保持原有的排列不变，避免左右乱窜
            return [{ id: activeId }]
          }
        }
      }
      
      // 不在中心区域，返回原始的 collision，交由 SortableContext 排序
      return [{ id: overId }]
    }
  }

  return []
}
