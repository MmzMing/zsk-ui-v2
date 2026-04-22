/**
 * 仪表盘相关类型定义
 */

/** 仪表盘概览数据项 */
export interface DashboardItem {
  key: 'users' | 'docs' | 'videos' | 'comments'
  label: string
  value: string
  delta: string
  description: string
}

/** 系统公告 */
export interface Announcement {
  id: string
  title: string
  content: string
  type: 'info' | 'warning' | 'success' | 'error'
  createdAt: string
}
