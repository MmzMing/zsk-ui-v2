/**
 * 权限控制组件
 * 用于根据用户权限码动态显示/隐藏 UI 元素
 */

import React from 'react'
import { useUserStore } from '@/stores/user'

interface AuthGuardProps {
  /**
   * 所需权限码，可以是字符串或字符串数组
   * 如果是数组，默认满足其中之一即可（OR 逻辑）
   */
  permission?: string | string[]
  /**
   * 是否需要满足所有权限（AND 逻辑），仅在 permission 为数组时生效
   */
  all?: boolean
  /**
   * 无权限时渲染的内容
   */
  fallback?: React.ReactNode
  /**
   * 正常渲染的内容
   */
  children: React.ReactNode
}

/**
 * 权限控制组件
 * 用于根据用户权限码动态显示/隐藏 UI 元素
 * 
 * 权限判断逻辑：
 * 1. 首先判断角色：super_admin 或 admin 角色拥有所有权限
 * 2. 其他角色根据缓存中的 userInfo.permissions 进行判断
 */
export function AuthGuard({ permission, all = false, fallback = null, children }: AuthGuardProps) {
  const { userInfo, isLoggedIn, hasPermission, hasAllPermissions } = useUserStore()

  // 未登录不渲染
  if (!isLoggedIn || !userInfo) {
    return <>{fallback}</>
  }

  // 超级管理员(super_admin)和admin角色拥有所有权限，直接渲染
  if (userInfo.roles.includes('super_admin') || userInfo.roles.includes('admin')) {
    return <>{children}</>
  }

  // 如果没有要求权限，直接渲染
  if (!permission) {
    return <>{children}</>
  }

  // 使用缓存中的权限列表进行判断
  const requiredPermissions = Array.isArray(permission) ? permission : [permission]

  // 根据配置选择判断逻辑
  const hasAccess = all ? hasAllPermissions(requiredPermissions) : hasPermission(requiredPermissions)

  if (hasAccess) {
    return <>{children}</>
  }

  return <>{fallback}</>
}
