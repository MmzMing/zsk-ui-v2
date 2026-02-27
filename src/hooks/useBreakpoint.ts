/**
 * 响应式断点 Hook
 * 用于检测当前屏幕尺寸
 */

import { useState, useEffect } from 'react'

// 断点类型
export type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl'

// 断点阈值（与 Tailwind 保持一致）
const BREAKPOINTS: Record<Breakpoint, number> = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
}

// 断点 Hook 返回值
interface UseBreakpointReturn {
  /** 当前断点 */
  breakpoint: Breakpoint
  /** 是否小于指定断点 */
  isBelow: (breakpoint: Breakpoint) => boolean
  /** 是否大于等于指定断点 */
  isAbove: (breakpoint: Breakpoint) => boolean
  /** 是否在指定断点范围内 */
  isBetween: (min: Breakpoint, max: Breakpoint) => boolean
  /** 是否为移动端（< md） */
  isMobile: boolean
  /** 是否为平板（md - lg） */
  isTablet: boolean
  /** 是否为桌面端（>= lg） */
  isDesktop: boolean
  /** 当前窗口宽度 */
  width: number
}

/**
 * 响应式断点 Hook
 * @example
 * const { isMobile, isDesktop, breakpoint } = useBreakpoint()
 */
export function useBreakpoint(): UseBreakpointReturn {
  const [width, setWidth] = useState(() => 
    typeof window !== 'undefined' ? window.innerWidth : 1024
  )

  // 监听窗口大小变化
  useEffect(() => {
    // 避免 SSR 问题
    if (typeof window === 'undefined') return

    const handleResize = () => {
      setWidth(window.innerWidth)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // 获取当前断点
  const getBreakpoint = (): Breakpoint => {
    if (width >= BREAKPOINTS['2xl']) return '2xl'
    if (width >= BREAKPOINTS.xl) return 'xl'
    if (width >= BREAKPOINTS.lg) return 'lg'
    if (width >= BREAKPOINTS.md) return 'md'
    return 'sm'
  }

  const breakpoint = getBreakpoint()

  // 判断是否小于指定断点
  const isBelow = (bp: Breakpoint): boolean => {
    return width < BREAKPOINTS[bp]
  }

  // 判断是否大于等于指定断点
  const isAbove = (bp: Breakpoint): boolean => {
    return width >= BREAKPOINTS[bp]
  }

  // 判断是否在指定范围内
  const isBetween = (min: Breakpoint, max: Breakpoint): boolean => {
    return width >= BREAKPOINTS[min] && width < BREAKPOINTS[max]
  }

  return {
    breakpoint,
    isBelow,
    isAbove,
    isBetween,
    isMobile: isBelow('md'),
    isTablet: isBetween('md', 'lg'),
    isDesktop: isAbove('lg'),
    width
  }
}

export default useBreakpoint
