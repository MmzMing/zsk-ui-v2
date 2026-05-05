/**
 * 用户初始化 Hook
 * 用于初始化用户登录状态，不包含用户统计数据
 *
 * 功能特性：
 * - 自动检测用户登录状态（通过 Cookie 认证）
 * - 优先使用本地缓存展示用户信息，同时异步刷新最新数据
 * - 接口返回 401 时清除本地缓存并跳转登录页
 * - 状态管理集成（Zustand）
 * 
 * 注意：
 * - 用户统计数据（UserStats）不再在此初始化，各组件按需使用 useCurrentUserStats Hook 请求
 * - 菜单数据不在登录时加载，仅后台页面进入时按需获取
 */

// ===== 1. 依赖导入区域 =====
import { useEffect, useState } from 'react'
import { useUserStore } from '@/stores/user'
import { useDictAll } from '@/hooks/useDict'
import { getCurrentUser } from '@/api/auth'
import { getStorageValue, removeStorage, STORAGE_KEYS, clearAllCookies } from '@/utils/storage'
import type { UserInfo } from '@/types'

// ===== 2. 类型定义区域 =====

/**
 * Hook 返回值类型
 */
interface UseUserInitReturn {
  /** 初始化是否完成 */
  isInit: boolean
}

// ===== 4. Hook 定义区域 =====

/**
 * 用户初始化 Hook
 * 负责在应用启动时初始化用户登录状态
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
  const setPermissions = useUserStore(state => state.setPermissions)
  const setLoading = useUserStore(state => state.setLoading)
  const { loadAll: loadAllDicts } = useDictAll()
  const [isInit, setIsInit] = useState(false)

  useEffect(() => {
    /**
     * 初始化用户状态函数
     */
    const initUser = async () => {
      setLoading(true)
      try {
        // 尝试获取用户信息，如果成功说明 Cookie 认证有效
        const isLoggedIn = await initUserInfo(setUserInfo, setPermissions)

        // 已登录用户加载字典缓存（菜单由后台页面按需获取）
        if (isLoggedIn) {
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
  }, [setUserInfo, setPermissions, setLoading, loadAllDicts])

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
  const cachedUserInfo = getStorageValue<{ userInfo: UserInfo }>(STORAGE_KEYS.USER_INFO)
  if (cachedUserInfo?.userInfo) {
    setUserInfo(cachedUserInfo.userInfo)
    // 如果缓存中有权限，先使用
    if (cachedUserInfo.userInfo.permissions) {
      setPermissions(cachedUserInfo.userInfo.permissions)
    }
  }

  // 直接尝试请求接口验证登录状态，由后端 401 状态码判断是否已登录
  try {
    const loginUser = await getCurrentUser({ skipAuthRedirect: true })

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
  clearAllCookies()

  // 清空状态管理中的用户信息
  setUserInfo(null)
  // 页面会由路由守卫或错误处理逻辑跳转到登录页
}

// ===== 6. 默认导出 =====
export default useUserInit
