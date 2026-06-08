import { X, Link, Upload, Video, Cpu, Code, ShoppingBag, Newspaper, Gamepad2, Music as MusicIcon, BookOpen, Camera, Briefcase, Trash2, Loader2, Check, RotateCw, Plus, Edit3 } from 'lucide-react';
import { EditShortcutDialog } from './EditShortcutDialog';
import { IconMap } from '../ui/IconMap';
import { useState, useEffect, useRef } from 'react';
import { navService, IconType } from '../../services/nav-service';
import { LucideIcon } from 'lucide-react';

interface AddShortcutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (shortcuts: { name: string; icon: any; color: string; url: string }[]) => void;
  iconSize: number;
  iconRadius: number;
  userRole?: string;
}

interface RecommendedSite {
  siteId?: string;
  name: string;
  icon: LucideIcon;
  color: string;
  url: string;
  iconType?: string;
  iconValue?: string;
  sortOrder?: number;
}

interface CategoryGroup {
  categoryId?: string;
  category: string;
  icon: LucideIcon;
  iconType?: string;
  iconValue?: string;
  sortOrder?: number;
  sites: RecommendedSite[];
}

const recommendedCategories: CategoryGroup[] = [
  {
    category: '看视频',
    icon: Video,
    sites: [
      { name: 'YouTube', icon: Video, color: '#FF0000', url: 'https://youtube.com' },
      { name: 'Netflix', icon: Video, color: '#E50914', url: 'https://netflix.com' },
      { name: 'Bilibili', icon: Video, color: '#00A1D6', url: 'https://bilibili.com' },
      { name: 'Twitch', icon: Video, color: '#9146FF', url: 'https://twitch.tv' },
    ]
  },
  {
    category: 'AI工具',
    icon: Cpu,
    sites: [
      { name: 'ChatGPT', icon: Cpu, color: '#10A37F', url: 'https://chat.openai.com' },
      { name: 'Claude', icon: Cpu, color: '#CC9B7A', url: 'https://claude.ai' },
      { name: 'Midjourney', icon: Camera, color: '#000000', url: 'https://midjourney.com' },
      { name: 'Gemini', icon: Cpu, color: '#4285F4', url: 'https://gemini.google.com' },
    ]
  },
  {
    category: 'Web开发',
    icon: Code,
    sites: [
      { name: 'GitHub', icon: Code, color: '#181717', url: 'https://github.com' },
      { name: 'Stack Overflow', icon: Code, color: '#F58025', url: 'https://stackoverflow.com' },
      { name: 'CodePen', icon: Code, color: '#000000', url: 'https://codepen.io' },
      { name: 'MDN', icon: BookOpen, color: '#000000', url: 'https://developer.mozilla.org' },
    ]
  },
  {
    category: '购物',
    icon: ShoppingBag,
    sites: [
      { name: 'Amazon', icon: ShoppingBag, color: '#FF9900', url: 'https://amazon.com' },
      { name: '淘宝', icon: ShoppingBag, color: '#FF6A00', url: 'https://taobao.com' },
      { name: '京东', icon: ShoppingBag, color: '#E3393C', url: 'https://jd.com' },
      { name: 'eBay', icon: ShoppingBag, color: '#E53238', url: 'https://ebay.com' },
    ]
  },
  {
    category: '新闻资讯',
    icon: Newspaper,
    sites: [
      { name: 'Reddit', icon: Newspaper, color: '#FF4500', url: 'https://reddit.com' },
      { name: 'Hacker News', icon: Newspaper, color: '#FF6600', url: 'https://news.ycombinator.com' },
      { name: 'Medium', icon: BookOpen, color: '#000000', url: 'https://medium.com' },
      { name: 'BBC', icon: Newspaper, color: '#000000', url: 'https://bbc.com' },
    ]
  },
  {
    category: '游戏',
    icon: Gamepad2,
    sites: [
      { name: 'Steam', icon: Gamepad2, color: '#171A21', url: 'https://store.steampowered.com' },
      { name: 'Epic Games', icon: Gamepad2, color: '#313131', url: 'https://epicgames.com' },
      { name: 'IGN', icon: Gamepad2, color: '#D8281F', url: 'https://ign.com' },
      { name: 'GameSpot', icon: Gamepad2, color: '#FF0000', url: 'https://gamespot.com' },
    ]
  },
  {
    category: '音乐',
    icon: MusicIcon,
    sites: [
      { name: 'Spotify', icon: MusicIcon, color: '#1DB954', url: 'https://spotify.com' },
      { name: 'Apple Music', icon: MusicIcon, color: '#FA243C', url: 'https://music.apple.com' },
      { name: 'SoundCloud', icon: MusicIcon, color: '#FF5500', url: 'https://soundcloud.com' },
      { name: 'YouTube Music', icon: MusicIcon, color: '#FF0000', url: 'https://music.youtube.com' },
    ]
  },
  {
    category: '办公效率',
    icon: Briefcase,
    sites: [
      { name: 'Notion', icon: Briefcase, color: '#000000', url: 'https://notion.so' },
      { name: 'Slack', icon: Briefcase, color: '#4A154B', url: 'https://slack.com' },
      { name: 'Trello', icon: Briefcase, color: '#0052CC', url: 'https://trello.com' },
      { name: 'Figma', icon: Briefcase, color: '#F24E1E', url: 'https://figma.com' },
    ]
  },
];

