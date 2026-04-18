/**
 * ProfileCard 用户卡片组件
 * 左侧用户身份卡片，支持3D悬浮效果
 * 数据从 UserInfo 中获取
 */

import { useTranslation } from 'react-i18next'
import { Avatar, Button } from '@heroui/react'
import { CardContainer, CardBody, CardItem } from '@/components/ui/aceternity/DraggableCard'
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi'
import { PenLine, Heart, UserPlus, Settings, Users, Mail } from 'lucide-react'
import type { UserInfo } from '@/types/user.types'

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
 * ProfileCard 用户卡片
 */
export function ProfileCard({
  userInfo,
  loading,
  activeTab = 'works',
  onTabChange,
  className,
}: ProfileCardProps) {
  const { t } = useTranslation('profile')
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
      <CardBody className="p-6 space-y-5 bg-[var(--color-default-50,#F9FAFB)] rounded-[1rem] shadow-xl h-auto w-72">
        <CardItem translateZ="50" className="flex flex-col items-center text-center space-y-3">
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
            <p className="text-sm text-gray-600">{userInfo?.role === 'admin' ? t('card.roleAdmin') : userInfo?.role === 'user' ? t('card.roleUser') : t('card.roleGuest')}</p>
          </div>
        </CardItem>

        <CardItem translateZ="40" className="space-y-2">
          <p className="text-sm text-gray-600 text-center leading-relaxed">
            {userInfo?.bio?.trim() || t('card.noBio')}
          </p>
        </CardItem>

        <CardItem translateZ="30" className="space-y-2 pt-3 border-t border-gray-200">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <FiMail className="text-lg text-[var(--primary-color)]" />
            <span>{userInfo?.email}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <FiPhone className="text-lg text-[var(--primary-color)]" />
            <span>{t('card.unbound')}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <FiMapPin className="text-lg text-[var(--primary-color)]" />
            <span>{t('card.notSet')}</span>
          </div>
        </CardItem>

        <CardItem translateZ="20" className="flex justify-center gap-6 pt-3 border-t border-gray-200">
          <div className="flex flex-col items-center">
            <Button
              isIconOnly
              variant="light"
              radius="full"
              className="w-10 h-10 hover:bg-gray-200"
            >
              <UserPlus className="w-5 h-5 text-[var(--primary-color)]" />
            </Button>
            <span className="text-sm font-medium text-[var(--color-default-900,gray-900)] mt-1">0</span>
            <span className="text-xs text-gray-500">{t('card.following')}</span>
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
            <span className="text-sm font-medium text-[var(--color-default-900,gray-900)] mt-1">0</span>
            <span className="text-xs text-gray-500">{t('card.followers')}</span>
          </div>
          <div className="flex flex-col items-center">
            <Button
              isIconOnly
              variant="light"
              radius="full"
              className="w-10 h-10 hover:bg-gray-200"
            >
              <Heart className="w-5 h-5 text-[var(--primary-color)]" />
            </Button>
            <span className="text-sm font-medium text-[var(--color-default-900,gray-900)] mt-1">0</span>
            <span className="text-xs text-gray-500">{t('card.likes')}</span>
          </div>
        </CardItem>

        <CardItem translateZ="100" className="flex justify-center gap-2 pt-3 border-t border-gray-200">
          {[
            { key: 'edit', icon: PenLine, label: t('card.editInfo') },
            { key: 'works', icon: Heart, label: t('card.manageWorks') },
            { key: 'messages', icon: Mail, label: t('card.messages') },
            { key: 'security', icon: Settings, label: t('card.security') },
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