/**
 * 垂直菜单组件
 * 侧边栏菜单垂直排列于页面左侧
 */

import { useState, useCallback, useMemo, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Button, Tooltip, ScrollShadow } from '@heroui/react'
import {
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineMenuAlt2,
  HiOutlineChevronDown
} from 'react-icons/hi'
import { useAppStore } from '@/stores/app'
import { ADMIN_MENUS, getSortedMenus, type MenuItem } from '@/constants/menu'
import { cn } from '@/utils'

// 子菜单项组件
function SubMenuItem({ 
  item, 
  activeKey, 
  onSelect 
}: { 
  item: MenuItem
  activeKey: string
  onSelect: (item: MenuItem) => void 
}) {
  const isActive = activeKey === item.key
  const Icon = item.icon

  return (
    <Button
      variant={isActive ? 'flat' : 'light'}
      color={isActive ? 'primary' : 'default'}
      className={cn(
        'w-full justify-start gap-2 h-9 px-3',
        isActive && 'bg-primary/10 font-medium'
      )}
      onPress={() => item.path && onSelect(item)}
    >
      {Icon && <Icon className="text-lg flex-shrink-0" />}
      <span className="text-sm truncate">{item.label}</span>
    </Button>
  )
}

// 菜单项组件
function MenuItemComponent({ 
  item, 
  collapsed, 
  activeKey, 
  onSelect,
  expandedKeys,
  toggleExpand
}: { 
  item: MenuItem
  collapsed: boolean
  activeKey: string
  onSelect: (item: MenuItem) => void
  expandedKeys: Set<string>
  toggleExpand: (key: string) => void
}) {
  const isActive = activeKey === item.key || activeKey.startsWith(`${item.key}/`)
  const hasChildren = item.children && item.children.length > 0
  const isExpanded = expandedKeys.has(item.key)
  const Icon = item.icon

  // 折叠状态下只显示图标
  if (collapsed) {
    return (
      <Tooltip
        content={item.label}
        placement="right"
        delay={300}
      >
        <Button
          variant={isActive ? 'flat' : 'light'}
          color={isActive ? 'primary' : 'default'}
          isIconOnly
          className={cn(
            'w-full h-11 min-w-0 justify-center',
            isActive && 'bg-primary/10'
          )}
          onPress={() => {
            if (hasChildren) {
              const firstChild = item.children?.[0]
              if (firstChild?.path) {
                onSelect(firstChild)
              }
            } else if (item.path) {
              onSelect(item)
            }
          }}
        >
          {Icon && <Icon className="text-xl" />}
        </Button>
      </Tooltip>
    )
  }

  // 无子菜单的单项
  if (!hasChildren) {
    return (
      <Button
        variant={isActive ? 'flat' : 'light'}
        color={isActive ? 'primary' : 'default'}
        className={cn(
          'w-full justify-start gap-3 h-11 px-3',
          isActive && 'bg-primary/10 font-medium'
        )}
        onPress={() => item.path && onSelect(item)}
      >
        {Icon && <Icon className="text-xl flex-shrink-0" />}
        <span className="truncate">{item.label}</span>
      </Button>
    )
  }

  // 有子菜单的项
  return (
    <div className="flex flex-col">
      {/* 父菜单项 */}
      <Button
        variant="light"
        className={cn(
          'w-full justify-start gap-3 h-11 px-3',
          isActive && 'bg-primary/5'
        )}
        onPress={() => toggleExpand(item.key)}
      >
        {Icon && <Icon className="text-xl flex-shrink-0" />}
        <span className="truncate flex-1 text-left">{item.label}</span>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <HiOutlineChevronDown className="text-sm text-default-400" />
        </motion.div>
      </Button>

      {/* 子菜单 */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-1 pl-6 pt-1 pb-1">
              {item.children?.map((child) => (
                <SubMenuItem
                  key={child.key}
                  item={child}
                  activeKey={activeKey}
                  onSelect={onSelect}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// 垂直菜单属性
interface VerticalMenuProps {
  /** 自定义类名 */
  className?: string
  /** Logo 区域 */
  logo?: React.ReactNode
}

export default function VerticalMenu({ className, logo }: VerticalMenuProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const {
    sidebarCollapsed: collapsed,
    toggleSidebar,
    adminSettings
  } = useAppStore()
  const { menuWidth, sidebarAccordion } = adminSettings

  // 获取当前激活的菜单项
  const activeKey = useMemo(() => {
    const path = location.pathname
    for (const menu of ADMIN_MENUS) {
      if (menu.path === path) return menu.key
      if (menu.children) {
        for (const child of menu.children) {
          if (child.path === path) return child.key
        }
      }
    }
    return ''
  }, [location.pathname])

  // 展开的菜单项
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(() => {
    const path = location.pathname
    const expanded = new Set<string>()
    for (const menu of ADMIN_MENUS) {
      if (menu.children) {
        for (const child of menu.children) {
          if (child.path === path) {
            expanded.add(menu.key)
            break
          }
        }
      }
    }
    return expanded
  })

  // 切换展开状态
  const toggleExpand = useCallback((key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        // 如果开启了手风琴模式，先清空其他展开项
        if (sidebarAccordion) {
          next.clear()
        }
        next.add(key)
      }
      return next
    })
  }, [sidebarAccordion])

  // 手风琴模式切换时，自动收起多余项
  useEffect(() => {
    if (sidebarAccordion) {
      setExpandedKeys(prev => {
        if (prev.size <= 1) return prev
        // 尝试保留包含当前激活子项的父级菜单
        const next = new Set<string>()
        for (const menu of ADMIN_MENUS) {
          if (menu.children?.some(child => child.key === activeKey) && prev.has(menu.key)) {
            next.add(menu.key)
            break
          }
        }
        // 如果没找到对应的激活父级，则保留原集合中第一个
        if (next.size === 0 && prev.size > 0) {
          next.add(Array.from(prev)[0])
        }
        return next
      })
    }
  }, [sidebarAccordion, activeKey])

  // 处理菜单选择
  const handleSelect = useCallback((item: MenuItem) => {
    if (item.path) {
      navigate(item.path)
    }
  }, [navigate])

  // 排序后的菜单
  const sortedMenus = useMemo(() => getSortedMenus(ADMIN_MENUS), [])

  // 默认 Logo
  const defaultLogo = (
    <div className="flex items-center gap-2">
      <HiOutlineMenuAlt2 className="text-2xl text-primary" />
      <span className="font-semibold text-lg">知识库后台</span>
    </div>
  )

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 64 : menuWidth }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className={cn(
        'h-screen bg-content1 border-r border-divider flex flex-col',
        className
      )}
    >
      {/* Logo 区域 */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-divider">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {logo || defaultLogo}
            </motion.div>
          )}
        </AnimatePresence>
        <Button
          isIconOnly
          variant="light"
          size="sm"
          onPress={toggleSidebar}
          className="text-default-500"
        >
          {collapsed ? (
            <HiOutlineChevronRight className="text-lg" />
          ) : (
            <HiOutlineChevronLeft className="text-lg" />
          )}
        </Button>
      </div>

      {/* 菜单区域 */}
      <ScrollShadow className="flex-1 py-2">
        <nav className="px-2">
          <div className="flex flex-col gap-1">
            {sortedMenus.map((item) => (
              <MenuItemComponent
                key={item.key}
                item={item}
                collapsed={collapsed}
                activeKey={activeKey}
                onSelect={handleSelect}
                expandedKeys={expandedKeys}
                toggleExpand={toggleExpand}
              />
            ))}
          </div>
        </nav>
      </ScrollShadow>
    </motion.aside>
  )
}
