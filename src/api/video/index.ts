/**
 * 前台视频详情 API 模块
 * 对接后端 DocHomeVideoController 接口
 */

import { get, post } from '@/api/request'
import type {
  HomeVideoDetail,
  HomeVideoInteraction,
  HomeVideoToggleResult,
  HomeVideoCommentPageData,
  HomeVideoComment,
  HomeVideoCommentInput,
  HomeVideoCollection,
} from '@/types/video-home.types'

/** 获取视频元信息+详情 */
export function getHomeVideoDetail(id: string) {
  return get<HomeVideoDetail>(`/document/docHomeVideo/detail/${id}`)
}

/** 获取视频交互信息（点赞/收藏/关注/浏览） */
export function getHomeVideoInteraction(id: string) {
  return get<HomeVideoInteraction>(`/document/docHomeVideo/interaction/${id}`)
}

/** 切换视频点赞状态 */
export function toggleHomeVideoLike(id: string) {
  return post<HomeVideoToggleResult>(`/document/docHomeVideo/like/${id}`)
}

/** 切换视频收藏状态 */
export function toggleHomeVideoFavorite(id: string) {
  return post<HomeVideoToggleResult>(`/document/docHomeVideo/favorite/${id}`)
}

/** 切换关注作者状态 */
export function toggleHomeVideoFollow(authorId: string) {
  return post<HomeVideoToggleResult>(`/document/docHomeVideo/follow/${authorId}`)
}

/** 获取视频评论列表（分页，二级结构） */
export function getHomeVideoComments(
  videoId: string,
  params?: { pageNum?: number; pageSize?: number; sort?: 'hot' | 'new' }
) {
  return get<HomeVideoCommentPageData>(
    `/document/docHomeVideo/comments/${videoId}`,
    params as unknown as Record<string, unknown>
  )
}

/** 发表/回复视频评论 */
export function postHomeVideoComment(data: HomeVideoCommentInput) {
  return post<HomeVideoComment>(
    '/document/docHomeVideo/comment',
    data as unknown as Record<string, unknown>
  )
}

/** 切换评论点赞状态 */
export function toggleHomeVideoCommentLike(commentId: string) {
  return post<HomeVideoToggleResult>(`/document/docHomeVideo/comment/like/${commentId}`)
}

/** 获取视频所属公开合集列表 */
export function getHomeVideoCollections(videoId: string) {
  return get<HomeVideoCollection[]>(`/document/docHomeVideo/collections/${videoId}`)
}
