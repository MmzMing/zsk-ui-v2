/**
 * 参数配置类型定义
 * 对接后端 SysConfigController 接口
 */

export type ConfigStatus = '0' | '1'

export interface SysConfig {
  id: string
  configName: string
  configKey: string
  configValue: string
  status: ConfigStatus
  remark?: string
  createTime?: string
  updateTime?: string
  createBy?: string
  updateBy?: string
}

export interface SysConfigQueryParams {
  configName?: string
  configKey?: string
  configType?: string
  status?: ConfigStatus
  pageNum?: number
  pageSize?: number
  orderByColumn?: string
  isAsc?: string
}

export interface SysConfigCreateInput {
  configName: string
  configKey: string
  configValue: string
  status?: ConfigStatus
  remark?: string
}

export interface SysConfigUpdateInput {
  id: string
  configName?: string
  configValue?: string
  status?: ConfigStatus
  remark?: string
}

export interface SysConfigPageData {
  list: SysConfig[]
  total: string
  pageNum: string
  pageSize: string
  totalPages: string
  hasNext: boolean
  hasPrevious: boolean
}

export interface ConfigStatusOption {
  value: ConfigStatus
  label: string
}

export const CONFIG_STATUS_OPTIONS: ConfigStatusOption[] = [
  { value: '0', label: '正常' },
  { value: '1', label: '停用' }
]