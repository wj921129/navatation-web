import { Edit3, Trash2 } from 'lucide-react'
import type React from 'react'
import { toast } from 'sonner'

/**
 * 推荐网站图标项组件，支持拖拽和管理员编辑
 * 创建日期: 2026-06-09
 */
interface DraggableRecommendSiteProps {
  site: any
  catIdx: number
  iconSize: number
  borderRadius: string
  iconTextGap: number
  textSize: number
  userRole?: string
  category: any
  setEditingSite: (site: any) => void
  setCategories: React.Dispatch<React.SetStateAction<any[]>>
  handleAddRecommendedToPending: (site: any) => void
  dragHandleProps?: any
}

export function RecommendSiteItem({
  site,
  catIdx,
  iconSize,
  borderRadius,
  iconTextGap,
  textSize,
  userRole,
  category,
  setEditingSite,
  setCategories,
  handleAddRecommendedToPending,
  dragHandleProps,
}: DraggableRecommendSiteProps) {
  return (
    <div className="relative group/item flex-shrink-0" style={{ width: `${iconSize + 32}px` }}>
      <div
        onClick={() => {
          handleAddRecommendedToPending(site)
        }}
        className="flex flex-col items-center group cursor-pointer w-full"
        style={{ gap: `${iconTextGap}px` }}
      >
        <div
          {...dragHandleProps}
          className="bg-card flex items-center justify-center shadow-md hover:shadow-lg hover:scale-110 transition-all duration-200 border border-border overflow-hidden cursor-grab active:cursor-grabbing"
          style={{
            width: `${iconSize}px`,
            height: `${iconSize}px`,
            borderRadius: borderRadius,
          }}
        >
          {(() => {
            if (
              site.iconType === 'CUSTOM_URL' ||
              site.iconType === 'FAVICON' ||
              site.iconType === 'CUSTOM_UPLOAD'
            ) {
              return (
                <img
                  src={site.iconValue}
                  alt={site.name}
                  draggable={false}
                  className="pointer-events-none"
                  style={{ width: '50%', height: '50%', objectFit: 'contain' }}
                />
              )
            }
            return (
              <site.icon
                className="pointer-events-none"
                style={{
                  color: site.color,
                  width: `${iconSize * 0.5}px`,
                  height: `${iconSize * 0.5}px`,
                }}
                strokeWidth={2}
              />
            )
          })()}
        </div>
        <span
          className="text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors truncate w-full text-center px-1 font-light tracking-wide"
          style={{ fontSize: `${textSize}px` }}
        >
          {site.name}
        </span>
      </div>
      {userRole === 'ADMIN' && (
        <div className="absolute -top-2 -right-2 hidden group-hover/item:flex items-center gap-1 bg-background border border-border rounded shadow-sm p-0.5 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (!category.categoryId) {
                toast.warning(
                  '系统内置推荐网址不可直接编辑。请通过右上角"新增分类"建立数据库数据后再添加。',
                )
                return
              }
              setEditingSite({
                ...site,
                iconColor: site.iconColor || site.color,
                categoryId: category.categoryId,
              })
            }}
            className="p-1 text-gray-400 hover:text-blue-500"
          >
            <Edit3 className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setCategories((prev) => {
                const copy = [...prev]
                copy[catIdx] = {
                  ...copy[catIdx],
                  sites: copy[catIdx].sites.filter((s: any) => s.dragId !== site.dragId),
                }
                return copy
              })
            }}
            className="p-1 text-gray-400 hover:text-red-500"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  )
}
