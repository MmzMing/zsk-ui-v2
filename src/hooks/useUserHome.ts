/**
 * 用户作品主页数据获取 Hook
 * 并行加载：作品列表 + 统计数据
 * 支持分页加载更多、类型筛选、关注操作（乐观更新）
 */

// ===== 1. 依赖导入区域 =====
// React 核心
import { useState, useEffect, useCallback, useRef } from 'react'

// 工具函数
import { toast } from '@/utils/toast'

// 状态管理
import { useUserStore } from '@/stores/user'

// API
import {
  getDocHomeUserWorks,
  getDocHomeUserStats,
  toggleDocHomeNoteFollow,
} from '@/api/document'

// 类型定义
import type {
  DocHomeUserWorksVo,
  DocHomeUserStatsVo,
  DocHomeAuthor,
} from '@/types/document.types'

// ===== 2. 类型定义区域 =====
/** 作品类型筛选 */
export type UserHomeTypeFilter = 'all' | 'note' | 'video'

/** Hook 返回值 */
export interface UseUserHomeReturn {
  /** 作品列表 */
  works: DocHomeUserWorksVo[]
  /** 作品列表加载中 */
  worksLoading: boolean
  /** 作品列表错误信息 */
  worksError: string | null
  /** 统计数据 */
  stats: DocHomeUserStatsVo | null
  /** 统计数据加载中 */
  statsLoading: boolean
  /** 当前页码 */
  pageNum: number
  /** 是否有更多数据 */
  hasMore: boolean
  /** 总记录数 */
  total: number
  /** 加载更多 */
  loadMore: () => void
  /** 加载更多中 */
  loadingMore: boolean
  /** 类型筛选 */
  typeFilter: UserHomeTypeFilter
  /** 设置类型筛选 */
  setTypeFilter: (type: UserHomeTypeFilter) => void
  /** 作者信息（从路由 state 传入） */
  author: DocHomeAuthor | null
  /** 是否已关注 */
  isFollowing: boolean
  /** 关注操作加载中 */
  followLoading: boolean
  /** 关注/取关操作 */
  handleFollow: () => void
}

// ===== 3. 通用工具函数区域 =====
/** 每页大小 */
const PAGE_SIZE = 10

// ===== 4. 导出区域 =====
/**
 * 用户作品主页数据获取 Hook
 *
 * @param userId - 目标用户ID
 * @param initialAuthor - 从路由 state 传入的作者信息（头像/昵称/粉丝/关注状态）
 * @returns 用户主页数据与交互方法
 */
