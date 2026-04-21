/**
 * 缓存管理 API
 * 对接后端 CacheSysController 接口
 */

import { get, post, put, del } from '../../request'
import type {
  CacheInstance,
  CacheKeyInfo,
  CacheKeyQueryParams,
  CacheKeyPageData,
  CacheDetail,
  RedisInfo,
  CacheStatistics,
  PieChartDataPoint,
  GaugeChartData,
  CacheOperationLog,
  WarmupResult,
  RefreshTtlParams,
  BatchRefreshTtlParams
} from '@/types/cache.types'

// ===== 缓存实例相关接口 =====

/**
 * 获取缓存实例列表
 * @returns 缓存实例列表
 */
export async function getCacheInstances(): Promise<CacheInstance[]> {
  return get('/system/cache/instances')
}

/**
 * 获取Redis服务器信息
 * @returns Redis信息
 */
export async function getRedisInfo(): Promise<RedisInfo> {
  return get('/system/cache/info')
}

/**
 * 获取缓存统计信息
 * @returns 统计数据
 */
export async function getCacheStatistics(): Promise<CacheStatistics> {
  return get('/system/cache/statistics')
}

/**
 * 获取缓存分布数据（饼图）
 * @returns 缓存分布数据
 */
export async function getCacheDistribution(): Promise<PieChartDataPoint[]> {
  return get('/system/cache/distribution')
}

/**
 * 获取内存使用数据（仪表盘）
 * @returns 内存使用数据
 */
export async function getMemoryUsage(): Promise<GaugeChartData> {
  return get('/system/cache/memory/usage')
}

// ===== 缓存键列表相关接口 =====

/**
 * 获取缓存信息列表（支持分页和搜索）
 * GET /system/cache/list
 * @param params - 查询参数
 * @returns 缓存信息列表（支持数组或分页对象两种格式）
 */
export async function getCacheKeyList(params?: CacheKeyQueryParams): Promise<CacheKeyPageData | CacheKeyInfo[]> {
  const queryParams: Record<string, unknown> = {}
  if (params?.cacheName) queryParams.cacheName = params.cacheName
  if (params?.keyword) queryParams.keyword = params.keyword
  if (params?.pageNum) queryParams.pageNum = params.pageNum
  if (params?.pageSize) queryParams.pageSize = params.pageSize
  return get('/system/cache/list', queryParams) as Promise<CacheKeyPageData | CacheKeyInfo[]>
}

// ===== 缓存详情相关接口 =====

/**
 * 获取缓存详细信息
 * @param cacheKey - 缓存键名
 * @returns 缓存详细信息
 */
export async function getCacheDetail(cacheKey: string): Promise<CacheDetail> {
  const encodedKey = encodeURIComponent(cacheKey)
  return get(`/system/cache/info/${encodedKey}`)
}

/**
 * 获取缓存值
 * @param cacheKey - 缓存键名
 * @returns 缓存值
 */
export async function getCacheValue(cacheKey: string): Promise<unknown> {
  const encodedKey = encodeURIComponent(cacheKey)
  return get(`/system/cache/value/${encodedKey}`)
}

/**
 * 判断缓存是否存在
 * @param cacheKey - 缓存键名
 * @returns 是否存在
 */
export async function checkCacheExists(cacheKey: string): Promise<boolean> {
  const encodedKey = encodeURIComponent(cacheKey)
  return get(`/system/cache/exists/${encodedKey}`)
}

// ===== 缓存日志相关接口 =====

/**
 * 获取缓存操作日志
 * @param params - 查询参数（可选）
 * @returns 日志列表
 */
export async function getCacheLogs(params?: Record<string, unknown>): Promise<CacheOperationLog[]> {
  return get('/system/cache/logs', params)
}

// ===== 缓存管理操作接口 =====

/**
 * 刷新单个缓存键
 * @param cacheKey - 缓存键名
 */
export async function refreshCacheKey(cacheKey: string): Promise<void> {
  const data = { key: cacheKey }
  await post('/system/cache/keys/refresh', data)
}

/**
 * 批量刷新缓存键
 * @param keys - 缓存键名列表
 */
export async function batchRefreshCacheKeys(keys: string[]): Promise<void> {
  const data = { keys }
  await post('/system/cache/keys/batchRefresh', data)
}

/**
 * 批量删除缓存键
 * @param keys - 缓存键名列表
 */
export async function batchDeleteCacheKeys(keys: string[]): Promise<void> {
  const data = { keys }
  await post('/system/cache/keys/batchDelete', data)
}

/**
 * 执行缓存预热
 * @param cacheNames - 需要预热的缓存名称列表，不传则预热所有
 * @returns 预热结果列表
 */
export async function warmupCache(cacheNames?: string[]): Promise<WarmupResult[]> {
  const data = cacheNames ? { cacheNames } : {}
  return post('/system/cache/warmup', data)
}

/**
 * 清空指定缓存实例
 * @param cacheName - 缓存名称
 */
export async function clearCacheInstance(cacheName: string): Promise<void> {
  const data = { cacheName }
  await post('/system/cache/instances/clear', data)
}

/**
 * 刷新单个缓存过期时间（TTL）
 * @param params - TTL刷新参数
 */
export async function refreshCacheTtl(params: RefreshTtlParams): Promise<boolean> {
  return put('/system/cache/refreshTtl', params as unknown as Record<string, unknown>)
}

/**
 * 批量刷新缓存过期时间（TTL）
 * @param params - 批量TTL刷新参数
 */
export async function batchRefreshCacheTtl(params: BatchRefreshTtlParams): Promise<number> {
  return put('/system/cache/refreshTtlBatch', params as unknown as Record<string, unknown>)
}

/**
 * 删除单个缓存键
 * @param key - 缓存键名
 */
export async function deleteCacheKey(key: string): Promise<void> {
  const encodedKey = encodeURIComponent(key)
  await del(`/system/cache/keys/${encodedKey}`)
}

/**
 * 删除缓存
 * @param key - 缓存键名或标识
 */
export async function deleteCache(key: string): Promise<void> {
  await del('/system/cache/delete', { key })
}

/**
 * 清空指定名称的缓存
 * @param cacheName - 缓存名称
 */
export async function clearCacheByName(cacheName: string): Promise<void> {
  const encodedName = encodeURIComponent(cacheName)
  await del(`/system/cache/clear/${encodedName}`)
}

/**
 * 清空所有缓存
 * @returns 清除的缓存数量
 */
export async function clearAllCache(): Promise<number> {
  return del('/system/cache/clearAll')
}