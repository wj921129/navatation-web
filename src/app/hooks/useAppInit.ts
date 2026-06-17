/**
 * @description 应用初始化 Hook
 * @date 2026-06-09
 */
import { useEffect } from 'react'
import { toast } from 'sonner'
import { DEFAULT_WALLPAPER } from '../../config/app.config'
import { publicService } from '../services/public-service'
import type { UserSettings } from '../services/settings-service'
import { authStore } from '../stores/auth-store'
import { todoStore } from '../stores/todo-store'

export function useAppInit(
  authState: { isLoggedIn: boolean; user: any },
  setIsEditMode: (v: boolean) => void,
  setBackgroundImage: (v: string) => void,
  setShortcuts: (v: any[]) => void,
  setTempShortcuts: (v: any[]) => void,
  setWidgets: (v: any[]) => void,
  setTempWidgets: (v: any[]) => void,
  setSettings: (v: UserSettings) => void,
  setHomeShortcuts: (v: any[]) => void,
  setTempHomeShortcuts: (v: any[]) => void,
) {
  // 当用户登出（未登录）时，强制退出编辑模式，清空临时状态与壁纸缓存，回归游客初始数据
  useEffect(() => {
    if (!authState.isLoggedIn) {
      setIsEditMode(false)
      localStorage.removeItem('navatation_wallpaper')
      localStorage.removeItem('navatation_guest_categories')
      setBackgroundImage(DEFAULT_WALLPAPER)
      setShortcuts([])
      setTempShortcuts([])
      setHomeShortcuts([])
      setTempHomeShortcuts([])
    }
  }, [
    authState.isLoggedIn,
    setBackgroundImage,
    setShortcuts,
    setTempShortcuts,
    setHomeShortcuts,
    setTempHomeShortcuts,
    setIsEditMode,
  ])

  // 初始化挂载：如果本地存在 Token，则尝试获取用户信息
  useEffect(() => {
    authStore.fetchUser()
  }, [])

  // 监听来自 API 客户端的强制登出事件（如 401 未授权时触发）
  useEffect(() => {
    const handler = () => authStore.logout()
    window.addEventListener('auth:logout', handler)
    return () => window.removeEventListener('auth:logout', handler)
  }, [])

  // 游客模式下自动拉取超级管理员的配置
  useEffect(() => {
    if (authState.isLoggedIn) {
      return
    }

    const fetchGuestConfig = async () => {
      try {
        const [settingsRes, widgetsRes, categoriesRes, shortcutsRes, todosRes, homeShortcutsRes] =
          await Promise.allSettled([
            publicService.getGuestSettings(),
            publicService.getGuestWidgets(),
            publicService.getGuestCategories(),
            publicService.getGuestShortcuts(),
            publicService.getGuestTodos(),
            publicService.getGuestHomeShortcuts(),
          ])

        if (
          shortcutsRes.status === 'fulfilled' &&
          shortcutsRes.value.code === 200 &&
          shortcutsRes.value.data?.length > 0
        ) {
          const configShortcuts = shortcutsRes.value.data
          const loaded = configShortcuts.map((item: any) => ({
            id: item.shortcutId,
            categoryId: item.categoryId,
            name: item.name,
            url: item.url,
            color: item.iconColor ?? '#fff',
            iconType: item.iconType,
            iconValue: item.iconValue ?? 'Link',
            dragId: item.shortcutId ?? Math.random().toString(36).substring(7),
          }))
          setShortcuts(loaded)
          setTempShortcuts(loaded)
          localStorage.setItem('navatation_guest_shortcuts', JSON.stringify(loaded))
        }

        if (
          widgetsRes.status === 'fulfilled' &&
          widgetsRes.value.code === 200 &&
          widgetsRes.value.data?.length > 0
        ) {
          const configWidgets = widgetsRes.value.data
          const loadedW = configWidgets.map((w: any) => ({
            id: w.widgetId ?? `clock-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            type: w.type,
            style: w.style,
            x: Number(w.x),
            y: Number(w.y),
            meta: w.meta ?? {},
          }))
          setWidgets(loadedW)
          setTempWidgets(loadedW)
          localStorage.setItem('navatation_widgets', JSON.stringify(loadedW))
        }

        if (
          settingsRes.status === 'fulfilled' &&
          settingsRes.value.code === 200 &&
          settingsRes.value.data
        ) {
          const configSettings = settingsRes.value.data
          setSettings(configSettings)
          localStorage.setItem('navatation_settings', JSON.stringify(configSettings))
          if (configSettings.backgroundImage) {
            setBackgroundImage(configSettings.backgroundImage)
            localStorage.setItem('navatation_wallpaper', configSettings.backgroundImage)
          }
        }

        if (
          categoriesRes.status === 'fulfilled' &&
          categoriesRes.value.code === 200 &&
          categoriesRes.value.data?.length > 0
        ) {
          const configCategories = categoriesRes.value.data
          localStorage.setItem('navatation_guest_categories', JSON.stringify(configCategories))
        }

        if (
          todosRes.status === 'fulfilled' &&
          todosRes.value.code === 200 &&
          todosRes.value.data?.length > 0
        ) {
          const configTodos = todosRes.value.data
          // 只在没有本地 Todos 缓存时做一次初始化克隆
          if (!localStorage.getItem('navatation_todos')) {
            localStorage.setItem('navatation_todos', JSON.stringify(configTodos))
            // 触发 TodoStore 的重新加载或者让它自己在初始化时读取
            todoStore.loadTodos(false)
          }
        }

        // 加载游客首页图标数据
        if (
          homeShortcutsRes.status === 'fulfilled' &&
          homeShortcutsRes.value.code === 200 &&
          homeShortcutsRes.value.data?.length > 0
        ) {
          const configHomeShortcuts = homeShortcutsRes.value.data
          const loaded = configHomeShortcuts.map((item: any) => ({
            id: item.shortcutId,
            dragId: item.shortcutId,
            name: item.name,
            url: item.url,
            color: item.iconColor ?? '#fff',
            iconType: item.iconType,
            iconValue: item.iconValue ?? 'Link',
          }))
          setHomeShortcuts(loaded)
          setTempHomeShortcuts(loaded)
        }
      } catch (err) {
        console.error('Failed to load guest config:', err)
        toast.error('拉取游客配置失败')
      }
    }

    fetchGuestConfig()
  }, [
    authState.isLoggedIn,
    setShortcuts,
    setTempShortcuts,
    setWidgets,
    setTempWidgets,
    setSettings,
    setBackgroundImage,
    setHomeShortcuts,
    setTempHomeShortcuts,
  ])
}
