/**
 * 多标签页组件
 * 后台管理系统的多标签页功能
 * 显示已访问的页面标签，支持切换和关闭
 */

import { useState, useCallback, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button, ScrollShadow } from '@heroui/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiOutlineX,
  HiOutlineHome
} from 'react-icons/hi'
import { ADMIN_MENUS, type MenuItem } from '@/constants/menu'
import { cn } from '@/utils'

// 标签页项
interface TabItem {
  path: string
  label: string
  key: string
}

// 查找菜单项标签
function findMenuLabel(path: string, menus: MenuItem[]): string {
  for (const menu of menus) {
    if (menu.path === path) return menu.label
    if (menu.children) {
      for (const child of menu.children) {
        if (child.path === path) return child.label
      }
    }
  }
  return path.split('/').pop() || '未命名'
}

// 查找菜单项 Key
function findMenuKey(path: string, menus: MenuItem[]): string {
  for (const menu of menus) {
    if (menu.path === path) return menu.key
    if (menu.children) {
      for (const child of menu.children) {
        if (child.path === path) return child.key
      }
    }
  }
  return ''
}

interface MultiTabsProps {
  className?: string
}

export default function MultiTabs({ className }: MultiTabsProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [tabs, setTabs] = useState<TabItem[]>([])

  // 从路径中排除管理后台基础路径
  const currentPath = location.pathname

  // 初始化和更新标签页
  useEffect(() => {
    const label = findMenuLabel(currentPath, ADMIN_MENUS)
    const key = findMenuKey(currentPath, ADMIN_MENUS)

    // 排除首页和已有标签
    if (currentPath === '/' || currentPath === '/admin') return

    setTabs((prev) => {
      const exists = prev.some((tab) => tab.path === currentPath)
      if (exists) {
        // 更新现有标签，保持顺序
        return prev.map((tab) =>
          tab.path === currentPath ? { ...tab, label, key } : tab
        )
      }
      // 添加新标签（最多10个）
      const newTabs = [...prev, { path: currentPath, label, key }]
      if (newTabs.length > 10) {
        return newTabs.slice(-10)
      }
      return newTabs
    })
  }, [currentPath])

  // 关闭标签页
  const handleCloseTab = useCallback(
    (path: string, e?: React.MouseEvent) => {
      e?.stopPropagation()
      setTabs((prev) => {
        const newTabs = prev.filter((tab) => tab.path !== path)
        // 如果关闭的是当前页，跳转到最后一个标签
        if (currentPath === path && newTabs.length > 0) {
          navigate(newTabs[newTabs.length - 1].path)
        }
        // 如果没有标签了，跳转到首页
        if (newTabs.length === 0) {
          navigate('/admin')
        }
        return newTabs
      })
    },
    [currentPath, navigate]
  )

  // 切换标签页
  const handleTabClick = useCallback(
    (path: string) => {
      navigate(path)
    },
    [navigate]
  )

  // 关闭所有标签页
  const handleCloseAll = useCallback(() => {
    setTabs([])
    navigate('/admin')
  }, [navigate])

  // 标签页动画变体
  const tabVariants = {
    initial: { opacity: 0, scale: 0.8, y: -10 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.8, y: -10 }
  }

  // 主页标签（始终显示）
  const homeTab: TabItem = {
    path: '/admin',
    label: '首页',
    key: 'home'
  }

  // 渲染单个标签
  const renderTab = (tab: TabItem, isActive: boolean) => (
    <motion.div
      key={tab.path}
      variants={tabVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={cn(
        'flex items-center gap-1 px-3 py-1.5 rounded-md text-sm cursor-pointer transition-all group',
        isActive
          ? 'bg-primary/10 text-primary font-medium'
          : 'hover:bg-default-100 text-default-600 dark:text-default-400'
      )}
      onClick={() => handleTabClick(tab.path)}
    >
      {/* 首页图标 */}
      {tab.path === '/admin' && (
        <HiOutlineHome className="text-xs" />
      )}
      <span className="truncate max-w-[100px]">{tab.label}</span>
      {/* 关闭按钮 */}
      {tab.path !== '/admin' && (
        <button
          className={cn(
            'ml-1 p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-default-200 dark:hover:bg-default-800 transition-all',
            isActive ? 'opacity-100' : ''
          )}
          onClick={(e) => handleCloseTab(tab.path, e)}
        >
          <HiOutlineX className="text-xs" />
        </button>
      )}
    </motion.div>
  )

  // 没有标签页时不渲染
  if (tabs.length === 0 && currentPath === '/admin') {
    return null
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-4 py-1.5 border-b border-divider bg-background/60 backdrop-blur-md z-10',
        className
      )}
    >
      {/* 标签页容器 */}
      <ScrollShadow
        orientation="horizontal"
        className="flex-1 flex items-center gap-1"
        hideScrollBar
      >
        <AnimatePresence mode="popLayout">
          {/* 首页 */}
          {renderTab(homeTab, currentPath === '/admin')}
          {/* 其他标签 */}
          {tabs.map((tab) => renderTab(tab, currentPath === tab.path))}
        </AnimatePresence>
      </ScrollShadow>

      {/* 更多操作按钮 */}
      {tabs.length > 1 && (
        <div className="flex items-center gap-1 ml-2">
          <Button
            isIconOnly
            size="sm"
            variant="light"
            className="min-w-8 w-8 h-8"
            onPress={handleCloseAll}
            title="关闭全部"
          >
            <HiOutlineX className="text-sm" />
          </Button>
        </div>
      )}
    </div>
  )
}
