/**
 * 文档交互信息区
 * 浏览量 / 点赞 / 收藏 / 分享 / 关注作者
 */

import { Eye, Heart, Star, Share2, UserPlus, UserCheck } from 'lucide-react'
import { Button, Avatar, Tooltip } from '@heroui/react'
import type { DocHomeInteraction } from '@/types/document.types'

interface Props {
  docId: string
  interaction?: DocHomeInteraction | null
  likeLoading: boolean
  favLoading: boolean
  followLoading: boolean
  onLike: () => void
  onFavorite: () => void
  onFollow: () => void
  onShare: () => void
}

function formatCount(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}万`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

export default function DocumentInteraction({
  interaction,
  likeLoading,
  favLoading,
  followLoading,
  onLike,
  onFavorite,
  onFollow,
  onShare,
}: Props) {
  if (!interaction) {
    return (
      <section className="py-4 border-b border-default-200">
        <div className="flex items-center gap-6 animate-pulse">
          <div className="h-8 w-16 rounded-full bg-default-100" />
          <div className="h-8 w-16 rounded-full bg-default-100" />
          <div className="h-8 w-16 rounded-full bg-default-100" />
        </div>
      </section>
    )
  }

  return (
    <section className="py-4 border-b border-default-200">
      <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
        {/* 浏览量 */}
        <div className="flex items-center gap-1 text-default-500">
          <Eye size={18} />
          <span className="text-sm">{formatCount(interaction.viewCount)}</span>
        </div>

        {/* 点赞 */}
        <Tooltip content={interaction.isLiked ? '取消点赞' : '点赞'}>
          <Button
            variant="light"
            size="sm"
            className="min-w-0 gap-1 px-2"
            isDisabled={likeLoading}
            onPress={onLike}
          >
            <Heart
              size={18}
              className={interaction.isLiked ? 'text-danger fill-danger' : 'text-default-500'}
            />
            <span className="text-sm text-default-500">
              {formatCount(interaction.likeCount)}
            </span>
          </Button>
        </Tooltip>

        {/* 收藏 */}
        <Tooltip content={interaction.isFavorited ? '取消收藏' : '收藏'}>
          <Button
            variant="light"
            size="sm"
            className="min-w-0 gap-1 px-2"
            isDisabled={favLoading}
            onPress={onFavorite}
          >
            <Star
              size={18}
              className={
                interaction.isFavorited ? 'text-warning fill-warning' : 'text-default-500'
              }
            />
            <span className="text-sm text-default-500">
              {formatCount(interaction.favoriteCount)}
            </span>
          </Button>
        </Tooltip>

        {/* 分享 */}
        <Tooltip content="复制链接">
          <Button
            variant="light"
            size="sm"
            className="min-w-0 gap-1 px-2"
            onPress={onShare}
          >
            <Share2 size={18} className="text-default-500" />
          </Button>
        </Tooltip>

        {/* 分隔 */}
        <span className="w-px h-5 bg-default-200 hidden sm:block" />

        {/* 作者信息 */}
        {interaction.author && (
          <div className="flex items-center gap-3 ml-auto">
            <Avatar
              src={interaction.author.avatar}
              name={interaction.author.name}
              size="sm"
              className="w-8 h-8 shrink-0"
            />
            <div className="hidden sm:block">
              <p className="text-sm text-foreground font-medium leading-tight">
                {interaction.author.name}
              </p>
              <p className="text-xs text-default-400">
                {formatCount(interaction.author.fans)} 粉丝
              </p>
            </div>
            <Button
              size="sm"
              variant={interaction.author.isFollowing ? 'bordered' : 'solid'}
              color={interaction.author.isFollowing ? 'default' : 'primary'}
              className="h-8 text-xs"
              isDisabled={followLoading}
              onPress={onFollow}
              startContent={
                interaction.author.isFollowing ? (
                  <UserCheck size={14} />
                ) : (
                  <UserPlus size={14} />
                )
              }
            >
              {interaction.author.isFollowing ? '已关注' : '关注'}
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
