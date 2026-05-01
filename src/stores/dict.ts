/**
 * 字典缓存 Store
 * 使用 Zustand 管理字典数据缓存，配合版本号实现增量更新
 */

import { create } from 'zustand'
import type { SysDictDataCache, DictCacheVO } from '@/types/dict.types'

/**
 * 字典缓存项（含版本号）
 */
interface DictCacheItem {
  version: number
  data: SysDictDataCache[]
}

/**
 * 字典 Store 状态接口
 */
interface DictStoreState {
  /** 内存缓存：键为 dictType，值为缓存数据 */
  cache: Record<string, DictCacheItem>

  /**
   * 获取指定类型的字典数据
   *
   * @param dictType - 字典类型编码
   * @returns 字典数据列表，不存在则返回空数组
   */
  getDictData: (dictType: string) => SysDictDataCache[]

  /**
   * 获取指定类型的缓存版本号
   *
   * @param dictType - 字典类型编码
   * @returns 版本号，不存在则返回 0
   */
  getVersion: (dictType: string) => number

  /**
   * 设置缓存数据
   *
   * @param dictType - 字典类型编码
   * @param cacheVO - 带版本号的缓存数据
   */
  setCache: (dictType: string, cacheVO: DictCacheVO) => void

  /**
   * 批量设置缓存数据（用于一次性加载全部）
   *
   * @param allCache - 全部字典缓存数据
   */
  setBatchCache: (allCache: Record<string, DictCacheVO>) => void

  /**
   * 清除指定类型的缓存
   *
   * @param dictType - 字典类型编码
   */
  removeCache: (dictType: string) => void

  /**
   * 清除所有缓存
   */
  clearAllCache: () => void
}

export const useDictStore = create<DictStoreState>((set, get) => ({
  cache: {},

  getDictData: (dictType: string) => {
    const state = get()
    const data = state.cache[dictType]?.data
    if (!data) return []
    return [...data].sort((a, b) => Number(a.dictSort) - Number(b.dictSort))
  },

  getVersion: (dictType: string) => {
    const state = get()
    return state.cache[dictType]?.version || 0
  },

  setCache: (dictType: string, cacheVO: DictCacheVO) => {
    set((state) => ({
      cache: {
        ...state.cache,
        [dictType]: {
          version: cacheVO.version,
          data: cacheVO.data,
        },
      },
    }))
  },

  setBatchCache: (allCache: Record<string, DictCacheVO>) => {
    set((state) => {
      const newCache = { ...state.cache }
      Object.entries(allCache).forEach(([dictType, cacheVO]) => {
        newCache[dictType] = {
          version: cacheVO.version,
          data: cacheVO.data,
        }
      })
      return { cache: newCache }
    })
  },

  removeCache: (dictType: string) => {
    set((state) => {
      const newCache = { ...state.cache }
      delete newCache[dictType]
      return { cache: newCache }
    })
  },

  clearAllCache: () => {
    set({ cache: {} })
  },
}))

/**
 * 根据字典值获取标签文本（纯函数，供表格渲染使用）
 *
 * @param dictType - 字典类型编码
 * @param value - 字典值（对应 dictValue）
 * @param fallback - 未找到时的默认值
 * @returns 字典标签文本
 *
 * @example
 * getDictLabel('sys_user_sex', '0') // '男'
 */
export function getDictLabel(dictType: string, value: string | number, fallback = '-'): string {
  const data = useDictStore.getState().getDictData(dictType)
  const strValue = String(value)
  const item = data.find((d) => String(d.dictValue) === strValue)
  return item?.dictLabel ?? fallback
}

/**
 * 根据字典值获取颜色样式（纯函数，供表格 Chip 使用）
 *
 * @param dictType - 字典类型编码
 * @param value - 字典值
 * @param fallback - 未找到时的默认颜色
 * @returns HeroUI Chip 颜色
 */
export function getDictColor(
  dictType: string,
  value: string | number,
  fallback: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' = 'default'
): 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' {
  const data = useDictStore.getState().getDictData(dictType)
  const strValue = String(value)
  const item = data.find((d) => String(d.dictValue) === strValue)
  if (!item?.listClass) return fallback
  const validColors: ('default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger')[] = [
    'default',
    'primary',
    'secondary',
    'success',
    'warning',
    'danger',
  ]
  return validColors.includes(item.listClass as never)
    ? (item.listClass as 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger')
    : fallback
}
