import { get, post } from './request'
import type { 
  LoginParams, 
  LoginResult, 
  RegisterParams,
  CaptchaResult,
  PublicKeyResult
} from '@/types'

/**
 * 认证管理接口
 * 默认前缀：/auth
 */

/** 用户注册 */
export function register(data: RegisterParams) {
  return post<null>('/auth/register', data as unknown as Record<string, unknown>)
}

/** 用户登录 */
export function login(data: LoginParams) {
  return post<LoginResult>('/auth/login', data as unknown as Record<string, unknown>)
}

/** 刷新令牌 */
export function refreshToken() {
  return post<null>('/auth/refresh')
}

/** 退出登录 */
export function logout() {
  return post<null>('/auth/logout')
}

/** 获取滑块拼图验证码 */
export function getCaptcha() {
  return get<CaptchaResult>('/auth/captcha')
}

/** 校验滑块验证码 */
export function checkCaptcha(data: { uuid: string; code: string }) {
  return post<string>('/auth/captcha/check', data)
}

/** 获取 RSA 公钥 */
export function getPublicKey() {
  return get<PublicKeyResult>('/auth/public-key')
}

/** 发送邮箱验证码 */
export function sendEmailCode(params: { email: string; captchaVerification: string }) {
  return post<null>('/auth/email/code', undefined, { params })
}

/** 获取第三方登录授权 URL */
export function getThirdPartyUrl(loginType: string) {
  return get<string>('/auth/third-party/url', { loginType })
}

/** 第三方登录回调 */
export function thirdPartyCallback(params: { loginType: string; code: string; state: string }) {
  return post<LoginResult>('/auth/third-party/callback', undefined, { params })
}

/** 根据用户名发送邮箱验证码 */
export function sendEmailCodeByUsername(params: { username: string; captchaVerification: string }) {
  return post<null>('/auth/email/code/username', undefined, { params })
}

/** 发送密码重置验证码 */
export function sendPasswordResetCode(params: { email: string; captchaVerification: string }) {
  return post<null>('/auth/password/reset/code', undefined, { params })
}

/** 验证重置验证码 */
export function verifyResetCode(params: { email: string; code: string }) {
  return post<string>('/auth/password/reset/verify', undefined, { params })
}

/** 重置密码 */
export function resetPassword(params: { email: string; verifyToken: string; newPassword: string }) {
  return post<null>('/auth/password/reset', undefined, { params })
}
