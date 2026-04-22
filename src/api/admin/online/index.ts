/**
 * 在线用户 / 登录管理 API
 * 对接后端 SysLoginManageController
 */

import { get, post } from '../../request'
import type {
  OnlineUser,
  OnlineUserQueryParams,
  OnlineUserPageData,
  ForceLogoutRequest,
} from '@/types/online.types'

/**
 * 分页查询在线用户列表（用户维度，一用户一条）
 * GET /api/system/login/online/page
 *
 * @param params 查询参数（分页 + 用户名/昵称/IP 模糊匹配）
 */
export function getOnlineUserPage(
  params?: OnlineUserQueryParams,
): Promise<OnlineUserPageData> {
  // 仅透传非空字段，避免空串污染后端 LIKE 条件
  const queryParams: Record<string, unknown> = {}
  if (params?.pageNum) queryParams.pageNum = params.pageNum
  if (params?.pageSize) queryParams.pageSize = params.pageSize
  if (params?.orderByColumn) queryParams.orderByColumn = params.orderByColumn
  if (params?.isAsc) queryParams.isAsc = params.isAsc
  if (params?.userName) queryParams.userName = params.userName
  if (params?.nickName) queryParams.nickName = params.nickName
  if (params?.ipaddr) queryParams.ipaddr = params.ipaddr
  return get<OnlineUserPageData>('/system/login/online/page', queryParams)
}

/**
 * 强制下线（按 userId 批量，一次性踢掉所有设备）
 * POST /api/system/login/online/forceLogout
 *
 * @param userIds 用户ID列表
 */
export function forceLogoutUsers(userIds: number[]): Promise<null> {
  const body: ForceLogoutRequest = { userIds }
  // 后端使用 application/json + List<Long>
  return post<null>('/system/login/online/forceLogout', body as unknown as Record<string, unknown>)
}

// 复用导出
export type { OnlineUser, OnlineUserPageData }
