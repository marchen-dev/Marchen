import { cn } from '@base/lib/helper'
import type { ComponentPropsWithRef, ElementType, ReactNode } from 'react'

// 定义多态组件的props类型，接受一个泛型参数T代表元素类型
type HomeCardProps<T extends ElementType = 'div'> = {
  // as 属性允许指定要渲染的元素类型
  as?: T
  // 允许接收子元素
  children?: ReactNode
  // 支持className属性
  className?: string
  // 扩展目标元素类型的所有原生属性
} & ComponentPropsWithRef<T>

// 使用泛型函数组件定义，保持类型安全
const HomeCard = <T extends ElementType = 'div'>({
  as: Component = 'div' as T,
  children,
  className,
  ...props
}: HomeCardProps<T>) => {
  return (
    <Component
      className={cn(
        'rounded-lg border border-base-300 bg-neutral-content  p-5 shadow-sm transition-shadow',
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  )
}

export { HomeCard }
