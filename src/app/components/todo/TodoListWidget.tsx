import { CheckCircle2, Circle, ListTodo } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { TodoItem } from '../../services/todo-service'
import { authStore } from '../../stores/auth-store'
import { todoStore } from '../../stores/todo-store'

interface TodoListWidgetProps {
  onOpenTodoPanel: () => void
}

/**
 * 首页左上角挂载的未完结待办事项小组件 (TodoListWidget)
 * 采用和顶部 TopDock 一致的胶囊卡片、半透明（Glassmorphism）和悬停激活视觉交互规范。
 * 用户可以直接在此处查看并一键勾选完成未完结的任务。
 */
export function TodoListWidget({ onOpenTodoPanel }: TodoListWidgetProps) {
  const [todoState, setTodoState] = useState(todoStore.getState())
  const [authState, setAuthState] = useState(authStore.getState())
  const [position, setPosition] = useState({ x: -1, y: 0 })
  const [isPointerDown, setIsPointerDown] = useState(false)
  const [hasMoved, setHasMoved] = useState(false)
  const dragStartPos = useRef({ x: 0, y: 0 })
  const widgetStartPos = useRef({ x: 0, y: 0 })
  const widgetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const unsubAuth = authStore.subscribe(setAuthState)
    const unsubTodo = todoStore.subscribe(setTodoState)

    // 初始化时加载一次数据
    todoStore.loadTodos(authStore.getState().isLoggedIn)

    const savedPos = localStorage.getItem('todo_widget_pos')
    if (savedPos) {
      try {
        const parsed = JSON.parse(savedPos)
        setPosition(parsed)
      } catch (e) {}
    }

    return () => {
      unsubAuth()
      unsubTodo()
    }
  }, [])

  useEffect(() => {
    if (position.x === -1) return
    const handleResize = () => {
      const w = widgetRef.current?.offsetWidth || 256
      const h = widgetRef.current?.offsetHeight || 140
      let nx = position.x
      let ny = position.y

      let changed = false
      if (nx > window.innerWidth - w) {
        nx = Math.max(0, window.innerWidth - w)
        changed = true
      }
      if (ny > window.innerHeight - h) {
        ny = Math.max(0, window.innerHeight - h)
        changed = true
      }
      if (changed) {
        setPosition({ x: nx, y: ny })
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [position.x, position.y])

  // 筛选未完结的待办事项
  const uncompletedTodos = todoState.todos.filter((t) => !t.completed)

  // 待办事项为空时，隐藏待办清单
  if (uncompletedTodos.length === 0) return null

  // 勾选完成某个待办事项
  const handleToggle = async (e: React.MouseEvent, todoId: string) => {
    e.stopPropagation() // 阻止触发卡片整体点击事件
    await todoStore.toggleTodo(todoId, authState.isLoggedIn)
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    setIsPointerDown(true)
    setHasMoved(false)
    dragStartPos.current = { x: e.clientX, y: e.clientY }

    const startX = position.x === -1 ? window.innerWidth - 256 - 24 : position.x
    widgetStartPos.current = { x: startX, y: position.y }
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDown) return
    const dx = e.clientX - dragStartPos.current.x
    const dy = e.clientY - dragStartPos.current.y

    if (!hasMoved) {
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        setHasMoved(true)
      } else {
        return
      }
    }

    const w = widgetRef.current?.offsetWidth || 256
    const h = widgetRef.current?.offsetHeight || 140

    let nx = widgetStartPos.current.x + dx
    let ny = widgetStartPos.current.y + dy
    nx = Math.max(0, Math.min(nx, window.innerWidth - w))
    ny = Math.max(0, Math.min(ny, window.innerHeight - h))

    setPosition({ x: nx, y: ny })
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDown) return
    setIsPointerDown(false)
    e.currentTarget.releasePointerCapture(e.pointerId)

    if (hasMoved) {
      const w = widgetRef.current?.offsetWidth || 256
      const h = widgetRef.current?.offsetHeight || 140

      let nx = position.x
      let ny = position.y

      const distTop = ny
      const distBottom = window.innerHeight - ny - h
      const distLeft = nx
      const distRight = window.innerWidth - nx - w

      const minDist = Math.min(distTop, distBottom, distLeft, distRight)

      if (minDist === distTop) ny = 0
      else if (minDist === distBottom) ny = window.innerHeight - h
      else if (minDist === distLeft) nx = 0
      else if (minDist === distRight) nx = window.innerWidth - w

      setPosition({ x: nx, y: ny })
      localStorage.setItem('todo_widget_pos', JSON.stringify({ x: nx, y: ny }))
    }

    setHasMoved(false)

    const dx = e.clientX - dragStartPos.current.x
    const dy = e.clientY - dragStartPos.current.y
    const dist = Math.sqrt(dx * dx + dy * dy)

    if (dist < 5) {
      onOpenTodoPanel()
    }
  }

  let snapEdge = 'top'
  if (position.x !== -1 && widgetRef.current) {
    const w = widgetRef.current.offsetWidth
    const h = widgetRef.current.offsetHeight
    if (position.y === 0) snapEdge = 'top'
    else if (position.y >= window.innerHeight - h - 1) snapEdge = 'bottom'
    else if (position.x === 0) snapEdge = 'left'
    else if (position.x >= window.innerWidth - w - 1) snapEdge = 'right'
  }

  let roundedClass = 'rounded-2xl border'
  if (!hasMoved) {
    if (snapEdge === 'top') roundedClass = 'rounded-b-2xl border-t-0 border-b border-l border-r'
    else if (snapEdge === 'bottom')
      roundedClass = 'rounded-t-2xl border-b-0 border-t border-l border-r'
    else if (snapEdge === 'left')
      roundedClass = 'rounded-r-2xl border-l-0 border-t border-b border-r'
    else if (snapEdge === 'right')
      roundedClass = 'rounded-l-2xl border-r-0 border-t border-b border-l'
  }

  return (
    <div
      ref={widgetRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`absolute z-30 flex flex-col gap-2 px-4 py-2.5 ${roundedClass} border-widget-border bg-widget-bg backdrop-blur-md shadow-md opacity-70 hover:opacity-100 hover:backdrop-blur-xl ${hasMoved ? 'transition-none cursor-grabbing' : 'transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] cursor-pointer'} w-64 max-h-[220px] overflow-hidden group select-none`}
      style={{
        left: position.x === -1 ? 'auto' : `${position.x}px`,
        right: position.x === -1 ? '24px' : 'auto',
        top: position.x === -1 ? '0px' : `${position.y}px`,
        willChange: 'opacity, left, top',
      }}
    >
      {/* 头部标题与统计 */}
      <div className="flex items-center justify-between text-text-primary border-b border-widget-border pb-1">
        <div className="flex items-center gap-1.5">
          <ListTodo className="w-3.5 h-3.5 text-blue-600 dark:text-blue-300" />
          <span className="text-xs font-semibold dark:font-medium tracking-wide">待办清单</span>
        </div>
        <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-input-bg text-text-secondary">
          {uncompletedTodos.length} 项未完结
        </span>
      </div>

      {/* 待办事项精简列表 */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5 max-h-[140px] scrollbar-thin">
        {uncompletedTodos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-4 text-text-secondary">
            <span className="text-[11px] font-light">🎉 任务已全部完成！</span>
          </div>
        ) : (
          uncompletedTodos.map((todo) => (
            <div
              key={todo.todoId}
              onClick={(e) => handleToggle(e, todo.todoId)}
              onPointerDown={(e) => e.stopPropagation()}
              onPointerUp={(e) => e.stopPropagation()}
              className="flex items-start gap-2 py-1 px-1.5 rounded hover:bg-input-bg group/item transition-colors cursor-pointer"
            >
              {/* 一键勾选圆环 */}
              <div className="flex-shrink-0 mt-0.5 cursor-pointer">
                <Circle className="w-3.5 h-3.5 text-text-secondary group-hover/item:text-green-500 dark:group-hover/item:text-green-400 group-hover/item:scale-110 transition-all duration-200" />
              </div>

              {/* 任务简短文字 */}
              <span className="text-xs font-light text-text-secondary line-clamp-3 whitespace-normal break-all flex-1 group-hover/item:text-text-primary transition-colors">
                {todo.content}
              </span>
            </div>
          ))
        )}
      </div>

      {/* 底部悬浮指引 */}
      <div className="text-[9px] text-text-secondary text-center pt-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        点击面板查看完整列表
      </div>
    </div>
  )
}
