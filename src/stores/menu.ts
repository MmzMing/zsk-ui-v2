/**
 * 菜单状态管理
 * 仅使用 Zustand 内存态管理，不做 localStorage 缓存
 * 前台和登录页不获取菜单，仅后台页面调用时从接口获取
 */

// ===== 1. 依赖导入区域 =====
import { create } from 'zustand'
import type { MenuItem } from '@/constants/menu'
import type { SysMenu } from '@/types/menu.types'
import { getMenuTree } from '@/api/admin/menu'
import { getIconsByName } from '@/utils/icons'

/**
 * 菜单状态接口
 */
interface MenuState {
  /** 动态菜单数据（从后端获取） */
  dynamicMenus: MenuItem[]
  /** 是否正在加载 */
  isLoading: boolean
  /** 加载错误 */
  error: Error | null
  /** 是否已加载过 */
  hasLoaded: boolean

  /** 获取菜单数据（从后端拉取） */
  fetchMenus: () => Promise<void>
  /** 强制刷新菜单 */
  refreshMenus: () => Promise<void>
  /** 清空菜单数据（退出登录时调用） */
  clearMenuCache: () => void
}

/**
 * 将后端 SysMenu 转换为前端 MenuItem 格式
 */
function convertSysMenuToMenuItem(menu: SysMenu, parentKey?: string): MenuItem {
  const iconName = menu.icon || ''
  const IconComponent = getIconsByName(iconName)

  return {
    key: menu.id,
    label: menu.menuName,
    path: menu.path || undefined,
    icon: IconComponent || undefined,
    iconName: iconName || undefined,
    permission: menu.perms || undefined,
    order: menu.orderNum,
    parentKey: parentKey,
    hidden: menu.visible === '1',
    children: menu.children
      ? menu.children.map(child => convertSysMenuToMenuItem(child, menu.id))
      : undefined
  }
}

/**
 * 按 orderNum 排序菜单（递归处理子菜单）
 */
function sortMenusByOrder(menus: MenuItem[]): MenuItem[] {
  return [...menus]
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map(menu => ({
      ...menu,
      children: menu.children ? sortMenusByOrder(menu.children) : undefined
    }))
}

/**
 * 菜单 Store
 * 纯内存态，不持久化
 */
export const useMenuStore = create<MenuState>()((set, get) => ({
  dynamicMenus: [],
  isLoading: false,
  error: null,
  hasLoaded: false,

  /**
   * 获取菜单数据（从后端拉取）
   * 如果已加载过且有数据，直接返回
   */
  fetchMenus: async () => {
    const { isLoading, dynamicMenus, hasLoaded } = get()
    
    if (isLoading) return
    
    // 已加载且有数据则不重复请求
    if (hasLoaded && dynamicMenus.length > 0) return

    set({ isLoading: true, error: null })

    try {
      const sysMenus = await getMenuTree()
      
      // 转换为前端 MenuItem 格式
      const menuItems = sysMenus.map(menu => convertSysMenuToMenuItem(menu))
      const sortedMenus = sortMenusByOrder(menuItems)

      set({
        dynamicMenus: sortedMenus,
        isLoading: false,
        error: null,
        hasLoaded: true
      })
    } catch (error) {
      console.error('获取菜单树失败：', error)
      set({
        isLoading: false,
        error: error instanceof Error ? error : new Error('获取菜单失败'),
        hasLoaded: false
      })
    }
  },

  /**
   * 强制刷新菜单（忽略缓存，重新请求）
   */
  refreshMenus: async () => {
    const { isLoading } = get()
    
    if (isLoading) return

    set({ isLoading: true, error: null })

    try {
      const sysMenus = await getMenuTree()
      
      // 转换为前端 MenuItem 格式
      const menuItems = sysMenus.map(menu => convertSysMenuToMenuItem(menu))
      const sortedMenus = sortMenusByOrder(menuItems)

      set({
        dynamicMenus: sortedMenus,
        isLoading: false,
        error: null,
        hasLoaded: true
      })
    } catch (error) {
      console.error('刷新菜单树失败：', error)
      set({
        isLoading: false,
        error: error instanceof Error ? error : new Error('刷新菜单失败'),
        hasLoaded: false
      })
    }
  },

  /**
   * 清空菜单数据
   * 退出登录时调用
   */
  clearMenuCache: () => {
    set({
      dynamicMenus: [],
      hasLoaded: false,
      error: null
    })
  }
}))
