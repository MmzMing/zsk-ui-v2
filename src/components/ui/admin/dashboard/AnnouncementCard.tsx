import { useState, useEffect, useMemo } from 'react'
import { Bell } from 'lucide-react'
import { Card, CardBody } from '@heroui/react'
import { getConsoleNotices } from '@/api/admin/notice'
import type { SysNotice } from '@/types/notice.types'

const typeColorMap: Record<string, string> = {
  '1': 'bg-primary',
  '2': 'bg-warning',
}

function getRelativeTime(dateStr?: string): string {
  if (!dateStr) return ''
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
  const [notices, setNotices] = useState<SysNotice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchNotices() {
      try {
        const data = await getConsoleNotices()
        setNotices(data)
      } catch (error) {
        console.error('获取公告失败：', error)
      } finally {
        setLoading(false)
      }
    }
    fetchNotices()
  }, [])

  const items = useMemo(
    () =>
      notices.map((item) => ({
        ...item,
        title: item.noticeTitle,
        type: item.noticeType,
        relativeTime: getRelativeTime(item.createTime),
      })),
    [notices]
  )

  return (
    <Card className="admin-card max-h-[210px]">
      <CardBody className="p-0 h-full flex flex-col">
        <div className="px-5 py-4 flex items-center gap-2 border-b border-default-100 shrink-0">
          <Bell size={18} className="text-default-400" />
          <h3 className="text-lg font-semibold">系统公告</h3>
        </div>
        <div className="px-5 py-4 flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full text-default-400">
              <span>加载中...</span>
            </div>
          ) : notices.length === 0 ? (
            <div className="flex items-center justify-center h-full text-default-400">
              <span>暂无公告</span>
            </div>
          ) : (
            <div className="relative">
              {items.map((item, index) => {
                const isLast = index === items.length - 1
                return (
                  <div key={item.id} className="relative flex gap-3 pb-5 last:pb-0">
                    {!isLast && (
                      <div className="absolute left-[5px] top-3 bottom-0 w-px bg-default-200" />
                    )}
                    <div
                      className={`relative z-10 mt-1 w-[11px] h-[11px] rounded-full shrink-0 ${typeColorMap[item.type] || 'bg-default-400'}`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-small font-semibold text-default-900 truncate">
                        {item.title}
                      </p>
                      <p className="text-tiny text-default-500 line-clamp-2 mt-0.5">
                        {item.content}
                      </p>
                      <p className="text-tiny text-default-400 mt-1">{item.relativeTime}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  )
}