export function useUserHome(
  userId: string,
  initialAuthor?: DocHomeAuthor | null
): UseUserHomeReturn {
  const isLoggedIn = useUserStore((s) => s.isLoggedIn)

  // ===== 3. 状态控制逻辑区域 =====
  const [works, setWorks] = useState<DocHomeUserWorksVo[]>([])
  const [worksLoading, setWorksLoading] = useState(true)
  const [worksError, setWorksError] = useState<string | null>(null)

  const [stats, setStats] = useState<DocHomeUserStatsVo | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  const [pageNum, setPageNum] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [total, setTotal] = useState(0)
  const [loadingMore, setLoadingMore] = useState(false)

  const [typeFilter, setTypeFilterState] = useState<UserHomeTypeFilter>('all')

  const [author, setAuthor] = useState<DocHomeAuthor | null>(initialAuthor ?? null)
  const [isFollowing, setIsFollowing] = useState(initialAuthor?.isFollowing ?? false)
  const [followLoading, setFollowLoading] = useState(false)

  /** 防止重复请求的标记 */
  const loadingRef = useRef(false)

  // ===== 7. 数据处理函数区域 =====
  /**
   * 加载作品列表
   * @param page - 页码
   * @param type - 类型筛选
   * @param append - 是否追加模式（加载更多）
   */
  const fetchWorks = useCallback(
    async (page: number, type: UserHomeTypeFilter, append = false) => {
      if (!userId) return

      if (!append) {
        setWorksLoading(true)
        setWorksError(null)
      } else {
        setLoadingMore(true)
      }

      try {
        const params: { type?: string; pageNum: number; pageSize: number } = {
          pageNum: page,
          pageSize: PAGE_SIZE,
        }
        // 仅在筛选笔记或视频时传 type 参数，全部不传
        if (type !== 'all') {
          params.type = type
        }

        const data = await getDocHomeUserWorks(userId, params)

        if (append) {
          setWorks((prev) => [...prev, ...data.list])
        } else {
          setWorks(data.list)
        }
        setTotal(data.total)
        setHasMore(data.hasNext)
        setPageNum(page)
      } catch {
        const errMsg = '作品列表加载失败，请重试'
        if (!append) {
          setWorksError(errMsg)
          toast.error(errMsg)
        } else {
          toast.error('加载更多失败，请重试')
        }
      } finally {
        setWorksLoading(false)
        setLoadingMore(false)
      }
    },
    [userId]
  )

  /**
   * 加载统计数据
   */
  const fetchStats = useCallback(async () => {
    if (!userId) return

    setStatsLoading(true)
    try {
      const data = await getDocHomeUserStats(userId)
      setStats(data)
    } catch {
      // 统计数据加载失败不阻塞页面
    } finally {
      setStatsLoading(false)
    }
  }, [userId])

  // ===== 9. 页面初始化与事件绑定 =====
  /**
   * 初始化：并行加载作品列表 + 统计数据
   */
  useEffect(() => {
    if (!userId) return

    Promise.all([fetchWorks(1, typeFilter), fetchStats()])
  }, [userId, fetchWorks, fetchStats, typeFilter])

  /**
   * 同步外部传入的作者信息
   */
  useEffect(() => {
    if (initialAuthor) {
      setAuthor(initialAuthor)
      setIsFollowing(initialAuthor.isFollowing)
    }
  }, [initialAuthor])

  /**
   * 加载更多
   */
  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore || loadingRef.current) return

    const nextPage = pageNum + 1
    loadingRef.current = true
    fetchWorks(nextPage, typeFilter, true).finally(() => {
      loadingRef.current = false
    })
  }, [loadingMore, hasMore, pageNum, typeFilter, fetchWorks])

  /**
   * 切换类型筛选
   * 重置页码，重新请求
   */
  const setTypeFilter = useCallback((type: UserHomeTypeFilter) => {
    setTypeFilterState(type)
    setWorks([])
    setWorksError(null)
  }, [])

  /**
   * 关注/取关操作（乐观更新）
   */
  const handleFollow = useCallback(async () => {
    if (!isLoggedIn) {
      toast.info('请先登录')
      return
    }

    const authorId = author?.id || userId
    const prevFollowing = isFollowing
    const newFollowing = !prevFollowing

    // 乐观更新
    setIsFollowing(newFollowing)
    if (author) {
      setAuthor({
        ...author,
        isFollowing: newFollowing,
        fans: Math.max(0, author.fans + (newFollowing ? 1 : -1)),
      })
    }

    setFollowLoading(true)
    try {
      const res = await toggleDocHomeNoteFollow(authorId)
      setIsFollowing(res.status)
      if (author) {
        setAuthor({
          ...author,
          isFollowing: res.status,
          fans: res.count,
        })
      }
    } catch {
      // 回滚
      setIsFollowing(prevFollowing)
      if (author) {
        setAuthor({
          ...author,
          isFollowing: prevFollowing,
          fans: author.fans,
        })
      }
      toast.error('操作失败，请重试')
    } finally {
      setFollowLoading(false)
    }
  }, [isLoggedIn, author, userId, isFollowing])

  return {
    works,
    worksLoading,
    worksError,
    stats,
    statsLoading,
    pageNum,
    hasMore,
    total,
    loadMore,
    loadingMore,
    typeFilter,
    setTypeFilter,
    author,
    isFollowing,
    followLoading,
    handleFollow,
  }
}
