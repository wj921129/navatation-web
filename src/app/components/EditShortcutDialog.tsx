import { X, Upload, Loader2, Check, Link } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { navService } from '../services/nav-service';

interface EditShortcutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (shortcut: { name: string; url: string; iconType: string; iconValue: string }) => void;
  shortcut: {
    id?: number;
    name: string;
    url: string;
    iconType?: string;
    iconValue?: string;
  };
}

export function EditShortcutDialog({ isOpen, onClose, onSave, shortcut }: EditShortcutDialogProps) {
  const [name, setName] = useState(shortcut.name);
  const [url, setUrl] = useState(shortcut.url);
  const [iconType, setIconType] = useState(shortcut.iconType || 'BUILTIN');
  const [iconValue, setIconValue] = useState(shortcut.iconValue || 'Link');
  
  const [faviconStatus, setFaviconStatus] = useState<'idle' | 'loading' | 'detected' | 'error' | 'uploading'>('idle');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [detectedIcons, setDetectedIcons] = useState<string[]>([]);
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setName(shortcut.name);
    setUrl(shortcut.url);
    setIconType(shortcut.iconType || 'BUILTIN');
    setIconValue(shortcut.iconValue || 'Link');
    setFaviconStatus('idle');
    setUploadError(null);
    setDetectedIcons([]);
  }, [shortcut]);

  // 当网址链接改变且不等于原网址时，防抖并并行多路检测网站图标
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    const currentUrl = url.trim();
    if (!currentUrl || currentUrl === shortcut.url) {
      setFaviconStatus('idle');
      setDetectedIcons([]);
      return;
    }
    
    const fullUrl = currentUrl.startsWith('http') ? currentUrl : `https://${currentUrl}`;
    
    let host = '';
    try {
      const parsed = new URL(fullUrl);
      host = parsed.host;
    } catch {
      setFaviconStatus('idle');
      setDetectedIcons([]);
      return;
    }

    setFaviconStatus('loading');
    setDetectedIcons([]);

    const handleIconResult = (iconUrl: string) => {
      if (!iconUrl) return;
      setDetectedIcons(prev => {
        if (prev.includes(iconUrl)) return prev;
        const newIcons = [...prev, iconUrl];
        if (newIcons.length === 1) {
          setIconValue(iconUrl);
          setIconType('FAVICON');
          setFaviconStatus('detected');
        }
        return newIcons;
      });
    };

    debounceTimer.current = setTimeout(() => {
      const googleCdn = `https://www.google.com/s2/favicons?sz=64&domain=${host}`;
      handleIconResult(googleCdn);

      const ddgCdn = `https://icons.duckduckgo.com/ip3/${host}.ico`;
      const img = new Image();
      img.onload = () => handleIconResult(ddgCdn);
      img.src = ddgCdn;

      navService.fetchFavicon(fullUrl).then(res => {
        if (res.code === 200 && res.data?.faviconUrl) {
          handleIconResult(res.data.faviconUrl);
        }
      }).catch(() => {});
    }, 500);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [url, shortcut.url]);

  if (!isOpen) return null;

  // 上传自定义图标并更新图标的值与类型
  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFaviconStatus('uploading');
    setUploadError(null);
    try {
      const res = await navService.uploadIcon(file);
      if (res.code === 200 && res.data?.iconUrl) {
        const url = res.data.iconUrl;
        setIconValue(url);
        setIconType('CUSTOM_UPLOAD');
        setDetectedIcons(prev => [url, ...prev.filter(u => u !== url)]);
        setFaviconStatus('detected');
      } else {
        setUploadError(res.message || '上传失败');
        setFaviconStatus('error');
      }
    } catch (e) {
      setUploadError(String(e));
      setFaviconStatus('error');
    }
  };

  const handleSave = () => {
    if (name.trim() && url.trim()) {
      onSave({
        name,
        url: url.startsWith('http') ? url : `https://${url}`,
        iconType,
        iconValue,
      });
      onClose();
    }
  };

  const showImagePreview = iconType === 'CUSTOM_URL' || iconType === 'FAVICON' || iconType === 'CUSTOM_UPLOAD';

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
        onClick={onClose}
      >
        <div
          className="bg-card/95 border border-border backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md p-8 text-foreground transition-all duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-medium">编辑网址</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">网址链接 *</label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground outline-none focus:border-blue-500 focus:bg-card transition-all placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">网址名称 *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="网站名称"
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground outline-none focus:border-blue-500 focus:bg-card transition-all placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">网址图标链接</label>
              <div className="flex gap-2 items-center">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={showImagePreview ? iconValue : ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setIconValue(val);
                      if (val) {
                        setIconType('CUSTOM_URL');
                        setFaviconStatus('idle');
                      } else {
                        setIconType('BUILTIN');
                        setIconValue('Link');
                      }
                    }}
                    placeholder="https://example.com/icon.png"
                    className="w-full px-4 py-3 pr-10 bg-background border border-border rounded-xl text-foreground outline-none focus:border-blue-500 focus:bg-card transition-all placeholder-gray-400 dark:placeholder-gray-500"
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
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 cursor-not-allowed'
                    : 'bg-background border border-border hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-700 dark:text-gray-300'
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
                    onChange={handleIconUpload}
                    className="hidden"
                    disabled={faviconStatus === 'uploading'}
                  />
                </label>
              </div>
              
              {/* 实时图标预览与选择 */}
              {detectedIcons.length > 0 && (
                <div className="mt-3 flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-neutral-800">
                  {detectedIcons.map((iconUrl, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.preventDefault();
                        setIconValue(iconUrl);
                        setIconType(iconUrl.includes('/uploads/') ? 'CUSTOM_UPLOAD' : 'FAVICON');
                      }}
                      className={`w-12 h-12 flex-shrink-0 bg-card shadow-sm border rounded-xl flex items-center justify-center overflow-hidden transition-all cursor-pointer ${
                        iconValue === iconUrl && showImagePreview ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-border hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                    >
                      <img
                        src={iconUrl}
                        alt="Icon Option"
                        className="w-6 h-6 object-contain"
                      />
                    </button>
                  ))}
                  {showImagePreview && iconValue && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setIconType('BUILTIN');
                        setIconValue('Link');
                        setDetectedIcons([]);
                      }}
                      className="w-12 h-12 flex-shrink-0 bg-red-50/50 dark:bg-red-950/20 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors cursor-pointer"
                      title="清除图标"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
              {/* 当没有列表但存在自定义图标（例如刚打开弹窗回显） */}
              {detectedIcons.length === 0 && showImagePreview && iconValue && (
                <div className="mt-3 flex items-center gap-3">
                  <div className="w-12 h-12 flex-shrink-0 bg-card border border-border rounded-xl flex items-center justify-center overflow-hidden">
                    <img
                      src={iconValue}
                      alt="Preview"
                      style={{ width: '50%', height: '50%', objectFit: 'contain' }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{iconValue}</p>
                    <button
                      onClick={() => {
                        setIconType('BUILTIN');
                        setIconValue('Link');
                        setFaviconStatus('idle');
                      }}
                      className="text-xs text-red-500 hover:text-red-600 mt-1 block font-medium cursor-pointer"
                    >
                      移除自定义图标
                    </button>
                  </div>
                </div>
              )}
              {uploadError && (
                <p className="mt-2 text-xs text-red-500">{uploadError}</p>
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-background border border-border hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-800 dark:text-gray-200 rounded-full transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={!name.trim() || !url.trim()}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors disabled:bg-gray-200 dark:disabled:bg-neutral-800 disabled:text-gray-400 dark:disabled:text-neutral-600 disabled:cursor-not-allowed cursor-pointer"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
