/**
 * 作品类型筛选栏
 * 全部 / 笔记 / 视频 Tab 切换
 * 黑白风格，使用 HeroUI Tabs 组件
 */

// ===== 1. 依赖导入区域 =====
// HeroUI 组件
import { Tabs, Tab, Chip } from '@heroui/react'

// 类型定义
import type { UserHomeTypeFilter } from '@/hooks/useUserHome'

// ===== 2. Props 类型定义 =====
interface UserWorksFilterProps {
  /** 当前筛选类型 */
  typeFilter: UserHomeTypeFilter
  /** 切换筛选类型回调 */
  onTypeChange: (type: UserHomeTypeFilter) => void
  /** 作品总数 */
  total: number
}

// ===== 8. UI渲染逻辑区域 =====
/**
 * 作品类型筛选栏组件
 * 使用 HeroUI Tabs，黑白风格
 */
export default function UserWorksFilter({
  typeFilter,
  onTypeChange,
  total,
}: UserWorksFilterProps) {
  return (
    <section className="flex items-center gap-4 py-4">
      {/* 筛选 Tab */}
      <Tabs
        selectedKey={typeFilter}
        onSelectionChange={(key) => onTypeChange(key as UserHomeTypeFilter)}
        variant="underlined"
        classNames={{
          tabList:
            'gap-4 w-full relative rounded-none p-0 border-b border-default-200',
          cursor: 'w-full bg-foreground',
          tab: 'max-w-fit px-0 h-10',
          tabContent: 'group-data-[selected=true]:text-foreground',
        }}
      >
        <Tab key="all" title="全部" />
        <Tab key="note" title="笔记" />
        <Tab key="video" title="视频" />
      </Tabs>

      {/* 作品总数 */}
      <Chip
        size="sm"
        variant="flat"
        className="text-xs text-default-500 bg-default-100 shrink-0"
      >
        {total} 个作品
      </Chip>
    </section>
  )
}
