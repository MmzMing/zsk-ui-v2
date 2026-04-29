/**
 * 统一审核管理 API
 * 对接后端 DocAuditController 接口
 * 统一管理文档、视频、文档评论、视频评论的审核流程
 */

import { get, post } from '../../request'
import type {
  AuditQueuePageData,
  AuditQueueQueryParams,
  AuditDetail,
  AuditDetailQueryParams,
  AuditSubmitInput,
  AuditBatchSubmitInput,
  AuditLogPageData,
  AuditLogQueryParams,
  ViolationReason
} from '@/types/audit.types'

/**
 * 获取审核队列
 * 根据目标类型和审核状态筛选审核队列，支持分页查询
 *
 * @param params - 查询参数（targetType必填）
 * @returns 审核队列分页数据
 */
export async function getAuditQueue(params: AuditQueueQueryParams): Promise<AuditQueuePageData> {
  return get('/api/document/docAudit/queue', params as unknown as Record<string, unknown>)
}

/**
 * 获取审核详情
 * 根据目标类型和目标ID查询最新的审核记录
 *
 * @param params - 查询参数（targetType和targetId必填）
 * @returns 审核详情
 */
export async function getAuditDetail(params: AuditDetailQueryParams): Promise<AuditDetail> {
  return get('/api/document/docAudit/detail', params as unknown as Record<string, unknown>)
}

/**
 * 提交审核结果（单条）
 *
 * @param data - 审核提交参数
 */
export async function submitAudit(data: AuditSubmitInput): Promise<void> {
  return post('/api/document/docAudit/submit', data as unknown as Record<string, unknown>)
}

/**
 * 批量提交审核结果
 * 对同一类型的多个内容批量提交审核结果，部分失败不影响其他项
 *
 * @param data - 批量审核提交参数
 */
export async function submitBatchAudit(data: AuditBatchSubmitInput): Promise<void> {
  return post('/api/document/docAudit/submitBatch', data as unknown as Record<string, unknown>)
}

/**
 * 获取审核日志
 * 查询审核操作日志，支持按目标类型筛选，按审核时间倒序排列
 *
 * @param params - 查询参数
 * @returns 审核日志分页数据
 */
export async function getAuditLogs(params?: AuditLogQueryParams): Promise<AuditLogPageData> {
  return get('/api/document/docAudit/logs', params as unknown as Record<string, unknown>)
}

/**
 * 获取违规原因列表
 * 根据目标类型获取对应的违规原因字典数据
 *
 * @param targetType - 审核目标类型
 * @returns 违规原因列表
 */
export async function getViolationReasons(targetType: number): Promise<ViolationReason[]> {
  return get('/api/document/docAudit/violation-reasons', { targetType })
}
