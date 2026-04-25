/**
 * 文档（笔记）管理 API
 * 对接后端 DocNoteController 接口
 * 支持文档CRUD、状态切换、置顶/推荐切换
 */

import { get, post, put, del } from '../../request'
import type {
  DocNote,
  DocNoteQueryParams,
  DocNotePageData,
  DocNoteCreateInput,
  DocNoteUpdateInput,
  DocNoteBatchStatusParams,
  DocNoteBatchCategoryParams
} from '@/types/document.types'

/**
 * 查询文档列表（不分页）
 *
 * @param params - 查询参数
 * @returns 文档列表
 */
export async function getDocNoteList(params?: DocNoteQueryParams): Promise<DocNote[]> {
  return get('/document/docNote/list', params as unknown as Record<string, unknown>)
}

/**
 * 分页查询文档列表
 *
 * @param params - 查询参数（含分页参数）
 * @returns 分页文档数据
 */
export async function getDocNotePage(params?: DocNoteQueryParams): Promise<DocNotePageData> {
  return get('/document/docNote/page', params as unknown as Record<string, unknown>)
}

/**
 * 根据ID获取文档详情
 *
 * @param id - 文档ID
 * @returns 文档详情
 */
export async function getDocNoteById(id: string): Promise<DocNote> {
  return get(`/document/docNote/${id}`)
}

/**
 * 新增文档
 *
 * @param data - 文档数据
 */
export async function createDocNote(data: DocNoteCreateInput): Promise<boolean> {
  return post('/document/docNote', data as unknown as Record<string, unknown>)
}

/**
 * 修改文档
 *
 * @param data - 文档数据（必须包含id）
 */
export async function updateDocNote(data: DocNoteUpdateInput): Promise<boolean> {
  return put('/document/docNote', data as unknown as Record<string, unknown>)
}

/**
 * 删除文档（支持批量）
 * 多个ID用逗号分隔
 *
 * @param ids - 文档ID列表，多个用逗号分隔
 */
export async function deleteDocNote(ids: string): Promise<boolean> {
  return del(`/document/docNote/${ids}`)
}

/**
 * 批量更新文档状态
 * 支持批量上架/下架
 *
 * @param params - 批量状态更新参数
 */
export async function batchUpdateDocNoteStatus(params: DocNoteBatchStatusParams): Promise<void> {
  return put('/document/docNote/status/batch', params as unknown as Record<string, unknown>)
}

/**
 * 批量迁移文档分类
 *
 * @param params - 批量分类迁移参数
 */
export async function batchUpdateDocNoteCategory(params: DocNoteBatchCategoryParams): Promise<void> {
  return put('/document/docNote/category/batch', params as unknown as Record<string, unknown>)
}

/**
 * 切换文档置顶状态
 *
 * @param id - 文档ID
 */
export async function toggleDocNotePinned(id: string): Promise<void> {
  return put(`/document/docNote/${id}/pinned`)
}

/**
 * 切换文档推荐状态
 *
 * @param id - 文档ID
 */
export async function toggleDocNoteRecommended(id: string): Promise<void> {
  return put(`/document/docNote/${id}/recommended`)
}
