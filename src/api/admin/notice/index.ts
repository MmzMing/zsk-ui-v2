/**
 * 通知公告管理 API
 * 对接后端 SysNoticeController 接口
 */

import { get, post, put, del } from '../../request'
import type {
  SysNotice,
  SysNoticeQueryParams,
  SysNoticeCreateInput,
  SysNoticeUpdateInput,
} from '@/types/notice.types'

/**
 * 查询通知公告列表
 *
 * @param params - 查询参数
 * @returns 通知公告列表
 */
export async function getNoticeList(params?: SysNoticeQueryParams): Promise<SysNotice[]> {
  return get('/system/notice/list', params as unknown as Record<string, unknown>)
}

/**
 * 根据ID获取通知公告详情
 *
 * @param id - 通知公告ID
 * @returns 通知公告详情
 */
export async function getNoticeById(id: string): Promise<SysNotice> {
  return get(`/system/notice/${id}`)
}

/**
 * 新增通知公告
 *
 * @param data - 通知公告数据
 */
export async function createNotice(data: SysNoticeCreateInput): Promise<void> {
  return post('/system/notice', data as unknown as Record<string, unknown>)
}

/**
 * 修改通知公告
 *
 * @param data - 通知公告数据（必须包含id）
 */
export async function updateNotice(data: SysNoticeUpdateInput): Promise<void> {
  return put('/system/notice', data as unknown as Record<string, unknown>)
}

/**
 * 删除通知公告（支持批量）
 * 多个ID用逗号分隔
 *
 * @param ids - 通知公告ID列表，多个用逗号分隔
 */
export async function deleteNotice(ids: string): Promise<void> {
  return del(`/system/notice/${ids}`)
}

/**
 * 获取控制台最新公告
 * 用于后台首页展示最新通知
 *
 * @returns 最新公告列表
 */
export async function getConsoleNotices(): Promise<SysNotice[]> {
  return get('/system/notice/console')
}
