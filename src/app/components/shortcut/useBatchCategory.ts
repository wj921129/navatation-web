/**
 * @description 批量分类编辑管理钩子
 * @date 2026-06-09
 */

import { Link } from 'lucide-react'
import { startTransition, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import type { CategoryGroup, RecommendedSite } from '../../constants/recommendedSitesData'
import { useFaviconDetector } from '../../hooks/useFaviconDetector'
import { type IconType, navService } from '../../services/nav-service'

export function useBatchCategory(categories: CategoryGroup[], loadRecommended: () => void) {
  const [isBatchMode, setIsBatchMode] = useState(false)
  const [batchEditData, setBatchEditData] = useState<CategoryGroup[]>([])

  const toggleBatchMode = (forceState?: boolean) => {
    const nextState = forceState !== undefined ? forceState : !isBatchMode
    if (nextState === isBatchMode) return

    if (nextState) {
      const deepCopied = categories.map((cat) => ({
        ...cat,
        sites: Array.isArray(cat.sites) ? cat.sites.map((site) => ({ ...site })) : [],
      }))
      setBatchEditData(deepCopied)
      setIsBatchMode(true)
    } else {
      setIsBatchMode(false)
    }
  }

  const updateBatchEditSite = (
    catIdx: number,
    siteIdx: number,
    fields: Partial<RecommendedSite>,
  ) => {
    setBatchEditData((prev) => {
      const copy = [...prev]
      copy[catIdx].sites[siteIdx] = {
        ...copy[catIdx].sites[siteIdx],
        ...fields,
      }
      return copy
    })
  }

  const {
    rowLoadingStatus,
    rowDetectedIcons,
    isAllRefreshing,
    setRowLoadingStatus,
    setRowDetectedIcons,
    handleDetectRowIcon,
    handleBatchRefreshCategoryIcons,
    handleBatchRefreshAllIcons,
  } = (useFaviconDetector as any)(batchEditData, setBatchEditData, updateBatchEditSite)

  const rowFileInputRef = useRef<HTMLInputElement>(null)
  const activeUploadRow = useRef<{ catIdx: number; siteIdx: number } | null>(null)

  useEffect(() => {
    if (isBatchMode) {
      const deepCopied = categories.map((cat) => ({
        ...cat,
        sites: Array.isArray(cat.sites) ? cat.sites.map((site) => ({ ...site })) : [],
      }))
      startTransition(() => {
        setBatchEditData(deepCopied)
      })
    }
  }, [categories])

  const handleTriggerRowUpload = (catIdx: number, siteIdx: number) => {
    activeUploadRow.current = { catIdx, siteIdx }
    if (rowFileInputRef.current) {
      rowFileInputRef.current.click()
    }
  }

  const handleRowIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !activeUploadRow.current) return
    e.target.value = ''
    const { catIdx, siteIdx } = activeUploadRow.current
    const rowKey = `${catIdx}-${siteIdx}`

    setRowLoadingStatus((prev: any) => ({ ...prev, [rowKey]: true }))
    try {
      const res = await navService.uploadIcon(file)
      if (res.code === 200 && res.data?.iconUrl) {
        updateBatchEditSite(catIdx, siteIdx, {
          iconType: 'CUSTOM_UPLOAD',
          iconValue: res.data.iconUrl,
        })
        setRowDetectedIcons((prev: any) => ({
          ...prev,
          [rowKey]: [res.data.iconUrl],
        }))
      }
    } catch (_err) {
    } finally {
      setRowLoadingStatus((prev: any) => ({ ...prev, [rowKey]: false }))
      activeUploadRow.current = null
    }
  }

  const handleAddEmptyRow = (catIdx: number) => {
    setBatchEditData((prev) => {
      const copy = [...prev]
      const categorySites = copy[catIdx].sites
      const newEmptySite: RecommendedSite = {
        name: '',
        url: '',
        icon: Link,
        iconType: 'BUILTIN' as IconType,
        iconValue: 'Link',
        color: '#4285F4',
        dragId: Math.random().toString(36).substring(7),
      }

      copy[catIdx].sites = [...categorySites, newEmptySite]
      return copy
    })
  }

  const handleDeleteRow = (catIdx: number, siteIdx: number) => {
    setBatchEditData((prev) => {
      const copy = [...prev]
      copy[catIdx].sites = copy[catIdx].sites.filter((_, idx) => idx !== siteIdx)
      return copy
    })
  }

  const handleSaveAllCategories = async () => {
    const dataToSave = isBatchMode ? batchEditData : categories
    try {
      // Validate first
      for (const cat of dataToSave) {
        for (let i = 0; i < cat.sites.length; i++) {
          const site = cat.sites[i]
          if (!site.name.trim() || !site.url.trim()) {
            toast.warning(`分类【${cat.category}】下的部分网址名称或链接为空，请补充完整再保存。`)
            return
          }
        }
      }

      await Promise.all(
        dataToSave.map((cat, index) => {
          if (!cat.categoryId) return Promise.resolve()

          const promises = []

          // Check if category sort order changed
          const originalCat = categories.find((c) => c.categoryId === cat.categoryId)
          if (originalCat && originalCat.sortOrder !== index) {
            promises.push(
              navService.updateRecommendCategory(cat.categoryId, {
                name: cat.category,
                icon: cat.iconValue,
                sortOrder: index,
              }),
            )
          }

          const formattedSites = cat.sites.map((site) => ({
            siteId: site.siteId,
            name: site.name.trim(),
            url: site.url.trim().startsWith('http')
              ? site.url.trim()
              : `https://${site.url.trim()}`,
            iconType: site.iconType || 'FAVICON',
            iconValue: site.iconValue || '',
            iconColor: site.color || '#fff',
          }))

          promises.push(
            navService.batchSaveRecommendSites(cat.categoryId, {
              sites: formattedSites,
            }),
          )

          return Promise.all(promises)
        }),
      )
      loadRecommended()
      toast.success('已保存', { duration: 2000 })
    } catch (_err) {}
  }

  const handleSaveCategorySites = async (categoryGroup: CategoryGroup) => {
    const categoryId = categoryGroup.categoryId
    if (!categoryId) {
      toast.warning('分类不存在或未在数据库建立，请先保存该分类。')
      return
    }

    const sites = categoryGroup.sites
    for (let i = 0; i < sites.length; i++) {
      const site = sites[i]
      if (!site.name.trim()) {
        toast.warning(`第 ${i + 1} 行网站名称不能为空`)
        return
      }
      if (!site.url.trim()) {
        toast.warning(`第 ${i + 1} 行网址链接不能为空`)
        return
      }
    }

    const formattedSites = sites.map((site) => ({
      siteId: site.siteId,
      name: site.name.trim(),
      url: site.url.trim().startsWith('http') ? site.url.trim() : `https://${site.url.trim()}`,
      iconType: site.iconType || 'FAVICON',
      iconValue: site.iconValue || '',
      iconColor: site.color || '#fff',
    }))

    try {
      const res = await navService.batchSaveRecommendSites(categoryId, {
        sites: formattedSites,
      })
      if (res.code === 200) {
        loadRecommended()
        toast.success('已保存', { duration: 2000 })
      }
    } catch (_err) {}
  }

  return {
    isBatchMode,
    setIsBatchMode,
    toggleBatchMode,
    batchEditData,
    setBatchEditData,
    rowLoadingStatus,
    setRowLoadingStatus,
    rowDetectedIcons,
    setRowDetectedIcons,
    isAllRefreshing,
    rowFileInputRef,
    updateBatchEditSite,
    handleTriggerRowUpload,
    handleRowIconUpload,
    handleAddEmptyRow,
    handleDeleteRow,
    handleSaveAllCategories,
    handleSaveCategorySites,
    handleDetectRowIcon,
    handleBatchRefreshCategoryIcons,
    handleBatchRefreshAllIcons,
  }
}
