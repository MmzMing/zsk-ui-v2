/**
 * 用户管理 API
 * 对接后端 SysUserController 接口
 * 支持用户CRUD、状态切换、密码重置
 *
 * 注意：getCurrentUser 已在 auth API 中导出，此处不再重复
 */

import { get, post, put, del } from '../../request'
import type {
  SysUser,
  SysUserQueryParams,
  SysUserCreateInput,
  SysUserUpdateInput,
  UserStatusToggleInput,
  SysUserPageData
} from '@/types/sysuser.types'

/**
 * 通过用户名获取用户详情
 *
 * @param username - 用户名
 * @returns 用户详情
 */
export async function getUserByUsername(username: string): Promise<SysUser> {
  return get(`/system/user/info/${username}`)
}

/**
 * 查询用户列表（分页）
 * 后端返回 Spring Data 分页格式
 *
 * @param params - 查询参数（含分页参数）
 * @returns 分页用户数据
 */
export async function getUserList(params?: SysUserQueryParams): Promise<SysUserPageData> {
  return get('/system/user/list', params as unknown as Record<string, unknown>)
}

/**
 * 根据ID获取用户详情
 *
 * @param id - 用户ID
 * @returns 用户详情
 */
export async function getUserById(id: string): Promise<SysUser> {
  return get(`/system/user/${id}`)
}

/**
 * 新增用户
 *
 * @param data - 用户数据
 */
export async function createUser(data: SysUserCreateInput): Promise<void> {
  return post('/system/user', data as unknown as Record<string, unknown>)
}

/**
 * 修改用户
 *
 * @param data - 用户数据（必须包含id）
 */
export async function updateUser(data: SysUserUpdateInput): Promise<void> {
  return put('/system/user', data as unknown as Record<string, unknown>)
}

/**
 * 切换用户状态（启用/停用）
 *
 * @param id - 用户ID
 * @param data - 状态切换参数
 */
export async function toggleUserStatus(id: string, data: UserStatusToggleInput): Promise<void> {
  return put(`/system/user/${id}/status`, data as unknown as Record<string, unknown>)
}

/**
 * 删除用户（支持批量）
 * 多个ID用逗号分隔
 *
 * @param ids - 用户ID列表，多个用逗号分隔
 */
export async function deleteUser(ids: string): Promise<void> {
  return del(`/system/user/${ids}`)
}

/**
 * 重置用户密码
 *
 * @param id - 用户ID
 */
export async function resetUserPassword(id: string): Promise<void> {
  return put(`/system/user/${id}/reset-password`)
}

/**
 * 批量重置用户密码
 *
 * @param ids - 用户ID列表，多个用逗号分隔
 */
export async function batchResetUserPassword(ids: string): Promise<void> {
  return put(`/system/user/${ids}/reset-password`)
}
