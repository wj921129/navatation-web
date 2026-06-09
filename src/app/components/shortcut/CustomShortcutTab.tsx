/**
 * @description 自定义快捷方式选项卡组件
 * @date 2026-06-09
 */
import { Link, Upload, Loader2, RotateCw } from 'lucide-react';
import React from 'react';

interface CustomShortcutTabProps {
  customName: string;
  setCustomName: (val: string) => void;
  customUrl: string;
  setCustomUrl: (val: string) => void;
  customIconUrl: string;
  setCustomIconUrl: (val: string) => void;
  faviconStatus: 'idle' | 'loading' | 'detected' | 'error' | 'uploading';
  detectedIcons: string[];
  iconFromUpload: boolean;
  uploadError: string | null;
  handleCustomIconUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAddCustomToPending: () => void;
  iconRadius: number;
}

export function CustomShortcutTab({
  customName,
  setCustomName,
  customUrl,
  setCustomUrl,
  customIconUrl,
  setCustomIconUrl,
  faviconStatus,
  detectedIcons,
  iconFromUpload,
  uploadError,
  handleCustomIconUpload,
  handleAddCustomToPending,
  iconRadius
}: CustomShortcutTabProps) {
  const borderRadius = `${iconRadius}%`;

  return (
    <div className="p-8 h-full flex items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="w-full max-w-md bg-card border border-border p-8 rounded-3xl shadow-xl flex flex-col gap-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 text-blue-600 dark:text-blue-400">
            <Link className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-medium">自定义快捷方式</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">输入网址，我们将自动为您获取图标</p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">网站名称</label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-border hover:border-gray-400 focus:border-blue-500 rounded-xl outline-none transition-all shadow-sm focus:shadow-md"
              placeholder="例如：Google"
              autoFocus
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">网址链接</label>
            <div className="relative group">
              <input
                type="text"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                className="w-full pl-4 pr-10 py-3 bg-background border border-border hover:border-gray-400 focus:border-blue-500 rounded-xl outline-none transition-all shadow-sm focus:shadow-md"
                placeholder="例如：https://google.com"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                {faviconStatus === 'loading' ? (
                  <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                ) : (
                  <Link className="w-5 h-5" />
                )}
              </div>
            </div>
            {faviconStatus === 'detected' && !iconFromUpload && detectedIcons.length > 0 && (
              <p className="text-xs text-green-600 dark:text-green-400 ml-1 mt-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                <RotateCw className="w-3 h-3" /> 已自动获取网站图标
              </p>
            )}
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between ml-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">图标预览</label>
              <div className="relative">
                <input
                  type="file"
                  id="custom-icon-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleCustomIconUpload}
                />
                <label
                  htmlFor="custom-icon-upload"
                  className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                >
                  <Upload className="w-3 h-3" />
                  上传本地图片
                </label>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-muted/40 border border-border rounded-xl">
              <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center bg-card shadow-inner border border-border overflow-hidden relative" style={{ borderRadius }}>
                {customIconUrl ? (
                  <img src={customIconUrl} alt="Preview" className="w-[60%] h-[60%] object-contain" />
                ) : faviconStatus === 'loading' || faviconStatus === 'uploading' ? (
                  <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                ) : (
                  <Link className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                )}
              </div>
              <div className="flex-1 overflow-hidden">
                {detectedIcons.length > 1 && !iconFromUpload && (
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                    {detectedIcons.map((url, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCustomIconUrl(url)}
                        className={`w-10 h-10 flex-shrink-0 bg-card border rounded-lg flex items-center justify-center overflow-hidden transition-all ${
                          customIconUrl === url ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-border hover:border-gray-400'
                        }`}
                      >
                        <img src={url} alt="Icon option" className="w-6 h-6 object-contain" />
                      </button>
                    ))}
                  </div>
                )}
                {detectedIcons.length <= 1 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-snug">
                    {iconFromUpload 
                      ? '已使用本地上传的图片作为图标' 
                      : (faviconStatus === 'detected' ? '已匹配最佳图标，可直接添加' : '输入完整网址后自动获取，或手动上传')}
                  </p>
                )}
                {uploadError && (
                  <p className="text-xs text-red-500 mt-1">{uploadError}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleAddCustomToPending}
          disabled={!customName.trim() || !customUrl.trim() || faviconStatus === 'loading' || faviconStatus === 'uploading'}
          className="w-full py-3.5 mt-2 bg-gray-900 hover:bg-black text-white dark:bg-white dark:hover:bg-gray-100 dark:text-black rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md font-medium text-sm flex justify-center items-center gap-2"
        >
          加入待添加列表
        </button>
      </div>
    </div>
  );
}
