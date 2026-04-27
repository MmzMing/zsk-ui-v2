/**
 * 文档（笔记）管理 API
 * 对接后端 DocNoteController 接口
 * 支持文档CRUD、状态切换、置顶/推荐切换
 */

import { get, post, put, del, request } from '../../request'
import type {
  DocNote,
  DocNoteQueryParams,
  DocNotePageData,
  DocNoteCreateInput,
  DocNoteUpdateInput,
  DocNoteBatchStatusParams,
  DocNoteBatchCategoryParams,
  DocNoteAggregateInput,
  DocNoteFull,
  DocNoteDtl
} from '@/types/document.types'
import type { ApiResponse } from '@/types/api.types'

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

// ===== 笔记聚合管理（元信息 + 正文） =====

/**
 * 获取笔记元信息
 *
 * @param id - 笔记 ID
 * @returns 笔记元信息（包含封面文件信息，不含作者和统计信息）
 */
export async function getNoteMeta(id: string): Promise<DocNote> {
  return get(`/document/docNote/${id}/meta`)
}

/**
 * 创建笔记（元信息 + 正文）
 *
 * @param data - 聚合数据：docNote + content
 */
export async function createDocNoteAggregate(data: DocNoteAggregateInput): Promise<boolean> {
  return post('/document/docNoteDtlAggregate/full', data as unknown as Record<string, unknown>)
}

/**
 * 全量更新笔记（元信息 + 正文）
 *
 * @param id - 笔记 ID
 * @param data - 聚合数据：docNote(含 id) + content
 */
export async function updateDocNoteAggregate(id: string, data: DocNoteAggregateInput): Promise<boolean> {
  return put(`/document/docNoteDtlAggregate/${id}/full`, data as unknown as Record<string, unknown>)
}

/**
 * 获取笔记全量信息（元信息 + 正文）
 *
 * @param id - 笔记 ID
 */
export async function getDocNoteAggregate(id: string): Promise<DocNoteFull> {
  return get(`/document/docNoteDtlAggregate/${id}/full`)
}

/**
 * 级联删除笔记（元信息 + 正文）
 *
 * @param id - 笔记 ID
 */
export async function deleteDocNoteAggregate(id: string): Promise<boolean> {
  return del(`/document/docNoteDtlAggregate/${id}/full`)
}

// ===== 笔记正文（document_note_dtl） =====

/**
 * 根据笔记 ID 获取正文内容
 *
 * @param noteId - 笔记 ID
 */
export async function getDocNoteDtl(noteId: string): Promise<DocNoteDtl> {
  return get(`/document/docNoteDtl/${noteId}`)
}

/**
 * 新增或更新笔记正文（幂等）
 *
 * @param noteId - 笔记 ID
 * @param content - Markdown 正文内容
 */
export async function saveDocNoteDtl(noteId: string, content: string): Promise<boolean> {
  return post('/document/docNoteDtl', { noteId, content })
}

/**
 * 批量删除笔记正文
 *
 * @param noteIds - 笔记 ID 列表（逗号分隔）
 */
export async function deleteDocNoteDtl(noteIds: string): Promise<boolean> {
  return del(`/document/docNoteDtl/${noteIds}`)
}

/**
 * 上传 MD 文件并保存为笔记正文
 *
 * @param noteId - 关联笔记 ID
 * @param file - .md / .markdown 文件
 */
export async function uploadDocNoteDtlFile(noteId: string, file: File): Promise<boolean> {
  const formData = new FormData()
  formData.append('noteId', noteId)
  formData.append('file', file)
  const response = await request.post<ApiResponse<boolean>>(
    '/document/docNoteDtl/upload',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )
  return response.data.data!
}

// ===== 笔记评论管理 =====

import type {
  DocNoteCommentPageData,
  DocNoteCommentUpdateInput,
} from '@/types/document.types'

/**
 * 获取笔记评论列表（前台接口）
 * 采用B站式评论结构，所有回复统一挂在根评论下
 *
 * @param noteId - 笔记ID
 * @param pageNum - 页码，默认1
 * @param pageSize - 每页数量，默认10
 * @param sort - 排序方式：hot（热门）/ new（最新）
 * @returns 评论分页数据（含树状回复结构）
 */
export async function getDocNoteComments(
  noteId: string,
  pageNum = 1,
  pageSize = 10,
  sort: 'hot' | 'new' = 'new'
): Promise<DocNoteCommentPageData> {
  return get(`/document/docNoteComment/comments/${noteId}`, {
    pageNum,
    pageSize,
    sort,
  })
}

/**
 * 删除笔记评论（支持批量）
 *
 * @param ids - 评论ID列表，多个用逗号分隔
 */
export async function deleteDocNoteComment(ids: string): Promise<boolean> {
  return del(`/document/docNoteComment/${ids}`)
}

/**
 * 修改笔记评论
 *
 * @param data - 评论数据（必须包含id）
 */
export async function updateDocNoteComment(data: DocNoteCommentUpdateInput): Promise<boolean> {
  return put('/document/docNoteComment', data as unknown as Record<string, unknown>)
}
