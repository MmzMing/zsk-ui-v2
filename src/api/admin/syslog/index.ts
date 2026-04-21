/**
 * 系统日志管理 API
 * 对接后端 SysLogController 接口
 */

import { get, del } from '../../request'
import type { SysLogQueryParams, SysLogPageData } from '@/types/syslog.types'

/**
 * 分页查询管理日志
 * GET /api/system/logs/page
 * @param params - 查询参数（含分页和筛选条件）
 * @returns 分页数据
 */
export async function getSysLogPage(params?: SysLogQueryParams): Promise<SysLogPageData> {
  const queryParams: Record<string, unknown> = {}
  if (params?.category) queryParams.category = params.category
  if (params?.operator) queryParams.operator = params.operator
  if (params?.requestUrl) queryParams.requestUrl = params.requestUrl
  if (params?.requestMethod) queryParams.requestMethod = params.requestMethod
  if (params?.status !== undefined) queryParams.status = params.status
  if (params?.title) queryParams.title = params.title
  if (params?.businessType !== undefined) queryParams.businessType = params.businessType
  if (params?.beginTime) queryParams.beginTime = params.beginTime
  if (params?.endTime) queryParams.endTime = params.endTime
  if (params?.pageNum) queryParams.pageNum = params.pageNum
  if (params?.pageSize) queryParams.pageSize = params.pageSize
  if (params?.orderByColumn) queryParams.orderByColumn = params.orderByColumn
  if (params?.isAsc) queryParams.isAsc = params.isAsc
  return get('/system/logs/page', queryParams)
}

/**
 * 批量删除管理日志
 * DELETE /api/system/logs/{ids}
 * @param ids - 日志ID列表，多个ID以逗号分隔
 */
export async function deleteSysLogs(ids: string): Promise<void> {
  return del(`/system/logs/${ids}`)
}
