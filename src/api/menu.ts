/**
 * 菜单管理 API
 * 支持动态菜单管理，菜单名称、图标、顺序可通过后台API配置
 * 主要由后端API权限控制显示
 */

import { get, post, put, del } from './request'
import type { MenuItem } from '@/constants/menu'
import type { PaginationParams, PaginationData } from '@/types/api.types'

/**
 * 菜单API数据结构（后端返回格式）
 */
export interface MenuApiItem extends Omit<MenuItem, 'icon'> {
  /** 菜单ID */
  id: string
  /** 图标名称（字符串形式，用于动态加载） */
  icon?: string
  /** 父菜单ID */
  parentId?: string
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt: string
}

/**
 * 菜单列表响应类型
 */
export type MenuListResponse = PaginationData<MenuApiItem>

/**
 * 菜单树响应类型
 */
export interface MenuTreeResponse {
  /** 菜单树结构 */
  menus: MenuItem[]
}

/**
 * 获取菜单列表（分页）
 * @param params - 分页参数
 * @returns 菜单列表数据
 */
export async function getMenuList(params?: PaginationParams): Promise<MenuListResponse> {
  return get('/api/menu', params as unknown as Record<string, unknown>)
}

/**
 * 获取菜单树结构
 * @returns 菜单树数据
 */
export async function getMenuTree(): Promise<MenuTreeResponse> {
  return get('/api/menu/tree')
}

/**
 * 根据ID获取菜单详情
 * @param id - 菜单ID
 * @returns 菜单详情
 */
export async function getMenuById(id: string): Promise<MenuApiItem> {
  return get(`/api/menu/${id}`)
}

/**
 * 创建新菜单
 * @param data - 菜单数据（不含ID和时间戳）
 * @returns 创建后的菜单数据
 */
export async function createMenu(data: Omit<MenuApiItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<MenuApiItem> {
  return post('/api/menu', data)
}

/**
 * 更新菜单信息
 * @param id - 菜单ID
 * @param data - 更新的菜单数据
 * @returns 更新后的菜单数据
 */
export async function updateMenu(id: string, data: Partial<MenuApiItem>): Promise<MenuApiItem> {
  return put(`/api/menu/${id}`, data)
}

/**
 * 删除菜单
 * @param id - 菜单ID
 */
export async function deleteMenu(id: string): Promise<void> {
  return del(`/api/menu/${id}`)
}

/**
 * 批量删除菜单
 * @param ids - 菜单ID数组
 */
export async function batchDeleteMenu(ids: string[]): Promise<void> {
  return post('/api/menu/batch-delete', { ids })
}

/**
 * 更新菜单排序
 * @param ids - 按排序顺序排列的菜单ID数组
 */
export async function updateMenuOrder(ids: string[]): Promise<void> {
  return post('/api/menu/update-order', { ids })
}