import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2 } from 'lucide-react'

/**
 * 待添加捷径列表组件，展示当前选中的拟添加网站
 * 创建日期: 2026-06-09
 */
interface PendingShortcutsListProps {
  pendingShortcuts: any[]
  setPendingShortcuts: (shortcuts: any[]) => void
  iconRadius: number
  handleRemoveFromPending: (index: number) => void
}

function SortableShortcutItem({
  shortcut,
  index,
  iconRadius,
  handleRemoveFromPending,
}: {
  shortcut: any
  index: number
  iconRadius: number
  handleRemoveFromPending: (index: number) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: shortcut.dragId || shortcut.url + index,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 bg-card px-3 py-2 rounded-lg border border-border group transition-all duration-200 ${
        isDragging ? 'shadow-md opacity-80' : ''
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="flex-shrink-0 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
      >
        <GripVertical className="w-4 h-4" />
      </div>

      <div
        className="flex-shrink-0 bg-background flex items-center justify-center shadow-sm border border-border overflow-hidden"
        style={{
          width: '40px',
          height: '40px',
          borderRadius: `${iconRadius}%`,
        }}
      >
        {shortcut.iconType === 'FAVICON' ||
        shortcut.iconType === 'CUSTOM_URL' ||
        shortcut.iconType === 'CUSTOM_UPLOAD' ? (
          <img
            src={shortcut.iconValue}
            alt={shortcut.name}
            style={{
              width: '50%',
              height: '50%',
              objectFit: 'contain',
            }}
          />
        ) : (
          <shortcut.icon
            style={{
              color: shortcut.color,
              width: '20px',
              height: '20px',
            }}
            strokeWidth={2}
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{shortcut.name}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{shortcut.url}</p>
      </div>
      <button
        onClick={() => handleRemoveFromPending(index)}
        className="flex-shrink-0 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-950/30 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}

export function PendingShortcutsList({
  pendingShortcuts,
  setPendingShortcuts,
  iconRadius,
  handleRemoveFromPending,
}: PendingShortcutsListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = pendingShortcuts.findIndex(
        (item, index) => (item.dragId || item.url + index) === active.id,
      )
      const newIndex = pendingShortcuts.findIndex(
        (item, index) => (item.dragId || item.url + index) === over?.id,
      )

      if (oldIndex !== -1 && newIndex !== -1) {
        setPendingShortcuts(arrayMove(pendingShortcuts, oldIndex, newIndex))
      }
    }
  }

  return (
    <div className="col-span-1 bg-background border-l border-border overflow-y-auto transition-colors duration-300">
      <div className="p-4">
        <h3 className="text-sm font-medium mb-4">本次添加 ({pendingShortcuts.length})</h3>
        {pendingShortcuts.length === 0 ? (
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-8">暂无选择</p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={pendingShortcuts.map((item, index) => item.dragId || item.url + index)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {pendingShortcuts.map((shortcut, index) => (
                  <SortableShortcutItem
                    key={shortcut.dragId || shortcut.url + index}
                    shortcut={shortcut}
                    index={index}
                    iconRadius={iconRadius}
                    handleRemoveFromPending={handleRemoveFromPending}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  )
}
