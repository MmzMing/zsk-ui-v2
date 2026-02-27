/**
 * Dock 菜单组件
 * 使用 reactbits 的 Dock 组件，包含 7 个功能项：
 * 1. 菜单 - 点击展开搜索菜单面板
 * 2. 主题 - 切换主题模式
 * 3. 主题设置 - 打开主题设置抽屉
 * 4. 用户 - 用户菜单
 * 5. 全屏 - 切换全屏
 * 6. 消息 - 消息通知
 * 7. 时间 - 显示当前时间
 */

import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { useTheme } from '@/hooks/useTheme'
import Dock, { type DockItemData } from '@/components/ui/reactbits/Dock'
import DockMenuPanel from './DockMenuPanel'
import {
  HiOutlineMenuAlt2,
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineUser,
  HiOutlineBell,
  HiOutlineArrowsExpand,
  HiOutlineLogin,
  HiOutlineColorSwatch
} from 'react-icons/hi'
import {
  HiOutlineTemplate
} from 'react-icons/hi'
import ThemeDrawer from '../ThemeDrawer'
import { Badge, Avatar, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Divider } from '@heroui/react'
import { LocaleSwitcher } from '@/components/ui/LocaleSwitcher'

// Dock 菜单组件属性
interface DockMenuProps {
  /** 自定义类名 */
  className?: string
}

export default function DockMenu({ className }: DockMenuProps) {
  const { t, i18n } = useTranslation(['navigation', 'common'])
  const navigate = useNavigate()
  const { toggleFullscreen, isFullscreen, adminSettings } = useAppStore()
  const { themeMode } = adminSettings
  const { actualTheme, setThemeMode } = useTheme()
  const { userInfo, logout } = useUserStore()
  
  // 菜单面板显示状态
  const [menuPanelOpen, setMenuPanelOpen] = useState(false)
  // 主题抽屉显示状态
  const [themeDrawerOpen, setThemeDrawerOpen] = useState(false)
  
  // 当前时间
  const [currentTime, setCurrentTime] = useState(new Date())

  // 更新时间
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // 格式化时间
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(i18n.language, { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    })
  }

  // 切换菜单面板
  const toggleMenuPanel = useCallback(() => {
    setMenuPanelOpen(prev => !prev)
  }, [])

  // 关闭菜单面板
  const closeMenuPanel = useCallback(() => {
    setMenuPanelOpen(false)
  }, [])

  // 切换主题
  const toggleTheme = useCallback(() => {
    const modes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system']
    const currentIndex = modes.indexOf(themeMode as 'light' | 'dark' | 'system')
    const nextIndex = (currentIndex + 1) % modes.length
    setThemeMode(modes[nextIndex])
  }, [themeMode, setThemeMode])

  // 获取主题图标
  const getThemeIcon = () => {
    if (actualTheme === 'dark') {
      return <HiOutlineMoon className="text-xl" />
    }
    return <HiOutlineSun className="text-xl" />
  }

  // 获取主题标签
  const getThemeLabel = () => {
    switch (themeMode) {
      case 'light': return t('common:theme.light')
      case 'dark': return t('common:theme.dark')
      default: return t('common:theme.system')
    }
  }

  // 处理登出
  const handleLogout = useCallback(() => {
    logout()
    navigate('/login')
  }, [logout, navigate])

  // Dock 项目数据
  const dockItems: DockItemData[] = [
    {
      icon: <HiOutlineMenuAlt2 className="text-xl" />,
      label: t('menu.admin'),
      onClick: toggleMenuPanel
    },
    {
      icon: getThemeIcon(),
      label: getThemeLabel(),
      onClick: toggleTheme
    },
    {
      icon: <LocaleSwitcher />,
      label: t('menu.language'),
      onClick: () => {}
    },
    {
      icon: <HiOutlineColorSwatch className="text-xl" />,
      label: t('common:actions.themeSettings'),
      onClick: () => setThemeDrawerOpen(true)
    },
    {
      icon: (
        <Dropdown placement="top">
          <DropdownTrigger>
            <div className="w-full h-full flex items-center justify-center">
              <Avatar
                name={userInfo?.name || '用户'}
                size="sm"
                className="cursor-pointer"
              />
            </div>
          </DropdownTrigger>
          <DropdownMenu aria-label="用户菜单" variant="flat">
            <DropdownItem
              key="profile"
              startContent={<HiOutlineUser className="text-lg" />}
              onPress={() => navigate('/admin/profile')}
              textValue={t('menu.profile')}
            >
              {t('menu.profile')}
            </DropdownItem>
            <DropdownItem
              key="settings"
              startContent={<HiOutlineTemplate className="text-lg" />}
              onPress={() => navigate('/admin/system/general')}
              textValue={t('user.settings')}
            >
              {t('user.settings')}
            </DropdownItem>
            <DropdownItem key="divider" className="h-0 p-0" textValue="divider">
              <Divider />
            </DropdownItem>
            <DropdownItem
              key="logout"
              color="danger"
              startContent={<HiOutlineLogin className="text-lg" />}
              onPress={handleLogout}
              textValue={t('user.logout')}
            >
              {t('user.logout')}
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      ),
      label: userInfo?.name || t('common:user.anonymous'),
      onClick: () => {}
    },
    {
      icon: isFullscreen ? (
        <svg className="text-xl" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
        </svg>
      ) : (
        <HiOutlineArrowsExpand className="text-xl" />
      ),
      label: isFullscreen ? t('common:actions.exitFullscreen') : t('common:actions.fullscreen'),
      onClick: toggleFullscreen
    },
    {
      icon: (
        <Badge content="3" size="sm" color="danger">
          <HiOutlineBell className="text-xl" />
        </Badge>
      ),
      label: t('menu.messages', '消息'),
      onClick: () => {
        // TODO: 打开消息面板
        console.info('打开消息面板')
      }
    },
    {
      icon: (
        <span className="text-base font-semibold">{formatTime(currentTime)}</span>
      ),
      label: formatTime(currentTime),
      onClick: () => {},
      noCircle: true,
      showDivider: true
    }
  ]

  return (
    <div className={className}>
      {/* Dock 组件 */}
      <Dock
        items={dockItems}
        magnification={60}
        distance={150}
      />

      {/* 菜单弹出面板 */}
      <DockMenuPanel
        isOpen={menuPanelOpen}
        onClose={closeMenuPanel}
      />

      {/* 主题设置抽屉 */}
      <ThemeDrawer
        isOpen={themeDrawerOpen}
        onClose={() => setThemeDrawerOpen(false)}
      />
    </div>
  )
}
