/**
 * 双列菜单组件
 * 左侧侧边栏分为两列布局，首列展示核心功能入口，次列展示当前模块的细分菜单
 */

import { useState, useCallback, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button, ScrollShadow } from '@heroui/react'
import { useTranslation } from 'react-i18next'
import {
  HiOutlineMenuAlt2
} from 'react-icons/hi'
import { useAppStore } from '@/stores/app'
import { ADMIN_MENUS, getSortedMenus, type MenuItem } from '@/constants/menu'
import { cn } from '@/utils'

// 双列菜单属性
interface DualMenuProps {
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

export default function DualMenu({ className, logo, extra, children }: DualMenuProps) {
  const { t } = useTranslation('navigation')
  const navigate = useNavigate()
  const location = useLocation()
  const { adminSettings } = useAppStore()
  const { menuWidth } = adminSettings

  // 当前选中的模块
  const [activeModule, setActiveModule] = useState<string>(() => {
    const path = location.pathname
    for (const menu of ADMIN_MENUS) {
      if (menu.path === path) return menu.key
      if (menu.children) {
        for (const child of menu.children) {
          if (child.path === path) {
            return menu.key
          }
        }
      }
    }
    return ADMIN_MENUS[0]?.key || 'dashboard'
  })

  // 排序后的菜单
  const sortedMenus = useMemo(() => getSortedMenus(ADMIN_MENUS), [])

  // 核心功能菜单（左侧第一列）
  const coreMenus = useMemo(() => {
    return sortedMenus
  }, [sortedMenus])

  // 当前模块的详细菜单（左侧第二列）
  const currentModuleMenu = useMemo(() => {
    return sortedMenus.find(m => m.key === activeModule)
  }, [sortedMenus, activeModule])

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

  // 处理菜单选择
  const handleSelect = useCallback((item: MenuItem) => {
    if (item.path) {
      navigate(item.path)
    }
  }, [navigate])

  // 处理模块选择
  const handleModuleClick = useCallback((menu: MenuItem) => {
    setActiveModule(menu.key)
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
        </div>
        <div className="flex items-center gap-2">
          {extra}
        </div>
      </header>

      {/* 主体内容 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 双列侧边栏 */}
        <motion.aside
          initial={false}
          animate={{ width: menuWidth }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="h-screen bg-content1 border-r border-divider flex"
        >
          {/* 第一列：核心功能入口 */}
          <div className="w-16 border-r border-divider flex flex-col py-2">
            <div className="flex flex-col gap-1 px-2">
              {coreMenus.map((menu) => {
                const isActive = activeModule === menu.key
                const Icon = menu.icon
                return (
                  <Button
                    key={menu.key}
                    variant={isActive ? 'flat' : 'light'}
                    color={isActive ? 'primary' : 'default'}
                    isIconOnly
                    className={cn(
                      'w-full h-11 justify-center',
                      isActive && 'bg-primary/10'
                    )}
                    onPress={() => handleModuleClick(menu)}
                  >
                    {Icon && <Icon className="text-xl" />}
                  </Button>
                )
              })}
            </div>
          </div>

          {/* 第二列：当前模块的细分菜单 */}
          <div className="flex-1 flex flex-col">
            {/* 菜单列表 */}
            <ScrollShadow className="flex-1 py-2">
              <nav className="px-2">
                <div className="flex flex-col gap-1">
                  {/* 如果当前模块有直接路由，显示 */}
                  {currentModuleMenu?.path && (
                    <Button
                      key={currentModuleMenu.key}
                      variant={activeKey === currentModuleMenu.key ? 'flat' : 'light'}
                      color={activeKey === currentModuleMenu.key ? 'primary' : 'default'}
                      className={cn(
                        'w-full justify-start gap-3 h-11 px-3',
                        activeKey === currentModuleMenu.key && 'bg-primary/10 font-medium'
                      )}
                      onPress={() => handleModuleClick(currentModuleMenu)}
                    >
                      {currentModuleMenu.icon && <currentModuleMenu.icon className="text-xl flex-shrink-0" />}
                      <span className="truncate">{t(`menu.${currentModuleMenu.key}`, currentModuleMenu.label)}</span>
                    </Button>
                  )}
                  {/* 显示子菜单 */}
                  {currentModuleMenu?.children?.map((item) => (
                    <SubMenuItem
                      key={item.key}
                      item={item}
                      activeKey={activeKey}
                      onSelect={handleSelect}
                      t={t}
                    />
                  ))}
                </div>
              </nav>
            </ScrollShadow>
          </div>
        </motion.aside>
        
        {/* 内容区域 */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  )
}
