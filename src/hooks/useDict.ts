/**
 * 字典缓存管理 Hook
 * 提供自动版本检测与缓存刷新功能
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import { useDictStore } from '@/stores/dict'
import {
  getDictCacheVersion,
  getDictCacheByTag,
  getDictCacheTags,
} from '@/api/admin/dict'
import type { SysDictDataCache, DictCacheVO } from '@/types/dict.types'

/**
 * 字典 Hook 返回值
 */
interface UseDictReturn {
  /** 字典数据列表 */
  data: SysDictDataCache[]

  /** 是否正在加载 */
  loading: boolean

  /** 手动刷新缓存 */
  refresh: () => Promise<void>

  /** 清除本地缓存 */
  clearCache: () => void
}

/**
 * 获取指定字典类型的数据（自动版本检测）
 *
 * 工作流程：
 * 1. 获取服务端当前版本号
 * 2. 对比本地缓存版本号
 * 3. 若版本不一致，拉取最新数据并更新缓存
 * 4. 返回本地缓存数据
 *
 * @param dictType - 字典类型编码
 * @returns 字典数据、加载状态、刷新方法
 *
 * @example
 * const { data, loading, refresh } = useDict('sys_user_sex')
 *
 * // 在 Select 中使用
 * <Select>
 *   {data.map(item => (
 *     <SelectOption key={item.dictValue} value={item.dictValue}>
 *       {item.dictLabel}
 *     </SelectOption>
 *   ))}
 * </Select>
 */
export function useDict(dictType: string): UseDictReturn {
  const [loading, setLoading] = useState(false)
  const initializedRef = useRef(false)

  const { getDictData, getVersion, setCache, removeCache } = useDictStore()

  /**
   * 刷新指定字典类型的缓存
   */
  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      // 获取服务端版本号
      const serverVersion = await getDictCacheVersion(dictType)

      // 获取本地缓存版本号
      const localVersion = getVersion(dictType)

      // 版本不一致时拉取最新数据
      if (serverVersion > localVersion) {
        const cacheVO = await getDictCacheByTag(dictType)
        setCache(dictType, cacheVO)
      }
    } catch (error) {
      console.error(`字典缓存刷新失败 [${dictType}]：`, error)
    } finally {
      setLoading(false)
    }
  }, [dictType, getVersion, setCache])

  /**
   * 清除本地缓存
   */
  const clearCache = useCallback(() => {
    removeCache(dictType)
  }, [dictType, removeCache])

  // 组件挂载时自动执行版本比对
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true
      refresh()
    }
  }, [refresh])

  return {
    data: getDictData(dictType),
    loading,
    refresh,
    clearCache,
  }
}

/**
 * 批量加载所有字典缓存
 * 适用于应用初始化时一次性加载全部字典
 *
 * 工作流程：
 * 1. 获取服务端全部版本标签列表
 * 2. 对比每个字典类型的本地缓存版本号
 * 3. 仅拉取版本更新的字典数据
 * 4. 批量更新缓存
 *
 * @returns 加载函数
 *
 * @example
 * const loadAll = useDictAll()
 *
 * // 应用启动时调用
 * useEffect(() => {
 *   loadAll()
 * }, [])
 */
export function useDictAll() {
  const [loading, setLoading] = useState(false)
  const { setBatchCache, getVersion, setCache } = useDictStore()

  const loadAll = useCallback(async () => {
    setLoading(true)
    try {
      // 获取服务端全部版本标签列表
      const tags = await getDictCacheTags()

      // 收集需要更新的字典类型（版本不一致的）
      const needUpdate: string[] = []
      for (const tag of tags) {
        const serverVersion = await getDictCacheVersion(tag)
        const localVersion = getVersion(tag)
        if (serverVersion > localVersion) {
          needUpdate.push(tag)
        }
      }

      // 仅拉取需要更新的字典数据
      const updatePromises = needUpdate.map(async (tag) => {
        const cacheVO = await getDictCacheByTag(tag)
        return { tag, cacheVO } as { tag: string; cacheVO: DictCacheVO }
      })

      const results = await Promise.all(updatePromises)

      // 批量更新缓存
      const allCache: Record<string, DictCacheVO> = {}
      results.forEach(({ tag, cacheVO }) => {
        allCache[tag] = cacheVO
      })
      setBatchCache(allCache)
    } catch (error) {
      console.error('批量加载字典缓存失败：', error)
    } finally {
      setLoading(false)
    }
  }, [getVersion, setBatchCache, setCache])

  return { loadAll, loading }
}
