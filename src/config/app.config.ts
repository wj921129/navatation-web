// 默认兜底壁纸
/**
 * DEFAULT_WALLPAPER 组件/功能描述
 */
export const DEFAULT_WALLPAPER = 'https://images.unsplash.com/photo-1598439473183-42c9301db5dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=2400';

/**
 * DEFAULT_SETTINGS 组件/功能描述
 */
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
};

// 游客模式默认预设的网址捷径列表
/**
 * DEFAULT_SHORTCUTS 组件/功能描述
 */
export const DEFAULT_SHORTCUTS = [
  // First row - 9 icons
  { name: 'Google', iconValue: 'Search', iconType: 'BUILTIN', color: '#4285F4', url: 'https://google.com', dragId: 'default-0' },
  { name: 'YouTube', iconValue: 'Youtube', iconType: 'BUILTIN', color: '#FF0000', url: 'https://youtube.com', dragId: 'default-1' },
  { name: 'Facebook', iconValue: 'Facebook', iconType: 'BUILTIN', color: '#1877F2', url: 'https://facebook.com', dragId: 'default-2' },
  { name: 'Twitter', iconValue: 'Twitter', iconType: 'BUILTIN', color: '#1DA1F2', url: 'https://twitter.com', dragId: 'default-3' },
  { name: 'Instagram', iconValue: 'Instagram', iconType: 'BUILTIN', color: '#E4405F', url: 'https://instagram.com', dragId: 'default-4' },
  { name: 'LinkedIn', iconValue: 'Linkedin', iconType: 'BUILTIN', color: '#0A66C2', url: 'https://linkedin.com', dragId: 'default-5' },
  { name: 'GitHub', iconValue: 'Github', iconType: 'BUILTIN', color: '#181717', url: 'https://github.com', dragId: 'default-6' },
  { name: 'Amazon', iconValue: 'ShoppingCart', iconType: 'BUILTIN', color: '#FF9900', url: 'https://amazon.com', dragId: 'default-7' },
  { name: 'Netflix', iconValue: 'Film', iconType: 'BUILTIN', color: '#E50914', url: 'https://netflix.com', dragId: 'default-8' },
  // Second row - 7 icons
  { name: 'Spotify', iconValue: 'Music', iconType: 'BUILTIN', color: '#1DB954', url: 'https://spotify.com', dragId: 'default-9' },
  { name: 'Reddit', iconValue: 'MessageCircle', iconType: 'BUILTIN', color: '#FF4500', url: 'https://reddit.com', dragId: 'default-10' },
  { name: 'Gmail', iconValue: 'Mail', iconType: 'BUILTIN', color: '#EA4335', url: 'https://gmail.com', dragId: 'default-11' },
  { name: 'Twitch', iconValue: 'Video', iconType: 'BUILTIN', color: '#9146FF', url: 'https://twitch.tv', dragId: 'default-12' },
  { name: 'Discord', iconValue: 'MessageSquare', iconType: 'BUILTIN', color: '#5865F2', url: 'https://discord.com', dragId: 'default-13' },
  { name: 'Slack', iconValue: 'Slack', iconType: 'BUILTIN', color: '#4A154B', url: 'https://slack.com', dragId: 'default-14' },
  { name: 'Dribbble', iconValue: 'Dribbble', iconType: 'BUILTIN', color: '#EA4C89', url: 'https://dribbble.com', dragId: 'default-15' },
];
