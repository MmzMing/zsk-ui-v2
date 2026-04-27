/**
 * 视频管理 API
 * 对接后端 DocVideoController 接口
 * 支持视频CRUD、状态切换、置顶/推荐切换、草稿管理
 */

import { get, post, put, del, request } from '../../request'
import type { ApiResponse } from '@/types/api.types'
import type {
  DocVideo,
  DocVideoQueryParams,
  DocVideoPageData,
  DocVideoDetail,
  DocVideoCreateInput,
  DocVideoUpdateInput,
  DocVideoBatchStatusParams,
  DocVideoDraftInput,
  DocVideoInteraction,
  DocVideoCommentPageData,
  DocVideoCommentUpdateInput,
} from '@/types/video.types'

/**
 * 查询视频列表（不分页）
 *
 * @param params - 查询参数
 * @returns 视频列表
 */
export async function getDocVideoList(params?: DocVideoQueryParams): Promise<DocVideo[]> {
  return get('/document/docVideo/list', params as unknown as Record<string, unknown>)
}

/**
 * 分页查询视频列表
 *
 * @param params - 查询参数（含分页参数）
 * @returns 分页视频数据
 */
export async function getDocVideoPage(params?: DocVideoQueryParams): Promise<DocVideoPageData> {
  return get('/document/docVideo/page', params as unknown as Record<string, unknown>)
}

/**
 * 根据ID获取视频详情
 *
 * @param id - 视频ID
 * @returns 视频详情（含分集信息）
 */
export async function getDocVideoById(id: string): Promise<DocVideoDetail> {
  return get(`/document/docVideo/${id}`)
}

/**
 * 获取视频交互数据
 *
 * @param id - 视频ID
 * @param userId - 当前用户ID（用于判断用户是否已点赞/收藏）
 * @returns 视频交互数据
 */
export async function getDocVideoInteraction(id: string, userId?: string): Promise<DocVideoInteraction> {
  return get(`/document/docVideo/${id}/interaction`, userId ? { userId } : undefined)
}

/**
 * 增加视频浏览量
 *
 * @param id - 视频ID
 * @param userId - 用户ID（用于防止同一用户短时间内重复计数）
 */
export async function increaseDocVideoView(id: string, userId?: string): Promise<void> {
  return post(`/document/docVideo/${id}/view`, userId ? { userId } : undefined)
}

/**
 * 新增视频
 *
 * @param data - 视频数据
 */
export async function createDocVideo(data: DocVideoCreateInput): Promise<boolean> {
  return post('/document/docVideo', data as unknown as Record<string, unknown>)
}

/**
 * 上传视频文件并保存
 * 使用 multipart/form-data 格式上传
 *
 * @param file - 视频文件
 * @param data - 视频信息
 * @returns 上传结果
 */
export async function uploadDocVideoFile(
  file: File,
  data: {
    userId: string
    videoTitle: string
    tags?: string
    fileContent?: string
    broadCode: string
    narrowCode?: string
  }
): Promise<boolean> {
  const formData = new FormData()
  formData.append('file', file, file.name)
  formData.append('userId', data.userId)
  formData.append('videoTitle', data.videoTitle)
  formData.append('broadCode', data.broadCode)
  if (data.tags) formData.append('tags', data.tags)
  if (data.fileContent) formData.append('fileContent', data.fileContent)
  if (data.narrowCode) formData.append('narrowCode', data.narrowCode)

  const response = await request.post<ApiResponse<boolean>>('/document/docVideo/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  return response.data.data!
}

/**
 * 修改视频
 *
 * @param data - 视频数据（必须包含id）
 */
export async function updateDocVideo(data: DocVideoUpdateInput): Promise<boolean> {
  return put('/document/docVideo', data as unknown as Record<string, unknown>)
}

/**
 * 删除视频（支持批量）
 * 多个ID用逗号分隔
 *
 * @param ids - 视频ID列表，多个用逗号分隔
 */
export async function deleteDocVideo(ids: string): Promise<boolean> {
  return del(`/document/docVideo/${ids}`)
}

/**
 * 获取草稿列表
 *
 * @param pageNum - 页码，默认1
 * @param pageSize - 每页数量，默认10
 * @returns 草稿视频分页数据
 */
export async function getDocVideoDraftList(pageNum = 1, pageSize = 10): Promise<DocVideoPageData> {
  return get('/document/docVideo/draft/list', { pageNum, pageSize })
}

/**
 * 保存视频草稿
 *
 * @param data - 草稿数据
 * @returns 草稿ID
 */
export async function saveDocVideoDraft(data: DocVideoDraftInput): Promise<string> {
  return post('/document/docVideo/draft', data as unknown as Record<string, unknown>)
}

/**
 * 发布草稿
 * 将草稿状态变更为正常，并设置审核状态为待审核
 *
 * @param id - 草稿ID
 */
export async function publishDocVideoDraft(id: string): Promise<void> {
  return put(`/document/docVideo/draft/publish/${id}`)
}

/**
 * 批量更新视频状态
 * 支持批量上架/下架
 *
 * @param params - 批量状态更新参数
 */
export async function batchUpdateDocVideoStatus(params: DocVideoBatchStatusParams): Promise<void> {
  return put('/document/docVideo/status/batch', params as unknown as Record<string, unknown>)
}

/**
 * 切换视频置顶状态
 * 使用 RequestParam 传递参数
 *
 * @param id - 视频ID
 * @param pinned - 置顶状态（0-否，1-是）
 */
export async function toggleDocVideoPinned(id: string, pinned: number): Promise<void> {
  return put(`/document/docVideo/${id}/pinned?pinned=${pinned}`)
}

/**
 * 切换视频推荐状态
 * 使用 RequestParam 传递参数
 *
 * @param id - 视频ID
 * @param recommended - 推荐状态（0-否，1-是）
 */
export async function toggleDocVideoRecommended(id: string, recommended: number): Promise<void> {
  return put(`/document/docVideo/${id}/recommended?recommended=${recommended}`)
}

// ===== 视频评论管理 API =====

/**
 * 获取视频评论列表（前台接口）
 * 采用B站式评论结构，所有回复统一挂在根评论下
 *
 * @param videoId - 视频ID
 * @param pageNum - 页码，默认1
 * @param pageSize - 每页数量，默认10
 * @param sort - 排序方式：hot（热门）/ new（最新）
 * @returns 评论分页数据（含树状回复结构）
 */
export async function getDocVideoComments(
  videoId: string,
  pageNum = 1,
  pageSize = 10,
  sort: 'hot' | 'new' = 'new'
): Promise<DocVideoCommentPageData> {
  return get(`/document/docVideoComment/comments/${videoId}`, {
    pageNum,
    pageSize,
    sort,
  })
}

/**
 * 删除视频评论（支持批量）
 *
 * @param ids - 评论ID列表，多个用逗号分隔
 */
export async function deleteDocVideoComment(ids: string): Promise<boolean> {
  return del(`/document/docVideoComment/${ids}`)
}

/**
 * 修改视频评论
 *
 * @param data - 评论数据（必须包含id）
 */
export async function updateDocVideoComment(data: DocVideoCommentUpdateInput): Promise<boolean> {
  return put('/document/docVideoComment', data as unknown as Record<string, unknown>)
}
