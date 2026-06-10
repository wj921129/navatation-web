/**
 * @description 推荐网址分类排序对话框
 * 管理员专用：以直观的拖拽卡片方式调整推荐分类的显示顺序
 * @date 2026-06-10
 */
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { GripVertical, ArrowUpDown, Check, X, Loader2 } from 'lucide-react';
import { BaseModal } from '../ui/BaseModal';
import { navService } from '../../services/nav-service';
import { toast } from 'sonner';

interface SortCategory {
  categoryId: string;
  category: string;
  icon: React.ComponentType<any>;
  iconValue: string;
  sortOrder: number;
  siteCount: number;
}

interface RecommendCategorySortDialogProps {
  isOpen: boolean;
  onClose: () => void;
  categories: any[];
  onSaveComplete: () => void;
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
  const [sortList, setSortList] = useState<SortCategory[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // 弹窗打开时，初始化排序列表
  useEffect(() => {
    if (isOpen) {
      const validCats = categories
        .filter(c => !!c.categoryId)
        .map(c => ({
          categoryId: c.categoryId,
          category: c.category,
          icon: c.icon,
          iconValue: c.iconValue,
          sortOrder: c.sortOrder ?? 0,
          siteCount: Array.isArray(c.sites) ? c.sites.length : 0,
        }))
        .sort((a, b) => a.sortOrder - b.sortOrder);
      setSortList(validCats);
      setIsDirty(false);
    }
  }, [isOpen, categories]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const src = result.source.index;
    const dst = result.destination.index;
    if (src === dst) return;

    setSortList(prev => {
      const copy = [...prev];
      const [moved] = copy.splice(src, 1);
      copy.splice(dst, 0, moved);
      return copy;
    });
    setIsDirty(true);
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      // 依次更新每个分类的 sortOrder（只更新有 categoryId 的分类）
      await Promise.all(
        sortList.map((cat, idx) =>
          navService.updateRecommendCategory(cat.categoryId, {
            name: cat.category,
            icon: cat.iconValue,
            sortOrder: idx,
          })
        )
      );
      toast.success('分类排序已保存', { duration: 2000 });
      setIsDirty(false);
      onSaveComplete();
      onClose();
    } catch (err) {
      console.error('保存分类排序失败', err);
      toast.error('保存失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

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
            <ArrowUpDown className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="text-base font-medium">分类管理</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">拖拽卡片调整推荐分类的展示顺序</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-400 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 分类卡片列表 */}
      <div className="flex-1 overflow-y-auto p-4 max-h-[60vh]">
        {sortList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <ArrowUpDown className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm">暂无可排序的分类</p>
            <p className="text-xs mt-1 text-gray-300">请先在管理模式下创建推荐分类</p>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="category-sort" direction="vertical">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-2"
                >
                  {sortList.map((cat, idx) => (
                    <Draggable key={cat.categoryId} draggableId={cat.categoryId} index={idx}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          style={{
                            ...provided.draggableProps.style,
                            transition: snapshot.isDropAnimating
                              ? 'transform 0.15s cubic-bezier(0.2, 1, 0.1, 1)'
                              : provided.draggableProps.style?.transition,
                          }}
                          className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-200 select-none ${
                            snapshot.isDragging
                              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 shadow-lg scale-[1.02]'
                              : 'bg-background border-border hover:border-gray-300 dark:hover:border-neutral-600 hover:shadow-sm'
                          }`}
                        >
                          {/* 序号徽标 */}
                          <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                              {idx + 1}
                            </span>
                          </div>

                          {/* 分类图标 */}
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border border-indigo-100 dark:border-indigo-800/30 flex items-center justify-center flex-shrink-0">
                            <cat.icon className="w-4.5 h-4.5 text-indigo-500 dark:text-indigo-400" style={{ width: '18px', height: '18px' }} />
                          </div>

                          {/* 分类名称 & 网址数量 */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{cat.category}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                              {cat.siteCount} 个网址
                            </p>
                          </div>

                          {/* 拖拽把手 */}
                          <div
                            {...provided.dragHandleProps}
                            className="flex-shrink-0 cursor-grab active:cursor-grabbing text-gray-300 dark:text-gray-600 hover:text-indigo-400 dark:hover:text-indigo-500 transition-colors p-1"
                          >
                            <GripVertical className="w-5 h-5" />
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
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
            className="px-4 py-2 text-sm border border-border rounded-xl hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={!isDirty || isSaving || sortList.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSaving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
            {isSaving ? '保存中...' : '保存排序'}
          </button>
        </div>
      </div>
    </BaseModal>
  );
}
