/**
 * 卡片视图单元
 */

import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Play, FileText, Eye, Heart, Clock, Calendar, User } from 'lucide-react'
import { HighlightText } from './HighlightText'
import type { SearchItem } from '@/types/search.types'

interface ResultCardProps {
  item: SearchItem
  keyword: string
}

/**
 * 格式化日期显示：本年只显示"月日"（如 4月30日），非本年显示"年月日"（如 2025年4月30日）
 */
function formatDisplayDate(dateStr: string): string {
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const currentYear = new Date().getFullYear()
  if (year === currentYear) {
    return `${month}月${day}日`
  }
  return `${year}年${month}月${day}日`
}

export function ResultCard({ item, keyword }: ResultCardProps) {
  const navigate = useNavigate()
  const isVideo = item.type === 'video'
  const count = isVideo ? item.playCount ?? 0 : item.readCount ?? 0

  const handleClick = () => {
    const rawId = item.id.split('_').slice(1).join('_')
    navigate(isVideo ? `/video/${rawId}` : `/document/${rawId}`)
  }

  return (
    <motion.article
      layout
      role="listitem"
      onClick={handleClick}
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 220, damping: 20 }}
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl transition-all"
    >
      <div className="relative aspect-video overflow-hidden bg-default-100">
        {item.thumbnail ? (
          <img
            src={item.thumbnail}
            alt={item.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-default-400">
            {isVideo ? <Play className="h-8 w-8" /> : <FileText className="h-8 w-8" />}
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/5 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {isVideo && item.duration && (
          <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 text-xs text-white">
            <Clock className="h-3.5 w-3.5" />
            {item.duration}
          </span>
        )}

        <span className="absolute bottom-2 right-2 inline-flex items-center gap-2 text-xs text-white">
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            {count}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="h-3.5 w-3.5" />
            {item.likeCount}
          </span>
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 pt-2">
        <div className="flex items-center gap-1.5">
          {isVideo ? (
            <Play className="h-3.5 w-3.5 shrink-0 text-primary" />
          ) : (
            <FileText className="h-3.5 w-3.5 shrink-0 text-red-500" />
          )}
          <h3 className="truncate text-sm font-semibold text-default-900 transition-colors group-hover:text-primary">
            <HighlightText text={item.title} keyword={keyword} />
          </h3>
        </div>

        <div className="flex items-center justify-between text-xs text-default-500">
          <span className="truncate flex items-center gap-1">
            <User className="h-3.5 w-3.5" />
            {item.author || '匿名作者'}
          </span>
          <span className="shrink-0 flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {formatDisplayDate(item.updateTime)}
          </span>
        </div>

        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {Array.from(new Set(item.tags)).slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-[10px] text-default-500"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.article>
  )
}
