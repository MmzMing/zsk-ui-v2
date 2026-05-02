/**
 * 后台管理顶部栏组件
 * 包含面包屑、搜索、通知、用户菜单等
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Navbar,
  NavbarContent,
  NavbarItem,
  Button,
  Input,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
  Avatar,
  Divider,
  Kbd,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Chip,
} from '@heroui/react'
import { useTranslation } from 'react-i18next'
import {
  HiOutlineSearch,
  HiOutlineBell,
  HiOutlineCog,
  HiOutlineUser,
  HiOutlineLogout,
  HiOutlineHome,
  HiOutlineChevronRight
} from 'react-icons/hi'
import { Search, Menu, Bell, Calendar, User } from 'lucide-react'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { useBreakpoint } from '@/hooks/useBreakpoint'
import { useTheme } from '@/hooks'
import { ADMIN_MENUS, getSortedMenus } from '@/constants/menu'
import ThemeDrawer from './ThemeDrawer'
import { cn } from '@/utils'
import { SiteLogo } from '@/components/ui/SiteLogo'
import { AnimatedThemeToggle } from '@/components/ui/magicui/AnimatedThemeToggle'
import { LocaleSwitcher } from '@/components/ui/LocaleSwitcher'
import { getConsoleNotices, getNoticeById } from '@/api/admin/notice'
import type { SysNotice } from '@/types/notice.types'
import { formatDateTime } from '@/utils/format'

// 面包屑项类型
interface BreadcrumbItem {
  label: string
  path?: string
}

// 顶部栏属性
interface AdminHeaderProps {
  /** 面包屑数据 */
  breadcrumbs?: BreadcrumbItem[]
  className?: string
}

