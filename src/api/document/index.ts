/**
 * 前台文档详情 API 模块
 * 对接后端 DocHomeNoteController / DocHomeUserController 接口
 */

import { get, post } from '@/api/request'
import type {
  DocHomeNoteDetail,
  DocHomeInteraction,
  DocHomeToggleResult,
  DocHomeCommentPageData,
  DocHomeComment,
  DocHomeCommentInput,
  DocHomeUserWorksPageData,
  DocHomeUserStatsVo,
} from '@/types/document.types'

/** 获取笔记元信息+详情 */
export function getDocHomeNoteDetail(id: string) {
  return get<DocHomeNoteDetail>(`/document/docHomeNote/detail/${id}`)
}

/** 获取笔记交互信息（点赞/收藏/关注/浏览） */
export function getDocHomeNoteInteraction(id: string) {
  return get<DocHomeInteraction>(`/document/docHomeNote/interaction/${id}`)
}

/** 切换笔记点赞状态 */
export function toggleDocHomeNoteLike(id: string) {
  return post<DocHomeToggleResult>(`/document/docHomeNote/like/${id}`)
}

/** 切换笔记收藏状态 */
export function toggleDocHomeNoteFavorite(id: string) {
  return post<DocHomeToggleResult>(`/document/docHomeNote/favorite/${id}`)
}

/** 切换关注作者状态 */
export function toggleDocHomeNoteFollow(authorId: string) {
  return post<DocHomeToggleResult>(`/document/docHomeNote/follow/${authorId}`)
}

/** 获取笔记评论列表（分页） */
export function getDocHomeNoteComments(
  noteId: string,
  params?: { pageNum?: number; pageSize?: number; sort?: 'hot' | 'new' }
) {
  return get<DocHomeCommentPageData>(
    `/document/docHomeNote/comments/${noteId}`,
    params as unknown as Record<string, unknown>
  )
}

/** 发表/回复笔记评论 */
export function postDocHomeNoteComment(data: DocHomeCommentInput) {
  return post<DocHomeComment>(
    '/document/docHomeNote/comment',
    data as unknown as Record<string, unknown>
  )
}

/** 切换评论点赞状态 */
export function toggleDocHomeNoteCommentLike(commentId: string) {
  return post<DocHomeToggleResult>(`/document/docHomeNote/comment/like/${commentId}`)
}

// ===== 前台用户作品主页 API（对接 DocHomeUserController） =====

/** 获取用户作品列表（分页，支持按类型筛选） */
export function getDocHomeUserWorks(
  userId: string,
  params?: { type?: string; pageNum?: number; pageSize?: number }
) {
  return get<DocHomeUserWorksPageData>(
    `/document/docHomeUser/${userId}/works`,
    params as unknown as Record<string, unknown>
  )
}

/** 获取用户作品统计（总获赞/总浏览/总收藏/笔记数/视频数） */
export function getDocHomeUserStats(userId: string) {
  return get<DocHomeUserStatsVo>(`/document/docHomeUser/${userId}/stats`)
}
