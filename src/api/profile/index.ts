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

//--已对齐后端接口

/**
 * 获取用户统计数据（点赞、粉丝、收藏）
 * @returns 用户统计数据
 */
export async function getUserStats(): Promise<UserStatsResponse> {
  return get('/document/docAllContent/user/stats')
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