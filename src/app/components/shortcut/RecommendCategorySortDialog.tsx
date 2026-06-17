/**
 * @description 推荐网址分类排序对话框
 * 管理员专用：以直观的拖拽卡片方式调整推荐分类的显示顺序
 * @date 2026-06-10
 */

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Check, Edit3, FolderCog, FolderPlus, GripVertical, Loader2, Trash2, X } from 'lucide-react'
import type React from 'react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { navService } from '../../services/nav-service'
import { BaseModal } from '../ui/BaseModal'
import { GridDragOverlay } from '../ui/GridDragOverlay'
import { IconMap } from '../ui/IconMap'
import { SortableListItem } from '../ui/SortableListItem'
import { AdminCategoryModal } from './AdminCategoryModal'

interface SortCategory {
  categoryId: string
  category: string
  icon: React.ComponentType<any>
  iconValue: string
  sortOrder: number
  siteCount: number
}

interface RecommendCategorySortDialogProps {
  isOpen: boolean
  onClose: () => void
  categories: any[]
  onSaveComplete: () => void
}

/**
 * RecommendCategorySortDialog 推荐分类排序弹窗
 * 只展示分类卡片，通过拖拽调整分类顺序
 */
export function RecommendCategorySortDialog({
  isOpen,
  onClose,
  categories,
  onSaveComplete,
}: RecommendCategorySortDialogProps) {
  const [sortList, setSortList] = useState<SortCategory[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<SortCategory | null>(null)
  const [deletedCategoryIds, setDeletedCategoryIds] = useState<string[]>([])
  const [editingCategory, setEditingCategory] = useState<any>(null)

  // 弹窗打开时，初始化排序列表
  useEffect(() => {
    if (isOpen) {
      const validCats = categories
        .filter((c) => !!c.categoryId)
        .map((c) => ({
          categoryId: c.categoryId,
          category: c.category,
          icon: c.icon,
          iconValue: c.iconValue,
          sortOrder: c.sortOrder ?? 0,
          siteCount: Array.isArray(c.sites) ? c.sites.length : 0,
        }))
        .sort((a, b) => a.sortOrder - b.sortOrder)
      setSortList(validCats)
      setDeletedCategoryIds([])
      setIsDirty(false)
    }
  }, [isOpen, categories])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  )

  const [activeId, setActiveId] = useState<string | null>(null)

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = event
    if (over && active.id !== over.id) {
      setSortList((prev) => {
        const oldIndex = prev.findIndex((item) => item.categoryId === active.id)
        const newIndex = prev.findIndex((item) => item.categoryId === over.id)
        return arrayMove(prev, oldIndex, newIndex)
      })
      setIsDirty(true)
    }
  }

  const activeItem = sortList.find((c) => c.categoryId === activeId)
  const activeIndex = activeItem ? sortList.findIndex((c) => c.categoryId === activeId) : -1

  const renderCategoryCard = (cat: SortCategory, idx: number, isOverlay = false) => (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-200 select-none ${
        isOverlay
          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 shadow-xl scale-[1.02] rotate-1'
          : 'bg-background border-border hover:border-gray-300 dark:hover:border-neutral-600 hover:shadow-sm'
      }`}
    >
      <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{idx + 1}</span>
      </div>

      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border border-indigo-100 dark:border-indigo-800/30 flex items-center justify-center flex-shrink-0">
        <cat.icon
          className="w-4.5 h-4.5 text-indigo-500 dark:text-indigo-400"
          style={{ width: '18px', height: '18px' }}
        />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{cat.category}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{cat.siteCount} 个网址</p>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation()
            !isOverlay && setEditingCategory({ ...cat })
          }}
          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-colors cursor-pointer"
          title="编辑分类"
        >
          <Edit3 className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            !isOverlay && handleDeleteCategory(cat)
          }}
          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-colors cursor-pointer"
          title="删除分类"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-shrink-0 text-gray-300 dark:text-gray-600 p-1">
        <GripVertical className="w-5 h-5" />
      </div>
    </div>
  )

  const handleSaveCategory = (editedCat: any) => {
    if (editedCat.categoryId && !editedCat.categoryId.startsWith('temp-')) {
      setSortList((prev) =>
        prev.map((c) =>
          c.categoryId === editedCat.categoryId
            ? {
                ...c,
                category: editedCat.category,
                iconValue: editedCat.iconValue,
                icon: IconMap[editedCat.iconValue] || IconMap.Folder,
              }
            : c,
        ),
      )
    } else {
      const tempId = editedCat.categoryId || `temp-${Date.now()}`
      setSortList((prev) => {
        const copy = [...prev]
        const existingIdx = copy.findIndex((c) => c.categoryId === tempId)
        if (existingIdx >= 0) {
          copy[existingIdx] = {
            ...copy[existingIdx],
            category: editedCat.category,
            iconValue: editedCat.iconValue,
            icon: IconMap[editedCat.iconValue] || IconMap.Folder,
          }
        } else {
          copy.push({
            categoryId: tempId,
            category: editedCat.category,
            iconValue: editedCat.iconValue,
            icon: IconMap[editedCat.iconValue] || IconMap.Folder,
            sortOrder: prev.length,
            siteCount: 0,
          })
        }
        return copy
      })
    }
    setIsDirty(true)
  }

  const handleSave = async () => {
    if (isSaving) return
    setIsSaving(true)
    try {
      for (const catId of deletedCategoryIds) {
        await navService.deleteRecommendCategory(catId)
      }

      await Promise.all(
        sortList.map((cat, idx) => {
          if (cat.categoryId.startsWith('temp-')) {
            return navService.addRecommendCategory({
              name: cat.category,
              icon: cat.iconValue,
              sortOrder: idx,
            })
          } else {
            return navService.updateRecommendCategory(cat.categoryId, {
              name: cat.category,
              icon: cat.iconValue,
              sortOrder: idx,
            })
          }
        }),
      )
      toast.success('分类排序已保存', { duration: 2000 })
      setIsDirty(false)
      onSaveComplete()
      onClose()
    } catch (err) {
      console.error('保存分类排序失败', err)
      toast.error('保存失败，请重试')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteCategory = (cat: SortCategory) => {
    if (cat.siteCount > 0) {
      setCategoryToDelete(cat)
      return
    }
    performDelete(cat)
  }

  const performDelete = (cat: SortCategory) => {
    if (!cat.categoryId.startsWith('temp-')) {
      setDeletedCategoryIds((prev) => [...prev, cat.categoryId])
    }
    setSortList((prev) => prev.filter((c) => c.categoryId !== cat.categoryId))
    setIsDirty(true)
    setCategoryToDelete(null)
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      animationType="scale"
      position="center"
      containerClassName="relative bg-card border border-border rounded-3xl shadow-2xl w-[520px] max-w-[95vw] flex flex-col overflow-hidden"
      overlayClassName="bg-black/50 backdrop-blur-sm"
      zIndex={60}
    >
      {/* 标题栏 */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/95">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
            <FolderCog className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="text-base font-medium">分类管理</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              拖拽卡片调整推荐分类的展示顺序
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              setEditingCategory({
                category: '',
                iconValue: 'Folder',
                sortOrder: sortList.length,
              })
            }
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-500 transition-colors cursor-pointer"
            title="新增分类"
          >
            <FolderPlus className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-400 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 分类卡片列表 */}
      <div className="flex-1 overflow-y-auto p-4 max-h-[60vh]">
        {sortList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <FolderCog className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm">暂无可管理的分类</p>
            <p className="text-xs mt-1 text-gray-300">请先在管理模式下创建推荐分类</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sortList.map((c) => c.categoryId)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {sortList.map((cat, idx) => (
                  <SortableListItem key={cat.categoryId} id={cat.categoryId}>
                    {renderCategoryCard(cat, idx, false)}
                  </SortableListItem>
                ))}
              </div>
            </SortableContext>

            <GridDragOverlay>
              {activeId && activeItem ? renderCategoryCard(activeItem, activeIndex, true) : null}
            </GridDragOverlay>
          </DndContext>
        )}
      </div>

      {/* 底部操作栏 */}
      <div className="px-6 py-4 border-t border-border bg-card/95 flex items-center justify-between gap-3">
        <p className="text-xs text-gray-400">
          {isDirty ? (
            <span className="text-amber-500 dark:text-amber-400">● 有未保存的排序变更</span>
          ) : (
            <span>{sortList.length} 个分类</span>
          )}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center border border-border rounded-xl hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            title="取消"
          >
            <X className="w-4 h-4" />
          </button>
          <button
            onClick={handleSave}
            disabled={!isDirty || isSaving || sortList.length === 0}
            className="w-10 h-10 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            title="保存排序"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* 确认删除弹窗 */}
      <BaseModal
        isOpen={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        animationType="scale"
        position="center"
        containerClassName="bg-card p-6 rounded-2xl w-80 shadow-2xl border border-border"
        overlayClassName="bg-black/50 backdrop-blur-sm"
        zIndex={70}
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4 text-red-500">
            <Trash2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-medium mb-2">确认删除该分类？</h3>
          <p className="text-sm text-gray-500 mb-6">
            分类 <span className="font-medium text-foreground">"{categoryToDelete?.category}"</span>{' '}
            包含 <span className="text-red-500 font-medium">{categoryToDelete?.siteCount}</span>{' '}
            个网址。
            <br />
            <span className="text-xs text-gray-400 mt-1 block">
              确认后还需要点击底部「保存」才会生效。
            </span>
          </p>
          <div className="flex items-center gap-3 w-full">
            <button
              onClick={() => setCategoryToDelete(null)}
              className="flex-1 py-2.5 border rounded-xl hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              onClick={() => categoryToDelete && performDelete(categoryToDelete)}
              className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors cursor-pointer"
            >
              确定移除
            </button>
          </div>
        </div>
      </BaseModal>

      {/* 编辑分类弹窗 */}
      <AdminCategoryModal
        editingCategory={editingCategory}
        setEditingCategory={setEditingCategory}
        onSaveCategory={handleSaveCategory}
      />
    </BaseModal>
  )
}
