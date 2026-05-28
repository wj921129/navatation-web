// 默认兜底壁纸
export const DEFAULT_WALLPAPER = 'https://images.unsplash.com/photo-1598439473183-42c9301db5dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=2400';

export const DEFAULT_SETTINGS = {
  searchBoxWidth: 50,      // 搜索框宽度占比，单位百分比 (%)
  searchBoxHeight: 64,     // 搜索框高度，单位像素 (px)
  searchBoxMarginTop: 192, // 搜索框距顶部间距，单位像素 (px)
  iconSize: 64,            // 图标外框尺寸，单位像素 (px)
  iconRadius: 50,          // 图标圆角大小，单位百分比 (%)
  iconSpacingX: 32,        // 图标水平间距，单位像素 (px)
  iconSpacingY: 48,        // 图标垂直间距，单位像素 (px)
  iconTextGap: 12,         // 图标与文字的间距，单位像素 (px)
  textSize: 14,            // 捷径文字大小，单位像素 (px)
  iconsMarginTop: 64,      // 搜索框与下方图标区的间距（作为搜索框下间距使用），单位像素 (px)
  iconsMarginX: 10,        // 图标区左右边距，控制网格水平收缩，单位百分比 (%)
  dockMaxScale: 1.5,       // 顶部小组件Dock最大缩放倍数，无单位（如 1.5）
  dockEffectRadius: 120,   // 顶部小组件Dock缩放影响半径，单位像素 (px)
};

// 游客模式默认预设的网址捷径列表
export const DEFAULT_SHORTCUTS = [
  // First row - 9 icons
  { name: 'Google', iconValue: 'Search', iconType: 'BUILTIN', color: '#4285F4', url: 'https://google.com' },
  { name: 'YouTube', iconValue: 'Youtube', iconType: 'BUILTIN', color: '#FF0000', url: 'https://youtube.com' },
  { name: 'Facebook', iconValue: 'Facebook', iconType: 'BUILTIN', color: '#1877F2', url: 'https://facebook.com' },
  { name: 'Twitter', iconValue: 'Twitter', iconType: 'BUILTIN', color: '#1DA1F2', url: 'https://twitter.com' },
  { name: 'Instagram', iconValue: 'Instagram', iconType: 'BUILTIN', color: '#E4405F', url: 'https://instagram.com' },
  { name: 'LinkedIn', iconValue: 'Linkedin', iconType: 'BUILTIN', color: '#0A66C2', url: 'https://linkedin.com' },
  { name: 'GitHub', iconValue: 'Github', iconType: 'BUILTIN', color: '#181717', url: 'https://github.com' },
  { name: 'Amazon', iconValue: 'ShoppingCart', iconType: 'BUILTIN', color: '#FF9900', url: 'https://amazon.com' },
  { name: 'Netflix', iconValue: 'Film', iconType: 'BUILTIN', color: '#E50914', url: 'https://netflix.com' },
  // Second row - 7 icons
  { name: 'Spotify', iconValue: 'Music', iconType: 'BUILTIN', color: '#1DB954', url: 'https://spotify.com' },
  { name: 'Reddit', iconValue: 'MessageCircle', iconType: 'BUILTIN', color: '#FF4500', url: 'https://reddit.com' },
  { name: 'Gmail', iconValue: 'Mail', iconType: 'BUILTIN', color: '#EA4335', url: 'https://gmail.com' },
  { name: 'Twitch', iconValue: 'Video', iconType: 'BUILTIN', color: '#9146FF', url: 'https://twitch.tv' },
  { name: 'Discord', iconValue: 'MessageSquare', iconType: 'BUILTIN', color: '#5865F2', url: 'https://discord.com' },
  { name: 'Slack', iconValue: 'Slack', iconType: 'BUILTIN', color: '#4A154B', url: 'https://slack.com' },
  { name: 'Dribbble', iconValue: 'Dribbble', iconType: 'BUILTIN', color: '#EA4C89', url: 'https://dribbble.com' },
];
