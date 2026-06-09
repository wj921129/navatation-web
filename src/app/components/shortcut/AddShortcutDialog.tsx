/**
 * @description 前端UI组件：AddShortcutDialog.tsx
 * @date 2026-06-10
 */
import { X, Link, Upload, Trash2, Loader2, Check, RotateCw, Plus, Edit3, GripVertical, Grid, List, FolderPlus } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { toast } from 'sonner';
import { EditShortcutDialog } from './EditShortcutDialog';
import { IconMap } from '../ui/IconMap';
import { BaseModal } from '../ui/BaseModal';
import { useState, useEffect, useRef } from 'react';
import { DndContext, useSensor, useSensors, PointerSensor, closestCenter, DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { SortableGridItem } from '../ui/SortableGridItem';
import { GridDragOverlay } from '../ui/GridDragOverlay';
import { navService, IconType } from '../../services/nav-service';

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

import { recommendedCategories, RecommendedSite, CategoryGroup } from '../../constants/recommendedSitesData';

import { isValidDomainOrUrl, getDebounceDelay, useFaviconDetector } from '../../hooks/useFaviconDetector';
import { CustomShortcutTab } from './CustomShortcutTab';
import { RecommendSiteItem } from './RecommendSiteItem';
import { AdminDock } from './AdminDock';
import { PendingShortcutsList } from './PendingShortcutsList';
import { AdminCategoryModal } from './AdminCategoryModal';
import { BatchCategoryList } from './BatchCategoryList';

/**
 * 添加捷径对话框组件。
 * 支持浏览并选择推荐网站，以及输入链接与图标来自定义创建捷径。
 * 创建日期: 2026-06-09
 */
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
  const [customName, setCustomName] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [customIconUrl, setCustomIconUrl] = useState('');
  const [pendingShortcuts, setPendingShortcuts] = useState<RecommendedSite[]>([]);
  const [categories, setCategories] = useState<CategoryGroup[]>([]);
  const [faviconStatus, setFaviconStatus] = useState<'idle' | 'loading' | 'detected' | 'error' | 'uploading'>('idle');
  const [iconFromUpload, setIconFromUpload] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [detectedIcons, setDetectedIcons] = useState<string[]>([]);
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>();

  // dnd-kit state
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

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

    setCategories(prev => {
      const copy = prev.map(c => ({ ...c, sites: [...c.sites] }));
      
      let sourceCatIdx = -1, sourceSiteIdx = -1;
      let destCatIdx = -1, destSiteIdx = -1;
      
      for (let i = 0; i < copy.length; i++) {
        const sIdx = copy[i].sites.findIndex(s => s.dragId === active.id);
        if (sIdx !== -1) {
          sourceCatIdx = i;
          sourceSiteIdx = sIdx;
        }
        const oIdx = copy[i].sites.findIndex(s => s.dragId === over.id);
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

  // 管理员编辑状态
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editingSite, setEditingSite] = useState<any>(null);

  // 批量管理状态
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [batchEditData, setBatchEditData] = useState<CategoryGroup[]>([]);
  
  const {
    rowLoadingStatus,
    rowDetectedIcons,
    isAllRefreshing,
    setRowLoadingStatus,
    setRowDetectedIcons,
    handleDetectRowIcon,
    handleBatchRefreshCategoryIcons,
    handleBatchRefreshAllIcons
  } = useFaviconDetector(batchEditData, setBatchEditData, (catIdx, siteIdx, fields) => updateBatchEditSite(catIdx, siteIdx, fields));
  
  const rowFileInputRef = useRef<HTMLInputElement>(null);
  const activeUploadRow = useRef<{ catIdx: number; siteIdx: number } | null>(null);

  useEffect(() => {
    if (isBatchMode) {
      const deepCopied = categories.map(cat => ({
        ...cat,
        sites: Array.isArray(cat.sites) ? cat.sites.map(site => ({ ...site })) : []
      }));
      setBatchEditData(deepCopied);
    }
  }, [isBatchMode, categories]);

  const updateBatchEditSite = (catIdx: number, siteIdx: number, fields: Partial<RecommendedSite>) => {
    setBatchEditData(prev => {
      const copy = [...prev];
      copy[catIdx].sites[siteIdx] = {
        ...copy[catIdx].sites[siteIdx],
        ...fields
      };
      return copy;
    });
  };

  const handleTriggerRowUpload = (catIdx: number, siteIdx: number) => {
    activeUploadRow.current = { catIdx, siteIdx };
    if (rowFileInputRef.current) {
      rowFileInputRef.current.click();
    }
  };

  const handleRowIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeUploadRow.current) return;
    e.target.value = '';
    const { catIdx, siteIdx } = activeUploadRow.current;
    const rowKey = `${catIdx}-${siteIdx}`;
    
    setRowLoadingStatus(prev => ({ ...prev, [rowKey]: true }));
    try {
      const res = await navService.uploadIcon(file);
      if (res.code === 200 && res.data?.iconUrl) {
        updateBatchEditSite(catIdx, siteIdx, {
          iconType: 'CUSTOM_UPLOAD',
          iconValue: res.data.iconUrl
        });
        setRowDetectedIcons(prev => ({ ...prev, [rowKey]: [res.data.iconUrl] }));
      }
    } catch (err) {
      console.error('Row upload icon error:', err);
    } finally {
      setRowLoadingStatus(prev => ({ ...prev, [rowKey]: false }));
      activeUploadRow.current = null;
    }
  };

  const handleAddEmptyRow = (catIdx: number) => {
    setBatchEditData(prev => {
      const copy = [...prev];
      const categorySites = copy[catIdx].sites;
      const newEmptySite: RecommendedSite = {
        name: '',
        url: '',
        icon: Link,
        iconType: 'FAVICON' as IconType,
        iconValue: '',
        color: '#4285F4',
        dragId: Math.random().toString(36).substring(7)
      };
      
      copy[catIdx].sites = [...categorySites, newEmptySite];
      return copy;
    });
  };

  const handleDeleteRow = (catIdx: number, siteIdx: number) => {
    setBatchEditData(prev => {
      const copy = [...prev];
      copy[catIdx].sites = copy[catIdx].sites.filter((_, idx) => idx !== siteIdx);
      return copy;
    });
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination } = result;

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const sourceCatIdx = parseInt(source.droppableId);
    const destCatIdx = parseInt(destination.droppableId);

    const updateData = (prev: CategoryGroup[]) => {
      const copy = prev.map(c => ({...c, sites: [...c.sites]}));
      const [movedSite] = copy[sourceCatIdx].sites.splice(source.index, 1);
      copy[destCatIdx].sites.splice(destination.index, 0, movedSite);
      return copy;
    };

    if (isBatchMode) {
      setBatchEditData(updateData);
    } else {
      setCategories(updateData);
    }
  };


  const handleSaveAllCategories = async () => {
    const dataToSave = isBatchMode ? batchEditData : categories;
    try {
      // Validate first
      for (const cat of dataToSave) {
        for (let i = 0; i < cat.sites.length; i++) {
          const site = cat.sites[i];
          if (!site.name.trim() || !site.url.trim()) {
            toast.warning(`分类【${cat.category}】下的部分网址名称或链接为空，请补充完整再保存。`);
            return;
          }
        }
      }

      await Promise.all(dataToSave.map(cat => {
        if (!cat.categoryId) return Promise.resolve();
        const formattedSites = cat.sites.map(site => ({
          siteId: site.siteId,
          name: site.name.trim(),
          url: site.url.trim().startsWith('http') ? site.url.trim() : `https://${site.url.trim()}`,
          iconType: site.iconType || 'FAVICON',
          iconValue: site.iconValue || '',
          iconColor: site.color || '#fff'
        }));
        return navService.batchSaveRecommendSites(cat.categoryId, { sites: formattedSites });
      }));
      loadRecommended();
      toast.success('已保存', { duration: 2000 });
    } catch (err) {
      console.error('Batch save all sites error:', err);
    }
  };

  const handleSaveCategorySites = async (categoryGroup: CategoryGroup) => {
    const categoryId = categoryGroup.categoryId;
    if (!categoryId) {
      toast.warning('分类不存在或未在数据库建立，请先保存该分类。');
      return;
    }
    
    const sites = categoryGroup.sites;
    for (let i = 0; i < sites.length; i++) {
      const site = sites[i];
      if (!site.name.trim()) {
        toast.warning(`第 ${i + 1} 行网站名称不能为空`);
        return;
      }
      if (!site.url.trim()) {
        toast.warning(`第 ${i + 1} 行网址链接不能为空`);
        return;
      }
    }
    
    const formattedSites = sites.map(site => ({
      siteId: site.siteId,
      name: site.name.trim(),
      url: site.url.trim().startsWith('http') ? site.url.trim() : `https://${site.url.trim()}`,
      iconType: site.iconType || 'FAVICON',
      iconValue: site.iconValue || '',
      iconColor: site.color || '#fff'
    }));
    
    try {
      const res = await navService.batchSaveRecommendSites(categoryId, { sites: formattedSites });
      if (res.code === 200) {
        loadRecommended();
        toast.success('已保存', { duration: 2000 });
      }
    } catch (err) {
      console.error('Batch save sites error:', err);
    }
  };

  const loadRecommended = () => {
    navService.getRecommended().then(res => {
      if (res.code === 200 && res.data && res.data.length > 0) {
        // 格式化后端推荐数据为组件渲染结构
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

  // 触发网址图标搜索的核心逻辑
  const triggerSearch = (url: string) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    const targetUrl = url.trim();
    if (!targetUrl) {
      setFaviconStatus('idle');
      setUploadError(null);
      setDetectedIcons([]);
      setCustomIconUrl('');
      return;
    }

    // 若域名格式不完整或不合法，不进行搜索
    if (!isValidDomainOrUrl(targetUrl)) {
      setFaviconStatus('idle');
      return;
    }

    const fullUrl = targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`;
    
    let host = '';
    try {
      const parsed = new URL(fullUrl);
      host = parsed.host;
    } catch {
      setFaviconStatus('idle');
      setUploadError(null);
      setDetectedIcons([]);
      return;
    }

    setFaviconStatus('loading');
    setDetectedIcons([]);
    setCustomIconUrl('');

    // 处理并去重追加图标的函数
    const handleIconResult = (iconUrl: string) => {
      if (!iconUrl) return;
      setDetectedIcons(prev => {
        if (prev.includes(iconUrl)) return prev;
        const newIcons = [...prev, iconUrl];
        // 竞速：第一个有效到达的图标作为默认选中
        if (newIcons.length === 1) {
          setCustomIconUrl(iconUrl);
          setCustomIconFile(null);
          setFaviconStatus('detected');
        }
        return newIcons;
      });
    };

    // 1. 瞬时响应：Google CDN
    const googleCdn = `https://www.google.com/s2/favicons?sz=64&domain=${host}`;
    handleIconResult(googleCdn);

    // 2. 备用 CDN：DuckDuckGo
    const ddgCdn = `https://icons.duckduckgo.com/ip3/${host}.ico`;
    const img = new Image();
    img.onload = () => handleIconResult(ddgCdn);
    img.src = ddgCdn;

    // 3. 后端深度爬虫抓取原生图标
    navService.fetchFavicon(fullUrl).then(res => {
      if (res.code === 200 && res.data?.faviconUrl) {
        handleIconResult(res.data.faviconUrl);
      }
    }).catch(() => {
      // 后台错误直接忽略
    });
  };

  // 当用户输入网址时，防抖并并行多路检测网站图标
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    // 如果已经本地上传了图标，则停用通过网址搜索图标功能
    if (iconFromUpload) {
      return;
    }
    const url = customUrl.trim();
    if (!url) {
      setFaviconStatus('idle');
      setUploadError(null);
      setDetectedIcons([]);
      setCustomIconUrl('');
      return;
    }

    // 若域名格式不完整或不合法，保持静默，状态设为 idle
    if (!isValidDomainOrUrl(url)) {
      setFaviconStatus('idle');
      return;
    }

    // 智能获取延迟时间，防止后缀（如 .co -> .com）未打完即触发搜索
    const delay = getDebounceDelay(url);

    debounceTimer.current = setTimeout(() => {
      triggerSearch(url);
    }, delay);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [customUrl, iconFromUpload]);

  // 监听对话框打开状态，自动拉取后端推荐网站分类数据并清空上一次的输入和识别内容
  useEffect(() => {
    if (isOpen) {
      // 每次打开弹窗，重置自定义栏的全部输入与识别数据
      setCustomName('');
      setCustomUrl('');
      setCustomIconUrl('');
      setCustomIconFile(null);
      setFaviconStatus('idle');
      setIconFromUpload(false);
      setUploadError(null);
      setDetectedIcons([]);
      setActiveTab('recommended'); // 默认重置回推荐页签
      setIsBatchMode(false);
      setBatchEditData([]);

      loadRecommended();
    }
  }, [isOpen]);

  // 若未开启则直接不渲染
  if (!isOpen) return null;

  /**
   * 处理自定义图标的文件上传。
   * 将文件上传至后端服务器，获取可访问的 URL 后自动填充图标链接输入框。
   */
  const handleCustomIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // 重置 input 的 value，确保同名文件可再次上传触发 onChange
    e.target.value = '';
    setFaviconStatus('uploading');
    setUploadError(null);
    try {
      const res = await navService.uploadIcon(file);
      if (res.code === 200 && res.data?.iconUrl) {
        const url = res.data.iconUrl;
        setCustomIconUrl(url);
        // 清空所有通过网址搜索的图标，只保留本地上传的图标
        setDetectedIcons([url]);
        setIconFromUpload(true);
        setFaviconStatus('detected');
      } else {
        console.error('上传失败:', res);
        setUploadError(res.message || '上传失败');
        setFaviconStatus('error');
      }
    } catch (e) {
      console.error('上传异常:', e);
      setUploadError(String(e));
      setFaviconStatus('error');
    }
  };

  /**
   * 将自定义捷径加入待添加队列。
   * 校验输入合法性并补充链接协议前缀，随后清空输入框。
   */
  const handleAddCustomToPending = () => {
    if (customName.trim() && customUrl.trim()) {
      const url = customUrl.startsWith('http') ? customUrl : `https://${customUrl}`;
      let iconType: string;
      let iconValue: string | undefined;
      if (iconFromUpload && customIconUrl) {
        iconType = 'CUSTOM_UPLOAD';
        iconValue = customIconUrl;
      } else if (customIconUrl) {
        iconType = 'FAVICON';
        iconValue = customIconUrl;
      } else {
        iconType = 'BUILTIN';
        iconValue = 'Link';
      }
      const newShortcut = {
        name: customName,
        icon: Link,
        color: '#4285F4',
        url,
        iconType,
        iconValue,
      };
      setPendingShortcuts([...pendingShortcuts, newShortcut]);
      // 重置所有输入框状态
      setCustomName('');
      setCustomUrl('');
      setCustomIconUrl('');
      setCustomIconFile(null);
      setFaviconStatus('idle');
      setIconFromUpload(false);
      setUploadError(null);
    }
  };

  /**
   * 将推荐捷径加入待添加队列。
   */
  const handleAddRecommendedToPending = (site: RecommendedSite) => {
    setPendingShortcuts([...pendingShortcuts, site]);
  };

  /**
   * 从待添加队列中移除指定捷径。
   */
  const handleRemoveFromPending = (index: number) => {
    setPendingShortcuts(pendingShortcuts.filter((_, i) => i !== index));
  };

  /**
   * 确认保存所有已选的待添加捷径。
   * 调用父组件回调后清空并关闭对话框。
   */
  const handleSave = () => {
    if (pendingShortcuts.length > 0) {
      // 提交到父组件进行持久化处理
      onAdd(pendingShortcuts);
      setPendingShortcuts([]);
      setCustomName('');
      setCustomUrl('');
      setCustomIconUrl('');
      setCustomIconFile(null);
      setFaviconStatus('idle');
      setIconFromUpload(false);
      setUploadError(null);
      onClose();
    }
  };

  /**
   * 取消操作。
   * 清空所有待添加记录与表单，随后关闭对话框。
   */
  const handleCancel = () => {
    setPendingShortcuts([]);
    setCustomName('');
    setCustomUrl('');
    setCustomIconUrl('');
    setCustomIconFile(null);
    setFaviconStatus('idle');
    setIconFromUpload(false);
    setUploadError(null);
    onClose();
  };

  const borderRadius = `${iconRadius}%`;

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
          {/* 左侧悬浮功能面板 (Dock) - 仅在推荐页签的管理员模式下显示 */}
          {userRole === 'ADMIN' && activeTab === 'recommended' && (
            <AdminDock
              isBatchMode={isBatchMode}
              setIsBatchMode={setIsBatchMode}
              handleSaveAllCategories={handleSaveAllCategories}
              setEditingCategory={setEditingCategory}
              categoriesLength={categories.length}
              handleBatchRefreshAllIcons={handleBatchRefreshAllIcons}
              isAllRefreshing={isAllRefreshing}
            />
          )}

          <div
            className="w-full h-full bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col text-foreground transition-all duration-300"
            onClick={(e) => e.stopPropagation()}
          >
          {/* Header */}
          <div className="bg-card/95 border-b border-border px-6 py-4 flex items-center justify-between transition-colors duration-300">
            <h2 className="text-xl font-medium">添加网址</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={handleCancel}
                className="px-5 py-2 bg-background border border-border hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-800 dark:text-gray-200 rounded-full transition-colors text-sm cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={pendingShortcuts.length === 0}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors text-sm disabled:bg-gray-200 dark:disabled:bg-neutral-800 disabled:text-gray-400 dark:disabled:text-neutral-600 disabled:cursor-not-allowed cursor-pointer"
              >
                保存 {pendingShortcuts.length > 0 && `(${pendingShortcuts.length})`}
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>

          {/* Tabs */}
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

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-3 h-full">
              {/* Left: Tabs Content */}
              <div className={`${isBatchMode ? 'col-span-3' : 'col-span-2'} border-r border-border overflow-y-auto`}>
                {activeTab === 'recommended' ? (
                  <DragDropContext onDragEnd={handleDragEnd}>
                  <div className="p-6 space-y-8 relative">


                    {isBatchMode ? (
                      <div className="space-y-8">
                        <input type="file" ref={rowFileInputRef} onChange={handleRowIconUpload} className="hidden" accept="image/*" />
                        <BatchCategoryList
                          batchEditData={batchEditData}
                          rowLoadingStatus={rowLoadingStatus}
                          rowDetectedIcons={rowDetectedIcons}
                          handleBatchRefreshCategoryIcons={handleBatchRefreshCategoryIcons}
                          handleAddEmptyRow={handleAddEmptyRow}
                          handleSaveCategorySites={handleSaveCategorySites}
                          updateBatchEditSite={updateBatchEditSite}
                          setRowDetectedIcons={setRowDetectedIcons}
                          handleDetectRowIcon={handleDetectRowIcon}
                          handleTriggerRowUpload={handleTriggerRowUpload}
                          handleDeleteRow={handleDeleteRow}
                        />
                      </div>
                    ) : (
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
                              className="flex flex-wrap items-center pb-4"
                              style={{ 
                                margin: `-${iconSpacingY / 2}px -${iconSpacingX / 2}px`,
                              }}
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
                                  style={{ 
                                    width: `${iconSize + 32}px`,
                                    margin: `${iconSpacingY / 2}px ${iconSpacingX / 2}px`
                                  }}
                                >
                                  {/* 在水平 flex 容器中，新增网址按钮同样需要 flex-shrink-0 避免缩水 */}
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
                                      style={{
                                        width: `${iconSize}px`,
                                        height: `${iconSize}px`,
                                        borderRadius: borderRadius,
                                      }}
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
                          <div className="flex flex-col items-center relative cursor-grabbing" style={{ width: `${iconSize + 32}px` }}>
                            <div className="bg-card flex items-center justify-center shadow-2xl scale-110 border border-blue-500 overflow-hidden pointer-events-none transition-transform" style={{ width: `${iconSize}px`, height: `${iconSize}px`, borderRadius }}>
                              {(() => {
                                if (activeDragShortcut.iconType === 'CUSTOM_URL' || activeDragShortcut.iconType === 'FAVICON' || activeDragShortcut.iconType === 'CUSTOM_UPLOAD') {
                                  return <img src={activeDragShortcut.iconValue} alt={activeDragShortcut.name} style={{ width: '50%', height: '50%', objectFit: 'contain' }} />;
                                }
                                return (
                                  <activeDragShortcut.icon
                                    style={{ color: activeDragShortcut.color || '#333', width: `${iconSize * 0.5}px`, height: `${iconSize * 0.5}px` }}
                                    strokeWidth={2}
                                  />
                                );
                              })()}
                            </div>
                          </div>
                        ) : null}
                      </GridDragOverlay>
                      </DndContext>
                    )}
                  </div>
                  </DragDropContext>
                ) : (
                                    <CustomShortcutTab
                    customName={customName}
                    setCustomName={setCustomName}
                    customUrl={customUrl}
                    setCustomUrl={setCustomUrl}
                    customIconUrl={customIconUrl}
                    setCustomIconUrl={setCustomIconUrl}
                    faviconStatus={faviconStatus}
                    detectedIcons={detectedIcons}
                    iconFromUpload={iconFromUpload}
                    uploadError={uploadError}
                    handleCustomIconUpload={handleCustomIconUpload}
                    handleAddCustomToPending={handleAddCustomToPending}
                    iconRadius={iconRadius}
                  />
                )}
              </div>

              {/* Right: Pending Shortcuts */}
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

      {/* Admin Modals */}
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
                // Update existing
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
                // Add new
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
