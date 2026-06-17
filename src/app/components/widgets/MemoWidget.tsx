import { AnimatePresence, motion } from 'framer-motion'
import { Palette, X } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

interface MemoWidgetProps {
  id: string
  x: number
  y: number
  meta?: Record<string, any>
  isEditMode: boolean
  onStartDrag: (id: string, type: string, offsetX: number, offsetY: number) => void
  onDelete: (id: string) => void
  updateWidgetMeta: (id: string, updater: (prev: any) => any) => void
  isDragging?: boolean
}

type ColorType = 'yellow' | 'pink' | 'green' | 'blue' | 'purple'

const COLORS = {
  yellow: {
    bg: 'bg-yellow-100/80 dark:bg-yellow-950/40 backdrop-blur-md',
    border: 'border-yellow-300/40 dark:border-yellow-900/30',
    text: 'text-yellow-900 dark:text-yellow-100',
    dots: 'bg-yellow-400 dark:bg-yellow-500',
    activeRing: 'focus-visible:ring-yellow-400',
  },
  pink: {
    bg: 'bg-pink-100/80 dark:bg-pink-950/40 backdrop-blur-md',
    border: 'border-pink-300/40 dark:border-pink-900/30',
    text: 'text-pink-900 dark:text-pink-100',
    dots: 'bg-pink-400 dark:bg-pink-500',
    activeRing: 'focus-visible:ring-pink-400',
  },
  green: {
    bg: 'bg-emerald-100/80 dark:bg-emerald-950/40 backdrop-blur-md',
    border: 'border-emerald-300/40 dark:border-emerald-900/30',
    text: 'text-emerald-900 dark:text-emerald-100',
    dots: 'bg-emerald-400 dark:bg-emerald-500',
    activeRing: 'focus-visible:ring-emerald-400',
  },
  blue: {
    bg: 'bg-sky-100/80 dark:bg-sky-950/40 backdrop-blur-md',
    border: 'border-sky-300/40 dark:border-sky-900/30',
    text: 'text-sky-800 dark:text-sky-100',
    dots: 'bg-sky-400 dark:bg-sky-500',
    activeRing: 'focus-visible:ring-sky-400',
  },
  purple: {
    bg: 'bg-purple-100/80 dark:bg-purple-950/40 backdrop-blur-md',
    border: 'border-purple-300/40 dark:border-purple-900/30',
    text: 'text-purple-900 dark:text-purple-100',
    dots: 'bg-purple-400 dark:bg-purple-500',
    activeRing: 'focus-visible:ring-purple-400',
  },
}

