/**
 * WorksGrid 作品网格组件
 * 展示用户作品列表，支持分页和加载更多
 */

import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { WorkCard } from './WorkCard'
import type { UserWork } from '@/api/profile/index'
import { cn } from '@/utils'

/**
 * WorksGrid 属性
 */
interface WorksGridProps {
  /** 初始作品数据 */
  initialWorks?: UserWork[]
  /** 加载中 */
  loading?: boolean
  /** 加载更多回调 */
  loadMore?: () => Promise<UserWork[]>
  /** 是否还有更多 */
  hasMore?: boolean
  /** 点击作品 */
  onWorkClick?: (work: UserWork) => void
  /** 自定义类名 */
  className?: string
}

/**
 * WorksGrid 作品网格
 */
export function WorksGrid({
  initialWorks = [],
  loading,
  loadMore,
  hasMore = false,
  onWorkClick,
  className,
}: WorksGridProps) {
  const { t } = useTranslation('profile')
  const [works, setWorks] = useState<UserWork[]>(initialWorks)
  const [loadingMore, setLoadingMore] = useState(false)

  // 同步初始数据
  useEffect(() => {
    setWorks(initialWorks)
  }, [initialWorks])

  // 加载更多
  const handleLoadMore = useCallback(async () => {
    if (!loadMore || loadingMore || !hasMore) return
    
    setLoadingMore(true)
    try {
      const newWorks = await loadMore()
      setWorks(prev => [...prev, ...newWorks])
    } finally {
      setLoadingMore(false)
    }
  }, [loadMore, loadingMore, hasMore])

  const isLoading = loading && works.length === 0

  return (
    <div className={cn('', className)}>
      {/* 作品网格 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {works.map(work => (
          <WorkCard
            key={work.id}
            work={work}
            onClick={() => onWorkClick?.(work)}
          />
        ))}
        
        {/* 加载骨架 */}
        {isLoading && (
          <>
            <WorkCard loading />
            <WorkCard loading />
            <WorkCard loading />
            <WorkCard loading />
            <WorkCard loading />
            <WorkCard loading />
          </>
        )}
      </div>

      {/* 加载更多按钮 */}
      {hasMore && !isLoading && (
        <div className="flex justify-center mt-8">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className={cn(
              'px-6 py-2 rounded-full text-sm transition-colors',
              loadingMore
                ? 'bg-default-100 text-default-400 cursor-wait'
                : 'bg-default-100 text-default-600 hover:bg-default-200'
            )}
          >
            {loadingMore ? t('works.loading') : t('works.loadMore')}
          </button>
        </div>
      )}

      {/* 空状态 */}
      {!isLoading && works.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-default-400">
          <p className="text-base">{t('works.noWorks')}</p>
          <p className="text-sm mt-1">{t('works.noWorksDesc')}</p>
        </div>
      )}
    </div>
  )
}