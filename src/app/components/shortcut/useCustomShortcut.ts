/**
 * @description 自定义快捷方式的逻辑提取
 * @date 2026-06-09
 */

import { Link } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { RecommendedSite } from '../../constants/recommendedSitesData'
import { getDebounceDelay, isValidDomainOrUrl } from '../../hooks/useFaviconDetector'
import { navService } from '../../services/nav-service'

export function useCustomShortcut(onAddToPending: (site: RecommendedSite) => void) {
  const [customName, setCustomName] = useState('')
  const [customUrl, setCustomUrl] = useState('')
  const [customIconUrl, setCustomIconUrl] = useState('')
  const [faviconStatus, setFaviconStatus] = useState<
    'idle' | 'loading' | 'detected' | 'error' | 'uploading'
  >('idle')
  const [iconFromUpload, setIconFromUpload] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [detectedIcons, setDetectedIcons] = useState<string[]>([])
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>()

  const triggerSearch = (url: string) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    const targetUrl = url.trim()
    if (!targetUrl) {
      setFaviconStatus('idle')
      setUploadError(null)
      setDetectedIcons([])
      setCustomIconUrl('')
      return
    }

    if (!isValidDomainOrUrl(targetUrl)) {
      setFaviconStatus('idle')
      return
    }

    const fullUrl = targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`
    let host = ''
    try {
      const parsed = new URL(fullUrl)
      host = parsed.host
    } catch {
      setFaviconStatus('idle')
      setUploadError(null)
      setDetectedIcons([])
      return
    }

    setFaviconStatus('loading')
    setDetectedIcons([])
    setCustomIconUrl('')

    const handleIconResult = (iconUrl: string) => {
      if (!iconUrl) return
      setDetectedIcons((prev) => {
        if (prev.includes(iconUrl)) return prev
        const newIcons = [...prev, iconUrl]
        if (newIcons.length === 1) {
          setCustomIconUrl(iconUrl)
          setFaviconStatus('detected')
        }
        return newIcons
      })
    }

    handleIconResult(`https://www.google.com/s2/favicons?sz=64&domain=${host}`)

    const ddgCdn = `https://icons.duckduckgo.com/ip3/${host}.ico`
    const img = new Image()
    img.onload = () => handleIconResult(ddgCdn)
    img.src = ddgCdn

    navService
      .fetchFavicon(fullUrl)
      .then((res) => {
        if (res.code === 200 && res.data?.faviconUrls) {
          res.data.faviconUrls.forEach((url: string) => handleIconResult(url))
        }
      })
      .catch(() => {})
  }

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    if (iconFromUpload) return

    const url = customUrl.trim()
    if (!url) {
      setFaviconStatus('idle')
      setUploadError(null)
      setDetectedIcons([])
      setCustomIconUrl('')
      return
    }

    if (!isValidDomainOrUrl(url)) {
      setFaviconStatus('idle')
      return
    }

    const delay = getDebounceDelay(url)
    debounceTimer.current = setTimeout(() => {
      triggerSearch(url)
    }, delay)

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
    }
  }, [customUrl, iconFromUpload])

  const handleCustomIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setFaviconStatus('uploading')
    setUploadError(null)
    try {
      const res = await navService.uploadIcon(file)
      if (res.code === 200 && res.data?.iconUrl) {
        const url = res.data.iconUrl
        setCustomIconUrl(url)
        setDetectedIcons([url])
        setIconFromUpload(true)
        setFaviconStatus('detected')
      } else {
        setUploadError(res.message || '上传失败')
        setFaviconStatus('error')
      }
    } catch (err) {
      setUploadError(String(err))
      setFaviconStatus('error')
    }
  }

  const handleAddCustomToPending = () => {
    if (customName.trim() && customUrl.trim()) {
      const url = customUrl.startsWith('http') ? customUrl : `https://${customUrl}`
      let iconType: string
      let iconValue: string | undefined
      if (iconFromUpload && customIconUrl) {
        iconType = 'CUSTOM_UPLOAD'
        iconValue = customIconUrl
      } else if (customIconUrl) {
        iconType = 'FAVICON'
        iconValue = customIconUrl
      } else {
        iconType = 'BUILTIN'
        iconValue = 'Link'
      }

      const newShortcut: RecommendedSite = {
        name: customName,
        icon: Link,
        color: '#4285F4',
        url,
        iconType: iconType as any,
        iconValue,
        dragId: Math.random().toString(36).substring(7),
      }

      onAddToPending(newShortcut)
      resetCustomState()
    }
  }

  const resetCustomState = () => {
    setCustomName('')
    setCustomUrl('')
    setCustomIconUrl('')
    setFaviconStatus('idle')
    setIconFromUpload(false)
    setUploadError(null)
    setDetectedIcons([])
  }

  return {
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
    resetCustomState,
  }
}
