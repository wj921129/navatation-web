const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/app/components/search/AiSearchOverlay.tsx');
let content = fs.readFileSync(file, 'utf8');

// replace magic speeds
content = content.replace(/speed: 340/g, 'speed: 340, /* DEFAULT_CHATGPT_SPEED */');
content = content.replace(/speed: 180/g, 'speed: 180, /* DEFAULT_QWEN_SPEED */');
content = content.replace(/speed: 120/g, 'speed: 120, /* DEFAULT_DOUBAO_SPEED */');

// replace if (!...) return; with {}
content = content.replace(/if \(!query\.trim\(\)\) return;/g, 'if (!query.trim()) { return; }');
content = content.replace(/if \(!isOpen\) return null;/g, 'if (!isOpen) { return null; }');
content = content.replace(/if \(ref\.current\)\s*\{\s*ref\.current\.scrollIntoView/g, 'if (ref.current) { ref.current.scrollIntoView');
content = content.replace(/if \(line\.startsWith\('###'\)\) return <h4/g, 'if (line.startsWith(\\'###\\')) { return <h4');
content = content.replace(/if \(line\.startsWith\('####'\)\) return <h5/g, 'if (line.startsWith(\\'####\\')) { return <h5');
content = content.replace(/if \(line\.startsWith\('-'\)\) return <li/g, 'if (line.startsWith(\\'-\\')) { return <li');

fs.writeFileSync(file, content, 'utf8');
console.log('Done cleaning AiSearchOverlay.tsx');
