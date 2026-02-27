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
 */
export function AuthGuard({ 
  permission, 
  all = false, 
  fallback = null, 
  children 
}: AuthGuardProps) {
  const { userInfo, isLoggedIn } = useUserStore()

  // 未登录不渲染
  if (!isLoggedIn || !userInfo) {
    return <>{fallback}</>
  }

  // 超级管理员(admin角色)拥有所有权限
  if (userInfo.role === 'admin') {
    return <>{children}</>
  }

  // 如果没有要求权限，直接渲染
  if (!permission) {
    return <>{children}</>
  }

  const userPermissions = userInfo.permissions || []
  const requiredPermissions = Array.isArray(permission) ? permission : [permission]

  const hasPermission = all
    ? requiredPermissions.every(p => userPermissions.includes(p))
    : requiredPermissions.some(p => userPermissions.includes(p))

  if (hasPermission) {
    return <>{children}</>
  }

  return <>{fallback}</>
}
