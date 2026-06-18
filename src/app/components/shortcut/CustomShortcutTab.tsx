/**
 * @description 自定义快捷方式选项卡组件
 * @date 2026-06-09
 */
import { Check, Link, Loader2, RotateCw, Upload, X } from 'lucide-react'
import type React from 'react'

interface CustomShortcutTabProps {
  customName: string
  setCustomName: (val: string) => void
  customUrl: string
  setCustomUrl: (val: string) => void
  customIconUrl: string
  setCustomIconUrl: (val: string) => void
  faviconStatus: 'idle' | 'loading' | 'detected' | 'error' | 'uploading'
  detectedIcons: string[]
  iconFromUpload: boolean
  uploadError: string | null
  handleCustomIconUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleAddCustomToPending: () => void
  iconRadius: number
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
  iconRadius,
}: CustomShortcutTabProps) {
  const showImagePreview = iconFromUpload || (customIconUrl && customIconUrl !== 'Link')

  return (
    <div className="p-8 h-full flex items-center justify-center">
      <div
        className="w-full max-w-md bg-card/95 border border-border backdrop-blur-xl rounded-3xl shadow-2xl p-8 flex flex-col relative overflow-hidden"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            if (
              customName.trim() &&
              customUrl.trim() &&
              faviconStatus !== 'loading' &&
              faviconStatus !== 'uploading'
            ) {
              handleAddCustomToPending()
            }
          }
        }}
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 text-blue-600 dark:text-blue-400">
            <Link className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-medium">自定义网址</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              输入网址，自动获取图标或手动设置
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              网址链接 *
            </label>
            <input
              type="text"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground outline-none focus:border-blue-500 focus:bg-card transition-all placeholder-gray-400 dark:placeholder-gray-500"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              网站名称 *
            </label>
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
                  value={showImagePreview ? customIconUrl : ''}
                  readOnly={
                    detectedIcons.length > 0 &&
                    detectedIcons.includes(customIconUrl) &&
                    !iconFromUpload
                  }
                  onChange={(e) => {
                    const val = e.target.value
                    setCustomIconUrl(val)
                  }}
                  placeholder="https://example.com/icon.png"
                  className={`w-full px-4 py-3 pr-10 bg-background border border-border rounded-xl outline-none transition-all h-[46px] ${
                    detectedIcons.length > 0 &&
                    detectedIcons.includes(customIconUrl) &&
                    !iconFromUpload
                      ? 'text-gray-400 cursor-text'
                      : 'text-foreground focus:border-blue-500 focus:bg-card placeholder-gray-400 dark:placeholder-gray-500'
                  }`}
                  title={
                    detectedIcons.length > 0 &&
                    detectedIcons.includes(customIconUrl) &&
                    !iconFromUpload
                      ? '搜索结果不可编辑，可双击复制'
                      : '网址图标链接'
                  }
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
                  setCustomIconUrl('')
                  // trigger search again by simulating url change or just clear icon
                  setCustomUrl(customUrl + ' ')
                  setTimeout(() => setCustomUrl(customUrl.trim()), 0)
                }}
                disabled={
                  !customUrl.trim() || faviconStatus === 'loading' || faviconStatus === 'uploading'
                }
                className="p-3 bg-background border border-border hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-700 dark:text-gray-300 rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer h-[46px] w-[46px] flex-shrink-0"
                title="重新检测网址图标"
              >
                <RotateCw
                  className={`w-4 h-4 ${faviconStatus === 'loading' ? 'animate-spin' : ''}`}
                />
              </button>

              <label
                className={`px-4 py-3 rounded-xl cursor-pointer flex items-center gap-2 transition-colors h-[46px] flex-shrink-0 ${
                  faviconStatus === 'uploading'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 cursor-not-allowed'
                    : 'bg-background border border-border hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-700 dark:text-gray-300'
                }`}
              >
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

            {/* 实时图标预览与选择 */}
            {detectedIcons.length > 0 && (
              <div className="mt-3">
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-neutral-800">
                  {detectedIcons.map((iconUrl, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.preventDefault()
                        setCustomIconUrl(iconUrl)
                      }}
                      className={`w-12 h-12 flex-shrink-0 bg-card shadow-sm border rounded-xl flex items-center justify-center overflow-hidden transition-all cursor-pointer ${
                        customIconUrl === iconUrl && showImagePreview
                          ? 'border-blue-500 ring-2 ring-blue-500/20'
                          : 'border-border hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                    >
                      <img src={iconUrl} alt="Icon Option" className="w-6 h-6 object-contain" />
                    </button>
                  ))}
                  {showImagePreview && customIconUrl && (
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        setCustomIconUrl('')
                      }}
                      className="w-12 h-12 flex-shrink-0 bg-red-50/50 dark:bg-red-950/20 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors cursor-pointer"
                      title="清除图标"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="mt-1.5 text-xs text-red-500 dark:text-red-400 font-medium flex items-center gap-1">
                  <span>*</span> 提示：可点击上方检测出的图标进行切换选择
                </p>
              </div>
            )}
            {/* 当没有列表但存在自定义图标（例如刚打开弹窗回显） */}
            {detectedIcons.length === 0 && showImagePreview && customIconUrl && (
              <div className="mt-3 flex items-center gap-3">
                <div className="w-12 h-12 flex-shrink-0 bg-card border border-border rounded-xl flex items-center justify-center overflow-hidden">
                  <img
                    src={customIconUrl}
                    alt="Preview"
                    style={{
                      width: '50%',
                      height: '50%',
                      objectFit: 'contain',
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {customIconUrl}
                  </p>
                  <button
                    onClick={() => {
                      setCustomIconUrl('')
                    }}
                    className="text-xs text-red-500 hover:text-red-600 mt-1 block font-medium cursor-pointer"
                  >
                    移除自定义图标
                  </button>
                </div>
              </div>
            )}
            {uploadError && <p className="mt-2 text-xs text-red-500">{uploadError}</p>}
          </div>
        </div>

        <button
          onClick={handleAddCustomToPending}
          disabled={
            !customName.trim() ||
            !customUrl.trim() ||
            faviconStatus === 'loading' ||
            faviconStatus === 'uploading'
          }
          className="w-full py-3.5 mt-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-md hover:shadow-lg disabled:bg-gray-200 dark:disabled:bg-neutral-800 disabled:text-gray-400 dark:disabled:text-neutral-600 disabled:cursor-not-allowed font-medium text-sm flex justify-center items-center gap-2"
        >
          加入待添加列表
        </button>
      </div>
    </div>
  )
}
