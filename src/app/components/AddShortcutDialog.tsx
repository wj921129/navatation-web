import { X, Link, Upload, Video, Cpu, Code, ShoppingBag, Newspaper, Gamepad2, Music as MusicIcon, BookOpen, Camera, Briefcase, Heart, Trash2 } from 'lucide-react';
import { useState } from 'react';
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

export function AddShortcutDialog({ isOpen, onClose, onAdd, iconSize, iconRadius }: AddShortcutDialogProps) {
  const [activeTab, setActiveTab] = useState<'recommended' | 'custom'>('recommended');
  const [customName, setCustomName] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [customIconUrl, setCustomIconUrl] = useState('');
  const [customIconFile, setCustomIconFile] = useState<string | null>(null);
  const [pendingShortcuts, setPendingShortcuts] = useState<RecommendedSite[]>([]);

  if (!isOpen) return null;

  const handleCustomIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCustomIconFile(event.target.result as string);
          setCustomIconUrl('');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCustomToPending = () => {
    if (customName.trim() && customUrl.trim()) {
      const newShortcut = {
        name: customName,
        icon: Link,
        color: '#4285F4',
        url: customUrl.startsWith('http') ? customUrl : `https://${customUrl}`,
      };
      setPendingShortcuts([...pendingShortcuts, newShortcut]);
      setCustomName('');
      setCustomUrl('');
      setCustomIconUrl('');
      setCustomIconFile(null);
    }
  };

  const handleAddRecommendedToPending = (site: RecommendedSite) => {
    setPendingShortcuts([...pendingShortcuts, site]);
  };

  const handleRemoveFromPending = (index: number) => {
    setPendingShortcuts(pendingShortcuts.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (pendingShortcuts.length > 0) {
      onAdd(pendingShortcuts);
      setPendingShortcuts([]);
      setCustomName('');
      setCustomUrl('');
      setCustomIconUrl('');
      setCustomIconFile(null);
      onClose();
    }
  };

  const handleCancel = () => {
    setPendingShortcuts([]);
    setCustomName('');
    setCustomUrl('');
    setCustomIconUrl('');
    setCustomIconFile(null);
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
                    {recommendedCategories.map((category) => (
                      <div key={category.category}>
                        <div className="flex items-center gap-2 mb-4">
                          <category.icon className="w-5 h-5 text-gray-600" />
                          <h3 className="text-base text-gray-800">{category.category}</h3>
                        </div>
                        <div className="grid grid-cols-8 gap-6">
                          {category.sites.map((site) => (
                            <button
                              key={site.name}
                              onClick={() => handleAddRecommendedToPending(site)}
                              className="flex flex-col items-center gap-2 group"
                            >
                              <div
                                className="bg-white flex items-center justify-center shadow-md hover:shadow-lg hover:scale-110 transition-all duration-200 border border-gray-200"
                                style={{
                                  width: `${iconSize}px`,
                                  height: `${iconSize}px`,
                                  borderRadius: borderRadius,
                                }}
                              >
                                <site.icon
                                  style={{
                                    color: site.color,
                                    width: `${iconSize * 0.5}px`,
                                    height: `${iconSize * 0.5}px`,
                                  }}
                                  strokeWidth={2}
                                />
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
                          <input
                            type="text"
                            value={customIconUrl}
                            onChange={(e) => {
                              setCustomIconUrl(e.target.value);
                              setCustomIconFile(null);
                            }}
                            placeholder="https://example.com/icon.png"
                            className="flex-1 px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-800 outline-none focus:border-blue-500 focus:bg-white transition-all"
                            disabled={!!customIconFile}
                          />
                          <label className="px-4 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl cursor-pointer flex items-center gap-2 transition-colors">
                            <Upload className="w-4 h-4 text-gray-700" />
                            <span className="text-sm text-gray-700">上传</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleCustomIconUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                        {customIconFile && (
                          <div className="mt-3 flex items-center gap-3">
                            <img
                              src={customIconFile}
                              alt="Preview"
                              className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                            />
                            <button
                              onClick={() => setCustomIconFile(null)}
                              className="text-sm text-red-600 hover:text-red-700"
                            >
                              移除
                            </button>
                          </div>
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
                            <shortcut.icon
                              style={{
                                color: shortcut.color,
                                width: '20px',
                                height: '20px',
                              }}
                              strokeWidth={2}
                            />
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
