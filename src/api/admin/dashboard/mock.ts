/**
 * 仪表盘 Mock 数据
 * 公告数据（后端接口未开发）
 */

import type { Announcement } from '@/types/dashboard.types'

export const mockGanttTasks = [
  { id: 1, text: '项目规划', start_date: '2026-04-01', duration: 10, progress: 0.95, type: 'project', open: true },
  { id: 2, text: '需求分析', start_date: '2026-04-01', duration: 3, progress: 1, type: 'task', parent: 1 },
  { id: 3, text: '技术方案', start_date: '2026-04-04', duration: 4, progress: 1, type: 'task', parent: 1 },
  { id: 4, text: '需求评审通过', start_date: '2026-04-10', duration: 0, progress: 0, type: 'milestone', parent: 1 },

  { id: 5, text: '系统开发', start_date: '2026-04-11', duration: 18, progress: 0.6, type: 'project', open: true },
  { id: 6, text: '前端开发', start_date: '2026-04-11', duration: 10, progress: 0.7, type: 'task', parent: 5 },
  { id: 7, text: '后端开发', start_date: '2026-04-11', duration: 12, progress: 0.5, type: 'task', parent: 5 },
  { id: 8, text: 'API 联调', start_date: '2026-04-25', duration: 4, progress: 0.3, type: 'task', parent: 5 },

  { id: 9, text: '测试阶段', start_date: '2026-04-30', duration: 8, progress: 0.15, type: 'project', open: true },
  { id: 10, text: '单元测试', start_date: '2026-04-30', duration: 3, progress: 0.3, type: 'task', parent: 9 },
  { id: 11, text: '集成测试', start_date: '2026-05-05', duration: 4, progress: 0.1, type: 'task', parent: 9 },
  { id: 12, text: 'UAT 测试', start_date: '2026-05-09', duration: 3, progress: 0, type: 'task', parent: 9 },

  { id: 13, text: '上线部署', start_date: '2026-05-13', duration: 2, progress: 0, type: 'task' },
  { id: 14, text: '正式发布', start_date: '2026-05-15', duration: 0, progress: 0, type: 'milestone' },
]

export const mockGanttLinks = [
  { id: 1, source: 2, target: 3, type: '0' },
  { id: 2, source: 3, target: 4, type: '0' },
  { id: 3, source: 4, target: 6, type: '0' },
  { id: 4, source: 4, target: 7, type: '0' },
  { id: 5, source: 6, target: 8, type: '0' },
  { id: 6, source: 7, target: 8, type: '0' },
  { id: 7, source: 8, target: 10, type: '0' },
  { id: 8, source: 10, target: 11, type: '0' },
  { id: 9, source: 11, target: 12, type: '0' },
  { id: 10, source: 12, target: 13, type: '0' },
  { id: 11, source: 13, target: 14, type: '0' },
]

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
