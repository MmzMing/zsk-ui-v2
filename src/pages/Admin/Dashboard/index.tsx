/**
 * 后台管理仪表盘页面
 */

import { Card, CardBody, CardHeader } from '@heroui/react'
import {
  HiOutlineDocumentText,
  HiOutlineUserGroup,
  HiOutlineEye,
  HiOutlineChartBar
} from 'react-icons/hi'

import { useBreakpoint } from '@/hooks/useBreakpoint'
import { useTranslation } from 'react-i18next'

export default function Dashboard() {
  const { isMobile } = useBreakpoint()
  const { t, i18n } = useTranslation('dashboard')

  // 统计卡片数据
  const stats = [
    {
      title: t('stats.articles'),
      value: '128',
      icon: HiOutlineDocumentText,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950'
    },
    {
      title: t('stats.users'),
      value: '1,234',
      icon: HiOutlineUserGroup,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-950'
    },
    {
      title: t('stats.visits'),
      value: '5,678',
      icon: HiOutlineEye,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-950'
    },
    {
      title: t('stats.comments'),
      value: '892',
      icon: HiOutlineChartBar,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-950'
    }
  ]

  // 快捷操作
  const quickActions = [
    { title: t('quickActions.writeArticle'), description: t('quickActions.writeArticleDesc'), path: '/admin/content/articles/create' },
    { title: t('quickActions.manageUsers'), description: t('quickActions.manageUsersDesc'), path: '/admin/user/users' },
    { title: t('quickActions.systemSettings'), description: t('quickActions.systemSettingsDesc'), path: '/admin/system/general' },
    { title: t('quickActions.dataAnalysis'), description: t('quickActions.dataAnalysisDesc'), path: '/admin/analysis' }
  ]

  return (
    <div className={isMobile ? 'p-3' : 'p-4 md:p-6'}>
      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-default-900">{t('title')}</h1>
        <p className="text-default-500 mt-1">{t('welcome', { date: new Date().toLocaleDateString(i18n.language, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) })}</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="admin-card">
            <CardBody className="flex flex-row items-center gap-3 md:gap-4 p-3 md:p-4">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`text-2xl ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-default-500">{stat.title}</p>
                <p className="text-2xl font-semibold text-default-900">{stat.value}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* 快捷操作 */}
      <Card className="admin-card mb-6">
        <CardHeader className="px-4 md:px-6 py-3 md:py-4 border-b border-divider">
          <h2 className="text-lg font-semibold">{t('quickActions.title')}</h2>
        </CardHeader>
        <CardBody className="p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <button
                key={action.title}
                className="p-4 text-left rounded-lg admin-border hover:border-primary hover:bg-primary/5 transition-colors group"
              >
                <h3 className="font-medium text-default-900 group-hover:text-primary">
                  {action.title}
                </h3>
                <p className="text-sm text-default-500 mt-1">{action.description}</p>
              </button>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* 最近动态 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 最新文章 */}
        <Card className="admin-card">
          <CardHeader className="px-4 md:px-6 py-3 md:py-4 border-b border-divider">
            <h2 className="text-lg font-semibold">{t('latestArticles.title')}</h2>
          </CardHeader>
          <CardBody className="p-0">
            <div className="divide-y divide-divider">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="px-6 py-3 hover:bg-default-50 transition-colors cursor-pointer">
                  <h3 className="text-sm font-medium text-default-900 truncate">
                    示例文章标题 {i} - 如何使用 React 构建现代化应用
                  </h3>
                  <p className="text-xs text-default-400 mt-1">
                    {new Date(Date.now() - i * 3600000).toLocaleString(i18n.language)}
                  </p>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* 最新评论 */}
        <Card className="admin-card">
          <CardHeader className="px-4 md:px-6 py-3 md:py-4 border-b border-divider">
            <h2 className="text-lg font-semibold">{t('latestComments.title')}</h2>
          </CardHeader>
          <CardBody className="p-0">
            <div className="divide-y divide-divider">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="px-6 py-3 hover:bg-default-50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-medium text-primary">用{i}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-default-700 truncate">
                        这是一段示例评论内容，非常精彩的文章！
                      </p>
                      <p className="text-xs text-default-400">
                        用户{i} · {new Date(Date.now() - i * 7200000).toLocaleString(i18n.language)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
