/**
 * 全局通用动画与过渡系统配置常量
 * 统一整个应用的交互手感，确保物理动画在不同组件间的表现一致。
 */

// 基于弹簧物理引擎的过渡参数
export const SPRING_TRANSITIONS = {
  // 基础丝滑弹簧（适用于大部分通用组件，轻盈且有轻微回弹）
  DEFAULT: { type: 'spring', damping: 20, stiffness: 350, mass: 0.6 },

  // 弹窗级别专属参数（与 DEFAULT 类似，保留语义化引用）
  MODAL: { type: 'spring', damping: 20, stiffness: 350, mass: 0.6 },

  // 缓慢平滑（适用于大面积或重量级组件，阻尼更大）
  SLOW: { type: 'spring', damping: 25, stiffness: 200, mass: 0.8 },

  // 迅捷敏锐（适用于极小组件如按钮按压反馈、Checkbox等，无多余回弹）
  SNAPPY: { type: 'spring', damping: 15, stiffness: 400, mass: 0.5 },
} as const

// 基于 Tween (纯线性/缓动函数) 的过渡参数
export const TWEEN_TRANSITIONS = {
  FAST: { duration: 0.2, ease: 'easeInOut' },
  NORMAL: { duration: 0.3, ease: 'easeInOut' },
  SLOW: { duration: 0.5, ease: 'easeInOut' },
} as const

// 常用透明度动画参数（适用于遮罩层或渐变容器）
export const OPACITY_TRANSITIONS = {
  FAST: { duration: 0.2 },
  NORMAL: { duration: 0.3 },
} as const
