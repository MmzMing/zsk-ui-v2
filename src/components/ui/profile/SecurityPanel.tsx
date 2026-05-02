/**
 * SecurityPanel 账号安全组件
 * 包含通知设置、账号安全设置等功能
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Switch, Badge } from '@heroui/react'
import { Mail, Shield, AlertCircle, ChevronRight } from 'lucide-react'

/**
 * SecurityPanel 属性定义
 */
interface SecurityPanelProps {
  /** 用户邮箱 */
  email?: string
}

/**
 * SecurityPanel 账号安全组件
 * 包含通知设置、账号安全设置等功能
 */
export function SecurityPanel({ email }: SecurityPanelProps) {
  const { t } = useTranslation('profile')
  const [notifications, setNotifications] = useState({
    email: true,
    comment: true,
    like: true,
    follow: true,
    system: true,
  })

  /**
   * 切换通知设置
   * @param key - 通知类型键名
   */
  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // ===== 7. 数据处理函数区域 =====

  /**
   * 安全设置项配置列表
   */
  const securityItems = [
    {
      icon: Mail,
      title: t('security.emailBind'),
      description: email || t('security.emailBindDesc'),
      status: email ? t('security.statusBound') : t('security.statusUnbound'),
      statusColor: email ? 'success' : 'warning',
    },
    {
      icon: Shield,
      title: t('security.twoFactor'),
      description: t('security.twoFactorDesc'),
      status: t('security.twoFactorStatus'),
      statusColor: 'warning',
    },
  ]

  // ===== 8. UI渲染逻辑区域 =====
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="space-y-4">
        {securityItems.map((item, index) => {
          const Icon = item.icon
          return (
            <div
              key={item.title}
              className="flex items-center gap-4 py-4 animate-in slide-in-from-left-2"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-default-900">{item.title}</h3>
                <p className="text-sm text-default-500">{item.description}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="flat" color={item.statusColor as 'success' | 'warning'}>
                  {item.status}
                </Badge>
                <ChevronRight className="w-5 h-5 text-default-400" />
              </div>
            </div>
          )
        })}

        <div className="border-b border-default-800" />

        <div className="py-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-warning">{t('security.securityAlert')}</p>
              <p className="text-xs text-default-600 mt-1">
                {t('security.securityAlertDesc')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-default-800" />

      <div>
        <h3 className="text-lg font-semibold text-default-900 mb-4">
          {t('security.notifications')}
        </h3>

        <div className="divide-y divide-default-800">
          {[
            { key: 'email' as const, label: t('security.emailNotify'), desc: t('security.emailNotifyDesc') },
            { key: 'comment' as const, label: t('security.commentNotify'), desc: t('security.commentNotifyDesc') },
            { key: 'like' as const, label: t('security.likeNotify'), desc: t('security.likeNotifyDesc') },
            { key: 'follow' as const, label: t('security.followNotify'), desc: t('security.followNotifyDesc') },
            { key: 'system' as const, label: t('security.systemNotify'), desc: t('security.systemNotifyDesc') },
          ].map((item, index) => (
            <div
              key={item.key}
              className="flex items-center justify-between py-4 animate-in slide-in-from-left-2"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div>
                <h4 className="text-sm font-medium text-default-900">{item.label}</h4>
                <p className="text-xs text-default-500">{item.desc}</p>
              </div>
              <Switch
                checked={notifications[item.key]}
                onChange={() => toggleNotification(item.key)}
                className="transition-all duration-300"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}