/**
 * 悬浮目录导航（扁平列表 + 视口范围框）
 * - 无折叠，所有标题始终可见，按层级缩进
 * - 范围框起点锚定 activeId（scroll handler 驱动，实时可靠）
 *   终点延伸至 activeId 之后仍在视口中的连续标题（IO 辅助）
 * - 直接操作 DOM 更新范围框，零 React 重渲染
 * - wheel 事件隔离：悬停 TOC 时滚 TOC，触顶/底后才透传给页面
 */

// ===== 1. 依赖导入区域 =====
import { useEffect, useState, useCallback, useRef, memo } from 'react'
import { cn } from '@/utils'

// ===== 2. 类型定义区域 =====
export interface TocItem {
  id: string
  text: string
  level: number
}

interface FloatingTOCProps {
  items: TocItem[]
}

// ===== 3. 通用工具函数区域 =====
const INDENT_MAP: Record<number, string> = {
  1: 'pl-2',
  2: 'pl-5',
  3: 'pl-8',
  4: 'pl-11',
}

// ===== 4. 导出区域 =====
export default memo(function FloatingTOC({ items }: FloatingTOCProps) {
  const [activeId, setActiveId] = useState<string>('')

  const rafRef = useRef<number | null>(null)
  // 用 ref 同步 activeId，供 scroll handler 闭包中直接读取
  const lastActiveRef = useRef<string>('')
  const elementCacheRef = useRef<Map<string, HTMLElement>>(new Map())
  const tocListRef = useRef<HTMLUListElement>(null)
  const rangeBoxRef = useRef<HTMLDivElement>(null)
  const visibleSetRef = useRef<Set<string>>(new Set())
  // 保存最新 recalcRange 供 scroll handler 同步调用，避免闭包捕获旧值
  const recalcRangeRef = useRef<() => void>(() => {})

  // ===== 缓存标题 DOM 引用 =====
  const getCachedElement = useCallback((id: string): HTMLElement | null => {
    const cache = elementCacheRef.current
    const cached = cache.get(id)
    if (cached && cached.isConnected) return cached
    const el = document.getElementById(id)
    if (el) cache.set(id, el)
    return el
  }, [])

  /**
   * 范围框计算
   * 起点：lastActiveRef（activeId 对应的 TOC 条目）
   * 终点：从 activeId 向后，连续在 visibleSet 中的最后一个条目
   * scroll handler 更新 lastActiveRef 后立即调用此函数（通过 recalcRangeRef），
   * 避免等待 React 重渲染，消除滞后
   */
  const recalcRange = useCallback(() => {
    const rangeBox = rangeBoxRef.current
    const tocList = tocListRef.current
    const visible = visibleSetRef.current
    const currentActiveId = lastActiveRef.current

    const hide = () => { if (rangeBox) rangeBox.style.display = 'none' }

    if (!rangeBox || !tocList || !currentActiveId) { hide(); return }

    const activeIndex = items.findIndex((i) => i.id === currentActiveId)
    if (activeIndex === -1) { hide(); return }

    // 向后找连续可见标题的最后一项（遇到不可见立刻停止）
    let lastVisibleIndex = activeIndex
    for (let i = activeIndex + 1; i < items.length; i++) {
      if (visible.has(items[i].id)) {
        lastVisibleIndex = i
      } else {
        break
      }
    }

    const firstEl = tocList.querySelector<HTMLElement>(`[data-toc-id="${items[activeIndex].id}"]`)
    const lastEl = tocList.querySelector<HTMLElement>(`[data-toc-id="${items[lastVisibleIndex].id}"]`)
    if (!firstEl || !lastEl) { hide(); return }

    const listRect = tocList.getBoundingClientRect()
    const firstRect = firstEl.getBoundingClientRect()
    const lastRect = lastEl.getBoundingClientRect()

    // 转为滚动空间坐标，范围框随 <ul> 内容一起滚动
    const top = firstRect.top - listRect.top + tocList.scrollTop
    const height = lastRect.bottom - firstRect.top
    if (height <= 0) { hide(); return }

    rangeBox.style.display = 'block'
    rangeBox.style.top = `${top}px`
    rangeBox.style.height = `${height}px`
  }, [items])

  // 保持 ref 最新，供 scroll handler 同步调用
  useEffect(() => {
    recalcRangeRef.current = recalcRange
  }, [recalcRange])

  // ===== items 变化时清空缓存与可见集合 =====
  useEffect(() => {
    elementCacheRef.current.clear()
    visibleSetRef.current.clear()
    lastActiveRef.current = ''
    if (rangeBoxRef.current) rangeBoxRef.current.style.display = 'none'
  }, [items])

  // ===== IntersectionObserver：辅助追踪 activeId 之后的可见标题 =====
  useEffect(() => {
    if (items.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visibleSetRef.current.add(entry.target.id)
          } else {
            visibleSetRef.current.delete(entry.target.id)
          }
        }
        recalcRangeRef.current()
      },
      { rootMargin: '-80px 0px 0px 0px', threshold: 0 }
    )

    for (const item of items) {
      const el = document.getElementById(item.id)
      if (el) observer.observe(el)
    }

    return () => {
      observer.disconnect()
      visibleSetRef.current.clear()
    }
  }, [items])

  // ===== TOC 内部滚动时同步更新范围框位置 =====
  useEffect(() => {
    const tocList = tocListRef.current
    if (!tocList) return
    const onScroll = () => recalcRangeRef.current()
    tocList.addEventListener('scroll', onScroll, { passive: true })
    return () => tocList.removeEventListener('scroll', onScroll)
  }, [])

  // ===== 滚动隔离：由 data-lenis-prevent 属性交给 Lenis prevent 处理 =====

  // ===== 监听页面滚动，高亮最靠近顶部的已过标题 =====
  useEffect(() => {
    if (items.length === 0) return

    const handleScroll = () => {
      // 取消旧帧排新帧，保证每次用最新位置，不漏帧
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null

        let bestId = ''
        let bestOffset = -Infinity
        const offsetTop = 120

        for (const item of items) {
          const el = getCachedElement(item.id)
          if (!el) continue
          const top = el.getBoundingClientRect().top - offsetTop
          if (top <= 0 && top > bestOffset) {
            bestOffset = top
            bestId = item.id
          }
        }

        if (!bestId) {
          for (const item of items) {
            if (getCachedElement(item.id)) { bestId = item.id; break }
          }
        }

        if (bestId && bestId !== lastActiveRef.current) {
          lastActiveRef.current = bestId
          setActiveId(bestId)
          // activeId 变化后立即同步重算范围框，不等 React 重渲染
          recalcRangeRef.current()
        }
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [items, getCachedElement])

  // ===== 活跃项变化时仅滚动 TOC 列表，不触发 window 滚动 =====
  useEffect(() => {
    if (!activeId || !tocListRef.current) return
    const list = tocListRef.current
    const el = list.querySelector<HTMLElement>(`[data-toc-id="${activeId}"]`)
    if (!el) return

    const listRect = list.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()
    if (elRect.top >= listRect.top && elRect.bottom <= listRect.bottom) return

    list.scrollTo({
      top: list.scrollTop + elRect.top - listRect.top - list.clientHeight / 2 + elRect.height / 2,
      behavior: 'smooth',
    })
  }, [activeId])

  // ===== 点击跳转 =====
  const handleClick = useCallback((id: string) => {
    const el = getCachedElement(id)
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY - 80
    window.scrollTo({ top, behavior: 'smooth' })
  }, [getCachedElement])

  if (items.length === 0) return null

  return (
    <nav className="w-52 shrink-0">
      <div className="sticky top-20">
        {/* 目录标题 */}
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-default-100">
          <div className="w-0.5 h-3.5 bg-primary rounded-full shrink-0" />
          <h4 className="text-xs font-semibold text-default-500 uppercase tracking-widest">
            目录
          </h4>
        </div>

        {/* 目录列表，限高 50vh，范围框在 <ul> 内部随内容滚动 */}
        <ul
          ref={tocListRef}
          data-lenis-prevent
          className={cn(
            'relative space-y-0.5',
            'max-h-[50vh] overflow-y-auto overscroll-contain',
            '[&::-webkit-scrollbar]:w-1',
            '[&::-webkit-scrollbar-thumb]:rounded-full',
            '[&::-webkit-scrollbar-thumb]:bg-default-200',
            '[&::-webkit-scrollbar-track]:bg-transparent'
          )}
        >
          {/*
           * 范围框放在 <ul> 内部，用滚动空间坐标定位
           * transition 让起止点变化时平滑过渡
           */}
          <div
            ref={rangeBoxRef}
            aria-hidden="true"
            className="absolute left-0 right-1 z-0 rounded-md pointer-events-none border border-black/10 bg-black/5 dark:border-white/10 dark:bg-white/5"
            style={{
              display: 'none',
              top: 0,
              height: 0,
              transition: 'top 0.3s cubic-bezier(0.4,0,0.2,1), height 0.3s cubic-bezier(0.4,0,0.2,1)',
            }}
          />

          {items.map((item) => (
            <li key={item.id}>
              <button
                data-toc-id={item.id}
                className={cn(
                  'relative z-10 w-full text-left text-xs leading-relaxed py-1.5 pr-2 rounded',
                  'transition-colors duration-150 truncate',
                  INDENT_MAP[item.level] ?? 'pl-2',
                  activeId === item.id
                    ? 'text-primary font-medium'
                    : 'text-default-400 hover:text-default-600'
                )}
                onClick={() => handleClick(item.id)}
              >
                {item.text}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
})
