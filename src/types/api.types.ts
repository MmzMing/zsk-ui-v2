/**
 * API 通用类型定义
 * 所有 API 响应的基础类型
 */

// API 响应基础结构（后端接口模板）
export interface ApiResponse<T = unknown> {
  /** 状态码，0 表示成功 */
  code: number
  /** 响应消息 */
  msg: string
  /** 响应数据 */
  data: T
  /** 时间戳 */
  timestamp: string
}
// 分页请求参数
export interface PaginationParams {
  /** 当前页码，从 1 开始 */
  page: number
  /** 每页数量 */
  pageSize: number
  /** 排序字段 */
  sortBy?: string
  /** 排序方式 */
  sortOrder?: 'asc' | 'desc'
}
// 分页响应数据
export interface PaginationData<T> {
  /** 数据列表 */
  list: T[]
  /** 总数量 */
  total: number
  /** 当前页码 */
  page: number
  /** 每页数量 */
  pageSize: number
  /** 总页数 */
  totalPages: number
}
// 通用 ID 参数
export interface IdParams {
  id: string | number
}
// 通用批量操作参数
export interface BatchParams {
  ids: (string | number)[]
}
// 空响应类型
export type EmptyResponse = ApiResponse<null>
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'
// API 状态码枚举
export enum ApiCode {
  /** 成功 */
  SUCCESS = 0,
  /** 参数错误 */
  PARAM_ERROR = 400,
  /** 未授权 */
  UNAUTHORIZED = 401,
  /** 禁止访问 */
  FORBIDDEN = 403,
  /** 资源不存在 */
  NOT_FOUND = 404,
  /** 服务器错误 */
  SERVER_ERROR = 500,
}
