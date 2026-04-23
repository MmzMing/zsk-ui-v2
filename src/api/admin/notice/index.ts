import { get, post, put, del } from '../../request'
import type {
  SysNotice,
  SysNoticeQueryParams,
  SysNoticeCreateInput,
  SysNoticeUpdateInput,
} from '@/types/notice.types'

/** 查询通知公告列表 */
export async function getNoticeList(params?: SysNoticeQueryParams): Promise<SysNotice[]> {
  return get('/system/notice/list', params as unknown as Record<string, unknown>)
}

/** 获取通知公告详情 */
export async function getNoticeById(id: string): Promise<SysNotice> {
  return get(`/system/notice/${id}`)
}

/** 新增通知公告 */
export async function createNotice(data: SysNoticeCreateInput): Promise<void> {
  return post('/system/notice', data as unknown as Record<string, unknown>)
}

/** 修改通知公告 */
export async function updateNotice(data: SysNoticeUpdateInput): Promise<void> {
  return put('/system/notice', data as unknown as Record<string, unknown>)
}

/** 删除通知公告（支持批量，逗号分隔） */
export async function deleteNotice(ids: string): Promise<void> {
  return del(`/system/notice/${ids}`)
}
