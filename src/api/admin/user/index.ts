/**
 * 用户管理 API
 * 对接后端 SysUserController 接口
 * 支持用户CRUD、状态切换、角色管理
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
 * 查询用户关联的角色ID列表
 *
 * @param userId - 用户ID
 * @returns 角色ID列表
 */
export async function getUserRoles(userId: string): Promise<string[]> {
  return get(`/system/user/${userId}/roles`)
}

/**
 * 绑定用户角色（追加角色）
 * 为用户追加绑定角色，已存在的角色不会重复绑定
 *
 * @param userId - 用户ID
 * @param roleIds - 角色ID列表
 */
export async function bindUserRoles(userId: string, roleIds: string[]): Promise<void> {
  return post(`/system/user/${userId}/roles`, roleIds as unknown as Record<string, unknown>)
}

/**
 * 解绑用户角色（移除角色）
 *
 * @param userId - 用户ID
 * @param roleIds - 要移除的角色ID列表
 */
export async function unbindUserRoles(userId: string, roleIds: string[]): Promise<void> {
  return del(`/system/user/${userId}/roles`, undefined, {
    data: roleIds
  })
}

/**
 * 更新用户角色（全量替换角色）
 * 先清除所有现有角色，再绑定新角色
 *
 * @param userId - 用户ID
 * @param roleIds - 新的角色ID列表（全量）
 */
export async function updateUserRoles(userId: string, roleIds: string[]): Promise<void> {
  return put(`/system/user/${userId}/roles`, roleIds as unknown as Record<string, unknown>)
}
