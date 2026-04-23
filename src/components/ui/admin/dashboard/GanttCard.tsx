import { Card, CardBody, CardHeader, Spinner } from '@heroui/react'
import Gantt, { ReactGanttRef, Task, Link, GanttConfig } from '@dhtmlx/trial-react-gantt'
import '@dhtmlx/trial-react-gantt/dist/react-gantt.css'
import { useRef, useState, useEffect, useCallback } from 'react'
import { getTaskList } from '@/api/admin/task'
import { createTask, updateTask, deleteTask } from '@/api/admin/task'
import { createTaskLink, deleteTaskLink } from '@/api/admin/task/link'
import { useTheme } from '@/hooks/useTheme'
import { useAppStore } from '@/stores/app'
import type { SysTaskRaw, SysTaskLink, TaskType, LinkType } from '@/types/task.types'
import { addToast } from '@heroui/react'

function rawToTask(raw: SysTaskRaw): Task {
  return {
    id: raw.id,
    text: raw.text,
    start_date: new Date(raw.startDate),
    duration: raw.duration,
    progress: raw.progress / 100,
    type: raw.type,
    parent: raw.parent ?? 0,
    open: raw.open ?? true,
    details: raw.details,
  }
}

function linkToGantt(link: SysTaskLink): Link {
  return {
    id: link.id,
    source: link.source,
    target: link.target,
    type: link.type,
  }
}

export default function GanttCard() {
  const ganttRef = useRef<ReactGanttRef>(null)
  const { actualTheme } = useTheme()
  const { language } = useAppStore()

  const [tasks, setTasks] = useState<Task[]>([])
  const [links, setLinks] = useState<Link[]>([])
  const [loading, setLoading] = useState(true)

  const theme = actualTheme === 'dark' ? 'dark' : 'terrace'
  const locale = language === 'zh-CN' ? 'cn' : 'en'

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await getTaskList()
      setTasks(res.tasks.map(rawToTask))
      setLinks(res.links.map(linkToGantt))
    } catch (err) {
      console.error('获取任务列表失败', err)
      addToast({ title: '获取任务列表失败', color: 'danger' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

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

  const config: GanttConfig = {
    grid_width: 200,
    scale_height: 60,
    scales: [
      { unit: 'year', step: 1, date: '%Y' },
      { unit: 'month', step: 1, date: '%M' },
      { unit: 'day', step: 1, date: '%d' },
    ],
    show_quick_info: true,
    quick_info_detached: true,
    quickinfo_buttons: ['icon_edit', 'icon_delete'],
  }

  const formatDate = (value: Date | string): string => {
    if (typeof value === 'string') {
      // dhtmlx 回调格式: "22-04-2026 00:00" (dd-MM-yyyy HH:mm)
      const match = value.match(/^(\d{2})-(\d{2})-(\d{4})/)
      if (match) return `${match[3]}-${match[2]}-${match[1]}`
      return value
    }
    const y = value.getFullYear()
    const m = String(value.getMonth() + 1).padStart(2, '0')
    const d = String(value.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  const handleSave = async (
    entity: string,
    action: string,
    data: Record<string, unknown>,
    id: string | number,
  ) => {
    try {
      if (entity === 'task') {
        if (action === 'create') {
          const res = await createTask({
            text: data.text as string,
            startDate: formatDate(data.start_date as Date | string),
            duration: data.duration as number,
            progress: Math.round(((data.progress as number) || 0) * 100),
            type: ((data.type as string) || 'task') as TaskType,
            parent: data.parent as number | undefined,
            details: data.details as string | undefined,
          })
          return { id: res.id }
        }
        if (action === 'update') {
          await updateTask({
            id: id as number,
            text: data.text as string,
            startDate: data.start_date ? formatDate(data.start_date as Date | string) : undefined,
            duration: data.duration as number | undefined,
            progress: data.progress != null ? Math.round((data.progress as number) * 100) : undefined,
            type: data.type as TaskType | undefined,
            parent: data.parent as number | undefined,
            details: data.details as string | undefined,
          })
        }
        if (action === 'delete') {
          await deleteTask(String(id))
        }
      }

      if (entity === 'link') {
        if (action === 'create') {
          const res = await createTaskLink({
            source: data.source as number,
            target: data.target as number,
            type: ((data.type as string) || '0') as LinkType,
          })
          return { id: res.id }
        }
        if (action === 'delete') {
          await deleteTaskLink(String(id))
        }
      }
    } catch (err) {
      console.error(`${entity} ${action} 操作失败`, err)
      addToast({ title: `操作失败`, color: 'danger' })
    }
  }

  return (
    <Card className="admin-card h-full">
      <CardHeader className="px-5 py-4 border-b border-divider">
        <h3 className="text-lg font-semibold">任务管理</h3>
      </CardHeader>
      <CardBody className="p-0 overflow-hidden" style={{ height: 460 }}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Spinner size="lg" />
          </div>
        ) : (
          <Gantt
            ref={ganttRef}
            tasks={tasks}
            links={links}
            config={config}
            theme={theme}
            locale={locale}
            plugins={{ quick_info: true }}
            data={{ save: handleSave }}
          />
        )}
      </CardBody>
    </Card>
  )
}
