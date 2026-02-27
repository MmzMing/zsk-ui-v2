/**
 * 菜单布局上下文
 * 提供菜单布局相关的状态和方法
 */

import { createContext, useContext, useCallback, type ReactNode } from 'react'
import { useAppStore, type MenuLayout } from '@/stores/app'

// 菜单布局上下文类型
interface MenuLayoutContextValue {
  /** 当前菜单布局 */
  menuLayout: MenuLayout
  /** 切换菜单布局 */
  setMenuLayout: (layout: MenuLayout) => void
  /** 是否显示侧边栏 */
  showSidebar: boolean
  /** 是否显示顶栏 */
  showHeader: boolean
  /** 侧边栏是否折叠 */
  sidebarCollapsed: boolean
  /** 切换侧边栏折叠 */
  toggleSidebar: () => void
  /** 设置侧边栏折叠状态 */
  setSidebarCollapsed: (collapsed: boolean) => void
}

// 创建上下文
const MenuLayoutContext = createContext<MenuLayoutContextValue | null>(null)

//  Provider 组件属性
interface MenuLayoutProviderProps {
  children: ReactNode
}

// Provider 组件
export function MenuLayoutProvider({ children }: MenuLayoutProviderProps) {
  const {
    sidebarCollapsed,
    toggleSidebar,
    setSidebarCollapsed,
    adminSettings,
    updateAdminSettings
  } = useAppStore()

  const { menuLayout, showHeader } = adminSettings

  // 切换菜单布局
  const setMenuLayout = useCallback((layout: MenuLayout) => {
    updateAdminSettings({ menuLayout: layout })
  }, [updateAdminSettings])

  // 根据布局类型确定是否显示侧边栏
  // horizontal 布局不显示侧边栏，dock 布局不显示侧边栏
  const showSidebar = menuLayout !== 'horizontal' && menuLayout !== 'dock'

  const value: MenuLayoutContextValue = {
    menuLayout,
    setMenuLayout,
    showSidebar,
    showHeader,
    sidebarCollapsed,
    toggleSidebar,
    setSidebarCollapsed
  }

  return (
    <MenuLayoutContext.Provider value={value}>
      {children}
    </MenuLayoutContext.Provider>
  )
}

// 使用菜单布局上下文的钩子
export function useMenuLayout() {
  const context = useContext(MenuLayoutContext)
  if (!context) {
    throw new Error('useMenuLayout 必须在 MenuLayoutProvider 内使用')
  }
  return context
}

// 菜单布局配置
export interface MenuLayoutConfig {
  /** 布局类型 */
  type: MenuLayout
  /** 布局名称 */
  name: string
  /** 布局描述 */
  description: string
  /** 是否显示侧边栏 */
  showSidebar: boolean
  /** 是否显示顶栏 */
  showHeader: boolean
  /** 侧边栏位置 */
  sidebarPosition?: 'left' | 'right'
  /** 是否支持折叠 */
  collapsible?: boolean
}

// 菜单布局配置列表
export const MENU_LAYOUT_CONFIGS: Record<MenuLayout, MenuLayoutConfig> = {
  vertical: {
    type: 'vertical',
    name: '垂直布局',
    description: '侧边栏菜单垂直排列于页面左侧，菜单项从上至下展示',
    showSidebar: true,
    showHeader: true,
    sidebarPosition: 'left',
    collapsible: true
  },
  horizontal: {
    type: 'horizontal',
    name: '水平布局',
    description: '菜单横向排列于页面顶部，一级菜单平铺展示，二级及以上菜单通过下拉方式呈现',
    showSidebar: false,
    showHeader: true
  },
  mixed: {
    type: 'mixed',
    name: '混合布局',
    description: '顶部展示核心一级菜单，左侧垂直展示当前一级菜单下的子菜单',
    showSidebar: true,
    showHeader: true,
    sidebarPosition: 'left',
    collapsible: true
  },
  dual: {
    type: 'dual',
    name: '双列布局',
    description: '左侧侧边栏分为两列布局，首列展示核心功能入口，次列展示当前模块的细分菜单',
    showSidebar: true,
    showHeader: true,
    sidebarPosition: 'left',
    collapsible: false
  },
  dock: {
    type: 'dock',
    name: 'Dock布局',
    description: '使用 Dock 组件，包含菜单、主题、用户、全屏、消息和时间',
    showSidebar: false,
    showHeader: false
  }
}
