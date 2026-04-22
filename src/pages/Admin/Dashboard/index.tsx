/**
 * 后台管理仪表盘页面
 * 两层垂直布局：概览区（欢迎语+统计+公告）+ 任务管理区（Gantt）
 */

import WelcomeCard from '@/components/ui/admin/dashboard/WelcomeCard'
import StatisticsCards from '@/components/ui/admin/dashboard/StatisticsCards'
import AnnouncementCard from '@/components/ui/admin/dashboard/AnnouncementCard'
import GanttCard from '@/components/ui/admin/dashboard/GanttCard'

export default function Dashboard() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* 第一层：概览区 */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* 左侧 70% */}
        <div className="w-full lg:w-[70%] space-y-4">
          <WelcomeCard />
          <StatisticsCards />
        </div>
        {/* 右侧 30% */}
        <div className="w-full lg:w-[30%]">
          <AnnouncementCard />
        </div>
      </div>

      {/* 第二层：任务管理区 */}
      <GanttCard />
    </div>
  )
}
