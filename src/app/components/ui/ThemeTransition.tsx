import React from 'react'

interface ThemeTransitionProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  as?: React.ElementType
}

/**
 * ThemeTransition 统一主题过渡封装容器
 * 统一标准：300ms cubic-bezier(0.4, 0, 0.2, 1)
 * 仅过渡颜色、背景、边框及阴影等主题相关属性，避免干扰布局和位置的 transform 过渡
 */
export const ThemeTransition: React.FC<ThemeTransitionProps> = ({
  children,
  className = '',
  as: Component = 'div',
  ...props
}) => {
  return (
    <Component className={`theme-transition ${className}`} {...props}>
      {children}
    </Component>
  )
}
