/**
 * 用户初始化 Hook
 * 用于初始化用户登录状态，包含用户统计数据获取
 *
 * 功能特性：
 * - 自动检测用户登录状态（通过 Cookie 认证）
 * - 优先使用本地缓存展示用户信息，同时异步刷新最新数据
 * - 接口返回 401 时清除本地缓存并跳转登录页
 * - 状态管理集成（Zustand）
 */

// ===== 1. 依赖导入区域 =====
import { useEffect, useState } from 'react'
import { useUserStore } from '@/stores/user'
import { useMenuStore } from '@/stores/menu'
import { useDictAll } from '@/hooks/useDict'
import { getCurrentUser } from '@/api/auth'
import { getUserStats } from '@/api/profile'
import { getStorageValue, removeStorage, STORAGE_KEYS, clearAllCookies } from '@/utils/storage'
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
 * 用户统计数据缓存结构
 */
interface CachedUserStats {
  stats: UserStats
  timestamp: number
}

// ===== 3. 常量定义区域 =====

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
  const { loadAll: loadAllDicts } = useDictAll()
  const [isInit, setIsInit] = useState(false)

  useEffect(() => {
    /**
     * 初始化用户状态函数
     * 包含用户信息和统计数据的获取逻辑
     */
    const initUser = async () => {
      setLoading(true)
      try {
        // 尝试获取用户信息，如果成功说明 Cookie 认证有效
        const isLoggedIn = await initUserInfo(setUserInfo, setPermissions)

        // 仅已登录用户才加载用户统计数据、菜单和字典
        if (isLoggedIn) {
          // ===== 用户统计数据初始化 =====
          await initUserStats(setUserStats)

          // ===== 菜单数据初始化 =====
          await refreshMenus()

          // ===== 字典缓存初始化 =====
          await loadAllDicts()
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
 * 初始化用户信息
 * 优先使用本地缓存快速展示，同时异步请求最新数据刷新
 *
 * @param setUserInfo - 用户信息设置函数
 * @param setPermissions - 权限设置函数
 * @returns 是否已登录
 */
async function initUserInfo(
  setUserInfo: (user: UserInfo | null) => void,
  setPermissions: (permissions: string[]) => void
): Promise<boolean> {
  // 如果本地有缓存，先使用缓存数据快速展示
  const cachedUserInfo = getStorageValue<{ userInfo: UserInfo, permissions: string[] }>(STORAGE_KEYS.USER_INFO)
  if (cachedUserInfo?.userInfo) {
    setUserInfo(cachedUserInfo.userInfo)
    setPermissions(cachedUserInfo.permissions || [])
  }

  // 无论是否有缓存，都尝试请求接口以验证 Cookie 是否有效
  // 注：前端无法读取 HttpOnly Cookie，只能通过接口响应判断登录状态
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

      // 更新状态
      setUserInfo(user)
      setPermissions(user.permissions)
      return true
    }
    return false
  } catch (error: unknown) {
    // 如果后端返回 401，说明 Token 已过期，清除本地缓存
    if ((error as { response?: { status?: number } })?.response?.status === 401) {
      handleLoginExpired(setUserInfo)
      return false
    }
    
    // 其他错误（如网络问题）保持现有缓存数据不变
    // 有缓存说明之前登录过，返回 true 继续加载其他资源；无缓存则返回 false
    return !!cachedUserInfo?.userInfo
  }
}

/**
 * 初始化用户统计数据
 * 优先使用缓存，缓存过期或不存在时调用接口获取
 *
 * @param setUserStats - 用户统计数据设置函数
 */
async function initUserStats(
  setUserStats: (stats: UserStats | null) => void
): Promise<void> {
  const now = Date.now()

  // 尝试从 localStorage 获取缓存的用户统计数据
  const cachedUserStats = getStorageValue<CachedUserStats>(STORAGE_KEYS.USER_STATS)

  // 检查缓存是否过期，如果过期则清除缓存
  if (cachedUserStats && now - cachedUserStats.timestamp >= USER_STATS_CACHE_EXPIRY) {
    removeStorage(STORAGE_KEYS.USER_STATS)
  }

  // 如果缓存存在且未过期，直接使用缓存
  if (cachedUserStats && now - cachedUserStats.timestamp < USER_STATS_CACHE_EXPIRY) {
    setUserStats(cachedUserStats.stats)
    return
  }

  // 如果缓存不存在，检查是否登录过（通过用户信息缓存判断）
  const cachedUserInfo = getStorageValue<{ userInfo: UserInfo }>(STORAGE_KEYS.USER_INFO)
  if (!cachedUserInfo?.userInfo) {
    // 未登录用户，不请求统计数据
    return
  }

  // 缓存不存在但用户已登录，调用接口获取最新统计数据
  try {
    const statsResponse = await getUserStats()

    // 验证响应的有效性（code 为 200 且有数据）
    if (statsResponse && statsResponse.code === 200 && statsResponse.data) {
      // 更新状态和缓存（带过期时间戳）
      setUserStats(statsResponse.data)
      // 注意：userStore 的 setUserStats 会自动保存到 localStorage
    }
  } catch {
    // 接口失败时，如果有未过期的缓存则使用缓存
    if (cachedUserStats && now - cachedUserStats.timestamp < USER_STATS_CACHE_EXPIRY) {
      setUserStats(cachedUserStats.stats)
    }
  }
}

/**
 * 处理登录过期逻辑
 * 清空缓存、Cookie 和状态，由后端驱动过期逻辑
 *
 * @param setUserInfo - 用户信息设置函数
 */
function handleLoginExpired(
  setUserInfo: (user: UserInfo | null) => void
): void {
  // 清空缓存中的用户信息
  removeStorage(STORAGE_KEYS.USER_INFO)
  removeStorage(STORAGE_KEYS.USER_STATS)
  removeStorage(STORAGE_KEYS.MENU_CACHE)
  clearAllCookies()

  // 清空状态管理中的用户信息
  setUserInfo(null)
  // 页面会由路由守卫或错误处理逻辑跳转到登录页
}

// ===== 6. 默认导出 =====
export default useUserInit
