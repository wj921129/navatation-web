import { Trash2 } from 'lucide-react'
import React from 'react'

/**
 * 待添加捷径列表组件，展示当前选中的拟添加网站
 * 创建日期: 2026-06-09
 */
interface PendingShortcutsListProps {
  pendingShortcuts: any[]
  iconRadius: number
  handleRemoveFromPending: (index: number) => void
}

export function PendingShortcutsList({
  pendingShortcuts,
  iconRadius,
  handleRemoveFromPending,
}: PendingShortcutsListProps) {
  return (
    <div className="col-span-1 bg-background border-l border-border overflow-y-auto transition-colors duration-300">
      <div className="p-4">
        <h3 className="text-sm font-medium mb-4">本次添加 ({pendingShortcuts.length})</h3>
        {pendingShortcuts.length === 0 ? (
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-8">暂无选择</p>
        ) : (
          <div className="space-y-3">
            {pendingShortcuts.map((shortcut, index) => (
              <div
                key={index}
                className="flex items-center gap-3 bg-card p-3 rounded-lg border border-border group transition-all duration-200"
              >
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
                  <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                    {shortcut.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {shortcut.url}
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveFromPending(index)}
                  className="flex-shrink-0 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-950/30 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
