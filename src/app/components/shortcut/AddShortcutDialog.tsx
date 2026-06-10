/**
 * @description 前端UI组件：AddShortcutDialog.tsx
 * @date 2026-06-09
 */
import React, { useState, useEffect } from 'react';
import { X, Link, Check, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { BaseModal } from '../ui/BaseModal';
import { IconMap } from '../ui/IconMap';
import { navService, IconType } from '../../services/nav-service';
import { recommendedCategories, RecommendedSite, CategoryGroup } from '../../constants/recommendedSitesData';

import { CustomShortcutTab } from './CustomShortcutTab';
import { RecommendSiteItem } from './RecommendSiteItem';
import { AdminDock } from './AdminDock';
import { PendingShortcutsList } from './PendingShortcutsList';
import { AdminCategoryModal } from './AdminCategoryModal';
import { BatchCategoryList } from './BatchCategoryList';
import { useCustomShortcut } from './useCustomShortcut';
import { RecommendedTabGrid } from './RecommendedTabGrid';
import { useBatchCategory } from './useBatchCategory';
import { EditShortcutDialog } from './EditShortcutDialog';

interface AddShortcutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (shortcuts: { name: string; icon: any; color: string; url: string }[]) => void;
  iconSize: number;
  iconRadius: number;
  iconSpacingX?: number;
  iconSpacingY?: number;
  iconTextGap?: number;
  textSize?: number;
  userRole?: string;
}

