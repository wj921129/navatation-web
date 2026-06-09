import fs from 'fs';
import path from 'path';
const p = path.join('E:/workspace/navatation/navatation-web/src/app/hooks/useShortcuts.ts');
let content = fs.readFileSync(p, 'utf-8');
if (!content.startsWith('/**')) {
  content = '/**\n * @description 快捷方式管理 Hook\n * @date 2026-06-09\n */\n' + content;
  fs.writeFileSync(p, content, 'utf-8');
}