/**
 * 路由权限配置
 * 用于控制后台管理系统的路由访问权限
 */

import type { UserRole } from '@/types'

/**
 * 路由权限配置接口
 */
export interface RoutePermission {
  /** 允许访问的角色列表 */
  roles?: UserRole[]
  /** 允许访问的权限列表（满足任一即可） */
  permissions?: string[]
  /** 是否需要登录 */
  requireAuth?: boolean
  /** 无权限时重定向路径 */
  redirectTo?: string
}

/**
 * 后台路由权限配置映射表
 * 根据 menu.ts 中的菜单配置设置对应权限
 */
export const ADMIN_ROUTE_PERMISSIONS: Record<string, RoutePermission> = {
  // 仪表盘 - 所有登录用户可访问
  '/admin/dashboard': {
    requireAuth: true,
  },

  // 系统管理
  '/admin/system/config': {
    requireAuth: true,
    permissions: ['system:config:view'],
  },
  '/admin/system/dictionary': {
    requireAuth: true,
    permissions: ['system:dictionary:view'],
  },

  // 运维管理
  '/admin/ops/monitor': {
    requireAuth: true,
    permissions: ['ops:monitor:view'],
  },
  '/admin/ops/cache': {
    requireAuth: true,
    permissions: ['ops:cache:view'],
  },
  '/admin/ops/log': {
    requireAuth: true,
    permissions: ['ops:log:view'],
  },
  '/admin/ops/system': {
    requireAuth: true,
    permissions: ['ops:system:view'],
  },
  '/admin/ops/behavior': {
    requireAuth: true,
    permissions: ['ops:behavior:view'],
  },

  // 机器人平台
  '/admin/robot/qq': {
    requireAuth: true,
    permissions: ['robot:qq:view'],
  },
  '/admin/robot/dingding': {
    requireAuth: true,
    permissions: ['robot:dingding:view'],
  },
  '/admin/robot/wechat': {
    requireAuth: true,
    permissions: ['robot:wechat:view'],
  },
  '/admin/robot/napcat': {
    requireAuth: true,
    permissions: ['robot:napcat:view'],
  },

  // 视频管理
  '/admin/video/list': {
    requireAuth: true,
    permissions: ['video:list:view'],
  },
  '/admin/video/upload': {
    requireAuth: true,
    permissions: ['video:upload:view'],
  },
  '/admin/video/audit': {
    requireAuth: true,
    permissions: ['video:audit:view'],
  },

  // 文档管理
  '/admin/document/list': {
    requireAuth: true,
    permissions: ['document:list:view'],
  },
  '/admin/document/upload': {
    requireAuth: true,
    permissions: ['document:upload:view'],
  },
  '/admin/document/audit': {
    requireAuth: true,
    permissions: ['document:audit:view'],
  },
  '/admin/document/edit': {
    requireAuth: true,
    permissions: ['document:edit:view'],
  },

  // 人员管理 - 通过权限控制访问
  '/admin/personnel/user': {
    requireAuth: true,
    permissions: ['personnel:user:view'],
  },
  '/admin/personnel/role': {
    requireAuth: true,
    permissions: ['personnel:role:view'],
  },
  '/admin/personnel/menu': {
    requireAuth: true,
    permissions: ['personnel:menu:view'],
  },
}

/**
 * 默认权限配置
 */
export const DEFAULT_PERMISSION: RoutePermission = {
  requireAuth: true,
}

/**
 * 角色默认权限映射
 */
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  super_admin: ['*'], // 超级管理员拥有所有权限

  admin: [
    'system:config:view',
    'ops:monitor:view',
    'robot:qq:view',
    'robot:dingding:view',
    'video:view',
    'robot:wechat:view',
    'personnel:user:view',
    'personnel:role:view',
  ],

  user: ['video:view', 'document:view'],

  guest: [],
}

/**
 * 获取路由权限配置
 * @param path - 路由路径
 * @returns 权限配置
 */
export function getRoutePermission(path: string): RoutePermission {
  return ADMIN_ROUTE_PERMISSIONS[path] || DEFAULT_PERMISSION
}
