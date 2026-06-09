/**
 * @description 网站图标检测 Hook
 * @date 2026-06-09
 */
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { navService } from '../services/nav-service';
import { RecommendedSite, CategoryGroup } from '../constants/recommendedSitesData';

export const isValidDomainOrUrl = (input: string): boolean => {
  const url = input.trim();
  if (!url) return false;
  const domainRegex = /^(https?:\/\/)?([a-zA-Z0-9][-a-zA-Z0-9]{0,62}\.)+[a-zA-Z]{2,63}(\/.*)?$/;
  return domainRegex.test(url);
};

export const getDebounceDelay = (input: string): number => {
  const url = input.trim();
  if (!url) return 500;
  
  let host = '';
  try {
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    const parsed = new URL(fullUrl);
    host = parsed.host;
  } catch {
    return 500;
  }
  
  const parts = host.split('.');
  if (parts.length < 2) return 500;
  
  const tld = parts[parts.length - 1].toLowerCase();
  const incompletePrefixes = ['co', 'ne', 'or', 'ed', 'go'];
  const commonCompletedTlds = ['com', 'net', 'org', 'edu', 'gov', 'cn', 'cc', 'io', 'me', 'tv', 'so', 'info', 'xyz', 'top', 'vip'];
  
  if (incompletePrefixes.includes(tld)) return 1500; 
  if (commonCompletedTlds.includes(tld)) return 500;
  return 1000;
};

