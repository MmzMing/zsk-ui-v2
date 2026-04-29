/**
 * 视频合集侧栏
 * 无边框无背景框设计，黑边配色主题
 * 手风琴模式：一次仅展开一个合集，展开/收起带丝滑动画
 * 点击合集内视频可页内跳转（导航到对应视频详情页）
 */

import { useState, useCallback } from 'react'
import { Avatar } from '@heroui/react'
import { Play, ChevronDown, ListVideo } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/utils'
import type { HomeVideoCollection } from '@/types/video-home.types'

interface Props {
  collections: HomeVideoCollection[]
  currentVideoId: string
}

function formatCount(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}万`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

const contentVariants = {
  hidden: {
    height: 0,
    opacity: 0,
    transition: {
      height: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const },
      opacity: { duration: 0.2, ease: 'easeInOut' as const },
    },
  },
  visible: {
    height: 'auto',
    opacity: 1,
    transition: {
      height: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const },
      opacity: { duration: 0.25, ease: 'easeInOut' as const, delay: 0.05 },
    },
  },
}

const chevronVariants = {
  collapsed: { rotate: 0 },
  expanded: { rotate: 180 },
}

function CollectionItem({
  collection,
  currentVideoId,
  isExpanded,
  onToggle,
}: {
  collection: HomeVideoCollection
  currentVideoId: string
  isExpanded: boolean
  onToggle: () => void
}) {
  const navigate = useNavigate()

  return (
    <div className="border-b border-default-800/60 last:border-b-0">
      {/* 合集头部 */}
      <button
        className="w-full flex items-center gap-3 px-1 py-3 hover:opacity-80 transition-opacity"
        onClick={onToggle}
      >
        {collection.coverUrl ? (
          <Avatar
            src={collection.coverUrl}
            name={collection.collectionName}
            size="sm"
            className="w-10 h-10 rounded shrink-0"
            radius="sm"
          />
        ) : (
          <div className="w-10 h-10 rounded bg-default-900 flex items-center justify-center shrink-0">
            <ListVideo size={18} className="text-default-500" />
          </div>
        )}
        <div className="flex-1 min-w-0 text-left">
          <p className="text-sm font-medium text-foreground truncate">
            {collection.collectionName}
          </p>
          <p className="text-xs text-default-500">
            {collection.videoCount} 个视频
          </p>
        </div>
        <motion.div
          variants={chevronVariants}
          initial="collapsed"
          animate={isExpanded ? 'expanded' : 'collapsed'}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
          <ChevronDown size={16} className="text-default-500 shrink-0" />
        </motion.div>
      </button>

      {/* 合集视频列表 */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            style={{ overflow: 'hidden' }}
          >
            <div className="pb-2">
              {collection.videos.map((video, index) => {
                const isCurrent = video.id === currentVideoId
                return (
                  <button
                    key={video.id}
                    className={cn(
                      'w-full flex items-center gap-3 px-1 py-2 transition-colors text-left',
                      isCurrent
                        ? ''
                        : 'hover:bg-default-800/10'
                    )}
                    onClick={() => {
                      if (!isCurrent) {
                        navigate(`/video/${video.id}`)
                      }
                    }}
                    disabled={isCurrent}
                  >
                    {/* 左侧线条下标 */}
                    <div className="w-0.5 self-stretch rounded-full shrink-0">
                      <div
                        className={cn(
                          'w-full h-full rounded-full transition-colors',
                          isCurrent ? 'bg-default-800 dark:bg-default-100' : 'bg-transparent'
                        )}
                      />
                    </div>

                    <span
                      className={cn(
                        'text-xs w-5 text-center shrink-0',
                        isCurrent ? 'text-foreground font-bold' : 'text-default-500'
                      )}
                    >
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          'text-sm truncate',
                          isCurrent
                            ? 'text-foreground font-medium'
                            : 'text-default-300'
                        )}
                      >
                        {video.title}
                      </p>
                      <p className="text-xs text-default-500">
                        {formatCount(video.viewCount)} 次观看
                      </p>
                    </div>
                    {isCurrent && (
                      <Play size={14} className="text-foreground shrink-0 fill-foreground" />
                    )}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function CollectionSidebar({ collections, currentVideoId }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(() => {
    const current = collections.find((c) =>
      c.videos.some((v) => v.id === currentVideoId)
    )
    return current?.id ?? null
  })

  const handleToggle = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }, [])

  if (!collections || collections.length === 0) return null

  return (
    <div className="space-y-1">
      <h4 className="text-sm font-semibold text-foreground px-1 pb-2">视频合集</h4>
      <div className="border-t border-default-800/60">
        {collections.map((collection) => (
          <CollectionItem
            key={collection.id}
            collection={collection}
            currentVideoId={currentVideoId}
            isExpanded={expandedId === collection.id}
            onToggle={() => handleToggle(collection.id)}
          />
        ))}
      </div>
    </div>
  )
}
