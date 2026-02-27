/**
 * 前台顶部导航栏组件
 * 使用 Aceternity UI 风格的滑动导航效果
 * 支持 Logo 悬停展开和滚动分裂收缩动效
 */

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Button, 
  Avatar, 
  Dropdown, 
  DropdownTrigger, 
  DropdownMenu, 
  DropdownItem,
  Divider
} from '@heroui/react'
import { useTranslation } from 'react-i18next'
import {
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineSearch,
  HiOutlineHome,
  HiOutlineDocumentText,
  HiOutlineTag,
  HiOutlineUser,
  HiOutlineLogout,
  HiOutlineCog,
  HiOutlineViewGrid,
  HiOutlineBeaker
} from 'react-icons/hi'
import { cn } from '@/utils'
import { AnimatedThemeToggle } from '@/components/ui/magicui/AnimatedThemeToggle'
import { SiteLogo } from '@/components/ui/SiteLogo'
import { SearchDialog } from '@/components/search/SearchDialog'
import { LocaleSwitcher } from '@/components/ui/LocaleSwitcher'
import { useScrollPosition } from '@/hooks'
import { useUserStore } from '@/stores/user'


// 导航项类型
interface NavItem {
  label: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  children?: NavItem[]
}



// 滑动高亮导航项
interface SlidingNavItemProps {
  item: NavItem
  isActive: boolean
  onClick: () => void
}

function SlidingNavItem({ item, isActive, onClick }: SlidingNavItemProps) {
  const Icon = item.icon
  return (
    <Link
      to={item.href}
      onClick={onClick}
      className={cn(
        'relative flex items-center gap-1.5 px-3 py-2 text-base font-medium transition-colors',
        isActive ? '!text-default-900 font-bold' : '!text-default-600 hover:!text-default-900'
      )}
    >
      {Icon && <Icon className="text-lg text-inherit" />}
      {item.label}
    </Link>
  )
}

// 收缩状态的图标导航项
interface CollapsedNavItemProps {
  item: NavItem
  isActive: boolean
  onClick: () => void
}

function CollapsedNavItem({ item, isActive, onClick }: CollapsedNavItemProps) {
  const Icon = item.icon
  return (
    <Link
      to={item.href}
      onClick={onClick}
      className={cn(
        'relative flex items-center justify-center w-8 h-8 rounded-full transition-colors',
        isActive
          ? 'bg-default-200 !text-default-900'
          : '!text-default-600 hover:bg-default-200/50 hover:!text-default-900'
      )}
      title={item.label}
    >
      {Icon && <Icon className="text-base text-inherit" />}
    </Link>
  )
}

// 前台头部属性
interface FrontHeaderProps {
  /** 自定义导航项 */
  navItems?: NavItem[]
  /** Logo 文字 */
  logoText?: string
  /** 是否显示搜索按钮 */
  showSearch?: boolean
  /** 滚动收缩阈值（像素） */
  scrollThreshold?: number
  className?: string
}

