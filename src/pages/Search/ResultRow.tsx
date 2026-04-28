/**
 * 列表视图单元
 */

import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Play, Eye, Heart, FileText, Clock } from 'lucide-react'
import { HighlightText } from './HighlightText'
import { formatDateTime } from '@/utils/format'
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
    const rawId = item.id.split('_').slice(1).join('_')
    navigate(isVideo ? `/video/${rawId}` : `/document/${rawId}`)
  }

  return (
    <motion.div
      layout
      role="listitem"
      onClick={handleClick}
      className="group relative flex cursor-pointer gap-3 overflow-hidden p-3 transition-all"
    >
      <span className="absolute left-0 top-1/2 h-0 w-[3px] -translate-y-1/2 bg-black transition-all duration-200 group-hover:h-full group-hover:top-0 group-hover:translate-y-0 dark:bg-white" />

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

      <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
        {/* 第一层：类型 + 标题 */}
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex flex-shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium bg-default-800 text-white dark:bg-default-100 dark:text-default-900`}
          >
            {isVideo ? <Play className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
            {isVideo ? '视频' : '文档'}
          </span>
          <h3 className="truncate text-sm font-semibold text-default-900 transition-colors group-hover:text-primary">
            <HighlightText text={item.title} keyword={keyword} />
          </h3>
        </div>

        {/* 第二层：作者 + 日期时间 */}
        <div className="flex items-center gap-2 text-[11px] text-default-500">
          <span className="truncate">{item.author || '匿名作者'}</span>
          {item.updateTime && (
            <span className="flex-shrink-0 text-default-400">
              {formatDateTime(item.updateTime, 'YYYY-MM-DD HH:mm')}
            </span>
          )}
        </div>

        {/* 第三层：浏览量 + 点赞量 */}
        <div className="flex items-center gap-3 text-[11px] text-default-500">
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            {count}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="h-3.5 w-3.5" />
            {item.likeCount}
          </span>
        </div>

        {/* 第四层：标签 */}
        {item.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {item.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="rounded-md bg-default-100 px-1.5 py-0.5 text-[11px] text-default-600">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
