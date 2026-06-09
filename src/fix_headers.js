import fs from 'fs';
import path from 'path';
const files = ['app/components/auth/LogoutConfirmDialog.tsx', 'app/components/dock/TopDock.tsx', 'app/components/search/SearchBox.tsx', 'app/components/search/SearchEngineSelect.tsx', 'app/components/settings/SettingsDialog.tsx', 'app/components/shortcut/CustomShortcutTab.tsx', 'app/components/shortcut/DraggableShortcut.tsx', 'app/components/shortcut/EditShortcutDialog.tsx', 'app/components/ui/IconMap.ts', 'app/components/ui/Tooltip.tsx', 'app/components/ui/utils.ts', 'app/components/widgets/BreatheWidget.tsx', 'app/components/widgets/CalendarWidget.tsx', 'app/components/widgets/ClockWidget.tsx', 'app/components/widgets/PomodoroWidget.tsx', 'app/components/widgets/WeatherWidget.tsx', 'app/hooks/useAppInit.ts', 'app/hooks/useBrightness.ts', 'app/hooks/useFaviconDetector.ts', 'app/hooks/useSettings.ts', 'app/hooks/useShortcuts.ts', 'main.tsx'];
files.forEach(f => {
  const p = path.join('E:/workspace/navatation/navatation-web/src', f);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf-8');
    if (!content.startsWith('/**')) {
      // Create a specific description for the file based on its name
      let desc = '文件功能描述';
      if (f.includes('Logout')) desc = '退出登录确认对话框组件';
      if (f.includes('TopDock')) desc = '顶部停靠栏组件';
      if (f.includes('SearchBox')) desc = '搜索框组件';
      if (f.includes('SearchEngineSelect')) desc = '搜索引擎选择器组件';
      if (f.includes('SettingsDialog')) desc = '设置对话框组件';
      if (f.includes('CustomShortcutTab')) desc = '自定义快捷方式选项卡';
      if (f.includes('DraggableShortcut')) desc = '可拖拽快捷方式组件';
      if (f.includes('EditShortcutDialog')) desc = '编辑快捷方式对话框';
      if (f.includes('IconMap')) desc = '图标映射配置';
      if (f.includes('Tooltip')) desc = '工具提示组件';
      if (f.includes('utils.ts')) desc = '工具函数集合';
      if (f.includes('BreatheWidget')) desc = '呼吸小组件';
      if (f.includes('CalendarWidget')) desc = '日历小组件';
      if (f.includes('ClockWidget')) desc = '时钟小组件';
      if (f.includes('PomodoroWidget')) desc = '番茄钟小组件';
      if (f.includes('WeatherWidget')) desc = '天气小组件';
      if (f.includes('useAppInit')) desc = '应用初始化 Hook';
      if (f.includes('useBrightness')) desc = '亮度控制 Hook';
      if (f.includes('useFaviconDetector')) desc = '网站图标检测 Hook';
      if (f.includes('useSettings')) desc = '应用设置 Hook';
      if (f.includes('useShortcuts')) desc = '快捷方式管理 Hook';
      if (f.includes('main.tsx')) desc = '应用入口文件';
      
      content = '/**\n * @description ' + desc + '\n * @date 2026-06-09\n */\n' + content;
      fs.writeFileSync(p, content, 'utf-8');
    }
  }
});
console.log('Headers added successfully!');