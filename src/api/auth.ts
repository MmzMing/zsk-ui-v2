import { get, post } from './request'
import type { 
  LoginResult, 
  MagicLinkRequest,
  LoginUser
} from '@/types'

/**
 * 认证管理接口
 * 默认前缀：/auth
 */

/** 退出登录 */
export function logout() {
  return post<null>('/auth/logout')
}

/** 获取第三方登录授权 URL */
export function getThirdPartyUrl(loginType: string) {
  return get<string>('/auth/third-party/url', { loginType })
}

/** 第三方登录回调 */
export function thirdPartyCallback(params: { loginType: string; code: string; state: string }) {
  return post<LoginResult>('/auth/third-party/callback', undefined, { params })
}

/** 发送魔法链接 */
export function sendMagicLink(data: MagicLinkRequest) {
  return post<string>('/auth/magic-link/send', data as unknown as Record<string, unknown>)
}

/** 获取当前登录用户信息 */
export function getCurrentUser() {
  return get<LoginUser>('/system/user/current')
}
