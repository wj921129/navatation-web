import { X, Link, Upload, Video, Cpu, Code, ShoppingBag, Newspaper, Gamepad2, Music as MusicIcon, BookOpen, Camera, Briefcase, Heart, Trash2, Loader2, Check } from 'lucide-react';
import * as Icons from 'lucide-react';
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
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>();

  // 当用户输入网址时，防抖自动检测网站图标
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    const url = customUrl.trim();
    if (!url) {
      setFaviconStatus('idle');
      setUploadError(null);
      return;
    }
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    try { new URL(fullUrl); } catch { setFaviconStatus('idle'); setUploadError(null); return; }

    setFaviconStatus('loading');
    debounceTimer.current = setTimeout(() => {
      navService.fetchFavicon(fullUrl).then(res => {
        if (res.code === 200 && res.data?.faviconUrl) {
          setCustomIconUrl(res.data.faviconUrl);
          setCustomIconFile(null);
          setFaviconStatus('detected');
        } else {
          setFaviconStatus('error');
        }
      }).catch(() => {
        setFaviconStatus('error');
      });
    }, 600);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [customUrl]);

  // 监听对话框打开状态，自动拉取后端推荐网站分类数据
  useEffect(() => {
    if (isOpen) {
      navService.getRecommended().then(res => {
        if (res.code === 200 && res.data && res.data.length > 0) {
          // 格式化后端推荐数据为组件渲染结构
          const mapped = res.data.map(cat => ({
            category: cat.categoryName,
            icon: (Icons as any)[cat.categoryIcon] || Icons.Folder,
            sites: cat.sites.map(site => ({
              name: site.name,
              url: site.url,
              color: site.iconColor || '#333',
              icon: (Icons as any)[site.iconValue] || Icons.Link,
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
        setCustomIconUrl(res.data.iconUrl);
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
          className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          style={{ width: '85%', height: '90%', maxWidth: '1400px' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-white/95 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl text-gray-800">添加网址</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={handleCancel}
                className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-full transition-colors text-sm"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={pendingShortcuts.length === 0}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                保存 {pendingShortcuts.length > 0 && `(${pendingShortcuts.length})`}
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-black/5 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 bg-white/90">
            <button
              onClick={() => setActiveTab('recommended')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'recommended'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              推荐
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'custom'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              自定义
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-3 h-full">
              {/* Left: Tabs Content */}
              <div className="col-span-2 border-r border-gray-200 overflow-y-auto">
                {activeTab === 'recommended' ? (
                  <div className="p-6 space-y-8">
                    {categories.map((category) => (
                      <div key={category.category}>
                        <div className="flex items-center gap-2 mb-4">
                          <category.icon className="w-5 h-5 text-gray-600" />
                          <h3 className="text-base text-gray-800">{category.category}</h3>
                        </div>
                        <div className="grid grid-cols-8 gap-6">
                          {category.sites.map((site: any) => (
                            <button
                              key={site.name}
                              onClick={() => handleAddRecommendedToPending(site)}
                              className="flex flex-col items-center gap-2 group"
                            >
                              <div
                                className="bg-white flex items-center justify-center shadow-md hover:shadow-lg hover:scale-110 transition-all duration-200 border border-gray-200 overflow-hidden"
                                style={{
                                  width: `${iconSize}px`,
                                  height: `${iconSize}px`,
                                  borderRadius: borderRadius,
                                }}
                              >
                                {(() => {
                                  if (site.iconType === 'CUSTOM_URL' || site.iconType === 'FAVICON' || site.iconType === 'CUSTOM_UPLOAD') {
                                    return <img src={site.iconValue} alt={site.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
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
                              <span className="text-xs text-gray-700 group-hover:text-gray-900">
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
                        <label className="block text-sm text-gray-700 mb-2">网址链接 *</label>
                        <input
                          type="text"
                          value={customUrl}
                          onChange={(e) => setCustomUrl(e.target.value)}
                          placeholder="https://example.com"
                          className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-800 outline-none focus:border-blue-500 focus:bg-white transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-gray-700 mb-2">网址名称 *</label>
                        <input
                          type="text"
                          value={customName}
                          onChange={(e) => setCustomName(e.target.value)}
                          placeholder="网站名称"
                          className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-800 outline-none focus:border-blue-500 focus:bg-white transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-gray-700 mb-2">
                          网址图标链接
                        </label>
                        <div className="flex gap-2">
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
                              className="w-full px-4 py-3 pr-10 bg-gray-100 border border-gray-200 rounded-xl text-gray-800 outline-none focus:border-blue-500 focus:bg-white transition-all"
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
                          <label className={`px-4 py-3 rounded-xl cursor-pointer flex items-center gap-2 transition-colors ${
                              faviconStatus === 'uploading'
                                ? 'bg-blue-100 text-blue-400 cursor-not-allowed'
                                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                            }`}>
                            {faviconStatus === 'uploading' ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Upload className="w-4 h-4" />
                            )}
                            <span className="text-sm">{faviconStatus === 'uploading' ? '上传中...' : '上传'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleCustomIconUpload}
                              className="hidden"
                              disabled={faviconStatus === 'uploading'}
                            />
                          </label>
                        </div>
                        {iconFromUpload && customIconUrl && (
                          <div className="mt-3 flex items-center gap-3">
                            <img
                              src={customIconUrl}
                              alt="Preview"
                              className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                            />
                            <button
                              onClick={() => {
                                setCustomIconUrl('');
                                setIconFromUpload(false);
                              }}
                              className="text-sm text-red-600 hover:text-red-700"
                            >
                              移除
                            </button>
                          </div>
                        )}
                        {uploadError && (
                          <p className="mt-2 text-xs text-red-500">{uploadError}</p>
                        )}
                      </div>

                      <button
                        onClick={handleAddCustomToPending}
                        disabled={!customName.trim() || !customUrl.trim()}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        添加到本次
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Pending Shortcuts */}
              <div className="col-span-1 bg-gray-50 overflow-y-auto">
                <div className="p-4">
                  <h3 className="text-sm text-gray-900 mb-4">本次添加 ({pendingShortcuts.length})</h3>
                  {pendingShortcuts.length === 0 ? (
                    <p className="text-xs text-gray-500 text-center py-8">暂无选择</p>
                  ) : (
                    <div className="space-y-3">
                      {pendingShortcuts.map((shortcut, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200 group"
                        >
                          <div
                            className="flex-shrink-0 bg-white flex items-center justify-center shadow-sm border border-gray-200"
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
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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
                            <p className="text-sm text-gray-800 truncate">{shortcut.name}</p>
                            <p className="text-xs text-gray-500 truncate">{shortcut.url}</p>
                          </div>
                          <button
                            onClick={() => handleRemoveFromPending(index)}
                            className="flex-shrink-0 p-1 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
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
