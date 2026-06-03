import { X, Link, Upload, Video, Cpu, Code, ShoppingBag, Newspaper, Gamepad2, Music as MusicIcon, BookOpen, Camera, Briefcase, Trash2, Loader2, Check, RotateCw } from 'lucide-react';
import { IconMap } from './ui/IconMap';
import { useState, useEffect, useRef } from 'react';
import { navService } from '../services/nav-service';
import { LucideIcon } from 'lucide-react';

interface AddShortcutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (shortcuts: { name: string; icon: any; color: string; url: string }[]) => void;
  iconSize: number;
  iconRadius: number;
}

interface RecommendedSite {
  name: string;
  icon: LucideIcon;
  color: string;
  url: string;
}

interface CategoryGroup {
  category: string;
  icon: LucideIcon;
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
export function AddShortcutDialog({ isOpen, onClose, onAdd, iconSize, iconRadius }: AddShortcutDialogProps) {
  const [activeTab, setActiveTab] = useState<'recommended' | 'custom'>('recommended');
  const [customName, setCustomName] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [customIconUrl, setCustomIconUrl] = useState('');
  const [customIconFile, setCustomIconFile] = useState<string | null>(null);
  const [pendingShortcuts, setPendingShortcuts] = useState<RecommendedSite[]>([]);
  const [categories, setCategories] = useState<CategoryGroup[]>(recommendedCategories);
  const [faviconStatus, setFaviconStatus] = useState<'idle' | 'loading' | 'detected' | 'error' | 'uploading'>('idle');
  const [iconFromUpload, setIconFromUpload] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [detectedIcons, setDetectedIcons] = useState<string[]>([]);
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>();

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

      navService.getRecommended().then(res => {
        if (res.code === 200 && res.data && res.data.length > 0) {
          // 格式化后端推荐数据为组件渲染结构
          const mapped = res.data.map(cat => ({
            category: cat.categoryName,
            icon: IconMap[cat.categoryIcon] || IconMap.Folder,
            sites: cat.sites.map(site => ({
              name: site.name,
              url: site.url,
              color: site.iconColor || '#333',
              icon: IconMap[site.iconValue] || IconMap.Link,
              iconType: site.iconType,
              iconValue: site.iconValue
            }))
          }));
          setCategories(mapped);
        }
      }).catch(console.error);
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
        onClick={onClose}
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
              <div className="col-span-2 border-r border-border overflow-y-auto">
                {activeTab === 'recommended' ? (
                  <div className="p-6 space-y-8">
                    {categories.map((category) => (
                      <div key={category.category}>
                        <div className="flex items-center gap-2 mb-4">
                          <category.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                          <h3 className="text-base font-medium">{category.category}</h3>
                        </div>
                        <div className="grid grid-cols-8 gap-6">
                          {category.sites.map((site: any) => (
                            <button
                              key={site.name}
                              onClick={() => handleAddRecommendedToPending(site)}
                              className="flex flex-col items-center gap-2 group cursor-pointer"
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
                          ))}
                        </div>
                      </div>
                    ))}
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
                              placeholder="https://example.com/icon.png"
                              className="w-full px-4 py-3 pr-10 bg-background border border-border rounded-xl text-foreground outline-none focus:border-blue-500 focus:bg-card transition-all placeholder-gray-400 dark:placeholder-gray-500 h-[46px]"
                              disabled={!!customIconFile}
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
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
