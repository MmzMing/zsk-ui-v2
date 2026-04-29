/**
 * 用户作品卡片
 * 展示单个作品信息：封面、标题、类型角标、统计数据
 * 黑白风格，封面默认灰度滤镜，hover 恢复彩色
 */

// ===== 1. 依赖导入区域 =====
// React 核心
import { memo } from 'react'

// 图标 (Lucide 优先)
import { Eye, Heart, BookMarked, FileText, Video } from 'lucide-react'

// 工具函数
import { cn } from '@/utils'

// 类型定义
import type { DocHomeUserWorksVo } from '@/types/document.types'

// ===== 2. Props 类型定义 =====
interface UserWorkCardProps {
  /** 作品数据 */
  work: DocHomeUserWorksVo
  /** 点击回调 */
  onClick?: () => void
  /** 自定义类名 */
  className?: string
}

// ===== 3. 通用工具函数区域 =====
/**
 * 格式化数字显示
 * @param n - 数字
 * @returns 格式化后的字符串
 */
function formatCount(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}万`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

/**
 * 格式化日期显示
 * @param dateString - 日期字符串（格式：yyyy-MM-dd HH:mm:ss）
 * @returns 格式化后的月/日字符串
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const lang = localStorage.getItem('locale') || 'zh-CN'
  return date.toLocaleDateString(lang, { month: 'short', day: 'numeric' })
}

/** 类型标签映射 */
const TYPE_LABEL_MAP: Record<DocHomeUserWorksVo['type'], string> = {
  note: '笔记',
  video: '视频',
}

/** 类型图标映射 */
const TYPE_ICON_MAP: Record<DocHomeUserWorksVo['type'], typeof FileText> = {
  note: FileText,
  video: Video,
}

// ===== 8. UI渲染逻辑区域 =====
/**
 * 用户作品卡片组件
 * 封面默认灰度滤镜，hover 恢复彩色并微放大
 */
const UserWorkCard = memo(function UserWorkCard({
  work,
  onClick,
  className,
}: UserWorkCardProps) {
  const TypeIcon = TYPE_ICON_MAP[work.type]

  return (
    <div
      className={cn('cursor-pointer group', className)}
      onClick={onClick}
    >
      {/* 封面区域 */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
        {/* 封面图：默认灰度，hover 恢复彩色 */}
        {work.coverUrl ? (
          <img
            src={work.coverUrl}
            alt={work.title}
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="w-full h-full bg-default-100 flex items-center justify-center">
            <TypeIcon className="w-10 h-10 text-default-300" />
          </div>
        )}

        {/* 类型角标：左上角 */}
        <span
          className={cn(
            'absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-medium',
            work.type === 'note'
              ? 'bg-foreground text-background'
              : 'bg-default-500 text-white'
          )}
        >
          {TYPE_LABEL_MAP[work.type]}
        </span>

        {/* 悬停描述层 */}
        {work.description && (
          <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <p className="text-sm text-gray-200 line-clamp-2">
              {work.description}
            </p>
          </div>
        )}
      </div>

      {/* 底部信息 */}
      <div className="px-1 py-3">
        {/* 标题 */}
        <h4 className="text-sm font-medium text-foreground line-clamp-1 mb-2">
          {work.title}
        </h4>

        {/* 统计数据 */}
        <div className="flex items-center gap-3 text-xs text-default-500">
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            {formatCount(work.viewCount)}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="w-3.5 h-3.5" />
            {formatCount(work.likeCount)}
          </span>
          <span className="flex items-center gap-1">
            <BookMarked className="w-3.5 h-3.5" />
            {formatCount(work.favoriteCount)}
          </span>
          <span className="flex items-center gap-1 ml-auto">
            {formatDate(work.createTime)}
          </span>
        </div>
      </div>
    </div>
  )
})

export default UserWorkCard
