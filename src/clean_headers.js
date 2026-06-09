import fs from 'fs';
import path from 'path';

const files = [
  'app/App.tsx',
  'app/components/auth/LogoutConfirmDialog.tsx',
  'app/components/dock/TopDock.tsx',
  'app/components/search/SearchBox.tsx',
  'app/components/search/SearchEngineSelect.tsx',
  'app/components/settings/SettingsDialog.tsx',
  'app/components/shortcut/CustomShortcutTab.tsx',
  'app/components/shortcut/DraggableShortcut.tsx',
  'app/components/shortcut/EditShortcutDialog.tsx',
  'app/components/ui/IconMap.ts',
  'app/components/ui/Tooltip.tsx',
  'app/components/ui/utils.ts',
  'app/components/widgets/BreatheWidget.tsx',
  'app/components/widgets/CalendarWidget.tsx',
  'app/components/widgets/ClockWidget.tsx',
  'app/components/widgets/PomodoroWidget.tsx',
  'app/components/widgets/WeatherWidget.tsx',
  'app/hooks/useAppInit.ts',
  'app/hooks/useBrightness.ts',
  'app/hooks/useFaviconDetector.ts',
  'app/hooks/useSettings.ts',
  'app/hooks/useShortcuts.ts',
  'main.tsx'
];

files.forEach(f => {
  const p = path.join('E:/workspace/navatation/navatation-web/src', f);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf-8');
    
    // Check if the file starts with the broken header structure (up to 5 lines of comment)
    // We can just match the first `/** ... */\n` or `/** ... */`
    const match = content.match(/^\/\*\*[\s\S]*?\*\/\n?/);
    if (match) {
      const header = match[0];
      // Only replace if it contains a question mark `?` from encoding corruption or "date 2026-06-10"
      if (header.includes('?') || header.includes('2026-06-10') || header.includes('2026-06-09')) {
        content = content.substring(match[0].length);
        
        // Remove any stray ` * @date` or ` */` if the regex missed it because of missing newlines
        // Actually, if the newline was missing, it might have swallowed code!
        // We better checkout the files from `1bc006e` and re-apply our changes!
      }
    }
  }
});
