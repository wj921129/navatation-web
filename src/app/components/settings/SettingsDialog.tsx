import { X, Link, Upload, Shuffle, Sun, Moon, Monitor } from 'lucide-react';
import { useState, useEffect } from 'react';
import { settingsService } from '../../services/settings-service';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: any, backgroundImage: string, theme: string) => void;
  onPreview?: (settings: any, backgroundImage: string, theme: string) => void;
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
    iconsMarginX: number;
  };
  backgroundImage: string;
  currentTheme: string;
}

export function SettingsDialog({ isOpen, onClose, onSave, onPreview, settings, backgroundImage, currentTheme }: SettingsDialogProps) {
  const [draftSettings, setDraftSettings] = useState(settings);
  const [draftBackgroundImage, setDraftBackgroundImage] = useState(backgroundImage);
  const [draftTheme, setDraftTheme] = useState(currentTheme);
  const [urlInput, setUrlInput] = useState('');

  // 仅在弹窗打开的一瞬间，利用最新的全局生效状态重置本地草稿。
  // 避免在弹窗处于打开状态下（如拖动滑块时）由于外部 settings 重绘导致本地草稿状态被意外覆盖重置。
  useEffect(() => {
    if (isOpen) {
      setDraftSettings(settings);
      setDraftBackgroundImage(backgroundImage);
      setDraftTheme(currentTheme);
      setUrlInput('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (key: string, value: number) => {
    const updated = { ...draftSettings, [key]: value };
    setDraftSettings(updated);
    onPreview?.(updated, draftBackgroundImage, draftTheme);
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      const newBg = urlInput.trim();
      setDraftBackgroundImage(newBg);
      onPreview?.(draftSettings, newBg, draftTheme);
      setUrlInput('');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await settingsService.uploadWallpaper(file);
      if (res && res.code === 200 && res.data) {
        const newBg = res.data.wallpaperUrl;
        setDraftBackgroundImage(newBg);
        onPreview?.(draftSettings, newBg, draftTheme);
      } else {
        alert(res.message || '上传壁纸失败');
      }
    } catch (err: any) {
      console.error('上传壁纸出错:', err);
      alert(err.message || '上传壁纸出错，请稍后重试');
    }
  };

  const handleRandomWallpaper = async () => {
    try {
      const res = await settingsService.getRandomWallpaper();
      if (res && res.code === 200 && res.data) {
        const newBg = res.data.wallpaperUrl;
        setDraftBackgroundImage(newBg);
        onPreview?.(draftSettings, newBg, draftTheme);
      } else {
        alert(res.message || '获取随机壁纸失败');
      }
    } catch (err: any) {
      console.error('获取随机壁纸出错:', err);
      alert(err.message || '获取随机壁纸出错，请稍后重试');
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40"
        onClick={onClose}
      />
      <div className="fixed top-0 right-0 h-full w-96 bg-white/95 dark:bg-card/95 backdrop-blur-xl shadow-2xl z-50 overflow-y-auto text-gray-800 dark:text-gray-100 transition-colors duration-300">
        <div className="sticky top-0 bg-white/95 dark:bg-card/95 backdrop-blur-xl border-b border-gray-200 dark:border-border px-4 py-3 flex items-center justify-between transition-colors duration-300">
          <h2 className="text-base text-gray-800 dark:text-gray-200 font-medium">设置</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Wallpaper Settings */}
          <div className="space-y-3">
            <h3 className="text-sm text-gray-900 dark:text-gray-100 font-medium">壁纸</h3>

            {/* URL Input */}
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1.5">
                <Link className="w-3 h-3 inline mr-1" />
                输入链接
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 px-3 py-1.5 bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-border rounded-lg text-xs text-gray-800 dark:text-gray-100 outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-neutral-900 transition-all placeholder-gray-400 dark:placeholder-gray-500"
                />
                <button
                  onClick={handleUrlSubmit}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-xs font-medium cursor-pointer"
                >
                  应用
                </button>
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1.5">
                <Upload className="w-3 h-3 inline mr-1" />
                本地上传
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="block w-full text-xs text-gray-600 dark:text-gray-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-blue-50 dark:file:bg-neutral-800 file:text-blue-700 dark:file:text-blue-400 hover:file:bg-blue-100 file:cursor-pointer cursor-pointer"
              />
            </div>

            {/* Random Wallpaper */}
            <button
              onClick={handleRandomWallpaper}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-lg transition-all text-xs font-medium cursor-pointer"
            >
              <Shuffle className="w-3 h-3" />
              随机壁纸
            </button>
          </div>

          {/* 主题设置 */}
          <div className="space-y-3">
            <h3 className="text-sm text-gray-900 dark:text-gray-100 font-medium">主题</h3>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setDraftTheme('light');
                  onPreview?.(draftSettings, draftBackgroundImage, 'light');
                }}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border transition-all text-xs cursor-pointer ${
                  draftTheme === 'light'
                    ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-400'
                    : 'bg-gray-50 dark:bg-neutral-800 border-gray-200 dark:border-border text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700'
                }`}
              >
                <Sun className="w-4 h-4" />
                浅色
              </button>
              <button
                onClick={() => {
                  setDraftTheme('dark');
                  onPreview?.(draftSettings, draftBackgroundImage, 'dark');
                }}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border transition-all text-xs cursor-pointer ${
                  draftTheme === 'dark'
                    ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-400'
                    : 'bg-gray-50 dark:bg-neutral-800 border-gray-200 dark:border-border text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700'
                }`}
              >
                <Moon className="w-4 h-4" />
                深色
              </button>
              <button
                onClick={() => {
                  setDraftTheme('system');
                  onPreview?.(draftSettings, draftBackgroundImage, 'system');
                }}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border transition-all text-xs cursor-pointer ${
                  draftTheme === 'system'
                    ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-400'
                    : 'bg-gray-50 dark:bg-neutral-800 border-gray-200 dark:border-border text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700'
                }`}
              >
                <Monitor className="w-4 h-4" />
                系统
              </button>
            </div>
          </div>

          {/* Search Box Settings */}
          <div className="space-y-3">
            <h3 className="text-sm text-gray-900 dark:text-gray-100 font-medium">搜索框</h3>

            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                长度: {draftSettings.searchBoxWidth}%
              </label>
              <input
                type="range"
                min="20"
                max="100"
                value={draftSettings.searchBoxWidth}
                onChange={(e) => handleChange('searchBoxWidth', Number(e.target.value))}
                className="w-full h-1.5 bg-gray-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                高度: {draftSettings.searchBoxHeight}px
              </label>
              <input
                type="range"
                min="48"
                max="80"
                value={draftSettings.searchBoxHeight}
                onChange={(e) => handleChange('searchBoxHeight', Number(e.target.value))}
                className="w-full h-1.5 bg-gray-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                上间距: {draftSettings.searchBoxMarginTop}px
              </label>
              <input
                type="range"
                min="100"
                max="600"
                value={draftSettings.searchBoxMarginTop}
                onChange={(e) => handleChange('searchBoxMarginTop', Number(e.target.value))}
                className="w-full h-1.5 bg-gray-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                下间距: {draftSettings.iconsMarginTop}px
              </label>
              <input
                type="range"
                min="24"
                max="96"
                value={draftSettings.iconsMarginTop}
                onChange={(e) => handleChange('iconsMarginTop', Number(e.target.value))}
                className="w-full h-1.5 bg-gray-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </div>

          {/* Icon Settings */}
          <div className="space-y-3">
            <h3 className="text-sm text-gray-900 dark:text-gray-100 font-medium">图标</h3>

            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                大小: {draftSettings.iconSize}px
              </label>
              <input
                type="range"
                min="48"
                max="96"
                value={draftSettings.iconSize}
                onChange={(e) => handleChange('iconSize', Number(e.target.value))}
                className="w-full h-1.5 bg-gray-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                弧度: {draftSettings.iconRadius}%
              </label>
              <input
                type="range"
                min="0"
                max="50"
                value={draftSettings.iconRadius}
                onChange={(e) => handleChange('iconRadius', Number(e.target.value))}
                className="w-full h-1.5 bg-gray-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                左右间距: {draftSettings.iconSpacingX}px
              </label>
              <input
                type="range"
                min="16"
                max="64"
                value={draftSettings.iconSpacingX}
                onChange={(e) => handleChange('iconSpacingX', Number(e.target.value))}
                className="w-full h-1.5 bg-gray-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                上下间距: {draftSettings.iconSpacingY}px
              </label>
              <input
                type="range"
                min="8"
                max="120"
                value={draftSettings.iconSpacingY}
                onChange={(e) => handleChange('iconSpacingY', Number(e.target.value))}
                className="w-full h-1.5 bg-gray-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                与文字间距: {draftSettings.iconTextGap}px
              </label>
              <input
                type="range"
                min="4"
                max="20"
                value={draftSettings.iconTextGap}
                onChange={(e) => handleChange('iconTextGap', Number(e.target.value))}
                className="w-full h-1.5 bg-gray-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                左右边距: {draftSettings.iconsMarginX}%
              </label>
              <input
                type="range"
                min="0"
                max="40"
                value={draftSettings.iconsMarginX}
                onChange={(e) => handleChange('iconsMarginX', Number(e.target.value))}
                className="w-full h-1.5 bg-gray-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </div>

          {/* Text Settings */}
          <div className="space-y-3">
            <h3 className="text-sm text-gray-900 dark:text-gray-100 font-medium">文字</h3>

            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                大小: {draftSettings.textSize}px
              </label>
              <input
                type="range"
                min="10"
                max="18"
                value={draftSettings.textSize}
                onChange={(e) => handleChange('textSize', Number(e.target.value))}
                className="w-full h-1.5 bg-gray-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white/95 dark:bg-card/95 backdrop-blur-xl border-t border-gray-200 dark:border-border p-4 transition-colors duration-300">
          <button
            onClick={() => onSave(draftSettings, draftBackgroundImage, draftTheme)}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors text-sm font-medium cursor-pointer"
          >
            保存
          </button>
        </div>
      </div>
    </>
  );
}
