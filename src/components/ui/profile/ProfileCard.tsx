/**
 * ProfileCard 用户卡片组件
 * 左侧用户身份卡片，支持3D悬浮效果
 * 数据从 UserInfo 中获取
 */

// ===== 1. 依赖导入区域 =====
import { useTranslation } from 'react-i18next'
import { Avatar, Button } from '@heroui/react'
import { CardContainer, CardBody, CardItem } from '@/components/ui/aceternity/DraggableCard'
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi'
import { PenLine, Heart, BookMarked, Users, Bell, Shield } from 'lucide-react'
import type { UserInfo } from '@/types/user.types'
import type { SysUser } from '@/api/auth'
import { useUserStore } from '@/stores/user'

/**
 * Tab 类型
 */
export type ProfileTab = 'edit' | 'works' | 'messages' | 'security'

/**
 * ProfileCard 属性
 */
interface ProfileCardProps {
  /** 用户信息 */
  userInfo?: UserInfo
  /** 系统用户信息 */
  sysUser?: SysUser | null
  /** 是否加载中 */
  loading?: boolean
  /** 当前激活的 Tab */
  activeTab?: ProfileTab
  /** Tab 切换回调 */
  onTabChange?: (tab: ProfileTab) => void
  /** 自定义类名 */
  className?: string
}

/**
 * ProfileCard 用户卡片组件
 * 左侧用户身份卡片，支持3D悬浮效果
 */
