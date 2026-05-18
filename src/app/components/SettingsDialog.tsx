import { X, Link, Upload, Shuffle, Sun, Moon, Monitor } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from 'next-themes';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  settings: {
    searchBoxWidth: number;
    searchBoxHeight: number;
    searchBoxMarginTop: number;
    iconSize: number;
    iconRadius: number;
    iconSpacingX: number;
    iconSpacingY: number;
    iconTextGap: number;
    textSize: number;
    iconsMarginTop: number;
  };
  onSettingsChange: (settings: any) => void;
  backgroundImage: string;
  onBackgroundChange: (url: string) => void;
}

export function SettingsDialog({ isOpen, onClose, settings, onSettingsChange, backgroundImage, onBackgroundChange }: SettingsDialogProps) {
  const [urlInput, setUrlInput] = useState('');
  const { theme, setTheme } = useTheme();

  if (!isOpen) return null;

  const handleChange = (key: string, value: number) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onBackgroundChange(urlInput.trim());
      setUrlInput('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onBackgroundChange(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRandomWallpaper = async () => {
    const randomQuery = ['nature', 'landscape', 'mountains', 'ocean', 'forest', 'sunset'][Math.floor(Math.random() * 6)];
    const randomUrl = `https://images.unsplash.com/photo-${Date.now() % 1000000000000}?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=2400&auto=format&fit=crop&random=${Math.random()}`;
    // Use Unsplash random API
    const unsplashUrl = `https://images.unsplash.com/photo-1598439473183-42c9301db5dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=2400&sig=${Math.random()}`;
    onBackgroundChange(unsplashUrl);
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />
      <div className="fixed top-0 right-0 h-full w-96 bg-white/95 backdrop-blur-xl shadow-2xl z-50 overflow-y-auto">
        <div className="sticky top-0 bg-white/95 backdrop-blur-xl border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <h2 className="text-base text-gray-800">设置</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/5 transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Wallpaper Settings */}
          <div className="space-y-3">
            <h3 className="text-sm text-gray-900">壁纸</h3>

            {/* URL Input */}
            <div>
              <label className="block text-xs text-gray-600 mb-1.5">
                <Link className="w-3 h-3 inline mr-1" />
                输入链接
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-lg text-xs text-gray-800 outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
                <button
                  onClick={handleUrlSubmit}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-xs"
                >
                  应用
                </button>
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-xs text-gray-600 mb-1.5">
                <Upload className="w-3 h-3 inline mr-1" />
                本地上传
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="block w-full text-xs text-gray-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer cursor-pointer"
              />
            </div>

            {/* Random Wallpaper */}
            <button
              onClick={handleRandomWallpaper}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-lg transition-all text-xs"
            >
              <Shuffle className="w-3 h-3" />
              随机壁纸
            </button>
          </div>

          {/* 主题设置 */}
          <div className="space-y-3">
            <h3 className="text-sm text-gray-900">主题</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setTheme('light')}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border transition-all text-xs ${
                  theme === 'light'
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Sun className="w-4 h-4" />
                浅色
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border transition-all text-xs ${
                  theme === 'dark'
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Moon className="w-4 h-4" />
                深色
              </button>
              <button
                onClick={() => setTheme('system')}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border transition-all text-xs ${
                  theme === 'system'
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Monitor className="w-4 h-4" />
                系统
              </button>
            </div>
          </div>

          {/* Search Box Settings */}
          <div className="space-y-3">
            <h3 className="text-sm text-gray-900">搜索框</h3>

            <div>
              <label className="block text-xs text-gray-600 mb-1">
                长度: {settings.searchBoxWidth}%
              </label>
              <input
                type="range"
                min="60"
                max="100"
                value={settings.searchBoxWidth}
                onChange={(e) => handleChange('searchBoxWidth', Number(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">
                高度: {settings.searchBoxHeight}px
              </label>
              <input
                type="range"
                min="48"
                max="80"
                value={settings.searchBoxHeight}
                onChange={(e) => handleChange('searchBoxHeight', Number(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">
                上间距: {settings.searchBoxMarginTop}px
              </label>
              <input
                type="range"
                min="100"
                max="300"
                value={settings.searchBoxMarginTop}
                onChange={(e) => handleChange('searchBoxMarginTop', Number(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </div>

          {/* Icon Settings */}
          <div className="space-y-3">
            <h3 className="text-sm text-gray-900">图标</h3>

            <div>
              <label className="block text-xs text-gray-600 mb-1">
                大小: {settings.iconSize}px
              </label>
              <input
                type="range"
                min="48"
                max="96"
                value={settings.iconSize}
                onChange={(e) => handleChange('iconSize', Number(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">
                弧度: {settings.iconRadius}%
              </label>
              <input
                type="range"
                min="0"
                max="50"
                value={settings.iconRadius}
                onChange={(e) => handleChange('iconRadius', Number(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">
                左右间距: {settings.iconSpacingX}px
              </label>
              <input
                type="range"
                min="16"
                max="64"
                value={settings.iconSpacingX}
                onChange={(e) => handleChange('iconSpacingX', Number(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">
                上下间距: {settings.iconSpacingY}px
              </label>
              <input
                type="range"
                min="24"
                max="72"
                value={settings.iconSpacingY}
                onChange={(e) => handleChange('iconSpacingY', Number(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">
                与文字间距: {settings.iconTextGap}px
              </label>
              <input
                type="range"
                min="4"
                max="20"
                value={settings.iconTextGap}
                onChange={(e) => handleChange('iconTextGap', Number(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">
                整体上间距: {settings.iconsMarginTop}px
              </label>
              <input
                type="range"
                min="24"
                max="96"
                value={settings.iconsMarginTop}
                onChange={(e) => handleChange('iconsMarginTop', Number(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </div>

          {/* Text Settings */}
          <div className="space-y-3">
            <h3 className="text-sm text-gray-900">文字</h3>

            <div>
              <label className="block text-xs text-gray-600 mb-1">
                大小: {settings.textSize}px
              </label>
              <input
                type="range"
                min="10"
                max="18"
                value={settings.textSize}
                onChange={(e) => handleChange('textSize', Number(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white/95 backdrop-blur-xl border-t border-gray-200 p-4">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors text-sm"
          >
            完成
          </button>
        </div>
      </div>
    </>
  );
}
