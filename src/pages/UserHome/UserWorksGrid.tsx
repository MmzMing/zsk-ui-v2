/**
 * 用户作品网格
 * 展示作品卡片列表，支持加载更多
 * 黑白风格，响应式网格布局
 */

// ===== 1. 依赖导入区域 =====
// React 核心
import { useCallback } from 'react'

// HeroUI 组件
import { Spinner } from '@heroui/react'

// 工具函数
import { cn } from '@/utils'

// 组件
import { StatusState } from '@/components/ui/StatusState'
import UserWorkCard from './UserWorkCard'

// 类型定义
import type { DocHomeUserWorksVo } from '@/types/document.types'

// ===== 2. Props 类型定义 =====
interface UserWorksGridProps {
  /** 作品列表 */
  works: DocHomeUserWorksVo[]
  /** 加载中 */
  loading: boolean
  /** 加载更多中 */
  loadingMore: boolean
  /** 是否有更多数据 */
  hasMore: boolean
  /** 加载更多回调 */
  onLoadMore: () => void
  /** 点击作品回调 */
  onWorkClick: (work: DocHomeUserWorksVo) => void
  /** 自定义类名 */
  className?: string
}

// ===== 3. 通用工具函数区域 =====
/** 骨架屏占位数量 */
const SKELETON_COUNT = 6

// ===== 8. UI渲染逻辑区域 =====
/**
 * 用户作品网格组件
 * 响应式网格：1列 → 2列 → 3列
 */
export default function UserWorksGrid({
  works,
  loading,
  loadingMore,
  hasMore,
  onLoadMore,
  onWorkClick,
  className,
}: UserWorksGridProps) {
  const isLoading = loading && works.length === 0

  /**
   * 处理作品点击，根据类型跳转到对应详情页
   */
  const handleWorkClick = useCallback(
    (work: DocHomeUserWorksVo) => {
      onWorkClick(work)
    },
    [onWorkClick]
  )

  return (
    <div className={cn('', className)}>
      {/* 作品网格 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 已加载的作品卡片 */}
        {works.map((work) => (
          <UserWorkCard
            key={work.id}
            work={work}
            onClick={() => handleWorkClick(work)}
          />
        ))}

        {/* 加载态骨架屏 */}
        {isLoading &&
          Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <WorkCardSkeleton key={i.toString()} />
          ))}
      </div>

      {/* 加载更多按钮 */}
      {hasMore && !isLoading && (
        <div className="flex justify-center mt-8">
          <button
            onClick={onLoadMore}
            disabled={loadingMore}
            className={cn(
              'px-6 py-2 rounded-full text-sm transition-colors flex items-center gap-2',
              loadingMore
                ? 'bg-default-100 text-default-400 cursor-wait'
                : 'bg-default-100 text-default-600 hover:bg-default-200'
            )}
          >
            {loadingMore && <Spinner size="sm" />}
            {loadingMore ? '加载中...' : '加载更多'}
          </button>
        </div>
      )}

      {/* 空状态 */}
      {!isLoading && works.length === 0 && (
        <div className="flex items-center justify-center py-16">
          <StatusState type="empty" description="该用户暂无作品" />
        </div>
      )}
    </div>
  )
}

// ===== 内部组件 =====

/** 作品卡片骨架屏 */
function WorkCardSkeleton() {
  return (
    <div>
      {/* 封面骨架 */}
      <div className="aspect-[4/3] rounded-2xl bg-default-100 animate-pulse" />

      {/* 文字骨架 */}
      <div className="px-1 py-3 space-y-2">
        <div className="h-4 w-3/4 rounded-full bg-default-100 animate-pulse" />
        <div className="flex gap-3">
          <div className="h-3 w-12 rounded-full bg-default-100 animate-pulse" />
          <div className="h-3 w-12 rounded-full bg-default-100 animate-pulse" />
          <div className="h-3 w-12 rounded-full bg-default-100 animate-pulse" />
        </div>
      </div>
    </div>
  )
}
