/**
 * 文档元信息区
 * 标题、作者、日期、分类、标签、简介
 */

import { Chip, Avatar } from '@heroui/react'
import { Calendar } from 'lucide-react'
import { formatDate } from '@/utils/format'
import type { DocHomeNoteDetail, DocHomeInteraction } from '@/types/document.types'

interface Props {
  detail: DocHomeNoteDetail | null
  author?: DocHomeInteraction['author'] | null
  loading: boolean
}

export default function DocumentMeta({ detail, author, loading }: Props) {
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

  const tagList = detail.tags
    ? detail.tags.split(',').filter(Boolean)
    : []

  return (
    <section className="py-6 border-b border-default-200">
      {/* 标题 */}
      <h1 className="text-2xl font-bold text-foreground leading-tight">{detail.title}</h1>

      {/* 作者 + 日期 */}
      <div className="flex items-center gap-3 mt-3 flex-wrap">
        {author && (
          <div className="flex items-center gap-2">
            <Avatar
              src={author.avatar}
              name={author.name}
              size="sm"
              className="w-7 h-7"
            />
            <span className="text-sm text-default-600 font-medium">{author.name}</span>
          </div>
        )}
        {detail.date && (
          <div className="flex items-center gap-1 text-default-400 text-sm">
            <Calendar size={14} />
            <span>{formatDate(detail.date, 'YYYY年MM月DD日')}</span>
          </div>
        )}
      </div>

      {/* 分类 + 标签 */}
      {(detail.category || tagList.length > 0) && (
        <div className="flex gap-2 mt-3 flex-wrap">
          {detail.category && (
            <Chip size="sm" variant="flat" color="primary">
              {detail.category}
            </Chip>
          )}
          {tagList.map((tag) => (
            <Chip key={tag} size="sm" variant="flat">
              {tag.trim()}
            </Chip>
          ))}
        </div>
      )}

      {/* 简介 */}
      {detail.description && (
        <p className="text-sm text-default-500 mt-3 leading-relaxed">{detail.description}</p>
      )}
    </section>
  )
}
