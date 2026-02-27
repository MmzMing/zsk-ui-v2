/**
 * Dock 菜单弹出面板组件
 * 类似 Windows 开始桌面，能搜索菜单，分为一二级菜单 T 形布局
 */

import { useState, useCallback, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Input, ScrollShadow, Button } from '@heroui/react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiOutlineSearch,
  HiOutlineChevronRight
} from 'react-icons/hi'
import { ADMIN_MENUS, getSortedMenus, type MenuItem } from '@/constants/menu'
import { cn } from '@/utils'

// Dock 弹出面板属性
interface DockMenuPanelProps {
  /** 是否显示 */
  isOpen: boolean
  /** 关闭回调 */
  onClose: () => void
}

export default function DockMenuPanel({ isOpen, onClose }: DockMenuPanelProps) {
  const { t } = useTranslation(['navigation', 'common'])
  const navigate = useNavigate()
  const location = useLocation()
  const [searchValue, setSearchValue] = useState('')
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null)

  // 排序后的菜单
  const sortedMenus = useMemo(() => getSortedMenus(ADMIN_MENUS), [])

  // 过滤菜单
  const filteredMenus = useMemo(() => {
    const keyword = searchValue.toLowerCase().trim()
    if (!keyword) return sortedMenus
    
    return sortedMenus
      .map(menu => {
        const menuLabel = t(`menu.${menu.key}`, menu.label).toLowerCase()
        // 检查一级菜单
        if (menuLabel.includes(keyword)) {
          return menu
        }
        // 检查子菜单
        if (menu.children) {
          const matchedChildren = menu.children.filter(child => {
            const childLabel = t(`menu.${child.key}`, child.label).toLowerCase()
            return childLabel.includes(keyword)
          })
          if (matchedChildren.length > 0) {
            return { ...menu, children: matchedChildren }
          }
        }
        return null
      })
      .filter(Boolean) as MenuItem[]
  }, [sortedMenus, searchValue, t])

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
      onClose()
      setSearchValue('')
      setSelectedMenu(null)
    }
  }, [navigate, onClose])

  // 渲染一级菜单
  const renderFirstLevel = () => (
    <div className="flex flex-col gap-1">
      {filteredMenus.map((menu) => {
        const isActive = activeKey === menu.key
        const Icon = menu.icon
        const label = t(`menu.${menu.key}`, menu.label)
        
        return (
          <div key={menu.key}>
            <Button
              variant={isActive ? 'flat' : 'light'}
              color={isActive ? 'primary' : 'default'}
              className={cn(
                'w-full justify-start gap-3 h-11 px-3',
                isActive && 'bg-primary/10'
              )}
              onPress={() => {
                if (menu.children && menu.children.length > 0) {
                  setSelectedMenu(menu)
                } else if (menu.path) {
                  handleSelect(menu)
                }
              }}
            >
              {Icon && <Icon className="text-lg flex-shrink-0" />}
              <span className="truncate flex-1 text-left">{label}</span>
              {menu.children && menu.children.length > 0 && (
                <HiOutlineChevronRight className="text-sm text-default-400" />
              )}
            </Button>
          </div>
        )
      })}
    </div>
  )

  // 渲染二级菜单
  const renderSecondLevel = () => {
    if (!selectedMenu?.children) return null
    
    return (
      <div className="flex flex-col gap-1">
        <Button
          variant="light"
          className="w-full justify-start gap-2 h-9 px-3 mb-1"
          onPress={() => setSelectedMenu(null)}
        >
          <HiOutlineChevronRight className="text-lg rotate-180" />
          <span className="text-sm">{t('common:actions.back', '返回')}</span>
        </Button>
        {selectedMenu.children.map((child) => {
          const isActive = activeKey === child.key
          const Icon = child.icon
          
          return (
            <Button
              key={child.key}
              variant={isActive ? 'flat' : 'light'}
              color={isActive ? 'primary' : 'default'}
              className={cn(
                'w-full justify-start gap-3 h-11 px-3',
                isActive && 'bg-primary/10'
              )}
              onPress={() => handleSelect(child)}
            >
              {Icon && <Icon className="text-lg flex-shrink-0" />}
              <span className="truncate">{t(`menu.${child.key}`, child.label)}</span>
            </Button>
          )
        })}
      </div>
    )
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 遮罩层 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40 bg-black/30"
            onClick={onClose}
          />
          
          {/* 弹出面板 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 
                       w-[600px] max-w-[90vw] h-[400px] 
                       bg-content1 rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* 搜索框 */}
            <div className="p-4">
              <Input
                placeholder={t('common:actions.searchMenu', '搜索菜单...')}
                value={searchValue}
                onValueChange={setSearchValue}
                startContent={<HiOutlineSearch className="text-default-400" />}
                size="sm"
                variant="flat"
                classNames={{
                  input: 'text-sm',
                  inputWrapper: 'bg-default-100'
                }}
              />
            </div>

            {/* 菜单内容 - T 形布局 */}
            <div className="flex h-[calc(100%-65px)]">
              {/* 左侧：一级菜单 */}
              <div className="w-1/2 p-3 overflow-y-auto">
                <ScrollShadow className="h-full">
                  {renderFirstLevel()}
                </ScrollShadow>
              </div>

              {/* 右侧：二级菜单 */}
              <div className="w-1/2 p-3 overflow-y-auto">
                <ScrollShadow className="h-full">
                  {selectedMenu ? (
                    renderSecondLevel()
                  ) : (
                    <div className="h-full flex items-center justify-center text-default-400 text-sm">
                      {searchValue ? t('common:errors.noMatchingMenu', '未找到匹配的菜单') : t('common:actions.selectMenuToViewChildren', '请选择一级菜单查看子菜单')}
                    </div>
                  )}
                </ScrollShadow>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
