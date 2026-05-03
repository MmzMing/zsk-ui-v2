/**
 * 当前用户统计数据 Hook
 * 按需请求当前登录用户的统计数据（点赞、收藏、粉丝等），不做缓存
 */

// ===== 1. 依赖导入区域 =====
import { useState, useEffect, useCallback } from 'react'
import { getUserStats } from '@/api/profile'
import type { UserStats } from '@/api/profile'

// ===== 2. 类型定义区域 =====

/**
 * Hook 返回值类型
 */
interface UseCurrentUserStatsReturn {
  /** 用户统计数据 */
  stats: UserStats | null
  /** 加载中 */
  loading: boolean
  /** 错误信息 */
  error: string | null
  /** 重新请求 */
  refresh: () => void
}

// ===== 4. Hook 定义区域 =====

/**
 * 当前用户统计数据 Hook
 * 每次调用都会重新请求后端接口，不做本地缓存
 * 
 * @returns 统计数据与操作方法
 * @example
 * const { stats, loading, refresh } = useCurrentUserStats()
 */
export function useCurrentUserStats(): UseCurrentUserStatsReturn {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * 请求用户统计数据
   */
  const fetchStats = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getUserStats()
      if (response && response.code === 200 && response.data) {
        setStats(response.data)
      }
    } catch {
      setError('获取统计数据失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return {
    stats,
    loading,
    error,
    refresh: fetchStats,
  }
}

export default useCurrentUserStats
