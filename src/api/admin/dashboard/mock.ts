/**
 * 仪表盘 Mock 数据
 * 用于公告和 Gantt 任务（后端接口未开发）
 */

import type { Announcement } from '@/types/dashboard.types'
import dayjs from 'dayjs'

export const mockAnnouncements: Announcement[] = [
  {
    id: '1',
    title: '系统维护通知',
    content: '系统将于本周六凌晨2:00-4:00进行维护升级',
    type: 'warning',
    createdAt: '2026-04-23T10:00:00Z',
  },
  {
    id: '2',
    title: 'v2.1.0 版本发布',
    content: '新增仪表盘功能，优化后台管理体验',
    type: 'success',
    createdAt: '2026-04-22T09:30:00Z',
  },
  {
    id: '3',
    title: '安全更新提醒',
    content: '请所有用户尽快修改密码，提升账户安全性',
    type: 'error',
    createdAt: '2026-04-21T14:00:00Z',
  },
  {
    id: '4',
    title: '新功能预告',
    content: '即将上线知识图谱功能，敬请期待',
    type: 'info',
    createdAt: '2026-04-20T16:00:00Z',
  },
  {
    id: '5',
    title: '社区活动通知',
    content: '知识库征文大赛正在进行中，欢迎投稿参与',
    type: 'info',
    createdAt: '2026-04-19T11:00:00Z',
  },
]

/** Gantt 任务数据 */
export const mockGanttTasks = [
  {
    id: 1,
    open: true,
    start: new Date(2026, 3, 20),
    duration: 15,
    text: '知识库 v2.1 开发',
    progress: 45,
    type: 'summary' as const,
  },
  {
    id: 2,
    parent: 1,
    start: new Date(2026, 3, 20),
    duration: 5,
    text: '仪表盘模块开发',
    progress: 80,
    type: 'task' as const,
  },
  {
    id: 3,
    parent: 1,
    start: new Date(2026, 3, 25),
    duration: 4,
    text: '知识图谱功能',
    progress: 20,
    type: 'task' as const,
  },
  {
    id: 4,
    parent: 1,
    start: new Date(2026, 3, 29),
    duration: 3,
    text: 'API 接口优化',
    progress: 0,
    type: 'task' as const,
  },
  {
    id: 5,
    parent: 1,
    start: new Date(2026, 4, 2),
    duration: 3,
    text: '系统测试与部署',
    progress: 0,
    type: 'task' as const,
  },
  {
    id: 6,
    start: new Date(2026, 4, 5),
    duration: 0,
    text: 'v2.1 正式发布',
    progress: 0,
    type: 'milestone' as const,
  },
]

export const mockGanttLinks = [
  { id: 1, source: 2, target: 3, type: 'e2s' as const },
  { id: 2, source: 3, target: 4, type: 'e2s' as const },
  { id: 3, source: 4, target: 5, type: 'e2s' as const },
  { id: 4, source: 5, target: 6, type: 'e2s' as const },
]

export const mockGanttScales = [
  { unit: 'month' as const, step: 1, format: (date: Date) => dayjs(date).format('YYYY年M月') },
  { unit: 'day' as const, step: 1, format: (date: Date) => dayjs(date).format('D') },
]
