/**
 * 后台路由权限守卫
 * 自动检查当前路由的权限配置
 */

import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { useUserStore } from '@/stores/user'
import { getRoutePermission } from '@/constants/menu'
import type { UserRole } from '@/types'
import NoPermission from '@/pages/NoPermission'

/**
 * 后台路由权限守卫
 * 自动检查当前路由的权限配置
 * 
 * 权限判断逻辑：
 * 1. 首先判断角色：super_admin 或 admin 角色拥有所有权限
 * 2. 其他角色根据缓存中的 userInfo.permissions 进行判断
 */
export function ProtectedRoute() {
  const location = useLocation()
  const { isLoggedIn, hasRole, hasPermission, userInfo } = useUserStore()

  // 未登录，重定向到登录页
  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  // 超级管理员和admin角色拥有所有权限，直接放行
  if (userInfo?.roles.includes('super_admin') || userInfo?.roles.includes('admin')) {
    return <Outlet />
  }

  // 获取路由权限配置
  const permission = getRoutePermission(location.pathname)

  // 检查角色权限
  if (permission.roles && !hasRole(permission.roles as UserRole[])) {
    return <NoPermission />
  }

  // 检查功能权限
  if (permission.permissions && !hasPermission(permission.permissions)) {
    return <NoPermission />
  }

  return <Outlet />
}