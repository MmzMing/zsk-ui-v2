/**
 * WorkCard 作品卡片组件
 * 用于展示用户作品，支持 Hover Effect
 */

// ===== 1. 依赖导入区域 =====
import { useTranslation } from 'react-i18next'
import { Eye, Heart, MessageCircle, Calendar } from 'lucide-react'
import { HoverCard } from '../aceternity/HoverEffect'
import type { UserWork } from '@/api/profile/index'
import { cn } from '@/utils'

/**
 * WorkCard 属性
 */
interface WorkCardProps {
  /** 作品数据 */
  work?: UserWork
  /** 是否加载中 */
  loading?: boolean
  /** 点击事件 */
  onClick?: () => void
  /** 自定义类名 */
  className?: string
}

/**
 * formatNumber 格式化数字
 */
function formatNumber(num: number): string {
  if (num >= 10000) {
    return `${(num / 10000).toFixed(1)}万`
  }
  return num.toString()
}

/**
 * formatDate 格式化日期
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const lang = localStorage.getItem('locale') || 'zh-CN'
  return date.toLocaleDateString(lang, { month: 'short', day: 'numeric' })
}

/**
 * getTypeIcon 获取类型图标
 */
function getTypeBadge(type: UserWork['type'], t: (key: string) => string): string {
  const map = {
    document: t('works.document'),
    video: t('works.video'),
    tool: t('works.tool'),
  }
  return map[type] || t('works.document')
}

/**
 * WorkCard 作品卡片组件
 * 用于展示用户作品，支持悬停动画效果
 */
export function WorkCard({ work, loading, onClick, className }: WorkCardProps) {
  const { t } = useTranslation('profile')
  
  if (loading) {
    return <WorkSkeleton className={className} />
  }

  return (
    <div
      className={cn('cursor-pointer', className)}
      onClick={onClick}
    >
      <HoverCard className="aspect-[4/3]">
        {/* 封面图 */}
        {work?.cover ? (
          <img
            src={work.cover}
            alt={work.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-default-100 flex items-center justify-center">
            <span className="text-default-300 text-4xl font-bold">
              {work ? getTypeBadge(work.type, t) : t('works.document')}
            </span>
          </div>
        )}

        {/* 悬停内容 */}
        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="text-base font-semibold text-white line-clamp-1">
            {work?.title || '标题'}
          </h3>
          {work?.description && (
            <p className="text-sm text-gray-200 line-clamp-2 mt-1">
              {work.description}
            </p>
          )}
        </div>
      </HoverCard>

      {/* 底部信息 */}
      <div className="px-1 py-3">
        <h4 className="text-sm font-medium text-default-800 line-clamp-1 mb-2">
          {work?.title || '作品标题'}
        </h4>
        <div className="flex items-center gap-4 text-xs text-default-500">
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            {formatNumber(work?.views || 0)}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="w-3.5 h-3.5" />
            {formatNumber(work?.likes || 0)}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="w-3.5 h-3.5" />
            {formatNumber(work?.comments || 0)}
          </span>
          <span className="flex items-center gap-1 ml-auto">
            <Calendar className="w-3.5 h-3.5" />
            {work ? formatDate(work.createdAt) : '--'}
          </span>
        </div>
      </div>
    </div>
  )
}

/**
 * WorkSkeleton 属性定义
 */
interface WorkSkeletonProps {
  /** 自定义类名 */
  className?: string
}

/**
 * WorkSkeleton 作品骨架屏组件
 * 用于作品加载时的占位显示
 */
export function WorkSkeleton({ className }: WorkSkeletonProps) {
  return (
    <div className={cn('', className)}>
      {/* 封面骨架 */}
      <div className="aspect-[4/3] rounded-2xl bg-default-100 animate-pulse" />

      {/* 文字骨架 */}
      <div className="px-1 py-3 space-y-2">
        <div className="h-4 w-3/4 rounded-full bg-default-100 animate-pulse" />
        <div className="flex gap-4">
          <div className="h-3 w-12 rounded-full bg-default-100 animate-pulse" />
          <div className="h-3 w-12 rounded-full bg-default-100 animate-pulse" />
          <div className="h-3 w-12 rounded-full bg-default-100 animate-pulse" />
        </div>
      </div>
    </div>
  )
}