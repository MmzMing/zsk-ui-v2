/**
 * 视频详情页
 * 左-右两栏布局，瀑布式加载，评论区懒加载
 * 左侧：面包屑 → 视频播放器 → 视频信息 → 交互栏 → 评论区
 * 右侧：视频合集（悬浮）+ 回顶滑块
 * 移动端：单栏，合集折叠到评论区上方
 */

import { useParams } from 'react-router-dom'
import { StatusState } from '@/components/ui/StatusState'
import { useVideoDetail } from '@/hooks/useVideoDetail'
import VideoBreadcrumb from './VideoBreadcrumb'
import VideoPlayerSection from './VideoPlayerSection'
import VideoInfoSection from './VideoInfoSection'
import InteractionBar from './InteractionBar'
import CommentSection from './CommentSection'
import CollectionSidebar from './CollectionSidebar'
import VideoDetailSkeleton from './VideoDetailSkeleton'
import ScrollToTopLever from '@/pages/Document/ScrollToTopLever'

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
      <div className="container mx-auto px-4 max-w-7xl">
        {/* 面包屑导航 */}
        <VideoBreadcrumb title={videoDetail.title} />

        <div className="flex gap-6 mt-0">
          {/* 左侧主内容区 */}
          <div className="flex-1 min-w-0">
            {/* 视频播放器 */}
            <VideoPlayerSection detail={videoDetail} />

            {/* 视频信息 */}
            <VideoInfoSection detail={videoDetail} interaction={interaction} />

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

          {/* 右侧合集栏（桌面端悬浮） */}
          <aside className="hidden md:block w-[30%] shrink-0">
            <div className="sticky top-20 space-y-6">
              <CollectionSidebar
                collections={collections}
                currentVideoId={videoDetail.id}
              />
              <ScrollToTopLever />
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
