/**
 * 后台管理菜单配置
 * 支持动态菜单管理，菜单名称、图标、顺序可通过后台API配置
 * 主要由后端API权限控制显示
 */

import type { LucideIcon } from 'lucide-react'
import {
  Home,
  Users,
  FileText,
  Settings,
  FolderOpen,
  Tag,
  ShieldCheck,
  Upload,
  ClipboardCheck,
  Database,
  MessageSquare,
  Video,
  Edit3,
  Bot,
  Monitor,
  List,
  RefreshCw,
  MessageCircle,
  Cog
} from 'lucide-react'

/**
 * 菜单项接口定义
 */
export interface MenuItem {
  /** 菜单唯一标识 */
  key: string
  /** 菜单显示名称 */
  label: string
  /** 路由路径 */
  path?: string
  /** 图标（支持组件或字符串名称） */
  icon?: LucideIcon | string
  /** 子菜单列表 */
  children?: MenuItem[]
  /** 是否隐藏 */
  hidden?: boolean
  /** 是否外部链接 */
  external?: boolean
  /** 权限标识 */
  permission?: string
  /** 排序序号 */
  order?: number
  /** 父菜单key */
  parentKey?: string
  /** 图标名称（用于动态加载） */
  iconName?: string
}

/**
 * 菜单配置接口
 */
export interface MenuConfig {
  /** 菜单列表 */
  menus: MenuItem[]
  /** 系统名称 */
  systemName: string
  /** 版本号 */
  version: string
}

/**
 * 后台管理系统默认菜单配置
 * 包含8大模块：仪表盘、机器人平台、人员管理、视频管理、文档管理、审批流、系统管理、系统运维
 */
export const ADMIN_MENUS: MenuItem[] = [
  {
    key: 'dashboard',
    label: '仪表盘',
    path: '/admin/dashboard',
    icon: Home,
    order: 1,
    permission: 'dashboard:view'
  },
  {
    key: 'robot',
    label: '机器人平台',
    icon: Bot,
    order: 2,
    permission: 'robot:view',
    children: [
      {
        key: 'robot-dingding',
        label: '钉钉机器人',
        path: '/admin/robot/dingding',
        icon: Bot,
        order: 1,
        permission: 'robot:dingding:view',
        parentKey: 'robot'
      },
      {
        key: 'robot-wechat',
        label: '微信机器人',
        path: '/admin/robot/wechat',
        icon: MessageSquare,
        order: 2,
        permission: 'robot:wechat:view',
        parentKey: 'robot'
      },
      {
        key: 'robot-napcat',
        label: 'NapCat机器人',
        path: '/admin/robot/napcat',
        icon: Bot,
        order: 3,
        permission: 'robot:napcat:view',
        parentKey: 'robot'
      },
      {
        key: 'robot-qq',
        label: 'QQ机器人',
        path: '/admin/robot/qq',
        icon: MessageCircle,
        order: 4,
        permission: 'robot:qq:view',
        parentKey: 'robot'
      }
    ]
  },
  {
    key: 'personnel',
    label: '人员管理',
    icon: Users,
    order: 3,
    permission: 'personnel:view',
    children: [
      {
        key: 'personnel-menu',
        label: '菜单管理',
        path: '/admin/personnel/menu',
        icon: List,
        order: 1,
        permission: 'personnel:menu:view',
        parentKey: 'personnel'
      },
      {
        key: 'personnel-role',
        label: '角色管理',
        path: '/admin/personnel/role',
        icon: ShieldCheck,
        order: 2,
        permission: 'personnel:role:view',
        parentKey: 'personnel'
      },
      {
        key: 'personnel-user',
        label: '用户管理',
        path: '/admin/personnel/user',
        icon: Users,
        order: 3,
        permission: 'personnel:user:view',
        parentKey: 'personnel'
      }
    ]
  },
  {
    key: 'video',
    label: '视频管理',
    icon: Video,
    order: 4,
    permission: 'video:view',
    children: [
      {
        key: 'video-list',
        label: '视频列表',
        path: '/admin/video/list',
        icon: FolderOpen,
        order: 1,
        permission: 'video:list:view',
        parentKey: 'video'
      },
      {
        key: 'video-upload',
        label: '视频上传',
        path: '/admin/video/upload',
        icon: Upload,
        order: 2,
        permission: 'video:upload:view',
        parentKey: 'video'
      }
    ]
  },
  {
    key: 'document',
    label: '文档管理',
    icon: FileText,
    order: 5,
    permission: 'document:view',
    children: [
      {
        key: 'document-edit',
        label: '文档编辑',
        path: '/admin/document/edit',
        icon: Edit3,
        order: 1,
        permission: 'document:edit:view',
        parentKey: 'document'
      },
      {
        key: 'document-list',
        label: '文档列表',
        path: '/admin/document/list',
        icon: FileText,
        order: 2,
        permission: 'document:list:view',
        parentKey: 'document'
      },
      {
        key: 'document-upload',
        label: '文档上传',
        path: '/admin/document/upload',
        icon: Upload,
        order: 3,
        permission: 'document:upload:view',
        parentKey: 'document'
      }
    ]
  },
  {
    key: 'audit',
    label: '审批流',
    icon: ClipboardCheck,
    order: 6,
    permission: 'audit:view',
    children: [
      {
        key: 'audit-front',
        label: '前台审批',
        path: '/admin/audit/front',
        icon: ClipboardCheck,
        order: 1,
        permission: 'audit:front:view',
        parentKey: 'audit'
      }
    ]
  },
  {
    key: 'system',
    label: '系统管理',
    icon: Settings,
    order: 7,
    permission: 'system:view',
    children: [
      {
        key: 'system-config',
        label: '参数配置',
        path: '/admin/system/config',
        icon: Cog,
        order: 1,
        permission: 'system:config:view',
        parentKey: 'system'
      },
      {
        key: 'system-dictionary',
        label: '字典管理',
        path: '/admin/system/dictionary',
        icon: Tag,
        order: 2,
        permission: 'system:dictionary:view',
        parentKey: 'system'
      }
    ]
  },
  {
    key: 'monitor',
    label: '系统运维',
    icon: Monitor,
    order: 8,
    permission: 'monitor:view',
    children: [
      {
        key: 'monitor-cache',
        label: '缓存列表',
        path: '/admin/monitor/cache',
        icon: Database,
        order: 1,
        permission: 'monitor:cache:view',
        parentKey: 'monitor'
      },
      {
        key: 'monitor-behavior',
        label: '用户行为',
        path: '/admin/monitor/behavior',
        icon: RefreshCw,
        order: 2,
        permission: 'monitor:behavior:view',
        parentKey: 'monitor'
      }
    ]
  }
]

