/**
 * 应用设置状态管理
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// 主题模式类型
export type ThemeMode = 'light' | 'dark' | 'system'

// 菜单布局类型（后台管理）
export type MenuLayout = 'vertical' | 'horizontal' | 'mixed' | 'dual' | 'dock'

// 页面切换动效类型
export type PageTransition = 'none' | 'fade' | 'slide' | 'scale' | 'layered'

// 语言类型
export type Language = 'zh-CN' | 'en-US'

// 应用设置接口
interface AppSettings {
  /** 主题模式 */
  themeMode: ThemeMode
  /** 主色调 */
  primaryColor: string
  /** 菜单布局 */
  menuLayout: MenuLayout
  /** 语言 */
  language: Language
  /** 启用边框 */
  enableBorder: boolean
  /** 启用阴影 */
  enableShadow: boolean
  /** 多标签页 */
  multiTab: boolean
  /** 显示顶栏 */
  showHeader: boolean
  /** 面包屑导航 */
  showBreadcrumb: boolean
  /** 侧边栏手风琴 */
  sidebarAccordion: boolean
  /** 允许选择文字 */
  allowTextSelection: boolean
  /** 色弱模式 */
  colorWeak: boolean
  /** 点击动效 */
  clickEffect: boolean
  /** 菜单宽度 */
  menuWidth: number
  /** 全局圆角 */
  borderRadius: number
  /** 字体大小 */
  fontSize: number
  /** 内容区边距 */
  contentPadding: number
  /** 页面切换动效 */
  pageTransition: PageTransition
  /** 显示水印 */
  showWatermark: boolean
}

// 应用状态接口
interface AppState extends AppSettings {
  /** 侧边栏折叠状态 */
  sidebarCollapsed: boolean
  /** 是否全屏 */
  isFullscreen: boolean

  // Actions
  /** 更新设置 */
  updateSettings: (settings: Partial<AppSettings>) => void
  /** 重置设置 */
  resetSettings: () => void
  /** 切换侧边栏 */
  toggleSidebar: () => void
  /** 设置侧边栏状态 */
  setSidebarCollapsed: (collapsed: boolean) => void
  /** 切换全屏 */
  toggleFullscreen: () => void
}

// 默认设置
const defaultSettings: AppSettings = {
  themeMode: 'system',
  primaryColor: '#537BF9',
  menuLayout: 'vertical',
  language: 'zh-CN',
  enableBorder: false,
  enableShadow: false,
  multiTab: false,
  showHeader: true,
  showBreadcrumb: false,
  sidebarAccordion: true,
  allowTextSelection: false,
  colorWeak: false,
  clickEffect: true,
  menuWidth: 220,
  borderRadius: 12,
  fontSize: 14,
  contentPadding: 16,
  pageTransition: 'fade',
  showWatermark: false,
}

// 默认后台设置（与前台隔离）
const defaultAdminSettings: AppSettings = {
  ...defaultSettings,
  menuLayout: 'vertical', // 后台默认垂直布局
}

/**
 * 应用全局状态 Store
 * 包含：基础 UI 设置、后台管理独立设置、侧边栏状态、全屏状态等
 */
export const useAppStore = create<AppState & {
  /** 后台独立设置 */
  adminSettings: AppSettings
  /** 更新后台独立设置 */
  updateAdminSettings: (settings: Partial<AppSettings>) => void
  /** 重置后台独立设置 */
  resetAdminSettings: () => void
}>()(
  persist(
    (set) => ({
      // --- 1. 状态初始化 ---
      ...defaultSettings,
      /** 侧边栏折叠状态 */
      sidebarCollapsed: false,
      /** 全屏状态标识 */
      isFullscreen: false,
      /** 后台独立设置初始化 */
      adminSettings: defaultAdminSettings,

      // --- 2. 基础 Action ---
      
      /**
       * 更新全局基础设置
       * @param newSettings - 需要更新的设置项
       */
      updateSettings: (newSettings) =>
        set((state) => ({
          ...state,
          ...newSettings,
        })),

      /**
       * 更新后台管理系统独立设置
       * @param newSettings - 需要更新的后台设置项
       */
      updateAdminSettings: (newSettings) =>
        set((state) => ({
          adminSettings: {
            ...state.adminSettings,
            ...newSettings,
          },
        })),

      /**
       * 重置全局基础设置为默认值
       */
      resetSettings: () =>
        set((state) => ({
          ...state,
          ...defaultSettings,
        })),

      /**
       * 重置后台管理系统设置为默认值
       */
      resetAdminSettings: () =>
        set({
          adminSettings: defaultAdminSettings,
        }),

      /**
       * 切换侧边栏展开/收起状态
       */
      toggleSidebar: () =>
        set((state) => ({
          sidebarCollapsed: !state.sidebarCollapsed,
        })),

      /**
       * 设置侧边栏固定状态
       * @param collapsed - 是否折叠
       */
      setSidebarCollapsed: (collapsed) =>
        set({
          sidebarCollapsed: collapsed,
        }),

      /**
       * 切换浏览器全屏状态
       */
      toggleFullscreen: () => {
        if (typeof document === 'undefined') return

        if (!document.fullscreenElement) {
          // 进入全屏
          document.documentElement.requestFullscreen()
          set({ isFullscreen: true })
        } else {
          // 退出全屏
          document.exitFullscreen()
          set({ isFullscreen: false })
        }
      },
    }),
    {
      // --- 3. 持久化配置 ---
      /** 本地存储 Key 名称 */
      name: 'zsk-app-settings',
      /** 
       * 定义需要持久化的状态字段
       * 避免将不必要的状态（如全屏状态）存入本地存储
       */
      partialize: (state) => ({
        themeMode: state.themeMode,
        primaryColor: state.primaryColor,
        menuLayout: state.menuLayout,
        language: state.language,
        enableBorder: state.enableBorder,
        enableShadow: state.enableShadow,
        multiTab: state.multiTab,
        showHeader: state.showHeader,
        showBreadcrumb: state.showBreadcrumb,
        sidebarAccordion: state.sidebarAccordion,
        allowTextSelection: state.allowTextSelection,
        colorWeak: state.colorWeak,
        clickEffect: state.clickEffect,
        menuWidth: state.menuWidth,
        borderRadius: state.borderRadius,
        fontSize: state.fontSize,
        contentPadding: state.contentPadding,
        pageTransition: state.pageTransition,
        showWatermark: state.showWatermark,
        sidebarCollapsed: state.sidebarCollapsed,
        // 持久化后台独立设置
        adminSettings: state.adminSettings,
      }),
    }
  )
)
