/**
 * 视频详情数据获取 Hook
 * 瀑布式加载：元信息 → 交互数据+合集（并行）
 */

import { useState, useEffect, useCallback } from 'react'
import { toast } from '@/utils/toast'
import { useUserStore } from '@/stores/user'
import {
  getHomeVideoDetail,
  getHomeVideoInteraction,
  getHomeVideoCollections,
  toggleHomeVideoLike,
  toggleHomeVideoFavorite,
  toggleHomeVideoFollow,
} from '@/api/video'
import type {
  HomeVideoDetail,
  HomeVideoInteraction,
  HomeVideoCollection,
} from '@/types/video-home.types'

export function useVideoDetail(videoId: string) {
  const isLoggedIn = useUserStore((s) => s.isLoggedIn)

  const [videoDetail, setVideoDetail] = useState<HomeVideoDetail | null>(null)
  const [interaction, setInteraction] = useState<HomeVideoInteraction | null>(null)
  const [collections, setCollections] = useState<HomeVideoCollection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [likeLoading, setLikeLoading] = useState(false)
  const [favLoading, setFavLoading] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)

  // 阶段1：获取视频元信息
  useEffect(() => {
    if (!videoId) return

    const loadDetail = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getHomeVideoDetail(videoId)
        setVideoDetail(data)
      } catch {
        setError('视频加载失败，请重试')
        toast.error('视频加载失败，请重试')
      } finally {
        setIsLoading(false)
      }
    }
    loadDetail()
  }, [videoId])

  // 阶段2：元信息加载完后，并行获取交互数据+合集
  useEffect(() => {
    if (!videoDetail) return

    const loadSecondary = async () => {
      try {
        const [interactionData, collectionsData] = await Promise.allSettled([
          getHomeVideoInteraction(videoId),
          getHomeVideoCollections(videoId),
        ])

        if (interactionData.status === 'fulfilled') {
          setInteraction(interactionData.value)
        }
        if (collectionsData.status === 'fulfilled') {
          setCollections(collectionsData.value)
        }
      } catch {
        // 交互信息加载失败不影响视频播放
      }
    }
    loadSecondary()
  }, [videoDetail, videoId])

  // 交互更新回调
  const handleInteractionUpdate = useCallback(
    (partial: Partial<HomeVideoInteraction>) => {
      setInteraction((prev) => (prev ? { ...prev, ...partial } : prev))
    },
    []
  )

  // 点赞
  const handleLike = useCallback(async () => {
    if (!isLoggedIn) {
      toast.info('请先登录')
      return
    }
    const prev = interaction
    const newStatus = !prev?.isLiked
    const newCount = (prev?.likeCount ?? 0) + (newStatus ? 1 : -1)
    handleInteractionUpdate({ isLiked: newStatus, likeCount: Math.max(0, newCount) })

    setLikeLoading(true)
    try {
      const res = await toggleHomeVideoLike(videoId)
      handleInteractionUpdate({ isLiked: res.status, likeCount: res.count })
      if (res.status) {
        toast.success('已点赞')
      } else {
        toast.success('已取消点赞')
      }
    } catch {
      handleInteractionUpdate({ isLiked: prev?.isLiked, likeCount: prev?.likeCount })
      toast.error('操作失败，请重试')
    } finally {
      setLikeLoading(false)
    }
  }, [isLoggedIn, interaction, videoId, handleInteractionUpdate])

  // 收藏
  const handleFavorite = useCallback(async () => {
    if (!isLoggedIn) {
      toast.info('请先登录')
      return
    }
    const prev = interaction
    const newStatus = !prev?.isFavorited
    const newCount = (prev?.favoriteCount ?? 0) + (newStatus ? 1 : -1)
    handleInteractionUpdate({ isFavorited: newStatus, favoriteCount: Math.max(0, newCount) })

    setFavLoading(true)
    try {
      const res = await toggleHomeVideoFavorite(videoId)
      handleInteractionUpdate({ isFavorited: res.status, favoriteCount: res.count })
      if (res.status) {
        toast.success('已收藏')
      } else {
        toast.success('已取消收藏')
      }
    } catch {
      handleInteractionUpdate({ isFavorited: prev?.isFavorited, favoriteCount: prev?.favoriteCount })
      toast.error('操作失败，请重试')
    } finally {
      setFavLoading(false)
    }
  }, [isLoggedIn, interaction, videoId, handleInteractionUpdate])

  // 关注作者
  const handleFollow = useCallback(async () => {
    if (!isLoggedIn) {
      toast.info('请先登录')
      return
    }
    const author = interaction?.author
    if (!author) return

    const prevFollowing = author.isFollowing
    const newStatus = !prevFollowing
    const newFans = (author.fans ?? 0) + (newStatus ? 1 : -1)
    handleInteractionUpdate({
      author: { ...author, isFollowing: newStatus, fans: Math.max(0, newFans) },
    })

    setFollowLoading(true)
    try {
      const res = await toggleHomeVideoFollow(author.id)
      handleInteractionUpdate({
        author: { ...author, isFollowing: res.status, fans: res.count },
      })
      if (res.status) {
        toast.success('关注成功')
      } else {
        toast.success('已取消关注')
      }
    } catch (e: unknown) {
      const err = e as Error
      handleInteractionUpdate({
        author: { ...author, isFollowing: prevFollowing, fans: author.fans },
      })
      toast.error(err?.message || '操作失败，请重试')
    } finally {
      setFollowLoading(false)
    }
  }, [isLoggedIn, interaction?.author, handleInteractionUpdate])

  // 分享
  const handleShare = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('链接已复制到剪贴板')
    } catch {
      toast.error('复制失败，请手动复制')
    }
  }, [])

  return {
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
    handleInteractionUpdate,
  }
}
