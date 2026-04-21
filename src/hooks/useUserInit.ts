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
import { useMenuStore } from '@/stores/menu'
import { getCurrentUser } from '@/api/auth'
import { getUserStats } from '@/api/profile'
import { getStorageValue, setStorage, STORAGE_KEYS } from '@/utils/storage'
import { toast } from '@/utils'
import type { UserInfo } from '@/types'
import type { UserStats } from '@/api/profile'

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
  user: UserInfo
  timestamp: number
}

/**
 * 用户统计数据缓存结构
 */
interface CachedUserStats {
  stats: UserStats
  timestamp: number
}

// ===== 3. 常量定义区域 =====

/** 用户信息缓存过期时间（毫秒）- 2小时 */
const USER_INFO_CACHE_EXPIRY = 1000 * 60 * 60 * 2

/** 用户统计数据缓存过期时间（毫秒）- 30分钟 */
const USER_STATS_CACHE_EXPIRY = 1000 * 60 * 30

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
  const setPermissions = useUserStore(state => state.setPermissions)
  const setLoading = useUserStore(state => state.setLoading)
  const refreshMenus = useMenuStore(state => state.refreshMenus)
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
        
        // 检查是否存在缓存的用户信息
        const cachedUserInfo = getStorageValue<CachedUserInfo>(STORAGE_KEYS.USER_INFO)

        // 如果 cookie 为空但缓存中有用户信息，说明登录已过期
        if (!token && cachedUserInfo) {
          handleLoginExpired(setUserInfo, setUserStats)
          return
        }

        // 只有当 Cookie 中有 token 时，才处理用户信息
        if (token) {
          const now = Date.now()

          // ===== 用户信息初始化 =====
          await initUserInfo(now, setUserInfo, setPermissions)

          // ===== 用户统计数据初始化 =====
          await initUserStats(now, setUserStats)

          // ===== 菜单数据初始化 =====
          await refreshMenus()
        }
      } finally {
        // 无论成功与否，都标记初始化完成
        setLoading(false)
        setIsInit(true)
      }
    }

    // 执行初始化
    initUser()
  }, [setUserInfo, setUserStats, setPermissions, setLoading, refreshMenus])

  return { isInit }
}

// ===== 5. 辅助函数区域 =====

/**
 * 处理登录过期逻辑
 * 清空缓存和状态，提示用户并跳转到登录页面
 * 
 * @param setUserInfo - 用户信息设置函数
 * @param setUserStats - 用户统计数据设置函数
 */
function handleLoginExpired(
  setUserInfo: (user: UserInfo | null) => void,
  setUserStats: (stats: UserStats | null) => void
): void {
  // 清空缓存中的用户信息
  setStorage(STORAGE_KEYS.USER_INFO, null)
  setStorage(STORAGE_KEYS.USER_STATS, null)

  // 清空状态管理中的用户信息
  setUserInfo(null)
  setUserStats(null)

  // 提示用户登录已过期
  toast.error('登录已过期，请重新登录')

  // 使用 window.location 跳转到登录页面（避免 Router 上下文问题）
  window.location.href = '/login'
}

/**
 * 初始化用户信息
 * 优先使用缓存，缓存过期或不存在时调用接口获取
 * 
 * @param now - 当前时间戳
 * @param setUserInfo - 用户信息设置函数
 */
async function initUserInfo(
  now: number,
  setUserInfo: (user: UserInfo | null) => void,
  setPermissions: (permissions: string[]) => void
): Promise<void> {
  // 尝试从 localStorage 获取缓存的用户信息
  const cachedUserInfo = getStorageValue<CachedUserInfo>(STORAGE_KEYS.USER_INFO)

  // 检查缓存是否过期，如果过期则清除缓存
  if (cachedUserInfo && now - cachedUserInfo.timestamp >= USER_INFO_CACHE_EXPIRY) {
    setStorage(STORAGE_KEYS.USER_INFO, null)
  }

  // 如果缓存存在且未过期，直接使用缓存
  if (cachedUserInfo && now - cachedUserInfo.timestamp < USER_INFO_CACHE_EXPIRY) {
    setUserInfo(cachedUserInfo.user)
    setPermissions(cachedUserInfo.user.permissions || [])
    return
  }

  // 缓存不存在或已过期，调用接口获取最新信息
  try {
    const loginUser = await getCurrentUser()
    
    // 验证返回数据的有效性
    if (loginUser && loginUser.sysUser) {
      const { sysUser, permissions, roles } = loginUser
      
      // 如果后端返回了 roles 数组且不为空，则直接使用；否则设置为 ['user']
      const userRoles = roles && roles.length > 0 ? roles : ['user']
      
      // 转换用户状态（0 表示正常，其他表示停用）
      const status: 'active' | 'inactive' | 'banned' = sysUser.status === '0' ? 'active' : 'inactive'
      
      // 构建标准化的用户信息对象
      const user = {
        id: String(sysUser.id ?? ''),
        name: sysUser.nickName ?? '',
        email: sysUser.email ?? '',
        avatar: sysUser.avatar,
        roles: userRoles,
        permissions: permissions || [],
        status,
        createdAt: sysUser.loginDate ?? '',
        updatedAt: sysUser.loginDate ?? '',
        bio: sysUser.remark
      }

      // 更新状态和缓存（带过期时间戳）
      setUserInfo(user)
      setPermissions(user.permissions)
      setStorage(STORAGE_KEYS.USER_INFO, { user, timestamp: now })
    }
  } catch {
    // 接口失败时，如果有未过期的缓存则使用缓存
    if (cachedUserInfo && now - cachedUserInfo.timestamp < USER_INFO_CACHE_EXPIRY) {
      setUserInfo(cachedUserInfo.user)
      setPermissions(cachedUserInfo.user.permissions || [])
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
  setUserStats: (stats: UserStats | null) => void
): Promise<void> {
  // 尝试从 localStorage 获取缓存的用户统计数据
  const cachedUserStats = getStorageValue<CachedUserStats>(STORAGE_KEYS.USER_STATS)

  // 检查缓存是否过期，如果过期则清除缓存
  if (cachedUserStats && now - cachedUserStats.timestamp >= USER_STATS_CACHE_EXPIRY) {
    setStorage(STORAGE_KEYS.USER_STATS, null)
  }

  // 如果缓存存在且未过期，直接使用缓存
  if (cachedUserStats && now - cachedUserStats.timestamp < USER_STATS_CACHE_EXPIRY) {
    setUserStats(cachedUserStats.stats)
    return
  }

  // 缓存不存在或已过期，调用接口获取最新统计数据
  try {
    const statsResponse = await getUserStats()
    
    // 验证响应的有效性（code 为 200 且有数据）
    if (statsResponse && statsResponse.code === 200 && statsResponse.data) {
      // 更新状态和缓存（带过期时间戳）
      setUserStats(statsResponse.data)
      setStorage(STORAGE_KEYS.USER_STATS, { stats: statsResponse.data, timestamp: now })
    }
  } catch {
    // 接口失败时，如果有未过期的缓存则使用缓存
    if (cachedUserStats && now - cachedUserStats.timestamp < USER_STATS_CACHE_EXPIRY) {
      setUserStats(cachedUserStats.stats)
    }
  }
}

// ===== 6. 默认导出 =====
export default useUserInit
