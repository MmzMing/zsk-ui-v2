/**
 * 视频合集管理 API
 * 对接后端 DocVideoCollectionController 接口
 * 支持合集CRUD、合集内视频的添加/移除/排序
 */

import { get, post, put, del } from '../../request'
import type {
  DocVideoCollection,
  DocVideoCollectionQueryParams,
  DocVideoCollectionPageData,
  DocVideoCollectionDetail,
  DocVideoCollectionCreateInput,
  DocVideoCollectionUpdateInput,
  DocVideoCollectionAddVideoInput,
  DocVideoCollectionUpdateOrderInput,
} from '@/types/videoCollection.types'
import type { DocVideo } from '@/types/video.types'

/**
 * 查询合集列表（不分页）
 *
 * @param params - 查询参数
 * @returns 合集列表
 */
export async function getDocVideoCollectionList(
  params?: DocVideoCollectionQueryParams
): Promise<DocVideoCollection[]> {
  return get('/document/docVideoCollection/list', params as unknown as Record<string, unknown>)
}

/**
 * 分页查询合集列表
 *
 * @param params - 查询参数（含分页参数）
 * @returns 分页合集数据
 */
export async function getDocVideoCollectionPage(
  params?: DocVideoCollectionQueryParams
): Promise<DocVideoCollectionPageData> {
  return get('/document/docVideoCollection/page', params as unknown as Record<string, unknown>)
}

/**
 * 根据ID获取合集详情
 *
 * @param id - 合集ID
 * @returns 合集详情（含视频列表）
 */
export async function getDocVideoCollectionById(id: string): Promise<DocVideoCollectionDetail> {
  return get(`/document/docVideoCollection/${id}`)
}

/**
 * 新增合集
 *
 * @param data - 合集数据
 */
export async function createDocVideoCollection(
  data: DocVideoCollectionCreateInput
): Promise<boolean> {
  return post('/document/docVideoCollection', data as unknown as Record<string, unknown>)
}

/**
 * 修改合集
 *
 * @param data - 合集数据（必须包含id）
 */
export async function updateDocVideoCollection(
  data: DocVideoCollectionUpdateInput
): Promise<boolean> {
  return put('/document/docVideoCollection', data as unknown as Record<string, unknown>)
}

/**
 * 删除合集（支持批量）
 * 多个ID用逗号分隔
 *
 * @param ids - 合集ID列表，多个用逗号分隔
 */
export async function deleteDocVideoCollection(ids: string): Promise<boolean> {
  return del(`/document/docVideoCollection/${ids}`)
}

/**
 * 获取合集内视频列表
 *
 * @param collectionId - 合集ID
 * @returns 视频列表
 */
export async function getDocVideoCollectionVideos(
  collectionId: string
): Promise<DocVideo[]> {
  return get(`/document/docVideoCollection/${collectionId}/videos`)
}

/**
 * 添加视频到合集
 *
 * @param collectionId - 合集ID
 * @param data - 添加视频参数
 */
export async function addVideoToCollection(
  collectionId: string,
  data: DocVideoCollectionAddVideoInput
): Promise<boolean> {
  return post(
    `/document/docVideoCollection/${collectionId}/videos`,
    data as unknown as Record<string, unknown>
  )
}

/**
 * 从合集中移除视频
 *
 * @param collectionId - 合集ID
 * @param videoId - 视频ID
 */
export async function removeVideoFromCollection(
  collectionId: string,
  videoId: string
): Promise<boolean> {
  return del(`/document/docVideoCollection/${collectionId}/videos/${videoId}`)
}

/**
 * 更新合集内视频排序
 *
 * @param collectionId - 合集ID
 * @param data - 排序参数
 */
export async function updateCollectionVideoOrder(
  collectionId: string,
  data: DocVideoCollectionUpdateOrderInput
): Promise<boolean> {
  return put(
    `/document/docVideoCollection/${collectionId}/videos/order`,
    data as unknown as Record<string, unknown>
  )
}
