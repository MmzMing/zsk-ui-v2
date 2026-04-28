/**
 * 搜索页 URL 状态 Hook
 * 用 useSearchParams 作为唯一数据源，封装读写工具
 */

import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { SearchDuration, SearchSort, SearchType, SearchView } from '@/types/search.types'

export interface SearchQueryState {
  keyword: string
  type: SearchType
  sort: SearchSort
  category: string
  duration: SearchDuration
  view: SearchView
}

const DEFAULT_STATE: SearchQueryState = {
  keyword: '',
  type: 'all',
  sort: '',
  category: '',
  duration: '',
  view: 'card',
}

const VALID_TYPES: SearchType[] = ['all', 'video', 'document']
const VALID_SORTS: SearchSort[] = ['hot', 'latest', '']
const VALID_DURATIONS: SearchDuration[] = ['', 'week', 'month', 'year']
const VALID_VIEWS: SearchView[] = ['card', 'list']

/**
 * 搜索页 URL 状态读写
 */
export function useSearchQuery() {
  const [params, setParams] = useSearchParams()

  const state: SearchQueryState = useMemo(() => {
    const rawType = params.get('type') as SearchType | null
    const rawSort = params.get('sort') as SearchSort | null
    const rawDuration = params.get('duration') as SearchDuration | null
    const rawView = (params.get('view') as SearchView | null) ?? 'card'

    return {
      keyword: params.get('keyword') ?? DEFAULT_STATE.keyword,
      type: rawType && VALID_TYPES.includes(rawType) ? rawType : 'all',
      sort: rawSort && VALID_SORTS.includes(rawSort) ? rawSort : '',
      category: params.get('category') ?? '',
      duration: rawDuration && VALID_DURATIONS.includes(rawDuration) ? rawDuration : '',
      view: rawView && VALID_VIEWS.includes(rawView) ? rawView : 'card',
    }
  }, [params])

  /** 部分更新 URL 状态 */
  const update = useCallback(
    (patch: Partial<SearchQueryState>) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          ;(Object.keys(patch) as Array<keyof SearchQueryState>).forEach((key) => {
            const value = patch[key]
            if (value === undefined || value === null || value === '' || value === DEFAULT_STATE[key]) {
              next.delete(key)
            } else {
              next.set(key, String(value))
            }
          })
          return next
        },
        { replace: true }
      )
    },
    [setParams]
  )

  return { state, update }
}
