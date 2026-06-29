import {
  BookOpen,
  Briefcase,
  Code,
  Cpu,
  Gamepad2,
  type LucideIcon,
  Music as MusicIcon,
  Newspaper,
  ShoppingBag,
  Video,
} from 'lucide-react'

export interface BaseShortcut {
  dragId: string;
  name: string;
  type?: 'single' | 'stack';
}

export interface SingleShortcut extends BaseShortcut {
  type: 'single' | undefined;
  url: string;
  iconType: 'FAVICON' | 'CUSTOM_UPLOAD' | 'BUILTIN' | 'CUSTOM_URL';
  iconValue?: string;
  color?: string;
  icon?: LucideIcon; // 为了保持向后兼容性
}

export interface StackShortcut extends BaseShortcut {
  type: 'stack';
  children: SingleShortcut[];
}

export type DesktopItem = SingleShortcut | StackShortcut;

/**
 * RecommendedSite 组件/功能描述
 */
export interface RecommendedSite {
  siteId?: string
  name: string
  icon: LucideIcon
  color: string
  url: string
  iconType?: string
  iconValue?: string
  dragId?: string
}

/**
 * CategoryGroup 组件/功能描述
 */
export interface CategoryGroup {
  categoryId?: string
  category: string
  icon: LucideIcon
  iconType?: string
  iconValue?: string
  sortOrder?: number
  sites: RecommendedSite[]
}

