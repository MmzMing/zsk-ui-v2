/**
 * 用户状态管理
 * 
 * 权限管理策略：
 * - 权限列表（permissions）：仅存内存，不持久化
 * - 用户信息（userInfo）：内存 + localStorage 双写，保证刷新不丢失
 */

// ===== 1. 依赖导入区域 =====
import { create } from 'zustand'
import type { UserInfo, UserRole } from '@/types'
import { logout as logoutApi } from '@/api/auth'
import { getStorageValue, setStorage, removeStorage, STORAGE_KEYS, clearAllCookies } from '@/utils/storage'
import { toast } from '@/utils/toast'
import { useMenuStore } from './menu'

// ===== 2. 类型定义区域 =====

/**
 * 持久化状态接口
 * 包含需要保存到 localStorage 的状态字段
 */
interface PersistedState {
  /** 用户信息（包含 roles 和 permissions） */
  userInfo: UserInfo | null
  /** 是否已登录 */
  isLoggedIn: boolean
}

/**
 * 用户状态接口
 * 继承持久化状态并添加临时状态和方法
 */
interface UserState extends PersistedState {
  /** 加载状态 */
  isLoading: boolean

  /** 设置用户信息 */
  setUserInfo: (user: UserInfo | null) => void
  /** 退出登录 */
  logout: () => void
  /** 设置加载状态 */
  setLoading: (loading: boolean) => void
  /** 设置权限列表（内存态） */
  setPermissions: (permissions: string[]) => void
  /** 检查是否拥有指定角色 */
  hasRole: (roles: UserRole | UserRole[]) => boolean
  /** 检查是否拥有指定权限（满足任一即可） */
  hasPermission: (permissions: string | string[]) => boolean
  /** 检查是否拥有所有指定权限 */
  hasAllPermissions: (permissions: string[]) => boolean
}

// ===== 3. 状态管理工具函数区域 =====

/**
 * 从 localStorage 加载持久化状态
 * @returns 持久化状态对象
 */
function loadPersistedState(): PersistedState {
  const cached = getStorageValue<{ userInfo: UserInfo | null, isLoggedIn: boolean }>(STORAGE_KEYS.USER_INFO)
  return {
    userInfo: cached?.userInfo ?? null,
    isLoggedIn: cached?.isLoggedIn ?? false,
  }
}

/**
 * 保存持久化状态到 localStorage
 * @param state - 需要保存的状态对象
 */
function savePersistedState(userInfo: UserInfo | null, isLoggedIn: boolean): void {
  setStorage(STORAGE_KEYS.USER_INFO, { userInfo, isLoggedIn })
}

// ===== 4. 状态初始化区域 =====

/** 从 localStorage 加载的持久化状态 */
const persistedState = loadPersistedState()

// ===== 5. Store 定义区域 =====

/**
 * 用户状态管理 Store
 * 使用 zustand 创建，通过手动管理 localStorage 实现持久化
 */
export const useUserStore = create<UserState>()((set, get) => ({
  // 初始状态：从 localStorage 加载的持久化状态 + 临时状态
  ...persistedState,
  isLoading: false,

  /**
   * 设置用户信息
   * @param user - 用户信息对象，null 表示清除
   */
  setUserInfo: (user) => {
    set({
      userInfo: user,
      isLoggedIn: !!user,
    })
    savePersistedState(user, !!user)
  },

  /**
   * 退出登录
   * 调用后端注销接口，清除本地缓存和状态管理中的用户信息
   * 同时清空菜单缓存和所有 Cookie
   */
  logout: async () => {
    try {
      await logoutApi()
      toast.success('退出登录成功')
    } catch (error) {
      console.error('后端退出登录失败：', error)
    }
    removeStorage(STORAGE_KEYS.USER_INFO)
    useMenuStore.getState().clearMenuCache()
    clearAllCookies()
    set({
      userInfo: null,
      isLoggedIn: false,
      isLoading: false,
    })
  },

  /**
   * 设置加载状态
   * @param loading - 是否正在加载
   */
  setLoading: (loading) =>
    set({
      isLoading: loading,
    }),

  /**
   * 设置权限列表（仅内存态，不持久化）
   * 权限信息仅存于 userInfo.permissions 中，页面刷新后会丢失，需重新请求
   * @param permissions - 权限字符串数组
   */
  setPermissions: (permissions) => {
    const { userInfo } = get()
    if (userInfo) {
      set({
        userInfo: { ...userInfo, permissions },
      })
    }
  },

  /**
   * 检查用户是否拥有指定角色
   * @param roles - 角色或角色数组
   * @returns 是否拥有指定角色（满足任一即可）
   */
  hasRole: (roles) => {
    const { userInfo } = get()
    if (!userInfo) return false

    const roleArray = Array.isArray(roles) ? roles : [roles]

    return roleArray.some((role) => userInfo.roles.includes(role))
  },

  /**
   * 检查用户是否拥有指定权限
   * @param permissions - 权限或权限数组
   * @returns 是否拥有指定权限（满足任一即可）
   * 
   * 权限判断逻辑：
   * 1. 首先判断角色：super_admin 或 admin 角色拥有所有权限
   * 2. 其他角色根据缓存中的 userInfo.permissions 进行判断
   */
  hasPermission: (permissions) => {
    const { userInfo } = get()
    if (!userInfo) return false

    // 超级管理员和 admin 角色拥有所有权限，直接放行
    if (userInfo.roles.includes('super_admin') || userInfo.roles.includes('admin')) {
      return true
    }

    const permissionArray = Array.isArray(permissions) ? permissions : [permissions]
    const effectivePermissions = userInfo.permissions || []

    return permissionArray.some((permission) => effectivePermissions.includes(permission))
  },

  /**
   * 检查用户是否拥有所有指定权限
   * @param permissions - 权限数组
   * @returns 是否拥有所有指定权限
   * 
   * 权限判断逻辑：
   * 1. 首先判断角色：super_admin 或 admin 角色拥有所有权限
   * 2. 其他角色根据缓存中的 userInfo.permissions 进行判断
   */
  hasAllPermissions: (permissions) => {
    const { userInfo } = get()
    if (!userInfo) return false

    // 超级管理员和 admin 角色拥有所有权限，直接放行
    if (userInfo.roles.includes('super_admin') || userInfo.roles.includes('admin')) {
      return true
    }

    const effectivePermissions = userInfo.permissions || []

    return permissions.every((permission) => effectivePermissions.includes(permission))
  },
}))