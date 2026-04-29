/**
 * 结果流：页面级虚拟列表 + IntersectionObserver 懒加载
 * 类似B站：整个页面滚动，而非容器内滚动
 * 卡片视图按行虚拟化（响应式列数），列表视图按行虚拟化
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Spinner } from '@heroui/react'
import { ResultCard } from './ResultCard'
import { ResultRow } from './ResultRow'
import { EmptyState } from './EmptyState'
import type { SearchItem, SearchView } from '@/types/search.types'
import type { SearchStatus } from './useInfiniteSearch'

interface ResultStreamProps {
  items: SearchItem[]
  total: number
  status: SearchStatus
  error: string | null
  hasMore: boolean
  keyword: string
  view: SearchView
  onLoadMore: () => void
  onRetry: () => void
}

/**
 * 根据视口宽度返回卡片视图列数
 */
function useColumnCount(view: SearchView): number {
  const [columnCount, setColumnCount] = useState(1)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (view === 'list') {
      setColumnCount(1)
      return
    }

    const update = () => {
      const w = window.innerWidth
      setColumnCount(w >= 1280 ? 4 : w >= 1024 ? 3 : w >= 640 ? 2 : 1)
    }

    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [view])

  return columnCount
}

const CARD_ROW_HEIGHT = 304
const LIST_ROW_HEIGHT = 100

export function ResultStream({
  items,
  total,
  status,
  error,
  hasMore,
  keyword,
  view,
  onLoadMore,
  onRetry,
}: ResultStreamProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const columnCount = useColumnCount(view)

  // 卡片视图：按行分块；列表视图：每条一行
  const rows: SearchItem[][] = useMemo(() => {
    if (view === 'list') return items.map((it) => [it])
    const result: SearchItem[][] = []
    for (let i = 0; i < items.length; i += columnCount) {
      result.push(items.slice(i, i + columnCount))
    }
    return result
  }, [items, view, columnCount])

  // 页面级虚拟列表：滚动元素为 window
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => window.document.documentElement,
    estimateSize: () => (view === 'list' ? LIST_ROW_HEIGHT : CARD_ROW_HEIGHT),
    overscan: 4,
  })

  // 视图切换或数据变化时重新测量
  useEffect(() => {
    rowVirtualizer.measure()
  }, [view, items.length, rowVirtualizer])

  // IntersectionObserver 哨兵 —— 页面级滚动，root 为 null（视口）
  useEffect(() => {
    if (!sentinelRef.current) return
    const node = sentinelRef.current
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry.isIntersecting && hasMore && status !== 'loading' && status !== 'loadingMore') {
          onLoadMore()
        }
      },
      { root: null, rootMargin: '800px 0px 800px 0px' }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [hasMore, status, onLoadMore])

  // 首屏加载骨架屏 —— 与真实卡片/列表尺寸对齐
  if (status === 'loading' && items.length === 0) {
    const count = view === 'list' ? 6 : 8
    return (
      <div
        className={
          view === 'list'
            ? 'flex flex-col gap-2'
            : 'grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
        }
      >
        {Array.from({ length: count }).map((_, idx) =>
          view === 'list' ? (
            // 列表视图骨架：与 ResultRow 对齐（h-[90px] + padding）
            <div key={idx} className="flex gap-3 p-3">
              <div className="h-[90px] w-40 flex-shrink-0 animate-pulse rounded-lg bg-default-100" />
              <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
                <div className="h-4 w-3/4 animate-pulse rounded bg-default-100" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-default-100" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-default-100" />
              </div>
            </div>
          ) : (
            // 卡片视图骨架：与 ResultCard 对齐（aspect-video + 文字区域）
            <div key={idx} className="flex flex-col gap-2">
              <div className="aspect-video w-full animate-pulse rounded-2xl bg-default-100" />
              <div className="flex flex-col gap-2 pt-2">
                <div className="h-4 w-full animate-pulse rounded bg-default-100" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-default-100" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-default-100" />
              </div>
            </div>
          )
        )}
      </div>
    )
  }

  // 错误
  if (status === 'error' && items.length === 0) {
    return <EmptyState variant="error" message={error ?? undefined} onRetry={onRetry} />
  }

  // 空结果
  if (items.length === 0 && status === 'done') {
    return <EmptyState variant="empty" keyword={keyword} />
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="text-xs text-default-500">
        共 <span className="font-semibold text-default-900">{total}</span> 条结果
        {keyword && (
          <>
            ，关键字「<span className="font-semibold text-default-900">{keyword}</span>」
          </>
        )}
      </div>

      {/* 虚拟列表容器：无固定高度，随内容自然撑开 */}
      <div
        ref={containerRef}
        role="list"
        className="relative"
        style={{
          height: rowVirtualizer.getTotalSize(),
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const row = rows[virtualRow.index]
          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={rowVirtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
              className="pb-2"
            >
              {view === 'list' ? (
                <ResultRow item={row[0]} keyword={keyword} />
              ) : (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {row.map((it) => (
                    <ResultCard key={it.id} item={it} keyword={keyword} />
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {/* 哨兵：用于触发懒加载 */}
        <div
          ref={sentinelRef}
          className="h-px w-full"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
          }}
        />
      </div>

      {/* 底部状态栏 */}
      <div className="flex items-center justify-center gap-2 py-4 text-xs text-default-500">
        {status === 'loadingMore' && (
          <>
            <Spinner size="sm" /> 加载更多…
          </>
        )}
        {status === 'error' && items.length > 0 && (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-md border border-default-300 px-3 py-1 text-default-600 hover:bg-default-100"
          >
            加载失败，点击重试
          </button>
        )}
        {!hasMore && status === 'done' && items.length > 0 && <span>已经到底啦 ~</span>}
      </div>
    </div>
  )
}