export const recommendedCategories: CategoryGroup[] = [
  {
    category: '看视频',
    icon: Video,
    sites: [
      {
        name: 'YouTube',
        icon: Video,
        color: '#FF0000',
        url: 'https://youtube.com',
      },
      {
        name: 'Netflix',
        icon: Video,
        color: '#E50914',
        url: 'https://netflix.com',
      },
      {
        name: 'Bilibili',
        icon: Video,
        color: '#00A1D6',
        url: 'https://bilibili.com',
      },
      {
        name: 'Twitch',
        icon: Video,
        color: '#9146FF',
        url: 'https://twitch.tv',
      },
      {
        name: '腾讯视频',
        icon: Video,
        color: '#FF8200',
        url: 'https://v.qq.com',
      },
      {
        name: '爱奇艺',
        icon: Video,
        color: '#00CC00',
        url: 'https://iqiyi.com',
      },
      { name: '优酷', icon: Video, color: '#1A90FF', url: 'https://youku.com' },
      {
        name: '抖音',
        icon: Video,
        color: '#111111',
        url: 'https://douyin.com',
      },
    ],
  },
  {
    category: 'AI工具',
    icon: Cpu,
    sites: [
      {
        name: 'ChatGPT',
        icon: Cpu,
        color: '#10A37F',
        url: 'https://chat.openai.com',
      },
      { name: 'Claude', icon: Cpu, color: '#CC9B7A', url: 'https://claude.ai' },
      {
        name: 'DeepSeek',
        icon: Cpu,
        color: '#1254FF',
        url: 'https://chat.deepseek.com',
      },
      {
        name: 'Gemini',
        icon: Cpu,
        color: '#4285F4',
        url: 'https://gemini.google.com',
      },
      { name: '豆包', icon: Cpu, color: '#0057FF', url: 'https://doubao.com' },
      {
        name: 'Kimi',
        icon: Cpu,
        color: '#5C5CFF',
        url: 'https://kimi.moonshot.cn',
      },
      {
        name: '文心一言',
        icon: Cpu,
        color: '#2932E1',
        url: 'https://yiyan.baidu.com',
      },
      {
        name: '智谱清言',
        icon: Cpu,
        color: '#3D52F5',
        url: 'https://chatglm.cn',
      },
    ],
  },
  {
    category: 'Web开发',
    icon: Code,
    sites: [
      {
        name: 'GitHub',
        icon: Code,
        color: '#181717',
        url: 'https://github.com',
      },
      {
        name: 'Stack Overflow',
        icon: Code,
        color: '#F58025',
        url: 'https://stackoverflow.com',
      },
      {
        name: 'MDN',
        icon: BookOpen,
        color: '#000000',
        url: 'https://developer.mozilla.org',
      },
      { name: 'Gitee', icon: Code, color: '#C71D23', url: 'https://gitee.com' },
      { name: '掘金', icon: Code, color: '#1E80FF', url: 'https://juejin.cn' },
      { name: 'CSDN', icon: Code, color: '#E2231A', url: 'https://csdn.net' },
      {
        name: '阿里云',
        icon: Code,
        color: '#FF6A00',
        url: 'https://aliyun.com',
      },
      {
        name: '腾讯云',
        icon: Code,
        color: '#00A4FF',
        url: 'https://cloud.tencent.com',
      },
    ],
  },
  {
    category: '购物',
    icon: ShoppingBag,
    sites: [
      {
        name: '淘宝',
        icon: ShoppingBag,
        color: '#FF6A00',
        url: 'https://taobao.com',
      },
      {
        name: '京东',
        icon: ShoppingBag,
        color: '#E3393C',
        url: 'https://jd.com',
      },
      {
        name: '拼多多',
        icon: ShoppingBag,
        color: '#E02E24',
        url: 'https://pinduoduo.com',
      },
      {
        name: '唯品会',
        icon: ShoppingBag,
        color: '#F10180',
        url: 'https://vip.com',
      },
      {
        name: '美团',
        icon: ShoppingBag,
        color: '#FFC300',
        url: 'https://meituan.com',
      },
      {
        name: 'Amazon',
        icon: ShoppingBag,
        color: '#FF9900',
        url: 'https://amazon.com',
      },
      {
        name: 'eBay',
        icon: ShoppingBag,
        color: '#E53238',
        url: 'https://ebay.com',
      },
      {
        name: 'AliExpress',
        icon: ShoppingBag,
        color: '#E62E04',
        url: 'https://aliexpress.com',
      },
    ],
  },
  {
    category: '新闻资讯',
    icon: Newspaper,
    sites: [
      {
        name: '知乎',
        icon: BookOpen,
        color: '#0084FF',
        url: 'https://zhihu.com',
      },
      {
        name: '微博',
        icon: Newspaper,
        color: '#E6162D',
        url: 'https://weibo.com',
      },
      {
        name: '今日头条',
        icon: Newspaper,
        color: '#F85959',
        url: 'https://toutiao.com',
      },
      {
        name: '澎湃新闻',
        icon: Newspaper,
        color: '#00AEB5',
        url: 'https://thepaper.cn',
      },
      {
        name: '腾讯新闻',
        icon: Newspaper,
        color: '#1E80FF',
        url: 'https://news.qq.com',
      },
      {
        name: 'Reddit',
        icon: Newspaper,
        color: '#FF4500',
        url: 'https://reddit.com',
      },
      {
        name: 'BBC',
        icon: Newspaper,
        color: '#B71C1C',
        url: 'https://bbc.com',
      },
      {
        name: 'Medium',
        icon: BookOpen,
        color: '#000000',
        url: 'https://medium.com',
      },
    ],
  },
  {
    category: '游戏',
    icon: Gamepad2,
    sites: [
      {
        name: 'Steam',
        icon: Gamepad2,
        color: '#171A21',
        url: 'https://store.steampowered.com',
      },
      {
        name: 'Epic Games',
        icon: Gamepad2,
        color: '#313131',
        url: 'https://epicgames.com',
      },
      {
        name: 'TapTap',
        icon: Gamepad2,
        color: '#00D1A1',
        url: 'https://taptap.cn',
      },
      {
        name: '4399',
        icon: Gamepad2,
        color: '#FF7700',
        url: 'https://4399.com',
      },
      { name: 'NGA', icon: Gamepad2, color: '#7E1111', url: 'https://nga.cn' },
      {
        name: '游民星空',
        icon: Gamepad2,
        color: '#1C7430',
        url: 'https://gamersky.com',
      },
      {
        name: '3DM',
        icon: Gamepad2,
        color: '#FF2626',
        url: 'https://3dmgame.com',
      },
      {
        name: 'Discord',
        icon: Gamepad2,
        color: '#5865F2',
        url: 'https://discord.com',
      },
    ],
  },
  {
    category: '音乐',
    icon: MusicIcon,
    sites: [
      {
        name: '网易云音乐',
        icon: MusicIcon,
        color: '#E60026',
        url: 'https://music.163.com',
      },
      {
        name: 'QQ音乐',
        icon: MusicIcon,
        color: '#2CAF6F',
        url: 'https://y.qq.com',
      },
      {
        name: '酷狗音乐',
        icon: MusicIcon,
        color: '#00A9FF',
        url: 'https://kugou.com',
      },
      {
        name: '咪咕音乐',
        icon: MusicIcon,
        color: '#FF007F',
        url: 'https://music.migu.cn',
      },
      {
        name: 'Spotify',
        icon: MusicIcon,
        color: '#1DB954',
        url: 'https://spotify.com',
      },
      {
        name: 'Apple Music',
        icon: MusicIcon,
        color: '#FA243C',
        url: 'https://music.apple.com',
      },
      {
        name: 'SoundCloud',
        icon: MusicIcon,
        color: '#FF5500',
        url: 'https://soundcloud.com',
      },
      {
        name: 'YouTube Music',
        icon: MusicIcon,
        color: '#FF0000',
        url: 'https://music.youtube.com',
      },
    ],
  },
  {
    category: '办公效率',
    icon: Briefcase,
    sites: [
      {
        name: '飞书',
        icon: Briefcase,
        color: '#00D1A1',
        url: 'https://feishu.cn',
      },
      {
        name: '钉钉',
        icon: Briefcase,
        color: '#0089FF',
        url: 'https://dingtalk.com',
      },
      {
        name: '语雀',
        icon: Briefcase,
        color: '#00B96B',
        url: 'https://yuque.com',
      },
      {
        name: '腾讯文档',
        icon: Briefcase,
        color: '#007BFF',
        url: 'https://docs.qq.com',
      },
      { name: 'WPS', icon: Briefcase, color: '#D9383A', url: 'https://wps.cn' },
      {
        name: 'Notion',
        icon: Briefcase,
        color: '#000000',
        url: 'https://notion.so',
      },
      {
        name: 'Figma',
        icon: Briefcase,
        color: '#F24E1E',
        url: 'https://figma.com',
      },
      {
        name: 'Slack',
        icon: Briefcase,
        color: '#4A154B',
        url: 'https://slack.com',
      },
    ],
  },
]
