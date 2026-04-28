/**
 * 视频信息展示区
 * 标题、描述、分类、标签、观看次数
 * 参考 B站风格：大标题 + 元信息
 */

import { Chip } from '@heroui/react'
import { Eye } from 'lucide-react'
import type { HomeVideoDetail, HomeVideoInteraction } from '@/types/video-home.types'

interface Props {
  detail: HomeVideoDetail
  interaction?: HomeVideoInteraction | null
}

function formatCount(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}万`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

export default function VideoInfoSection({ detail, interaction }: Props) {
  return (
    <section className="py-5 border-b border-default-200">
      {/* 标题：放大到 2xl */}
      <h1 className="text-2xl font-bold text-foreground leading-snug">
        {detail.title}
      </h1>

      {/* 元信息行：分类/标签/观看量 */}
      <div className="flex items-center gap-3 mt-3 flex-wrap">
        {detail.category && (
          <Chip size="md" variant="flat" color="primary" className="text-sm">
            {detail.category}
          </Chip>
        )}

        {detail.tags?.length > 0 &&
          detail.tags.map((tag) => (
            <Chip key={tag} size="md" variant="flat" className="text-sm">
              {tag}
            </Chip>
          ))}

        {interaction && (
          <div className="flex items-center gap-1.5 text-default-400 text-base ml-auto">
            <Eye size={18} />
            <span>{formatCount(interaction.viewCount)} 次观看</span>
          </div>
        )}
      </div>

      {/* 描述：放大到 base */}
      {detail.description && (
        <p className="text-base text-default-500 mt-4 leading-relaxed">
          {detail.description}
        </p>
      )}
    </section>
  )
}
