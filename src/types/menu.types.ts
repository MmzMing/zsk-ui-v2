/**
 * 菜单管理类型定义
 * 系统菜单相关的数据类型
 * 对接后端 SysMenuController 接口
 */

import type { LucideIcon } from 'lucide-react'

/**
 * 菜单类型枚举
 * M - 目录
 * C - 菜单
 * F - 按钮
 */
export type MenuType = 'M' | 'C' | 'F'

/**
 * 菜单状态
 * 0 - 正常
 * 1 - 停用
 */
export type MenuStatus = '0' | '1'

/**
 * 是否显示
 * 0 - 显示
 * 1 - 隐藏
 */
export type MenuVisible = '0' | '1'

/**
 * 系统菜单数据结构
 */
export interface SysMenu {
  /** 菜单ID */
  id: string
  /** 菜单名称 */
  menuName: string
  /** 父菜单ID */
  parentId: string
  /** 菜单类型 */
  menuType: MenuType
  /** 路由路径 */
  path?: string
  /** 组件路径 */
  component?: string
  /** 权限标识 */
  perms?: string
  /** 图标名称 */
  icon?: string
  /** 菜单状态 */
  status: MenuStatus
  /** 显示顺序 */
  orderNum: number
  /** 是否显示（0显示 1隐藏） */
  visible?: MenuVisible
  /** 是否外链（0是 1否） */
  isFrame?: number
  /** 是否缓存（0缓存 1不缓存） */
  isCache?: number
  /** 路由参数 */
  query?: string
  /** 备注 */
  remark?: string
  /** 子菜单列表 */
  children?: SysMenu[]
}

/**
 * 菜单查询参数
 */
export interface SysMenuQueryParams {
  /** 菜单名称（模糊查询） */
  menuName?: string
  /** 菜单状态 */
  status?: MenuStatus
  /** 菜单类型 */
  menuType?: MenuType
}

/**
 * 新增菜单输入参数
 */
export interface SysMenuCreateInput {
  /** 菜单名称 */
  menuName: string
  /** 父菜单ID（顶级菜单传0） */
  parentId: string
  /** 菜单类型 */
  menuType: MenuType
  /** 路由路径 */
  path?: string
  /** 组件路径 */
  component?: string
  /** 权限标识 */
  perms?: string
  /** 图标名称 */
  icon?: string
  /** 菜单状态，默认0（正常） */
  status?: MenuStatus
  /** 显示顺序，默认0 */
  orderNum?: number
  /** 是否显示，默认0（显示） */
  visible?: MenuVisible
  /** 是否外链，默认1（否） */
  isFrame?: number
  /** 是否缓存，默认0（缓存） */
  isCache?: number
  /** 路由参数 */
  query?: string
  /** 备注 */
  remark?: string
}

/**
 * 修改菜单输入参数
 */
export interface SysMenuUpdateInput {
  /** 菜单ID */
  id: string
  /** 菜单名称 */
  menuName?: string
  /** 父菜单ID */
  parentId?: string
  /** 菜单类型 */
  menuType?: MenuType
  /** 路由路径 */
  path?: string
  /** 组件路径 */
  component?: string
  /** 权限标识 */
  perms?: string
  /** 图标名称 */
  icon?: string
  /** 菜单状态 */
  status?: MenuStatus
  /** 显示顺序 */
  orderNum?: number
  /** 是否显示（0显示 1隐藏） */
  visible?: MenuVisible
  /** 是否外链（0是 1否） */
  isFrame?: number
  /** 是否缓存（0缓存 1不缓存） */
  isCache?: number
  /** 路由参数 */
  query?: string
  /** 备注 */
  remark?: string
}

/**
 * 批量更新菜单输入参数（用于拖拽排序）
 */
export interface SysMenuBatchUpdate {
  /** 菜单ID */
  id: string
  /** 显示顺序 */
  orderNum: number
  /** 父菜单ID */
  parentId: string
}

/**
 * 菜单树节点属性
 */
export interface MenuTreeNode {
  /** 节点key */
  key: string
  /** 节点标签 */
  label: string
  /** 是否禁用 */
  disabled?: boolean
  /** 是否为叶子节点 */
  isLeaf?: boolean
  /** 子节点 */
  children?: MenuTreeNode[]
  /** 自定义图标 */
  icon?: LucideIcon
  /** 菜单数据 */
  data?: SysMenu
}

/**
 * 菜单类型选项
 */
export interface MenuTypeOption {
  /** 类型值 */
  value: MenuType
  /** 显示标签 */
  label: string
  /** 类型描述 */
  description: string
}

/**
 * 菜单状态选项
 */
export interface MenuStatusOption {
  /** 状态值 */
  value: MenuStatus
  label: string
}

/**
 * 菜单类型选项列表
 */
export const MENU_TYPE_OPTIONS: MenuTypeOption[] = [
  { value: 'M', label: '目录', description: '对应菜单目录分组' },
  { value: 'C', label: '菜单', description: '对应具体页面路由' },
  { value: 'F', label: '按钮', description: '对应功能按钮权限' }
]

/**
 * 菜单状态选项列表
 */
export const MENU_STATUS_OPTIONS: MenuStatusOption[] = [
  { value: '0', label: '正常' },
  { value: '1', label: '停用' }
]

/**
 * react-arborist 树节点数据结构
 * 必须包含 id、name 字段以符合 react-arborist 的 SimpleData 约束
 */
export interface MenuNodeData {
  /** 节点ID */
  id: string
  /** 节点名称（react-arborist 必需字段） */
  name: string
  /** 子节点 */
  children?: MenuNodeData[]
  /** 菜单类型 */
  menuType: MenuType
  /** 菜单状态 */
  status: MenuStatus
  /** 图标名称 */
  icon?: string
  /** 路由路径 */
  path?: string
  /** 关联的完整菜单数据 */
  menuData: SysMenu
}
