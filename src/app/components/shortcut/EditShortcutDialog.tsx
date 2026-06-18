/**
 * @description 编辑快捷方式对话框
 * @date 2026-06-09
 */
import { Check, Link, Loader2, RotateCw, Upload, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { navService } from '../../services/nav-service'
import { BaseModal } from '../ui/BaseModal'

interface EditShortcutDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (shortcut: { name: string; url: string; iconType: string; iconValue: string }) => void
  shortcut: {
    id?: number | string
    name: string
    url: string
    iconType?: string
    iconValue?: string
  }
}

/**
 * 校验输入是否为合法且完整的域名或 URL。
 * 要求必须包含 dot 且顶级域名 (TLD) 至少为 2 位字母，排除未输入完的情况。
 */
const isValidDomainOrUrl = (input: string): boolean => {
  const url = input.trim()
  if (!url) {
    return false
  }
  // 匹配常见域名结构，要求包含 dot 且顶级域名(TLD)至少为 2 位字母，排除以 dot 结尾
  const domainRegex = /^(https?:\/\/)?([a-zA-Z0-9][-a-zA-Z0-9]{0,62}\.)+[a-zA-Z]{2,63}(\/.*)?$/
  return domainRegex.test(url)
}

/**
 * 根据域名后缀智能获取防抖延迟时间，防止后缀未输入完毕就急于触发搜索。
 */
const getDebounceDelay = (input: string): number => {
  const url = input.trim()
  if (!url) {
    return 500
  }

  let host = ''
  try {
    const fullUrl = url.startsWith('http') ? url : `https://${url}`
    const parsed = new URL(fullUrl)
    host = parsed.host
  } catch (err) {
    console.warn('URL 解析错误，使用默认延迟:', err)
    return 500
  }

  const parts = host.split('.')
  if (parts.length < 2) {
    return 500
  }

  const tld = parts[parts.length - 1].toLowerCase()

  // 著名 3+ 位域名的 2 位未完成前缀，如 .co -> .com, .ne -> .net, .or -> .org 等
  const incompletePrefixes = ['co', 'ne', 'or', 'ed', 'go']

  // 常见已输入完的后缀
  const commonCompletedTlds = [
    'com',
    'net',
    'org',
    'edu',
    'gov',
    'cn',
    'cc',
    'io',
    'me',
    'tv',
    'so',
    'info',
    'xyz',
    'top',
    'vip',
  ]

  if (incompletePrefixes.includes(tld)) {
    // 极有可能是正在输入 com, net, org 等，给予 1500ms 充足的输入缓冲时间
    return 1500
  }

  if (commonCompletedTlds.includes(tld)) {
    // 常见已完成的顶级域名，快速响应
    return 500
  }

  // 其他域名格式，给予 1000ms 缓冲
  return 1000
}

/**
 * 编辑快捷方式对话框组件
 * 用于修改已存在的快捷方式的网址、名称和图标
 * @param props 包含弹窗状态、保存回调和快捷方式数据等
 */
