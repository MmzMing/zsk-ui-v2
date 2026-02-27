/**
 * 混合菜单组件
 * 顶部展示核心一级菜单，左侧垂直展示当前一级菜单下的子菜单
 */

import { useState, useCallback, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button, ScrollShadow } from '@heroui/react'
import { useTranslation } from 'react-i18next'
import {
  HiOutlineMenuAlt2,
  HiOutlineChevronDown
} from 'react-icons/hi'
import { useAppStore } from '@/stores/app'
import { ADMIN_MENUS, getSortedMenus, type MenuItem } from '@/constants/menu'
import { cn } from '@/utils'

// 混合菜单属性
interface MixedMenuProps {
  /** 自定义类名 */
  className?: string
  /** Logo 区域 */
  logo?: React.ReactNode
  /** 自定义右侧内容 */
  extra?: React.ReactNode
  /** 子内容 */
  children?: React.ReactNode
}

// 子菜单组件
function SubMenuItem({ 
  item, 
  activeKey, 
  onSelect,
  t
}: { 
  item: MenuItem
  activeKey: string
  onSelect: (item: MenuItem) => void 
  t: any
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
      <span className="text-sm truncate">{t(`menu.${item.key}`, item.label)}</span>
    </Button>
  )
}

export default function MixedMenu({ className, logo, extra, children }: MixedMenuProps) {
  const { t } = useTranslation('navigation')
  const navigate = useNavigate()
  const location = useLocation()
  const { adminSettings } = useAppStore()
  const { menuWidth } = adminSettings

  // 当前选中的一级菜单
  const [activeMenuKey, setActiveMenuKey] = useState<string>(() => {
    const path = location.pathname
    for (const menu of ADMIN_MENUS) {
      if (menu.children) {
        for (const child of menu.children) {
          if (child.path === path) {
            return menu.key
          }
        }
      }
    }
    return ADMIN_MENUS[0]?.key || ''
  })

  // 排序后的菜单
  const sortedMenus = useMemo(() => getSortedMenus(ADMIN_MENUS), [])

  // 获取当前一级菜单的子菜单
  const currentMenu = useMemo(() => {
    return sortedMenus.find(m => m.key === activeMenuKey)
  }, [sortedMenus, activeMenuKey])

  // 获取当前激活的子菜单项
  const activeSubKey = useMemo(() => {
    const path = location.pathname
    for (const menu of ADMIN_MENUS) {
      if (menu.children) {
        for (const child of menu.children) {
          if (child.path === path) return child.key
        }
      }
    }
    return ''
  }, [location.pathname])

  // 处理菜单选择
  const handleSelect = useCallback((item: MenuItem) => {
    if (item.path) {
      navigate(item.path)
    }
  }, [navigate])

  // 处理一级菜单点击
  const handleMenuClick = useCallback((menu: MenuItem) => {
    setActiveMenuKey(menu.key)
    // 如果有子菜单且没有当前激活项，默认选择第一个子菜单
    if (menu.children && menu.children.length > 0) {
      const firstChild = menu.children[0]
      if (firstChild.path) {
        navigate(firstChild.path)
      }
    } else if (menu.path) {
      navigate(menu.path)
    }
  }, [navigate])

  // 渲染顶部一级菜单
  const renderTopMenu = () => (
    <div className="flex items-center h-full gap-1">
      {sortedMenus.map((menu) => {
        const isActive = activeMenuKey === menu.key
        const Icon = menu.icon
        const label = t(`menu.${menu.key}`, menu.label)
        
        return (
          <Button
            key={menu.key}
            variant={isActive ? 'flat' : 'light'}
            color={isActive ? 'primary' : 'default'}
            className={cn(
              'h-10 px-3 gap-2 min-w-0',
              isActive && 'bg-primary/10 font-medium'
            )}
            onPress={() => handleMenuClick(menu)}
          >
            {Icon && <Icon className="text-lg flex-shrink-0" />}
            <span className="hidden xl:inline truncate">{label}</span>
            {menu.children && menu.children.length > 0 && (
              <HiOutlineChevronDown className="text-xs hidden xl:block" />
            )}
          </Button>
        )
      })}
    </div>
  )

  // 渲染左侧子菜单
  const renderSidebar = () => (
    <motion.aside
      initial={false}
      animate={{ width: menuWidth }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="h-screen bg-content1 border-r border-divider flex flex-col"
    >
      {/* 子菜单区域 */}
      <ScrollShadow className="flex-1 py-2">
        <nav className="px-2">
          <div className="flex flex-col gap-1">
            {currentMenu?.children?.map((item) => (
              <SubMenuItem
                key={item.key}
                item={item}
                activeKey={activeSubKey}
                onSelect={handleSelect}
                t={t}
              />
            ))}
          </div>
        </nav>
      </ScrollShadow>
    </motion.aside>
  )

  // 默认 Logo
  const defaultLogo = (
    <div className="flex items-center gap-2">
      <HiOutlineMenuAlt2 className="text-2xl text-primary" />
      <span className="font-semibold text-lg">{t('menu.admin')}</span>
    </div>
  )

  return (
    <div 
      data-admin-layout
      className={cn('flex flex-col h-screen', className)}
    >
      {/* 顶部导航栏 */}
      <header className="h-14 bg-content1 border-b border-divider flex items-center justify-between px-4">
        <div className="flex items-center">
          <div className="flex-shrink-0 mr-4">
            {logo || defaultLogo}
          </div>
          <nav className="hidden md:flex">
            {renderTopMenu()}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {extra}
        </div>
      </header>

      {/* 主体内容 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧子菜单 */}
        {renderSidebar()}
        
        {/* 内容区域 */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  )
}
