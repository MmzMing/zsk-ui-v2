/**
 * 字典管理类型定义
 * 对接后端 SysDictTypeController 和 SysDictDataController 接口
 */

export type DictStatus = '0' | '1'

export interface SysDictType {
  id: string
  dictName: string
  dictType: string
  status: DictStatus
  remark?: string
  createTime?: string
  updateTime?: string
  createBy?: string
  updateBy?: string
}

export interface SysDictData {
  id: string
  dictType: string
  dictLabel: string
  dictValue: string
  dictSort: number
  status: DictStatus
  remark?: string
  createTime?: string
  updateTime?: string
  createBy?: string
  updateBy?: string
  cssClass?: string
  listClass?: string
}

export interface SysDictTypeQueryParams {
  dictName?: string
  dictType?: string
  status?: DictStatus
  pageNum?: number
  pageSize?: number
}

export interface SysDictDataQueryParams {
  dictType?: string
  dictLabel?: string
  status?: DictStatus
  pageNum?: number
  pageSize?: number
  orderByColumn?: string
  isAsc?: string
}

export interface SysDictTypeCreateInput {
  dictName: string
  dictType: string
  status?: DictStatus
  remark?: string
}

export interface SysDictTypeUpdateInput {
  id: string
  dictName?: string
  status?: DictStatus
  remark?: string
}

export interface SysDictDataCreateInput {
  dictType: string
  dictLabel: string
  dictValue: string
  dictSort?: number
  status?: DictStatus
  remark?: string
  cssClass?: string
  listClass?: string
}

export interface SysDictDataUpdateInput {
  id: string
  dictLabel?: string
  dictValue?: string
  dictSort?: number
  status?: DictStatus
  remark?: string
  cssClass?: string
  listClass?: string
}

export interface SysDictTypePageData {
  list: SysDictType[]
  total: string
  pageNum: string
  pageSize: string
  totalPages: string
  hasNext: boolean
  hasPrevious: boolean
}

export interface SysDictDataPageData {
  list: SysDictData[]
  total: string
  pageNum: string
  pageSize: string
  totalPages: string
  hasNext: boolean
  hasPrevious: boolean
}

export interface SysDictDataCache {
  id: number
  dictSort: number
  dictLabel: string
  dictValue: string
  dictType: string
  listClass: string
  isDefault: number
  status: DictStatus
}

export type DictCacheTags = string[]

export type DictCacheAllData = Record<string, SysDictDataCache[]>

export interface DictStatusOption {
  value: DictStatus
  label: string
}

export const DICT_STATUS_OPTIONS: DictStatusOption[] = [
  { value: '0', label: '正常' },
  { value: '1', label: '停用' }
]