/**
 * 字典缓存管理 Hook
 * 提供自动版本检测与缓存刷新功能
 *
 * 策略：
 * - 登录时：一次性获取全部字典数据（/cache/all），存入内存缓存
 * - 使用时：通过 useDict 按需校验版本，版本一致直接用缓存，不一致再请求
 */

// ===== 1. 依赖导入区域 =====
import { useState, useCallback, useEffect, useRef } from 'react'
import { useDictStore } from '@/stores/dict'
import {
  getDictCacheVersion,
  getDictCacheByTag,
  getDictCacheAll,
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
 * 1. 检查本地是否有缓存数据（登录时已通过 useDictAll 加载）
 * 2. 对比本地缓存版本号与服务端版本号
 * 3. 版本一致：直接使用缓存，不请求
 * 4. 版本不一致：拉取最新数据并更新缓存
 * 5. 返回本地缓存数据
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

      // 版本一致时直接使用缓存，不请求
      if (serverVersion === localVersion && localVersion > 0) {
        return
      }

      // 版本不一致时拉取最新数据
      const cacheVO = await getDictCacheByTag(dictType)
      setCache(dictType, cacheVO)
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
 * 批量加载所有字典数据
 * 适用于应用初始化时一次性加载全部字典
 *
 * 工作流程：
 * 1. 调用 /cache/all 接口获取全部字典数据（带版本号）
 * 2. 批量存入内存缓存
 * 3. 后续组件使用 useDict 时只需校验版本，版本一致不请求
 *
 * @returns 加载函数
 *
 * @example
 * const loadAll = useDictAll()
 *
 * // 应用启动时调用（一次性加载全部）
 * useEffect(() => {
 *   loadAll()
 * }, [])
 */
export function useDictAll() {
  const [loading, setLoading] = useState(false)
  const { cache, setBatchCache } = useDictStore()

  const loadAll = useCallback(async () => {
    // 如果缓存已有数据，不再重复请求
    if (Object.keys(cache).length > 0) return

    setLoading(true)
    try {
      // 一次性获取全部字典数据（带版本号）
      const allCacheData: Record<string, DictCacheVO> = await getDictCacheAll()
      setBatchCache(allCacheData)
    } catch (error) {
      console.error('批量加载字典缓存失败：', error)
    } finally {
      setLoading(false)
    }
  }, [setBatchCache, cache])

  return { loadAll, loading }
}
