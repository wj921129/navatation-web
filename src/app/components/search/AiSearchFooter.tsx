/**
 * 文件名: AiSearchFooter.tsx
 * 功能描述: 聚合 AI 搜索底部输入控制面板
 * 创建时间: 2026-06-09
 */
import { Send } from 'lucide-react'

export interface AiSearchFooterProps {
  inputQuery: string
  setInputQuery: (query: string) => void
  triggerAiSearch: (query: string) => void
}

/**
 * 聚合 AI 搜索底部输入控制面板
 * @param props 参数
 */
export function AiSearchFooter({
  inputQuery,
  setInputQuery,
  triggerAiSearch,
}: AiSearchFooterProps) {
  return (
    <footer className="px-6 py-5 border-t border-white/5 bg-white/2 backdrop-blur-md flex items-center justify-center">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (inputQuery.trim()) {
            triggerAiSearch(inputQuery)
            setInputQuery('')
          }
        }}
        className="max-w-4xl w-full flex items-center gap-3 relative"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={`向这三款 AI 追加提问... (输入 "算法"、"毛玻璃" 可触发特别高保真回答)`}
            className="w-full bg-slate-950/80 border border-white/10 rounded-full py-3.5 pl-5 pr-14 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500/50 transition-all shadow-inner"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim()}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white disabled:opacity-40 transition-opacity active:scale-95 shadow-md shadow-purple-500/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </footer>
  )
}
