/**
 * 权限判断 Hook
 * 提供权限检查功能
 */

import { useCallback, useMemo } from 'react'
import { useUserStore } from '@/stores/user'
import { getRoutePermission } from '@/config/permissions'

/**
 * 权限判断 Hook
 * 提供权限检查功能
 * 
 * 权限判断逻辑：
 * 1. 首先判断角色：super_admin 或 admin 角色拥有所有权限
 * 2. 其他角色根据缓存中的 userInfo.permissions 进行判断
 */
export function usePermission() {
  const { userInfo, isLoggedIn, hasRole, hasPermission, hasAllPermissions } = useUserStore()

  /**
   * 检查是否可以访问指定路由
   */
  const canAccessRoute = useCallback(
    (path: string): boolean => {
      // 超级管理员和admin角色拥有所有权限
      if (userInfo?.roles.includes('super_admin') || userInfo?.roles.includes('admin')) {
        return true
      }

      const permission = getRoutePermission(path)

      // 无权限配置，允许访问
      if (!permission.requireAuth) return true

      // 需要登录但未登录
      if (permission.requireAuth && !isLoggedIn) return false

      // 检查角色权限
      if (permission.roles && !hasRole(permission.roles)) return false

      // 检查功能权限
      if (permission.permissions && !hasPermission(permission.permissions)) return false

      return true
    },
    [isLoggedIn, hasRole, hasPermission, userInfo]
  )

  /**
   * 过滤出有权限访问的菜单
   */
  const filterMenusByPermission = useCallback(
    <T extends { permission?: string; children?: T[] }>(menus: T[]): T[] => {
      // 超级管理员和admin角色显示所有菜单
      if (userInfo?.roles.includes('super_admin') || userInfo?.roles.includes('admin')) {
        return menus
      }

      return menus
        .filter((menu) => {
          // 无权限配置，默认显示
          if (!menu.permission) return true

          // 检查权限
          if (!hasPermission(menu.permission)) return false

          // 递归过滤子菜单
          if (menu.children && menu.children.length > 0) {
            const filteredChildren = filterMenusByPermission(menu.children)
            if (filteredChildren.length === 0) return false
          }

          return true
        })
        .map((menu) => {
          if (menu.children && menu.children.length > 0) {
            return {
              ...menu,
              children: filterMenusByPermission(menu.children),
            }
          }
          return menu
        })
    },
    [hasPermission, userInfo]
  )

  /**
   * 获取用户权限列表
   * 从缓存中的 userInfo.permissions 获取
   */
  const userPermissions = useMemo(() => {
    return userInfo?.permissions || []
  }, [userInfo])

  /**
   * 获取用户角色列表
   */
  const userRoles = useMemo(() => {
    return userInfo?.roles || []
  }, [userInfo])

  /**
   * 是否是超级管理员
   */
  const isSuperAdmin = useMemo(() => {
    return userInfo?.roles?.includes('super_admin') ?? false
  }, [userInfo])

  /**
   * 是否是管理员（包括超级管理员）
   */
  const isAdmin = useMemo(() => {
    return (userInfo?.roles?.includes('super_admin') ?? false) || (userInfo?.roles?.includes('admin') ?? false)
  }, [userInfo])

  return {
    userInfo,
    isLoggedIn,
    userPermissions,
    userRoles,
    isSuperAdmin,
    isAdmin,
    hasRole,
    hasPermission,
    hasAllPermissions,
    canAccessRoute,
    filterMenusByPermission,
  }
}
