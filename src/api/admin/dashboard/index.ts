/**
 * 仪表盘 API
 */

import { get } from '../../request'
import type { DashboardItem } from '@/types/dashboard.types'

/**
 * 获取仪表盘概览数据
 */
export async function getDashboardOverview(): Promise<DashboardItem[]> {
  return get('/system/dashboard/overview')
}
