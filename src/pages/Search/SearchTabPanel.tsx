/**
 * 一体化的 TabPanel：AdvancedSearch（高级搜索栏）+ ResultStream
 * 切换 Tab 时整块替换
 */

import { AdvancedSearch } from './AdvancedSearch'
import { ResultStream } from './ResultStream'
import { useInfiniteSearch } from './useInfiniteSearch'
import type { SearchDuration, SearchSort, SearchType, SearchView } from '@/types/search.types'

interface SearchTabPanelProps {
  type: SearchType
  keyword: string
  sort: SearchSort
  category: string
  duration: SearchDuration
  view: SearchView
  onSortChange: (sort: SearchSort) => void
  onCategoryChange: (category: string) => void
  onDurationChange: (duration: SearchDuration) => void
  onViewChange: (view: SearchView) => void
}

export function SearchTabPanel({
  type,
  keyword,
  sort,
  category,
  duration,
  view,
  onSortChange,
  onCategoryChange,
  onDurationChange,
  onViewChange,
}: SearchTabPanelProps) {
  const { items, total, status, error, hasMore, loadMore, retry } = useInfiniteSearch({
    keyword,
    type,
    sort,
    category,
    duration,
  })

  return (
    <div className="flex flex-col gap-4">
      <AdvancedSearch
        sort={sort}
        duration={duration}
        category={category}
        view={view}
        onSortChange={onSortChange}
        onDurationChange={onDurationChange}
        onCategoryChange={onCategoryChange}
        onViewChange={onViewChange}
      />

      <ResultStream
        items={items}
        total={total}
        status={status}
        error={error}
        hasMore={hasMore}
        keyword={keyword}
        view={view}
        onLoadMore={loadMore}
        onRetry={retry}
      />
    </div>
  )
}
