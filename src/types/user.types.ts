/**
 * 用户相关类型定义
 */

// 用户角色类型
export type UserRole = 'admin' | 'user' | 'guest'

// 用户基础信息
export interface UserInfo {
  /** 用户 ID */
  id: string
  /** 用户名 */
  name: string
  /** 邮箱 */
  email: string
  /** 头像地址 */
  avatar?: string
  /** 用户角色 */
  role: UserRole
  /** 权限列表 */
  permissions?: string[]
  /** 用户状态 */
  status: 'active' | 'inactive' | 'banned'
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt: string
}

// 登录请求参数
export interface LoginParams {
  /** 用户名 */
  username?: string
  /** 密码 */
  password?: string
  /** 验证码 */
  code?: string
  /** 唯一标识 */
  uuid?: string
  /** 登录类型 */
  loginType?: string
  /** 邮箱 */
  email?: string
  /** 邮箱验证码 */
  emailCode?: string
  /** 授权码 */
  authCode?: string
  /** 状态码 */
  state?: string
}

// 登录响应数据
export interface LoginResult {
  /** 访问令牌 */
  accessToken: string
  /** 刷新令牌 */
  refreshToken: string
  /** 令牌类型 */
  tokenType: string
  /** 过期时间（秒） */
  expiresIn: number
  /** 用户 ID */
  userId: number
  /** 用户名 */
  username: string
  /** 昵称 */
  nickname: string
  /** 头像地址 */
  avatar?: string
}

// 注册请求参数
export interface RegisterParams {
  /** 用户名 */
  username: string
  /** 邮箱 */
  email: string
  /** 密码 */
  password: string
  /** 确认密码 */
  confirmPassword: string
  /** 验证码 */
  code: string
  /** 唯一标识 */
  uuid: string
  /** 用户类型 */
  userType?: string
}

/** 验证码响应数据 */
export interface CaptchaResult {
  /** 唯一标识 */
  uuid: string
  /** 背景图片 URL */
  bgUrl: string
  /** 拼图图片 URL */
  puzzleUrl: string
  /** 纵坐标 */
  y: number
}

/** RSA 公钥响应数据 */
export interface PublicKeyResult {
  /** 公钥内容 */
  publicKey: string
  /** 过期时间 */
  keyExpire: number
  /** 密钥版本 */
  keyVersion: string
}

/** 魔法链接请求参数 */
export interface MagicLinkRequest {
  /** 邮箱地址 */
  email: string
  /** Cloudflare Turnstile人机校验Token（前端从Turnstile组件获取） */
  turnstileToken: string
}

/** Turnstile 人机校验响应数据 */
export interface TurnstileResult {
  /** 校验凭证Token */
  verifyToken: string
}

// Token 信息
export interface TokenInfo {
  /** 访问令牌 */
  accessToken: string
  /** 刷新令牌 */
  refreshToken: string
  /** 过期时间戳 */
  expiresAt: number
}
