/**
 * 视频合集管理类型定义
 * 对接后端 DocVideoCollectionController 接口
 */

import type { DocVideo } from './video.types'

// 合集状态：1-公开，2-私密
export type DocVideoCollectionStatus = 1 | 2

// 删除标记：0-未删除，1-已删除
export type DocVideoCollectionDeleted = 0 | 1

/** 合集封面文件信息 */
export interface DocVideoCollectionCover {
  fileId: string
  fileUrl: string
}

/** 视频合集列表项 */
export interface DocVideoCollection {
  id: string
  collectionName: string
  description: string
  cover: DocVideoCollectionCover | null
  videoCount: number
  sortOrder: number
  status: DocVideoCollectionStatus
  deleted: DocVideoCollectionDeleted
  createTime: string
  updateTime: string
}

/** 视频合集详情项（含视频列表） */
export interface DocVideoCollectionDetail extends DocVideoCollection {
  videoList: DocVideo[]
}

/** 视频合集查询参数 */
export interface DocVideoCollectionQueryParams {
  collectionName?: string
  status?: DocVideoCollectionStatus
  deleted?: DocVideoCollectionDeleted
  pageNum?: number
  pageSize?: number
  orderByColumn?: string
  isAsc?: string
}

/** 视频合集分页数据 */
export interface DocVideoCollectionPageData {
  list: DocVideoCollection[]
  total: number
  pageNum: number
  pageSize: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

/** 新增合集输入 */
export interface DocVideoCollectionCreateInput {
  collectionName: string
  description?: string
  coverFileId?: string
  sortOrder?: number
  status?: DocVideoCollectionStatus
}

/** 修改合集输入 */
export interface DocVideoCollectionUpdateInput {
  id: string
  collectionName?: string
  description?: string
  coverFileId?: string
  sortOrder?: number
  status?: DocVideoCollectionStatus
}

/** 批量添加/移除视频输入 */
export interface DocVideoCollectionBatchVideoInput {
  videoIds: string[]
}

/** 调整视频排序输入 */
export interface DocVideoCollectionSortVideosInput {
  videoIds: string[]
}

/** 合集状态选项 */
export interface DocVideoCollectionStatusOption {
  value: DocVideoCollectionStatus
  label: string
}

/** 删除状态选项 */
export interface DocVideoCollectionDeletedOption {
  value: DocVideoCollectionDeleted
  label: string
}

/** 合集状态选项列表 */
export const DOC_VIDEO_COLLECTION_STATUS_OPTIONS: DocVideoCollectionStatusOption[] = [
  { value: 1, label: '公开' },
  { value: 2, label: '私密' },
]

/** 删除状态选项列表 */
export const DOC_VIDEO_COLLECTION_DELETED_OPTIONS: DocVideoCollectionDeletedOption[] = [
  { value: 0, label: '未删除' },
  { value: 1, label: '已删除' },
]