export function AddShortcutDialog({
  isOpen,
  onClose,
  onAdd,
  iconSize,
  iconRadius,
  iconSpacingX = 16,
  iconSpacingY = 16,
  iconTextGap = 8,
  textSize = 12,
  userRole,
}: AddShortcutDialogProps) {
  const [activeTab, setActiveTab] = useState<'recommended' | 'custom'>('recommended');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isGridAdmin, setIsGridAdmin] = useState(false);
  const [pendingShortcuts, setPendingShortcuts] = useState<RecommendedSite[]>([]);
  const [categories, setCategories] = useState<CategoryGroup[]>([]);
  
  const handleAddRecommendedToPending = (site: RecommendedSite) => {
    setPendingShortcuts([...pendingShortcuts, site]);
  };
  
  const customShortcutControls = useCustomShortcut(handleAddRecommendedToPending);

  // 管理员编辑状态
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editingSite, setEditingSite] = useState<any>(null);

  const loadRecommended = () => {
    navService.getRecommended().then(res => {
      if (res.code === 200 && res.data && res.data.length > 0) {
        const mapped = res.data.map(cat => ({
          categoryId: cat.categoryId,
          category: cat.categoryName,
          icon: IconMap[cat.categoryIcon] || IconMap.Folder,
          iconType: 'BUILTIN',
          iconValue: cat.categoryIcon,
          sortOrder: cat.sortOrder,
          sites: Array.isArray(cat.sites) ? cat.sites.map((site: any) => ({
            siteId: site.siteId,
            name: site.name,
            url: site.url,
            color: site.iconColor || '#333',
            iconColor: site.iconColor || '#333',
            icon: IconMap[site.iconValue] || IconMap.Link,
            iconType: site.iconType,
            iconValue: site.iconValue,
            dragId: site.siteId || Math.random().toString(36).substring(7)
          })) : []
        }));
        setCategories(mapped);
      } else {
        setCategories(recommendedCategories);
      }
    }).catch(err => {
      console.error('Failed to load recommended sites:', err);
      setCategories(recommendedCategories);
    });
  };

  const batchCategoryControls = useBatchCategory(categories, loadRecommended);
  const { isBatchMode, setIsBatchMode, batchEditData, setBatchEditData } = batchCategoryControls;

  useEffect(() => {
    if (isOpen) {
      customShortcutControls.resetCustomState();
      setActiveTab('recommended');
      setIsAdminMode(false);
      setIsGridAdmin(false);
      setIsBatchMode(false);
      setBatchEditData([]);
      loadRecommended();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRemoveFromPending = (index: number) => {
    setPendingShortcuts(pendingShortcuts.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (pendingShortcuts.length > 0) {
      onAdd(pendingShortcuts);
      setPendingShortcuts([]);
      customShortcutControls.resetCustomState();
      onClose();
    }
  };

  const handleCancel = () => {
    setPendingShortcuts([]);
    customShortcutControls.resetCustomState();
    onClose();
  };

  return (
    <>
      <BaseModal
        isOpen={isOpen}
        onClose={onClose}
        animationType="scale"
        position="center"
        containerClassName="relative flex items-stretch h-[90%] w-[85%] max-w-[1400px]"
        overlayClassName="bg-black/50 backdrop-blur-sm"
        zIndex={50}
      >
        {userRole === 'ADMIN' && activeTab === 'recommended' && isAdminMode && (
          <AdminDock
            isBatchMode={batchCategoryControls.isBatchMode}
            setIsBatchMode={batchCategoryControls.setIsBatchMode}
            toggleBatchMode={batchCategoryControls.toggleBatchMode}
            handleSaveAllCategories={batchCategoryControls.handleSaveAllCategories}
            setEditingCategory={setEditingCategory}
            categoriesLength={categories.length}
            handleBatchRefreshAllIcons={batchCategoryControls.handleBatchRefreshAllIcons}
            isAllRefreshing={batchCategoryControls.isAllRefreshing}
          />
        )}

        <div
          className="w-full h-full bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col text-foreground transition-all duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-card/95 border-b border-border px-6 py-4 flex items-center justify-between transition-colors duration-300">
            <h2 className="text-xl font-medium">添加网址</h2>
            <div className="flex items-center gap-3">
              {userRole === 'ADMIN' && (
                <div className="group relative flex items-center justify-center">
                  <button
                    onClick={() => {
                      if (!isAdminMode) {
                        setIsAdminMode(true);
                        setTimeout(() => setIsGridAdmin(true), 300);
                      } else {
                        setIsAdminMode(false);
                        setIsGridAdmin(false);
                        batchCategoryControls.toggleBatchMode(false);
                      }
                    }}
                    title={isAdminMode ? '退出管理模式' : '管理推荐网址'}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm border cursor-pointer ${
                      isAdminMode 
                        ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400' 
                        : 'bg-background hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-600 dark:text-gray-400 border-border'
                    }`}
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              )}
              
              <div className="group relative flex items-center justify-center">
                <button
                  onClick={handleSave}
                  disabled={pendingShortcuts.length === 0}
                  title={`保存更改 ${pendingShortcuts.length > 0 ? `(${pendingShortcuts.length})` : ''}`}
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:bg-gray-200 dark:disabled:bg-neutral-800 disabled:text-gray-400 dark:disabled:text-neutral-600 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Check className="w-5 h-5" />
                </button>
              </div>

              <div className="group relative flex items-center justify-center">
                <button
                  onClick={handleCancel}
                  title="取消/关闭"
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-background border border-border hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-800 dark:text-gray-200 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex border-b border-border bg-card/90 transition-colors duration-300">
            <button
              onClick={() => setActiveTab('recommended')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'recommended'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              推荐
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'custom'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              自定义
            </button>
          </div>

          <div className="flex-1 overflow-hidden">
            <div className="grid grid-cols-3 h-full">
              <div className={`${isBatchMode ? 'col-span-3' : 'col-span-2'} border-r border-border overflow-y-scroll`}>
                {activeTab === 'recommended' ? (
                  <div className="p-6 space-y-8 relative">
                    {isBatchMode ? (
                      <div key="list-mode" className="space-y-8 relative animate-in fade-in slide-in-from-right-4 duration-500">
                        <input type="file" ref={batchCategoryControls.rowFileInputRef} onChange={batchCategoryControls.handleRowIconUpload} className="hidden" accept="image/*" />
                        <BatchCategoryList {...batchCategoryControls} />
                      </div>
                    ) : (
                      <div key="grid-mode" className="h-full animate-in fade-in slide-in-from-left-4 duration-500">
                        <RecommendedTabGrid
                          categories={categories}
                          setCategories={setCategories}
                          userRole={isGridAdmin ? 'ADMIN' : 'USER'}
                          iconSize={iconSize}
                          iconRadius={iconRadius}
                          iconSpacingX={iconSpacingX}
                          iconSpacingY={iconSpacingY}
                          iconTextGap={iconTextGap}
                          textSize={textSize}
                          setEditingCategory={setEditingCategory}
                          setEditingSite={setEditingSite}
                          loadRecommended={loadRecommended}
                          handleAddRecommendedToPending={handleAddRecommendedToPending}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <CustomShortcutTab
                    {...customShortcutControls}
                    iconRadius={iconRadius}
                  />
                )}
              </div>

              {!isBatchMode && (
                <PendingShortcutsList
                  pendingShortcuts={pendingShortcuts}
                  iconRadius={iconRadius}
                  handleRemoveFromPending={handleRemoveFromPending}
                />
              )}
            </div>
          </div>
        </div>
      </BaseModal>

      <AdminCategoryModal
        editingCategory={editingCategory}
        setEditingCategory={setEditingCategory}
        loadRecommended={loadRecommended}
      />

      <EditShortcutDialog
        isOpen={!!editingSite}
        onClose={() => setEditingSite(null)}
        shortcut={{
          id: editingSite?.siteId,
          name: editingSite?.name || '',
          url: editingSite?.url || '',
          iconType: editingSite?.iconType || 'FAVICON',
          iconValue: editingSite?.iconValue || '',
        }}
        onSave={(shortcut) => {
          if (!editingSite.categoryId) {
            toast.warning('分类ID丢失，请刷新页面重试');
            return;
          }
          
          setCategories(prev => {
            const copy = [...prev];
            const catIdx = copy.findIndex(c => c.categoryId === editingSite.categoryId);
            if (catIdx === -1) return copy;
            
            if (editingSite.siteId || editingSite.dragId) {
              const siteIdx = copy[catIdx].sites.findIndex(s => 
                (editingSite.siteId && s.siteId === editingSite.siteId) || 
                (editingSite.dragId && s.dragId === editingSite.dragId)
              );
              
              if (siteIdx !== -1) {
                copy[catIdx].sites[siteIdx] = {
                  ...copy[catIdx].sites[siteIdx],
                  name: shortcut.name,
                  url: shortcut.url,
                  iconType: (shortcut.iconType || 'FAVICON') as IconType,
                  iconValue: shortcut.iconValue || '',
                };
              }
            } else {
              copy[catIdx].sites.push({
                name: shortcut.name,
                url: shortcut.url,
                iconType: (shortcut.iconType || 'FAVICON') as IconType,
                iconValue: shortcut.iconValue || '',
                color: '#4285F4',
                icon: Link,
                dragId: Math.random().toString(36).substring(7)
              });
            }
            return copy;
          });
          setEditingSite(null);
        }}
      />
    </>
  );
}
