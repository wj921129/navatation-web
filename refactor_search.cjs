const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/app/components/search/AiSearchOverlay.tsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Add file header
const header = `/**
 * 文件名: AiSearchOverlay.tsx
 * 功能描述: 聚合 AI 搜索与对比面板
 * 创建时间: 2026-06-09
 */
`;
if (!content.startsWith('/**')) {
  content = header + content;
}

// 2. Replace imports
content = content.replace(
  "import { Tooltip } from '../ui/Tooltip';",
  `import { Tooltip } from '../ui/Tooltip';\nimport { getKnowledgeAnswer, generateSynthesisAnswer } from './aiSearchLogic';\nimport { AiSynthesisPanel } from './AiSynthesisPanel';\nimport { AiSearchFooter } from './AiSearchFooter';`
);

// 3. Remove getKnowledgeAnswer and generateSynthesisAnswer
const getKnowledgeStart = content.indexOf('const getKnowledgeAnswer =');
const triggerAiSearchStart = content.indexOf('const triggerAiSearch =');
if (getKnowledgeStart !== -1 && triggerAiSearchStart !== -1) {
  content = content.substring(0, getKnowledgeStart) + '\n  // 知识库逻辑与总结生成已迁移至 aiSearchLogic.ts\n  ' + content.substring(triggerAiSearchStart);
}

// 4. Replace Synthesis Panel
const synthesisPanelStart = content.indexOf('{/* 1. 顶部的智能融合总结面板 (若开启) */}');
const splitModeStart = content.indexOf('{/* 2. 主对比渲染面板 */}');
if (synthesisPanelStart !== -1 && splitModeStart !== -1) {
  const replacement = `{/* 1. 顶部的智能融合总结面板 (若开启) */}
        {showSynthesis && (initialQuery || synthesisContent) && (
          <AiSynthesisPanel
            synthesisContent={synthesisContent}
            synthesisStreaming={synthesisStreaming}
            copiedIndex={copiedIndex}
            onCopy={handleCopy}
            panelRef={chatEndRefs.synthesis}
          />
        )}\n\n        `;
  content = content.substring(0, synthesisPanelStart) + replacement + content.substring(splitModeStart);
}

// 5. Replace Footer
const footerStart = content.indexOf('{/* 底部多轮追加对话输入控制 */}');
const footerEnd = content.indexOf('</BaseModal>');
if (footerStart !== -1 && footerEnd !== -1) {
  const replacement = `{/* 底部多轮追加对话输入控制 */}
      <AiSearchFooter 
        inputQuery={inputQuery} 
        setInputQuery={setInputQuery} 
        triggerAiSearch={triggerAiSearch} 
      />\n\n    `;
  content = content.substring(0, footerStart) + replacement + content.substring(footerEnd);
}

fs.writeFileSync(file, content, 'utf8');
console.log('AiSearchOverlay.tsx updated successfully');
