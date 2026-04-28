/**
 * 结果流：虚拟列表 + IntersectionObserver 懒加载
 * 卡片视图按行虚拟化（响应式列数），列表视图按行虚拟化
 */

import { useEffect, useMemo, useRef } from 'react'
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
  const cols = useRef(1)
  if (typeof window === 'undefined') return 1
  if (view === 'list') return 1
  const w = window.innerWidth
  cols.current = w >= 1280 ? 4 : w >= 1024 ? 3 : w >= 640 ? 2 : 1
  return cols.current
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
  const parentRef = useRef<HTMLDivElement>(null)
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

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => (view === 'list' ? LIST_ROW_HEIGHT : CARD_ROW_HEIGHT),
    overscan: 4,
  })

  // 视图切换或数据变化时重新测量
  useEffect(() => {
    rowVirtualizer.measure()
  }, [view, items.length, rowVirtualizer])

  // IntersectionObserver 哨兵
  useEffect(() => {
    if (!sentinelRef.current || !parentRef.current) return
    const node = sentinelRef.current
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry.isIntersecting && hasMore && status !== 'loading' && status !== 'loadingMore') {
          onLoadMore()
        }
      },
      { root: parentRef.current, rootMargin: '600px 0px 600px 0px' }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [hasMore, status, onLoadMore])

  // 首屏加载
  if (status === 'loading' && items.length === 0) {
    return (
      <div
        className={
          view === 'list'
            ? 'flex flex-col gap-2'
            : 'grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
        }
      >
        {Array.from({ length: view === 'list' ? 6 : 8 }).map((_, idx) => (
          <div
            key={idx}
            className={
              view === 'list'
                ? 'h-[100px] w-full animate-pulse rounded-xl bg-default-100'
                : 'aspect-[4/5] w-full animate-pulse rounded-2xl bg-default-100'
            }
          />
        ))}
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

      <div
        ref={parentRef}
        role="list"
        className="relative overflow-y-auto rounded-2xl"
        style={{ maxHeight: 'calc(100vh - 320px)' }}
      >
        <div
          style={{
            height: rowVirtualizer.getTotalSize(),
            width: '100%',
            position: 'relative',
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
        </div>

        {/* 哨兵 */}
        <div ref={sentinelRef} className="h-px w-full" />

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
    </div>
  )
}
