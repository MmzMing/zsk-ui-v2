/**
 * 搜索懒加载 Hook
 * - 入参变化（关键字/类型/排序/分类）→ 重置并加载首批
 * - loadMore() 触发追加下一批
 * - 维护状态机：idle / loading / loadingMore / done / error
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { searchAll } from '@/api/search'
import type { SearchDuration, SearchItem, SearchSort, SearchType } from '@/types/search.types'

export type SearchStatus = 'idle' | 'loading' | 'loadingMore' | 'done' | 'error'

interface InfiniteSearchInput {
  keyword: string
  type: SearchType
  sort: SearchSort
  category: string
  duration: SearchDuration
  pageSize?: number
}

interface InfiniteSearchResult {
  items: SearchItem[]
  total: number
  status: SearchStatus
  error: string | null
  hasMore: boolean
  loadMore: () => void
  retry: () => void
}

const DEFAULT_PAGE_SIZE = 20

export function useInfiniteSearch(input: InfiniteSearchInput): InfiniteSearchResult {
  const { keyword, type, sort, category, duration, pageSize = DEFAULT_PAGE_SIZE } = input

  const [items, setItems] = useState<SearchItem[]>([])
  const [total, setTotal] = useState(0)
  const [status, setStatus] = useState<SearchStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  // 用 ref 保存最新页码与请求标识，避免闭包陈旧
  const pageNumRef = useRef(1)
  const requestIdRef = useRef(0)

  const fetchPage = useCallback(
    async (pageNum: number, reset: boolean) => {
      const reqId = ++requestIdRef.current
      setStatus(reset ? 'loading' : 'loadingMore')
      setError(null)
      try {
        const result = await searchAll({
          keyword,
          type,
          sort,
          category,
          duration,
          pageNum,
          pageSize,
        })

        // 已被新请求覆盖
        if (reqId !== requestIdRef.current) return

        const list = result?.list ?? []
        const totalCount = result?.total ?? 0

        let nextLoaded = 0
        setItems((prev) => {
          const merged = reset ? list : [...prev, ...list]
          nextLoaded = merged.length
          return merged
        })
        setTotal(totalCount)
        pageNumRef.current = pageNum
        setStatus(nextLoaded >= totalCount || list.length === 0 ? 'done' : 'idle')
      } catch (err) {
        if (reqId !== requestIdRef.current) return
        const msg = err instanceof Error ? err.message : '搜索失败'
        console.error('全站搜索请求失败：', err)
        setError(msg)
        setStatus('error')
      }
    },
    [keyword, type, sort, category, duration, pageSize]
  )

  // 入参变化时重置加载首批
  useEffect(() => {
    pageNumRef.current = 1
    setItems([])
    setTotal(0)
    fetchPage(1, true)
  }, [fetchPage])

  const loadMore = useCallback(() => {
    if (status === 'loading' || status === 'loadingMore' || status === 'done') return
    fetchPage(pageNumRef.current + 1, false)
  }, [status, fetchPage])

  const retry = useCallback(() => {
    if (items.length === 0) {
      fetchPage(1, true)
    } else {
      fetchPage(pageNumRef.current + 1, false)
    }
  }, [fetchPage, items.length])

  const hasMore = status !== 'done' && items.length < total

  return { items, total, status, error, hasMore, loadMore, retry }
}
