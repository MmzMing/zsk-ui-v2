/**
 * 字典管理 API
 * 对接后端 SysDictTypeController 和 SysDictDataController 接口
 */

import { get, post, put, del } from '../../request'
import type {
  SysDictType,
  SysDictData,
  SysDictTypeQueryParams,
  SysDictDataQueryParams,
  SysDictTypeCreateInput,
  SysDictTypeUpdateInput,
  SysDictDataCreateInput,
  SysDictDataUpdateInput,
  SysDictTypePageData,
  SysDictDataPageData,
  DictStatus,
  SysDictDataCache,
  DictCacheTags,
  DictCacheAllData
} from '@/types/dict.types'

export async function getDictTypeList(params?: SysDictTypeQueryParams): Promise<SysDictTypePageData> {
  return get('/system/dict/type/page', params as unknown as Record<string, unknown>)
}

export async function getDictTypeById(id: string): Promise<SysDictType> {
  return get(`/system/dict/type/${id}`)
}

export async function createDictType(data: SysDictTypeCreateInput): Promise<void> {
  return post('/system/dict/type', data as unknown as Record<string, unknown>)
}

export async function updateDictType(data: SysDictTypeUpdateInput): Promise<void> {
  return put('/system/dict/type', data as unknown as Record<string, unknown>)
}

export async function deleteDictType(ids: string): Promise<void> {
  return del(`/system/dict/type/${ids}`)
}

export async function getDictDataList(params?: SysDictDataQueryParams): Promise<SysDictDataPageData> {
  return get('/system/dict/data/page', params as unknown as Record<string, unknown>)
}

export async function getDictDataByType(dictType: string): Promise<SysDictData[]> {
  return get(`/system/dict/data/type/${dictType}`)
}

export async function getDictDataById(id: string): Promise<SysDictData> {
  return get(`/system/dict/data/${id}`)
}

export async function createDictData(data: SysDictDataCreateInput): Promise<void> {
  return post('/system/dict/data', data as unknown as Record<string, unknown>)
}

export async function updateDictData(data: SysDictDataUpdateInput): Promise<void> {
  return put('/system/dict/data', data as unknown as Record<string, unknown>)
}

export async function deleteDictData(ids: string): Promise<void> {
  return del(`/system/dict/data/${ids}`)
}

export async function toggleDictDataStatus(id: string, status: DictStatus): Promise<void> {
  return put('/system/dict/data/toggleStatus', { id, status } as unknown as Record<string, unknown>)
}

export async function batchToggleDictDataStatus(ids: string[], status: DictStatus): Promise<void> {
  return put('/system/dict/data/batchToggleStatus', { ids, status } as unknown as Record<string, unknown>)
}

export async function warmUpDictCache(): Promise<void> {
  return post('/system/dict/type/cache/warmUp')
}

export async function getDictCacheTags(): Promise<DictCacheTags> {
  return get('/system/dict/type/cache/tags')
}

export async function getDictCacheByTag(tag: string): Promise<SysDictDataCache[]> {
  return get(`/system/dict/type/cache/tag/${tag}`)
}

export async function getDictCacheAll(): Promise<DictCacheAllData> {
  return get('/system/dict/type/cache/all')
}

export async function refreshDictCache(dictType: string): Promise<void> {
  return post(`/system/dict/type/cache/refresh/${dictType}`)
}

export async function deleteDictCache(dictType: string): Promise<void> {
  return del(`/system/dict/type/cache/${dictType}`)
}

export async function clearAllDictCache(): Promise<void> {
  return del('/system/dict/type/cache/all')
}