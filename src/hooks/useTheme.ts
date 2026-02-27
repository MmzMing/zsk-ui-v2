/**
 * 主题管理 Hook
 * 负责将主题设置应用到 DOM
 */

import { useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { useAppStore, type ThemeMode } from '@/stores/app'
import { generatePalette } from '@/utils/color'

// 主题模式映射
const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

// 获取实际主题
const getActualTheme = (mode: ThemeMode): 'light' | 'dark' => {
  if (mode === 'system') {
    return getSystemTheme()
  }
  return mode
}

export function useTheme() {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')

  const state = useAppStore()
  
  // 根据路由选择配置
  const settings = isAdmin ? state.adminSettings : state
  const updateFn = isAdmin ? state.updateAdminSettings : state.updateSettings

  const {
    themeMode,
    primaryColor,
    borderRadius,
    fontSize,
    contentPadding,
    enableBorder,
    enableShadow,
    colorWeak,
    allowTextSelection,
    clickEffect,
    menuWidth
  } = settings

  // 应用主题到 DOM
  const applyTheme = useCallback(() => {
    if (typeof document === 'undefined') return

    const root = document.documentElement
    const actualTheme = getActualTheme(themeMode)

    // 设置主题属性
    root.setAttribute('data-theme', actualTheme)
    
    // 切换 dark 类
    if (actualTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    // 生成色阶
    const palette = generatePalette(primaryColor)

    // 应用 CSS 变量 - Color Primary (Tailwind Custom)
    root.style.setProperty('--color-primary', primaryColor)
    Object.entries(palette).forEach(([key, value]) => {
      if (key === 'DEFAULT') return
      root.style.setProperty(`--color-primary-${key}`, value)
    })
    
    // 应用 CSS 变量 - HeroUI Primary
    root.style.setProperty('--heroui-primary', primaryColor)
    Object.entries(palette).forEach(([key, value]) => {
      if (key === 'DEFAULT') return
      root.style.setProperty(`--heroui-primary-${key}`, value)
    })
    
    root.style.setProperty('--border-radius', `${borderRadius}px`)
    root.style.setProperty('--font-size', `${fontSize}px`)
    root.style.setProperty('--theme-font-size', `${fontSize}px`)
    root.style.setProperty('--theme-border-radius', `${borderRadius}px`)
    root.style.setProperty('--content-padding', `${contentPadding}px`)
    root.style.setProperty('--menu-width', `${menuWidth}px`)

    // 边框样式
    if (enableBorder) {
      root.style.setProperty('--border-style', '1px solid var(--color-divider)')
      root.style.setProperty('--admin-border-width', '1px')
      root.style.setProperty('--admin-border-color', 'var(--color-divider)')
    } else {
      root.style.setProperty('--border-style', 'none')
      root.style.setProperty('--admin-border-width', '0px')
      root.style.setProperty('--admin-border-color', 'transparent')
    }

    // 阴影样式
    if (enableShadow) {
      root.style.setProperty('--shadow-style', '0 4px 6px -1px rgba(0, 0, 0, 0.1)')
    } else {
      root.style.setProperty('--shadow-style', 'none')
    }

    // 色弱模式
    if (colorWeak) {
      root.style.filter = 'grayscale(0.8)'
    } else {
      root.style.filter = 'none'
    }

    // 文字选择
    if (allowTextSelection) {
      root.style.userSelect = 'auto'
    } else {
      root.style.userSelect = 'none'
    }
  }, [
    themeMode,
    primaryColor,
    borderRadius,
    fontSize,
    contentPadding,
    enableBorder,
    enableShadow,
    colorWeak,
    allowTextSelection,
    menuWidth
  ])

  // 监听主题变化
  useEffect(() => {
    applyTheme()
  }, [applyTheme])

  // 监听系统主题变化
  useEffect(() => {
    if (themeMode !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = () => {
      applyTheme()
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [themeMode, applyTheme])

  // 切换主题模式
  const toggleTheme = useCallback(() => {
    const modes: ThemeMode[] = ['light', 'dark', 'system']
    const currentIndex = modes.indexOf(themeMode)
    const nextMode = modes[(currentIndex + 1) % modes.length]
    updateFn({ themeMode: nextMode })
  }, [themeMode, updateFn])

  // 设置主题模式
  const setThemeMode = useCallback((mode: ThemeMode) => {
    updateFn({ themeMode: mode })
  }, [updateFn])

  // 设置主色调
  const setPrimaryColor = useCallback((color: string) => {
    updateFn({ primaryColor: color })
  }, [updateFn])

  return {
    themeMode,
    primaryColor,
    actualTheme: getActualTheme(themeMode),
    clickEffect,
    toggleTheme,
    setThemeMode,
    setPrimaryColor,
    applyTheme
  }
}
