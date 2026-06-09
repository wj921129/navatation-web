/**
 * 文件名: aiSearchLogic.ts
 * 功能描述: 聚合 AI 搜索知识库逻辑与大师总结生成
 * 创建时间: 2026-06-09
 */

export const getKnowledgeAnswer = (query: string, engine: string): string => {
  if (!query) return '';
  const q = query.toLowerCase();
  
  if (q.includes('react') || q.includes('tailwind') || q.includes('css') || q.includes('glassmorphism')) {
    if (engine === 'chatgpt') {
      return `### 🌟 Glassmorphism 实现方案\n\n要在 React 和 Tailwind CSS 中实现极致高级的毛玻璃视觉效果，核心在于结合使用 \`backdrop-blur\`、高透半透明背景色以及微弱的白色内边框。\n\n#### 1. 核心 Tailwind 样式代码：\n\`\`\`html\n<div className="bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-2xl p-6 shadow-xl">\n</div>\n\`\`\``;
    }
    if (engine === 'qwen') {
      return `### 🚀 通义千问：现代前端毛玻璃最佳实践\n\n#### 🛠️ 属性拆解：\n1. **模糊滤镜**: \`backdrop-filter: blur(12px);\`\n2. **透光层**: \`background: rgba(255, 255, 255, 0.08);\`\n3. **光泽边框**: \`border: 1px solid rgba(255, 255, 255, 0.15);\`\n\n\`\`\`css\n.glass-effect {\n  background: rgba(15, 15, 25, 0.6);\n  backdrop-filter: blur(20px) saturate(180%);\n}\n\`\`\``;
    }
    return `### 🍬 豆包AI：超简单的毛玻璃小卡片！\n\n- ✨ **背景模糊**：用 \`backdrop-blur-lg\`。\n- 🎨 **自适应暗色**：白天用 \`bg-white/40\`，夜间用 \`bg-neutral-900/40\`。`;
  }

  if (q.includes('算法') || q.includes('排序')) {
    if (engine === 'chatgpt') {
      return `### 💻 斐波那契数列的优雅实现\n\n\`\`\`typescript\nfunction fibDP(n: number): number {\n  if (n <= 1) return n;\n  let prev2 = 0, prev1 = 1, curr = 0;\n  for (let i = 2; i <= n; i++) {\n    curr = prev1 + prev2;\n    prev2 = prev1;\n    prev1 = curr;\n  }\n  return curr;\n}\n\`\`\``;
    }
    if (engine === 'qwen') {
      return `### 🚀 通义千问：经典算法设计详解\n\n数学上存在**矩阵快速幂**方案，可实现极限的 **$O(\\log N)$** 时间复杂度。`;
    }
    return `### 🍬 豆包AI：用大白话带你搞懂斐波那契！\n\n\`0, 1, 1, 2, 3, 5, 8, 13, 21...\``;
  }

  if (engine === 'chatgpt') {
    return `### 🌐 ChatGPT 分析视角：针对 "${query}" 的多维深度剖析\n\n未来这类应用将全面演变为本地异构 Agent 联邦。`;
  }
  if (engine === 'qwen') {
    return `### 🚀 通义千问：关于 "${query}" 的落地应用指南\n\n单一模型由于语料侧重不同，可能存在逻辑盲区。`;
  }
  return `### 🍬 豆包AI：来聊聊关于 "${query}" 的心里话！\n\n保持简单是第一原则。聚合搜索最棒的地方在于它帮我们节省了时间。`;
}

export const generateSynthesisAnswer = (query: string): string => {
  if (!query) return '';
  return `### 🧠 聚合 AI 大师综合提炼报告\n\n> **核心问题**：*${query}*\n> **综合提炼算法**：基于 ChatGPT、通义千问及豆包的融合结果。\n\n---\n\n#### 📌 提炼要点与黄金共识\n1. **痛点攻克**：“单框多发、一屏对比”是最佳破局手段。\n2. **实现技术**：采用 **毛玻璃** 的自适应配色体系。\n3. **开发建议**：应同时保留“单模极简”和“并列对比”两种视图。\n\n---\n\n> 📊 **性能概览**：平均响应 182ms | 总消耗 1,420 Tokens | 信息丰富度 98%`;
}
