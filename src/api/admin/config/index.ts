/**
 * 参数配置 API
 * 对接后端 SysConfigController 接口
 */

import { get, post, put, del } from '../../request'
import type {
  SysConfig,
  SysConfigQueryParams,
  SysConfigCreateInput,
  SysConfigUpdateInput,
  SysConfigPageData
} from '@/types/config.types'

/**
 * 分页查询参数配置列表
 *
 * @param params - 查询参数（含分页参数）
 * @returns 分页参数配置数据
 */
export async function getConfigList(params?: SysConfigQueryParams): Promise<SysConfigPageData> {
  return get('/system/config/page', params as unknown as Record<string, unknown>)
}

/**
 * 根据ID获取参数配置详情
 *
 * @param id - 参数配置ID
 * @returns 参数配置详情
 */
export async function getConfigById(id: string): Promise<SysConfig> {
  return get(`/system/config/${id}`)
}

/**
 * 新增参数配置
 *
 * @param data - 参数配置数据
 */
export async function createConfig(data: SysConfigCreateInput): Promise<void> {
  return post('/system/config', data as unknown as Record<string, unknown>)
}

/**
 * 修改参数配置
 *
 * @param data - 参数配置数据（必须包含id）
 */
export async function updateConfig(data: SysConfigUpdateInput): Promise<void> {
  return put('/system/config', data as unknown as Record<string, unknown>)
}

/**
 * 删除参数配置（支持批量）
 * 多个ID用逗号分隔
 *
 * @param ids - 参数配置ID列表，多个用逗号分隔
 */
export async function deleteConfig(ids: string): Promise<void> {
  return del(`/system/config/${ids}`)
}
