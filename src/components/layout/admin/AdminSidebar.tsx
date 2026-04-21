/**
 * 后台管理侧边栏组件
 * 支持折叠/展开、多级菜单
 */

import { useState, useCallback, useMemo, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Button, Tooltip, ScrollShadow } from '@heroui/react'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import {
  HiOutlineChevronDown
} from 'react-icons/hi'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { useMenuStore } from '@/stores/menu'
import { ADMIN_MENUS, getSortedMenus, type MenuItem } from '@/constants/menu'
import { cn } from '@/utils'
import { SiteLogo } from '@/components/ui/SiteLogo'

/**
 * 获取菜单显示标签
 * 如果 key 是数字ID（动态菜单），直接使用 label；否则尝试国际化翻译
 */
function getMenuLabel(key: string, label: string, t: TFunction): string {
  if (/^\d+$/.test(key)) {
    return label
  }
  const translated = t(`menu.${key}`)
  return translated && translated !== `menu.${key}` ? translated : label
}

// 子菜单项组件
function SubMenuItem({ 
  item, 
  activeKey, 
  onSelect,
  t
}: { 
  item: MenuItem
  activeKey: string
  onSelect: (item: MenuItem) => void 
  t: TFunction
}) {
  const isActive = activeKey === item.key
  const Icon = item.icon
  const label = getMenuLabel(item.key, item.label, t)

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
      <span className="text-sm truncate">{label}</span>
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
  toggleExpand,
  t
}: { 
  item: MenuItem
  collapsed: boolean
  activeKey: string
  onSelect: (item: MenuItem) => void
  expandedKeys: Set<string>
  toggleExpand: (key: string) => void
  t: TFunction
}) {
  const isActive = activeKey === item.key || (item.children && item.children.some(child => child.key === activeKey))
  const hasChildren = item.children && item.children.length > 0
  const isExpanded = expandedKeys.has(item.key)
  const Icon = item.icon
  const label = getMenuLabel(item.key, item.label, t)

  // 折叠状态下只显示图标
  if (collapsed) {
    return (
      <Tooltip
        content={label}
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
              toggleExpand(item.key)
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
        <span className="truncate">{label}</span>
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
        <span className="truncate flex-1 text-left">{label}</span>
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
                  t={t}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// 侧边栏属性
interface AdminSidebarProps {
  className?: string
}

export default function AdminSidebar({ className }: AdminSidebarProps) {
  const { t } = useTranslation('navigation')
  const navigate = useNavigate()
  const location = useLocation()
  const {
    sidebarCollapsed: collapsed,
    adminSettings
  } = useAppStore()
  const { userInfo } = useUserStore()
  const { dynamicMenus, fetchMenus } = useMenuStore()

  // 组件挂载时获取菜单数据
  useEffect(() => {
    fetchMenus()
  }, [fetchMenus])

  // 从 userInfo 中获取权限列表
  const permissions = useMemo(() => {
    return userInfo?.permissions || []
  }, [userInfo])
  
  const { menuWidth, sidebarAccordion } = adminSettings
  
  const [isHovering, setIsHovering] = useState(false)
  
  const shouldExpand = !collapsed || isHovering

  // 判断是否为管理员角色（super_admin 或 admin）
  const isAdmin = userInfo?.roles.some(role => role === 'super_admin' || role === 'admin')

  // 根据用户权限过滤菜单（管理员角色显示所有菜单）
  // 优先级：动态菜单 > 默认菜单
  const sourceMenus = useMemo(() => {
    return dynamicMenus.length > 0 ? dynamicMenus : ADMIN_MENUS
  }, [dynamicMenus])

  const currentMenus = useMemo(() => {
    if (isAdmin) return sourceMenus
    return filterMenusByPermission(sourceMenus, permissions)
  }, [sourceMenus, permissions, isAdmin])

  // 获取当前激活的菜单项
  const activeKey = useMemo(() => {
    const path = location.pathname
    for (const menu of currentMenus) {
      if (menu.path === path) return menu.key
      if (menu.children) {
        for (const child of menu.children) {
          if (child.path === path) return child.key
        }
      }
    }
    return ''
  }, [location.pathname, currentMenus])

  // 展开的菜单项
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set<string>())

  // 路由变化时自动展开对应父菜单
  useEffect(() => {
    const path = location.pathname
    const newExpanded = new Set<string>()
    for (const menu of currentMenus) {
      if (menu.children) {
        for (const child of menu.children) {
          if (child.path === path) {
            newExpanded.add(menu.key)
            break
          }
        }
      }
    }
    setExpandedKeys(newExpanded)
  }, [location.pathname, currentMenus])

  // 切换展开状态
  const toggleExpand = useCallback((key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
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
        const next = new Set<string>()
        for (const menu of currentMenus) {
          if (menu.children?.some(child => child.key === activeKey) && prev.has(menu.key)) {
            next.add(menu.key)
            break
          }
        }
        if (next.size === 0 && prev.size > 0) {
          next.add(Array.from(prev)[0])
        }
        return next
      })
    }
  }, [sidebarAccordion, activeKey, currentMenus])

  // 处理菜单选择
  const handleSelect = useCallback((item: MenuItem) => {
    if (item.path) {
      navigate(item.path)
    }
  }, [navigate])

  // 排序后的菜单
  const sortedMenus = useMemo(() => getSortedMenus(currentMenus), [currentMenus])

  // 动画配置
  const sidebarVariants = {
    expanded: { width: menuWidth },
    collapsed: { width: 64 }
  }

  return (
    <motion.aside
      initial={false}
      animate={shouldExpand ? 'expanded' : 'collapsed'}
      variants={sidebarVariants}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className={cn(
        'h-screen bg-content1 border-r-[var(--admin-border-width)] border-divider flex flex-col',
        className
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Logo 区域 */}
      <div className="h-14 flex items-center justify-center px-4 border-b-[var(--admin-border-width)] border-divider">
        <SiteLogo size="sm" />
      </div>

      {/* 菜单区域 */}
      <ScrollShadow className="flex-1 py-2">
        <nav className="px-2">
          <div className="flex flex-col gap-1">
            {sortedMenus.map((item) => (
              <MenuItemComponent
                key={item.key}
                item={item}
                collapsed={!shouldExpand}
                activeKey={activeKey}
                onSelect={handleSelect}
                expandedKeys={expandedKeys}
                toggleExpand={toggleExpand}
                t={t}
              />
            ))}
          </div>
        </nav>
      </ScrollShadow>
    </motion.aside>
  )
}

/**
 * 根据用户权限过滤菜单项
 * @param menus - 原始菜单列表
 * @param permissions - 用户权限列表
 * @returns 过滤后的菜单列表
 */
function filterMenusByPermission(menus: MenuItem[], permissions: string[]): MenuItem[] {
  return menus
    .map(menu => {
      // 先递归过滤子菜单
      let filteredChildren: MenuItem[] | undefined
      if (menu.children && menu.children.length > 0) {
        filteredChildren = filterMenusByPermission(menu.children, permissions).filter(Boolean) as MenuItem[]
      }

      // 检查权限：父菜单有权限，或者有子菜单有权限
      const hasParentPermission = !menu.permission || permissions.includes(menu.permission)
      const hasChildPermission = filteredChildren && filteredChildren.length > 0

      // 如果父菜单没有权限且没有子菜单权限，过滤掉
      if (!hasParentPermission && !hasChildPermission) {
        return null
      }

      return {
        ...menu,
        children: filteredChildren && filteredChildren.length > 0 ? filteredChildren : undefined
      }
    })
    .filter(Boolean) as MenuItem[]
}
