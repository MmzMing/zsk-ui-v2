/**
 * Gantt 任务管理卡片
 * 使用 @svar-ui/react-gantt，通过 Willow/WillowDark 跟随系统主题切换
 */

import { useCallback, useMemo, useState } from 'react'
import { Card, CardBody, CardHeader } from '@heroui/react'
import { Gantt, ContextMenu, Toolbar, Willow, WillowDark } from '@svar-ui/react-gantt'
import type { IApi } from '@svar-ui/react-gantt'
import '@svar-ui/react-gantt/all.css'
import { useAppStore } from '@/stores/app'
import { mockGanttTasks, mockGanttLinks, mockGanttScales } from '@/api/admin/dashboard/mock'

function resolveTheme(mode: 'light' | 'dark' | 'system'): 'light' | 'dark' {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return mode
}

export default function GanttCard() {
  const [api, setApi] = useState<IApi | undefined>()
  const themeMode = useAppStore((s) => s.adminSettings.themeMode)
  const isDark = useMemo(() => resolveTheme(themeMode) === 'dark', [themeMode])

  const handleInit = useCallback((ganttApi: IApi) => {
    setApi(ganttApi)
  }, [])

  const ThemeProvider = isDark ? WillowDark : Willow

  return (
    <Card className="admin-card">
      <CardHeader className="px-5 py-4 border-b border-divider">
        <h3 className="text-lg font-semibold">任务管理</h3>
      </CardHeader>
      <CardBody className="p-0 overflow-hidden">
        <ThemeProvider>
          <div
            className="gantt-container"
            // style={{
            //   '--wx-background': 'var(--color-default-50)',
            //   '--wx-grid-body-row-border': '1px solid var(--color-default-200)',
            // } as React.CSSProperties}
          >
            <div className="px-4 pt-3">
              <Toolbar api={api} />
            </div>
            <div style={{ height: 500 }}>
              <ContextMenu api={api}>
                <Gantt
                  init={handleInit}
                  tasks={mockGanttTasks}
                  links={mockGanttLinks}
                  scales={mockGanttScales}
                />
              </ContextMenu>
            </div>
          </div>
        </ThemeProvider>
      </CardBody>
    </Card>
  )
}
