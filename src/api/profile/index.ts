/**
 * 个人中心 API
 * 包含用户信息、用户作品、收藏关注、消息通知等接口
 */

import { get, post, put, del } from '../request'
import type { PaginationParams, PaginationData } from '@/types/api.types'
import type { SysUser } from '../auth'

/**
 * 消息类型
 */
export type MessageType = 'system' | 'comment' | 'like' | 'follow'

/**
 * 消息数据类型
 */
export interface Message {
  /** 消息ID */
  id: string
  /** 消息类型 */
  type: MessageType
  /** 消息标题 */
  title: string
  /** 消息内容 */
  content: string
  /** 是否已读 */
  isRead: boolean
  /** 创建时间 */
  createdAt: string
}

/**
 * 通知设置类型
 */
export interface NotificationSettings {
  /** 邮件通知 */
  email: boolean
  /** 评论通知 */
  comment: boolean
  /** 点赞通知 */
  like: boolean
  /** 关注通知 */
  follow: boolean
  /** 系统通知 */
  system: boolean
}





/**
 * 用户作品数据类型
 */
export interface UserWork {
  /** 作品ID */
  id: string
  /** 作品标题 */
  title: string
  /** 封面图 */
  cover: string
  /** 作品描述 */
  description: string
  /** 类型：document/video/tool */
  type: 'document' | 'video' | 'tool'
  /** 状态：draft/published/archived */
  status: 'draft' | 'published' | 'archived'
  /** 浏览量 */
  views: number
  /** 点赞数 */
  likes: number
  /** 评论数 */
  comments: number
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt: string
}

/**
 * 收藏数据类型
 */
export interface Favorite {
  /** 收藏ID */
  id: string
  /** 作品ID */
  workId: string
  /** 作品标题 */
  title: string
  /** 封面图 */
  cover: string
  /** 作品类型 */
  type: 'document' | 'video' | 'tool'
  /** 收藏时间 */
  createdAt: string
}

/**
 * 用户统计数据类型
 */
export interface UserStats {
  userId: number
  likeCount: number
  fanCount: number
  collectCount: number
}

/**
 * 用户统计响应类型
 */
export interface UserStatsResponse {
  code: number
  msg: string
  data: UserStats | null
}

/**
 * 关注/粉丝数据类型
 */
export interface Follow {
  id: string
  name: string
  avatar: string
  bio: string
  createdAt: string
}

/**
 * 作品列表查询参数
 */
export interface WorksQuery extends PaginationParams {
  /** 作品类型 */
  type?: 'document' | 'video' | 'tool'
  /** 作品状态 */
  status?: 'draft' | 'published' | 'archived'
}

/**
 * 获取用户作品列表
 * @param params - 查询参数
 * @returns 用户作品列表
 */
export async function getUserWorks(params?: WorksQuery): Promise<PaginationData<UserWork>> {
  return get('/api/profile/works', params as unknown as Record<string, unknown>)
}

/**
 * 删除用户作品
 * @param id - 作品ID
 */
export async function deleteUserWork(id: string): Promise<void> {
  return del(`/api/profile/works/${id}`)
}

/**
 * 取消收藏
 * @param id - 收藏ID
 */
export async function deleteFavorite(id: string): Promise<void> {
  return del(`/api/profile/favorites/${id}`)
}


/**
 * 关注用户
 * @param userId - 用户ID
 */
export async function followUser(userId: string): Promise<void> {
  return post(`/api/profile/follow/${userId}`)
}

/**
 * 取消关注
 * @param userId - 用户ID
 */
export async function unfollowUser(userId: string): Promise<void> {
  return del(`/api/profile/follow/${userId}`)
}

/**
 * 获取消息列表
 * @param params - 查询参数
 * @returns 消息列表
 */
export async function getMessages(params?: PaginationParams): Promise<PaginationData<Message>> {
  return get('/api/profile/messages', params as unknown as Record<string, unknown>)
}

/**
 * 获取未读消息数量
 * @returns 未读消息数量
 */
export async function getUnreadMessageCount(): Promise<{ count: number }> {
  return get('/api/profile/messages/unread/count')
}

/**
 * 标记消息为已读
 * @param id - 消息ID
 */
export async function markMessageAsRead(id: string): Promise<void> {
  return put(`/api/profile/messages/${id}/read`)
}

/**
 * 标记所有消息为已读
 */
export async function markAllMessagesAsRead(): Promise<void> {
  return put('/api/profile/messages/read/all')
}

/**
 * 删除消息
 * @param id - 消息ID
 */
export async function deleteMessage(id: string): Promise<void> {
  return del(`/api/profile/messages/${id}`)
}

/**
 * 获取通知设置
 * @returns 通知设置
 */
export async function getNotificationSettings(): Promise<NotificationSettings> {
  return get('/api/profile/settings/notifications')
}

/**
 * 更新通知设置
 * @param settings - 通知设置
 * @returns 更新后的通知设置
 */
export async function updateNotificationSettings(settings: Partial<NotificationSettings>): Promise<NotificationSettings> {
  return put('/api/profile/settings/notifications', settings as unknown as Record<string, unknown>)
}
//--已对齐后端接口

/**
 * 获取用户统计数据（点赞、粉丝、收藏）
 * @returns 用户统计数据
 */
export async function getUserStats(): Promise<UserStatsResponse> {
  return get('/document/content/user/stats')
}

/**
 * 获取系统用户详细信息
 * @param id - 用户ID
 * @returns 用户详细信息
 */
export async function getSystemUserInfo(id: string): Promise<SysUser> {
  return get(`/system/user/${id}`)
}

/**
 * 更新系统用户信息
 * @param data - 用户信息数据
 * @param file - 头像文件（可选）
 * @returns 更新后的用户信息
 */
export async function updateSystemUserInfo(data: Partial<SysUser>, file?: File): Promise<SysUser> {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value))
    }
  })
  if (file) {
    formData.append('file', file)
  }
  return post('/system/user/update/infoFile', formData as unknown as Record<string, unknown>, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}