export default function FrontHeader({
  navItems: customNavItems,
  logoText = '知识库小破站',
  showSearch = true,
  scrollThreshold = 80,
  className
}: FrontHeaderProps) {
  const { t } = useTranslation('navigation')
  const location = useLocation()
  const navigate = useNavigate()
  const { userInfo, isLoggedIn, logout } = useUserStore()

  // 默认导航配置
  const defaultNavItems: NavItem[] = useMemo(() => [
    { label: t('menu.home'), href: '/', icon: HiOutlineHome },
    { label: t('menu.articles', '文章'), href: '/articles', icon: HiOutlineDocumentText },
    { label: t('menu.categories', '分类'), href: '/categories', icon: HiOutlineTag },
    { label: t('menu.test', '测试'), href: '/test', icon: HiOutlineBeaker },
    { label: t('menu.about'), href: '/about', icon: HiOutlineUser }
  ], [t])

  const navItems = customNavItems || defaultNavItems
  const navRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [logoHovered, setLogoHovered] = useState(false)
  const [logoCollapsedHovered, setLogoCollapsedHovered] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  // 滚动监听
  const { isScrolled } = useScrollPosition({ threshold: scrollThreshold })

  // 快捷键监听 (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // 处理登出
  const handleLogout = useCallback(() => {
    logout()
    navigate('/')
  }, [logout, navigate])

  // 用户下拉菜单内容
  const UserMenuContent = () => (
    <DropdownMenu aria-label="用户菜单" variant="flat">
      <DropdownItem
        key="admin"
        startContent={<HiOutlineViewGrid className="text-lg" />}
        onPress={() => navigate('/admin/dashboard')}
        textValue={t('menu.admin')}
      >
        {t('menu.admin')}
      </DropdownItem>
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
        startContent={<HiOutlineCog className="text-lg" />}
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
        startContent={<HiOutlineLogout className="text-lg" />}
        onPress={handleLogout}
        textValue={t('user.logout')}
      >
        {t('user.logout')}
      </DropdownItem>
    </DropdownMenu>
  )

  // 检测是否为移动端 (屏幕宽度 < 768px)
  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth < 768
  }, [])

  // 是否显示分裂样式：移动端始终显示分裂样式，或滚动超过阈值且非移动端
  const isSplitMode = isMobile || isScrolled

  // 根据路径获取激活索引
  const getActiveIndex = useCallback(() => {
    const currentPath = location.pathname
    const index = navItems.findIndex(item => {
      if (item.href === '/') return currentPath === '/'
      return currentPath.startsWith(item.href)
    })
    return index >= 0 ? index : 0
  }, [location.pathname, navItems])

  // 更新指示器位置
  const updateIndicator = useCallback((index: number) => {
    if (!navRef.current || isScrolled) return

    const navButtons = navRef.current.querySelectorAll('a')
    const targetButton = navButtons[index]

    if (targetButton) {
      const navRect = navRef.current.getBoundingClientRect()
      const btnRect = targetButton.getBoundingClientRect()
      // 将指示器宽度进一步缩小（30%）并居中对齐
      const width = btnRect.width * 0.3
      const left = (btnRect.left - navRect.left) + (btnRect.width * 0.35)
      setIndicatorStyle({
        left,
        width
      })
    }
  }, [isScrolled])

  // 初始化和路径变化时更新
  useEffect(() => {
    const index = getActiveIndex()
    setActiveIndex(index)
    updateIndicator(index)
  }, [getActiveIndex, updateIndicator])

  // 悬停时更新指示器
  useEffect(() => {
    if (hoverIndex !== null) {
      updateIndicator(hoverIndex)
    } else {
      updateIndicator(activeIndex)
    }
  }, [hoverIndex, activeIndex, updateIndicator])

  // 处理导航点击
  const handleNavClick = (index: number) => {
    setActiveIndex(index)
    setMobileMenuOpen(false)
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full h-16',
        'transition-all duration-300',
        className
      )}
    >
      {/* 展开状态 - 单一容器 */}
      <AnimatePresence mode="wait">
        {!isSplitMode ? (
          <motion.div
            key="expanded-header"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 w-full border-b border-divider bg-background/80 backdrop-blur-md"
          >
            <div className="container mx-auto px-4">
              <div className="flex h-16 items-center justify-between">
                {/* 左侧 Logo 区域 - 使用固定宽度避免影响中间 */}
                <div className="w-[240px] flex-shrink-0">
                  <Link
                    to="/"
                    className="relative flex items-center gap-2 text-xl font-bold !text-default-900"
                    onMouseEnter={() => setLogoHovered(true)}
                    onMouseLeave={() => setLogoHovered(false)}
                  >
                    <SiteLogo size="md" className="flex-shrink-0" />

                    {/* 悬停展开的文字 - 绝对定位不影响布局 */}
                    <AnimatePresence>
                      {logoHovered && (
                        <motion.span
                          initial={{ width: 0, opacity: 0 }}
                          animate={{ width: 'auto', opacity: 1 }}
                          exit={{ width: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: 'easeOut' }}
                          className="overflow-hidden whitespace-nowrap !text-default-900"
                        >
                          {logoText}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                </div>

                {/* 中间导航区域 - 居中固定 */}
                <nav
                  ref={navRef}
                  className="flex-1 flex justify-center items-center relative"
                  onMouseLeave={() => setHoverIndex(null)}
                >
                  {/* 滑动指示器 */}
                  <motion.div
                    className="absolute -bottom-1 h-1 bg-default-900 rounded-full"
                    initial={false}
                    animate={{
                      left: indicatorStyle.left,
                      width: indicatorStyle.width
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />

                  {/* 导航项 */}
                  {navItems.map((item, index) => (
                    <div
                      key={item.href}
                      onMouseEnter={() => setHoverIndex(index)}
                    >
                      <SlidingNavItem
                        item={item}
                        isActive={activeIndex === index}
                        onClick={() => handleNavClick(index)}
                      />
                    </div>
                  ))}
                </nav>

                {/* 右侧工具栏 - 固定宽度 */}
                <div className="w-[240px] flex-shrink-0 flex justify-end items-center gap-1">
                  {showSearch && (
                    <Button 
                      variant="light" 
                      isIconOnly
                      onPress={() => setIsSearchOpen(true)}
                      className="flex-shrink-0 !text-default-600 hover:!text-default-900"
                    >
                      <HiOutlineSearch className="text-lg" />
                    </Button>
                  )}

                  <div className="flex-shrink-0">
                    <LocaleSwitcher />
                  </div>
                  <AnimatedThemeToggle className="flex-shrink-0" />

                  {isLoggedIn ? (
                    <Dropdown placement="bottom-end">
                      <DropdownTrigger>
                        <Button variant="light" className="flex-shrink-0 gap-2 px-2 !text-default-600 hover:!text-default-900">
                          <Avatar
                            name={userInfo?.name || '用户'}
                            size="sm"
                            className="cursor-pointer"
                          />
                          <span className="hidden sm:inline text-base">{userInfo?.name || '用户'}</span>
                        </Button>
                      </DropdownTrigger>
                      <UserMenuContent />
                    </Dropdown>
                  ) : (
                    <Button variant="light" size="md" as={Link} to="/login" className="flex-shrink-0 !text-default-600 hover:!text-default-900">
                      {t('user.login', '登录')}
                    </Button>
                  )}

                  {/* 移动端菜单按钮 */}
                  <Button
                    variant="light"
                    isIconOnly
                    className="flex-shrink-0 md:hidden !text-default-600 hover:!text-default-900"
                    onPress={() => setMobileMenuOpen(!mobileMenuOpen)}
                  >
                    {mobileMenuOpen ? (
                      <HiOutlineX className="text-xl" />
                    ) : (
                      <HiOutlineMenu className="text-xl" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          // 收缩状态 - 分裂成两个椭圆容器
          <motion.div
            key="collapsed-header"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex items-center justify-between px-4"
          >
            {/* 左侧圆形容器 - Logo */}
            <motion.div
              initial={{ scale: 0.8, x: -20 }}
              animate={{ scale: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="relative flex items-center justify-center w-10 h-10 rounded-full bg-background/90 backdrop-blur-xl border border-divider/50 shadow-lg cursor-pointer"
              onMouseEnter={() => setLogoCollapsedHovered(true)}
              onMouseLeave={() => setLogoCollapsedHovered(false)}
            >
              <Link to="/" className="flex items-center justify-center">
                <SiteLogo size="sm" />
              </Link>

              {/* 悬停展开的文字 */}
              <AnimatePresence>
                {logoCollapsedHovered && (
                  <motion.span
                    initial={{ width: 0, opacity: 0, x: -10 }}
                    animate={{ width: 'auto', opacity: 1, x: 0 }}
                    exit={{ width: 0, opacity: 0, x: -10 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="absolute left-full ml-2 overflow-hidden whitespace-nowrap text-base font-medium !text-default-900"
                  >
                    {logoText}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>

            {/* 右侧椭圆形容器 - 导航 + 工具栏 */}
            <motion.div
              initial={{ scale: 0.8, x: 20 }}
              animate={{ scale: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-background/90 backdrop-blur-xl border border-divider/50 shadow-lg"
            >
              {/* 导航图标 */}
              <div className="hidden md:flex items-center gap-0.5 mr-1">
                {navItems.map((item, index) => (
                  <CollapsedNavItem
                    key={item.href}
                    item={item}
                    isActive={activeIndex === index}
                    onClick={() => handleNavClick(index)}
                  />
                ))}
              </div>

              {/* 分隔线 */}
              <div className="hidden md:block w-px h-5 bg-divider/50 mx-1" />

              {/* 工具栏 */}
              <div className="flex items-center gap-0.5">
                {showSearch && (
                  <Button
                    variant="light"
                    isIconOnly
                    size="sm"
                    className="min-w-8 w-8 h-8 rounded-full"
                    onPress={() => setIsSearchOpen(true)}
                  >
                    <HiOutlineSearch className="text-base" />
                  </Button>
                )}

                <LocaleSwitcher />
                <AnimatedThemeToggle className="w-8 h-8 !min-w-8 rounded-full" />

                {/* 登录按钮/用户菜单 - 收缩状态 (非移动端显示，移动端统一放在菜单中) */}
                {!isMobile && (
                  isScrolled && isLoggedIn ? (
                    <Dropdown placement="bottom-end">
                      <DropdownTrigger>
                        <Button variant="light" isIconOnly size="sm" className="min-w-8 w-8 h-8 rounded-full">
                          <Avatar
                            name={userInfo?.name || '用户'}
                            size="sm"
                            className="w-7 h-7"
                          />
                        </Button>
                      </DropdownTrigger>
                      <UserMenuContent />
                    </Dropdown>
                  ) : (
                    <Button
                      variant="light"
                      size="sm"
                      as={Link}
                      to="/login"
                      className="min-w-14 h-8 rounded-full text-xs !text-default-600 hover:!text-default-900"
                    >
                      {t('user.login', '登录')}
                    </Button>
                  )
                )}

                {/* 移动端菜单按钮 */}
                <Button
                  variant="light"
                  isIconOnly
                  size="sm"
                  className="md:hidden min-w-8 w-8 h-8 rounded-full"
                  onPress={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? (
                    <HiOutlineX className="text-base" />
                  ) : (
                    <HiOutlineMenu className="text-base" />
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 移动端菜单 */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'absolute left-0 right-0 top-full z-50',
              'md:hidden border-t border-divider bg-background/95 backdrop-blur-xl',
              isScrolled ? 'mt-2 rounded-2xl shadow-lg mx-4' : ''
            )}
          >
            <nav className={cn('container mx-auto', isScrolled ? 'p-4' : 'px-4 py-4')}>
              <div className="flex flex-col gap-1">
                {navItems.map((item, index) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => handleNavClick(index)}
                      className={cn(
                        'px-4 py-3 rounded-lg text-base font-medium transition-colors flex items-center gap-2',
                        activeIndex === index
                          ? 'bg-default-100 !text-default-900 font-bold'
                          : '!text-default-600 hover:bg-default-100'
                      )}
                    >
                      {Icon && <Icon className="text-base text-inherit" />}
                      {item.label}
                    </Link>
                  )
                })}
              </div>

              <div className="mt-4 pt-4 border-t border-divider">
                {isLoggedIn ? (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-default-50 rounded-xl">
                      <Avatar
                        name={userInfo?.name || '用户'}
                        size="sm"
                      />
                      <div className="flex flex-col">
                        <span className="text-base font-bold text-default-900">{userInfo?.name || '用户'}</span>
                        <span className="text-sm text-default-500">{userInfo?.email || '暂无邮箱'}</span>
                      </div>
                    </div>
                    <Button
                      variant="light"
                      fullWidth
                      className="justify-start gap-3 text-default-600"
                      onPress={() => {
                        navigate('/admin/dashboard')
                        setMobileMenuOpen(false)
                      }}
                      startContent={<HiOutlineViewGrid className="text-lg" />}
                    >
                      {t('menu.admin')}
                    </Button>
                    <Button
                      variant="light"
                      fullWidth
                      className="justify-start gap-3 text-default-600"
                      onPress={() => {
                        navigate('/admin/profile')
                        setMobileMenuOpen(false)
                      }}
                      startContent={<HiOutlineUser className="text-lg" />}
                    >
                      {t('menu.profile')}
                    </Button>
                    <Button
                      variant="light"
                      fullWidth
                      className="justify-start gap-3 text-danger"
                      onPress={() => {
                        handleLogout()
                        setMobileMenuOpen(false)
                      }}
                      startContent={<HiOutlineLogout className="text-lg" />}
                    >
                      {t('user.logout')}
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="flat"
                    fullWidth
                    as={Link}
                    to="/login"
                    onPress={() => setMobileMenuOpen(false)}
                    className="!text-default-600 hover:!text-default-900"
                  >
                    {t('user.login', '登录')}
                  </Button>
                )}
                
                <div className="mt-2 flex items-center justify-between px-4 py-2 bg-default-50 rounded-xl">
                  <span className="text-sm text-default-500">{t('menu.language', '语言')}</span>
                  <LocaleSwitcher />
                </div>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 搜索弹窗 */}
      <SearchDialog 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </header>
  )
}
