/**
 * 后台管理菜单配置
 */

import type { IconType } from 'react-icons'
import {
  HiOutlineHome,
  HiOutlineUserGroup,
  HiOutlineDocumentText,
  HiOutlineCog,
  HiOutlineChartBar,
  HiOutlineFolder,
  HiOutlineTag,
  HiOutlineChatAlt2,
  HiOutlineBell,
  HiOutlineShieldCheck,
  HiOutlineTemplate
} from 'react-icons/hi'

// 菜单项类型
export interface MenuItem {
  /** 菜单唯一标识 */
  key: string
  /** 菜单名称 */
  label: string
  /** 路由路径 */
  path?: string
  /** 图标 */
  icon?: IconType
  /** 子菜单 */
  children?: MenuItem[]
  /** 是否隐藏 */
  hidden?: boolean
  /** 外部链接 */
  external?: boolean
  /** 权限标识 */
  permission?: string
  /** 排序 */
  order?: number
}

// 后台管理菜单配置
export const ADMIN_MENUS: MenuItem[] = [
  {
    key: 'dashboard',
    label: '仪表盘',
    path: '/admin/dashboard',
    icon: HiOutlineHome,
    order: 1
  },
  {
    key: 'content',
    label: '内容管理',
    icon: HiOutlineFolder,
    order: 2,
    children: [
      {
        key: 'articles',
        label: '文章管理',
        path: '/admin/content/articles',
        icon: HiOutlineDocumentText,
        permission: 'content:article:list'
      },
      {
        key: 'categories',
        label: '分类管理',
        path: '/admin/content/categories',
        icon: HiOutlineTag,
        permission: 'content:category:list'
      }
    ]
  },
  {
    key: 'user',
    label: '用户管理',
    icon: HiOutlineUserGroup,
    order: 3,
    children: [
      {
        key: 'users',
        label: '用户列表',
        path: '/admin/user/users',
        permission: 'user:list'
      },
      {
        key: 'roles',
        label: '角色管理',
        path: '/admin/user/roles',
        icon: HiOutlineShieldCheck,
        permission: 'user:role:list'
      }
    ]
  },
  {
    key: 'interaction',
    label: '互动管理',
    icon: HiOutlineChatAlt2,
    order: 4,
    children: [
      {
        key: 'comments',
        label: '评论管理',
        path: '/admin/interaction/comments',
        permission: 'interaction:comment:list'
      },
      {
        key: 'messages',
        label: '留言管理',
        path: '/admin/interaction/messages',
        icon: HiOutlineBell,
        permission: 'interaction:message:list'
      }
    ]
  },
  {
    key: 'analysis',
    label: '数据分析',
    path: '/admin/analysis',
    icon: HiOutlineChartBar,
    order: 5,
    permission: 'analysis:view'
  },
  {
    key: 'system',
    label: '系统设置',
    icon: HiOutlineCog,
    order: 6,
    children: [
      {
        key: 'general',
        label: '基础设置',
        path: '/admin/system/general',
        icon: HiOutlineCog
      },
      {
        key: 'theme',
        label: '主题设置',
        path: '/admin/system/theme',
        icon: HiOutlineTemplate
      }
    ]
  }
]

// 根据排序获取排序后的菜单
export const getSortedMenus = (menus: MenuItem[]): MenuItem[] => {
  return [...menus]
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map((menu) => ({
      ...menu,
      children: menu.children ? getSortedMenus(menu.children) : undefined
    }))
}

// 扁平化菜单（用于搜索等场景）
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
