/**
 * 用户下拉菜单组件
 * 参考B站风格：Hover展开，头像放大展示，第一层名字，第二层点赞关注评论，第三层操作选项
 */

import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Avatar } from '@heroui/react'
import { 
  HiOutlineUser, 
  HiOutlineCog, 
  HiOutlineLogout,
  HiOutlineHeart,
  HiOutlineBookmark,
  HiUsers,
  HiUser
} from 'react-icons/hi'
import { cn } from '@/utils'
import { useUserStore } from '@/stores/user'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/hooks'

// 组件属性
interface UserDropdownProps {
  /** 用户名 */
  name?: string
  /** 头像地址 */
  avatar?: string
  /** 触发器尺寸 */
  triggerSize?: 'sm' | 'md' | 'lg'
  /** 自定义类名 */
  className?: string
}

// 格式化数字
function formatNumber(num: number): string {
  if (num >= 10000) {
    return `${(num / 10000).toFixed(1)}万`
  }
  return num.toString()
}

export default function UserDropdown({
  name = '用户',
  avatar,
  triggerSize = 'sm',
  className
}: UserDropdownProps) {
  const { t } = useTranslation('navigation')
  const navigate = useNavigate()
  const { logout, userInfo, userStats } = useUserStore()
  const { actualTheme } = useTheme()
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const triggerRef = useRef<HTMLDivElement>(null)
  
  const isDark = actualTheme === 'dark'

  // 处理鼠标进入
  const handleMouseEnter = useCallback(() => {
    setIsOpen(true)
  }, [])

  // 处理鼠标离开
  const handleMouseLeave = useCallback(() => {
    setIsOpen(false)
  }, [])

  // 处理关闭下拉框
  const handleClose = useCallback(() => {
    setIsOpen(false)
  }, [])

  // 处理登出
  const handleLogout = useCallback(() => {
    setIsOpen(false)
    logout()
    navigate('/')
  }, [setIsOpen, logout, navigate])

  // 尺寸映射
  const sizeMap = {
    sm: { w: 8, h: 8, avatar: 32, font: 'text-sm' },
    md: { w: 10, h: 10, avatar: 40, font: 'text-base' },
    lg: { w: 12, h: 12, avatar: 48, font: 'text-lg' }
  }

  const currentSize = sizeMap[triggerSize]

  return (
    <div 
      className={cn('relative inline-block', className)}
      ref={triggerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* 触发器按钮 */}
      <div 
        className={cn(
          'flex items-center justify-center rounded-full cursor-pointer transition-all duration-200',
          `w-${currentSize.w} h-${currentSize.h}`,
          isOpen ? 'bg-default-100' : 'hover:bg-default-100/50'
        )}
      >
        {userInfo?.avatar || avatar ? (
          <Avatar
            name={userInfo?.name || name}
            src={userInfo?.avatar || avatar}
            size={triggerSize}
            className="cursor-pointer"
          />
        ) : (
          <div className={cn(
            'flex items-center justify-center rounded-full',
            isDark ? 'bg-[var(--primary-color)]' : 'bg-default-200',
            triggerSize === 'sm' ? 'w-8 h-8' : triggerSize === 'md' ? 'w-10 h-10' : 'w-12 h-12'
          )}>
            <HiUser className={cn(
              isDark ? 'text-white' : 'text-default-900',
              triggerSize === 'sm' ? 'w-4 h-4' : triggerSize === 'md' ? 'w-5 h-5' : 'w-6 h-6'
            )} />
          </div>
        )}
      </div>

      {/* 下拉面板 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 top-full mt-2 w-64 p-2 overflow-hidden bg-default-50/95 backdrop-blur-xl shadow-xl rounded-[24px]"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {/* 第一层：头像 + 名字 */}
            <div className="flex flex-col items-center px-4 py-2">
              {userInfo?.avatar || avatar ? (
                <Avatar
                  name={userInfo?.name || name}
                  src={userInfo?.avatar || avatar}
                  className="w-16 h-16 text-xl mb-1"
                />
              ) : (
                <div className={cn(
                  'w-16 h-16 rounded-full flex items-center justify-center mb-1',
                  isDark ? 'bg-[var(--primary-color)]' : 'bg-default-200'
                )}>
                  <HiUser className={cn(
                    'w-8 h-8',
                    isDark ? 'text-white' : 'text-default-900'
                  )} />
                </div>
              )}
              <span className="text-base font-medium text-default-900">
                {userInfo?.name || name}
              </span>
            </div>

            {/* 第二层：数据统计 */}
            <div className="flex justify-around items-center px-4 py-2 border-b border-default-200/50">
              <div className="flex items-center gap-1.5">
                <HiOutlineHeart className="text-xl text-default-600" />
                <span className="text-sm text-default-700">{formatNumber(userStats?.likeCount || 0)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <HiOutlineBookmark className="text-xl text-default-600" />
                <span className="text-sm text-default-700">{formatNumber(userStats?.collectCount || 0)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <HiUsers className="text-xl text-default-600" />
                <span className="text-sm text-default-700">{formatNumber(userStats?.fanCount || 0)}</span>
              </div>
            </div>

            {/* 第三层：操作选项 */}
            <div className="py-1 px-1">
              <button
                onClick={() => { handleClose(); navigate('/profile') }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-default-700 hover:bg-default-100 transition-colors"
              >
                <HiOutlineUser className="text-lg" />
                {t('menu.profile', '个人中心')}
              </button>
              <button
                onClick={() => { handleClose(); navigate('/admin') }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-default-700 hover:bg-default-100 transition-colors"
              >
                <HiOutlineCog className="text-lg" />
                {t('menu.admin', '后台管理')}
              </button>
            </div>

            {/* 退出登录 - 红色半透明，分割线分开 */}
            <div className="border-t border-default-800/50 rounded-b-[20px]">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-danger hover:bg-danger/10 transition-colors"
              >
                <HiOutlineLogout className="text-lg" />
                {t('user.logout', '退出登录')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}