export function EditShortcutDialog({ isOpen, onClose, onSave, shortcut }: EditShortcutDialogProps) {
  const [name, setName] = useState(shortcut.name)
  const [url, setUrl] = useState(shortcut.url)
  const [iconType, setIconType] = useState(shortcut.iconType || 'BUILTIN')
  const [iconValue, setIconValue] = useState(shortcut.iconValue || 'Link')

  const [faviconStatus, setFaviconStatus] = useState<
    'idle' | 'loading' | 'detected' | 'error' | 'uploading'
  >('idle')
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [detectedIcons, setDetectedIcons] = useState<string[]>([])
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    setName(shortcut.name)
    setUrl(shortcut.url)
    setIconType(shortcut.iconType || 'BUILTIN')
    setIconValue(shortcut.iconValue || 'Link')
    setFaviconStatus('idle')
    setUploadError(null)
    setDetectedIcons([])
  }, [shortcut])

  /**
   * 触发网址图标搜索的核心逻辑
   * @param currentUrl 当前输入的网址
   * @param force 是否强制触发搜索
   */
  const triggerSearch = (currentUrl: string, force: boolean = false) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }
    const targetUrl = currentUrl.trim()
    // 只有在非强制刷新时，才拦截 targetUrl === shortcut.url
    if (!targetUrl || (!force && targetUrl === shortcut.url)) {
      setFaviconStatus('idle')
      setDetectedIcons([])
      return
    }

    // 若域名格式不完整或不合法，不进行搜索
    if (!isValidDomainOrUrl(targetUrl)) {
      setFaviconStatus('idle')
      return
    }

    const fullUrl = targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`

    let host = ''
    try {
      const parsed = new URL(fullUrl)
      host = parsed.host
    } catch (err) {
      console.warn('解析 URL 主机名失败:', err)
      setFaviconStatus('idle')
      setDetectedIcons([])
      return
    }

    setFaviconStatus('loading')
    setDetectedIcons([])

    const handleIconResult = (iconUrl: string) => {
      if (!iconUrl) {
        return
      }
      setDetectedIcons((prev) => {
        if (prev.includes(iconUrl)) {
          return prev
        }
        const newIcons = [...prev, iconUrl]
        if (newIcons.length === 1) {
          setIconValue(iconUrl)
          setIconType('FAVICON')
          setFaviconStatus('detected')
        }
        return newIcons
      })
    }

    // 1. 瞬时响应：Google CDN
    const googleCdn = `https://www.google.com/s2/favicons?sz=64&domain=${host}`
    handleIconResult(googleCdn)

    // 2. 备用 CDN：DuckDuckGo
    const ddgCdn = `https://icons.duckduckgo.com/ip3/${host}.ico`
    const img = new Image()
    img.onload = () => handleIconResult(ddgCdn)
    img.src = ddgCdn

    // 3. 后端抓取
    navService
      .fetchFavicon(fullUrl)
      .then((res) => {
        if (res?.code === 200 && res?.data?.faviconUrls) {
          res.data.faviconUrls.forEach((url: string) => handleIconResult(url))
        }
      })
      .catch((e) => {
        console.error('抓取图标失败:', e)
      })
  }

  // 当网址链接改变且不等于原网址时，防抖并并行多路检测网站图标
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }
    // 如果是本地上传的图标，停用通过网址搜索图标功能
    if (iconType === 'CUSTOM_UPLOAD') {
      return
    }
    const currentUrl = url.trim()
    if (!currentUrl || currentUrl === shortcut.url) {
      setFaviconStatus('idle')
      setDetectedIcons([])
      return
    }

    // 若域名格式不完整或不合法，保持静默，状态设为 idle
    if (!isValidDomainOrUrl(currentUrl)) {
      setFaviconStatus('idle')
      return
    }

    // 智能获取延迟时间，防止后缀（如 .co -> .com）未打完即触发搜索
    const delay = getDebounceDelay(currentUrl)

    debounceTimer.current = setTimeout(() => {
      triggerSearch(currentUrl)
    }, delay)

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [url, shortcut.url, iconType])

  /**
   * 上传自定义图标并更新图标的值与类型
   * @param e 文件上传事件
   */
  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      return
    }
    // 重置 input 的 value，确保同名文件可再次上传触发 onChange
    e.target.value = ''
    setFaviconStatus('uploading')
    setUploadError(null)
    try {
      const res = await navService.uploadIcon(file)
      if (res?.code === 200 && res?.data?.iconUrl) {
        const url = res.data.iconUrl
        setIconValue(url)
        setIconType('CUSTOM_UPLOAD')
        // 清空所有通过网址搜索的图标，只保留本地上传的图标
        setDetectedIcons([url])
        setFaviconStatus('detected')
      } else {
        setUploadError(res?.message ?? '上传失败')
        setFaviconStatus('error')
      }
    } catch (e) {
      console.error('上传自定义图标失败:', e)
      const errorMessage = e instanceof Error ? e.message : String(e)
      setUploadError(errorMessage)
      setFaviconStatus('error')
    }
  }

  /**
   * 保存修改并关闭弹窗
   */
  const handleSave = () => {
    if (name.trim() && url.trim()) {
      onSave({
        name,
        url: url.startsWith('http') ? url : `https://${url}`,
        iconType,
        iconValue,
      })
      onClose()
    }
  }

  const showImagePreview =
    iconType === 'CUSTOM_URL' || iconType === 'FAVICON' || iconType === 'CUSTOM_UPLOAD'

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      animationType="scale"
      position="center"
      containerClassName="bg-card/95 border border-border backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md p-8 text-foreground"
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
            onBlur={() => iconType !== 'CUSTOM_UPLOAD' && triggerSearch(url)}
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
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
            网址图标链接
          </label>
          <div className="flex gap-2 items-center">
            <div className="flex-1 relative">
              <input
                type="text"
                value={showImagePreview ? iconValue : ''}
                readOnly={detectedIcons.length > 0 && detectedIcons.includes(iconValue)}
                onChange={(e) => {
                  const val = e.target.value
                  setIconValue(val)
                  if (val) {
                    setIconType('CUSTOM_URL')
                    setFaviconStatus('idle')
                  } else {
                    setIconType('BUILTIN')
                    setIconValue('Link')
                  }
                }}
                placeholder="https://example.com/icon.png"
                className={`w-full px-4 py-3 pr-10 bg-background border border-border rounded-xl outline-none transition-all h-[46px] ${
                  detectedIcons.length > 0 && detectedIcons.includes(iconValue)
                    ? 'text-gray-400 cursor-text'
                    : 'text-foreground focus:border-blue-500 focus:bg-card placeholder-gray-400 dark:placeholder-gray-500'
                }`}
                title={
                  detectedIcons.length > 0 && detectedIcons.includes(iconValue)
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
                setIconType('BUILTIN')
                setIconValue('Link')
                setDetectedIcons([])
                setTimeout(() => {
                  triggerSearch(url, true)
                }, 0)
              }}
              disabled={
                !isValidDomainOrUrl(url) ||
                faviconStatus === 'loading' ||
                faviconStatus === 'uploading'
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
                onChange={handleIconUpload}
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
                      setIconValue(iconUrl)
                      setIconType(iconUrl.includes('/uploads/') ? 'CUSTOM_UPLOAD' : 'FAVICON')
                    }}
                    className={`w-12 h-12 flex-shrink-0 bg-card shadow-sm border rounded-xl flex items-center justify-center overflow-hidden transition-all cursor-pointer ${
                      iconValue === iconUrl && showImagePreview
                        ? 'border-blue-500 ring-2 ring-blue-500/20'
                        : 'border-border hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  >
                    <img src={iconUrl} alt="Icon Option" className="w-6 h-6 object-contain" />
                  </button>
                ))}
                {showImagePreview && iconValue && (
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      setIconType('BUILTIN')
                      setIconValue('Link')
                      setDetectedIcons([])
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
                    setIconType('BUILTIN')
                    setIconValue('Link')
                    setFaviconStatus('idle')
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
    </BaseModal>
  )
}
