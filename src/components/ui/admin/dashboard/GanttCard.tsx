import { Card, CardBody, CardHeader } from '@heroui/react'
import Gantt, { ReactGanttRef, Task, Link, GanttConfig } from '@dhtmlx/trial-react-gantt'
import '@dhtmlx/trial-react-gantt/dist/react-gantt.css'
import { useRef, useMemo, useEffect } from 'react'
import { mockGanttTasks, mockGanttLinks } from '@/api/admin/dashboard/mock'
import { useTheme } from '@/hooks/useTheme'
import { useAppStore } from '@/stores/app'

export default function GanttCard() {
  const ganttRef = useRef<ReactGanttRef>(null)
  const { actualTheme } = useTheme()
  const { language } = useAppStore()
  
  const theme = actualTheme === 'dark' ? 'dark' : 'terrace'
  const locale = language === 'zh-CN' ? 'cn' : 'en'

  const tasks: Task[] = useMemo(() => {
    return mockGanttTasks.map(item => ({
      ...item,
      start_date: new Date(item.start_date)
    }))
  }, [])

  const config: GanttConfig = {
    grid_width: 200,
    scale_height: 60,
    scales: [
      { unit: 'year', step: 1, date: '%Y' },
      { unit: 'month', step: 1, date: '%M' },
      { unit: 'day', step: 1, date: '%d' }
    ],
    show_quick_info: true,
    quick_info_detached: true,
    quickinfo_buttons: ['icon_edit', 'icon_delete']
  }

  useEffect(() => {
    const gantt = ganttRef.current?.instance
    if (!gantt) return
    gantt.templates.quick_info_title = (_start: Date, _end: Date, task: Task) => {
      return task.text
    }
    gantt.templates.quick_info_date = (start: Date, end: Date) => {
      return `${gantt.date.date_to_str('%Y年%m月%d日')(start)} - ${gantt.date.date_to_str('%Y年%m月%d日')(end)}`
    }
    gantt.templates.quick_info_content = (_start: Date, _end: Date, task: Task) => {
      return `<div style="padding:4px 0;">${task.text}</div>`
    }
  }, [tasks])

  return (
    <Card className="admin-card h-full">
      <CardHeader className="px-5 py-4 border-b border-divider">
        <h3 className="text-lg font-semibold">任务管理</h3>
      </CardHeader>
      <CardBody className="p-0 overflow-hidden" style={{ height: 460 }}>
        <Gantt
          ref={ganttRef}
          tasks={tasks}
          links={mockGanttLinks as Link[]}
          config={config}
          theme={theme}
          locale={locale}
          plugins={{ quick_info: true }}
          data={{
            save: (_entity: string, _action: string, _data: Record<string, unknown>, _id: string | number) => {
              console.log('save')
            }
          }}
        />
      </CardBody>
    </Card>
  )
}