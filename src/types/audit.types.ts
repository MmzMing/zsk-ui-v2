/**
 * 统一审核管理类型定义
 * 对接后端 DocAuditController 接口
 * 统一管理文档、视频、文档评论、视频评论的审核流程
 */

/**
 * 审核目标类型
 * 1 - 文档
 * 2 - 视频
 * 3 - 文档评论
 * 4 - 视频评论
 */
export type AuditTargetType = 1 | 2 | 3 | 4

/**
 * 审核状态（数字枚举）
 * 0 - 待审核
 * 1 - 审核通过
 * 2 - 审核驳回
 * 3 - 已撤回
 */
export type AuditStatus = 0 | 1 | 2 | 3

/**
 * 审核状态字符串值（队列接口返回）
 */
export type AuditStatusValue = 'pending' | 'approved' | 'rejected' | 'withdrawn'

/**
 * 风险等级
 */
export type RiskLevel = 'low' | 'medium' | 'high'

/**
 * 审核类型
 */
export type AuditType = 'ai' | 'manual'

/**
 * 审核日志结果
 */
export type AuditLogResult = 'approved' | 'rejected' | 'withdrawn'

/**
 * 审核队列项数据结构
 * 对应 GET /api/document/docAudit/queue 响应中的列表项
 */
export interface AuditQueueItem {
  /** 审核记录ID */
  id: string
  /** 审核目标类型（1-文档 2-视频 3-文档评论 4-视频评论） */
  targetType: AuditTargetType
  /** 审核目标ID */
  targetId: string
  /** 内容标题（评论类型为评论内容） */
  title: string
  /** 分类编码（评论类型为null） */
  broadCode: string | null
  /** 上传者ID */
  uploaderId: string
  /** 上传者名称 */
  uploaderName: string
  /** 审核状态值（pending/approved/rejected/withdrawn） */
  status: AuditStatusValue
  /** 风险等级（low/medium/high） */
  riskLevel: RiskLevel
  /** 是否已AI审核 */
  isAiChecked: boolean
  /** 创建时间 */
  createTime: string
}

/**
 * 审核详情数据结构
 * 对应 GET /api/document/docAudit/detail 响应
 */
export interface AuditDetail {
  /** 审核记录ID */
  id: string
  /** 审核目标类型 */
  targetType: AuditTargetType
  /** 审核目标ID */
  targetId: string
  /** 内容标题 */
  targetTitle: string
  /** 审核类型（ai/manual） */
  auditType: AuditType
  /** 审核状态（0-待审核 1-通过 2-驳回 3-已撤回） */
  auditStatus: AuditStatus
  /** 审核结果详情（JSON格式，AI审核时填充） */
  auditResult: string | null
  /** 风险等级 */
  riskLevel: RiskLevel
  /** 审核意见 */
  auditMind: string | null
  /** 违规原因ID列表（逗号分隔） */
  violationIds: string | null
  /** 审核人ID */
  auditorId: string | null
  /** 审核人姓名 */
  auditorName: string | null
  /** 审核时间 */
  auditTime: string | null
  /** 创建时间 */
  createTime: string
}

/**
 * 审核日志项数据结构
 * 对应 GET /api/document/docAudit/logs 响应中的列表项
 */
export interface AuditLogItem {
  /** 日志ID */
  id: string
  /** 审核目标类型 */
  targetType: AuditTargetType
  /** 审核目标ID */
  targetId: string
  /** 内容标题 */
  targetTitle: string
  /** 审核人 */
  auditorName: string
  /** 审核时间 */
  auditTime: string
  /** 审核结果（approved/rejected/withdrawn） */
  result: AuditLogResult
  /** 审核意见 */
  auditMind: string | null
  /** 风险等级 */
  riskLevel: RiskLevel
}

/**
 * 违规原因项
 * 对应 GET /api/document/docAudit/violation-reasons 响应中的列表项
 */
export interface ViolationReason {
  /** 违规项ID */
  id: string
  /** 违规原因标签 */
  label: string
}

/**
 * 审核队列查询参数
 */
export interface AuditQueueQueryParams {
  /** 审核目标类型（必填） */
  targetType: AuditTargetType
  /** 审核状态（0-待审核 1-通过 2-驳回） */
  auditStatus?: AuditStatus
  /** 页码，默认1 */
  pageNum?: number
  /** 每页数量，默认10 */
  pageSize?: number
}

