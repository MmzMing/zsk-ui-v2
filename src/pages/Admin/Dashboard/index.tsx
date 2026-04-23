/**
 * 后台管理仪表盘页面
 * 两层垂直布局：概览区（欢迎语+统计+公告）+ 任务管理区（Gantt）
 */

import { lazy, Suspense } from 'react'
import { Skeleton } from '@heroui/react'
import WelcomeCard from '@/components/ui/admin/dashboard/WelcomeCard'
import StatisticsCards from '@/components/ui/admin/dashboard/StatisticsCards'
import AnnouncementCard from '@/components/ui/admin/dashboard/AnnouncementCard'

const GanttCard = lazy(() => import('@/components/ui/admin/dashboard/GanttCard'))

function GanttFallback() {
  return (
    <div className="admin-card rounded-large p-5 space-y-4">
      <Skeleton className="w-32 h-6 rounded-md" />
      <Skeleton className="w-full h-[500px] rounded-md" />
    </div>
  )
}

export default function Dashboard() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full space-y-4">
          <WelcomeCard />
          <StatisticsCards />
        </div>
      </div>

      <Suspense fallback={<GanttFallback />}>
        <GanttCard />
      </Suspense>

      <div className="w-full lg:w-[50%]">
        <AnnouncementCard />
      </div>
    </div>
  )
}