/**
 * 对菜单列表按order字段排序
 * @param menus - 菜单列表
 * @returns 排序后的菜单列表
 */
export const getSortedMenus = (menus: MenuItem[]): MenuItem[] => {
  return [...menus]
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map((menu) => ({
      ...menu,
      children: menu.children ? getSortedMenus(menu.children) : undefined
    }))
}

/**
 * 将嵌套菜单展平为一维数组
 * @param menus - 菜单列表
 * @param parentPath - 父路径前缀
 * @returns 展平后的菜单列表
 */
export const flattenMenus = (menus: MenuItem[], parentPath = ''): MenuItem[] => {
  return menus.reduce<MenuItem[]>((acc, menu) => {
    const currentPath = parentPath ? `${parentPath}/${menu.key}` : menu.key
    acc.push({ ...menu, key: currentPath })
    if (menu.children) {
      acc.push(...flattenMenus(menu.children, currentPath))
    }
    return acc
  }, [])
}

/**
 * 根据路由路径查找菜单项
 * @param menus - 菜单列表
 * @param path - 路由路径
 * @returns 匹配的菜单项（如果找到）
 */
export const findMenuByPath = (menus: MenuItem[], path: string): MenuItem | undefined => {
  for (const menu of menus) {
    if (menu.path === path) return menu
    if (menu.children) {
      const found = findMenuByPath(menu.children, path)
      if (found) return found
    }
  }
  return undefined
}

/**
 * 根据菜单key查找菜单项
 * @param menus - 菜单列表
 * @param key - 菜单key
 * @returns 匹配的菜单项（如果找到）
 */
export const findMenuByKey = (menus: MenuItem[], key: string): MenuItem | undefined => {
  for (const menu of menus) {
    if (menu.key === key) return menu
    if (menu.children) {
      const found = findMenuByKey(menu.children, key)
      if (found) return found
    }
  }
  return undefined
}

/**
 * 获取菜单项的路径
 * @param menu - 菜单项
 * @returns 菜单路径
 */
export const getMenuPath = (menu: MenuItem): string => {
  return menu.path || ''
}

/**
 * 获取面包屑路径
 * @param menus - 菜单列表
 * @param path - 当前路由路径
 * @returns 面包屑菜单项数组
 */
export const getBreadcrumb = (menus: MenuItem[], path: string): MenuItem[] => {
  const breadcrumb: MenuItem[] = []
  const findPath = (items: MenuItem[], targetPath: string): boolean => {
    for (const menu of items) {
      if (menu.path === targetPath) {
        breadcrumb.unshift(menu)
        return true
      }
      if (menu.children && findPath(menu.children, targetPath)) {
        breadcrumb.unshift(menu)
        return true
      }
    }
    return false
  }
  findPath(menus, path)
  return breadcrumb
}