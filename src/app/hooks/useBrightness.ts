/**
 * @description 亮度控制 Hook
 * @date 2026-06-09
 */
import { useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'
import { settingsService } from '../services/settings-service'

export function useBrightness(theme: string, setTheme: (theme: string) => void, authState: any) {
  // 屏幕背景亮度控制小功能 (仅在深色模式下支持变暗调节，且暂存在本地浏览器缓存中)
  const [bgBrightness, setBgBrightness] = useState(() => {
    const saved = localStorage.getItem('navatation_bg_brightness')
    if (saved !== null) {
      return Number(saved)
    }
    return 80 // 默认深色模式亮度为 80%
  })
  const [isBrightnessOpen, setIsBrightnessOpen] = useState(false)
  const [isBrightnessClosing, setIsBrightnessClosing] = useState(false)
  const [isHoveringBrightness, setIsHoveringBrightness] = useState(false)
  const brightnessTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  /**
   * 清理屏幕亮度控制的延迟关闭定时器
   */
  const clearBrightnessTimer = useCallback(() => {
    if (brightnessTimerRef.current) {
      clearTimeout(brightnessTimerRef.current)
      brightnessTimerRef.current = null
    }
  }, [])

  /**
   * 重置屏幕亮度调节的所有交互状态变量，安全归零
   */
  const resetBrightnessState = useCallback(() => {
    setIsBrightnessOpen(false)
    setIsBrightnessClosing(false)
    setIsHoveringBrightness(false)
    clearBrightnessTimer()
  }, [clearBrightnessTimer])

  const triggerCloseBrightness = useCallback(() => {
    setIsBrightnessClosing(true)
    setIsHoveringBrightness(false)
    clearBrightnessTimer()
    brightnessTimerRef.current = setTimeout(() => {
      setIsBrightnessOpen(false)
      setIsBrightnessClosing(false)
    }, 280)
  }, [clearBrightnessTimer])

  /**
   * 切换主题
   */
  const handleToggleTheme = useCallback(async () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)

    if (nextTheme === 'dark') {
      setIsBrightnessOpen(true)
      setIsBrightnessClosing(false)
      clearBrightnessTimer()
      brightnessTimerRef.current = setTimeout(() => {
        triggerCloseBrightness()
      }, 2000)
    } else {
      resetBrightnessState()
    }

    if (!authState.isLoggedIn) {
      return
    }

    try {
      await settingsService.patchSettings({ theme: nextTheme })
    } catch (err) {
      console.error('Toggle theme error:', err)
      toast.error('保存主题设置失败')
    }
  }, [
    theme,
    authState.isLoggedIn,
    clearBrightnessTimer,
    resetBrightnessState,
    setTheme,
    triggerCloseBrightness,
  ])

  /**
   * 鼠标进入主题按钮
   */
  const handleMouseEnterTheme = useCallback(() => {
    if (theme === 'dark') {
      setIsBrightnessOpen(true)
      setIsBrightnessClosing(false)
      clearBrightnessTimer()
    }
  }, [theme, clearBrightnessTimer])

  /**
   * 鼠标离开主题按钮
   */
  const handleMouseLeaveTheme = useCallback(() => {
    if (theme === 'dark' && isBrightnessOpen && !isBrightnessClosing) {
      setIsHoveringBrightness(false)
      clearBrightnessTimer()
      brightnessTimerRef.current = setTimeout(() => {
        triggerCloseBrightness()
      }, 1000)
    }
  }, [theme, isBrightnessOpen, isBrightnessClosing, clearBrightnessTimer, triggerCloseBrightness])

  /**
   * 鼠标进入其他组件
   */
  const handleMouseEnterOtherWidget = useCallback(() => {
    resetBrightnessState()
  }, [resetBrightnessState])

  return {
    bgBrightness,
    setBgBrightness,
    isBrightnessOpen,
    setIsBrightnessOpen,
    isBrightnessClosing,
    setIsBrightnessClosing,
    isHoveringBrightness,
    setIsHoveringBrightness,
    brightnessTimerRef,
    clearBrightnessTimer,
    resetBrightnessState,
    triggerCloseBrightness,
    handleToggleTheme,
    handleMouseEnterTheme,
    handleMouseLeaveTheme,
    handleMouseEnterOtherWidget,
  }
}
