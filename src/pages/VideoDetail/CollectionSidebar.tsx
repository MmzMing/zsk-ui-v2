/**
 * 视频合集侧栏
 * 悬浮定位，展示视频所属的公开合集列表
 * 点击合集内视频可页内跳转（导航到对应视频详情页）
 */

import { useState } from 'react'
import { Avatar } from '@heroui/react'
import { Play, ChevronDown, ChevronUp, ListVideo } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
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

function CollectionItem({
  collection,
  currentVideoId,
}: {
  collection: HomeVideoCollection
  currentVideoId: string
}) {
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(
    collection.videos.some((v) => v.id === currentVideoId)
  )

  return (
    <div className="border border-default-200 rounded-lg overflow-hidden">
      {/* 合集头部 */}
      <button
        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-default-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
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
          <div className="w-10 h-10 rounded bg-default-100 flex items-center justify-center shrink-0">
            <ListVideo size={18} className="text-default-400" />
          </div>
        )}
        <div className="flex-1 min-w-0 text-left">
          <p className="text-sm font-medium text-foreground truncate">
            {collection.collectionName}
          </p>
          <p className="text-xs text-default-400">
            {collection.videoCount} 个视频
          </p>
        </div>
        {expanded ? (
          <ChevronUp size={16} className="text-default-400 shrink-0" />
        ) : (
          <ChevronDown size={16} className="text-default-400 shrink-0" />
        )}
      </button>

      {/* 合集视频列表 */}
      {expanded && (
        <div className="border-t border-default-200">
          {collection.videos.map((video, index) => {
            const isCurrent = video.id === currentVideoId
            return (
              <button
                key={video.id}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 transition-colors text-left',
                  isCurrent
                    ? 'bg-primary-50 dark:bg-primary-900/20'
                    : 'hover:bg-default-50'
                )}
                onClick={() => {
                  if (!isCurrent) {
                    navigate(`/video/${video.id}`)
                  }
                }}
                disabled={isCurrent}
              >
                <span
                  className={cn(
                    'text-xs w-5 text-center shrink-0',
                    isCurrent ? 'text-primary font-bold' : 'text-default-400'
                  )}
                >
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      'text-sm truncate',
                      isCurrent
                        ? 'text-primary font-medium'
                        : 'text-default-700'
                    )}
                  >
                    {video.title}
                  </p>
                  <p className="text-xs text-default-400">
                    {formatCount(video.viewCount)} 次观看
                  </p>
                </div>
                {isCurrent && (
                  <Play size={14} className="text-primary shrink-0 fill-primary" />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function CollectionSidebar({ collections, currentVideoId }: Props) {
  if (!collections || collections.length === 0) return null

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-foreground">视频合集</h4>
      {collections.map((collection) => (
        <CollectionItem
          key={collection.id}
          collection={collection}
          currentVideoId={currentVideoId}
        />
      ))}
    </div>
  )
}
