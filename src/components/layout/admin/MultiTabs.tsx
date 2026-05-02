/**
 * 多标签页组件
 * 后台管理系统的多标签页功能
 * 显示已访问的页面标签，支持切换和关闭
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button, ScrollShadow, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiOutlineX,
  HiOutlineHome,
  HiChevronLeft,
  HiChevronRight,
  HiDotsHorizontal
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
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showLeftBtn, setShowLeftBtn] = useState(false)
  const [showRightBtn, setShowRightBtn] = useState(false)

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

  // 检查滚动位置并更新按钮显示状态
  const checkScrollPosition = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setShowLeftBtn(scrollLeft > 0)
      setShowRightBtn(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }, [])

  useEffect(() => {
    checkScrollPosition()
    const el = scrollRef.current
    if (el) {
      el.addEventListener('scroll', checkScrollPosition)
      return () => el.removeEventListener('scroll', checkScrollPosition)
    }
  }, [checkScrollPosition, tabs])

  // 滚动到左侧
  const scrollLeft = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' })
    }
  }, [])

  // 滚动到右侧
  const scrollRight = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' })
    }
  }, [])

  // 关闭标签页
  const handleCloseTab = useCallback(
    (path: string) => {
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

  // 关闭其他标签页
  const handleCloseOther = useCallback(() => {
    setTabs((prev) => {
      const newTabs = prev.filter((tab) => tab.path === currentPath)
      if (currentPath !== '/admin' && newTabs.length === 0 && prev.length > 0) {
        navigate('/admin')
      }
      return newTabs
    })
  }, [currentPath, navigate])

  // 关闭右侧标签页
  const handleCloseRight = useCallback(() => {
    if (currentPath === '/admin') return
    setTabs((prev) => {
      const index = prev.findIndex((tab) => tab.path === currentPath)
      if (index >= 0) {
        return prev.slice(0, index + 1)
      }
      return prev
    })
  }, [currentPath])

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
        'flex items-center gap-1 px-3 py-1.5 rounded-md text-sm cursor-pointer transition-all group shrink-0',
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
          onClick={(e) => {
            e.stopPropagation()
            handleCloseTab(tab.path)
          }}
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

  // 当前活动标签不是首页
  const isNotHomeTab = currentPath !== '/admin'

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-4 py-1.5 border-b border-default-800 bg-background/60 backdrop-blur-md z-10',
        className
      )}
    >
      {/* 左侧滚动按钮（始终预留位置） */}
      <div className="min-w-8 w-8 h-8 shrink-0 flex items-center justify-center">
        {showLeftBtn && (
          <Button
            isIconOnly
            size="sm"
            variant="light"
            className="min-w-8 w-8 h-8"
            onPress={scrollLeft}
            title="向左滚动"
          >
            <HiChevronLeft className="text-sm" />
          </Button>
        )}
      </div>

      {/* 标签页容器 */}
      <ScrollShadow
        orientation="horizontal"
        className="flex-1 flex items-center gap-1 overflow-x-auto"
        hideScrollBar
        ref={scrollRef}
      >
        <AnimatePresence mode="popLayout">
          {/* 首页 */}
          {renderTab(homeTab, currentPath === '/admin')}
          {/* 其他标签 */}
          {tabs.map((tab) => renderTab(tab, currentPath === tab.path))}
        </AnimatePresence>
      </ScrollShadow>

      {/* 右侧滚动按钮（始终预留位置） */}
      <div className="min-w-8 w-8 h-8 shrink-0 flex items-center justify-center">
        {showRightBtn && (
          <Button
            isIconOnly
            size="sm"
            variant="light"
            className="min-w-8 w-8 h-8"
            onPress={scrollRight}
            title="向右滚动"
          >
            <HiChevronRight className="text-sm" />
          </Button>
        )}
      </div>

      {/* 右侧操作按钮 */}
      {tabs.length > 0 && (
        <Dropdown>
          <DropdownTrigger>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              className="min-w-8 w-8 h-8 shrink-0"
              title="标签页操作"
            >
              <HiDotsHorizontal className="text-sm" />
            </Button>
          </DropdownTrigger>
          <DropdownMenu className="min-w-[140px]">
            {isNotHomeTab ? (
              <DropdownItem 
                key="close" 
                onClick={() => handleCloseTab(currentPath)}
                startContent={<HiOutlineX className="w-4 h-4" />}
                textValue="关闭"
              >
                关闭
              </DropdownItem>
            ) : null}
            <DropdownItem 
              key="close-other" 
              onClick={handleCloseOther}
              startContent={<HiOutlineX className="w-4 h-4" />}
              textValue="关闭其他"
            >
              关闭其他
            </DropdownItem>
            {isNotHomeTab ? (
              <DropdownItem 
                key="close-right" 
                onClick={handleCloseRight}
                startContent={<HiOutlineX className="w-4 h-4" />}
                textValue="关闭右侧标签页"
              >
                关闭右侧标签页
              </DropdownItem>
            ) : null}
            <DropdownItem 
              key="close-all" 
              onClick={handleCloseAll}
              startContent={<HiOutlineX className="w-4 h-4" />}
              textValue="关闭所有"
            >
              关闭所有
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      )}
    </div>
  )
}