/**
 * 欢迎语卡片
 * 根据当前时段动态显示欢迎语和图标
 */

import { useMemo } from 'react'
import { Sunrise, Sun, CloudSun, Sunset, Moon, MoonStar } from 'lucide-react'
import { useUserStore } from '@/stores/user'

function getGreeting(hour: number): { text: string; Icon: typeof Sun } {
  if (hour >= 6 && hour < 9) return { text: '早上好', Icon: Sunrise }
  if (hour >= 9 && hour < 12) return { text: '上午好', Icon: Sun }
  if (hour >= 12 && hour < 14) return { text: '中午好', Icon: CloudSun }
  if (hour >= 14 && hour < 18) return { text: '下午好', Icon: Sunset }
  if (hour >= 18 && hour < 23) return { text: '晚上好', Icon: Moon }
  return { text: '夜深了，注意休息', Icon: MoonStar }
}

function formatDate(date: Date): string {
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  const y = date.getFullYear()
  const m = date.getMonth() + 1
  const d = date.getDate()
  return `今天是 ${y}年${m}月${d}日，${weekdays[date.getDay()]}`
}

export default function WelcomeCard() {
  const userName = useUserStore((s) => s.userInfo?.name)

  const { greeting, dateStr } = useMemo(() => {
    const now = new Date()
    return {
      greeting: getGreeting(now.getHours()),
      dateStr: formatDate(now),
    }
  }, [])

  const { text, Icon } = greeting

  return (
    <div className="flex flex-row items-center gap-4 p-5">
      <Icon size={32} className="text-primary shrink-0" />
      <div>
        <h2 className="text-2xl font-bold text-default-900">
          {text}，{userName || '管理员'}
        </h2>
        <p className="text-small text-default-500 mt-1">{dateStr}</p>
      </div>
    </div>
  )
}
