/**
 * 垂直菜单组件
 * 支持动态菜单管理，菜单名称、图标、顺序可通过后台API配置
 * 主要由后端API权限控制显示
 * 支持国际化多语言切换
 */

import { useState, useCallback, useMemo, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Button, Tooltip, ScrollShadow } from '@heroui/react'
import { useTranslation } from 'react-i18next'
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  ChevronDown,
  Circle
} from 'lucide-react'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { useMenuStore } from '@/stores/menu'
import {
  ADMIN_MENUS,
  getSortedMenus,
  type MenuItem
} from '@/constants/menu'
import { cn } from '@/utils'
import { getIconsByName } from '@/utils/icons'

/**
 * 根据图标名称或组件获取图标组件
 * @param icon - 图标名称字符串或图标组件
 * @returns 图标组件或默认图标
 */
function getIconComponent(icon: MenuItem['icon']): React.ComponentType<{ className?: string }> | undefined {
  if (typeof icon === 'string') {
    return getIconsByName(icon) || Circle
  }
  return icon
}

/**
 * 获取菜单显示标签
 * 如果 key 是数字ID（动态菜单），直接使用 label；否则尝试国际化翻译
 * @param key - 菜单key
 * @param label - 默认标签
 * @param t - 翻译函数
 * @returns 显示标签
 */
function getMenuLabel(key: string, label: string, t: (key: string) => string): string {
  if (/^\d+$/.test(key)) {
    return label
  }
  const translated = t(`menu.${key}`)
  return translated && translated !== `menu.${key}` ? translated : label
}

/**
 * 子菜单项组件
 * @param item - 菜单项数据
 * @param activeKey - 当前激活的菜单项key
 * @param onSelect - 选中回调函数
 * @param t - 翻译函数
 */
function SubMenuItem({
  item,
  activeKey,
  onSelect,
  t
}: {
  item: MenuItem
  activeKey: string
  onSelect: (item: MenuItem) => void
  t: (key: string) => string
}) {
  const isActive = activeKey === item.key
  const Icon = getIconComponent(item.icon)
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

/**
 * 菜单项组件（支持展开/折叠）
 * @param item - 菜单项数据
 * @param collapsed - 是否处于折叠状态
 * @param activeKey - 当前激活的菜单项key
 * @param onSelect - 选中回调函数
 * @param expandedKeys - 已展开的菜单项key集合
 * @param toggleExpand - 切换展开状态的函数
 * @param t - 翻译函数
 */
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
  t: (key: string) => string
}) {
  const isActive = activeKey === item.key || (item.children && item.children.some(child => child.key === activeKey))
  const hasChildren = item.children && item.children.length > 0
  const isExpanded = expandedKeys.has(item.key)
  const Icon = getIconComponent(item.icon)
  const label = getMenuLabel(item.key, item.label, t)

  // 折叠状态下只显示图标和tooltip
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
              // 折叠状态下点击有子菜单的项，先展开显示子菜单
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
          <ChevronDown className="text-sm text-default-400" />
        </motion.div>
      </Button>

      {/* 子菜单（带动画） */}
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

/**
 * 垂直菜单组件属性
 */
interface VerticalMenuProps {
  /** 自定义类名 */
  className?: string
  /** Logo 区域 */
  logo?: React.ReactNode
  /** 自定义菜单数据（用于动态菜单） */
  menus?: MenuItem[]
}

/**
 * 垂直菜单主组件
 * @param className - 自定义类名
 * @param logo - Logo区域
 * @param menus - 自定义菜单数据
 */
export default function VerticalMenu({ className, logo, menus }: VerticalMenuProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const {
    sidebarCollapsed: collapsed,
    toggleSidebar,
    adminSettings
  } = useAppStore()
  const { userInfo } = useUserStore()
  const { dynamicMenus, fetchMenus } = useMenuStore()
  const { menuWidth, sidebarAccordion } = adminSettings

  // 组件挂载时获取菜单数据
  useEffect(() => {
    fetchMenus()
  }, [fetchMenus])

  // 从 userInfo 中获取权限列表
  const permissions = useMemo(() => {
    return userInfo?.permissions || []
  }, [userInfo])

  // 判断是否为管理员角色（super_admin 或 admin）
  const isAdmin = userInfo?.roles.some(role => role === 'super_admin' || role === 'admin')

  // 根据用户权限过滤菜单（管理员角色显示所有菜单）
  // 优先级：传入的 menus > 动态菜单 > 默认菜单
  const currentMenus = useMemo(() => {
    const sourceMenus = menus || (dynamicMenus.length > 0 ? dynamicMenus : ADMIN_MENUS)
    if (isAdmin) return sourceMenus
    return filterMenusByPermission(sourceMenus, permissions)
  }, [menus, dynamicMenus, permissions, isAdmin])

  // 获取当前激活的菜单项key
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

  // 展开的菜单项状态
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(() => {
    const path = location.pathname
    const expanded = new Set<string>()
    for (const menu of currentMenus) {
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
        const next = new Set<string>()
        for (const menu of currentMenus) {
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
  }, [sidebarAccordion, activeKey, currentMenus])

  // 处理菜单选择
  const handleSelect = useCallback((item: MenuItem) => {
    if (item.path) {
      navigate(item.path)
    }
  }, [navigate])

  // 排序后的菜单
  const sortedMenus = useMemo(() => getSortedMenus(currentMenus), [currentMenus])

  // 默认 Logo
  const defaultLogo = (
    <div className="flex items-center gap-2">
      <Menu className="text-2xl text-primary" />
      <span className="font-semibold text-lg">知识库后台</span>
    </div>
  )

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 64 : menuWidth }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className={cn(
        'h-screen bg-content1 border-r border-default-800 flex flex-col',
        className
      )}
    >
      {/* Logo 区域 */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-default-800">
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
            <ChevronRight className="text-lg" />
          ) : (
            <ChevronLeft className="text-lg" />
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