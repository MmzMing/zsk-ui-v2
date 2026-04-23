/**
 * 任务依赖管理 API
 * 对接后端 SysTaskLinkController 接口
 */

import { get, post, del } from '../../request'
import type {
  SysTaskLink,
  SysTaskLinkCreateInput,
} from '@/types/task.types'

/** 获取任务依赖关系列表 */
export async function getTaskLinkList(): Promise<SysTaskLink[]> {
  return get('/system/task/link/list')
}

/** 创建任务依赖 */
export async function createTaskLink(data: SysTaskLinkCreateInput): Promise<SysTaskLink> {
  return post('/system/task/link', data as unknown as Record<string, unknown>)
}

/** 删除任务依赖（支持批量，逗号分隔） */
export async function deleteTaskLink(ids: string): Promise<void> {
  return del(`/system/task/link/${ids}`)
}
