/**
 * 权限路由守卫组件
 * 用于保护需要特定权限的路由
 * 无权限时仅显示提示，不做跳转
 */

import { useUserStore } from '@/stores/user'
import type { UserRole } from '@/types'

interface PermissionRouteProps {
  children: React.ReactNode
  /** 允许访问的角色列表 */
  roles?: UserRole[]
  /** 允许访问的权限列表 */
  permissions?: string[]
  /** 是否需要登录 */
  requireAuth?: boolean
  /** 无权限时显示的组件 */
  fallback?: React.ReactNode
}

/**
 * 权限路由守卫组件
 * 无权限时仅显示提示信息，不做任何跳转
 *
 * 权限判断逻辑：
 * 1. 首先判断角色：super_admin 或 admin 角色拥有所有权限
 * 2. 其他角色根据缓存中的 userInfo.permissions 进行判断
 */
export function PermissionRoute({
  children,
  roles,
  permissions,
  requireAuth = true,
  fallback,
}: PermissionRouteProps) {
  const { isLoggedIn, hasRole, hasPermission, userInfo } = useUserStore()

  // 需要登录但未登录，仅提示
  if (requireAuth && !isLoggedIn) {
    if (fallback) return <>{fallback}</>
    return <NoPermissionTip message="请先登录" />
  }

  // 超级管理员和admin角色拥有所有权限，直接放行
  if (userInfo?.roles.includes('super_admin') || userInfo?.roles.includes('admin')) {
    return <>{children}</>
  }

  // 检查角色权限
  if (roles && !hasRole(roles)) {
    if (fallback) return <>{fallback}</>
    return <NoPermissionTip />
  }

  // 检查功能权限
  if (permissions && !hasPermission(permissions)) {
    if (fallback) return <>{fallback}</>
    return <NoPermissionTip />
  }

  return <>{children}</>
}

/**
 * 无权限提示组件
 */
function NoPermissionTip({ message = '无访问权限' }: { message?: string }) {
  return (
    <div className="flex h-full min-h-[200px] items-center justify-center">
      <p className="text-default-400">{message}</p>
    </div>
  )
}
