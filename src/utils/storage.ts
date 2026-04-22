import Cookies from 'js-cookie'

/**
 * 存储工具函数
 * 封装 localStorage、sessionStorage 和 Cookie 操作
 */
// 存储类型
type StorageType = 'local' | 'session' | 'cookie'
function getStorageInstance(type: StorageType): Storage | null {
  if (typeof window === 'undefined') return null
  if (type === 'cookie') return null // Cookie 不使用 Storage 接口
  return type === 'local' ? window.localStorage : window.sessionStorage
}

/**
 * 设置存储
 * @param key - 存储键名
 * @param value - 存储值
 * @param type - 存储类型，默认 'local'
 * @param options - Cookie 配置选项 (仅 type='cookie' 时有效)
 */
export function setStorage<T>(
  key: string,
  value: T,
  type: StorageType = 'local',
  options?: Cookies.CookieAttributes
): void {
  if (type === 'cookie') {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value)
    // 不主动设置 expires，过期时间由后端通过 Set-Cookie 头管理
    Cookies.set(key, serialized, {
      path: '/',
      sameSite: 'lax',
      ...options
    })
    return
  }

  const storage = getStorageInstance(type)
  if (!storage) return

  try {
    const serialized = JSON.stringify(value)
    storage.setItem(key, serialized)
  } catch (error) {
    console.error('存储设置失败：', error)
  }
}

/**
 * 获取存储
 * @param key - 存储键名
 * @param defaultValue - 默认值
 * @param type - 存储类型，默认 'local'
 * @returns 存储值或默认值
 */
export function getStorageValue<T>(
  key: string,
  defaultValue?: T,
  type: StorageType = 'local'
): T | undefined {
  if (type === 'cookie') {
    const item = Cookies.get(key)
    if (item === undefined) return defaultValue
    try {
      return JSON.parse(item) as T
    } catch {
      return item as unknown as T
    }
  }

  const storage = getStorageInstance(type)
  if (!storage) return defaultValue
  try {
    const item = storage.getItem(key)
    if (item === null) return defaultValue
    return JSON.parse(item) as T
  } catch (error) {
    console.error('存储读取失败：', error)
    return defaultValue
  }
}

/**
 * 移除存储
 * @param key - 存储键名
 * @param type - 存储类型，默认 'local'
 */
export function removeStorage(key: string, type: StorageType = 'local'): void {
  if (type === 'cookie') {
    Cookies.remove(key)
    return
  }
  const storage = getStorageInstance(type)
  if (!storage) return
  storage.removeItem(key)
}

/**
 * 清空存储
 * @param type - 存储类型，默认 'local'
 */
export function clearStorage(type: StorageType = 'local'): void {
  const storage = getStorageInstance(type)
  if (!storage) return
  storage.clear()
}

/**
 * 检查存储是否存在
 * @param key - 存储键名
 * @param type - 存储类型，默认 'local'
 * @returns 是否存在
 */
export function hasStorage(key: string, type: StorageType = 'local'): boolean {
  const storage = getStorageInstance(type)
  if (!storage) return false
  return storage.getItem(key) !== null
}

/**
 * 获取存储大小（字节）
 * @param type - 存储类型，默认 'local'
 * @returns 存储大小
 */
export function getStorageSize(type: StorageType = 'local'): number {
  const storage = getStorageInstance(type)
  if (!storage) return 0
  let size = 0
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i)
    if (key) {
      const value = storage.getItem(key)
      if (value) {
        size += key.length + value.length
      }
    }
  }
  return size * 2 // UTF-16 编码，每个字符 2 字节
}
// 应用配置存储键名
export const STORAGE_KEYS = {
  /** 用户 Token（与后端设置的 Cookie 名称一致） */
  TOKEN: 'access_token',
  /** 用户信息 */
  USER_INFO: 'zsk_user_info',
  /** 用户统计数据 */
  USER_STATS: 'zsk_user_stats',
  /** 应用设置 */
  APP_SETTINGS: 'zsk_app_settings',
  /** 侧边栏状态 */
  SIDEBAR_STATE: 'zsk_sidebar_state',
  /** 最近搜索 */
  RECENT_SEARCH: 'zsk_recent_search',
  /** 菜单缓存 */
  MENU_CACHE: 'zsk_menu_cache',
} as const
