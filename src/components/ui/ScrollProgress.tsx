/**
 * Scroll Progress 滚动进度条
 * 基于原生 CSS 实现，零 JS 运行时开销
 * 使用 scroll-timeline 或降级为静态装饰条
 */

// ===== 1. 依赖导入区域 =====
// React 核心
import type { Ref } from 'react'

// 工具函数
import { cn } from '@/utils'

// ===== 2. 类型定义区域 =====
interface ScrollProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>
}

// ===== 3. 导出区域 =====
/**
 * 滚动进度条组件
 * 使用纯 CSS animation-timeline 实现，无 JS 开销
 * 不支持浏览器降级为静态装饰线
 */
export function ScrollProgress({
  className,
  ref,
  ...props
}: ScrollProgressProps) {
  return (
    <>
      {/* 纯 CSS 滚动进度条：利用 animation-timeline: scroll() */}
      <div
        ref={ref}
        className={cn(
          'fixed left-0 top-0 bottom-0 z-50 w-px origin-top bg-linear-to-b from-[#A97CF8] via-[#F38CB8] to-[#FDCC92]',
          className
        )}
        style={{
          animationName: 'scroll-progress-grow',
          animationDuration: '1ms',
          animationFillMode: 'both',
          animationTimeline: 'scroll()',
        }}
        {...props}
      />
      {/* 内联 keyframes */}
      <style>{`
        @keyframes scroll-progress-grow {
          from { transform: scaleY(0); }
          to { transform: scaleY(1); }
        }
      `}</style>
    </>
  )
}
