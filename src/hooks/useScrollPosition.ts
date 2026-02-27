/**
 * useScrollPosition - 滚动位置监听 Hook
 * 返回当前滚动位置和是否已滚动的状态
 */

import { useState, useEffect, useCallback, useRef } from 'react'

interface ScrollPosition {
  /** 当前滚动 Y 位置 */
  scrollY: number
  /** 是否已滚动（超过阈值） */
  isScrolled: boolean
  /** 滚动方向：up | down | null */
  direction: 'up' | 'down' | null
}

interface UseScrollPositionOptions {
  /** 触发 isScrolled 的滚动阈值（像素） */
  threshold?: number
  /** 是否启用节流 */
  throttle?: boolean
  /** 节流间隔（毫秒） */
  throttleMs?: number
}

export function useScrollPosition(options: UseScrollPositionOptions = {}): ScrollPosition {
  const { threshold = 50, throttle = true } = options

  const [scrollPosition, setScrollPosition] = useState<ScrollPosition>({
    scrollY: 0,
    isScrolled: false,
    direction: null
  })

  const lastScrollY = useRef(0)
  const ticking = useRef(false)

  const updateScrollPosition = useCallback(() => {
    const currentScrollY = window.scrollY
    const direction = currentScrollY > lastScrollY.current ? 'down' : currentScrollY < lastScrollY.current ? 'up' : null

    setScrollPosition({
      scrollY: currentScrollY,
      isScrolled: currentScrollY > threshold,
      direction
    })

    lastScrollY.current = currentScrollY
    ticking.current = false
  }, [threshold])

  useEffect(() => {
    const handleScroll = () => {
      if (throttle) {
        if (!ticking.current) {
          window.requestAnimationFrame(() => {
            updateScrollPosition()
          })
          ticking.current = true
        }
      } else {
        updateScrollPosition()
      }
    }

    // 初始化时检查一次
    updateScrollPosition()

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [throttle, updateScrollPosition])

  return scrollPosition
}

export default useScrollPosition
