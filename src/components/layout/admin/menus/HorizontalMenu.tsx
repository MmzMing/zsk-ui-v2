/**
 * 水平菜单组件
 * 菜单横向排列于页面顶部，一级菜单平铺展示，二级及以上菜单通过下拉方式呈现
 */

import { useState, useCallback, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react'
import { useTranslation } from 'react-i18next'
import {
  HiOutlineChevronDown,
  HiOutlineMenuAlt2
} from 'react-icons/hi'
import { ADMIN_MENUS, getSortedMenus, type MenuItem } from '@/constants/menu'
import { cn } from '@/utils'

// 水平菜单属性
interface HorizontalMenuProps {
  /** 自定义类名 */
  className?: string
  /** Logo 区域 */
  logo?: React.ReactNode
  /** 自定义右侧内容 */
  extra?: React.ReactNode
}

export default function HorizontalMenu({ className, logo, extra }: HorizontalMenuProps) {
  const { t } = useTranslation('navigation')
  const navigate = useNavigate()
  const location = useLocation()
  const [openKeys, setOpenKeys] = useState<Set<string>>(new Set())

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

  // 排序后的菜单
  const sortedMenus = useMemo(() => getSortedMenus(ADMIN_MENUS), [])

  // 处理菜单选择
  const handleSelect = useCallback((item: MenuItem) => {
    if (item.path) {
      navigate(item.path)
    }
  }, [navigate])

  // 渲染菜单项
  const renderMenuItem = (item: MenuItem) => {
    const isActive = activeKey === item.key || activeKey.startsWith(`${item.key}/`)
    const hasChildren = item.children && item.children.length > 0
    const isOpen = openKeys.has(item.key)
    const Icon = item.icon
    const label = t(`menu.${item.key}`, item.label)

    if (hasChildren) {
      return (
        <Dropdown
          key={item.key}
          isOpen={isOpen}
          onOpenChange={(open) => {
            if (open) {
              setOpenKeys(new Set([item.key]))
            } else {
              setOpenKeys((prev) => {
                const next = new Set(prev)
                next.delete(item.key)
                return next
              })
            }
          }}
        >
          <DropdownTrigger>
            <Button
              variant={isActive ? 'flat' : 'light'}
              color={isActive ? 'primary' : 'default'}
              className={cn(
                'h-10 px-3 gap-2 min-w-0',
                isActive && 'bg-primary/10 font-medium'
              )}
              endContent={
                <HiOutlineChevronDown className={cn(
                  'text-xs transition-transform hidden xl:block',
                  isOpen && 'rotate-180'
                )} />
              }
            >
              {Icon && <Icon className="text-lg flex-shrink-0" />}
              <span className="hidden xl:inline truncate">{label}</span>
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label={label}
            onAction={(key) => {
              const childItem = item.children?.find(c => c.key === key)
              if (childItem?.path) {
                navigate(childItem.path)
              }
            }}
          >
            {item.children?.map((child) => {
              const isChildActive = activeKey === child.key
              const ChildIcon = child.icon
              return (
                <DropdownItem
                  key={child.key}
                  startContent={ChildIcon ? <ChildIcon className="text-lg" /> : undefined}
                  className={cn(isChildActive && 'bg-primary/10 text-primary')}
                  textValue={t(`menu.${child.key}`, child.label)}
                >
                  {t(`menu.${child.key}`, child.label)}
                </DropdownItem>
              )
            }) || <></>}
          </DropdownMenu>
        </Dropdown>
      )
    }

    return (
      <Button
        key={item.key}
        variant={isActive ? 'flat' : 'light'}
        color={isActive ? 'primary' : 'default'}
        className={cn(
          'h-10 px-3 gap-2 min-w-0',
          isActive && 'bg-primary/10 font-medium'
        )}
        onPress={() => item.path && handleSelect(item)}
      >
        {Icon && <Icon className="text-lg flex-shrink-0" />}
        <span className="hidden xl:inline truncate">{label}</span>
      </Button>
    )
  }

  // 默认 Logo
  const defaultLogo = (
    <div className="flex items-center gap-2">
      <HiOutlineMenuAlt2 className="text-2xl text-primary" />
      <span className="font-semibold text-lg">{t('menu.admin')}</span>
    </div>
  )

  return (
    <header
      className={cn(
        'h-14 bg-content1 border-b border-divider flex items-center justify-between px-4',
        className
      )}
    >
      {/* 左侧 Logo 和菜单 */}
      <div className="flex items-center gap-4">
        {/* Logo */}
        <div className="flex-shrink-0">
          {logo || defaultLogo}
        </div>

        {/* 水平菜单 */}
        <nav className="hidden md:flex items-center">
          {sortedMenus.map((item) => renderMenuItem(item))}
        </nav>
      </div>

      {/* 右侧额外内容 */}
      <div className="flex items-center gap-2">
        {extra}
      </div>
    </header>
  )
}
