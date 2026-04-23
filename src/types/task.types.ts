/**
 * 任务管理相关类型定义
 * 对应 @dhtmlx/trial-react-gantt 的 Task / Link 接口
 */

/** 任务类型：task-普通任务 / project-汇总任务 / milestone-里程碑 */
export type TaskType = 'task' | 'project' | 'milestone'

/** 依赖类型（dhtmlx 原生）：0-终到始 / 1-始到始 / 2-终到终 / 3-始到终 */
export type LinkType = '0' | '1' | '2' | '3'

/** 后端返回的任务原始数据（start_date 为字符串） */
export interface SysTaskRaw {
  id: number
  text: string
  startDate: string
  duration: number
  progress: number
  type: TaskType
  parent?: number
  open?: boolean
  details?: string
}

/** 前端使用的任务（start_date 已转为 Date） */
export interface SysTask {
  id: number
  text: string
  startDate: Date
  duration: number
  progress: number
  type: TaskType
  parent?: number
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
  startDate: string
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
  startDate?: string
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