/**
 * 校验输入是否为合法且完整的域名或 URL。
 * 要求必须包含 dot 且顶级域名 (TLD) 至少为 2 位字母，排除未输入完的情况。
 */
const isValidDomainOrUrl = (input: string): boolean => {
  const url = input.trim();
  if (!url) return false;
  // 匹配常见域名结构，要求包含 dot 且顶级域名(TLD)至少为 2 位字母，排除以 dot 结尾
  const domainRegex = /^(https?:\/\/)?([a-zA-Z0-9][-a-zA-Z0-9]{0,62}\.)+[a-zA-Z]{2,63}(\/.*)?$/;
  return domainRegex.test(url);
};

/**
 * 根据域名后缀智能获取防抖延迟时间，防止后缀未输入完毕就急于触发搜索。
 */
const getDebounceDelay = (input: string): number => {
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
  
  // 著名 3+ 位域名的 2 位未完成前缀，如 .co -> .com, .ne -> .net, .or -> .org 等
  const incompletePrefixes = ['co', 'ne', 'or', 'ed', 'go'];
  
  // 常见已输入完的后缀
  const commonCompletedTlds = ['com', 'net', 'org', 'edu', 'gov', 'cn', 'cc', 'io', 'me', 'tv', 'so', 'info', 'xyz', 'top', 'vip'];
  
  if (incompletePrefixes.includes(tld)) {
    // 极有可能是正在输入 com, net, org 等，给予 1500ms 充足的输入缓冲时间
    return 1500; 
  }
  
  if (commonCompletedTlds.includes(tld)) {
    // 常见已完成的顶级域名，快速响应
    return 500;
  }
  
  // 其他域名格式，给予 1000ms 缓冲
  return 1000;
};

/**
 * 添加捷径对话框组件。
 * 支持浏览并选择推荐网站，以及输入链接与图标来自定义创建捷径。
 */
