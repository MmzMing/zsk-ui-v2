/**
 * 角色管理类型定义
 * 系统角色相关的数据类型
 * 对接后端 SysRoleController 接口
 */

/**
 * 角色状态
 * 0 - 正常
 * 1 - 停用
 */
export type RoleStatus = '0' | '1'

/**
 * 系统角色数据结构
 */
export interface SysRole {
  /** 角色ID */
  id: string
  /** 角色名称 */
  roleName: string
  /** 角色权限字符串 */
  roleKey: string
  /** 排序号 */
  roleSort: number
  /** 角色状态 */
  status: RoleStatus
  /** 备注 */
  remark?: string
  /** 创建时间 */
  createTime?: string
}

/**
 * 角色查询参数
 */
export interface SysRoleQueryParams {
  /** 角色名称（模糊查询） */
  roleName?: string
  /** 角色状态 */
  status?: RoleStatus
}

/**
 * 新增角色输入参数
 */
export interface SysRoleCreateInput {
  /** 角色名称 */
  roleName: string
  /** 角色权限字符串 */
  roleKey: string
  /** 排序号 */
  roleSort?: number
  /** 角色状态，默认0（正常） */
  status?: RoleStatus
  /** 备注 */
  remark?: string
}

/**
 * 修改角色输入参数
 */
export interface SysRoleUpdateInput {
  /** 角色ID */
  id: string
  /** 角色名称 */
  roleName?: string
  /** 角色权限字符串 */
  roleKey?: string
  /** 排序号 */
  roleSort?: number
  /** 角色状态 */
  status?: RoleStatus
  /** 备注 */
  remark?: string
}

/**
 * 角色权限绑定请求参数
 */
export interface RoleMenuBindInput {
  /** 菜单ID列表 */
  menuIds: string[]
}

/**
 * 角色用户绑定请求参数
 */
export interface RoleUserBindInput {
  /** 用户ID列表 */
  userIds: string[]
}

/**
 * 批量复制角色请求参数
 */
export interface RoleCopyInput {
  /** 要复制的角色ID列表 */
  ids: string[]
}

/**
 * 角色状态选项
 */
export interface RoleStatusOption {
  /** 状态值 */
  value: RoleStatus
  /** 显示标签 */
  label: string
}

/**
 * 角色状态选项列表
 */
export const ROLE_STATUS_OPTIONS: RoleStatusOption[] = [
  { value: '0', label: '正常' },
  { value: '1', label: '停用' }
]

/**
 * 本地分页参数
 */
export interface LocalPaginationParams {
  /** 当前页码，从1开始 */
  page: number
  /** 每页条数 */
  pageSize: number
}

/**
 * 本地分页结果
 */
export interface LocalPaginationResult<T> {
  /** 当前页数据 */
  list: T[]
  /** 总条数 */
  total: number
  /** 总页数 */
  totalPages: number
  /** 当前页码 */
  page: number
  /** 每页条数 */
  pageSize: number
}
