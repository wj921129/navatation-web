/**
 * @description 搜索框组件
 * @date 2026-06-09
 */
import { Search } from 'lucide-react'
import { useState } from 'react'
import { Tooltip } from '../ui/Tooltip'
import { SearchEngineSelect, searchEngines } from './SearchEngineSelect'

interface SearchBoxProps {
  searchEngine: string
  onSearchEngineChange: (engine: string) => void
  onAiSearch?: (query: string, engine: string) => void
  settings: {
    searchBoxWidth: number
    searchBoxHeight: number
    iconsMarginTop: number
  }
}

/**
 * 隔离搜索输入框状态的局部组件，防止打字输入时导致整个 App 巨型组件频繁重渲染。
 */
export function SearchBox({
  searchEngine,
  onSearchEngineChange,
  onAiSearch,
  settings,
}: SearchBoxProps) {
  const [query, setQuery] = useState('')

  /**
   * 处理搜索提交事件
   */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedQuery = query.trim()
    if (!trimmedQuery) {
      return
    }

    const engine = searchEngines.find((ev) => ev.value === searchEngine)
    if (!engine) {
      return
    }

    if (engine.url.startsWith('ai://')) {
      onAiSearch?.(trimmedQuery, engine.value)
    } else {
      window.open(`${engine.url}${encodeURIComponent(trimmedQuery)}`, '_blank')
    }
  }

  return (
    <form onSubmit={handleSearch} style={{ marginBottom: `${settings.iconsMarginTop}px` }}>
      <div
        className="relative mx-auto flex items-center"
        style={{ width: `${settings.searchBoxWidth}%` }}
      >
        <div className="relative w-full">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
            <SearchEngineSelect value={searchEngine} onChange={onSearchEngineChange} />
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索或输入网址..."
            className="w-full px-16 rounded-full bg-widget-bg backdrop-blur-xl border border-widget-border text-text-primary placeholder-text-placeholder text-lg outline-none focus:bg-widget-bg/90 focus:border-blue-500/50 transition-all shadow-md"
            style={{ height: `${settings.searchBoxHeight}px` }}
          />

          <Tooltip content="立即搜索" side="top">
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full text-text-secondary hover:text-text-primary hover:bg-input-bg transition-all active:scale-95"
            >
              <Search className="w-5 h-5 text-current" />
            </button>
          </Tooltip>
        </div>
      </div>
    </form>
  )
}
