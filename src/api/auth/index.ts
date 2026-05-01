import { get, post } from '../request'
import type { LoginResult, MagicLinkRequest } from '@/types'

/**
 * 用户信息
 *
 * SysUserApi
 */
export interface SysUserApi {
  id?: string
  avatar?: string
  avatarId?: string
  deleted?: number
  email?: string
  loginDate?: string
  loginIp?: string
  nickName?: string
  password?: string
  phonenumber?: string
  remark?: string
  sex?: string
  status?: string
  tenantId?: number
  userName?: string
  userType?: string
  age?: number
  bio?: string
}

/**
 * 用户信息
 *
 * SysUser
 */
export interface SysUser {
  id?: string
  avatar?: string
  avatarId?: string
  deleted?: number
  email?: string
  loginDate?: string
  loginIp?: string
  nickName?: string
  password?: string
  phonenumber?: string
  remark?: string
  sex?: string
  status?: string
  tenantId?: number
  userName?: string
  userType?: string
  age?: number
  bio?: string
}

/**
 * 登录用户信息
 *
 * LoginUser
 */
export interface LoginUser {
  permissions?: string[]
  roles?: string[]
  sysUser?: SysUserApi
}

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

/** GitHub 登录回调 */
export function githubCallback(code: string, state: string) {
  return post<LoginResult>('/auth/github/callback', undefined, { params: { code, state } })
}

/** 微信登录回调 */
export function wechatCallback(code: string, state: string) {
  return post<LoginResult>('/auth/wechat/callback', undefined, { params: { code, state } })
}

/** QQ 登录回调 */
export function qqCallback(code: string, state: string) {
  return post<LoginResult>('/auth/qq/callback', undefined, { params: { code, state } })
}

/** 发送魔法链接 */
export function sendMagicLink(data: MagicLinkRequest) {
  return post<string>('/auth/magic-link/send', data as unknown as Record<string, unknown>)
}

/** 获取当前登录用户信息 */
export function getCurrentUser() {
  return get<LoginUser>('/system/user/current')
}
