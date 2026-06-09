const fs = require('fs');
const path = 'E:/workspace/navatation/navatation-web/src/app/components/shortcut/AddShortcutDialog.tsx';
let code = fs.readFileSync(path, 'utf8');

// Use regex for useFaviconDetector
const regexHookStart = /  const \[rowLoadingStatus, setRowLoadingStatus\] = useState<Record<string, boolean>>\(\{\}\);\n[\s\S]*?  useEffect\(\(\) => \{\n    rowDetectedIconsRef\.current = rowDetectedIcons;\n  \}, \[rowDetectedIcons\]\);/;

const hookReplacement = `  const {
    rowLoadingStatus,
    rowDetectedIcons,
    isAllRefreshing,
    setRowLoadingStatus,
    setRowDetectedIcons,
    handleDetectRowIcon,
    handleBatchRefreshCategoryIcons,
    handleBatchRefreshAllIcons
  } = useFaviconDetector(batchEditData, setBatchEditData, updateBatchEditSite);`;

code = code.replace(regexHookStart, hookReplacement);

// Regex for the functions
const regexFns = /  const handleDetectRowIcon = async \([\s\S]*?setIsAllRefreshing\(false\);\n    \}\n  \};/m;
code = code.replace(regexFns, '');

// Regex for CustomTab JSX
// It's inside activeTab === 'recommended' ? ( ... ) : ( <div className="p-8">...</div> )
const regexTab = /<div className="p-8">\s*<div className="max-w-xl mx-auto space-y-6">[\s\S]*?<\/div>\s*<\/div>/;
const tabReplacement = `                  <CustomShortcutTab
                    customName={customName}
                    setCustomName={setCustomName}
                    customUrl={customUrl}
                    setCustomUrl={setCustomUrl}
                    customIconUrl={customIconUrl}
                    setCustomIconUrl={setCustomIconUrl}
                    faviconStatus={faviconStatus}
                    detectedIcons={detectedIcons}
                    iconFromUpload={iconFromUpload}
                    uploadError={uploadError}
                    handleCustomIconUpload={handleCustomIconUpload}
                    handleAddCustomToPending={handleAddCustomToPending}
                    iconRadius={iconRadius}
                  />`;

code = code.replace(regexTab, tabReplacement);

fs.writeFileSync(path, code);
console.log('Refactored AddShortcutDialog.tsx with regex successfully.');
