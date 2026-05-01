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
  DictCacheTags,
  DictCacheAllData,
  DictCacheVO
} from '@/types/dict.types'

// ===== 字典类型管理接口 =====

/**
 * 分页查询字典类型列表
 *
 * @param params - 查询参数（含分页参数）
 * @returns 分页字典类型数据
 */
export async function getDictTypeList(params?: SysDictTypeQueryParams): Promise<SysDictTypePageData> {
  return get('/system/dict/type/page', params as unknown as Record<string, unknown>)
}

/**
 * 根据ID获取字典类型详情
 *
 * @param id - 字典类型ID
 * @returns 字典类型详情
 */
export async function getDictTypeById(id: string): Promise<SysDictType> {
  return get(`/system/dict/type/${id}`)
}

/**
 * 新增字典类型
 *
 * @param data - 字典类型数据
 */
export async function createDictType(data: SysDictTypeCreateInput): Promise<void> {
  return post('/system/dict/type', data as unknown as Record<string, unknown>)
}

/**
 * 修改字典类型
 *
 * @param data - 字典类型数据（必须包含id）
 */
export async function updateDictType(data: SysDictTypeUpdateInput): Promise<void> {
  return put('/system/dict/type', data as unknown as Record<string, unknown>)
}

/**
 * 删除字典类型（支持批量）
 * 多个ID用逗号分隔
 *
 * @param ids - 字典类型ID列表，多个用逗号分隔
 */
export async function deleteDictType(ids: string): Promise<void> {
  return del(`/system/dict/type/${ids}`)
}

// ===== 字典数据管理接口 =====

/**
 * 分页查询字典数据列表
 *
 * @param params - 查询参数（含分页参数）
 * @returns 分页字典数据
 */
export async function getDictDataList(params?: SysDictDataQueryParams): Promise<SysDictDataPageData> {
  return get('/system/dict/data/page', params as unknown as Record<string, unknown>)
}

/**
 * 根据字典类型查询字典数据
 *
 * @param dictType - 字典类型编码
 * @returns 字典数据列表
 */
export async function getDictDataByType(dictType: string): Promise<SysDictData[]> {
  return get(`/system/dict/data/type/${dictType}`)
}

/**
 * 根据ID获取字典数据详情
 *
 * @param id - 字典数据ID
 * @returns 字典数据详情
 */
export async function getDictDataById(id: string): Promise<SysDictData> {
  return get(`/system/dict/data/${id}`)
}

/**
 * 新增字典数据
 *
 * @param data - 字典数据
 */
export async function createDictData(data: SysDictDataCreateInput): Promise<void> {
  return post('/system/dict/data', data as unknown as Record<string, unknown>)
}

/**
 * 修改字典数据
 *
 * @param data - 字典数据（必须包含id）
 */
export async function updateDictData(data: SysDictDataUpdateInput): Promise<void> {
  return put('/system/dict/data', data as unknown as Record<string, unknown>)
}

/**
 * 删除字典数据（支持批量）
 * 多个ID用逗号分隔
 *
 * @param ids - 字典数据ID列表，多个用逗号分隔
 */
export async function deleteDictData(ids: string): Promise<void> {
  return del(`/system/dict/data/${ids}`)
}

/**
 * 切换字典数据状态
 *
 * @param id - 字典数据ID
 * @param status - 目标状态
 */
export async function toggleDictDataStatus(id: string, status: DictStatus): Promise<void> {
  return put('/system/dict/data/toggleStatus', { id, status } as unknown as Record<string, unknown>)
}

/**
 * 批量切换字典数据状态
 *
 * @param ids - 字典数据ID列表
 * @param status - 目标状态
 */
export async function batchToggleDictDataStatus(ids: string[], status: DictStatus): Promise<void> {
  return put('/system/dict/data/batchToggleStatus', { ids, status } as unknown as Record<string, unknown>)
}

// ===== 字典缓存管理接口 =====

/**
 * 获取指定字典类型的缓存版本号
 *
 * @param dictType - 字典类型编码
 * @returns 缓存版本号（时间戳）
 */
export async function getDictCacheVersion(dictType: string): Promise<number> {
  return get(`/system/dict/type/version/${dictType}`)
}

/**
 * 预热字典缓存
 * 将数据库中的字典数据加载到缓存中
 */
export async function warmUpDictCache(): Promise<void> {
  return post('/system/dict/type/cache/warmUp')
}

/**
 * 获取字典缓存标签列表
 *
 * @returns 缓存标签数据
 */
export async function getDictCacheTags(): Promise<DictCacheTags> {
  return get('/system/dict/type/cache/tags')
}

/**
 * 根据标签获取字典缓存数据（带版本号）
 *
 * @param tag - 缓存标签
 * @returns 带版本号的字典缓存数据
 */
export async function getDictCacheByTag(tag: string): Promise<DictCacheVO> {
  return get(`/system/dict/type/cache/tag/${tag}`)
}

/**
 * 获取全部字典缓存数据（带版本号）
 *
 * @returns 全部字典缓存数据
 */
export async function getDictCacheAll(): Promise<DictCacheAllData> {
  return get('/system/dict/type/cache/all')
}

/**
 * 刷新指定字典类型的缓存
 *
 * @param dictType - 字典类型编码
 */
export async function refreshDictCache(dictType: string): Promise<void> {
  return post(`/system/dict/type/cache/refresh/${dictType}`)
}

/**
 * 删除指定字典类型的缓存
 *
 * @param dictType - 字典类型编码
 */
export async function deleteDictCache(dictType: string): Promise<void> {
  return del(`/system/dict/type/cache/${dictType}`)
}

/**
 * 清空全部字典缓存
 */
export async function clearAllDictCache(): Promise<void> {
  return del('/system/dict/type/cache/all')
}
