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

export async function getConfigList(params?: SysConfigQueryParams): Promise<SysConfigPageData> {
  return get('/system/config/page', params as unknown as Record<string, unknown>)
}

export async function getConfigById(id: string): Promise<SysConfig> {
  return get(`/system/config/${id}`)
}

export async function createConfig(data: SysConfigCreateInput): Promise<void> {
  return post('/system/config', data as unknown as Record<string, unknown>)
}

export async function updateConfig(data: SysConfigUpdateInput): Promise<void> {
  return put('/system/config', data as unknown as Record<string, unknown>)
}

export async function deleteConfig(ids: string): Promise<void> {
  return del(`/system/config/${ids}`)
}