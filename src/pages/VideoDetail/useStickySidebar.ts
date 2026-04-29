/**
 * 高性能自定义 sticky 侧边栏 Hook
 * 使用 requestAnimationFrame + getBoundingClientRect 实现精确的跟随滚动
 * 行为：元素初始在文档流中，当触碰到视窗顶部时固定，跟随滚动
 */

import { useState, useEffect, useRef, useCallback } from 'react'

interface StickyState {
  /** 是否处于固定状态 */
  isFixed: boolean
  /** 占位元素高度 */
  placeholderHeight: number
  /** 容器在文档流中的 left 位置 */
  containerLeft: number
  /** 容器在文档流中的宽度 */
  containerWidth: number
}

interface UseStickySidebarOptions {
  /** 距离视窗顶部的偏移量（默认 80px） */
  offsetTop?: number
}

/**
 * 使用 requestAnimationFrame 实现高性能 sticky 行为
 * 通过 getBoundingClientRect 精确计算位置，避免 IntersectionObserver 的边界问题
 */
export function useStickySidebar(options: UseStickySidebarOptions = {}) {
  const { offsetTop = 80 } = options
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<StickyState>({
    isFixed: false,
    placeholderHeight: 0,
    containerLeft: 0,
    containerWidth: 0,
  })

  // 使用 ref 避免闭包问题
  const rafIdRef = useRef<number>(0)
  const lastStateRef = useRef(false)

  const checkPosition = useCallback(() => {
    const container = containerRef.current
    const content = contentRef.current
    if (!container || !content) return

    const rect = container.getBoundingClientRect()
    const shouldFix = rect.top <= offsetTop

    // 只在状态变化时更新，避免不必要的重渲染
    if (shouldFix !== lastStateRef.current) {
      lastStateRef.current = shouldFix

      if (shouldFix) {
        setState({
          isFixed: true,
          placeholderHeight: content.offsetHeight,
          containerLeft: rect.left,
          containerWidth: rect.width,
        })
      } else {
        setState({
          isFixed: false,
          placeholderHeight: 0,
          containerLeft: 0,
          containerWidth: 0,
        })
      }
    }
  }, [offsetTop])

  useEffect(() => {
    // 使用 requestAnimationFrame 实现平滑的滚动检测
    const handleScroll = () => {
      if (rafIdRef.current) return
      rafIdRef.current = requestAnimationFrame(() => {
        checkPosition()
        rafIdRef.current = 0
      })
    }

    // 初始化检测一次
    checkPosition()

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current)
      }
    }
  }, [checkPosition])

  return { containerRef, contentRef, state }
}
