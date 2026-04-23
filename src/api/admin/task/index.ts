/**
 * 任务管理 API
 * 对接后端 SysTaskController 接口
 */

import { get, post, put, del } from '../../request'
import type {
  TaskListResponse,
  SysTaskRaw,
  SysTaskCreateInput,
  SysTaskUpdateInput,
} from '@/types/task.types'

/** 获取任务列表（含依赖关系） */
export async function getTaskList(): Promise<TaskListResponse> {
  return get('/system/task/list')
}

/** 获取单个任务详情 */
export async function getTaskById(id: number): Promise<SysTaskRaw> {
  return get(`/system/task/${id}`)
}

/** 创建任务 */
export async function createTask(data: SysTaskCreateInput): Promise<SysTaskRaw> {
  return post('/system/task', data as unknown as Record<string, unknown>)
}

/** 更新任务 */
export async function updateTask(data: SysTaskUpdateInput): Promise<void> {
  return put('/system/task', data as unknown as Record<string, unknown>)
}

/** 删除任务（支持批量，逗号分隔） */
export async function deleteTask(ids: string): Promise<void> {
  return del(`/system/task/${ids}`)
}
