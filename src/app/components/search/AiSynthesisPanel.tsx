/**
 * 文件名: AiSynthesisPanel.tsx
 * 功能描述: 聚合 AI 搜索的大师综合提炼面板组件
 * 创建时间: 2026-06-09
 */

import { Check, Copy, RefreshCw, Sparkles } from 'lucide-react'
import type { RefObject } from 'react'
import { Tooltip } from '../ui/Tooltip'

export interface AiSynthesisPanelProps {
  synthesisContent: string
  synthesisStreaming: boolean
  copiedIndex: string | null
  onCopy: (content: string, id: string) => void
  panelRef: RefObject<HTMLDivElement>
}

/**
 * 聚合 AI 搜索的大师综合提炼面板组件
 * @param props 面板参数
 */
export function AiSynthesisPanel({
  synthesisContent,
  synthesisStreaming,
  copiedIndex,
  onCopy,
  panelRef,
}: AiSynthesisPanelProps) {
  return (
    <div className="w-full bg-gradient-to-r from-indigo-950/20 via-purple-950/20 to-pink-950/20 border border-purple-500/20 rounded-3xl p-6 relative overflow-hidden backdrop-blur-xl group hover:border-purple-500/40 transition-all shadow-2xl">
      <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="flex items-center justify-between border-b border-purple-500/10 pb-4 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <Sparkles
              className="w-4 h-4 text-purple-400 animate-spin"
              style={{ animationDuration: '6s' }}
            />
          </div>
          <h3 className="font-bold text-purple-300 tracking-wide text-sm flex items-center gap-2">
            智能大师综合提炼
            {synthesisStreaming && (
              <span className="w-1.5 h-4 bg-purple-400 inline-block animate-pulse rounded-full"></span>
            )}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip content="复制大师总结" side="top">
            <button
              onClick={() => onCopy(synthesisContent, 'synthesis')}
              className="p-2 rounded-full hover:bg-white/5 text-slate-400 hover:text-slate-200 transition-colors active:scale-95"
            >
              {copiedIndex === 'synthesis' ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </Tooltip>
        </div>
      </div>

      <div className="text-slate-200 text-sm leading-relaxed prose prose-invert max-w-none space-y-4">
        {synthesisContent ? (
          synthesisContent.split('\n').map((line, idx) => {
            if (line.startsWith('###'))
              return (
                <h4 key={idx} className="text-base font-bold text-white mt-4 first:mt-0">
                  {line.replace('###', '').trim()}
                </h4>
              )
            if (line.startsWith('>'))
              return (
                <blockquote
                  key={idx}
                  className="border-l-2 border-purple-500/40 pl-4 py-1 my-2 bg-purple-500/5 text-purple-200/90 rounded-r"
                >
                  {line.replace('>', '').trim()}
                </blockquote>
              )
            if (line.startsWith('1.') || line.startsWith('2.') || line.startsWith('3.'))
              return (
                <p key={idx} className="pl-4 -indent-4 text-slate-300">
                  <span className="text-purple-400 font-semibold">{line.slice(0, 2)}</span>
                  {line.slice(2)}
                </p>
              )
            return (
              <p key={idx} className="text-slate-300">
                {line}
              </p>
            )
          })
        ) : (
          <div className="flex items-center gap-3 py-6 justify-center text-slate-400 text-sm">
            <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
            大模型正在融合各大平台共识，请稍候...
          </div>
        )}
      </div>
      <div ref={panelRef} />
    </div>
  )
}
