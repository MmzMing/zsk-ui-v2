/**
 * 列表视图单元
 */

import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Play, Eye, Heart, FileText, Clock } from 'lucide-react'
import { HighlightText } from './HighlightText'
import type { SearchItem } from '@/types/search.types'

interface ResultRowProps {
  item: SearchItem
  keyword: string
}

export function ResultRow({ item, keyword }: ResultRowProps) {
  const navigate = useNavigate()
  const isVideo = item.type === 'video'
  const count = isVideo ? item.playCount ?? 0 : item.readCount ?? 0

  const handleClick = () => {
    navigate(isVideo ? `/video/${item.id}` : `/document/${item.id}`)
  }

  return (
    <motion.div
      layout
      role="listitem"
      onClick={handleClick}
      className="group relative flex cursor-pointer gap-3 overflow-hidden rounded-xl border border-default-200 bg-content1 p-3 shadow-sm transition-all hover:border-primary-300 hover:shadow-md"
    >
      <span className="absolute left-0 top-1/2 h-0 w-[3px] -translate-y-1/2 bg-primary transition-all duration-200 group-hover:h-full group-hover:top-0 group-hover:translate-y-0" />

      <div className="relative h-[90px] w-40 flex-shrink-0 overflow-hidden rounded-lg bg-default-100">
        {item.thumbnail ? (
          <img
            src={item.thumbnail}
            alt={item.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-default-400">
            {isVideo ? <Play className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
          </div>
        )}
        {isVideo && item.duration && (
          <span className="absolute bottom-1 right-1 inline-flex items-center gap-1 rounded bg-black/70 px-1 py-0.5 text-[10px] text-white">
            <Clock className="h-3 w-3" />
            {item.duration}
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
              isVideo
                ? 'bg-primary/15 text-primary'
                : 'bg-secondary/15 text-secondary'
            }`}
          >
            {isVideo ? <Play className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
            {isVideo ? '视频' : '文档'}
          </span>
          <h3 className="truncate text-sm font-semibold text-default-900 transition-colors group-hover:text-primary">
            <HighlightText text={item.title} keyword={keyword} />
          </h3>
        </div>
        {item.description && (
          <p className="line-clamp-2 text-xs leading-relaxed text-default-500">
            <HighlightText text={item.description} keyword={keyword} />
          </p>
        )}
        <div className="mt-auto flex items-center gap-3 text-[11px] text-default-500">
          <span className="truncate">{item.author || '匿名作者'}</span>
          {item.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-md bg-default-100 px-1.5 py-0.5 text-default-600">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-shrink-0 flex-col items-end justify-center gap-1 text-[11px] text-default-500">
        <span className="flex items-center gap-1">
          <Eye className="h-3.5 w-3.5" />
          {count}
        </span>
        <span className="flex items-center gap-1">
          <Heart className="h-3.5 w-3.5" />
          {item.likeCount}
        </span>
      </div>
    </motion.div>
  )
}