export function useFaviconDetector(
  batchEditData: CategoryGroup[],
  setBatchEditData: React.Dispatch<React.SetStateAction<CategoryGroup[]>>,
  updateBatchEditSite: (catIdx: number, siteIdx: number, fields: Partial<RecommendedSite>) => void
) {
  const [rowLoadingStatus, setRowLoadingStatus] = useState<Record<string, boolean>>({});
  const [rowDetectedIcons, setRowDetectedIcons] = useState<Record<string, string[]>>({});
  const rowDetectedIconsRef = useRef<Record<string, string[]>>({});
  const [isAllRefreshing, setIsAllRefreshing] = useState(false);

  useEffect(() => {
    rowDetectedIconsRef.current = rowDetectedIcons;
  }, [rowDetectedIcons]);

  const handleDetectRowIcon = async (catIdx: number, siteIdx: number) => {
    const site = batchEditData[catIdx].sites[siteIdx];
    const url = site.url.trim();
    if (!url || !isValidDomainOrUrl(url)) {
      toast.warning('请输入合法且完整的网址链接再进行检测');
      return;
    }
    const rowKey = `${catIdx}-${siteIdx}`;
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
          updateBatchEditSite(catIdx, siteIdx, {
            iconType: 'FAVICON',
            iconValue: iconUrl
          });
        }
        return { ...prev, [rowKey]: newIcons };
      });
    };

    const googleCdn = `https://www.google.com/s2/favicons?sz=64&domain=${host}`;

    let pendingTasks = 3;
    const checkDone = () => {
      pendingTasks--;
      if (pendingTasks <= 0) {
        setRowLoadingStatus(prev => ({ ...prev, [rowKey]: false }));
      }
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
    }).catch(() => checkDone());
  };

  const handleBatchRefreshCategoryIcons = async (catIdx: number) => {
    const category = batchEditData[catIdx];
    const validSites = category.sites.filter(site => site.url.trim() && isValidDomainOrUrl(site.url.trim()));
    if (validSites.length === 0) {
      toast.warning('当前分类下没有需要刷新图标的有效网址（网址域名格式需正确）');
      return;
    }

    const urls = validSites.map(site => {
      const u = site.url.trim();
      return u.startsWith('http') ? u : `https://${u}`;
    });

    validSites.forEach(site => {
      const siteIdx = category.sites.indexOf(site);
      const rowKey = `${catIdx}-${siteIdx}`;
      setRowLoadingStatus(prev => ({ ...prev, [rowKey]: true }));
      setRowDetectedIcons(prev => ({ ...prev, [rowKey]: [] }));

      try {
        const u = site.url.trim();
        const fullUrl = u.startsWith('http') ? u : `https://${u}`;
        const parsed = new URL(fullUrl);
        const host = parsed.host;
        const googleCdn = `https://www.google.com/s2/favicons?sz=64&domain=${host}`;
        const ddgCdn = `https://icons.duckduckgo.com/ip3/${host}.ico`;

        const updateIcon = (iconUrl: string) => {
          setRowDetectedIcons(prev => {
            const current = prev[rowKey] || [];
            if (current.includes(iconUrl)) return prev;
            const newIcons = [...current, iconUrl];
            if (newIcons.length === 1 && !site.iconValue) {
              updateBatchEditSite(catIdx, siteIdx, {
                iconType: 'FAVICON',
                iconValue: iconUrl
              });
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
      } catch (e) {
      }
    });

    setTimeout(() => {
      setBatchEditData(prev => {
        const copy = [...prev];
        let changed = false;
        const cat = copy[catIdx];
        if (!cat) return prev;
        cat.sites.forEach((site, siteIdx) => {
          const rowKey = `${catIdx}-${siteIdx}`;
          const detectedIcons = rowDetectedIconsRef.current[rowKey] || [];
          if (detectedIcons.length > 0) {
            if (site.iconValue && !detectedIcons.includes(site.iconValue)) {
              site.iconType = 'FAVICON';
              site.iconValue = detectedIcons[0];
              changed = true;
            } else if (!site.iconValue) {
              site.iconType = 'FAVICON';
              site.iconValue = detectedIcons[0];
              changed = true;
            }
          }
        });
        return changed ? copy : prev;
      });
    }, 5000);

    try {
      const res = await navService.fetchFaviconsInBatch(urls);
      if (res.code === 200 && res.data) {
        validSites.forEach(site => {
          const siteIdx = category.sites.indexOf(site);
          const rowKey = `${catIdx}-${siteIdx}`;
          const u = site.url.trim();
          const fullUrl = u.startsWith('http') ? u : `https://${u}`;
          const result = res.data[fullUrl];
          if (result && result.faviconUrl) {
            const nativeIcon = result.faviconUrl;
            setRowDetectedIcons(prev => {
              const current = prev[rowKey] || [];
              if (current.includes(nativeIcon)) return prev;
              const newIcons = [...current, nativeIcon];
              if (newIcons.length === 1 && !site.iconValue) {
                updateBatchEditSite(catIdx, siteIdx, {
                  iconType: 'FAVICON',
                  iconValue: nativeIcon
                });
              }
              return { ...prev, [rowKey]: newIcons };
            });
          }
        });
      }
    } catch (err) {
      console.error('Batch refresh category icons error:', err);
    } finally {
      validSites.forEach(site => {
        const siteIdx = category.sites.indexOf(site);
        const rowKey = `${catIdx}-${siteIdx}`;
        setRowLoadingStatus(prev => ({ ...prev, [rowKey]: false }));
      });
    }
  };

  const handleBatchRefreshAllIcons = async () => {
    const tasks: { catIdx: number; siteIdx: number; url: string; site: RecommendedSite }[] = [];
    batchEditData.forEach((category, catIdx) => {
      category.sites.forEach((site, siteIdx) => {
        const url = site.url.trim();
        if (url && isValidDomainOrUrl(url)) {
          const fullUrl = url.startsWith('http') ? url : `https://${url}`;
          tasks.push({ catIdx, siteIdx, url: fullUrl, site });
        }
      });
    });

    if (tasks.length === 0) {
      toast.warning('当前批量管理中没有包含有效链接的网址');
      return;
    }

    setIsAllRefreshing(true);

    tasks.forEach(({ catIdx, siteIdx, url, site }) => {
      const rowKey = `${catIdx}-${siteIdx}`;
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
            if (newIcons.length === 1 && !site.iconValue) {
              updateBatchEditSite(catIdx, siteIdx, {
                iconType: 'FAVICON',
                iconValue: iconUrl
              });
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
      } catch (e) {
      }
    });

    setTimeout(() => {
      setBatchEditData(prev => {
        const copy = [...prev];
        let changed = false;
        tasks.forEach(({ catIdx, siteIdx }) => {
          const rowKey = `${catIdx}-${siteIdx}`;
          const site = copy[catIdx]?.sites[siteIdx];
          if (!site) return;
          const detectedIcons = rowDetectedIconsRef.current[rowKey] || [];
          if (detectedIcons.length > 0) {
            if (site.iconValue && !detectedIcons.includes(site.iconValue)) {
              site.iconType = 'FAVICON';
              site.iconValue = detectedIcons[0];
              changed = true;
            } else if (!site.iconValue) {
              site.iconType = 'FAVICON';
              site.iconValue = detectedIcons[0];
              changed = true;
            }
          }
        });
        return changed ? copy : prev;
      });
    }, 5000);

    try {
      const urls = tasks.map(t => t.url);
      const res = await navService.fetchFaviconsInBatch(urls);
      if (res.code === 200 && res.data) {
        tasks.forEach(({ catIdx, siteIdx, url, site }) => {
          const rowKey = `${catIdx}-${siteIdx}`;
          const result = res.data[url];
          if (result && result.faviconUrl) {
            const nativeIcon = result.faviconUrl;
            setRowDetectedIcons(prev => {
              const current = prev[rowKey] || [];
              if (current.includes(nativeIcon)) return prev;
              const newIcons = [...current, nativeIcon];
              if (newIcons.length === 1 && !site.iconValue) {
                updateBatchEditSite(catIdx, siteIdx, {
                  iconType: 'FAVICON',
                  iconValue: nativeIcon
                });
              }
              return { ...prev, [rowKey]: newIcons };
            });
          }
        });
      }
    } catch (err) {
      console.error('Batch refresh all icons error:', err);
    } finally {
      tasks.forEach(({ catIdx, siteIdx }) => {
        const rowKey = `${catIdx}-${siteIdx}`;
        setRowLoadingStatus(prev => ({ ...prev, [rowKey]: false }));
      });
      setIsAllRefreshing(false);
    }
  };

  return {
    rowLoadingStatus,
    rowDetectedIcons,
    isAllRefreshing,
    setRowLoadingStatus,
    setRowDetectedIcons,
    handleDetectRowIcon,
    handleBatchRefreshCategoryIcons,
    handleBatchRefreshAllIcons
  };
}
