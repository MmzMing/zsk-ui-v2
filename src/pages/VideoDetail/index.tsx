/**
 * 视频详情页
 * 左-右两栏布局，瀑布式加载，评论区懒加载
 * 左侧：面包屑 → 视频播放器 → 视频信息 → 交互栏 → 评论区
 * 右侧：视频合集（悬浮）+ 回顶滑块
 * 移动端：单栏，合集折叠到评论区上方
 */

import { useParams } from 'react-router-dom'
import { StatusState } from '@/components/ui/StatusState'
import { Chip } from '@heroui/react'
import { useVideoDetail } from '@/hooks/useVideoDetail'
import VideoBreadcrumb from './VideoBreadcrumb'
import VideoPlayerSection from './VideoPlayerSection'
import VideoInfoSection from './VideoInfoSection'
import InteractionBar from './InteractionBar'
import CommentSection from './CommentSection'
import CollectionSidebar from './CollectionSidebar'
import VideoDetailSkeleton from './VideoDetailSkeleton'
import { useStickySidebar } from './useStickySidebar'

export default function VideoDetailPage() {
  const { id } = useParams<{ id: string }>()

  const {
    videoDetail,
    interaction,
    collections,
    isLoading,
    error,
    likeLoading,
    favLoading,
    followLoading,
    handleLike,
    handleFavorite,
    handleFollow,
    handleShare,
  } = useVideoDetail(id!)

  const { containerRef, contentRef, state: stickyState } = useStickySidebar({ offsetTop: 80 })

  // 错误态
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <StatusState type="error" />
          <p className="text-lg text-default-600">视频未找到</p>
          <p className="text-sm text-default-400">请检查链接是否正确，或返回搜索页</p>
          <a
            href="/search"
            className="inline-block text-sm text-primary hover:underline"
          >
            返回搜索
          </a>
        </div>
      </div>
    )
  }

  // 加载态（骨架屏）
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 max-w-7xl">
          <VideoDetailSkeleton />
        </div>
      </div>
    )
  }

  // 无数据
  if (!videoDetail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <StatusState type="empty" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto px-4 max-w-[100rem]">
        {/* 面包屑导航 */}
        <VideoBreadcrumb title={videoDetail.title} />

        {/* 标题 */}
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight pt-4 pb-2">
          {videoDetail.title}
        </h1>

        {/* 分类/标签 */}
        <div className="flex items-center gap-3 pb-4 pt-2 flex-wrap">
          {videoDetail.category && (
            <Chip size="sm" variant="flat" color="default" className="text-xs">
              {videoDetail.category}
            </Chip>
          )}
          {videoDetail.tags?.length > 0 &&
            Array.from(new Set(videoDetail.tags)).map((tag) => (
              <span key={tag} className="text-xs text-default-500">
                #{tag}
              </span>
            ))}
        </div>

        <div className="flex gap-5 mt-0">
          {/* 左侧主内容区 */}
          <div className="w-full md:w-[78%] min-w-0">
            {/* 视频播放器 */}
            <VideoPlayerSection detail={videoDetail} />

            {/* 视频信息 */}
            <VideoInfoSection detail={videoDetail} />

            {/* 交互栏 */}
            <InteractionBar
              interaction={interaction}
              likeLoading={likeLoading}
              favLoading={favLoading}
              followLoading={followLoading}
              onLike={handleLike}
              onFavorite={handleFavorite}
              onFollow={handleFollow}
              onShare={handleShare}
            />

            {/* 移动端：合集折叠区 */}
            <div className="md:hidden py-4 border-b border-default-200">
              <CollectionSidebar
                collections={collections}
                currentVideoId={videoDetail.id}
              />
            </div>

            {/* 评论区（懒加载） */}
            <CommentSection videoId={videoDetail.id} />
          </div>

          {/* 右侧合集栏（桌面端自定义 sticky） */}
          <aside className="hidden md:block w-[22%] shrink-0">
            {/* 原始容器：用于计算 sticky 触发位置 */}
            <div ref={containerRef}>
              {/* 占位元素：始终保持与内容相同高度，避免固定时布局跳动 */}
              <div
                style={{
                  height: stickyState.placeholderHeight,
                  minHeight: stickyState.isFixed ? stickyState.placeholderHeight : undefined,
                }}
                aria-hidden="true"
              />

              {/* 合集内容 */}
              <div
                ref={contentRef}
                className="space-y-6"
                style={
                  stickyState.isFixed
                    ? {
                        position: 'fixed',
                        top: 80,
                        left: stickyState.containerLeft,
                        width: stickyState.containerWidth,
                        maxHeight: 'calc(100vh - 6rem)',
                        overflowY: 'auto',
                        zIndex: 10,
                      }
                    : undefined
                }
              >
                <CollectionSidebar
                  collections={collections}
                  currentVideoId={videoDetail.id}
                />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
