/**
 * 用户初始化 Hook
 * 用于初始化用户登录状态，包含缓存策略和用户统计数据获取
 * 
 * 功能特性：
 * - 自动检测用户登录状态（通过 Cookie 中的 Token）
 * - 用户信息缓存机制（2小时过期）
 * - 用户统计数据缓存机制（点赞数、粉丝数、收藏数）
 * - 接口失败时自动回退到缓存数据
 * - 状态管理集成（Zustand）
 */

// ===== 1. 依赖导入区域 =====
import { useEffect, useState } from 'react'
import { useUserStore } from '@/stores/user'
import { getCurrentUser } from '@/api/auth'
import { getUserStats } from '@/api/profile'
import { getStorageValue, setStorage, STORAGE_KEYS } from '@/utils/storage'
import { logger } from '@/utils'

// ===== 2. 类型定义区域 =====

/**
 * Hook 返回值类型
 */
interface UseUserInitReturn {
  /** 初始化是否完成 */
  isInit: boolean
}

/**
 * 用户信息缓存数据结构
 */
interface CachedUserInfo {
  user: any
  timestamp: number
}

/**
 * 用户统计数据缓存结构
 */
interface CachedUserStats {
  stats: any
  timestamp: number
}

// ===== 3. 常量定义区域 =====

/** 缓存过期时间（毫秒）- 2小时 */
const CACHE_EXPIRY = 1000 * 60 * 60 * 2

// ===== 4. Hook 定义区域 =====

/**
 * 用户初始化 Hook
 * 负责在应用启动时初始化用户登录状态和统计数据
 * 
 * @returns 初始化状态对象
 * @example
 * const { isInit } = useUserInit()
 * 
 * if (!isInit) {
 *   return <LoadingComponent />
 * }
 * 
 * return <AppContent />
 */
export function useUserInit(): UseUserInitReturn {
  const setUserInfo = useUserStore(state => state.setUserInfo)
  const setUserStats = useUserStore(state => state.setUserStats)
  const setLoading = useUserStore(state => state.setLoading)
  const [isInit, setIsInit] = useState(false)

  useEffect(() => {
    /**
     * 初始化用户状态函数
     * 包含用户信息和统计数据的获取逻辑
     */
    const initUser = async () => {
      setLoading(true)
      try {
        // 从 Cookie 获取 Token，判断用户是否已登录
        const token = getStorageValue<string>(STORAGE_KEYS.TOKEN, undefined, 'cookie')
        
        // 只有当 Cookie 中有 token 时，才处理用户信息
        if (token) {
          const now = Date.now()

          // ===== 用户信息初始化 =====
          await initUserInfo(now, setUserInfo)

          // ===== 用户统计数据初始化 =====
          await initUserStats(now, setUserStats)
        }
      } catch (error) {
        // 初始化过程中的未知错误，记录日志但不中断流程
        logger.error('用户初始化过程中发生错误：', error)
      } finally {
        // 无论成功与否，都标记初始化完成
        setLoading(false)
        setIsInit(true)
      }
    }

    // 执行初始化
    initUser()
  }, [setUserInfo, setUserStats, setLoading])

  return { isInit }
}

// ===== 5. 辅助函数区域 =====

/**
 * 初始化用户信息
 * 优先使用缓存，缓存过期或不存在时调用接口获取
 * 
 * @param now - 当前时间戳
 * @param setUserInfo - 用户信息设置函数
 */
async function initUserInfo(
  now: number,
  setUserInfo: (user: any) => void
): Promise<void> {
  // 尝试从 localStorage 获取缓存的用户信息
  const cachedUserInfo = getStorageValue<CachedUserInfo>(STORAGE_KEYS.USER_INFO)

  // 如果缓存存在且未过期，直接使用缓存
  if (cachedUserInfo && now - cachedUserInfo.timestamp < CACHE_EXPIRY) {
    setUserInfo(cachedUserInfo.user)
    return
  }

  // 缓存不存在或已过期，调用接口获取最新信息
  try {
    const loginUser = await getCurrentUser()
    
    // 验证返回数据的有效性
    if (loginUser && loginUser.sysUser) {
      const { sysUser, permissions } = loginUser
      
      // 转换用户类型（00 表示管理员，其他表示普通用户）
      const role: 'admin' | 'user' = sysUser.userType === '00' ? 'admin' : 'user'
      
      // 转换用户状态（0 表示正常，其他表示停用）
      const status: 'active' | 'inactive' | 'banned' = sysUser.status === '0' ? 'active' : 'inactive'
      
      // 构建标准化的用户信息对象
      const user = {
        id: String(sysUser.id ?? ''),
        name: sysUser.userName ?? '',
        email: sysUser.email ?? '',
        avatar: sysUser.avatar,
        role,
        permissions,
        status,
        createdAt: sysUser.loginDate ?? '',
        updatedAt: sysUser.loginDate ?? '',
        bio: sysUser.remark
      }

      // 更新状态和缓存
      setUserInfo(user)
      setStorage(STORAGE_KEYS.USER_INFO, { user, timestamp: now })
    }
  } catch (apiError) {
    // 接口失败时，如果有缓存则使用缓存
    if (cachedUserInfo) {
      setUserInfo(cachedUserInfo.user)
    }
  }
}

/**
 * 初始化用户统计数据
 * 优先使用缓存，缓存过期或不存在时调用接口获取
 * 
 * @param now - 当前时间戳
 * @param setUserStats - 用户统计数据设置函数
 */
async function initUserStats(
  now: number,
  setUserStats: (stats: any) => void
): Promise<void> {
  // 尝试从 localStorage 获取缓存的用户统计数据
  const cachedUserStats = getStorageValue<CachedUserStats>(STORAGE_KEYS.USER_STATS)

  // 如果缓存存在且未过期，直接使用缓存
  if (cachedUserStats && now - cachedUserStats.timestamp < CACHE_EXPIRY) {
    setUserStats(cachedUserStats.stats)
    return
  }

  // 缓存不存在或已过期，调用接口获取最新统计数据
  try {
    const statsResponse = await getUserStats()
    
    // 验证响应的有效性（code 为 200 且有数据）
    if (statsResponse && statsResponse.code === 200 && statsResponse.data) {
      // 更新状态和缓存
      setUserStats(statsResponse.data)
      setStorage(STORAGE_KEYS.USER_STATS, { stats: statsResponse.data, timestamp: now })
    }
  } catch (apiError) {
    // 接口失败时，如果有缓存则使用缓存
    if (cachedUserStats) {
      setUserStats(cachedUserStats.stats)
    }
  }
}

// ===== 6. 默认导出 =====
export default useUserInit
