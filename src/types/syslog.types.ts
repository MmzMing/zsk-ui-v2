/**
 * 系统日志类型定义
 * 对接后端 SysLogController 接口
 */

/** 日志分类 */
export type SysLogCategory = 'content' | 'user' | 'system'

/** 操作状态 */
export type SysLogStatus = 0 | 1

/** 业务类型 */
export type SysLogBusinessType = 0 | 1 | 2 | 3 | 4 | 5 | 6

/** 系统日志实体 */
export interface SysLog {
  /** 日志ID */
  id: string
  /** 分类（content/user/system） */
  category: SysLogCategory
  /** 操作人 */
  operator: string
  /** 动作名称 */
  action: string
  /** 详细描述 */
  detail: string
  /** 创建时间 */
  createdAt: string
  /** 请求方式 */
  requestMethod: string
  /** 请求URL */
  requestUrl: string
  /** 请求参数（JSON字符串） */
  requestParam: string
  /** 响应结果（JSON字符串） */
  responseResult: string
  /** 操作状态（0正常 1异常） */
  status: SysLogStatus
  /** 消耗时间(ms) */
  costTime: number
  /** 操作IP */
  operIp: string
}

/** 系统日志查询参数 */
export interface SysLogQueryParams {
  /** 分类（content/user/system） */
  category?: SysLogCategory
  /** 操作人，模糊匹配 */
  operator?: string
  /** 请求URL，模糊匹配 */
  requestUrl?: string
  /** 请求方式（GET/POST/PUT/DELETE），精确匹配 */
  requestMethod?: string
  /** 操作状态（0正常 1异常），精确匹配 */
  status?: SysLogStatus
  /** 模块标题，模糊匹配 */
  title?: string
  /** 业务类型（0其它 1新增 2修改 3删除 4授权 5导出 6导入），精确匹配 */
  businessType?: SysLogBusinessType
  /** 操作开始时间（yyyy-MM-dd HH:mm:ss） */
  beginTime?: string
  /** 操作结束时间（yyyy-MM-dd HH:mm:ss） */
  endTime?: string
  /** 页码，默认1 */
  pageNum?: number
  /** 每页大小，默认10，最大500 */
  pageSize?: number
  /** 排序字段 */
  orderByColumn?: string
  /** 排序方向（asc/desc），默认asc */
  isAsc?: string
}

/** 系统日志分页响应数据 */
export interface SysLogPageData {
  list: SysLog[]
  total: string
  pageNum: string
  pageSize: string
  totalPages: string
  hasNext: boolean
  hasPrevious: boolean
}

/** 日志分类选项 */
export interface SysLogCategoryOption {
  value: SysLogCategory
  label: string
}

/** 操作状态选项 */
export interface SysLogStatusOption {
  value: SysLogStatus
  label: string
}

/** 业务类型选项 */
export interface SysLogBusinessTypeOption {
  value: SysLogBusinessType
  label: string
}

/** 请求方式选项 */
export interface SysLogRequestMethodOption {
  value: string
  label: string
}

/** 日志分类选项常量 */
export const SYS_LOG_CATEGORY_OPTIONS: SysLogCategoryOption[] = [
  { value: 'content', label: '内容' },
  { value: 'user', label: '用户' },
  { value: 'system', label: '系统' }
]

/** 操作状态选项常量 */
export const SYS_LOG_STATUS_OPTIONS: SysLogStatusOption[] = [
  { value: 0, label: '正常' },
  { value: 1, label: '异常' }
]

/** 业务类型选项常量 */
export const SYS_LOG_BUSINESS_TYPE_OPTIONS: SysLogBusinessTypeOption[] = [
  { value: 0, label: '其它' },
  { value: 1, label: '新增' },
  { value: 2, label: '修改' },
  { value: 3, label: '删除' },
  { value: 4, label: '授权' },
  { value: 5, label: '导出' },
  { value: 6, label: '导入' }
]

/** 请求方式选项常量 */
export const SYS_LOG_REQUEST_METHOD_OPTIONS: SysLogRequestMethodOption[] = [
  { value: 'GET', label: 'GET' },
  { value: 'POST', label: 'POST' },
  { value: 'PUT', label: 'PUT' },
  { value: 'DELETE', label: 'DELETE' }
]
