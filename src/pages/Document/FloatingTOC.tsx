/**
 * 悬浮目录导航
 * 从 Markdown 渲染后的 DOM 中提取 h1-h4 标题
 * 支持高亮当前阅读位置、点击跳转
 * 已优化：使用 scroll 事件 + 节流替代 IntersectionObserver，减少长文档下的回调频率
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
 * 使用 scroll 事件 + 节流计算当前阅读位置
 * 避免 IntersectionObserver 在大量标题元素下的性能问题
 */
export default memo(function FloatingTOC({ items }: FloatingTOCProps) {
  const [activeId, setActiveId] = useState<string>('')
  const rafRef = useRef<number | null>(null)
  const lastActiveRef = useRef<string>('')

  // 监听滚动高亮当前标题
  useEffect(() => {
    if (items.length === 0) return

    const handleScroll = () => {
      if (rafRef.current) return
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null

        // 找到当前视口内最靠近顶部的标题
        let bestId = ''
        let bestOffset = -Infinity
        const offsetTop = 120 // 导航栏高度偏移

        for (const item of items) {
          const el = document.getElementById(item.id)
          if (!el) continue
          const rect = el.getBoundingClientRect()
          const offset = rect.top - offsetTop
          // 选择：在视口上方或刚好进入视口的最后一个标题
          if (offset <= 0 && offset > bestOffset) {
            bestOffset = offset
            bestId = item.id
          }
        }

        // 如果所有标题都在视口下方，取第一个
        if (!bestId && items.length > 0) {
          for (const item of items) {
            const el = document.getElementById(item.id)
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
    handleScroll() // 初始化

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [items])

  // 点击跳转
  const handleClick = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  if (items.length === 0) return null

  return (
    <nav className="hidden md:block w-48 shrink-0">
      <div className="sticky top-20">
        <h4 className="text-xs font-semibold text-default-400 uppercase tracking-wider mb-3">
          目录
        </h4>
        <ul className="space-y-1 border-l border-default-200">
          {items.map((item) => (
            <li key={item.id}>
              <button
                className={cn(
                  'block w-full text-left text-xs leading-relaxed py-1 transition-colors',
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
