/**
 * 系统公告卡片
 * 垂直时间轴展示最近公告
 */

import { Bell } from 'lucide-react'
import { mockAnnouncements } from '@/api/admin/dashboard/mock'

const typeColorMap: Record<string, string> = {
  info: 'bg-primary',
  warning: 'bg-warning',
  success: 'bg-success',
  error: 'bg-danger',
}

function getRelativeTime(dateStr: string): string {
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
}

export default function AnnouncementCard() {
  return (
    <div className="h-full">
      <div className="px-5 py-4 flex items-center gap-2">
        <Bell size={18} className="text-default-400" />
        <h3 className="text-lg font-semibold">系统公告</h3>
      </div>
      <div className="px-5 py-4">
        <div className="relative">
          {mockAnnouncements.map((item, index) => {
            const isLast = index === mockAnnouncements.length - 1
            return (
              <div key={item.id} className="relative flex gap-3 pb-5 last:pb-0">
                {/* 时间轴竖线 */}
                {!isLast && (
                  <div className="absolute left-[5px] top-3 bottom-0 w-px bg-default-200" />
                )}
                {/* 圆点 */}
                <div
                  className={`relative z-10 mt-1 w-[11px] h-[11px] rounded-full shrink-0 ${typeColorMap[item.type]}`}
                />
                {/* 内容 */}
                <div className="flex-1 min-w-0">
                  <p className="text-small font-semibold text-default-900 truncate">
                    {item.title}
                  </p>
                  <p className="text-tiny text-default-500 line-clamp-2 mt-0.5">
                    {item.content}
                  </p>
                  <p className="text-tiny text-default-400 mt-1">
                    {getRelativeTime(item.createdAt)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
