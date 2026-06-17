/**
 * @description 快捷方式管理 Hook
 * @date 2026-06-09
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { navService } from '../services/nav-service'

export function useShortcuts(authState: any) {
  const [shortcuts, setShortcuts] = useState<any[]>(() => {
    if (authState.isLoggedIn) return []
    // 未登录时，优先从本地游客快捷方式缓存加载，消除刷新瞬间的视觉跳变
    const local = localStorage.getItem('navatation_guest_shortcuts')
    if (local) {
      try {
        return JSON.parse(local)
      } catch {
        return []
      }
    }
    return []
  })
  const [tempShortcuts, setTempShortcuts] = useState<any[]>(() => {
    if (authState.isLoggedIn) return []
    // 未登录时，优先从本地游客快捷方式缓存加载，消除刷新瞬间的视觉跳变
    const local = localStorage.getItem('navatation_guest_shortcuts')
    if (local) {
      try {
        return JSON.parse(local)
      } catch {
        return []
      }
    }
    return []
  })
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingShortcut, setEditingShortcut] = useState<{
    index: number
    shortcut: any
  } | null>(null)

  const [isAddShortcutOpen, setIsAddShortcutOpen] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false)

  // 辅助追踪登录切换
  const prevIsLoggedInRef = useRef(authState.isLoggedIn)
  const shortcutsRef = useRef(shortcuts)

  useEffect(() => {
    shortcutsRef.current = shortcuts
  }, [shortcuts])

  /**
   * 核心方法：拉取快捷方式列表。
   * 若用户属首次登录且云端列表为空，则将当前游客模式下的网址批量同步保存至云端。
   */
  const fetchShortcuts = useCallback(async () => {
    // 捕获本次调用的登录切换标识（同步执行，避免异步竞态）
    const isTransitioningLogin = !prevIsLoggedInRef.current && authState.isLoggedIn

    if (!authState.isLoggedIn) {
      // 未登录状态下重置登录切换追踪标识以备下次切换
      prevIsLoggedInRef.current = false
      const local = localStorage.getItem('navatation_guest_shortcuts')
      if (local) {
        try {
          const parsed = JSON.parse(local)
          setShortcuts(parsed)
          setTempShortcuts(parsed)
        } catch {
          setShortcuts([])
          setTempShortcuts([])
        }
      } else {
        setShortcuts([])
        setTempShortcuts([])
      }
      return
    }

    // 已登录状态，记录当前状态为已登录，避免后续重复检测到 transition
    prevIsLoggedInRef.current = true

    try {
      // 从后端接口拉取捷径数据
      const res = await navService.getShortcuts()
      if (res.code !== 200) {
        return
      }

      // 如果属登录切换且云端网址列表为空，则将游客模式下的本地捷径数据同步至云端
      if (isTransitioningLogin && res.data.length === 0) {
        const guestShortcuts = shortcutsRef.current
        if (guestShortcuts && guestShortcuts.length > 0) {
          // 获取当前用户的第一个分类
          const catRes = await navService.getCategories()
          const categoryId =
            catRes.code === 200 && catRes.data.length > 0 ? catRes.data[0].categoryId : undefined

          // 封装批量保存请求体
          const payload = guestShortcuts.map((s) => {
            let iconName = 'Link'
            if (typeof s.iconValue === 'string') {
              iconName = s.iconValue
            } else if (s.icon && s.icon.displayName) {
              iconName = s.icon.displayName
            } else if (s.icon && s.icon.name) {
              iconName = s.icon.name
            }
            return {
              name: s.name,
              url: s.url,
              iconType: s.iconType || 'BUILTIN',
              iconValue: iconName,
              iconColor: s.color || s.iconColor || '#fff',
            }
          })

          // 调用批量创建接口同步数据
          await navService.batchCreateShortcuts({
            categoryId: categoryId as any,
            shortcuts: payload,
          })

          // 重新拉取同步后的云端数据
          const newRes = await navService.getShortcuts()
          if (newRes.code === 200) {
            const loaded = newRes.data.map((item) => ({
              id: item.shortcutId,
              dragId: item.shortcutId,
              categoryId: item.categoryId,
              name: item.name,
              url: item.url,
              color: item.iconColor || '#fff',
              iconType: item.iconType,
              iconValue: item.iconValue || 'Link',
            }))
            setShortcuts(loaded)
            setTempShortcuts(loaded)
          }
          return
        }
      }

      // 正常加载并将云端数据转换为前端格式
      const loaded = res.data.map((item) => ({
        id: item.shortcutId,
        dragId: item.shortcutId,
        categoryId: item.categoryId,
        name: item.name,
        url: item.url,
        color: item.iconColor || '#fff',
        iconType: item.iconType,
        iconValue: item.iconValue || 'Link',
      }))
      setShortcuts(loaded)
      setTempShortcuts(loaded)
    } catch (err) {
      console.error('Failed to fetch shortcuts', err)
    }
  }, [authState.isLoggedIn])

  // 拖拽排序 - 移动快捷方式在临时列表中的位置
  const moveShortcut = useCallback(
    (fromIndex: number, toIndex: number) => {
      const updated = [...tempShortcuts]
      const [removed] = updated.splice(fromIndex, 1)
      updated.splice(toIndex, 0, removed)
      setTempShortcuts(updated)
    },
    [tempShortcuts],
  )

  /**
   * 批量添加捷径。
   * 仅在临时编辑列表 tempShortcuts 中追加，等最终保存时统一持久化。
   */
  const handleAddShortcuts = useCallback((newShortcuts: any[]) => {
    const formatted = newShortcuts.map((s) => {
      let iconName = 'Link'
      if (s.iconType && s.iconType !== 'BUILTIN') {
        iconName = s.iconValue
      } else if (s.icon && s.icon.displayName) {
        iconName = s.icon.displayName
      } else if (s.icon && s.icon.name) {
        iconName = s.icon.name
      } else if (typeof s.iconValue === 'string') {
        iconName = s.iconValue
      }

      return {
        name: s.name,
        url: s.url,
        color: s.color || '#fff',
        iconType: s.iconType || 'BUILTIN',
        iconValue: iconName,
      }
    })
    setTempShortcuts((prev) => [...prev, ...formatted])
  }, [])

  /**
   * 开启编辑模式。
   * 备份当前捷径至临时编辑列表，确保取消操作时可完美还原。
   */
  const handleStartEdit = useCallback(() => {
    setTempShortcuts([...shortcuts])
    setIsEditMode(true)
  }, [shortcuts])

  /**
   * 保存编辑后的全部捷径。
   * 将临时编辑列表应用到正式展示列表并退出编辑模式。
   * 如果已登录，则同步执行增删改请求将修改保存至云端。
   */
  const handleSaveEdits = useCallback(async () => {
    if (!authState.isLoggedIn) {
      // 未登录状态下，直接将本地编辑应用到展示列表并退出编辑模式
      setShortcuts([...tempShortcuts])
      setIsEditMode(false)
      return
    }

    // 乐观更新 (Optimistic UI)：立即应用 UI 更改，避免界面卡顿
    const snapshotBeforeEdit = [...shortcuts]
    const optimisticShortcuts = [...tempShortcuts]
    setShortcuts(optimisticShortcuts)
    setIsEditMode(false)

    try {
      // 1. 找出所有在编辑模式下被删除的快捷网址
      const deleted = shortcuts.filter((s) => s.id && !tempShortcuts.some((t) => t.id === s.id))

      // 2. 找出所有在编辑模式下被修改了的快捷网址（对比名称、URL、图标类型、图标值及颜色）
      const updated = tempShortcuts.filter((t) => {
        if (!t.id) return false
        const original = shortcuts.find((s) => s.id === t.id)
        return (
          original &&
          (original.name !== t.name ||
            original.url !== t.url ||
            original.iconType !== t.iconType ||
            original.iconValue !== t.iconValue ||
            original.color !== t.color)
        )
      })

      // 3. 找出所有在编辑模式下新增的快捷网址（无 id 的项）
      const added = tempShortcuts.filter((t) => !t.id)

      // 4. 并发执行删除与更新 API 请求
      const writePromises: Promise<any>[] = [
        ...deleted.map((s) => navService.deleteShortcut(s.id)),
        ...updated.map((t) =>
          navService.updateShortcut(t.id, {
            name: t.name,
            url: t.url,
            iconType: t.iconType,
            iconValue: t.iconValue,
            iconColor: t.color,
          }),
        ),
      ]
      await Promise.all(writePromises)

      // 5. 如果有新增项，批量同步到云端
      if (added.length > 0) {
        const catRes = await navService.getCategories()
        const categoryId =
          catRes.code === 200 && catRes.data.length > 0 ? catRes.data[0].categoryId : undefined
        const addedPayload = added.map((s) => ({
          name: s.name,
          url: s.url,
          iconType: s.iconType,
          iconValue: s.iconValue,
          iconColor: s.color,
        }))
        await navService.batchCreateShortcuts({
          categoryId: categoryId as any,
          shortcuts: addedPayload,
        })
      }

      // 6. 重新拉取最新的云端捷径数据（获取带有真实数据库 id 的全量数据）
      const res = await navService.getShortcuts()
      if (res.code === 200 && res.data) {
        const loaded = res.data.map((item) => ({
          id: item.shortcutId,
          dragId: item.shortcutId,
          categoryId: item.categoryId,
          name: item.name,
          url: item.url,
          color: item.iconColor || '#fff',
          iconType: item.iconType,
          iconValue: item.iconValue || 'Link',
        }))

        // 7. 按 tempShortcuts 中设定的最终相对顺序将带有 ID 的项目重排组装起来
        const orderedShortcuts: any[] = []
        tempShortcuts.forEach((temp) => {
          let matched: any = null
          if (temp.id) {
            matched = loaded.find((l) => l.id === temp.id)
          } else {
            // 用 name & url 匹配新创建项
            matched = loaded.find(
              (l) =>
                l.name === temp.name &&
                l.url === temp.url &&
                !orderedShortcuts.some((o) => o.id === l.id),
            )
          }
          if (matched) {
            orderedShortcuts.push(matched)
          }
        })

        // 兜底补齐：防止有遗漏未匹配项
        loaded.forEach((l) => {
          if (!orderedShortcuts.some((o) => o.id === l.id)) {
            orderedShortcuts.push(l)
          }
        })

        // 8. 统一对最终排好序的列表在后端执行排序接口持久化
        const sortItems = orderedShortcuts.map((item, idx) => ({
          shortcutId: item.id,
          sortOrder: idx,
        }))
        await navService.sortShortcuts(sortItems)
      }

      // 9. 全局静默重新加载以同步 React 界面状态及真实的数据库 ID
      await fetchShortcuts()
    } catch (err) {
      console.error('Failed to save shortcut edits to backend', err)
      // 发生异常时回滚乐观更新
      setShortcuts(snapshotBeforeEdit)
      // 可以加上 toast 提示
    }
  }, [tempShortcuts, shortcuts, authState.isLoggedIn, fetchShortcuts])

  /**
   * 取消编辑模式。
   * 还原临时编辑列表，清空正在编辑的单项，并退出编辑模式。
   */
  const handleCancelEdits = useCallback(() => {
    setTempShortcuts([...shortcuts])
    setIsEditMode(false)
    setEditingShortcut(null)
  }, [shortcuts])

  /**
   * 删除捷径。
   * 过滤临时列表中的对应项。
   */
  const handleDeleteShortcut = useCallback((index: number) => {
    setTempShortcuts((prev) => prev.filter((_, i) => i !== index))
  }, [])

  /**
   * 点击单项捷径以启动编辑。
   * 记录正在编辑的捷径下标和具体内容。
   */
  const handleEditShortcut = useCallback(
    (index: number) => {
      setEditingShortcut({ index, shortcut: tempShortcuts[index] })
    },
    [tempShortcuts],
  )

  /**
   * 保存单个捷径的编辑修改。
   * 更新临时列表中的指定项信息。
   */
  const handleSaveEdit = useCallback(
    (updatedShortcut: { name: string; url: string; iconType: string; iconValue: string }) => {
      if (editingShortcut) {
        setTempShortcuts((prev) => {
          const newShortcuts = [...prev]
          newShortcuts[editingShortcut.index] = {
            ...newShortcuts[editingShortcut.index],
            name: updatedShortcut.name,
            url: updatedShortcut.url,
            iconType: updatedShortcut.iconType,
            iconValue: updatedShortcut.iconValue,
          }
          return newShortcuts
        })
        setEditingShortcut(null)
      }
    },
    [editingShortcut],
  )

  // 当外部的登录态改变时，重新拉取（或重置游客）数据
  useEffect(() => {
    fetchShortcuts()
  }, [fetchShortcuts])

  return {
    shortcuts,
    setShortcuts,
    tempShortcuts,
    setTempShortcuts,
    isEditMode,
    setIsEditMode,
    editingShortcut,
    setEditingShortcut,
    isAddShortcutOpen,
    setIsAddShortcutOpen,
    isLoginOpen,
    setIsLoginOpen,
    isLogoutConfirmOpen,
    setIsLogoutConfirmOpen,
    fetchShortcuts,
    moveShortcut,
    handleAddShortcuts,
    handleStartEdit,
    handleSaveEdits,
    handleCancelEdits,
    handleDeleteShortcut,
    handleEditShortcut,
    handleSaveEdit,
  }
}
