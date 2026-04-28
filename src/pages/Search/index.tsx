/**
 * 全站搜索页（前台）
 *
 * 结构：SearchHero → AnimatedTabs → TabPanel(FilterAccordion + ResultStream)
 * 状态：URL Query 单一数据源（keyword / type / sort / category / view）
 * 数据：无分页，虚拟列表 + IntersectionObserver 懒加载
 */

import { AnimatePresence } from 'framer-motion'
import { Tabs as AceternityTabs } from '@/components/ui/aceternity/tabs'
import { SearchHero } from './SearchHero'
import { SearchTabPanel } from './SearchTabPanel'
import { useSearchQuery } from './useSearchQuery'
import type { SearchType } from '@/types/search.types'

const TAB_ITEMS: { title: string; value: SearchType }[] = [
  { title: '全部', value: 'all' },
  { title: '视频', value: 'video' },
  { title: '文档', value: 'document' },
]

export default function SearchPage() {
  const { state, update } = useSearchQuery()

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
      <SearchHero
        keyword={state.keyword}
        onSubmit={(next) => update({ keyword: next })}
      />

      <div className="flex justify-center">
        <AceternityTabs
          tabs={TAB_ITEMS}
          activeValue={state.type}
          onValueChange={(value) => update({ type: value as SearchType })}
          containerClassName="w-auto"
          activeTabClassName="bg-default-800 text-white dark:bg-default-100 dark:text-default-900"
          tabClassName="text-sm font-medium text-default-700 dark:text-default-300"
          layoutIdNamespace="search-type-pill"
        />
      </div>

      <AnimatePresence mode="wait">
        <SearchTabPanel
          key={state.type}
          type={state.type}
          keyword={state.keyword}
          sort={state.sort}
          category={state.category}
          duration={state.duration}
          view={state.view}
          onSortChange={(sort) => update({ sort })}
          onCategoryChange={(category) => update({ category })}
          onDurationChange={(duration) => update({ duration })}
          onViewChange={(view) => update({ view })}
        />
      </AnimatePresence>
    </div>
  )
}
