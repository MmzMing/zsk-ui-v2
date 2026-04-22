/**
 * 在线用户类型定义
 *
 * 对接后端：
 *   /api/system/login/online/page          分页查询在线用户（用户维度）
 *   /api/system/login/online/forceLogout   按 userId 批量强制下线
 *
 * 设计说明：
 *   - 一用户一条记录（合并多设备会话），通过 deviceCount 反映同时在线设备数
 *   - 在线判定与续期机制完全在后端 + Redis 完成，前端无需主动续期
 */

// ===== 1. 实体定义 =====

/** 帐号状态：'0' 正常 / '1' 停用（后端使用字符串） */
export type OnlineUserStatus = '0' | '1'

/**
 * 在线用户实体
 * 来源：GET /api/system/login/online/page
 */
export interface OnlineUser {
  /** 用户ID */
  userId: number
  /** 用户账号 */
  userName: string
  /** 用户昵称 */
  nickName: string
  /** 用户头像 URL */
  avatar?: string
  /** 用户邮箱 */
  email?: string
  /** 帐号状态（0正常 1停用） */
  status: OnlineUserStatus
  /** 最后登录IP */
  ipaddr: string
  /** 登录地点 */
  loginLocation: string
  /** 最近登录时间（yyyy-MM-dd HH:mm:ss） */
  loginTime: string
  /** Token 过期时间（来自 Redis TTL，每次请求滑动续期） */
  expireTime: string
  /** 在线时长（秒，从最近登录时间计算） */
  onlineDuration: number
  /** 当前在线设备数（同一用户多端登录数） */
  deviceCount: number
}

// ===== 2. 查询参数 =====

/**
 * 在线用户分页查询参数
 * 对应 GET /api/system/login/online/page
 */
export interface OnlineUserQueryParams {
  /** 页码，默认 1 */
  pageNum?: number
  /** 每页大小，默认 10，最大 500 */
  pageSize?: number
  /** 排序字段 */
  orderByColumn?: string
  /** 排序方向（asc/desc），默认 asc */
  isAsc?: 'asc' | 'desc'
  /** 用户账号（模糊查询） */
  userName?: string
  /** 用户昵称（模糊查询） */
  nickName?: string
  /** 登录IP（模糊查询） */
  ipaddr?: string
}

// ===== 3. 分页响应 =====

/** 在线用户分页响应数据 */
export interface OnlineUserPageData {
  list: OnlineUser[]
  total: number
  pageNum: number
  pageSize: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

// ===== 4. 强制下线 =====

/**
 * 强制下线请求体
 * 对应 POST /api/system/login/online/forceLogout
 */
export interface ForceLogoutRequest {
  /** 用户ID列表（一次踢掉所有设备） */
  userIds: number[]
}
