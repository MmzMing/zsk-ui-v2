/**
 * 卡片视图单元
 */

import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Play, Eye, Heart, FileText, Clock } from 'lucide-react'
import { HighlightText } from './HighlightText'
import type { SearchItem } from '@/types/search.types'

interface ResultCardProps {
  item: SearchItem
  keyword: string
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

        <span
          className={`absolute left-2 top-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium bg-default-800 text-white dark:bg-default-100 dark:text-default-900`}
        >
          {isVideo ? <Play className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
          {isVideo ? '视频' : '文档'}
        </span>

        {isVideo && item.duration && (
          <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] text-white">
            <Clock className="h-3 w-3" />
            {item.duration}
          </span>
        )}

        <span className="absolute bottom-2 right-2 inline-flex items-center gap-2 rounded-md bg-black/70 px-2 py-0.5 text-[10px] text-white">
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {count}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="h-3 w-3" />
            {item.likeCount}
          </span>
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 pt-2">
        <h3 className="truncate text-sm font-semibold text-default-900 transition-colors group-hover:text-primary">
          <HighlightText text={item.title} keyword={keyword} />
        </h3>

        <div className="flex items-center gap-2 text-xs text-default-500">
          <span className="truncate">{item.author || '匿名作者'}</span>
          <span className="text-default-300">|</span>
          <span>{item.updateTime}</span>
        </div>

        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-default-100 px-1.5 py-0.5 text-[10px] text-default-600"
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
