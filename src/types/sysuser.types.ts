/**
 * 系统用户管理类型定义
 * 对接后端 SysUserController 接口
 * 与 user.types.ts 中的认证类型区分，专用于后台用户管理
 */

/**
 * 用户状态
 * 0 - 正常
 * 1 - 停用
 */
export type UserStatus = '0' | '1'

/**
 * 用户性别（后端返回数字格式）
 */
export type UserSexValue = '0' | '1' | '2'

/**
 * 用户性别显示值
 */
export type UserSex = '男' | '女' | '未知'

/**
 * 系统用户数据结构
 * 匹配后端实际返回的字段
 */
export interface SysUser {
  /** 用户ID */
  id: string
  /** 用户名 */
  userName: string
  /** 昵称 */
  nickName: string
  /** 邮箱 */
  email?: string
  /** 手机号 */
  phonenumber?: string
  /** 性别（后端返回：0-男，1-女，2-未知） */
  sex?: UserSexValue
  /** 头像URL */
  avatar?: string
  /** 用户状态（0-正常，1-停用） */
  status: UserStatus
  /** 创建时间 */
  createTime?: string
  /** 更新时间 */
  updateTime?: string
  /** 创建人 */
  createName?: string
  /** 更新人 */
  updateName?: string
  /** 租户ID */
  tenantId?: string
  /** 用户类型 */
  userType?: string
  /** 登录IP */
  loginIp?: string
  /** 年龄 */
  age?: number
  /** 简介 */
  bio?: string
  /** 备注 */
  remark?: string
}

/**
 * 用户查询参数
 */
export interface SysUserQueryParams {
  /** 用户名（模糊查询） */
  userName?: string
  /** 昵称（模糊查询） */
  nickName?: string
  /** 邮箱（模糊查询） */
  email?: string
  /** 手机号（模糊查询） */
  phonenumber?: string
  /** 用户状态 */
  status?: UserStatus
  /** 页码，默认1 */
  pageNum?: number
  /** 每页大小，默认10 */
  pageSize?: number
}

/**
 * 新增用户输入参数
 */
export interface SysUserCreateInput {
  /** 用户名 */
  userName: string
  /** 昵称 */
  nickName: string
  /** 邮箱 */
  email?: string
  /** 手机号 */
  phonenumber?: string
  /** 性别（0-男，1-女，2-未知） */
  sex?: UserSexValue
  /** 头像URL */
  avatar?: string
  /** 用户状态，默认0（正常） */
  status?: UserStatus
  /** 年龄 */
  age?: number
  /** 简介 */
  bio?: string
  /** 备注 */
  remark?: string
}

/**
 * 修改用户输入参数
 */
export interface SysUserUpdateInput {
  /** 用户ID */
  id: string
  /** 昵称 */
  nickName?: string
  /** 邮箱 */
  email?: string
  /** 手机号 */
  phonenumber?: string
  /** 性别（0-男，1-女，2-未知） */
  sex?: UserSexValue
  /** 头像URL */
  avatar?: string
  /** 用户状态 */
  status?: UserStatus
  /** 年龄 */
  age?: number
  /** 简介 */
  bio?: string
  /** 备注 */
  remark?: string
}

/**
 * 切换用户状态请求参数
 */
export interface UserStatusToggleInput {
  /** 状态值 */
  status: UserStatus
}

/**
 * 用户列表分页响应数据
 * 后端返回的实际数据格式
 */
export interface SysUserPageData {
  /** 用户列表 */
  list: SysUser[]
  /** 总条数 */
  total: string
  /** 当前页码 */
  pageNum: string
  /** 每页大小 */
  pageSize: string
  /** 总页数 */
  totalPages: string
  /** 是否有下一页 */
  hasNext: boolean
  /** 是否有上一页 */
  hasPrevious: boolean
}

