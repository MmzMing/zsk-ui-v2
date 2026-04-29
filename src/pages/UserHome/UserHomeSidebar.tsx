/**
 * 右侧悬浮侧边栏（桌面端）
 * 作品筛选 Tab + 排序方式
 * 黑白风格，sticky 定位
 */

// ===== 1. 依赖导入区域 =====
// HeroUI 组件
import { Tabs, Tab, Select, SelectItem } from '@heroui/react'

// 类型定义
import type { UserHomeTypeFilter } from '@/hooks/useUserHome'

// ===== 2. Props 类型定义 =====
interface UserHomeSidebarProps {
  /** 当前筛选类型 */
  typeFilter: UserHomeTypeFilter
  /** 切换筛选类型回调 */
  onTypeChange: (type: UserHomeTypeFilter) => void
  /** 当前排序方式 */
  sortBy: SortBy
  /** 切换排序方式回调 */
  onSortChange: (sort: SortBy) => void
}

/** 排序方式类型 */
export type SortBy = 'latest' | 'mostViewed' | 'mostLiked'

/** 排序选项配置 */
const SORT_OPTIONS = [
  { key: 'latest', label: '最新发布' },
  { key: 'mostViewed', label: '最多浏览' },
  { key: 'mostLiked', label: '最多点赞' },
] as const

// ===== 8. UI渲染逻辑区域 =====
/**
 * 右侧悬浮侧边栏组件
 * 桌面端显示，移动端隐藏
 */
export default function UserHomeSidebar({
  typeFilter,
  onTypeChange,
  sortBy,
  onSortChange,
}: UserHomeSidebarProps) {
  return (
    <div className="space-y-6">
      {/* 作品筛选 Tab */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">作品筛选</h3>
        <Tabs
          selectedKey={typeFilter}
          onSelectionChange={(key) => onTypeChange(key as UserHomeTypeFilter)}
          variant="underlined"
          isVertical
          classNames={{
            tabList: 'gap-1 p-0',
            cursor: 'bg-foreground',
            tab: 'max-w-fit px-2 h-9 justify-start',
            tabContent: 'group-data-[selected=true]:text-foreground text-default-500',
          }}
        >
          <Tab key="all" title="全部" />
          <Tab key="note" title="笔记" />
          <Tab key="video" title="视频" />
        </Tabs>
      </div>

      {/* 排序方式 */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">排序方式</h3>
        <Select
          selectedKeys={[sortBy]}
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0] as SortBy
            if (selected) onSortChange(selected)
          }}
          variant="bordered"
          size="sm"
          classNames={{
            trigger: 'border-default-300 data-[hover=true]:border-foreground',
            value: 'text-sm text-foreground',
          }}
        >
          {SORT_OPTIONS.map((option) => (
            <SelectItem key={option.key}>{option.label}</SelectItem>
          ))}
        </Select>
      </div>
    </div>
  )
}