export default function MemoWidget({
  id,
  x,
  y,
  meta,
  isEditMode,
  onStartDrag,
  onDelete,
  updateWidgetMeta,
  isDragging = false,
}: MemoWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isClosing, setIsClosing] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [showPalette, setShowPalette] = useState(false)

  // 从元数据中解构便签文本和背景配色，给定默认值
  const text = meta?.text ?? ''
  const colorKey: ColorType = (meta?.color as ColorType) ?? 'yellow'
  const currentStyle = COLORS[colorKey] || COLORS.yellow

  const [localText, setLocalText] = useState(text)

  // 监听外部数据变化更新本地临时编辑状态
  useEffect(() => {
    setLocalText(text)
  }, [text])

  // 进入编辑状态时自动聚焦
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus()
      // 将光标移至文本末尾
      const length = textareaRef.current.value.length
      textareaRef.current.setSelectionRange(length, length)
    }
  }, [isEditing])

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isEditMode) {
      return
    }
    const target = e.target as HTMLElement
    if (target.closest('.no-drag')) {
      return
    }

    e.preventDefault()
    const container = containerRef.current
    if (!container) {
      return
    }

    const rect = container.getBoundingClientRect()
    const offsetX = e.clientX - rect.left
    const offsetY = e.clientY - rect.top

    onStartDrag(id, 'memo', offsetX, offsetY)
  }

  const saveMemoData = (updatedText: string, updatedColor: ColorType = colorKey) => {
    updateWidgetMeta(id, (prev) => ({
      ...prev,
      text: updatedText,
      color: updatedColor,
    }))
  }

  const handleBlur = () => {
    setIsEditing(false)
    saveMemoData(localText)
  }

  const handleColorChange = (newColor: ColorType) => {
    saveMemoData(localText, newColor)
    setShowPalette(false)
  }

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      className={`absolute select-none z-20 group touch-none isolate ${isDragging ? '!transition-none' : 'transition-all duration-300 ease-in-out'} ${
        isClosing ? 'scale-50 opacity-0' : 'scale-100 opacity-100'
      } ${isEditMode ? 'cursor-pointer' : ''}`}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        isolation: 'isolate',
        willChange: isDragging ? 'transform' : 'auto',
        transform: isDragging ? 'translate3d(0, 0, 0)' : 'none',
        backfaceVisibility: isDragging ? 'hidden' : 'visible',
      }}
    >
      {/* 编辑模式下的虚线边框 */}
      {isEditMode && (
        <div className="absolute -inset-1.5 border-2 border-dashed border-blue-500/60 group-hover:border-blue-500 group-hover:bg-blue-500/5 rounded-3xl transition-all duration-150 pointer-events-none z-10" />
      )}

      {/* 删除按钮 */}
      {isEditMode && (
        <button
          onClick={() => {
            setIsClosing(true)
            setTimeout(() => onDelete(id), 300)
          }}
          className="no-drag absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg flex items-center justify-center cursor-pointer scale-0 group-hover:scale-100 transition-all duration-200 z-30"
          aria-label="删除便签组件"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}

      {/* 便签主卡片 */}
      <div
        onDoubleClick={() => {
          if (!isEditMode) {
            setIsEditing(true)
          }
        }}
        onClick={(e) => {
          // 在非编辑模式下，如果点击的是卡片空白区且不是调色盘，也可以单击直接编辑
          if (!isEditMode && !isEditing) {
            const target = e.target as HTMLElement
            if (!target.closest('.no-drag')) {
              setIsEditing(true)
            }
          }
        }}
        className={`w-[180px] h-[180px] rounded-3xl p-4 flex flex-col justify-between border shadow-sm transition-all duration-300 ease-out hover:shadow-md ${
          currentStyle.bg
        } ${currentStyle.border} ${isDragging ? 'shadow-lg rotate-1 scale-102' : ''}`}
      >
        {/* 内容输入与显示区 */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {isEditing ? (
            <textarea
              ref={textareaRef}
              value={localText}
              onChange={(e) => setLocalText(e.target.value)}
              onBlur={handleBlur}
              placeholder="记录想法..."
              className={`w-full h-full resize-none bg-transparent outline-none border-none p-0 text-sm leading-relaxed font-sans no-drag placeholder-black/30 dark:placeholder-white/30 ${currentStyle.text}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault()
                  handleBlur()
                }
              }}
            />
          ) : (
            <div
              className={`w-full h-full text-sm leading-relaxed font-sans overflow-y-auto whitespace-pre-wrap select-text cursor-text ${
                currentStyle.text
              } ${!localText ? 'text-black/30 dark:text-white/30 italic' : ''}`}
            >
              {localText || '双击编辑便签...'}
            </div>
          )}
        </div>

        {/* 底部操作区 (调色盘) */}
        <div className="flex justify-between items-center mt-2 relative min-h-6">
          <span className="text-[10px] text-black/20 dark:text-white/20 select-none">Memo</span>

          {!isEditing && !isEditMode && (
            <div className="no-drag flex items-center relative z-20">
              <button
                onClick={() => setShowPalette((prev) => !prev)}
                className="p-1 rounded-full text-black/30 hover:text-black/60 dark:text-white/30 dark:hover:text-white/60 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                title="切换配色"
              >
                <Palette className="w-3.5 h-3.5" />
              </button>

              <AnimatePresence>
                {showPalette && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, x: 10 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.8, x: 10 }}
                    className="absolute right-7 bottom-0 bg-white/95 dark:bg-black/90 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 rounded-full px-2.5 py-1.5 flex gap-1.5 shadow-lg items-center"
                  >
                    {(Object.keys(COLORS) as ColorType[]).map((c) => (
                      <button
                        key={c}
                        onClick={() => handleColorChange(c)}
                        className={`w-3.5 h-3.5 rounded-full border border-black/10 dark:border-white/10 cursor-pointer hover:scale-120 active:scale-90 transition-transform ${COLORS[c].dots}`}
                        title={c}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
