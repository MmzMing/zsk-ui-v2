/**
 * 后台管理布局组件
 * 支持5种布局：垂直、水平、混合、双列、Dock
 */

import { useEffect, useMemo, useState, useCallback } from 'react'
import { useLocation, useOutlet } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ScrollShadow } from '@heroui/react'
import AdminSidebar from './AdminSidebar'
import AdminHeader from './AdminHeader'
import MultiTabs from './MultiTabs'
import { useAppStore } from '@/stores/app'
import { ADMIN_MENUS, type MenuItem } from '@/constants/menu'
import { useBreakpoint } from '@/hooks/useBreakpoint'
import { cn } from '@/utils'
import ClickSpark from '@/components/ui/reactbits/ClickSpark'
import {
  HorizontalMenu,
  MixedMenu,
  DualMenu,
  DockMenu
} from './menus'

// 布局属性
interface AdminLayoutProps {
  className?: string
}

export default function AdminLayout({ className }: AdminLayoutProps) {
  const location = useLocation()
  const element = useOutlet()
  const { adminSettings } = useAppStore()
  const {
    menuLayout,
    showHeader,
    clickEffect,
    contentPadding,
    pageTransition,
    allowTextSelection,
    colorWeak,
    multiTab
  } = adminSettings

  const { isMobile } = useBreakpoint()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // 递归查找菜单项
  const findMenuItem = useCallback((segment: string, path: string, menus: MenuItem[] = ADMIN_MENUS): MenuItem | undefined => {
    for (const menu of menus) {
      // 优先匹配完整路径，其次匹配 key
      if (menu.path === path || menu.key === segment) return menu
      if (menu.children) {
        const found = findMenuItem(segment, path, menu.children)
        if (found) return found
      }
    }
    return undefined
  }, [])

  // 根据路径生成面包屑
  const breadcrumbs = useMemo(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean)
    if (pathSegments.length <= 1) return []

    const crumbs: { label: string; path?: string }[] = []
    let currentPath = ''

    // 从 /admin 后的第一个段开始处理
    for (let i = 0; i < pathSegments.length; i++) {
      const segment = pathSegments[i]
      currentPath += `/${segment}`

      // 只处理 /admin 之后的路径
      if (i >= 1) {
        const menuItem = findMenuItem(segment, currentPath)
        crumbs.push({
          label: menuItem?.label || segment.charAt(0).toUpperCase() + segment.slice(1),
          path: i === pathSegments.length - 1 ? undefined : (menuItem?.path || undefined)
        })
      }
    }

    return crumbs
  }, [location.pathname, findMenuItem])

  // 处理色弱模式
  useEffect(() => {
    if (colorWeak) {
      document.documentElement.style.filter = 'grayscale(80%)'
    } else {
      document.documentElement.style.filter = ''
    }
    return () => {
      document.documentElement.style.filter = ''
    }
  }, [colorWeak])

  // 处理文字选择
  useEffect(() => {
    if (!allowTextSelection) {
      document.body.style.userSelect = 'none'
    } else {
      document.body.style.userSelect = ''
    }
    return () => {
      document.body.style.userSelect = ''
    }
  }, [allowTextSelection])

  // 获取当前动画配置
  const currentTransition = useMemo(() => {
    switch (pageTransition) {
      case 'fade':
        return {
          initial: { opacity: 0, filter: 'blur(4px)', y: 4 },
          animate: { opacity: 1, filter: 'blur(0px)', y: 0 },
          exit: { opacity: 0, filter: 'blur(4px)', y: -4 },
          transition: { duration: 0.25, ease: "easeOut" }
        }
      case 'slide':
        return {
          initial: { opacity: 0, x: 15 },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: -15 },
          transition: { type: "spring", stiffness: 350, damping: 25 }
        }
      case 'scale':
        return {
          initial: { opacity: 0, scale: 0.97 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 1.03 },
          transition: { duration: 0.2 }
        }
      case 'layered':
        return {
          initial: { opacity: 0, y: 15 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -15 },
          transition: { duration: 0.25, ease: "easeInOut" }
        }
      default:
        return {
          initial: {},
          animate: {},
          exit: {},
          transition: {}
        }
    }
  }, [pageTransition])

  // 渲染内容区域
  const renderContent = () => (
    <ScrollShadow className="flex-1">
      <main
        className="p-4 md:p-6"
        style={{ padding: contentPadding }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={pageTransition !== 'none' ? currentTransition.initial : false}
            animate={pageTransition !== 'none' ? currentTransition.animate : {}}
            exit={pageTransition !== 'none' ? currentTransition.exit : {}}
            transition={pageTransition !== 'none' ? (currentTransition.transition as any) : {}}
            className="w-full h-full"
          >
            {element}
          </motion.div>
        </AnimatePresence>
      </main>
    </ScrollShadow>
  )

  // 根据布局类型渲染不同的界面
  const renderLayout = () => {
    switch (menuLayout) {
      case 'vertical':
        // 垂直布局：原有结构
        return (
          <div 
            data-admin-layout
            className={cn('flex h-screen overflow-hidden bg-background', className)}
          >
            {/* 侧边栏 - 桌面端显示，移动端隐藏 */}
            <div className={isMobile ? 'hidden md:block' : 'block'}>
              <AdminSidebar />
            </div>
            {/* 移动端侧边栏遮罩 */}
            {isMobile && sidebarOpen && (
              <div
                className="fixed inset-0 z-40 bg-black/50"
                onClick={() => setSidebarOpen(false)}
              />
            )}
            {/* 移动端侧边栏抽屉 */}
            {isMobile && (
              <div
                className={cn(
                  'fixed left-0 top-0 bottom-0 z-50 w-64 transition-transform duration-300',
                  sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                )}
              >
                <AdminSidebar />
              </div>
            )}

            {/* 主内容区 */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* 顶部栏 */}
              {showHeader && (
                <AdminHeader 
                  breadcrumbs={breadcrumbs} 
                />
              )}

              {/* 多标签页 */}
              {multiTab && <MultiTabs />}

              {/* 内容区域 */}
              {renderContent()}
            </div>
          </div>
        )

      case 'horizontal':
        // 水平布局：顶部导航栏包含水平菜单
        return (
          <div 
            data-admin-layout
            className={cn('flex flex-col h-screen overflow-hidden bg-background', className)}
          >
            {/* 水平菜单头部 */}
            <HorizontalMenu extra={<AdminHeader breadcrumbs={[]} />} />

            {/* 主内容区 */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* 多标签页 */}
              {multiTab && <MultiTabs />}
              {renderContent()}
            </div>
          </div>
        )

      case 'mixed':
        // 混合布局：顶部一级菜单 + 左侧子菜单
        return (
          <MixedMenu 
            className={className}
            extra={<AdminHeader breadcrumbs={[]} />}
          >
            <div className="flex-1 flex flex-col overflow-hidden">
              {multiTab && <MultiTabs />}
              {renderContent()}
            </div>
          </MixedMenu>
        )

      case 'dual':
        // 双列布局：左侧两列菜单
        return (
          <DualMenu 
            className={className}
            extra={<AdminHeader breadcrumbs={[]} />}
          >
            <div className="flex-1 flex flex-col overflow-hidden">
              {multiTab && <MultiTabs />}
              {renderContent()}
            </div>
          </DualMenu>
        )

      case 'dock':
        // Dock布局：使用Dock组件，无传统头部
        return (
          <div 
            data-admin-layout
            className={cn('h-screen overflow-hidden bg-background', className)}
          >
            {/* 主内容区 */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* 多标签页 */}
              {multiTab && <MultiTabs />}
              {renderContent()}
            </div>

            {/* Dock菜单 */}
            <DockMenu />
          </div>
        )

      default:
        return null
    }
  }

  // 如果启用点击火花效果，包装组件
  if (clickEffect) {
    return (
      <ClickSpark
        sparkColor="#537BF9"
        sparkCount={8}
        sparkSize={10}
        duration={400}
      >
        {renderLayout()}
      </ClickSpark>
    )
  }

  return renderLayout()
}