export function AddShortcutDialog({ isOpen, onClose, onAdd, iconSize, iconRadius, userRole }: AddShortcutDialogProps) {
  const [activeTab, setActiveTab] = useState<'recommended' | 'custom'>('recommended');
  const [customName, setCustomName] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [customIconUrl, setCustomIconUrl] = useState('');
  const [customIconFile, setCustomIconFile] = useState<string | null>(null);
  const [pendingShortcuts, setPendingShortcuts] = useState<RecommendedSite[]>([]);
  const [categories, setCategories] = useState<CategoryGroup[]>([]);
  const [faviconStatus, setFaviconStatus] = useState<'idle' | 'loading' | 'detected' | 'error' | 'uploading'>('idle');
  const [iconFromUpload, setIconFromUpload] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [detectedIcons, setDetectedIcons] = useState<string[]>([]);
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>();

  // 管理员编辑状态
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editingSite, setEditingSite] = useState<any>(null);

  // 批量管理状态
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [batchEditData, setBatchEditData] = useState<CategoryGroup[]>([]);
  const [rowLoadingStatus, setRowLoadingStatus] = useState<Record<string, boolean>>({});
  const [rowDetectedIcons, setRowDetectedIcons] = useState<Record<string, string[]>>({});
  const rowDetectedIconsRef = useRef<Record<string, string[]>>({});
  
  useEffect(() => {
    rowDetectedIconsRef.current = rowDetectedIcons;
  }, [rowDetectedIcons]);

  const [isAllRefreshing, setIsAllRefreshing] = useState(false);
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

  const handleDetectRowIcon = async (catIdx: number, siteIdx: number) => {
    const site = batchEditData[catIdx].sites[siteIdx];
    const url = site.url.trim();
    if (!url || !isValidDomainOrUrl(url)) {
      alert('请输入合法且完整的网址链接再进行检测');
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

    // 1. 瞬时响应：Google CDN 打底
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

    // 2. 备用 CDN：DuckDuckGo 竞速
    const ddgCdn = `https://icons.duckduckgo.com/ip3/${host}.ico`;
    const img = new Image();
    img.onload = () => {
      updateIcon(ddgCdn);
      checkDone();
    };
    img.onerror = checkDone;
    img.src = ddgCdn;

    // 3. 后端深度爬虫抓取原生图标竞速
    navService.fetchFavicon(fullUrl).then(res => {
      if (res.code === 200 && res.data?.faviconUrl) {
        updateIcon(res.data.faviconUrl);
      }
      checkDone();
    }).catch(() => {
      checkDone();
    });
  };

  const handleBatchRefreshCategoryIcons = async (catIdx: number) => {
    const category = batchEditData[catIdx];
    const validSites = category.sites.filter(site => site.url.trim() && isValidDomainOrUrl(site.url.trim()));
    if (validSites.length === 0) {
      alert('当前分类下没有需要刷新图标的有效网址（网址域名格式需正确）');
      return;
    }

    const urls = validSites.map(site => {
      const u = site.url.trim();
      return u.startsWith('http') ? u : `https://${u}`;
    });

    // 1. 先前台竞速：批量标记 loading 并准备本地 CDN
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
        // 忽略
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
      // 2. 后端异步批量嗅探
      const res = await navService.fetchFaviconsInBatch(urls);
      if (res.code === 200 && res.data) {
        // 3. 回填后端高清原生图标
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
      // 4. 清除 loading 状态
      validSites.forEach(site => {
        const siteIdx = category.sites.indexOf(site);
        const rowKey = `${catIdx}-${siteIdx}`;
        setRowLoadingStatus(prev => ({ ...prev, [rowKey]: false }));
      });
    }
  };

  const handleBatchRefreshAllIcons = async () => {
    // 收集所有分类的有效网址
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
      alert('当前批量管理中没有包含有效链接的网址');
      return;
    }

    setIsAllRefreshing(true);

    // 1. 前台本地竞速：开启 loading 并在本地回填 CDN
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
        // 忽略
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
      // 2. 请求后端批量嗅探接口
      const res = await navService.fetchFaviconsInBatch(urls);
      if (res.code === 200 && res.data) {
        // 3. 回填原生高清图标
        tasks.forEach(({ catIdx, siteIdx, url }) => {
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
      // 4. 清除 loading
      tasks.forEach(({ catIdx, siteIdx }) => {
        const rowKey = `${catIdx}-${siteIdx}`;
        setRowLoadingStatus(prev => ({ ...prev, [rowKey]: false }));
      });
      setIsAllRefreshing(false);
    }
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
      } else {
        alert(res.message || '上传文件失败');
      }
    } catch (err) {
      console.error('Row upload icon error:', err);
      alert('上传发生异常');
    } finally {
      setRowLoadingStatus(prev => ({ ...prev, [rowKey]: false }));
      activeUploadRow.current = null;
    }
  };

  const handleAddEmptyRow = (catIdx: number) => {
    setBatchEditData(prev => {
      const copy = [...prev];
      const categorySites = copy[catIdx].sites;
      const nextSortOrder = categorySites.length > 0
        ? Math.max(...categorySites.map(s => s.sortOrder || 0)) + 1
        : 1;
      
      const newEmptySite: RecommendedSite = {
        name: '',
        url: '',
        icon: Link,
        iconType: 'FAVICON' as IconType,
        iconValue: '',
        color: '#4285F4',
        sortOrder: nextSortOrder
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

  const handleSaveCategorySites = async (categoryGroup: CategoryGroup) => {
    const categoryId = categoryGroup.categoryId;
    if (!categoryId) {
      alert('分类不存在或未在数据库建立，请先保存该分类。');
      return;
    }
    
    const sites = categoryGroup.sites;
    for (let i = 0; i < sites.length; i++) {
      const site = sites[i];
      if (!site.name.trim()) {
        alert(`第 ${i + 1} 行网站名称不能为空`);
        return;
      }
      if (!site.url.trim()) {
        alert(`第 ${i + 1} 行网址链接不能为空`);
        return;
      }
    }
    
    const formattedSites = sites.map(site => ({
      siteId: site.siteId,
      name: site.name.trim(),
      url: site.url.trim().startsWith('http') ? site.url.trim() : `https://${site.url.trim()}`,
      iconType: site.iconType || 'FAVICON',
      iconValue: site.iconValue || '',
      iconColor: site.color || '#fff',
      sortOrder: Number(site.sortOrder) || 0.0
    }));
    
    try {
      const res = await navService.batchSaveRecommendSites(categoryId, { sites: formattedSites });
      if (res.code === 200) {
        alert('该分类下的网址批量保存成功！');
        loadRecommended();
      } else {
        alert(res.message || '保存失败');
      }
    } catch (err) {
      console.error('Batch save sites error:', err);
      alert('批量保存时发生异常，请重试');
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
            sortOrder: site.sortOrder
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
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
      >
        <div
          className="bg-card/95 border border-border backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col text-foreground transition-all duration-300"
          style={{ width: '85%', height: '90%', maxWidth: '1400px' }}
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
                  <div className="p-6 space-y-8 relative">
                    {userRole === 'ADMIN' && (
                      <div className="absolute top-4 right-4 flex items-center gap-3">
                        {isBatchMode && (
                          <button
                            onClick={handleBatchRefreshAllIcons}
                            disabled={isAllRefreshing}
                            className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800 rounded-full text-sm font-medium transition-all cursor-pointer disabled:opacity-50"
                          >
                            <RotateCw className={`w-4 h-4 ${isAllRefreshing ? 'animate-spin' : ''}`} />
                            {isAllRefreshing ? '正在刷新全部图标...' : '一键刷新全部图标'}
                          </button>
                        )}
                        <button
                          onClick={() => setIsBatchMode(!isBatchMode)}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
                            isBatchMode
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'bg-background border border-border hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {isBatchMode ? '返回预览模式' : '批量管理模式'}
                        </button>
                        {!isBatchMode && (
                          <button
                            onClick={() => setEditingCategory({ category: '', iconValue: 'Folder', sortOrder: categories.length })}
                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                          >
                            <Plus className="w-4 h-4" /> 新增分类
                          </button>
                        )}
                      </div>
                    )}

                    {isBatchMode ? (
                      <div className="space-y-8 mt-12">
                        <input type="file" ref={rowFileInputRef} onChange={handleRowIconUpload} className="hidden" accept="image/*" />
                        {batchEditData.map((category, catIdx) => (
                          <div key={category.categoryId || catIdx} className="bg-card/45 border border-border p-6 rounded-3xl backdrop-blur-md shadow-sm space-y-4">
                            <div className="flex items-center justify-between border-b border-border pb-3">
                              <div className="flex items-center gap-2">
                                <category.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                <h3 className="text-base font-medium">{category.category}</h3>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleBatchRefreshCategoryIcons(catIdx)}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 rounded-lg text-xs cursor-pointer transition-colors"
                                  title="批量刷新当前分类下所有网址的图标"
                                >
                                  <RotateCw className="w-3.5 h-3.5" /> 一键刷新图标
                                </button>
                                <button
                                  onClick={() => handleAddEmptyRow(catIdx)}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg text-xs cursor-pointer transition-colors"
                                >
                                  <Plus className="w-3.5 h-3.5" /> 新增网址
                                </button>
                                <button
                                  onClick={() => handleSaveCategorySites(category)}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs cursor-pointer transition-colors"
                                >
                                  保存修改
                                </button>
                              </div>
                            </div>

                            <div className="space-y-3">
                              {category.sites.length === 0 ? (
                                <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-6">暂无网址，请点击右上方“新增网址”</p>
                              ) : (
                                <div className="space-y-1.5">
                                  {/* 卡片列表式 */}
                                  {category.sites.map((site, siteIdx) => {
                                    const rowKey = `${catIdx}-${siteIdx}`;
                                    const isLoading = !!rowLoadingStatus[rowKey];
                                    const detectedIcons = rowDetectedIcons[rowKey] || [];
                                    
                                    return (
                                      <div key={site.siteId || siteIdx} className="bg-background border border-border/60 hover:border-border/100 rounded-xl p-2 flex flex-col gap-2 shadow-sm hover:shadow-md transition-all">
                                        <div className="flex items-center gap-2 w-full">
                                          {/* 图标展示区 */}
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
                                                const IconComponent = IconMap[site.iconValue || ''] || Link;
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
                                            <div className="w-16 flex-shrink-0">
                                              <input
                                                type="number"
                                                step="0.01"
                                                value={site.sortOrder}
                                                onChange={(e) => updateBatchEditSite(catIdx, siteIdx, { sortOrder: Number(e.target.value) })}
                                                className="w-full px-2 py-2 text-sm bg-card border border-border rounded-lg outline-none focus:border-blue-500 focus:bg-background transition-colors text-center"
                                                placeholder="0"
                                                title="排序序号"
                                              />
                                            </div>
                                          </div>

                                          {/* 多图标选择区域 - 直接放在同一行 */}
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
                                                  title="点击使用此图标"
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

                                          {/* 操作按钮区 */}
                                          <div className="flex-shrink-0 flex items-center gap-1">
                                            <button
                                              onClick={() => handleDetectRowIcon(catIdx, siteIdx)}
                                              disabled={isLoading}
                                              className="p-2 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                                              title="自动刷新并检测网站图标"
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
                                    );
                                  })}
                                  
                                  {/* Beautiful + button to add new site */}
                                  <button
                                    onClick={() => handleAddEmptyRow(catIdx)}
                                    className="w-full mt-2 py-3 border-2 border-dashed border-border hover:border-blue-400 hover:bg-blue-50/50 dark:hover:border-blue-500/50 dark:hover:bg-blue-900/10 rounded-xl flex items-center justify-center gap-2 text-gray-400 hover:text-blue-500 transition-all cursor-pointer group"
                                  >
                                    <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-neutral-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 flex items-center justify-center transition-colors">
                                      <Plus className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-medium">添加新网址</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-8 mt-12">
                        {categories.map((category) => (
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
                                      alert('当前为系统内置推荐分类，不可直接编辑。请先在数据库中建立。');
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
                                      alert('请先编辑并保存该分类到数据库，然后才能新增网址。');
                                      return;
                                    }
                                    setEditingSite({ categoryId: category.categoryId, iconType: 'FAVICON', iconColor: '#fff', sortOrder: category.sites.length })
                                  }} className="p-1 text-gray-400 hover:text-green-500 rounded"><Plus className="w-4 h-4" /></button>
                                </div>
                              )}
                            </div>
                            <div className="grid grid-cols-8 gap-6">
                              {category.sites.map((site: any) => (
                                <div key={site.siteId || site.name} className="relative group/item">
                                  <button
                                    onClick={() => {
                                      handleAddRecommendedToPending(site);
                                    }}
                                    className="flex flex-col items-center gap-2 group cursor-pointer w-full"
                                  >
                                    <div
                                      className="bg-card flex items-center justify-center shadow-md hover:shadow-lg hover:scale-110 transition-all duration-200 border border-border overflow-hidden"
                                      style={{
                                        width: `${iconSize}px`,
                                        height: `${iconSize}px`,
                                        borderRadius: borderRadius,
                                      }}
                                    >
                                      {(() => {
                                        if (site.iconType === 'CUSTOM_URL' || site.iconType === 'FAVICON' || site.iconType === 'CUSTOM_UPLOAD') {
                                          return <img src={site.iconValue} alt={site.name} style={{ width: '50%', height: '50%', objectFit: 'contain' }} />;
                                        }
                                        return (
                                          <site.icon
                                            style={{
                                              color: site.color,
                                              width: `${iconSize * 0.5}px`,
                                              height: `${iconSize * 0.5}px`,
                                            }}
                                            strokeWidth={2}
                                          />
                                        );
                                      })()}
                                    </div>
                                    <span className="text-xs text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">
                                      {site.name}
                                    </span>
                                  </button>
                                  {userRole === 'ADMIN' && (
                                    <div className="absolute -top-2 -right-2 hidden group-hover/item:flex items-center gap-1 bg-background border border-border rounded shadow-sm p-0.5 z-10">
                                      <button onClick={(e) => { 
                                        e.stopPropagation(); 
                                        if (!category.categoryId) {
                                          alert('系统内置推荐网址不可直接编辑。请通过右上角"新增分类"建立数据库数据后再添加。');
                                          return;
                                        }
                                        setEditingSite({ ...site, iconColor: site.iconColor || site.color, categoryId: category.categoryId }); 
                                      }} className="p-1 text-gray-400 hover:text-blue-500"><Edit3 className="w-3 h-3" /></button>
                                      <button onClick={(e) => { 
                                        e.stopPropagation(); 
                                        if (!site.siteId) return;
                                        navService.deleteRecommendSite(site.siteId!).then(loadRecommended); 
                                      }} className="p-1 text-gray-400 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                                    </div>
                                  )}
                                </div>
                              ))}
                              {userRole === 'ADMIN' && (
                                <div className="relative group/item">
                                  <button
                                    onClick={() => {
                                      if (!category.categoryId) {
                                        alert('系统内置推荐分类不可添加网址。请先保存该分类到数据库，或新建自定义分类。');
                                        return;
                                      }
                                      setEditingSite({ categoryId: category.categoryId, name: '', url: '', iconType: 'FAVICON', iconValue: '', iconColor: '#fff', sortOrder: category.sites.length })
                                    }}
                                    className="flex flex-col items-center gap-2 group cursor-pointer w-full"
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
                                    <span className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-blue-500 truncate w-full text-center">
                                      新增网址
                                    </span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-8">
                    <div className="max-w-xl mx-auto space-y-6">
                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">网址链接 *</label>
                        <input
                          type="text"
                          value={customUrl}
                          onChange={(e) => setCustomUrl(e.target.value)}
                          onBlur={() => !iconFromUpload && triggerSearch(customUrl)}
                          placeholder="https://example.com"
                          className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground outline-none focus:border-blue-500 focus:bg-card transition-all placeholder-gray-400 dark:placeholder-gray-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">网址名称 *</label>
                        <input
                          type="text"
                          value={customName}
                          onChange={(e) => setCustomName(e.target.value)}
                          placeholder="网站名称"
                          className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground outline-none focus:border-blue-500 focus:bg-card transition-all placeholder-gray-400 dark:placeholder-gray-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                          网址图标链接
                        </label>
                        <div className="flex gap-2 items-center">
                          <div className="flex-1 relative">
                            <input
                              type="text"
                              value={customIconUrl}
                              onChange={(e) => {
                                setCustomIconUrl(e.target.value);
                                if (e.target.value) {
                                  setFaviconStatus('idle');
                                  setIconFromUpload(false);
                                }
                              }}
                              readOnly={detectedIcons.length > 0 && detectedIcons.includes(customIconUrl)}
                              placeholder="https://example.com/icon.png"
                              className={`w-full px-4 py-3 pr-10 bg-background border border-border rounded-xl outline-none transition-all h-[46px] ${
                                detectedIcons.length > 0 && detectedIcons.includes(customIconUrl)
                                  ? 'text-gray-400 cursor-text'
                                  : 'text-foreground focus:border-blue-500 focus:bg-card placeholder-gray-400 dark:placeholder-gray-500'
                              }`}
                              disabled={!!customIconFile}
                              title={(detectedIcons.length > 0 && detectedIcons.includes(customIconUrl)) ? "搜索结果不可编辑，可双击复制" : "网址图标链接"}
                            />
                            {(faviconStatus === 'loading' || faviconStatus === 'uploading') && (
                              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500 animate-spin" />
                            )}
                            {faviconStatus === 'detected' && (
                              <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                            )}
                            {faviconStatus === 'error' && (
                              <Link className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setCustomIconUrl('');
                              setDetectedIcons([]);
                              setIconFromUpload(false);
                              setCustomIconFile(null);
                              setTimeout(() => {
                                triggerSearch(customUrl);
                              }, 0);
                            }}
                            disabled={!isValidDomainOrUrl(customUrl) || faviconStatus === 'loading' || faviconStatus === 'uploading'}
                            className="p-3 bg-background border border-border hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-700 dark:text-gray-300 rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer h-[46px] w-[46px] flex-shrink-0"
                            title="重新检测网址图标"
                          >
                            <RotateCw className={`w-4 h-4 ${faviconStatus === 'loading' ? 'animate-spin' : ''}`} />
                          </button>

                          <label className={`px-4 py-3 rounded-xl cursor-pointer flex items-center gap-2 transition-colors h-[46px] flex-shrink-0 ${
                              faviconStatus === 'uploading'
                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 cursor-not-allowed'
                                : 'bg-background border border-border hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-700 dark:text-gray-300'
                            }`}>
                            {faviconStatus === 'uploading' ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Upload className="w-4 h-4" />
                            )}
                            <span className="text-sm">{faviconStatus === 'uploading' ? '上传中' : '上传'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleCustomIconUpload}
                              className="hidden"
                              disabled={faviconStatus === 'uploading'}
                            />
                          </label>
                        </div>
                        {detectedIcons.length > 0 && (
                          <div className="mt-3">
                            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-neutral-800">
                              {detectedIcons.map((url, idx) => (
                                <button
                                  key={idx}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setCustomIconUrl(url);
                                  }}
                                  className={`w-12 h-12 flex-shrink-0 bg-card shadow-sm border rounded-xl flex items-center justify-center overflow-hidden transition-all cursor-pointer ${
                                    customIconUrl === url ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-border hover:border-gray-400 dark:hover:border-gray-500'
                                  }`}
                                >
                                  <img
                                    src={url}
                                    alt="Icon Option"
                                    className="w-6 h-6 object-contain"
                                  />
                                </button>
                              ))}
                              {customIconUrl && (
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setCustomIconUrl('');
                                    setDetectedIcons([]);
                                    setIconFromUpload(false);
                                  }}
                                  className="w-12 h-12 flex-shrink-0 bg-red-50/50 dark:bg-red-950/20 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors cursor-pointer"
                                  title="清除图标"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                            <p className="mt-1.5 text-xs text-red-500 dark:text-red-400 font-medium flex items-center gap-1">
                              <span>*</span> 提示：可点击上方检测出的图标进行切换选择
                            </p>
                          </div>
                        )}
                        {uploadError && (
                          <p className="mt-2 text-xs text-red-500">{uploadError}</p>
                        )}
                      </div>

                      <button
                        onClick={handleAddCustomToPending}
                        disabled={!customName.trim() || !customUrl.trim()}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors disabled:bg-gray-200 dark:disabled:bg-neutral-800 disabled:text-gray-400 dark:disabled:text-neutral-600 disabled:cursor-not-allowed cursor-pointer"
                      >
                        添加到本次
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Pending Shortcuts */}
              {!isBatchMode && (
                <div className="col-span-1 bg-background border-l border-border overflow-y-auto transition-colors duration-300">
                  <div className="p-4">
                  <h3 className="text-sm font-medium mb-4">本次添加 ({pendingShortcuts.length})</h3>
                  {pendingShortcuts.length === 0 ? (
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-8">暂无选择</p>
                  ) : (
                    <div className="space-y-3">
                      {pendingShortcuts.map((shortcut, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 bg-card p-3 rounded-lg border border-border group transition-all duration-200"
                        >
                          <div
                            className="flex-shrink-0 bg-background flex items-center justify-center shadow-sm border border-border"
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: `${iconRadius}%`,
                            }}
                          >
                            {(shortcut as any).iconType === 'FAVICON' || (shortcut as any).iconType === 'CUSTOM_URL' || (shortcut as any).iconType === 'CUSTOM_UPLOAD' ? (
                              <img
                                src={(shortcut as any).iconValue}
                                alt={shortcut.name}
                                style={{ width: '50%', height: '50%', objectFit: 'contain' }}
                              />
                            ) : (
                              <shortcut.icon
                                style={{
                                  color: shortcut.color,
                                  width: '20px',
                                  height: '20px',
                                }}
                                strokeWidth={2}
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{shortcut.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{shortcut.url}</p>
                          </div>
                          <button
                            onClick={() => handleRemoveFromPending(index)}
                            className="flex-shrink-0 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-950/30 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Admin Modals */}
      {editingCategory && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center" onClick={() => setEditingCategory(null)}>
          <div className="bg-card p-6 rounded-2xl w-96 shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-medium mb-4">{editingCategory.categoryId ? '编辑分类' : '新增分类'}</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500 mb-1 block">分类名称</label>
                <input type="text" className="w-full px-3 py-2 border rounded-lg bg-background" value={editingCategory.category} onChange={e => setEditingCategory({...editingCategory, category: e.target.value})} />
              </div>
              <div>
                <label className="text-sm text-gray-500 mb-1 block">图标 (lucide-react name)</label>
                <input type="text" className="w-full px-3 py-2 border rounded-lg bg-background" value={editingCategory.iconValue} onChange={e => setEditingCategory({...editingCategory, iconValue: e.target.value})} />
              </div>
              <div>
                <label className="text-sm text-gray-500 mb-1 block">排序</label>
                <input type="number" step="0.01" className="w-full px-3 py-2 border rounded-lg bg-background" value={editingCategory.sortOrder} onChange={e => setEditingCategory({...editingCategory, sortOrder: Number(e.target.value)})} />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setEditingCategory(null)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">取消</button>
              <button onClick={() => {
                const req = { name: editingCategory.category, icon: editingCategory.iconValue, sortOrder: editingCategory.sortOrder };
                const p = editingCategory.categoryId 
                  ? navService.updateRecommendCategory(editingCategory.categoryId, req)
                  : navService.addRecommendCategory(req);
                p.then(() => { 
                  loadRecommended(); 
                  setEditingCategory(null); 
                }).catch(err => {
                  console.error('保存分类失败', err);
                  alert('保存分类失败，请重试');
                });
              }} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">保存</button>
            </div>
          </div>
        </div>
      )}

      {editingSite && (
        <EditShortcutDialog
          isOpen={true}
          onClose={() => setEditingSite(null)}
          showSortOrder={true}
          shortcut={{
            id: editingSite.siteId,
            name: editingSite.name || '',
            url: editingSite.url || '',
            iconType: editingSite.iconType || 'FAVICON',
            iconValue: editingSite.iconValue || '',
            sortOrder: editingSite.sortOrder || 0,
          }}
          onSave={(shortcut) => {
            if (!editingSite.categoryId) {
              alert('分类ID丢失，请刷新页面重试');
              return;
            }
            const req = { 
              categoryId: editingSite.categoryId,
              name: shortcut.name,
              url: shortcut.url,
              iconType: (shortcut.iconType || 'FAVICON') as IconType,
              iconValue: shortcut.iconValue || '',
              iconColor: editingSite.iconColor || '#fff',
              sortOrder: shortcut.sortOrder ?? 0
            };
            const p = editingSite.siteId 
              ? navService.updateRecommendSite(editingSite.siteId, req)
              : navService.addRecommendSite(req);
            p.then((res: any) => { 
              if (res.code === 200) {
                loadRecommended(); 
                setEditingSite(null); 
              } else {
                alert('保存失败: ' + (res.message || '未知错误'));
              }
            }).catch(err => {
              console.error('保存网址失败', err);
              alert('保存网址失败，请重试');
            });
          }}
        />
      )}
    </>
  );
}
