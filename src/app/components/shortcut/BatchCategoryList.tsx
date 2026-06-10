import React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Loader2, Link as LinkIcon, RotateCw, Upload, Trash2, Plus, GripVertical, Check } from 'lucide-react';
import { IconMap } from '../ui/IconMap';
import { useProgressiveRender } from '../../hooks/useProgressiveRender';

/**
 * 批量管理模式下的分类列表组件
 * 创建日期: 2026-06-09
 */
interface BatchCategoryListProps {
  batchEditData: any[];
  rowLoadingStatus: Record<string, boolean>;
  rowDetectedIcons: Record<string, string[]>;
  handleBatchRefreshCategoryIcons: (catIdx: number) => void;
  handleAddEmptyRow: (catIdx: number) => void;
  handleSaveCategorySites: (category: any) => void;
  updateBatchEditSite: (catIdx: number, siteIdx: number, fields: any) => void;
  setRowDetectedIcons: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  handleDetectRowIcon: (catIdx: number, siteIdx: number) => void;
  handleTriggerRowUpload: (catIdx: number, siteIdx: number) => void;
  handleDeleteRow: (catIdx: number, siteIdx: number) => void;
  setBatchEditData: React.Dispatch<React.SetStateAction<any[]>>;
}

export function BatchCategoryList({
  batchEditData,
  rowLoadingStatus,
  rowDetectedIcons,
  handleBatchRefreshCategoryIcons,
  handleAddEmptyRow,
  handleSaveCategorySites,
  updateBatchEditSite,
  setRowDetectedIcons,
  handleDetectRowIcon,
  handleTriggerRowUpload,
  handleDeleteRow,
  setBatchEditData,
}: BatchCategoryListProps) {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    if (result.type === 'category') {
      const sourceIdx = result.source.index;
      const destIdx = result.destination.index;
      if (sourceIdx === destIdx) return;
      
      setBatchEditData(prev => {
        const copy = [...prev];
        const [moved] = copy.splice(sourceIdx, 1);
        copy.splice(destIdx, 0, moved);
        return copy;
      });
      return;
    }

    const sourceCatIdx = parseInt(result.source.droppableId);
    const destCatIdx = parseInt(result.destination.droppableId);
    const sourceIdx = result.source.index;
    const destIdx = result.destination.index;
    
    if (sourceCatIdx === destCatIdx && sourceIdx === destIdx) return;

    setBatchEditData(prev => {
      const copy = [...prev];
      if (sourceCatIdx === destCatIdx) {
        const sites = [...copy[sourceCatIdx].sites];
        const [moved] = sites.splice(sourceIdx, 1);
        sites.splice(destIdx, 0, moved);
        copy[sourceCatIdx].sites = sites;
      } else {
        const sourceSites = [...copy[sourceCatIdx].sites];
        const destSites = [...copy[destCatIdx].sites];
        const [moved] = sourceSites.splice(sourceIdx, 1);
        destSites.splice(destIdx, 0, moved);
        copy[sourceCatIdx].sites = sourceSites;
        copy[destCatIdx].sites = destSites;
      }
      return copy;
    });
  };
  const renderedCount = useProgressiveRender({
    total: batchEditData.length,
    batchSize: 2,
    delay: 100
  });

  const visibleCategories = batchEditData.slice(0, renderedCount);

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="categories" type="category" direction="vertical">
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-4 relative pb-32">
            {visibleCategories.map((category, catIdx) => (
              <Draggable key={category.categoryId || `cat-${catIdx}`} draggableId={category.categoryId || `cat-${catIdx}`} index={catIdx}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    style={{
                      ...provided.draggableProps.style,
                      transition: snapshot.isDropAnimating
                        ? 'transform 0.12s cubic-bezier(0.2, 1, 0.1, 1)'
                        : provided.draggableProps.style?.transition
                    }}
                    className="bg-muted/40 border border-border p-6 rounded-3xl shadow-sm space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-shrink-0 cursor-pointer active:cursor-pointerbing text-gray-400 hover:text-blue-500" {...provided.dragHandleProps}>
                          <GripVertical className="w-5 h-5" />
                        </div>
                        <category.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <h3 className="text-base font-medium">{category.category}</h3>
                      </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBatchRefreshCategoryIcons(catIdx)}
                className="flex items-center justify-center w-8 h-8 bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 rounded-lg cursor-pointer transition-colors"
                title="批量刷新当前分类下所有网址的图�?
              >
                <RotateCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleAddEmptyRow(catIdx)}
                className="flex items-center justify-center w-8 h-8 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg cursor-pointer transition-colors"
                title="新增网址"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleSaveCategorySites(category)}
                className="flex items-center justify-center w-8 h-8 bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 rounded-lg cursor-pointer transition-colors"
                title="保存修改"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {category.sites.length === 0 ? (
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-6">暂无网址，请点击右上方“新增网址�?/p>
            ) : (
              <>
                <Droppable droppableId={catIdx.toString()} direction="vertical">
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-1.5">
                      {category.sites.map((site: any, siteIdx: number) => {
                        const rowKey = `${catIdx}-${siteIdx}`;
                        const isLoading = !!rowLoadingStatus[rowKey];
                        const detectedIcons = rowDetectedIcons[rowKey] || [];
                        
                        return (
                          <Draggable key={site.dragId!} draggableId={site.dragId!} index={siteIdx}>
                            {(provided, snapshot) => (
                              <div 
                                ref={provided.innerRef} 
                                {...provided.draggableProps} 
                                {...provided.dragHandleProps}
                                className="bg-background border border-border/60 hover:border-border/100 rounded-xl p-2 flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow transition-colors duration-200"
                                style={{
                                  ...provided.draggableProps.style,
                                  transition: snapshot.isDropAnimating
                                    ? 'transform 0.12s cubic-bezier(0.2, 1, 0.1, 1)'
                                    : provided.draggableProps.style?.transition
                                }}
                              >
                                <div className="flex items-center gap-2 w-full">
                                  {/* 拖拽把手 */}
                                  <div className="flex-shrink-0 cursor-pointer active:cursor-pointerbing text-gray-400 hover:text-blue-500">
                                    <GripVertical className="w-5 h-5" />
                                  </div>
                                  {/* 图标展示�?*/}
                                  <div className="flex-shrink-0 flex items-center justify-center bg-card shadow-inner border border-border overflow-hidden w-10 h-10 rounded-full relative">
                                    {isLoading ? (
                                      <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                                    ) : (
                                      (() => {
                                        if (site.iconType === 'CUSTOM_URL' || site.iconType === 'FAVICON' || site.iconType === 'CUSTOM_UPLOAD') {
                                          return <img src={site.iconValue} alt={site.name} className="w-[24px] h-[24px] object-contain" onError={(e) => {
                                            (e.target as any).style.display = 'none';
                                          }} />;
                                        }
                                        const IconComponent = IconMap[site.iconValue || ''] || LinkIcon;
                                        return (
                                          <IconComponent
                                            style={{
                                              color: site.color || '#333',
                                              width: `24px`,
                                              height: `24px`,
                                            }}
                                            strokeWidth={2}
                                          />
                                        );
                                      })()
                                    )}
                                  </div>
                                  
                                  {/* 输入区域 - 单行紧凑排列 */}
                                  <div className="flex items-center gap-2">
                                    <div className="w-48 flex-shrink-0">
                                      <input
                                        type="text"
                                        value={site.name}
                                        onChange={(e) => updateBatchEditSite(catIdx, siteIdx, { name: e.target.value })}
                                        className="w-full px-2 py-2 text-sm bg-card border border-border rounded-lg outline-none focus:border-blue-500 focus:bg-background transition-colors"
                                        placeholder="名称"
                                        title="网站名称"
                                      />
                                    </div>
                                    <div className="w-80 flex-shrink-0">
                                      <input
                                        type="text"
                                        value={site.url}
                                        onChange={(e) => updateBatchEditSite(catIdx, siteIdx, { url: e.target.value })}
                                        className="w-full px-2 py-2 text-sm bg-card border border-border rounded-lg outline-none focus:border-blue-500 focus:bg-background transition-colors"
                                        placeholder="https://..."
                                        title="网址链接"
                                      />
                                    </div>
                                  </div>

                                  {/* 多图标选择区域 - 直接放在同一�?*/}
                                  {detectedIcons.length > 0 && (
                                    <div className="flex items-center gap-1.5 border-l border-border/50 pl-2 flex-1 overflow-x-auto scrollbar-none">
                                      {detectedIcons.map((url, idx) => (
                                        <button
                                          key={idx}
                                          onClick={(e) => {
                                            e.preventDefault();
                                            updateBatchEditSite(catIdx, siteIdx, {
                                              iconType: 'FAVICON',
                                              iconValue: url
                                            });
                                          }}
                                          className={`w-9 h-9 flex-shrink-0 bg-card shadow-sm border rounded-lg flex items-center justify-center overflow-hidden transition-all cursor-pointer ${
                                            site.iconValue === url ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-border hover:border-gray-400 dark:hover:border-gray-500'
                                          }`}
                                          title="点击使用此图�?
                                        >
                                          <img
                                            src={url}
                                            alt="Icon"
                                            className="w-5 h-5 object-contain"
                                          />
                                        </button>
                                      ))}
                                      <input
                                        type="text"
                                        value={site.iconValue || ''}
                                        readOnly={site.iconType === 'FAVICON'}
                                        onChange={(e) => updateBatchEditSite(catIdx, siteIdx, { iconValue: e.target.value, iconType: 'CUSTOM_URL' })}
                                        className={`w-56 px-2 py-1.5 text-xs bg-card border border-border rounded-md outline-none transition-colors ml-2 flex-shrink-0 ${site.iconType === 'FAVICON' ? 'text-gray-400 cursor-text' : 'text-foreground focus:border-blue-500'}`}
                                        placeholder="手动输入自定义图标URL"
                                        title={site.iconType === 'FAVICON' ? "搜索结果不可编辑，可双击复制" : "手动输入自定义图标URL"}
                                      />
                                      <button
                                        onClick={(e) => {
                                          e.preventDefault();
                                          setRowDetectedIcons(prev => ({ ...prev, [rowKey]: [] }));
                                        }}
                                        className="w-9 h-9 flex-shrink-0 text-gray-400 hover:text-red-500 rounded-lg flex items-center justify-center transition-colors cursor-pointer ml-1"
                                        title="清除多余图标选项"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  )}
                                  {!detectedIcons.length && <div className="flex-1"></div>}

                                  {/* 操作按钮�?*/}
                                  <div className="flex-shrink-0 flex items-center gap-1">
                                    <button
                                      onClick={() => handleDetectRowIcon(catIdx, siteIdx)}
                                      disabled={isLoading}
                                      className="p-2 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                                      title="自动刷新并检测网站图�?
                                    >
                                      <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                                    </button>
                                    <button
                                      onClick={() => handleTriggerRowUpload(catIdx, siteIdx)}
                                      disabled={isLoading}
                                      className="p-2 bg-card border border-border hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-700 dark:text-gray-300 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                                      title="上传本地图片"
                                    >
                                      <Upload className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteRow(catIdx, siteIdx)}
                                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                                      title="移除此行"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
                
                <button
                  onClick={() => handleAddEmptyRow(catIdx)}
                  className="w-full mt-2 py-3 border-2 border-dashed border-border hover:border-blue-400 hover:bg-blue-50/50 dark:hover:border-blue-500/50 dark:hover:bg-blue-900/10 rounded-xl flex items-center justify-center gap-2 text-gray-400 hover:text-blue-500 transition-all cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-neutral-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 flex items-center justify-center transition-colors">
                    <Plus className="w-5 h-5 text-gray-500 group-hover:text-blue-500" />
                  </div>
                </button>
              </>
            )}
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
  );
}
