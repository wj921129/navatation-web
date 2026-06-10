/**
 * @description 推荐分类网格组件
 * @date 2026-06-09
 */
import React from 'react';
import { Edit3, Trash2, Plus } from 'lucide-react';
import { DndContext, useSensor, useSensors, PointerSensor, closestCenter, DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { SortableGridItem } from '../ui/SortableGridItem';
import { GridDragOverlay, UnifiedDragItem } from '../ui/GridDragOverlay';
import { RecommendSiteItem } from './RecommendSiteItem';
import { navService } from '../../services/nav-service';
import { toast } from 'sonner';

export interface RecommendedTabGridProps {
  categories: any[];
  setCategories: React.Dispatch<React.SetStateAction<any[]>>;
  userRole?: string;
  iconSize: number;
  iconRadius: number;
  iconSpacingX: number;
  iconSpacingY: number;
  iconTextGap: number;
  textSize: number;
  setEditingCategory: (cat: any) => void;
  setEditingSite: (site: any) => void;
  loadRecommended: () => void;
  handleAddRecommendedToPending: (site: any) => void;
}

export function RecommendedTabGrid({
  categories,
  setCategories,
  userRole,
  iconSize,
  iconRadius,
  iconSpacingX,
  iconSpacingY,
  iconTextGap,
  textSize,
  setEditingCategory,
  setEditingSite,
  loadRecommended,
  handleAddRecommendedToPending
}: RecommendedTabGridProps) {
  const borderRadius = `${iconRadius}%`;
  const [activeDragId, setActiveDragId] = React.useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragStartGrid = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  };

  const handleDragEndGrid = (event: DragEndEvent) => {
    setActiveDragId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setCategories((prev: any[]) => {
      const copy = prev.map(c => ({ ...c, sites: [...c.sites] }));
      
      let sourceCatIdx = -1, sourceSiteIdx = -1;
      let destCatIdx = -1, destSiteIdx = -1;
      
      for (let i = 0; i < copy.length; i++) {
        const sIdx = copy[i].sites.findIndex((s: any) => s.dragId === active.id);
        if (sIdx !== -1) {
          sourceCatIdx = i;
          sourceSiteIdx = sIdx;
        }
        const oIdx = copy[i].sites.findIndex((s: any) => s.dragId === over.id);
        if (oIdx !== -1) {
          destCatIdx = i;
          destSiteIdx = oIdx;
        }
      }
      
      if (sourceCatIdx !== -1 && destCatIdx !== -1 && sourceCatIdx === destCatIdx) {
        const [movedSite] = copy[sourceCatIdx].sites.splice(sourceSiteIdx, 1);
        copy[destCatIdx].sites.splice(destSiteIdx, 0, movedSite);
      }
      
      return copy;
    });
  };

  const activeDragShortcut = activeDragId 
    ? categories.flatMap(c => c.sites).find(s => s.dragId === activeDragId) 
    : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStartGrid}
      onDragEnd={handleDragEndGrid}
      onDragCancel={() => setActiveDragId(null)}
    >
      <div className="space-y-8">
        {categories.map((category, catIdx) => (
          <div key={category.category}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <category.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h3 className="text-base font-medium">{category.category}</h3>
              </div>
              {userRole === 'ADMIN' && (
                <div className="flex items-center gap-2">
                  <button onClick={() => {
                    if (!category.categoryId) {
                      toast.warning('当前为系统内置推荐分类，不可直接编辑。请先在数据库中建立。');
                      return;
                    }
                    setEditingCategory({ ...category })
                  }} className="p-1 text-gray-400 hover:text-blue-500 rounded"><Edit3 className="w-4 h-4" /></button>
                  <button onClick={() => {
                    if (!category.categoryId) return;
                    navService.deleteRecommendCategory(category.categoryId!).then(loadRecommended)
                  }} className="p-1 text-gray-400 hover:text-red-500 rounded"><Trash2 className="w-4 h-4" /></button>
                  <button onClick={() => {
                    if (!category.categoryId) {
                      toast.warning('请先编辑并保存该分类到数据库，然后才能新增网址。');
                      return;
                    }
                    setEditingSite({ categoryId: category.categoryId, iconType: 'FAVICON', iconColor: '#fff' })
                  }} className="p-1 text-gray-400 hover:text-green-500 rounded"><Plus className="w-4 h-4" /></button>
                </div>
              )}
            </div>
            <div 
              className="flex flex-wrap items-start pb-4"
              style={{ gap: `${iconSpacingY}px ${iconSpacingX}px` }}
            >
              <SortableContext items={category.sites.map((s: any) => s.dragId!)} strategy={rectSortingStrategy}>
                {category.sites.map((site: any) => (
                  <SortableGridItem key={site.dragId!} id={site.dragId!}>
                    <RecommendSiteItem
                      site={site}
                      catIdx={catIdx}
                      iconSize={iconSize}
                      borderRadius={borderRadius}
                      iconTextGap={iconTextGap}
                      textSize={textSize}
                      userRole={userRole}
                      category={category}
                      setEditingSite={setEditingSite}
                      setCategories={setCategories}
                      handleAddRecommendedToPending={handleAddRecommendedToPending}
                    />
                  </SortableGridItem>
                ))}
              </SortableContext>
              {userRole === 'ADMIN' && (
                <div 
                  className="relative group/item flex-shrink-0" 
                  style={{ width: `${iconSize + 32}px` }}
                >
                  <button
                    onClick={() => {
                      if (!category.categoryId) {
                        toast.warning('系统内置推荐分类不可添加网址。请先保存该分类到数据库，或新建自定义分类。');
                        return;
                      }
                      setEditingSite({ categoryId: category.categoryId, name: '', url: '', iconType: 'FAVICON', iconValue: '', iconColor: '#fff' })
                    }}
                    className="flex flex-col items-center group cursor-pointer w-full"
                    style={{ gap: `${iconTextGap}px` }}
                  >
                    <div
                      className="bg-card/50 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/30 transition-all duration-200"
                      style={{ width: `${iconSize}px`, height: `${iconSize}px`, borderRadius }}
                    >
                      <Plus className="w-6 h-6 text-gray-400 group-hover:text-blue-500" />
                    </div>
                    <span 
                      className="text-gray-500 dark:text-gray-400 group-hover:text-blue-500 truncate w-full text-center font-light tracking-wide"
                      style={{ fontSize: `${textSize}px` }}
                    >
                      新增网址
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <GridDragOverlay>
        {activeDragShortcut ? (
          <UnifiedDragItem 
            shortcut={activeDragShortcut} 
            iconSize={iconSize} 
            borderRadius={borderRadius} 
            showText={false}
          />
        ) : null}
      </GridDragOverlay>
    </DndContext>
  );
}
