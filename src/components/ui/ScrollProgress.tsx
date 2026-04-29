/**
 * Scroll Progress 滚动进度条
 * 基于 magicui 的 Scroll Progress 组件
 * 固定在页面左侧的垂直滚动进度指示器
 */

// ===== 1. 依赖导入区域 =====
// React 核心
import type { Ref } from 'react'

// 动画库
import { motion, useScroll, type MotionProps } from 'motion/react'

// 工具函数
import { cn } from '@/utils'

// ===== 2. 类型定义区域 =====
interface ScrollProgressProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  keyof MotionProps
> {
  ref?: Ref<HTMLDivElement>
}

// ===== 3. 导出区域 =====
export function ScrollProgress({
  className,
  ref,
  ...props
}: ScrollProgressProps) {
  const { scrollYProgress } = useScroll()

  return (
    <motion.div
      ref={ref}
      className={cn(
        'fixed left-0 top-0 bottom-0 z-50 w-px origin-top bg-linear-to-b from-[#A97CF8] via-[#F38CB8] to-[#FDCC92]',
        className
      )}
      style={{
        scaleY: scrollYProgress,
      }}
      {...props}
    />
  )
}
