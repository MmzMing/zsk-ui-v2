/**
 * 菜单管理 API
 * 对接后端 SysMenuController 接口
 * 支持菜单树查询、菜单CRUD、批量更新排序
 */

import { get, post, put, del } from '../../request'
import type {
  SysMenu,
  SysMenuQueryParams,
  SysMenuCreateInput,
  SysMenuUpdateInput,
  SysMenuBatchUpdate
} from '@/types/menu.types'

/**
 * 获取菜单列表（支持条件查询）
 * @param params - 查询参数
 * @returns 菜单列表数据
 */
export async function getMenuList(params?: SysMenuQueryParams): Promise<SysMenu[]> {
  return get('/system/menu/list', params as unknown as Record<string, unknown>)
}

/**
 * 根据用户ID查询菜单树列表
 * @param userId - 用户ID
 * @returns 菜单树数据
 */
export async function getMenuTreeByUserId(userId: string): Promise<SysMenu[]> {
  return get(`/system/menu/user/${userId}`)
}

/**
 * 根据ID获取菜单详情
 * @param id - 菜单ID
 * @returns 菜单详情
 */
export async function getMenuById(id: string): Promise<SysMenu> {
  return get(`/system/menu/${id}`)
}

/**
 * 新增菜单
 * @param data - 菜单数据
 */
export async function createMenu(data: SysMenuCreateInput): Promise<void> {
  return post('/system/menu', data as unknown as Record<string, unknown>)
}

/**
 * 修改菜单
 * @param data - 菜单数据（必须包含id）
 */
export async function updateMenu(data: SysMenuUpdateInput): Promise<void> {
  return put('/system/menu', data as unknown as Record<string, unknown>)
}

/**
 * 批量更新菜单（用于拖拽排序等场景）
 * @param data - 批量更新数据列表
 */
export async function batchUpdateMenu(data: SysMenuBatchUpdate[]): Promise<void> {
  return put('/system/menu/batch', data as unknown as Record<string, unknown>)
}

/**
 * 删除菜单（支持批量）
 * @param ids - 菜单ID列表，多个用逗号分隔
 */
export async function deleteMenu(ids: string): Promise<void> {
  return del(`/system/menu/${ids}`)
}
