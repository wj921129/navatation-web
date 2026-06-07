import { useState, useEffect, useRef } from 'react';
import { 
  X, Sparkles, Send, Copy, RefreshCw, Layers, Layout, ChevronRight, 
  Check, Play, MessageSquare, ArrowRight, Zap, CheckCircle2, ShieldAlert
} from 'lucide-react';

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

  const chatEndRefs = {
    chatgpt: useRef<HTMLDivElement>(null),
    qwen: useRef<HTMLDivElement>(null),
    doubao: useRef<HTMLDivElement>(null),
    synthesis: useRef<HTMLDivElement>(null)
  };

  // 关键字匹配的智能知识库模拟器
  const getKnowledgeAnswer = (query: string, engine: string): string => {
    const q = query.toLowerCase();
    
    // 话题1: 前端/毛玻璃/css/tailwind/react/glassmorphism
    if (q.includes('react') || q.includes('tailwind') || q.includes('css') || q.includes('毛玻璃') || q.includes('glassmorphism') || q.includes('风格')) {
      if (engine === 'chatgpt') {
        return `### 🌟 Glassmorphism (毛玻璃风格) 实现方案\n\n要在 React 和 Tailwind CSS 中实现极致高级的毛玻璃视觉效果，核心在于结合使用 \`backdrop-blur\`、高透半透明背景色以及微弱的白色内边框（模拟玻璃边缘的折射光泽）。\n\n#### 1. 核心 Tailwind 样式代码：\n\`\`\`html\n<div className="bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-2xl p-6 shadow-xl">\n  <h3 className="text-white font-semibold">ChatGPT Premium Card</h3>\n  <p className="text-white/70 text-sm mt-2">极其平滑的磨砂质感。</p>\n</div>\n\`\`\`\n\n#### 2. 设计规范建议：\n- **背底对比度**：毛玻璃下方必须有色彩丰富的渐变背景（例如深色霓虹圈），否则模糊效果不明显。\n- **阴影加持**：使用 \`shadow-2xl\` 并带有低饱和度的投影色，增强卡片的悬浮悬空感。`;
      }
      if (engine === 'qwen') {
        return `### 🚀 通义千问：现代前端毛玻璃最佳实践\n\n毛玻璃风格（Glassmorphism）非常适合用于高档新标签页及仪表盘设计。以下是基于标准 CSS 与 Tailwind 4 的落地方案：\n\n#### 🛠️ 属性拆解：\n1. **模糊滤镜**: \`backdrop-filter: blur(12px);\` (硬件加速，由浏览器渲染引擎优化)\n2. **透光层**: \`background: rgba(255, 255, 255, 0.08);\`\n3. **光泽边框**: \`border: 1px solid rgba(255, 255, 255, 0.15);\`\n\n\`\`\`css\n/* 纯 CSS 极致版 */\n.glass-effect {\n  background: rgba(15, 15, 25, 0.6);\n  backdrop-filter: blur(20px) saturate(180%);\n  border: 1px solid rgba(255, 255, 255, 0.08);\n  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);\n}\n\`\`\`\n\n#### ⚠️ 性能避坑：\n- 在老旧设备上频繁触发 \`backdrop-filter\` 会导致重绘掉帧。建议添加 \`will-change: transform\` 或在容器上加入 \`transform-gpu\` 以强制启用 GPU 渲染。`;
      }
      return `### 🍬 豆包AI：超简单的毛玻璃小卡片！\n\n嗨！要做一个好看的毛玻璃效果非常简单哦，我们只需要在容器上套上几层好看的 Tailwind 样式即可：\n\n- ✨ **背景模糊**：用 \`backdrop-blur-lg\` 或 \`backdrop-blur-xl\`。\n- 🎨 **自适应暗色**：白天用 \`bg-white/40\`，夜间用 \`bg-neutral-900/40\`。\n- 📐 **微光边框**：添加 \`border border-white/20\` 就像真的有阳光照在玻璃边缘一样！\n\n**你可以直接复制下面这个组件代码去用哦：**\n\`\`\`jsx\nexport default function GlassCard() {\n  return (\n    <div className="p-6 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 shadow-lg text-slate-100">\n      <span className="text-xs bg-cyan-400/20 text-cyan-300 px-2.5 py-1 rounded-full font-bold">豆包推荐</span>\n      <p className="mt-4 text-sm font-medium">这是一个充满了呼吸感和轻量化设计的毛玻璃卡片！</p>\n    </div>\n  );\n}\n\`\`\``;
    }

    // 话题2: 算法/排序/代码/algorithm
    if (q.includes('算法') || q.includes('排序') || q.includes('代码') || q.includes('编程') || q.includes('写一个') || q.includes('斐波')) {
      if (engine === 'chatgpt') {
        return `### 💻 斐波那契数列 (Fibonacci) 的优雅实现\n\n针对斐波那契数列，在实际生产环境中，有以下三种主要实现路径：\n\n#### 1. 递归 + 记忆化搜索 (Memoization) - $O(N)$ 时间复杂度\n\`\`\`typescript\nconst memo = new Map<number, number>();\nfunction fib(n: number): number {\n  if (n <= 1) return n;\n  if (memo.has(n)) return memo.get(n)!;\n  const res = fib(n - 1) + fib(n - 2);\n  memo.set(n, res);\n  return res;\n}\n\`\`\`\n\n#### 2. 动态规划迭代 (Space Optimized) - $O(N)$ 时间，$O(1)$ 空间\n\`\`\`typescript\nfunction fibDP(n: number): number {\n  if (n <= 1) return n;\n  let prev2 = 0, prev1 = 1, curr = 0;\n  for (let i = 2; i <= n; i++) {\n    curr = prev1 + prev2;\n    prev2 = prev1;\n    prev1 = curr;\n  }\n  return curr;\n}\n\`\`\``;
      }
      if (engine === 'qwen') {
        return `### 🚀 通义千问：经典算法设计详解\n\n关于斐波那契数列或常用动态规划算法，除了基础的迭代外，数学上存在**矩阵快速幂**方案，可实现极限的 **$O(\\log N)$** 时间复杂度，极度适合超大数据的计算：\n\n\`\`\`typescript\n// 矩阵相乘辅助函数\nfunction multiply(A: number[][], B: number[][]): number[][] {\n  return [\n    [A[0][0]*B[0][0] + A[0][1]*B[1][0], A[0][0]*B[0][1] + A[0][1]*B[1][1]],\n    [A[1][0]*B[0][0] + A[1][1]*B[1][0], A[1][0]*B[0][1] + A[1][1]*B[1][1]]\n  ];\n}\n\n// 矩阵快速幂\nfunction power(A: number[][], n: number): number[][] {\n  let res = [[1, 0], [0, 1]];\n  let base = A;\n  while (n > 0) {\n    if (n & 1) res = multiply(res, base);\n    base = multiply(base, base);\n    n >>= 1;\n  }\n  return res;\n}\n\`\`\``;
      }
      return `### 🍬 豆包AI：用大白话带你搞懂斐波那契！\n\n斐波那契数列（兔子数列）就像爬楼梯，每次的数字都是前面两个数字加起来：\n\`0, 1, 1, 2, 3, 5, 8, 13, 21...\`\n\n最通俗易懂的用 JavaScript 写法就是用一个简单的数组往里装数字：\n\`\`\`javascript\nfunction getFibArray(n) {\n  let fib = [0, 1];\n  for (let i = 2; i < n; i++) {\n    fib[i] = fib[i - 1] + fib[i - 2];\n  }\n  return fib;\n}\nconsole.log(getFibArray(10)); // 输出前10个数字\n\`\`\`\n**豆包贴心提示**：如果输入很大的数字（比如 100），递归写法会导致网页卡死，所以一定要用我这个循环或者记忆化写法哦！`;
    }

    // 默认兜底回答
    if (engine === 'chatgpt') {
      return `### 🌐 ChatGPT 分析视角：针对 "${query}" 的多维深度剖析\n\n对于您提出的核心议题 **"${query}"**，我从以下三个战略维度为您提供框架性梳理：\n\n#### 一、 背景与核心定义\n- **本质特征**：该问题体现了复杂系统的信息关联度，涉及到数据同步和效率的权衡。\n- **核心痛点**：传统模式下的高延迟、多页面分散和多轮对话状态不一致。\n\n#### 二、 解决方案与实践策略\n1. **统一聚合**：通过单路多发（Parallel Fan-out）降低网络探查开销。\n2. **智能编排**：利用轻量模型抽取汇总，生成单一黄金答案。\n3. **状态接力**：支持模型间的历史记忆无缝迁移。\n\n#### 三、 演进趋势与长期展望\n未来这类应用将全面演变为本地异构 Agent 联邦，基于上下文自动路由至最契合的单体模型。`;
    }
    if (engine === 'qwen') {
      return `### 🚀 通义千问：关于 "${query}" 的落地应用指南\n\n针对问题 **"${query}"**，从技术路线和实践落地来看，我们主要关注以下三个执行层面：\n\n#### 🎯 1. 痛点定位与现状\n在当前的大模型生态中，用户对同一问题往往需要多方印证。单一模型由于语料侧重不同，可能存在逻辑盲区。\n\n#### 🛠️ 2. 技术路线与实施方案\n- **并发处理**：后端引入异步高并发框架（如 Spring WebFlux 或 Node.js Workers）。\n- **数据清洗**：对不同模型输出的 Markdown 语法进行差异化对齐，防止排版崩塌。\n- **缓存加速**：对于高频重合问题，使用 Redis 缓存 5 分钟，降低 API 调用资费。\n\n#### 📈 3. 效益评估\n该方案能够为研发与文字从业者缩短 70% 的信息检索与整理时间，极富商业化推广价值。`;
    }
    return `### 🍬 豆包AI：来聊聊关于 "${query}" 的心里话！\n\n哇！你提的这个问题 **"${query}"** 真的非常有趣，而且也是大家最近很关心的话题呢！豆包给你整理了几个超级好用的小贴士：\n\n* 💡 **划重点**：保持简单是第一原则。聚合搜索最棒的地方在于它帮我们节省了“复制、打开网页、粘贴、回车”这套繁琐的套路。\n* 🌟 **妙招分享**：每次看聚合回答时，可以先扫一遍“大师总结”，快速抓住重点，然后如果有写代码或者写文案的深度需求，再去仔细比对 ChatGPT 和通义千问的原答案，效率加倍！\n* 🤝 **暖心提醒**：不管使用哪个 AI，在问涉及核心代码或者机密数据时，记得把敏感字符擦除掉哦！安全第一！\n\n你觉得这个回答对你有启发吗？有任何想深入探讨的，在下面继续告诉我，我随时在哦！`;
  }

  // 大师总结模拟器
  const generateSynthesisAnswer = (query: string): string => {
    return `### 🧠 聚合 AI 大师综合提炼报告 (Master Synthesis)\n\n> **核心问题**：*${query}*\n> **综合提炼算法**：基于 ChatGPT (深度框架)、通义千问 (技术落地) 及 豆包 (实践贴士) 的融合结果。\n\n---\n\n#### 📌 提炼要点与黄金共识\n1. **痛点攻克**：三方一致确认，传统“多网页频繁切换”是当前 AI 对话的重大体验瓶颈，**“单框多发、一屏对比”**是最佳破局手段。\n2. **实现技术**：前端必须采用 **毛玻璃 (Glassmorphism)** 的自适应配色体系以维持视觉的 premium 高级感；后端配合 **异步流式推送 (SSE)** 可有效平抑高并发调用延时。\n3. **开发建议**：应同时保留“单模极简”和“并列对比”两种视图，通过全局状态（如 Zustand）同步记忆，支持一键追加多轮对话。\n\n---\n\n> 📊 **性能概览**：平均响应 182ms | 总消耗 1,420 Tokens | 信息丰富度 98%`;
  }

  // 执行搜索流
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#08080f]/90 dark:bg-[#030308]/96 text-slate-200 overflow-hidden font-sans backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-200">
      
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
            <button
              onClick={() => setViewMode('focus')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                viewMode === 'focus' 
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layout className="w-3.5 h-3.5" />
              单轨聚焦
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                viewMode === 'split' 
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              并列对比
            </button>
          </div>

          <button
            onClick={() => setShowSynthesis(!showSynthesis)}
            className={`flex items-center gap-1.5 px-4 py-2 border rounded-full text-xs font-semibold transition-all ${
              showSynthesis 
                ? 'bg-purple-500/20 border-purple-500/40 text-purple-300' 
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            融合提炼: {showSynthesis ? '开启' : '关闭'}
          </button>

          {/* 关闭按钮 */}
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* 主对话内容渲染区域 */}
      <main className="flex-1 overflow-y-auto px-6 py-6 space-y-6 flex flex-col">
        
        {/* 1. 顶部的智能融合总结面板 (若开启) */}
        {showSynthesis && (initialQuery || synthesisContent) && (
          <div className="w-full bg-gradient-to-r from-indigo-950/20 via-purple-950/20 to-pink-950/20 border border-purple-500/20 rounded-3xl p-6 relative overflow-hidden backdrop-blur-xl group hover:border-purple-500/40 transition-all shadow-2xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none"></div>
            
            <div className="flex items-center justify-between border-b border-purple-500/10 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-purple-400 animate-spin" style={{ animationDuration: '6s' }} />
                </div>
                <h3 className="font-bold text-purple-300 tracking-wide text-sm flex items-center gap-2">
                  智能大师综合提炼
                  {synthesisStreaming && <span className="w-1.5 h-4 bg-purple-400 inline-block animate-pulse rounded-full"></span>}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleCopy(synthesisContent, 'synthesis')}
                  className="p-2 rounded-full hover:bg-white/5 text-slate-400 hover:text-slate-200 transition-colors"
                  title="复制大师总结"
                >
                  {copiedIndex === 'synthesis' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="text-slate-200 text-sm leading-relaxed prose prose-invert max-w-none space-y-4">
              {synthesisContent ? (
                synthesisContent.split('\n').map((line, idx) => {
                  if (line.startsWith('###')) return <h4 key={idx} className="text-base font-bold text-white mt-4 first:mt-0">{line.replace('###', '').trim()}</h4>;
                  if (line.startsWith('>')) return <blockquote key={idx} className="border-l-2 border-purple-500/40 pl-4 py-1 my-2 bg-purple-500/5 text-purple-200/90 rounded-r">{line.replace('>', '').trim()}</blockquote>;
                  if (line.startsWith('1.') || line.startsWith('2.') || line.startsWith('3.')) return <p key={idx} className="pl-4 -indent-4 text-slate-300"><span className="text-purple-400 font-semibold">{line.slice(0, 2)}</span>{line.slice(2)}</p>;
                  return <p key={idx} className="text-slate-300">{line}</p>;
                })
              ) : (
                <div className="flex items-center gap-3 py-6 justify-center text-slate-400 text-sm">
                  <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
                  大模型正在融合各大平台共识，请稍候...
                </div>
              )}
            </div>
            <div ref={chatEndRefs.synthesis} />
          </div>
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
                      <button 
                        onClick={() => handleCopy(engine.streamedContent, key)}
                        className="p-1.5 rounded-full hover:bg-white/5 text-slate-400 hover:text-slate-200 transition-colors"
                        title="复制回答"
                      >
                        {copiedIndex === key ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
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

                <button 
                  onClick={() => handleCopy(engines[activeEngine].streamedContent, activeEngine)}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full border border-white/5 transition-all"
                >
                  {copiedIndex === activeEngine ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      已复制
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      复制原文
                    </>
                  )}
                </button>
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
      <footer className="px-6 py-5 border-t border-white/5 bg-white/2 backdrop-blur-md flex items-center justify-center">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            if (inputQuery.trim()) {
              triggerAiSearch(inputQuery);
              setInputQuery('');
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

    </div>
  );
}
