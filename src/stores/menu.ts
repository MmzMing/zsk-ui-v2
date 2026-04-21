/**
 * 菜单状态管理
 * 支持从后端获取菜单树数据，并使用30分钟过期缓存
 * 退出登录时自动清空缓存
 */

import { create } from 'zustand'
import type { MenuItem } from '@/constants/menu'
import type { SysMenu } from '@/types/menu.types'
import { getStorageValue, setStorage, removeStorage, STORAGE_KEYS } from '@/utils/storage'
import { getMenuTree } from '@/api/admin/menu'
import { getIconsByName } from '@/utils/icons'

// 缓存过期时间：30分钟（毫秒）
const CACHE_EXPIRE_TIME = 30 * 60 * 1000

/**
 * 菜单缓存数据结构
 */
interface MenuCache {
  /** 菜单数据 */
  menus: SysMenu[]
  /** 缓存时间戳 */
  timestamp: number
}

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
  /** 缓存是否有效 */
  isCacheValid: boolean

  /** 获取菜单数据（自动处理缓存） */
  fetchMenus: () => Promise<void>
  /** 强制刷新菜单（忽略缓存） */
  refreshMenus: () => Promise<void>
  /** 清空菜单缓存 */
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
 * 从缓存加载菜单数据
 */
function loadMenuCache(): MenuCache | null {
  const cached = getStorageValue<MenuCache>(STORAGE_KEYS.MENU_CACHE)
  if (!cached) return null

  // 检查缓存是否过期（30分钟）
  const now = Date.now()
  if (now - cached.timestamp > CACHE_EXPIRE_TIME) {
    removeStorage(STORAGE_KEYS.MENU_CACHE)
    return null
  }

  return cached
}

export const useMenuStore = create<MenuState>()((set, get) => ({
  dynamicMenus: [],
  isLoading: false,
  error: null,
  isCacheValid: false,

  /**
   * 获取菜单数据（自动处理缓存）
   * 如果缓存有效则使用缓存，否则从后端获取
   */
  fetchMenus: async () => {
    const { isLoading, isCacheValid } = get()
    
    if (isLoading) return
    
    // 检查缓存是否有效
    const cached = loadMenuCache()
    if (cached && !isCacheValid) {
      // 使用缓存数据
      const menuItems = cached.menus.map(menu => convertSysMenuToMenuItem(menu))
      const sortedMenus = sortMenusByOrder(menuItems)
      set({
        dynamicMenus: sortedMenus,
        isLoading: false,
        error: null,
        isCacheValid: true
      })
      return
    }

    // 从后端获取数据
    await get().refreshMenus()
  },

  /**
   * 强制刷新菜单（忽略缓存）
   * 从后端获取最新数据并更新缓存
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

      // 保存到缓存
      const cacheData: MenuCache = {
        menus: sysMenus,
        timestamp: Date.now()
      }
      setStorage(STORAGE_KEYS.MENU_CACHE, cacheData)

      set({
        dynamicMenus: sortedMenus,
        isLoading: false,
        error: null,
        isCacheValid: true
      })
    } catch (error) {
      console.error('获取菜单树失败：', error)
      set({
        isLoading: false,
        error: error instanceof Error ? error : new Error('获取菜单失败'),
        isCacheValid: false
      })
    }
  },

  /**
   * 清空菜单缓存
   * 退出登录时调用
   */
  clearMenuCache: () => {
    removeStorage(STORAGE_KEYS.MENU_CACHE)
    set({
      dynamicMenus: [],
      isCacheValid: false,
      error: null
    })
  }
}))