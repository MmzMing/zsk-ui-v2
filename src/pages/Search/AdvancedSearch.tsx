/**
 * 高级搜索筛选栏
 * - 顶部水平栏：左侧主排序 Tabs（默认/最新/最热），右侧"更多筛选"按钮
 * - 展开后手风琴显示两层：时长、分类（均使用 Aceternity Tabs）
 * - 视图模式（卡片/列表）单独放在右侧切换按钮
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, LayoutGrid, List, SlidersHorizontal } from 'lucide-react'
import { Tabs as AceternityTabs } from '@/components/ui/aceternity/tabs'
import { cn } from '@/utils'
import type { SearchDuration, SearchSort, SearchView } from '@/types/search.types'

interface AdvancedSearchProps {
  sort: SearchSort
  duration: SearchDuration
  category: string
  view: SearchView
  onSortChange: (sort: SearchSort) => void
  onDurationChange: (duration: SearchDuration) => void
  onCategoryChange: (category: string) => void
  onViewChange: (view: SearchView) => void
}

const SORT_TABS = [
  { title: '默认', value: '' as SearchSort },
  { title: '最新', value: 'latest' as SearchSort },
  { title: '最热', value: 'hot' as SearchSort },
]

const DURATION_TABS = [
  { title: '全部时长', value: '' as SearchDuration },
  { title: '一周内', value: 'week' as SearchDuration },
  { title: '一个月', value: 'month' as SearchDuration },
  { title: '一年内', value: 'year' as SearchDuration },
]

const CATEGORY_TABS = [
  { title: '全部分类', value: '' },
  { title: '技术', value: 'tech' },
  { title: '生活', value: 'life' },
  { title: '学习', value: 'study' },
  { title: '工具', value: 'tool' },
  { title: '其他', value: 'other' },
]

export function AdvancedSearch({
  sort,
  duration,
  category,
  view,
  onSortChange,
  onDurationChange,
  onCategoryChange,
  onViewChange,
}: AdvancedSearchProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="flex flex-col">
      {/* 顶部水平栏：左侧排序 Tabs + 右侧 视图 / 更多筛选 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <AceternityTabs
          tabs={SORT_TABS}
          activeValue={sort}
          onValueChange={(v) => onSortChange(v as SearchSort)}
          containerClassName="w-auto"
          tabClassName="text-sm font-medium text-default-700 dark:text-default-300"
          activeTabClassName="bg-default-800 text-white dark:bg-default-100 dark:text-default-900"
          layoutIdNamespace="search-sort-pill"
        />

        <div className="flex items-center gap-2">
          {/* 视图切换 */}
          <div className="inline-flex overflow-hidden rounded-full p-0.5">
            {(
              [
                { key: 'card', label: '卡片', icon: <LayoutGrid className="h-4 w-4" /> },
                { key: 'list', label: '列表', icon: <List className="h-4 w-4" /> },
              ] as const
            ).map((opt) => {
              const active = view === opt.key
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => onViewChange(opt.key)}
                  className={cn(
                    'relative flex items-center gap-1 rounded-full px-3 py-1.5 text-sm transition-colors',
                    active ? 'text-white dark:text-default-900' : 'text-default-700 dark:text-default-300 hover:text-default-900 dark:hover:text-default-100'
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="search-view-pill"
                      className="absolute inset-0 rounded-full bg-default-800 dark:bg-default-100"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.45 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1">
                    {opt.icon}
                    {opt.label}
                  </span>
                </button>
              )
            })}
          </div>

          {/* 更多筛选按钮 */}
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
              expanded
                ? 'bg-default-800 text-white dark:bg-default-100 dark:text-default-900'
                : 'text-default-700 dark:text-default-300 hover:text-default-900 dark:hover:text-default-100'
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
            更多筛选
            <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="h-4 w-4" />
            </motion.span>
          </button>
        </div>
      </div>

      {/* 手风琴：时长 + 分类 */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="advanced-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div className="flex flex-col gap-3 pt-3">
              <AceternityTabs
                tabs={DURATION_TABS}
                activeValue={duration}
                onValueChange={(v) => onDurationChange(v as SearchDuration)}
                containerClassName="w-auto"
                tabClassName="text-sm text-default-700 dark:text-default-300"
                activeTabClassName="bg-default-800 text-white dark:bg-default-100 dark:text-default-900"
                layoutIdNamespace="search-duration-pill"
              />
              <AceternityTabs
                tabs={CATEGORY_TABS}
                activeValue={category}
                onValueChange={(v) => onCategoryChange(v)}
                containerClassName="w-auto"
                tabClassName="text-sm text-default-700 dark:text-default-300"
                activeTabClassName="bg-default-800 text-white dark:bg-default-100 dark:text-default-900"
                layoutIdNamespace="search-category-pill"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
