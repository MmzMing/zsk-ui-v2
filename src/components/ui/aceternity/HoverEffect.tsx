/**
 * HoverCard 组件
 * 悬停时内容滑动的卡片效果
 * 参考 aceternityui: https://ui.aceternity.com/components/card-hover-effect
 */

'use client'

import { type ReactNode } from 'react'
import { cn } from '@/utils'

/**
 * HoverCard 属性
 */
interface HoverCardProps {
  /** 子元素 */
  children: ReactNode
  /** 自定义类名 */
  className?: string
}

/**
 * HoverCard 悬停效果卡片
 * 悬停时内容从底部滑入
 */
export function HoverCard({ children, className }: HoverCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl group cursor-pointer',
        'bg-white dark:bg-black',
        'border border-default-200 dark:border-default-800',
        'shadow-sm transition-all duration-300',
        'hover:shadow-xl hover:border-default-300 dark:hover:border-default-700',
        className
      )}
    >
      <div className="relative">{children}</div>
    </div>
  )
}

/**
 * HoverCardContent 属性
 */
interface HoverCardContentProps {
  /** 标题 */
  title: string
  /** 描述 */
  description?: string
  /** 链接/按钮 */
  link?: ReactNode
  /** 自定义类名 */
  className?: string
}

/**
 * HoverCardContent 悬停卡片内容
 * 显示在悬停时从底部滑入
 */
export function HoverCardContent({ title, description, link, className }: HoverCardContentProps) {
  return (
    <div
      className={cn(
        'absolute inset-x-0 bottom-0 p-6',
        'bg-gradient-to-t from-black/80 via-black/60 to-transparent',
        'translate-y-full group-hover:translate-y-0',
        'transition-transform duration-300 ease-in-out',
        className
      )}
    >
      <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-gray-200 line-clamp-2 mb-3">{description}</p>
      )}
      {link && <div>{link}</div>}
    </div>
  )
}