/**
 * 任务管理相关类型定义
 * 对应 dhtmlx-gantt 的 Task / Link 接口
 */

/** 任务类型 */
export type TaskType = 'task' | 'summary' | 'milestone'

/** 依赖类型 */
export type LinkType = 'e2s' | 's2s' | 'e2e' | 's2e'

/** 任务 */
export interface SysTaskRaw {
  id: number
  text: string
  start: Date
  duration: number
  progress: number
  type: TaskType
  parent: number
  open?: boolean
  details?: string
}

/** 任务 */
export interface SysTask {
  id: number
  text: string
  start: Date
  duration: number
  progress: number
  type: TaskType
  parent: number
  open?: boolean
  details?: string
}

/** 任务依赖关系 */
export interface SysTaskLink {
  id: number
  source: number
  target: number
  type: LinkType
}

/** 获取任务列表的响应 */
export interface TaskListResponse {
  tasks: SysTaskRaw[]
  links: SysTaskLink[]
}

/** 创建任务请求体 */
export interface SysTaskCreateInput {
  text: string
  start: string
  duration: number
  progress?: number
  type: TaskType
  parent?: number
  details?: string
}

/** 更新任务请求体 */
export interface SysTaskUpdateInput {
  id: number
  text?: string
  start?: string
  duration?: number
  progress?: number
  type?: TaskType
  parent?: number
  details?: string
}

/** 创建任务依赖请求体 */
export interface SysTaskLinkCreateInput {
  source: number
  target: number
  type: LinkType
}
