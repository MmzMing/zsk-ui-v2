/**
 * 仪表盘 Mock 数据
 * 公告数据（后端接口未开发）
 */

import type { Announcement } from '@/types/dashboard.types'

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
