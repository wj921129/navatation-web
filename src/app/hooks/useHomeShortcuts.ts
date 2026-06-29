/**
 * @description 首页图标（Home Shortcuts）状态管理 Hook
 * 负责管理 admin/游客模式首页已添加网页图标的 CRUD 操作。
 * 数据源：navatation_recommend_home_shortcut（admin 路由）/ navatation_nav_home_shortcut（用户路由）
 * @date 2026-06-15
 */
import { useCallback, useEffect, useState } from 'react'
import { navService } from '../services/nav-service'
import { publicService } from '../services/public-service'

export function useHomeShortcuts(authState: { isLoggedIn: boolean; user: any }) {
  const [homeShortcuts, setHomeShortcuts] = useState<any[]>([])
  const [tempHomeShortcuts, setTempHomeShortcuts] = useState<any[]>([])

  const fetchHomeShortcuts = useCallback(async () => {
    const mapShortcut = (item: any): any => ({
      id: item.shortcutId,
      dragId: item.shortcutId,
      type: item.type || 'single',
      name: item.name,
      url: item.url,
      color: item.iconColor || '#fff',
      iconType: item.iconType,
      iconValue: item.iconValue || 'Link',
      children: item.children ? item.children.map(mapShortcut) : undefined,
    })

    if (!authState.isLoggedIn) {
      // 游客模式：从 public 接口拉取
      try {
        const res = await publicService.getGuestHomeShortcuts()
        if (res.code === 200 && res.data) {
          const loaded = res.data.map(mapShortcut)
          setHomeShortcuts(loaded)
          setTempHomeShortcuts(loaded)
        }
      } catch (_err) {
        console.error('获取主页快捷方式失败:', _err)
      }
      return
    }

    try {
      const res = await navService.getHomeShortcuts()
      if (res.code === 200 && res.data) {
        const loaded = res.data.map(mapShortcut)
        setHomeShortcuts(loaded)
        setTempHomeShortcuts(loaded)
      }
    } catch (_err) {
      console.error('从服务拉取快捷方式失败:', _err)
    }
  }, [authState.isLoggedIn])

  // 拖拽排序
  const moveHomeShortcut = useCallback((fromIndex: number, toIndex: number) => {
    setTempHomeShortcuts((prev) => {
      const updated = [...prev]
      const [removed] = updated.splice(fromIndex, 1)
      updated.splice(toIndex, 0, removed)
      return updated
    })
  }, [])

  // 保存所有编辑（diff 出 deleted/updated/added，逐一调用 home-shortcut API）
  const handleSaveHomeShortcuts = useCallback(async () => {
    if (!authState.isLoggedIn) {
      setHomeShortcuts([...tempHomeShortcuts])
      return
    }

    const snapshotBeforeEdit = [...homeShortcuts]
    const optimisticShortcuts = [...tempHomeShortcuts]
    setHomeShortcuts(optimisticShortcuts)

    try {
      // 通过新批量接口统一保存所有快捷方式（包含堆叠嵌套结构）
      await navService.batchSaveHomeShortcuts(tempHomeShortcuts)

      // 静默重新拉取以获取最新数据库 ID
      await fetchHomeShortcuts()
    } catch (_err) {
      console.error('编辑/更新主页快捷方式失败:', _err)
      setHomeShortcuts(snapshotBeforeEdit)
    }
  }, [tempHomeShortcuts, homeShortcuts, authState.isLoggedIn, fetchHomeShortcuts])

  // 登录态变化时重新拉取
  useEffect(() => {
    fetchHomeShortcuts()
  }, [fetchHomeShortcuts])

  return {
    homeShortcuts,
    setHomeShortcuts,
    tempHomeShortcuts,
    setTempHomeShortcuts,
    fetchHomeShortcuts,
    moveHomeShortcut,
    handleSaveHomeShortcuts,
  }
}