export function ProfileCard({
  userInfo,
  sysUser,
  loading,
  activeTab = 'works',
  onTabChange,
  className,
}: ProfileCardProps) {
  const { t } = useTranslation('profile')
  const { userStats } = useUserStore()

  // ===== 9. 页面初始化与事件绑定 =====
  if (loading) {
    return (
      <CardContainer className="inter-var">
        <CardBody className="p-6 space-y-6 bg-[var(--color-default-50,#F9FAFB)] rounded-[1rem] shadow-xl h-auto w-72">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-gray-300 animate-pulse" />
            <div className="h-6 w-32 rounded-full bg-gray-300 animate-pulse" />
            <div className="h-4 w-24 rounded-full bg-gray-300 animate-pulse" />
            <div className="h-4 w-full rounded-full bg-gray-200 animate-pulse" />
          </div>
          <div className="flex justify-center gap-6 pt-2 border-t border-gray-200">
            <div className="flex flex-col items-center">
              <div className="h-6 w-8 rounded-full bg-gray-300 animate-pulse" />
              <div className="h-3 w-6 rounded-full bg-gray-300 animate-pulse mt-1" />
            </div>
            <div className="flex flex-col items-center">
              <div className="h-6 w-8 rounded-full bg-gray-300 animate-pulse" />
              <div className="h-3 w-6 rounded-full bg-gray-300 animate-pulse mt-1" />
            </div>
            <div className="flex flex-col items-center">
              <div className="h-6 w-8 rounded-full bg-gray-300 animate-pulse" />
              <div className="h-3 w-6 rounded-full bg-gray-300 animate-pulse mt-1" />
            </div>
          </div>
          <div className="flex justify-center gap-2 pt-2">
            <div className="h-10 w-10 rounded-lg bg-gray-200 animate-pulse" />
            <div className="h-10 w-10 rounded-lg bg-gray-200 animate-pulse" />
            <div className="h-10 w-10 rounded-lg bg-gray-200 animate-pulse" />
            <div className="h-10 w-10 rounded-lg bg-gray-200 animate-pulse" />
          </div>
        </CardBody>
      </CardContainer>
    )
  }

  return (
    <CardContainer className={`inter-var ${className || ''}`}>
      <CardBody className="p-6 space-y-5 bg-transparent border-0 rounded-none shadow-none h-auto w-72">
        <CardItem translateZ="30" className="flex flex-col items-center text-center space-y-3">
          <Avatar
            src={userInfo?.avatar}
            name={userInfo?.name?.charAt(0)}
            className="w-16 h-16 text-2xl"
            classNames={{
              base: 'bg-[var(--primary-color)]',
              name: 'font-bold text-white'
            }}
          />
          <div>
            <h3 className="text-lg font-bold text-[var(--primary-color)]">{userInfo?.name}</h3>
            <p className="text-sm text-gray-600">{userInfo?.roles?.includes('admin') ? t('card.roleAdmin') : userInfo?.roles?.includes('user') ? t('card.roleUser') : t('card.roleGuest')}</p>
          </div>
        </CardItem>

        <CardItem translateZ="60" className="space-y-2">
          <p className="text-sm text-gray-600 text-center leading-relaxed">
            {sysUser?.bio?.trim() || t('card.noBio')}
          </p>
        </CardItem>

        <div className="space-y-2 pt-3 border-t border-gray-200">
          <CardItem translateZ="40" className="flex items-center gap-3 text-sm text-gray-600">
            <FiMail className="text-lg text-[var(--primary-color)]" />
            <span>{userInfo?.email}</span>
          </CardItem>
          <CardItem translateZ="50" className="flex items-center gap-3 text-sm text-gray-600">
            <FiPhone className="text-lg text-[var(--primary-color)]" />
            <span>{t('card.unbound')}</span>
          </CardItem>
          <CardItem translateZ="60" className="flex items-center gap-3 text-sm text-gray-600">
            <FiMapPin className="text-lg text-[var(--primary-color)]" />
            <span>{t('card.notSet')}</span>
          </CardItem>
        </div>

        <CardItem translateZ="50" className="flex justify-center gap-6 pt-3 border-t border-gray-200">
          <div className="flex flex-col items-center">
            <Button
              isIconOnly
              variant="light"
              radius="full"
              className="w-10 h-10 hover:bg-gray-200"
            >
              <Heart className="w-5 h-5 text-[var(--primary-color)]" />
            </Button>
            <span className="text-sm font-medium text-[var(--color-default-900,gray-900)] mt-1">{userStats?.likeCount || 0}</span>
            <span className="text-xs text-gray-500">{t('card.likes')}</span>
          </div>
          <div className="flex flex-col items-center">
            <Button
              isIconOnly
              variant="light"
              radius="full"
              className="w-10 h-10 hover:bg-gray-200"
            >
              <BookMarked className="w-5 h-5 text-[var(--primary-color)]" />
            </Button>
            <span className="text-sm font-medium text-[var(--color-default-900,gray-900)] mt-1">{userStats?.collectCount || 0}</span>
            <span className="text-xs text-gray-500">{t('card.collections')}</span>
          </div>
          <div className="flex flex-col items-center">
            <Button
              isIconOnly
              variant="light"
              radius="full"
              className="w-10 h-10 hover:bg-gray-200"
            >
              <Users className="w-5 h-5 text-[var(--primary-color)]" />
            </Button>
            <span className="text-sm font-medium text-[var(--color-default-900,gray-900)] mt-1">{userStats?.fanCount || 0}</span>
            <span className="text-xs text-gray-500">{t('card.followers')}</span>
          </div>
        </CardItem>

        <CardItem translateZ="80" className="flex justify-center gap-2 pt-3 border-t border-gray-200">
          {[
            { key: 'edit', icon: PenLine, label: t('card.editInfo') },
            { key: 'works', icon: Heart, label: t('card.manageWorks') },
            { key: 'messages', icon: Bell, label: t('card.messages') },
            { key: 'security', icon: Shield, label: t('card.security') },
          ].map(({ key, icon: Icon, label }) => (
            <Button
              key={key}
              isIconOnly
              variant={activeTab === key ? 'solid' : 'light'}
              color={activeTab === key ? 'primary' : undefined}
              radius="lg"
              className={`w-12 h-12 ${activeTab === key ? 'bg-[var(--primary-color)]/50 text-[var(--primary-color)]' : 'text-gray-500 hover:bg-gray-200 hover:text-gray-700'}`}
              onClick={() => onTabChange?.(key as ProfileTab)}
              title={label}
            >
              <Icon className="w-5 h-5" />
            </Button>
          ))}
        </CardItem>
      </CardBody>
    </CardContainer>
  )
}