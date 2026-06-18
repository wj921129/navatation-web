/**
 * @description 搜索引擎选择器组件
 * @date 2026-06-09
 */
import { Check } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Tooltip } from '../ui/Tooltip'

interface SearchEngine {
  name: string
  value: string
  url: string
  icon: string
}

const searchEngines: SearchEngine[] = [
  {
    name: '谷歌',
    value: 'google',
    url: 'https://www.google.com/search?q=',
    icon: '/icons/google.svg',
  },
  {
    name: '百度',
    value: 'baidu',
    url: 'https://www.baidu.com/s?wd=',
    icon: '/icons/baidu.svg',
  },
  {
    name: '必应',
    value: 'bing',
    url: 'https://www.bing.com/search?q=',
    icon: '/icons/bing.svg',
  },
  {
    name: 'ChatGPT',
    value: 'chatgpt',
    url: 'ai://chatgpt',
    icon: '/icons/chatgpt.svg',
  },
  {
    name: '通义千问',
    value: 'qwen',
    url: 'ai://qwen',
    icon: '/icons/qwen.svg',
  },
  {
    name: '豆包',
    value: 'doubao',
    url: 'ai://doubao',
    icon: '/icons/doubao.svg',
  },
  {
    name: 'AI 聚合搜索',
    value: 'ai-aggregator',
    url: 'ai://aggregator',
    icon: '/icons/ai-aggregator.svg',
  },
]

interface SearchEngineSelectProps {
  value: string
  onChange: (value: string) => void
}

/**
 * SearchEngineSelect 组件/功能描述
 */
export function SearchEngineSelect({ value, onChange }: SearchEngineSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const currentEngine = searchEngines.find((e) => e.value === value) ?? searchEngines[0]

  useEffect(() => {
    /**
     * 处理点击外部区域关闭下拉框
     */
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className="relative" ref={dropdownRef}>
      <Tooltip content="切换搜索引擎" side="top">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-input-bg theme-transition active:scale-95 shadow-sm"
        >
          <img
            src={currentEngine.icon}
            alt={currentEngine.name}
            className="w-5 h-5 object-contain"
          />
        </button>
      </Tooltip>

      {isOpen && (
        <div className="absolute top-full mt-2 left-0 bg-widget-bg border border-widget-border backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden z-20 min-w-[140px]">
          {searchEngines.map((engine) => (
            <button
              key={engine.value}
              type="button"
              onClick={() => {
                onChange(engine.value)
                setIsOpen(false)
              }}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-input-bg text-text-primary theme-transition text-left"
            >
              <div className="flex items-center gap-3">
                <img src={engine.icon} alt={engine.name} className="w-5 h-5 object-contain" />
                <span className="text-text-primary text-sm">{engine.name}</span>
              </div>
              {engine.value === value && (
                <Check className="w-4 h-4 text-blue-500 dark:text-blue-400" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export { searchEngines }
