import { ReactNode, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export type AnimationType = 'scale' | 'slide-right' | 'slide-left' | 'slide-up' | 'fade';
export type ModalPosition = 'center' | 'right' | 'left' | 'top' | 'bottom' | 'custom';

interface BaseModalProps {
  /** 控制弹窗显隐 */
  isOpen: boolean;
  /** 触发关闭时的回调 */
  onClose?: () => void;
  /** 弹窗内部的业务内容 */
  children: ReactNode;
  /** 
   * 预设的动画类型，支持 scale, slide-right 等。
   * 后期可在此枚举中灵活扩充更多动画预设，而不影响外部调用。
   */
  animationType?: AnimationType;
  /** 
   * 弹窗在屏幕中的相对位置。
   * 'center' 将自动使内容水平垂直居中。
   * 'right' 将使内容靠右紧贴（适合侧边栏）。
   */
  position?: ModalPosition;
  /** 自定义弹窗主体的类名，用于控制宽高等样式 */
  containerClassName?: string;
  /** 点击遮罩层是否可以关闭 */
  closeOnOverlayClick?: boolean;
  /** 遮罩层自定义类名 */
  overlayClassName?: string;
  /** 弹窗容器层级 */
  zIndex?: number;
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

// 后期扩展动效：只需在此对象中添加新的 variant 配置即可
const modalVariants: Record<AnimationType, any> = {
  scale: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 }
  },
  'slide-right': {
    hidden: { opacity: 0, x: '100%' },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: '100%' }
  },
  'slide-left': {
    hidden: { opacity: 0, x: '-100%' },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: '-100%' }
  },
  'slide-up': {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 50 }
  },
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  }
};

const getPositionClasses = (position: ModalPosition) => {
  switch (position) {
    case 'center':
      return 'items-center justify-center';
    case 'right':
      return 'justify-end';
    case 'left':
      return 'justify-start';
    case 'top':
      return 'items-start justify-center';
    case 'bottom':
      return 'items-end justify-center';
    default:
      return '';
  }
};

export function BaseModal({
  isOpen,
  onClose,
  children,
  animationType = 'scale',
  position = 'center',
  containerClassName = '',
  closeOnOverlayClick = true,
  overlayClassName = 'bg-black/50 dark:bg-black/70 backdrop-blur-sm',
  zIndex = 50,
}: BaseModalProps) {
  
  // 阻止背景层滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleOverlayClick = () => {
    if (closeOnOverlayClick && onClose) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className={`fixed inset-0 flex ${getPositionClasses(position)}`}
          style={{ zIndex }}
        >
          {/* 遮罩层 (独立渲染，保证动效不受子级影响) */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.2 }}
            className={`absolute inset-0 ${overlayClassName}`}
            onClick={handleOverlayClick}
          />
          
          {/* 弹窗主体 */}
          <motion.div
            variants={modalVariants[animationType]}
            initial="hidden"
            animate="visible"
            exit="exit"
            // 采用 spring 弹性动画使得交互更具质感，不僵硬
            transition={{ type: 'spring', damping: 25, stiffness: 300, mass: 0.8 }}
            className={`relative ${containerClassName}`}
            // 阻止点击穿透到外层遮罩触发关闭
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
