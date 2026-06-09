/**
 * @description 前端Hooks：useManageHomepageIcons.ts
 * @date 2026-06-10
 */
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { navService } from '../../services/nav-service';

const isValidDomainOrUrl = (input: string): boolean => {
  const url = input.trim();
  if (!url) return false;
  const domainRegex = /^(https?:\/\/)?([a-zA-Z0-9][-a-zA-Z0-9]{0,62}\.)+[a-zA-Z]{2,63}(\/.*)?$/;
  return domainRegex.test(url);
};

export function useManageHomepageIcons(
  editData: any[],
  setEditData: React.Dispatch<React.SetStateAction<any[]>>,
  updateSite: (idx: number, fields: Partial<any>) => void
) {
  const [rowLoadingStatus, setRowLoadingStatus] = useState<Record<string, boolean>>({});
  const [rowDetectedIcons, setRowDetectedIcons] = useState<Record<string, string[]>>({});
  const rowDetectedIconsRef = useRef<Record<string, string[]>>({});
  const [isAllRefreshing, setIsAllRefreshing] = useState(false);
  const rowFileInputRef = useRef<HTMLInputElement>(null);
  const activeUploadRow = useRef<number | null>(null);

  useEffect(() => {
    rowDetectedIconsRef.current = rowDetectedIcons;
  }, [rowDetectedIcons]);

  const resetIconsState = () => {
    setRowLoadingStatus({});
    setRowDetectedIcons({});
    setIsAllRefreshing(false);
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
      }
    } catch (err) {
      console.error('Row upload icon error:', err);
    } finally {
      setRowLoadingStatus(prev => ({ ...prev, [rowKey]: false }));
      activeUploadRow.current = null;
    }
  };

  return {
    rowLoadingStatus,
    rowDetectedIcons,
    isAllRefreshing,
    rowFileInputRef,
    setRowDetectedIcons,
    resetIconsState,
    handleDetectRowIcon,
    handleBatchRefreshAllIcons,
    handleTriggerRowUpload,
    handleRowIconUpload,
  };
}