/**
 * 审核详情查询参数
 */
export interface AuditDetailQueryParams {
  /** 审核目标类型（必填） */
  targetType: AuditTargetType
  /** 审核目标ID（必填） */
  targetId: string
}

/**
 * 提交审核结果请求参数
 */
export interface AuditSubmitInput {
  /** 审核目标类型（必填） */
  targetType: AuditTargetType
  /** 审核目标ID（必填） */
  targetId: string
  /** 审核状态（1-通过 2-驳回，必填） */
  auditStatus: 1 | 2
  /** 审核意见 */
  auditMind?: string
  /** 违规项ID列表 */
  violationIds?: string[]
}

/**
 * 批量提交审核结果请求参数
 */
export interface AuditBatchSubmitInput {
  /** 审核目标类型（必填） */
  targetType: AuditTargetType
  /** 审核目标ID列表（必填） */
  targetIds: string[]
  /** 审核状态（1-通过 2-驳回，必填） */
  auditStatus: 1 | 2
  /** 审核意见 */
  auditMind?: string
  /** 违规项ID列表 */
  violationIds?: string[]
}

/**
 * 审核日志查询参数
 */
export interface AuditLogQueryParams {
  /** 审核目标类型（不传则查询全部类型） */
  targetType?: AuditTargetType
  /** 页码，默认1 */
  pageNum?: number
  /** 每页数量，默认10 */
  pageSize?: number
}

/**
 * 审核队列分页响应数据
 */
export interface AuditQueuePageData {
  /** 审核队列列表 */
  list: AuditQueueItem[]
  /** 总条数 */
  total: number
  /** 当前页码 */
  pageNum: number
  /** 每页数量 */
  pageSize: number
}

/**
 * 审核日志分页响应数据
 */
export interface AuditLogPageData {
  /** 审核日志列表 */
  list: AuditLogItem[]
  /** 总条数 */
  total: number
  /** 当前页码 */
  pageNum: number
  /** 每页数量 */
  pageSize: number
}

/**
 * 审核目标类型选项
 */
export interface AuditTargetTypeOption {
  /** 类型值 */
  value: AuditTargetType
  /** 显示标签 */
  label: string
}

/**
 * 审核目标类型选项列表
 */
export const AUDIT_TARGET_TYPE_OPTIONS: AuditTargetTypeOption[] = [
  { value: 1, label: '文档' },
  { value: 2, label: '视频' },
  { value: 3, label: '文档评论' },
  { value: 4, label: '视频评论' }
]

/**
 * 审核状态选项（用于筛选）
 */
export interface AuditStatusOption {
  /** 状态值 */
  value: AuditStatus
  /** 显示标签 */
  label: string
}

/**
 * 审核状态选项列表
 */
export const AUDIT_STATUS_OPTIONS: AuditStatusOption[] = [
  { value: 0, label: '待审核' },
  { value: 1, label: '审核通过' },
  { value: 2, label: '审核驳回' }
]

/**
 * 审核状态字符串值到数字值的映射
 */
export const AUDIT_STATUS_VALUE_MAP: Record<AuditStatusValue, AuditStatus> = {
  pending: 0,
  approved: 1,
  rejected: 2,
  withdrawn: 3
}

/**
 * 审核状态数字值到字符串值的映射
 */
export const AUDIT_STATUS_NUMBER_MAP: Record<AuditStatus, AuditStatusValue> = {
  0: 'pending',
  1: 'approved',
  2: 'rejected',
  3: 'withdrawn'
}

/**
 * 风险等级选项
 */
export interface RiskLevelOption {
  /** 等级值 */
  value: RiskLevel
  /** 显示标签 */
  label: string
  /** Chip颜色 */
  color: 'success' | 'warning' | 'danger'
}

/**
 * 风险等级选项列表
 */
export const RISK_LEVEL_OPTIONS: RiskLevelOption[] = [
  { value: 'low', label: '低风险', color: 'success' },
  { value: 'medium', label: '中风险', color: 'warning' },
  { value: 'high', label: '高风险', color: 'danger' }
]
