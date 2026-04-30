/**
 * 悬浮目录导航
 * 从 Markdown 渲染后的 DOM 中提取 h1-h4 标题
 * 支持高亮当前阅读位置、点击跳转
 * 已优化：缓存 DOM 引用避免每帧 getElementById，scroll + RAF 节流
 */

// ===== 1. 依赖导入区域 =====
// React 核心
import { useEffect, useState, useCallback, useRef, memo } from 'react'

// 工具函数
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

// ===== 3. 导出区域 =====
/**
 * 悬浮目录导航组件
 * 使用 scroll 事件 + RAF 节流计算当前阅读位置
 * 缓存 DOM 引用，避免每帧重复 getElementById 查询
 */
export default memo(function FloatingTOC({ items }: FloatingTOCProps) {
  const [activeId, setActiveId] = useState<string>('')
  const rafRef = useRef<number | null>(null)
  const lastActiveRef = useRef<string>('')
  const elementCacheRef = useRef<Map<string, HTMLElement>>(new Map())

  // 缓存标题 DOM 引用，避免每帧 getElementById
  const getCachedElement = useCallback((id: string): HTMLElement | null => {
    const cache = elementCacheRef.current
    const cached = cache.get(id)
    if (cached && cached.isConnected) return cached
    const el = document.getElementById(id)
    if (el) cache.set(id, el)
    return el
  }, [])

  // items 变化时清空缓存（文档内容切换）
  useEffect(() => {
    elementCacheRef.current.clear()
  }, [items])

  // 监听滚动高亮当前标题
  useEffect(() => {
    if (items.length === 0) return

    const handleScroll = () => {
      if (rafRef.current) return
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null

        let bestId = ''
        let bestOffset = -Infinity
        const offsetTop = 120

        for (const item of items) {
          const el = getCachedElement(item.id)
          if (!el) continue
          const rect = el.getBoundingClientRect()
          const offset = rect.top - offsetTop
          if (offset <= 0 && offset > bestOffset) {
            bestOffset = offset
            bestId = item.id
          }
        }

        if (!bestId && items.length > 0) {
          for (const item of items) {
            const el = getCachedElement(item.id)
            if (el) {
              bestId = item.id
              break
            }
          }
        }

        if (bestId && bestId !== lastActiveRef.current) {
          lastActiveRef.current = bestId
          setActiveId(bestId)
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

  // 点击跳转
  const handleClick = useCallback((id: string) => {
    const el = getCachedElement(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }, [getCachedElement])

  if (items.length === 0) return null

  return (
    <nav className="hidden md:block w-48 shrink-0">
      <div className="sticky top-20">
        <h4 className="text-sm font-semibold text-default-600 uppercase tracking-wider mb-3">
          目录
        </h4>
        <ul className="space-y-1 border-l border-default-200">
          {items.map((item) => (
            <li key={item.id}>
              <button
                className={cn(
                  'block w-full text-left text-sm leading-relaxed py-1.5 transition-colors',
                  item.level === 1 && 'pl-3',
                  item.level === 2 && 'pl-5',
                  item.level === 3 && 'pl-7',
                  item.level === 4 && 'pl-9',
                  activeId === item.id
                    ? 'text-primary font-medium border-l-2 border-primary -ml-px'
                    : 'text-default-400 hover:text-default-600'
                )}
                onClick={() => handleClick(item.id)}
              >
                <span className="line-clamp-2">{item.text}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
})
