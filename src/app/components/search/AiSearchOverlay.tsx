/**
 * 文件名: AiSearchOverlay.tsx
 * 功能描述: 聚合 AI 搜索与对比面板
 * 创建时间: 2026-06-09
 */
import { useState, useEffect, useRef } from 'react';
import { 
  X, Sparkles, Copy, RefreshCw, Layers, Layout, ChevronRight, 
  Check
} from 'lucide-react';
import { BaseModal } from '../ui/BaseModal';
import { Tooltip } from '../ui/Tooltip';
import { getKnowledgeAnswer, generateSynthesisAnswer } from './aiSearchLogic';
import { AiSynthesisPanel } from './AiSynthesisPanel';
import { AiSearchFooter } from './AiSearchFooter';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface EngineState {
  name: string;
  themeColor: string;
  themeBorder: string;
  themeBg: string;
  textGlow: string;
  messages: Message[];
  isStreaming: boolean;
  streamedContent: string;
  speed: number; // simulated latency ms
  tokenCount: number;
}

interface AiSearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery: string;
  initialEngine: string; // 'chatgpt' | 'qwen' | 'doubao' | 'ai-aggregator'
}

/**
 * 聚合 AI 搜索与对比面板 - 高保真极速对话原型
 */
export function AiSearchOverlay({ isOpen, onClose, initialQuery, initialEngine }: AiSearchOverlayProps) {
  const [viewMode, setViewMode] = useState<'split' | 'focus'>(initialEngine === 'ai-aggregator' ? 'split' : 'focus');
  const [activeEngine, setActiveEngine] = useState<string>(initialEngine === 'ai-aggregator' ? 'chatgpt' : initialEngine);
  const [inputQuery, setInputQuery] = useState('');
  const [showSynthesis, setShowSynthesis] = useState(true);
  const [synthesisContent, setSynthesisContent] = useState('');
  const [synthesisStreaming, setSynthesisStreaming] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  // 状态模型
  const [engines, setEngines] = useState<{ [key: string]: EngineState }>({
    chatgpt: {
      name: 'ChatGPT',
      themeColor: '#10a37f',
      themeBorder: 'border-emerald-500/30 focus-within:border-emerald-500/60',
      themeBg: 'bg-emerald-500/5',
      textGlow: 'text-emerald-400 drop-shadow-[0_0_10px_rgba(16,163,127,0.3)]',
      messages: [],
      isStreaming: false,
      streamedContent: '',
      speed: 340,
      tokenCount: 0
    },
    qwen: {
      name: '通义千问',
      themeColor: '#6E44FF',
      themeBorder: 'border-purple-500/30 focus-within:border-purple-500/60',
      themeBg: 'bg-purple-500/5',
      textGlow: 'text-purple-400 drop-shadow-[0_0_10px_rgba(110,68,255,0.3)]',
      messages: [],
      isStreaming: false,
      streamedContent: '',
      speed: 180,
      tokenCount: 0
    },
    doubao: {
      name: '豆包 AI',
      themeColor: '#00C9FF',
      themeBorder: 'border-cyan-500/30 focus-within:border-cyan-500/60',
      themeBg: 'bg-cyan-500/5',
      textGlow: 'text-cyan-400 drop-shadow-[0_0_10px_rgba(0,201,255,0.3)]',
      messages: [],
      isStreaming: false,
      streamedContent: '',
      speed: 120,
      tokenCount: 0
    }
  });

  const chatEndRefs: Record<string, React.RefObject<HTMLDivElement>> = {
    chatgpt: useRef<HTMLDivElement>(null),
    qwen: useRef<HTMLDivElement>(null),
    doubao: useRef<HTMLDivElement>(null),
    synthesis: useRef<HTMLDivElement>(null)
  };

  // 关键字匹配的智能知识库模拟器
  
  // 知识库逻辑与总结生成已迁移至 aiSearchLogic.ts
  const triggerAiSearch = (query: string) => {
    if (!query.trim()) return;

    // 清空当前流内容，进入 loading 状态
    setEngines(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(key => {
        updated[key] = {
          ...updated[key],
          isStreaming: true,
          streamedContent: '',
          messages: [
            ...updated[key].messages,
            { role: 'user', content: query, timestamp: new Date().toLocaleTimeString() }
          ]
        };
      });
      return updated;
    });

    setSynthesisStreaming(showSynthesis);
    setSynthesisContent('');

    // 模拟不同 AI 速度的流式生成
    Object.keys(engines).forEach(key => {
      const fullAnswer = getKnowledgeAnswer(query, key);
      let currentIndex = 0;
      const engineSpeed = engines[key].speed;
      const intervalTime = Math.max(10, Math.floor(100 / (5 - engines[key].speed / 100))); // 越快间隔越小

      setTimeout(() => {
        const interval = setInterval(() => {
          setEngines(prev => {
            const currentEngine = prev[key];
            const nextChar = fullAnswer.slice(0, currentIndex + 4); // 一次打4个字符，加快速度
            currentIndex += 4;

            if (currentIndex >= fullAnswer.length) {
              clearInterval(interval);
              return {
                ...prev,
                [key]: {
                  ...currentEngine,
                  isStreaming: false,
                  streamedContent: fullAnswer,
                  tokenCount: Math.floor(fullAnswer.length * 1.3),
                  messages: [
                    ...currentEngine.messages,
                    { role: 'assistant', content: fullAnswer, timestamp: new Date().toLocaleTimeString() }
                  ]
                }
              };
            }

            return {
              ...prev,
              [key]: {
                ...currentEngine,
                streamedContent: nextChar,
                tokenCount: Math.floor(nextChar.length * 1.3)
              }
            };
          });
        }, intervalTime);
      }, Math.random() * 500); // 随机启动延迟
    });

    // 模拟大师总结流式渲染
    if (showSynthesis) {
      const fullSynthesis = generateSynthesisAnswer(query);
      let synthesisIndex = 0;
      setTimeout(() => {
        const synthesisInterval = setInterval(() => {
          setSynthesisContent(prev => {
            const nextChar = fullSynthesis.slice(0, synthesisIndex + 5);
            synthesisIndex += 5;

            if (synthesisIndex >= fullSynthesis.length) {
              clearInterval(synthesisInterval);
              setSynthesisStreaming(false);
              return fullSynthesis;
            }
            return nextChar;
          });
        }, 15);
      }, 800);
    }
  };

  // 页面初始化触发首次搜索
  useEffect(() => {
    if (isOpen && initialQuery) {
      triggerAiSearch(initialQuery);
    }
  }, [isOpen]);

  // 消息滚动触底
  useEffect(() => {
    Object.keys(chatEndRefs).forEach(key => {
      const ref = chatEndRefs[key];
      if (ref.current) {
        ref.current.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }, [
    engines.chatgpt.streamedContent,
    engines.qwen.streamedContent,
    engines.doubao.streamedContent,
    synthesisContent
  ]);

  // 快捷复制
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };



  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      animationType="scale"
      position="center"
      containerClassName="flex flex-col bg-[#08080f]/90 dark:bg-[#030308]/96 text-slate-200 overflow-hidden font-sans backdrop-blur-2xl w-full h-full"
      overlayClassName="bg-transparent"
      zIndex={50}
    >
      
      {/* 头部导航控制栏 */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/10">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wide bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              聚合 AI 智能搜索平台
            </h1>
            <p className="text-xs text-slate-400 font-medium">One Input, Multi-AI Collaboration</p>
          </div>
        </div>

        {/* 顶部视图模式控制器与总结开关 */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full p-1.5 backdrop-blur-xl">
            <Tooltip content="单轨聚焦" side="bottom">
              <button
                onClick={() => setViewMode('focus')}
                className={`flex items-center justify-center w-8 h-8 rounded-full transition-all active:scale-95 ${
                  viewMode === 'focus' 
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/20' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/10'
                }`}
              >
                <Layout className="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip content="并列对比" side="bottom">
              <button
                onClick={() => setViewMode('split')}
                className={`flex items-center justify-center w-8 h-8 rounded-full transition-all active:scale-95 ${
                  viewMode === 'split' 
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/20' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/10'
                }`}
              >
                <Layers className="w-4 h-4" />
              </button>
            </Tooltip>
          </div>

          <Tooltip content={showSynthesis ? '关闭融合提炼' : '开启融合提炼'} side="bottom">
            <button
              onClick={() => setShowSynthesis(!showSynthesis)}
              className={`flex items-center justify-center w-9 h-9 border rounded-full transition-all active:scale-95 ${
                showSynthesis 
                  ? 'bg-purple-500/20 border-purple-500/40 text-purple-300 shadow-md shadow-purple-500/20' 
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/10'
              }`}
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </Tooltip>

          {/* 关闭按钮 */}
          <Tooltip content="关闭" side="bottom">
            <button 
              onClick={onClose}
              className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all active:scale-95"
            >
              <X className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>
      </header>

      {/* 主对话内容渲染区域 */}
      <main className="flex-1 overflow-y-auto px-6 py-6 space-y-6 flex flex-col">
        
        {/* 1. 顶部的智能融合总结面板 (若开启) */}
        {showSynthesis && (initialQuery || synthesisContent) && (
          <AiSynthesisPanel
            synthesisContent={synthesisContent}
            synthesisStreaming={synthesisStreaming}
            copiedIndex={copiedIndex}
            onCopy={handleCopy}
            panelRef={chatEndRefs.synthesis}
          />
        )}

        {/* 2. 主对比渲染面板 */}
        {viewMode === 'split' ? (
          /* 三分栏并列对比视图 */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 items-stretch min-h-[400px]">
            {Object.keys(engines).map(key => {
              const engine = engines[key];
              return (
                <div 
                  key={key} 
                  className={`flex flex-col rounded-3xl border ${engine.themeBorder} bg-slate-950/45 dark:bg-black/55 backdrop-blur-xl overflow-hidden hover:shadow-2xl hover:shadow-slate-950/50 transition-all duration-300`}
                >
                  {/* 分栏头部 */}
                  <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-white/2 backdrop-blur-md">
                    <div className="flex items-center gap-2.5">
                      <img src={`/icons/${key}.svg`} className="w-5 h-5 object-contain" alt="" />
                      <span className="font-bold text-sm tracking-wide text-slate-100">{engine.name}</span>
                      {engine.isStreaming && <span className="w-1.5 h-3.5 bg-current animate-pulse rounded" style={{ color: engine.themeColor }}></span>}
                    </div>

                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] bg-white/5 text-slate-400 px-2 py-0.5 rounded-full font-mono">
                        {engine.speed}ms
                      </span>
                      <span className="text-[10px] bg-white/5 text-slate-400 px-2 py-0.5 rounded-full font-mono">
                        {engine.tokenCount} TK
                      </span>
                      <Tooltip content="复制回答" side="top">
                        <button 
                          onClick={() => handleCopy(engine.streamedContent, key)}
                          className="p-1.5 rounded-full hover:bg-white/5 text-slate-400 hover:text-slate-200 transition-colors active:scale-95"
                        >
                          {copiedIndex === key ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </Tooltip>
                    </div>
                  </div>

                  {/* 分栏消息历史 */}
                  <div className="flex-1 p-5 overflow-y-auto space-y-4 max-h-[500px]">
                    {engine.streamedContent ? (
                      <div className="text-sm leading-relaxed text-slate-300 space-y-3 prose prose-invert">
                        {engine.streamedContent.split('\n').map((line, idx) => {
                          if (line.startsWith('###')) return <h4 key={idx} className={`text-sm font-extrabold ${engine.textGlow} mt-4 first:mt-0`}>{line.replace('###', '').trim()}</h4>;
                          if (line.startsWith('####')) return <h5 key={idx} className="text-xs font-bold text-slate-200 mt-3">{line.replace('####', '').trim()}</h5>;
                          if (line.startsWith('-')) return <li key={idx} className="text-slate-300 ml-4 list-disc">{line.replace('-', '').trim()}</li>;
                          if (line.startsWith('`') || line.includes('```')) {
                            // 极简代码高亮原型
                            if (line.includes('```') && !line.endsWith('```')) return null; // block start ignore
                            if (line.includes('```') && line.endsWith('```')) return null; // block end ignore
                            return <pre key={idx} className="bg-slate-900/80 border border-white/5 p-3 rounded-2xl font-mono text-xs text-slate-300 my-2 overflow-x-auto whitespace-pre">{line.replace(/`/g, '')}</pre>;
                          }
                          return <p key={idx} className="text-slate-300 text-xs">{line}</p>;
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full py-20 text-slate-500 text-xs gap-3">
                        <RefreshCw className="w-5 h-5 animate-spin text-slate-600" />
                        等待检索与解答中...
                      </div>
                    )}
                    <div ref={chatEndRefs[key]} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* 单轨聚焦模式视图 */
          <div className="flex-1 flex max-w-4xl mx-auto w-full gap-6 items-stretch min-h-[400px]">
            
            {/* 左侧引擎快速切换侧边栏 */}
            <div className="w-52 bg-white/3 border border-white/5 rounded-3xl p-3 flex flex-col gap-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 py-1.5">选择AI引擎</span>
              {Object.keys(engines).map(key => {
                const engine = engines[key];
                return (
                  <button
                    key={key}
                    onClick={() => setActiveEngine(key)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                      activeEngine === key 
                        ? 'bg-white/10 text-white border border-white/10 shadow-lg' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <img src={`/icons/${key}.svg`} className="w-4 h-4 object-contain" alt="" />
                      <span>{engine.name}</span>
                    </div>
                    {activeEngine === key && <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />}
                  </button>
                );
              })}
            </div>

            {/* 右侧主对话详情 */}
            <div className="flex-1 flex flex-col rounded-3xl border border-white/5 bg-slate-950/45 dark:bg-black/55 backdrop-blur-xl overflow-hidden shadow-2xl">
              
              {/* 对话卡头部 */}
              <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/2 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                    <img src={`/icons/${activeEngine}.svg`} className="w-4 h-4 object-contain" alt="" />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-slate-100">{engines[activeEngine].name}</span>
                    <span className="text-[10px] text-slate-400 ml-3 font-mono">
                      LATENCY: {engines[activeEngine].speed}ms | TOKENS: {engines[activeEngine].tokenCount}
                    </span>
                  </div>
                </div>

                <Tooltip content="复制原文" side="top">
                  <button 
                    onClick={() => handleCopy(engines[activeEngine].streamedContent, activeEngine)}
                    className="flex items-center justify-center w-8 h-8 text-slate-400 hover:text-slate-200 bg-white/5 hover:bg-white/10 rounded-full border border-white/5 transition-all active:scale-95"
                  >
                    {copiedIndex === activeEngine ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </Tooltip>
              </div>

              {/* 对话流区域 */}
              <div className="flex-1 p-6 overflow-y-auto space-y-6 max-h-[500px]">
                {engines[activeEngine].streamedContent ? (
                  <div className="text-sm leading-relaxed text-slate-200 space-y-4 prose prose-invert">
                    {engines[activeEngine].streamedContent.split('\n').map((line, idx) => {
                      if (line.startsWith('###')) return <h4 key={idx} className={`text-base font-extrabold ${engines[activeEngine].textGlow} mt-6 first:mt-0`}>{line.replace('###', '').trim()}</h4>;
                      if (line.startsWith('####')) return <h5 key={idx} className="text-sm font-bold text-slate-100 mt-4">{line.replace('####', '').trim()}</h5>;
                      if (line.startsWith('-')) return <li key={idx} className="text-slate-300 ml-5 list-disc">{line.replace('-', '').trim()}</li>;
                      if (line.startsWith('`') || line.includes('```')) {
                        if (line.includes('```') && !line.endsWith('```')) return null;
                        if (line.includes('```') && line.endsWith('```')) return null;
                        return <pre key={idx} className="bg-slate-900/80 border border-white/5 p-4 rounded-2xl font-mono text-xs text-slate-300 my-3 overflow-x-auto whitespace-pre">{line.replace(/`/g, '')}</pre>;
                      }
                      return <p key={idx} className="text-slate-300 text-sm leading-relaxed">{line}</p>;
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-28 text-slate-500 text-sm gap-3">
                    <RefreshCw className="w-6 h-6 animate-spin text-slate-600" />
                    等待回答生成中...
                  </div>
                )}
                <div ref={chatEndRefs[activeEngine]} />
              </div>
            </div>

          </div>
        )}
      </main>

      {/* 底部多轮追加对话输入控制 */}
      <AiSearchFooter 
        inputQuery={inputQuery} 
        setInputQuery={setInputQuery} 
        triggerAiSearch={triggerAiSearch} 
      />

    </BaseModal>
  );
}
