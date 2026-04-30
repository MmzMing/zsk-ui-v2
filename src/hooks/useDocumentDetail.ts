/**
 * 文档详情数据获取 Hook
 * 渐进式加载：元信息 → 交互数据
 */

import { useState, useEffect, useCallback } from 'react'
import { toast } from '@/utils/toast'
import { useUserStore } from '@/stores/user'
import {
  getDocHomeNoteDetail,
  getDocHomeNoteInteraction,
  toggleDocHomeNoteLike,
  toggleDocHomeNoteFavorite,
  toggleDocHomeNoteFollow,
} from '@/api/document'
import type { DocHomeNoteDetail, DocHomeInteraction } from '@/types/document.types'

export function useDocumentDetail(noteId: string) {
  const isLoggedIn = useUserStore((s) => s.isLoggedIn)

  const [detail, setDetail] = useState<DocHomeNoteDetail | null>(null)
  const [interaction, setInteraction] = useState<DocHomeInteraction | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [likeLoading, setLikeLoading] = useState(false)
  const [favLoading, setFavLoading] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)

  // 阶段1：获取文档元信息
  useEffect(() => {
    if (!noteId) return

    const loadDetail = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getDocHomeNoteDetail(noteId)
        setDetail(data)
      } catch {
        setError('文档加载失败，请重试')
        toast.error('文档加载失败，请重试')
      } finally {
        setIsLoading(false)
      }
    }
    loadDetail()
  }, [noteId])

  // 阶段2：元信息加载完后，获取交互数据
  useEffect(() => {
    if (!noteId) return

    const loadInteraction = async () => {
      try {
        const data = await getDocHomeNoteInteraction(noteId)
        setInteraction(data)
      } catch {
        // 交互信息加载失败不影响正文展示
      }
    }
    loadInteraction()
  }, [noteId])

  // 交互更新回调
  const handleInteractionUpdate = useCallback(
    (partial: Partial<DocHomeInteraction>) => {
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
      const res = await toggleDocHomeNoteLike(noteId)
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
  }, [isLoggedIn, interaction, noteId, handleInteractionUpdate])

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
      const res = await toggleDocHomeNoteFavorite(noteId)
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
  }, [isLoggedIn, interaction, noteId, handleInteractionUpdate])

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
      const res = await toggleDocHomeNoteFollow(author.id)
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
    detail,
    interaction,
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
