/**
 * 行为审计 API
 * 对接后端 SysBehaviorController
 */

import { get } from '../../request'
import type {
  BehaviorUser,
  BehaviorEvent,
  BehaviorDetail,
  BehaviorQueryParams,
  BehaviorPageData,
} from '@/types/behavior.types'

/**
 * 获取行为审计用户列表（按 operName 聚合，按操作次数降序）
 * GET /api/system/monitor/behavior/users
 */
export function getBehaviorUsers(): Promise<BehaviorUser[]> {
  return get<BehaviorUser[]>('/system/monitor/behavior/users')
}

/**
 * 分页查询用户行为列表（多条件、按 operTime 倒序）
 *
 * 列表中的 operParam / jsonResult 由后端截断到 200 字符；
 * 如需完整内容请调用 {@link getBehaviorDetail}
 *
 * @param params 查询参数（含分页与多条件）
 */
export function getBehaviorEventsPage(
  params?: BehaviorQueryParams,
): Promise<BehaviorPageData> {
  // 仅向后端透传非空字段，避免发送空字符串干扰 SQL 条件拼接
  const queryParams: Record<string, unknown> = {}
  if (params?.pageNum) queryParams.pageNum = params.pageNum
  if (params?.pageSize) queryParams.pageSize = params.pageSize
  if (params?.userName) queryParams.userName = params.userName
  if (params?.businessType !== undefined) queryParams.businessType = params.businessType
  if (params?.title) queryParams.title = params.title
  if (params?.operIp) queryParams.operIp = params.operIp
  if (params?.status !== undefined) queryParams.status = params.status
  if (params?.beginTime) queryParams.beginTime = params.beginTime
  if (params?.endTime) queryParams.endTime = params.endTime
  return get<BehaviorPageData>('/system/monitor/behavior/events', queryParams)
}

/**
 * 获取行为详情（完整请求/响应、错误信息、方法签名）
 * @param id MongoDB _id
 */
export function getBehaviorDetail(id: string): Promise<BehaviorDetail> {
  return get<BehaviorDetail>(`/system/monitor/behavior/${id}`)
}

// 复用导出，方便上层 import 类型
export type { BehaviorUser, BehaviorEvent, BehaviorDetail, BehaviorPageData }
