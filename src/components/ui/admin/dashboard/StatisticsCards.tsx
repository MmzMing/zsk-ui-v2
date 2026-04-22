/**
 * 数据统计卡片组
 * 展示用户、文档、视频、评论四项统计
 * API 报错或无数据时，显示默认空值卡片
 */

import { useCallback, useEffect, useState } from 'react'
import { Card, CardBody, Skeleton } from '@heroui/react'
import { Users, FileText, Video, MessageSquare, TrendingUp, TrendingDown } from 'lucide-react'
import type { DashboardItem } from '@/types/dashboard.types'
import { getDashboardOverview } from '@/api/admin/dashboard'
import { toast } from '@/utils/toast'

const iconMap: Record<DashboardItem['key'], typeof Users> = {
  users: Users,
  docs: FileText,
  videos: Video,
  comments: MessageSquare,
}

const colorMap: Record<DashboardItem['key'], { text: string; bg: string }> = {
  users: { text: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950' },
  docs: { text: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950' },
  videos: { text: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950' },
  comments: { text: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950' },
}

const defaultItems: DashboardItem[] = [
  { key: 'users', label: '用户总数', value: '--', delta: '+0%', description: '暂无数据' },
  { key: 'docs', label: '文档总数', value: '--', delta: '+0%', description: '暂无数据' },
  { key: 'videos', label: '视频总数', value: '--', delta: '+0%', description: '暂无数据' },
  { key: 'comments', label: '评论数', value: '--', delta: '+0%', description: '暂无数据' },
]

export default function StatisticsCards() {
  const [items, setItems] = useState<DashboardItem[]>(defaultItems)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getDashboardOverview()
      if (data && data.length > 0) {
        setItems(data)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '获取仪表盘数据失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {defaultItems.map((item) => {
          const Icon = iconMap[item.key]
          const color = colorMap[item.key]
          return (
            <Card key={item.key} className="admin-card">
              <CardBody className="p-4">
                <div className="flex items-center gap-3">
                  <Icon className={color.text} size={28} />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="w-16 h-4 rounded-md" />
                    <Skeleton className="w-20 h-8 rounded-md" />
                    <Skeleton className="w-24 h-3 rounded-md" />
                  </div>
                </div>
              </CardBody>
            </Card>
          )
        })}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item) => {
        const Icon = iconMap[item.key]
        const color = colorMap[item.key]
        const isPositive = item.delta.startsWith('+')

        return (
          <Card
            key={item.key}
            className="admin-card hover:scale-[1.02] transition-transform cursor-default"
          >
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <Icon className={color.text} size={28} />
                <div className="flex-1 min-w-0">
                  <p className="text-small text-default-500">{item.label}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-default-900">{item.value}</span>
                    <span
                      className={`flex items-center gap-0.5 text-small ${isPositive ? 'text-success' : 'text-danger'}`}
                    >
                      {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      {item.delta}
                    </span>
                  </div>
                  <p className="text-small text-default-500 truncate">{item.description}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        )
      })}
    </div>
  )
}
