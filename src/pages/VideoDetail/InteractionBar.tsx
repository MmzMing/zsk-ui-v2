/**
 * 视频交互栏
 * 左侧：浏览量/点赞/收藏/分享
 * 右侧：作者信息 + 关注按钮
 * 作者头像/昵称可点击跳转到用户主页
 * 参考 B站风格
 */

// ===== 1. 依赖导入区域 =====
// React Router
import { useNavigate } from 'react-router-dom'

// HeroUI 组件
import { Button, Avatar, Tooltip } from '@heroui/react'

// 图标 (Lucide 优先)
import { Heart, Star, Share2, UserPlus, UserCheck, Eye } from 'lucide-react'

// 类型定义
import type { HomeVideoInteraction } from '@/types/video-home.types'

interface Props {
  interaction?: HomeVideoInteraction | null
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

export default function InteractionBar({
  interaction,
  likeLoading,
  favLoading,
  followLoading,
  onLike,
  onFavorite,
  onFollow,
  onShare,
}: Props) {
  const navigate = useNavigate()

  /**
   * 点击作者头像/昵称，跳转到用户主页
   * 通过 state 传递作者信息，避免用户主页再次请求
   */
  const handleAuthorClick = () => {
    if (!interaction?.author) return
    navigate(`/user/${interaction.author.id}`, {
      state: { author: interaction.author },
    })
  }
  if (!interaction) {
    return (
      <section className="py-5 border-b border-default-200">
        <div className="flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-default-100" />
            <div className="space-y-2">
              <div className="h-4 w-24 rounded bg-default-100" />
              <div className="h-3 w-16 rounded bg-default-100" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-9 w-20 rounded-full bg-default-100" />
            <div className="h-9 w-20 rounded-full bg-default-100" />
            <div className="h-9 w-10 rounded-full bg-default-100" />
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-5 border-b border-default-200">
      <div className="flex items-center justify-between gap-2">
        {/* 左侧：浏览量/点赞/收藏/分享 */}
        <div className="flex items-center gap-1 sm:gap-3">
          {/* 浏览量 */}
          <div className="flex items-center gap-1 px-1.5 sm:px-3 h-10 text-default-400">
            <Eye size={18} className="sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm text-default-600">
              {formatCount(interaction.viewCount)}
            </span>
          </div>

          {/* 点赞 */}
          <Tooltip content={interaction.isLiked ? '取消点赞' : '点赞'}>
            <Button
              variant={interaction.isLiked ? 'flat' : 'light'}
              size="sm"
              className="min-w-0 gap-1 px-1.5 sm:px-3 h-9 sm:h-10"
              isDisabled={likeLoading}
              onPress={onLike}
              color="default"
            >
              <Heart
                size={18}
                className={`sm:w-5 sm:h-5 ${interaction.isLiked ? 'fill-default-800 text-default-800' : 'text-default-500'}`}
              />
              <span className="text-xs sm:text-sm text-default-600">
                {formatCount(interaction.likeCount)}
              </span>
            </Button>
          </Tooltip>

          {/* 收藏 */}
          <Tooltip content={interaction.isFavorited ? '取消收藏' : '收藏'}>
            <Button
              variant={interaction.isFavorited ? 'flat' : 'light'}
              size="sm"
              className="min-w-0 gap-1 px-1.5 sm:px-3 h-9 sm:h-10"
              isDisabled={favLoading}
              onPress={onFavorite}
              color="default"
            >
              <Star
                size={18}
                className={`sm:w-5 sm:h-5 ${
                  interaction.isFavorited ? 'fill-default-800 text-default-800' : 'text-default-500'
                }`}
              />
              <span className="text-xs sm:text-sm text-default-600">
                {formatCount(interaction.favoriteCount)}
              </span>
            </Button>
          </Tooltip>

          {/* 分享 */}
          <Tooltip content="复制链接">
            <Button
              variant="light"
              size="sm"
              className="min-w-0 gap-1 px-1.5 sm:px-3 h-9 sm:h-10"
              onPress={onShare}
            >
              <Share2 size={18} className="text-default-800 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm text-default-600 hidden sm:inline">分享</span>
            </Button>
          </Tooltip>
        </div>

        {/* 右侧：作者信息（可点击跳转用户主页） */}
        {interaction.author && (
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div
              className="flex items-center gap-2 sm:gap-3 cursor-pointer group/author"
              onClick={handleAuthorClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAuthorClick() }}
            >
              <Avatar
                src={interaction.author.avatar}
                name={interaction.author.name || '作者'}
                size="sm"
                className="w-8 h-8 sm:w-10 sm:h-10 shrink-0 transition-opacity group-hover/author:opacity-80"
              />
              <div className="hidden sm:block">
                <p className="text-base text-foreground font-medium leading-tight group-hover/author:underline">
                  {interaction.author.name || '未知作者'}
                </p>
                <p className="text-sm text-default-400 mt-0.5">
                  {formatCount(interaction.author.fans)} 粉丝
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant={interaction.author.isFollowing ? 'bordered' : 'solid'}
              color="default"
              className={`h-8 text-xs rounded-full ${
                interaction.author.isFollowing
                  ? ''
                  : 'bg-default-800 text-white dark:bg-default-100 dark:text-default-900'
              }`}
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
