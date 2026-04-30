/**
 * 文档元信息区
 * 标题、作者、日期、分类、标签、简介
 */

// ===== 1. 依赖导入区域 =====
// HeroUI 组件
import { Chip } from '@heroui/react'

// 图标 (Lucide 优先)
import { Calendar } from 'lucide-react'

// 工具函数
import { formatDate } from '@/utils/format'

// 类型定义
import type { DocHomeNoteDetail } from '@/types/document.types'

// ===== 2. Props 类型定义 =====
interface DocumentMetaProps {
  detail: DocHomeNoteDetail | null
  loading: boolean
}

// ===== 3. 导出区域 =====
/**
 * 文档元信息区组件
 */
export default function DocumentMeta({ detail, loading }: DocumentMetaProps) {
  // 加载态骨架屏
  if (loading || !detail) {
    return (
      <section className="py-6 border-b border-default-200 animate-pulse space-y-3">
        <div className="h-7 w-3/4 rounded-full bg-default-100" />
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded-full bg-default-100" />
          <div className="h-4 w-20 rounded-full bg-default-100" />
        </div>
      </section>
    )
  }

  // 解析标签列表并去重
  const tagList = detail.tags
    ? Array.from(new Set(detail.tags.split(',').filter(Boolean).map((t) => t.trim())))
    : []

  return (
    <section className="py-6 border-b border-default-200">
      {/* 标题 */}
      <h1 className="text-5xl font-bold text-foreground leading-tight">{detail.title}</h1>

      {/* 日期 */}
      {detail.date && (
        <div className="flex items-center gap-1 text-default-400 text-sm mt-3">
          <Calendar size={14} />
          <span>{formatDate(detail.date, 'YYYY年MM月DD日')}</span>
        </div>
      )}

      {/* 分类 + 标签 */}
      {(detail.category || tagList.length > 0) && (
        <div className="flex gap-2 mt-3 flex-wrap items-center">
          {detail.category && (
            <Chip size="sm" variant="flat" color="default">
              {detail.category}
            </Chip>
          )}
          {tagList.map((tag) => (
            <span key={tag} className="text-sm text-default-500">
              #{tag.trim()}
            </span>
          ))}
        </div>
      )}

      {/* 简介 */}
      {detail.description && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-foreground mb-2">简介</h3>
          <p className="text-xl text-default-500 leading-relaxed">{detail.description}</p>
        </div>
      )}
    </section>
  )
}