export default function AdminHeader({ breadcrumbs = [], className }: AdminHeaderProps) {
  const { t } = useTranslation(['navigation', 'common'])
  const navigate = useNavigate()
  const { userInfo, logout } = useUserStore()
  const { adminSettings } = useAppStore()
  const { showBreadcrumb } = adminSettings
  const { isMobile } = useBreakpoint()
  const { actualTheme } = useTheme()
  const [searchValue, setSearchValue] = useState('')
  const [themeDrawerOpen, setThemeDrawerOpen] = useState(false)
  const [logoHovered, setLogoHovered] = useState(false)

  // 通知公告状态
  const [notices, setNotices] = useState<SysNotice[]>([])
  const [noticeLoading, setNoticeLoading] = useState(false)
  const [noticeOpen, setNoticeOpen] = useState(false)
  const [selectedNotice, setSelectedNotice] = useState<SysNotice | null>(null)
  const [noticeDetailOpen, setNoticeDetailOpen] = useState(false)

  // 已读公告缓存（localStorage）
  const [readNoticeIds, setReadNoticeIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('admin_read_notices')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          return new Set(parsed as string[])
        }
      }
    } catch {
      // 解析失败时返回空集合
    }
    return new Set<string>()
  })

  // 未读公告数量
  const unreadCount = useMemo(() => {
    return notices.filter(n => !readNoticeIds.has(n.id)).length
  }, [notices, readNoticeIds])

  const isDark = actualTheme === 'dark'

  // 处理搜索
  const handleSearch = useCallback((value: string) => {
    console.info('搜索：', value)
    // TODO: 实现搜索功能
  }, [])

  // 获取通知公告列表
  const fetchNotices = useCallback(async () => {
    setNoticeLoading(true)
    try {
      const data = await getConsoleNotices()
      setNotices(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('获取公告列表失败：', error)
    } finally {
      setNoticeLoading(false)
    }
  }, [])

  // 组件挂载时加载公告
  useEffect(() => {
    fetchNotices()
  }, [fetchNotices])

  // 标记公告为已读并持久化到 localStorage
  const markNoticeAsRead = useCallback((id: string) => {
    setReadNoticeIds(prev => {
      if (prev.has(id)) return prev
      const next = new Set(prev)
      next.add(id)
      try {
        localStorage.setItem('admin_read_notices', JSON.stringify(Array.from(next)))
      } catch {
        // localStorage 写入失败时静默处理
      }
      return next
    })
  }, [])

  // 查看公告详情
  const handleViewNotice = useCallback(async (notice: SysNotice) => {
    // 标记为已读
    markNoticeAsRead(notice.id)

    if (!notice.content || notice.content.length < 10) {
      // 内容为空或较短时尝试获取详情
      try {
        const detail = await getNoticeById(notice.id)
        setSelectedNotice(detail)
      } catch (error) {
        console.error('获取公告详情失败：', error)
        setSelectedNotice(notice)
      }
    } else {
      setSelectedNotice(notice)
    }
    setNoticeDetailOpen(true)
  }, [markNoticeAsRead])

  // 获取相对时间
  const getRelativeTime = useCallback((dateStr?: string): string => {
    if (!dateStr) return ''
    const now = Date.now()
    const target = new Date(dateStr).getTime()
    const diff = now - target

    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`

    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}小时前`

    const days = Math.floor(hours / 24)
    if (days === 1) return '昨天'
    if (days < 30) return `${days}天前`

    return new Date(dateStr).toLocaleDateString('zh-CN')
  }, [])

  // 处理登出
  const handleLogout = useCallback(() => {
    logout()
    navigate('/')
  }, [logout, navigate])

  // 获取排序后的菜单
  const sortedMenus = useMemo(() => getSortedMenus(ADMIN_MENUS), [])

  // 菜单项下拉列表
  const MenuDropdownContent = () => {
    // 获取当前路径
    const currentPath = window.location.pathname
    
    return (
      <DropdownMenu 
        aria-label="后台管理导航菜单" 
        variant="flat"
        onAction={(key) => navigate(key as string)}
        className="max-h-[70vh] overflow-y-auto"
      >
        {sortedMenus.map((menu, index) => {
          const isActive = menu.path === currentPath
          
          if (menu.children && menu.children.length > 0) {
            return (
              <React.Fragment key={menu.key}>
                <DropdownSection 
                  title={t(`menu.${menu.key}`, menu.label)} 
                  showDivider
                >
                  {menu.children.map((child) => {
                    const isChildActive = child.path === currentPath
                    return (
                      <DropdownItem
                        key={child.path || child.key}
                        startContent={child.icon && <child.icon className="text-lg" />}
                        textValue={t(`menu.${child.key}`, child.label)}
                        className={isChildActive ? 'bg-primary/10 text-primary font-medium' : ''}
                      >
                        {t(`menu.${child.key}`, child.label)}
                      </DropdownItem>
                    )
                  })}
                </DropdownSection>
              </React.Fragment>
            )
          }
          
          const menuElement = (
            <DropdownItem
              key={menu.path || menu.key}
              startContent={menu.icon && <menu.icon className="text-lg" />}
              textValue={t(`menu.${menu.key}`, menu.label)}
              className={isActive ? 'bg-primary/10 text-primary font-medium' : ''}
            >
              {t(`menu.${menu.key}`, menu.label)}
            </DropdownItem>
          )
          
          // 在仪表盘（dashboard）后面添加分割线
          if (menu.key === 'dashboard' && index < sortedMenus.length - 1) {
            return (
              <React.Fragment key={menu.key}>
                {menuElement}
                <DropdownItem key={`divider-${menu.key}`} className="h-0 p-0" textValue="divider">
                  <Divider />
                </DropdownItem>
              </React.Fragment>
            )
          }
          
          return menuElement
        })}
      </DropdownMenu>
    )
  }

  // 用户下拉菜单内容
  const UserMenuContent = () => (
    <DropdownMenu aria-label="用户菜单" variant="flat">
      <DropdownItem
        key="frontend"
        startContent={<HiOutlineHome className="text-lg" />}
        onPress={() => navigate('/')}
        textValue={t('menu.home')}
      >
        {t('menu.home')}
      </DropdownItem>
      <DropdownItem
        key="profile"
        startContent={<HiOutlineUser className="text-lg" />}
        onPress={() => navigate('/profile')}
        textValue={t('menu.profile')}
      >
        {t('menu.profile')}
      </DropdownItem>
      <DropdownItem key="divider" className="h-0 p-0" textValue="divider">
        <Divider />
      </DropdownItem>
      <DropdownItem
        key="logout"
        className="bg-danger/10 text-danger [&:hover]:bg-danger [&:hover]:text-white [&:hover]:!text-white"
        startContent={<HiOutlineLogout className="text-lg" />}
        onPress={handleLogout}
        textValue={t('user.logout')}
      >
        {t('user.logout')}
      </DropdownItem>
    </DropdownMenu>
  )

  // 通知类型映射
  const noticeTypeMap: Record<string, { label: string; color: 'primary' | 'warning' | 'default' }> = {
    '1': { label: '通知', color: 'primary' },
    '2': { label: '公告', color: 'warning' },
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {isMobile ? (
          // 移动端：双容器布局（跟前台一样）
          <motion.header
            key="mobile-header"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn('sticky top-0 z-50 w-full py-3 px-4 flex justify-between items-center gap-4', className)}
          >
            {/* 左侧容器：Logo */}
            <motion.div
              initial={{ scale: 0.8, x: -20 }}
              animate={{ scale: 1, x: 0 }}
              className="relative flex items-center justify-center w-10 h-10 rounded-full bg-background/90 backdrop-blur-xl border border-default-800/50 shadow-lg cursor-pointer"
              onMouseEnter={() => setLogoHovered(true)}
              onMouseLeave={() => setLogoHovered(false)}
            >
              <Link to="/admin/dashboard" className="flex items-center justify-center">
                <SiteLogo size="sm" />
              </Link>
              
              {/* 悬停展开的文字 */}
              <AnimatePresence>
                {logoHovered && (
                  <motion.span
                    initial={{ width: 0, opacity: 0, x: -10 }}
                    animate={{ width: 'auto', opacity: 1, x: 0 }}
                    exit={{ width: 0, opacity: 0, x: -10 }}
                    className="absolute left-full ml-2 overflow-hidden whitespace-nowrap text-sm font-bold bg-gradient-to-r from-primary to-primary-600 bg-clip-text text-transparent"
                  >
                    {t('menu.admin')}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>

            {/* 右侧容器：工具栏 + 菜单 */}
            <motion.div
              initial={{ scale: 0.8, x: 20 }}
              animate={{ scale: 1, x: 0 }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-background/90 backdrop-blur-xl border border-default-800/50 shadow-lg"
            >
              {/* 搜索按钮 */}
              <Button
                variant="light"
                isIconOnly
                size="sm"
                className="min-w-8 w-8 h-8 rounded-full"
                onPress={() => console.info('移动端搜索')}
              >
                <Search size={18} className="text-default-500" />
              </Button>

              <LocaleSwitcher />

              {/* 主题切换 */}
              <AnimatedThemeToggle className="w-8 h-8 !min-w-8 rounded-full" />

              {/* 用户下拉框 */}
              <Dropdown placement="bottom-end">
                <DropdownTrigger>
                  <Button variant="light" isIconOnly size="sm" className="min-w-8 w-8 h-8 rounded-full">
                    {userInfo?.avatar ? (
                      <Avatar
                        name={userInfo?.name || '用户'}
                        src={userInfo?.avatar}
                        size="sm"
                        className="w-7 h-7"
                      />
                    ) : (
                      <div className={cn(
                        'w-7 h-7 rounded-full flex items-center justify-center',
                        isDark ? 'bg-[var(--primary-color)]' : 'bg-default-200'
                      )}>
                        <HiOutlineUser className={cn(
                          'w-4 h-4',
                          isDark ? 'text-white' : 'text-default-900'
                        )} />
                      </div>
                    )}
                  </Button>
                </DropdownTrigger>
                <UserMenuContent />
              </Dropdown>

              {/* 分隔线 */}
              <div className="w-px h-4 bg-divider/50 mx-0.5" />

              {/* 菜单下拉框 - 替换原有的侧边栏按钮 */}
              <Dropdown placement="bottom-end">
                <DropdownTrigger>
                  <Button
                    variant="light"
                    isIconOnly
                    size="sm"
                    className="min-w-8 w-8 h-8 rounded-full"
                  >
                    <Menu size={20} className="text-default-500" />
                  </Button>
                </DropdownTrigger>
                <MenuDropdownContent />
              </Dropdown>
            </motion.div>
          </motion.header>
        ) : (
          // 桌面端：标准 Navbar
          <motion.div
            key="desktop-header"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Navbar
              className={cn('h-14 px-4 border-b-[var(--admin-border-width)] border-default-800 bg-content1', className)}
              maxWidth="full"
            >
              {/* 左侧：面包屑 */}
              <NavbarContent justify="start" className="flex-1 gap-1 md:gap-2">
                {showBreadcrumb && breadcrumbs.length > 0 && (
                  <div className="flex items-center gap-1 text-sm">
                    <Button
                      variant="light"
                      size="sm"
                      isIconOnly
                      onPress={() => navigate('/admin/dashboard')}
                    >
                      <HiOutlineHome className="text-lg" />
                    </Button>
                    {breadcrumbs.map((item, index) => (
                      <div key={index} className="flex items-center gap-1">
                        <HiOutlineChevronRight className="text-default-400 text-xs" />
                        {item.path ? (
                          <Button
                            variant="light"
                            size="sm"
                            className="h-6 min-w-0 px-2"
                            onPress={() => navigate(item.path!)}
                          >
                            {item.label}
                          </Button>
                        ) : (
                          <span className="text-default-foreground font-medium">{item.label}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </NavbarContent>

              {/* 右侧：工具栏 */}
              <NavbarContent justify="end" className="gap-1">
                {/* 搜索框 */}
                <NavbarItem className="hidden lg:flex">
                  <Input
                    placeholder={t('common:actions.search')}
                    value={searchValue}
                    onValueChange={setSearchValue}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchValue)}
                    startContent={<HiOutlineSearch className="text-default-400" />}
                    endContent={
                      <Kbd className="hidden lg:inline-flex" keys={['command']}>
                        K
                      </Kbd>
                    }
                    size="sm"
                    variant="flat"
                    className="w-56"
                    classNames={{
                      input: 'text-sm',
                      inputWrapper: 'bg-default-100'
                    }}
                  />
                </NavbarItem>

                {/* 国际化切换 */}
                <NavbarItem>
                  <LocaleSwitcher />
                </NavbarItem>

                {/* 通知 */}
                <NavbarItem>
                  <Dropdown
                    placement="bottom-end"
                    isOpen={noticeOpen}
                    onOpenChange={setNoticeOpen}
                  >
                    <DropdownTrigger>
                      <Button variant="light" isIconOnly className="text-default-500 relative overflow-visible">
                        <HiOutlineBell className="text-lg" />
                        {unreadCount > 0 && (
                          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold text-white bg-danger rounded-full px-1 border-2 border-content1">
                            {unreadCount > 99 ? '99+' : unreadCount}
                          </span>
                        )}
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                      aria-label="系统公告"
                      variant="flat"
                      className="w-80 max-h-[400px] overflow-y-auto"
                      closeOnSelect={false}
                    >
                      <DropdownSection title="系统公告" showDivider>
                        {noticeLoading ? (
                          <DropdownItem key="loading" isReadOnly textValue="加载中">
                            <div className="flex items-center justify-center py-4 text-default-400">
                              <span className="text-sm">加载中...</span>
                            </div>
                          </DropdownItem>
                        ) : notices.length === 0 ? (
                          <DropdownItem key="empty" isReadOnly textValue="暂无公告">
                            <div className="flex flex-col items-center justify-center py-6 text-default-400">
                              <Bell size={24} className="mb-2 opacity-50" />
                              <span className="text-sm">暂无公告</span>
                            </div>
                          </DropdownItem>
                        ) : (
                          notices.map((notice) => {
                            const isRead = readNoticeIds.has(notice.id)
                            return (
                              <DropdownItem
                                key={notice.id}
                                textValue={notice.noticeTitle}
                                onPress={() => handleViewNotice(notice)}
                                className={cn('py-2', !isRead && 'bg-primary/5')}
                              >
                                <div className="flex items-start gap-2 w-full">
                                  <div className={cn(
                                    'w-2 h-2 rounded-full mt-1.5 shrink-0',
                                    isRead
                                      ? 'bg-default-300'
                                      : notice.noticeType === '1' ? 'bg-primary' : 'bg-warning'
                                  )} />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <span className={cn(
                                        'text-sm truncate',
                                        isRead ? 'text-default-500 font-normal' : 'text-default-900 font-semibold'
                                      )}>
                                        {notice.noticeTitle}
                                      </span>
                                      <Chip
                                        size="sm"
                                        variant="flat"
                                        color={noticeTypeMap[notice.noticeType]?.color ?? 'default'}
                                        className="h-4 text-[10px]"
                                      >
                                        {noticeTypeMap[notice.noticeType]?.label ?? '未知'}
                                      </Chip>
                                      {!isRead && (
                                        <span className="w-1.5 h-1.5 rounded-full bg-danger shrink-0" />
                                      )}
                                    </div>
                                    <p className="text-xs text-default-500 line-clamp-1 mt-0.5">
                                      {notice.content}
                                    </p>
                                    <p className="text-[10px] text-default-400 mt-0.5">
                                      {getRelativeTime(notice.createTime)}
                                    </p>
                                  </div>
                                </div>
                              </DropdownItem>
                            )
                          })
                        )}
                      </DropdownSection>
                      <DropdownItem
                        key="more"
                        textValue="查看更多"
                        onPress={() => {
                          setNoticeOpen(false)
                          navigate('/admin/monitor/notice')
                        }}
                        className="text-center text-primary text-sm"
                      >
                        查看更多
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </NavbarItem>

                {/* 主题切换 */}
                <NavbarItem>
                  <AnimatedThemeToggle className="w-8 h-8 !min-w-8 rounded-full" />
                </NavbarItem>

                {/* 设置按钮 */}
                <NavbarItem>
                  <Button
                    variant="light"
                    isIconOnly
                    onPress={() => setThemeDrawerOpen(true)}
                    className="text-default-500"
                  >
                    <HiOutlineCog className="text-lg" />
                  </Button>
                </NavbarItem>

                <Divider orientation="vertical" className="h-6 mx-1" />

                {/* 用户菜单 */}
                <NavbarItem>
                  <Dropdown placement="bottom-end">
                    <DropdownTrigger>
                      <Button variant="light" className="gap-2 px-2">
                        {userInfo?.avatar ? (
                          <Avatar
                            name={userInfo?.name || '用户'}
                            src={userInfo?.avatar}
                            size="sm"
                            className="cursor-pointer"
                          />
                        ) : (
                          <div className={cn(
                            'w-7 h-7 rounded-full flex items-center justify-center',
                            isDark ? 'bg-[var(--primary-color)]' : 'bg-default-200'
                          )}>
                            <HiOutlineUser className={cn(
                              'w-4 h-4',
                              isDark ? 'text-white' : 'text-default-900'
                            )} />
                          </div>
                        )}
                        <span className="hidden sm:inline text-sm">{userInfo?.name || '用户'}</span>
                      </Button>
                    </DropdownTrigger>
                    <UserMenuContent />
                  </Dropdown>
                </NavbarItem>
              </NavbarContent>
            </Navbar>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 主题设置抽屉 */}
      <ThemeDrawer
        isOpen={themeDrawerOpen}
        onClose={() => setThemeDrawerOpen(false)}
      />

      {/* 公告详情弹窗 */}
      <Modal isOpen={noticeDetailOpen} onOpenChange={setNoticeDetailOpen} size="lg" scrollBehavior="inside">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold">{selectedNotice?.noticeTitle}</span>
              {selectedNotice && (
                <Chip
                  size="sm"
                  variant="flat"
                  color={noticeTypeMap[selectedNotice.noticeType]?.color ?? 'default'}
                >
                  {noticeTypeMap[selectedNotice.noticeType]?.label ?? '未知'}
                </Chip>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-default-400 font-normal">
              {selectedNotice?.createTime && (
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {formatDateTime(selectedNotice.createTime)}
                </span>
              )}
              {selectedNotice?.createBy && (
                <span className="flex items-center gap-1">
                  <User size={12} />
                  {selectedNotice.createBy}
                </span>
              )}
            </div>
          </ModalHeader>
          <ModalBody>
            <div className="text-sm text-default-700 leading-relaxed whitespace-pre-wrap">
              {selectedNotice?.content || '暂无内容'}
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}
