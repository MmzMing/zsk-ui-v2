/**
 * 角色管理 API
 * 对接后端 SysRoleController 接口
 * 支持角色CRUD、权限管理、用户关联
 */

import { get, post, put, del } from '../../request'
import type {
  SysRole,
  SysRoleQueryParams,
  SysRoleCreateInput,
  SysRoleUpdateInput,
  RoleMenuBindInput,
  RoleUserBindInput,
  RoleCopyInput
} from '@/types/role.types'

/**
 * 获取角色列表（支持条件查询）
 * 后端一次性返回全量数据，前端本地分页
 *
 * @param params - 查询参数
 * @returns 角色列表数据
 */
export async function getRoleList(params?: SysRoleQueryParams): Promise<SysRole[]> {
  return get('/system/role/list', params as unknown as Record<string, unknown>)
}

/**
 * 根据ID获取角色详情
 *
 * @param id - 角色ID
 * @returns 角色详情
 */
export async function getRoleById(id: string): Promise<SysRole> {
  return get(`/system/role/${id}`)
}

/**
 * 新增角色
 *
 * @param data - 角色数据
 */
export async function createRole(data: SysRoleCreateInput): Promise<void> {
  return post('/system/role', data as unknown as Record<string, unknown>)
}

/**
 * 修改角色
 *
 * @param data - 角色数据（必须包含id）
 */
export async function updateRole(data: SysRoleUpdateInput): Promise<void> {
  return put('/system/role', data as unknown as Record<string, unknown>)
}

/**
 * 删除角色（支持批量）
 * 多个ID用逗号分隔
 *
 * @param ids - 角色ID列表，多个用逗号分隔
 */
export async function deleteRole(ids: string): Promise<void> {
  return del(`/system/role/${ids}`)
}

/**
 * 批量复制角色
 *
 * @param data - 包含要复制的角色ID列表
 */
export async function copyRole(data: RoleCopyInput): Promise<void> {
  return post('/system/role/copy', data as unknown as Record<string, unknown>)
}

/**
 * 查看角色权限
 * 返回角色已关联的菜单ID列表
 *
 * @param roleId - 角色ID
 * @returns 菜单ID列表
 */
export async function getRoleMenus(roleId: string): Promise<string[]> {
  return get(`/system/role/${roleId}/menus`)
}

/**
 * 绑定角色权限（追加）
 * 为角色追加菜单权限，已存在的菜单不会重复绑定
 *
 * @param roleId - 角色ID
 * @param data - 包含要绑定的菜单ID列表
 */
export async function bindRoleMenus(roleId: string, data: RoleMenuBindInput): Promise<void> {
  return post(`/system/role/${roleId}/menus`, data as unknown as Record<string, unknown>)
}

/**
 * 解绑角色权限
 * 移除角色的指定菜单权限
 *
 * @param roleId - 角色ID
 * @param data - 包含要解绑的菜单ID列表
 */
export async function unbindRoleMenus(roleId: string, data: RoleMenuBindInput): Promise<void> {
  return del(`/system/role/${roleId}/menus`, data as unknown as Record<string, unknown>)
}

/**
 * 更新角色权限（全量替换）
 * 先删除原有权限再绑定新权限
 *
 * @param roleId - 角色ID
 * @param data - 包含新的菜单ID列表（全量）
 */
export async function updateRoleMenus(roleId: string, data: RoleMenuBindInput): Promise<void> {
  return put(`/system/role/${roleId}/menus`, data as unknown as Record<string, unknown>)
}

/**
 * 查看角色用户
 * 返回角色已关联的用户ID列表
 *
 * @param roleId - 角色ID
 * @returns 用户ID列表
 */
export async function getRoleUsers(roleId: string): Promise<string[]> {
  return get(`/system/role/${roleId}/users`)
}

/**
 * 绑定角色用户（追加）
 * 为角色追加用户，已存在的用户不会重复绑定
 *
 * @param roleId - 角色ID
 * @param data - 包含要绑定的用户ID列表
 */
export async function bindRoleUsers(roleId: string, data: RoleUserBindInput): Promise<void> {
  return post(`/system/role/${roleId}/users`, data as unknown as Record<string, unknown>)
}

/**
 * 解绑角色用户
 * 移除角色的指定用户
 *
 * @param roleId - 角色ID
 * @param data - 包含要解绑的用户ID列表
 */
export async function unbindRoleUsers(roleId: string, data: RoleUserBindInput): Promise<void> {
  return del(`/system/role/${roleId}/users`, data as unknown as Record<string, unknown>)
}

/**
 * 更新角色用户（全量替换）
 * 先删除原有用户再绑定新用户
 *
 * @param roleId - 角色ID
 * @param data - 包含新的用户ID列表（全量）
 */
export async function updateRoleUsers(roleId: string, data: RoleUserBindInput): Promise<void> {
  return put(`/system/role/${roleId}/users`, data as unknown as Record<string, unknown>)
}
