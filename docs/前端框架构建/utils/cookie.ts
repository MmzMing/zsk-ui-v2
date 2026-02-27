// ===== 1. 依赖导入区域 =====
import Cookies from 'js-cookie'

// ===== 2. TODO待处理导入区域 =====
// 暂无

// ===== 3. 状态控制逻辑区域 =====
// Cookie 配置常量
const COOKIE_CONFIG = {
  TOKEN_KEY: 'access_token',
  REFRESH_TOKEN_KEY: 'refresh_token',
  USER_INFO_KEY: 'user_info',
  REMEMBER_KEY: 'remember_me',
  // Cookie 默认配置
  DEFAULT_OPTIONS: {
    path: '/',
    secure: import.meta.env.PROD, // 生产环境使用 secure
    sameSite: 'strict' as const
  }
} as const

// ===== 4. 通用工具函数区域 =====
/**
 * 获取访问令牌
 * @returns 访问令牌或 undefined
 */
export function getToken(): string | undefined {
  return Cookies.get(COOKIE_CONFIG.TOKEN_KEY)
}

/**
 * 设置访问令牌
 * @param token 访问令牌
 * @param expiresIn 过期时间（秒）
 */
export function setToken(token: string, expiresIn: number = 7200): void {
  const expires = new Date(Date.now() + expiresIn * 1000)
  Cookies.set(COOKIE_CONFIG.TOKEN_KEY, token, {
    ...COOKIE_CONFIG.DEFAULT_OPTIONS,
    expires
  })
}

/**
 * 移除访问令牌
 */
export function removeToken(): void {
  Cookies.remove(COOKIE_CONFIG.TOKEN_KEY, { path: '/' })
}

/**
 * 获取刷新令牌
 * @returns 刷新令牌或 undefined
 */
export function getRefreshToken(): string | undefined {
  return Cookies.get(COOKIE_CONFIG.REFRESH_TOKEN_KEY)
}

/**
 * 设置刷新令牌
 * @param token 刷新令牌
 * @param expiresIn 过期时间（秒），默认7天
 */
export function setRefreshToken(token: string, expiresIn: number = 604800): void {
  const expires = new Date(Date.now() + expiresIn * 1000)
  Cookies.set(COOKIE_CONFIG.REFRESH_TOKEN_KEY, token, {
    ...COOKIE_CONFIG.DEFAULT_OPTIONS,
    expires
  })
}

/**
 * 移除刷新令牌
 */
export function removeRefreshToken(): void {
  Cookies.remove(COOKIE_CONFIG.REFRESH_TOKEN_KEY, { path: '/' })
}

/**
 * 获取用户信息
 * @returns 用户信息对象或 null
 */
export function getUserInfo<T = Record<string, unknown>>(): T | null {
  const userInfo = Cookies.get(COOKIE_CONFIG.USER_INFO_KEY)
  if (!userInfo) return null
  try {
    return JSON.parse(userInfo) as T
  } catch {
    return null
  }
}

/**
 * 设置用户信息
 * @param userInfo 用户信息对象
 * @param expiresIn 过期时间（秒）
 */
export function setUserInfo<T extends Record<string, unknown>>(userInfo: T, expiresIn: number = 7200): void {
  const expires = new Date(Date.now() + expiresIn * 1000)
  Cookies.set(COOKIE_CONFIG.USER_INFO_KEY, JSON.stringify(userInfo), {
    ...COOKIE_CONFIG.DEFAULT_OPTIONS,
    expires
  })
}

/**
 * 移除用户信息
 */
export function removeUserInfo(): void {
  Cookies.remove(COOKIE_CONFIG.USER_INFO_KEY, { path: '/' })
}

/**
 * 获取记住我状态
 * @returns 是否记住我
 */
export function getRememberMe(): boolean {
  return Cookies.get(COOKIE_CONFIG.REMEMBER_KEY) === 'true'
}

/**
 * 设置记住我状态
 * @param remember 是否记住我
 */
export function setRememberMe(remember: boolean): void {
  Cookies.set(COOKIE_CONFIG.REMEMBER_KEY, String(remember), {
    ...COOKIE_CONFIG.DEFAULT_OPTIONS,
    expires: 30 // 记住我状态保存30天
  })
}

/**
 * 清除所有认证相关的 Cookie
 */
export function clearAuthCookies(): void {
  removeToken()
  removeRefreshToken()
  removeUserInfo()
  Cookies.remove(COOKIE_CONFIG.REMEMBER_KEY, { path: '/' })
}

// ===== 5. 注释代码函数区 =====
// 暂无

// ===== 6. 错误处理函数区域 =====
// 暂无

// ===== 7. 数据处理函数区域 =====
// 暂无

// ===== 8. UI渲染逻辑区域 =====
// 暂无

// ===== 9. 页面初始化与事件绑定 =====
// 暂无

// ===== 10. TODO任务管理区域 =====
// TODO: 根据需求调整 Cookie 过期时间

// ===== 11. 导出区域 =====
export { COOKIE_CONFIG }
