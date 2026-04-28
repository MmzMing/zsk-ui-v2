/**
 * 悬浮目录导航
 * 从 Markdown 渲染后的 DOM 中提取 h1-h4 标题
 * 支持高亮当前阅读位置、点击跳转
 */

import { useEffect, useState, useCallback } from 'react'
import { cn } from '@/utils'

export interface TocItem {
  id: string
  text: string
  level: number
}

interface Props {
  items: TocItem[]
}

export default function FloatingTOC({ items }: Props) {
  const [activeId, setActiveId] = useState<string>('')

  // 监听滚动高亮当前标题
  useEffect(() => {
    if (items.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((e) => e.isIntersecting)
        if (visibleEntries.length > 0) {
          setActiveId(visibleEntries[0].target.id)
        }
      },
      { rootMargin: '-80px 0px -60% 0px' }
    )

    items.forEach((item) => {
      const el = document.getElementById(item.id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
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
}
