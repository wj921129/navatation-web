import { X, Link, Upload, Trash2, Loader2, Check, RotateCw, Plus, GripVertical, Grid, List } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { toast } from 'sonner';
import { IconMap } from '../ui/IconMap';
import { BaseModal } from '../ui/BaseModal';
import { useState, useEffect, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { motion } from 'framer-motion';
import { navService, IconType } from '../../services/nav-service';

const isValidDomainOrUrl = (input: string): boolean => {
  const url = input.trim();
  if (!url) return false;
  const domainRegex = /^(https?:\/\/)?([a-zA-Z0-9][-a-zA-Z0-9]{0,62}\.)+[a-zA-Z]{2,63}(\/.*)?$/;
  return domainRegex.test(url);
};

export interface ManageHomepageShortcutsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts: any[];
  iconSize: number;
  iconRadius: number;
  iconSpacingX?: number;
  iconSpacingY?: number;
  iconTextGap?: number;
  textSize?: number;
  onSaveComplete?: () => void;
}

export function ManageHomepageShortcutsDialog({
  isOpen,
  onClose,
  shortcuts,
  iconSize,
  iconRadius,
  iconSpacingX = 16,
  iconSpacingY = 16,
  iconTextGap = 8,
  textSize = 12,
  onSaveComplete,
}: ManageHomepageShortcutsDialogProps) {
  const [isBatchMode, setIsBatchMode] = useState(true); // true: List mode, false: Grid mode
  const [editData, setEditData] = useState<any[]>([]);
  const [rowLoadingStatus, setRowLoadingStatus] = useState<Record<string, boolean>>({});
  const [rowDetectedIcons, setRowDetectedIcons] = useState<Record<string, string[]>>({});
  const rowDetectedIconsRef = useRef<Record<string, string[]>>({});
  const [isAllRefreshing, setIsAllRefreshing] = useState(false);
  const rowFileInputRef = useRef<HTMLInputElement>(null);
  const activeUploadRow = useRef<number | null>(null);

  useEffect(() => {
    rowDetectedIconsRef.current = rowDetectedIcons;
  }, [rowDetectedIcons]);

  useEffect(() => {
    if (isOpen) {
      setEditData(shortcuts.map(s => ({ ...s, dragId: s.id || Math.random().toString(36).substring(7) })));
      setRowLoadingStatus({});
      setRowDetectedIcons({});
      setIsAllRefreshing(false);
    }
  }, [isOpen, shortcuts]);

  const updateSite = (idx: number, fields: Partial<any>) => {
    setEditData(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], ...fields };
      return copy;
    });
  };

  const handleDetectRowIcon = async (idx: number) => {
    const site = editData[idx];
    const url = site.url?.trim();
    if (!url || !isValidDomainOrUrl(url)) {
      toast.warning('请输入合法且完整的网址链接再进行检测');
      return;
    }
    const rowKey = `${idx}`;
    setRowLoadingStatus(prev => ({ ...prev, [rowKey]: true }));
    setRowDetectedIcons(prev => ({ ...prev, [rowKey]: [] }));
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    
    let host = '';
    try {
      const parsed = new URL(fullUrl);
      host = parsed.host;
    } catch {
      setRowLoadingStatus(prev => ({ ...prev, [rowKey]: false }));
      return;
    }

    const updateIcon = (iconUrl: string) => {
      if (!iconUrl) return;
      setRowDetectedIcons(prev => {
        const current = prev[rowKey] || [];
        if (current.includes(iconUrl)) return prev;
        const newIcons = [...current, iconUrl];
        if (newIcons.length === 1) {
          updateSite(idx, { iconType: 'FAVICON', iconValue: iconUrl });
        }
        return { ...prev, [rowKey]: newIcons };
      });
    };

    const googleCdn = `https://www.google.com/s2/favicons?sz=64&domain=${host}`;
    let pendingTasks = 3;
    const checkDone = () => {
      pendingTasks--;
      if (pendingTasks <= 0) setRowLoadingStatus(prev => ({ ...prev, [rowKey]: false }));
    };

    const imgGoogle = new Image();
    imgGoogle.onload = () => { updateIcon(googleCdn); checkDone(); };
    imgGoogle.onerror = checkDone;
    imgGoogle.src = googleCdn;

    const ddgCdn = `https://icons.duckduckgo.com/ip3/${host}.ico`;
    const img = new Image();
    img.onload = () => { updateIcon(ddgCdn); checkDone(); };
    img.onerror = checkDone;
    img.src = ddgCdn;

    navService.fetchFavicon(fullUrl).then(res => {
      if (res.code === 200 && res.data?.faviconUrl) {
        updateIcon(res.data.faviconUrl);
      }
      checkDone();
    }).catch(checkDone);
  };

  const handleBatchRefreshAllIcons = async () => {
    const tasks: { idx: number; url: string; site: any }[] = [];
    editData.forEach((site, idx) => {
      const url = site.url?.trim();
      if (url && isValidDomainOrUrl(url)) {
        const fullUrl = url.startsWith('http') ? url : `https://${url}`;
        tasks.push({ idx, url: fullUrl, site });
      }
    });

    if (tasks.length === 0) {
      toast.warning('当前列表中没有包含有效链接的网址');
      return;
    }

    setIsAllRefreshing(true);

    tasks.forEach(({ idx, url, site }) => {
      const rowKey = `${idx}`;
      setRowLoadingStatus(prev => ({ ...prev, [rowKey]: true }));
      setRowDetectedIcons(prev => ({ ...prev, [rowKey]: [] }));

      try {
        const parsed = new URL(url);
        const host = parsed.host;
        const googleCdn = `https://www.google.com/s2/favicons?sz=64&domain=${host}`;
        const ddgCdn = `https://icons.duckduckgo.com/ip3/${host}.ico`;

        const updateIcon = (iconUrl: string) => {
          setRowDetectedIcons(prev => {
            const current = prev[rowKey] || [];
            if (current.includes(iconUrl)) return prev;
            const newIcons = [...current, iconUrl];
            if (newIcons.length === 1 && (!site.iconValue || site.iconValue === 'Link')) {
              updateSite(idx, { iconType: 'FAVICON', iconValue: iconUrl });
            }
            return { ...prev, [rowKey]: newIcons };
          });
        };

        const imgGoogle = new Image();
        imgGoogle.onload = () => updateIcon(googleCdn);
        imgGoogle.src = googleCdn;

        const imgDdg = new Image();
        imgDdg.onload = () => updateIcon(ddgCdn);
        imgDdg.src = ddgCdn;
      } catch (e) {}
    });

    setTimeout(() => {
      setEditData(prev => {
        const copy = [...prev];
        let changed = false;
        tasks.forEach(({ idx }) => {
          const rowKey = `${idx}`;
          const site = copy[idx];
          if (!site) return;
          const detectedIcons = rowDetectedIconsRef.current[rowKey] || [];
          if (detectedIcons.length > 0) {
            if (!site.iconValue || site.iconValue === 'Link' || !detectedIcons.includes(site.iconValue)) {
              site.iconType = 'FAVICON';
              site.iconValue = detectedIcons[0];
              changed = true;
            }
          }
        });
        return changed ? copy : prev;
      });
    }, 3000);

    try {
      const urls = tasks.map(t => t.url);
      const res = await navService.fetchFaviconsInBatch(urls);
      if (res.code === 200 && res.data) {
        tasks.forEach(({ idx, url, site }) => {
          const rowKey = `${idx}`;
          const result = res.data[url];
          if (result && result.faviconUrl) {
            const nativeIcon = result.faviconUrl;
            setRowDetectedIcons(prev => {
              const current = prev[rowKey] || [];
              if (current.includes(nativeIcon)) return prev;
              const newIcons = [...current, nativeIcon];
              if (newIcons.length === 1 && (!site.iconValue || site.iconValue === 'Link')) {
                updateSite(idx, { iconType: 'FAVICON', iconValue: nativeIcon });
              }
              return { ...prev, [rowKey]: newIcons };
            });
          }
        });
      }
    } catch (err) {
      console.error('Batch refresh all icons error:', err);
    } finally {
      tasks.forEach(({ idx }) => {
        setRowLoadingStatus(prev => ({ ...prev, [`${idx}`]: false }));
      });
      setIsAllRefreshing(false);
    }
  };

  const handleTriggerRowUpload = (idx: number) => {
    activeUploadRow.current = idx;
    if (rowFileInputRef.current) rowFileInputRef.current.click();
  };

  const handleRowIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || activeUploadRow.current === null) return;
    e.target.value = '';
    const idx = activeUploadRow.current;
    const rowKey = `${idx}`;
    
    setRowLoadingStatus(prev => ({ ...prev, [rowKey]: true }));
    try {
      const res = await navService.uploadIcon(file);
      if (res.code === 200 && res.data?.iconUrl) {
        updateSite(idx, { iconType: 'CUSTOM_UPLOAD', iconValue: res.data.iconUrl });
        setRowDetectedIcons(prev => ({ ...prev, [rowKey]: [res.data.iconUrl] }));
      } else {
        toast.warning(res.message || '上传文件失败');
      }
    } catch (err) {
      toast.warning('上传发生异常');
    } finally {
      setRowLoadingStatus(prev => ({ ...prev, [rowKey]: false }));
      activeUploadRow.current = null;
    }
  };

  const handleAddEmptyRow = () => {
    setEditData(prev => [
      ...prev,
      {
        name: '',
        url: '',
        iconType: 'FAVICON',
        iconValue: '',
        color: '#ffffff',
        dragId: Math.random().toString(36).substring(7)
      }
    ]);
  };

  const handleDeleteRow = (idx: number) => {
    setEditData(prev => prev.filter((_, i) => i !== idx));
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const sourceIdx = result.source.index;
    const destIdx = result.destination.index;
    if (sourceIdx === destIdx) return;

    setEditData(prev => {
      const copy = [...prev];
      const [moved] = copy.splice(sourceIdx, 1);
      copy.splice(destIdx, 0, moved);
      return copy;
    });
  };

  const moveSiteGrid = (sourceIdx: number, destIdx: number) => {
    setEditData((prev) => {
      const copy = [...prev];
      const [moved] = copy.splice(sourceIdx, 1);
      copy.splice(destIdx, 0, moved);
      return copy;
    });
  };

  const handleSaveAll = async () => {
    for (let i = 0; i < editData.length; i++) {
      const site = editData[i];
      if (!site.name?.trim() || !site.url?.trim()) {
        toast.warning(`第 ${i + 1} 行网址名称或链接为空，请补充完整再保存。`);
        return;
      }
    }

    try {
      const deleted = shortcuts.filter(s => s.id && !editData.some(t => t.id === s.id));
      const updated = editData.filter(t => {
        if (!t.id) return false;
        const original = shortcuts.find(s => s.id === t.id);
        return original && (
          original.name !== t.name ||
          original.url !== t.url ||
          original.iconType !== t.iconType ||
          original.iconValue !== t.iconValue ||
          original.color !== t.color
        );
      });
      const added = editData.filter(t => !t.id);

      const writePromises: Promise<any>[] = [
        ...deleted.map(s => navService.deleteShortcut(s.id)),
        ...updated.map(t => navService.updateShortcut(t.id, {
          name: t.name,
          url: t.url,
          iconType: t.iconType || 'FAVICON',
          iconValue: t.iconValue || '',
          iconColor: t.color || '#ffffff'
        })),
      ];
      await Promise.all(writePromises);

      if (added.length > 0) {
        const catRes = await navService.getCategories();
        const categoryId = catRes.code === 200 && catRes.data.length > 0 ? catRes.data[0].categoryId : undefined;
        const addedPayload = added.map(s => ({
          name: s.name,
          url: s.url,
          iconType: s.iconType || 'FAVICON',
          iconValue: s.iconValue || '',
          iconColor: s.color || '#ffffff'
        }));
        await navService.batchCreateShortcuts({ categoryId: categoryId as any, shortcuts: addedPayload });
      }

      const res = await navService.getShortcuts();
      if (res.code === 200 && res.data) {
        const loaded = res.data.map((item: any) => ({
          id: item.shortcutId,
          name: item.name,
          url: item.url,
        }));
        const orderedShortcuts: any[] = [];
        editData.forEach((temp) => {
          let matched: any = null;
          if (temp.id) matched = loaded.find((l: any) => l.id === temp.id);
          else matched = loaded.find((l: any) => l.name === temp.name && l.url === temp.url && !orderedShortcuts.some(o => o.id === l.id));
          if (matched) orderedShortcuts.push(matched);
        });

        loaded.forEach((l: any) => {
          if (!orderedShortcuts.some(o => o.id === l.id)) orderedShortcuts.push(l);
        });

        const sortItems = orderedShortcuts.map((item, idx) => ({
          shortcutId: item.id,
          sortOrder: idx
        }));
        if (sortItems.length > 0) {
          await navService.sortShortcuts(sortItems);
        }
      }

      toast.success('保存成功');
      onSaveComplete?.();
      onClose();
    } catch (err) {
      console.error('Failed to save homepage shortcuts', err);
      toast.warning('保存失败，请重试');
    }
  };

  const borderRadiusCss = `${iconRadius}%`;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      animationType="scale"
      position="center"
      containerClassName="relative flex items-stretch h-[90%] w-[85%] max-w-[1400px]"
      overlayClassName="bg-black/50 backdrop-blur-sm"
      zIndex={50}
    >
      <div className="absolute top-1/2 -translate-y-1/2 -left-[80px] bg-card/95 backdrop-blur-xl border border-border/80 rounded-full p-3 flex flex-col items-center gap-4 shadow-2xl z-50 animate-in fade-in slide-in-from-left-8 duration-300">
        <div className="group relative flex items-center justify-center">
          <button
            onClick={() => setIsBatchMode(!isBatchMode)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm border cursor-pointer ${
              !isBatchMode 
                ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400' 
                : 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-400'
            }`}
          >
            {!isBatchMode ? <Grid className="w-5 h-5" /> : <List className="w-5 h-5" />}
          </button>
          <div className="absolute left-full ml-4 px-3 py-2 bg-gray-800/95 backdrop-blur-sm text-white text-sm font-medium rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-all shadow-xl z-50 translate-x-[-10px] group-hover:translate-x-0">
            切换为{!isBatchMode ? '列表管理' : '图标管理'}
            <div className="absolute top-1/2 -translate-y-1/2 -left-1.5 border-y-4 border-y-transparent border-r-4 border-r-gray-800/95" />
          </div>
        </div>

        <div className="w-8 h-[1px] bg-border/60" />

        <div className="group relative flex items-center justify-center">
          <button
            onClick={handleSaveAll}
            className="w-12 h-12 rounded-full flex items-center justify-center bg-green-50 text-green-600 border border-green-200 hover:bg-green-100 hover:scale-105 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400 transition-all duration-300 shadow-sm cursor-pointer"
          >
            <Check className="w-5 h-5" />
          </button>
          <div className="absolute left-full ml-4 px-3 py-2 bg-gray-800/95 backdrop-blur-sm text-white text-sm font-medium rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-all shadow-xl z-50 translate-x-[-10px] group-hover:translate-x-0">
            保存全部更改
            <div className="absolute top-1/2 -translate-y-1/2 -left-1.5 border-y-4 border-y-transparent border-r-4 border-r-gray-800/95" />
          </div>
        </div>

        {isBatchMode && (
          <div className="group relative flex items-center justify-center">
            <button
              onClick={handleBatchRefreshAllIcons}
              disabled={isAllRefreshing}
              className="w-12 h-12 rounded-full flex items-center justify-center bg-purple-50 text-purple-600 border border-purple-200 hover:bg-purple-100 hover:scale-105 dark:bg-purple-900/30 dark:border-purple-800 dark:text-purple-400 transition-all duration-300 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <RotateCw className={`w-5 h-5 ${isAllRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <div className="absolute left-full ml-4 px-3 py-2 bg-gray-800/95 backdrop-blur-sm text-white text-sm font-medium rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-all shadow-xl z-50 translate-x-[-10px] group-hover:translate-x-0">
              {isAllRefreshing ? '正在刷新...' : '一键刷新图标'}
              <div className="absolute top-1/2 -translate-y-1/2 -left-1.5 border-y-4 border-y-transparent border-r-4 border-r-gray-800/95" />
            </div>
          </div>
        )}
      </div>

      <div className="w-full h-full bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col text-foreground">
        <div className="bg-card/95 border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-medium">管理首页图标</h2>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="px-5 py-2 bg-background border border-border hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-800 dark:text-gray-200 rounded-full text-sm cursor-pointer">
              取消
            </button>
            <button onClick={handleSaveAll} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm cursor-pointer">
              保存
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 relative">
          {isBatchMode ? (
            <div className="bg-muted/40 border border-border p-6 rounded-3xl shadow-sm space-y-4">
              <input type="file" ref={rowFileInputRef} onChange={handleRowIconUpload} className="hidden" accept="image/*" />
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-base font-medium">快捷方式列表</h3>
                <div className="flex items-center gap-2">
                  <button onClick={handleBatchRefreshAllIcons} disabled={isAllRefreshing} className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 rounded-lg text-xs cursor-pointer">
                    <RotateCw className={`w-3.5 h-3.5 ${isAllRefreshing ? 'animate-spin' : ''}`} /> 一键刷新
                  </button>
                  <button onClick={handleAddEmptyRow} className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 hover:bg-blue-100 rounded-lg text-xs cursor-pointer">
                    <Plus className="w-3.5 h-3.5" /> 新增网址
                  </button>
                </div>
              </div>
              
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="main" direction="vertical">
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-1.5">
                      {editData.map((site, idx) => {
                        const rowKey = `${idx}`;
                        const isLoading = !!rowLoadingStatus[rowKey];
                        const detectedIcons = rowDetectedIcons[rowKey] || [];
                        return (
                          <Draggable key={site.dragId} draggableId={site.dragId} index={idx}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="bg-background border border-border/60 hover:border-border/100 rounded-xl p-2 flex flex-col gap-2 shadow-sm transition-all duration-200"
                                style={{
                                  ...provided.draggableProps.style,
                                  transition: snapshot.isDropAnimating ? 'transform 0.12s cubic-bezier(0.2, 1, 0.1, 1)' : provided.draggableProps.style?.transition
                                }}
                              >
                                <div className="flex items-center gap-2 w-full">
                                  <div className="flex-shrink-0 cursor-grab active:cursor-grabbing text-gray-400 hover:text-blue-500">
                                    <GripVertical className="w-5 h-5" />
                                  </div>
                                  <div className="flex-shrink-0 flex items-center justify-center bg-card shadow-inner border border-border overflow-hidden w-10 h-10 rounded-full">
                                    {isLoading ? <Loader2 className="w-4 h-4 text-blue-500 animate-spin" /> : (() => {
                                      if (site.iconType === 'CUSTOM_URL' || site.iconType === 'FAVICON' || site.iconType === 'CUSTOM_UPLOAD') {
                                        return <img src={site.iconValue} alt={site.name} className="w-[24px] h-[24px] object-contain" onError={(e) => { (e.target as any).style.display = 'none'; }} />;
                                      }
                                      const IconComponent = IconMap[site.iconValue || 'Link'] || Link;
                                      return <IconComponent style={{ color: site.color || '#333', width: '24px', height: '24px' }} strokeWidth={2} />;
                                    })()}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <input type="text" value={site.name} onChange={(e) => updateSite(idx, { name: e.target.value })} className="w-48 px-2 py-2 text-sm bg-card border border-border rounded-lg outline-none focus:border-blue-500" placeholder="名称" />
                                    <input type="text" value={site.url} onChange={(e) => updateSite(idx, { url: e.target.value })} className="w-80 px-2 py-2 text-sm bg-card border border-border rounded-lg outline-none focus:border-blue-500" placeholder="https://..." />
                                  </div>
                                  {detectedIcons.length > 0 && (
                                    <div className="flex items-center gap-1.5 border-l border-border/50 pl-2 flex-1 overflow-x-auto scrollbar-none">
                                      {detectedIcons.map((url, i) => (
                                        <button key={i} onClick={() => updateSite(idx, { iconType: 'FAVICON', iconValue: url })} className={`w-9 h-9 flex-shrink-0 bg-card border rounded-lg flex items-center justify-center ${site.iconValue === url ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-border'}`}>
                                          <img src={url} alt="Icon" className="w-5 h-5 object-contain" />
                                        </button>
                                      ))}
                                      <input type="text" value={site.iconValue || ''} readOnly={site.iconType === 'FAVICON'} onChange={(e) => updateSite(idx, { iconValue: e.target.value, iconType: 'CUSTOM_URL' })} className={`w-56 px-2 py-1.5 text-xs bg-card border rounded-md outline-none ml-2 ${site.iconType === 'FAVICON' ? 'text-gray-400' : 'focus:border-blue-500'}`} placeholder="手动输入图标URL" />
                                      <button onClick={() => setRowDetectedIcons(prev => ({ ...prev, [`${idx}`]: [] }))} className="w-9 h-9 text-gray-400 hover:text-red-500 rounded-lg flex items-center justify-center">
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  )}
                                  {!detectedIcons.length && <div className="flex-1"></div>}
                                  <div className="flex-shrink-0 flex items-center gap-1">
                                    <button onClick={() => handleDetectRowIcon(idx)} disabled={isLoading} className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg disabled:opacity-50"><RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /></button>
                                    <button onClick={() => handleTriggerRowUpload(idx)} disabled={isLoading} className="p-2 bg-card border border-border hover:bg-gray-100 text-gray-700 rounded-lg disabled:opacity-50"><Upload className="w-3.5 h-3.5" /></button>
                                    <button onClick={() => handleDeleteRow(idx)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
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
              </DragDropContext>
              
              <button onClick={handleAddEmptyRow} className="w-full mt-2 py-3 border-2 border-dashed border-border hover:border-blue-400 hover:bg-blue-50/50 rounded-xl flex items-center justify-center gap-2 text-gray-400 hover:text-blue-500 transition-all cursor-pointer group">
                <div className="w-6 h-6 rounded-full bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                  <Plus className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium">添加新网址</span>
              </button>
            </div>
          ) : (
            <div className="bg-muted/20 border border-border p-6 rounded-3xl shadow-sm min-h-[400px]">
              <div 
                className="flex flex-wrap"
                style={{ gap: `${iconSpacingY}px ${iconSpacingX}px` }}
              >
                {editData.map((site, idx) => (
                  <DraggableGridItem
                    key={site.dragId}
                    site={site}
                    idx={idx}
                    moveSite={moveSiteGrid}
                    handleDeleteRow={handleDeleteRow}
                    iconSize={iconSize}
                    borderRadiusCss={borderRadiusCss}
                    textSize={textSize}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </BaseModal>
  );
}

const GRID_DRAG_TYPE = 'HOMEPAGE_GRID_SITE';

interface DraggableGridItemProps {
  site: any;
  idx: number;
  moveSite: (sourceIdx: number, destIdx: number) => void;
  handleDeleteRow: (idx: number) => void;
  iconSize: number;
  borderRadiusCss: string;
  textSize: number;
}

function DraggableGridItem({
  site,
  idx,
  moveSite,
  handleDeleteRow,
  iconSize,
  borderRadiusCss,
  textSize,
}: DraggableGridItemProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: GRID_DRAG_TYPE,
    item: { idx },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: GRID_DRAG_TYPE,
    hover: (item: { idx: number }) => {
      if (!ref.current) return;
      const dragIdx = item.idx;
      const hoverIdx = idx;

      if (dragIdx === hoverIdx) return;
      moveSite(dragIdx, hoverIdx);
      item.idx = hoverIdx;
    },
  });

  drag(drop(ref));

  return (
    <motion.div 
      ref={ref} 
      layout
      transition={{ type: 'spring', stiffness: 500, damping: 30, mass: 1 }}
      className={`flex flex-col items-center relative group cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-50 scale-105 z-50' : 'opacity-100 z-0'}`} 
      style={{ width: `${iconSize + 32}px` }}
    >
      <div className="bg-card border border-border flex items-center justify-center shadow-lg transition-all duration-200 overflow-hidden pointer-events-none" style={{ width: `${iconSize}px`, height: `${iconSize}px`, borderRadius: borderRadiusCss }}>
        {(() => {
          if (site.iconType === 'CUSTOM_URL' || site.iconType === 'FAVICON' || site.iconType === 'CUSTOM_UPLOAD') {
            return <img src={site.iconValue} alt={site.name} style={{ width: '50%', height: '50%', objectFit: 'contain' }} onError={(e) => { (e.target as any).style.display = 'none'; }} />;
          }
          const IconComponent = IconMap[site.iconValue || 'Link'] || Link;
          return <IconComponent style={{ color: site.color || '#333', width: `${iconSize * 0.5}px`, height: `${iconSize * 0.5}px` }} strokeWidth={2} />;
        })()}
      </div>
      <span className="text-foreground mt-2 font-light tracking-wide text-center w-full truncate px-1" style={{ fontSize: `${textSize}px` }}>{site.name || '未命名'}</span>
      <button onClick={() => handleDeleteRow(idx)} className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10">
        <X className="w-3 h-3" />
      </button>
    </motion.div>
  );
}
