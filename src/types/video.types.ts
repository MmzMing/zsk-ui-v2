/**
 * 视频管理类型定义
 * 对接后端 DocVideoController 接口
 */

// 视频状态：1-正常，2-下架，3-草稿
export type DocVideoStatus = 1 | 2 | 3

// 审核状态：0-待审核，1-已通过，2-已驳回
export type DocVideoAuditStatus = 0 | 1 | 2

/** 作者信息 */
export interface DocVideoAuthor {
  id: string
  name: string
  avatar: string
}

/** 视频文件信息 */
export interface DocVideoFileInfo {
  fileId: string
  fileUrl: string
}

/** 视频文件对象（包含视频和缩略图） */
export interface DocVideoFile {
  video: DocVideoFileInfo
  thumbnail: DocVideoFileInfo
}

/** 统计信息 */
export interface DocVideoStats {
  views: number
  likes: number
  favorites: number
}

/** 分集信息 */
export interface DocVideoDtl {
  id: string
  title: string
  videoUrl: string
  duration: string
}

/** 视频列表项 */
export interface DocVideo {
  id: string
  userId: string
  user: DocVideoAuthor
  videoTitle: string
  tags: string
  fileContent: string
  videoFile: DocVideoFile
  broadCode: string
  narrowCode: string
  auditStatus: DocVideoAuditStatus
  status: DocVideoStatus
  statsInfo: DocVideoStats
  isPinned: number
  isRecommended: number
  deleted: number
  createTime: string
  updateTime: string
}

/** 视频详情项（含分集信息） */
export interface DocVideoDetail extends DocVideo {
  metaData: string
  videoDtl: DocVideoDtl
}

/** 视频查询参数 */
export interface DocVideoQueryParams {
  userId?: string
  videoTitle?: string
  status?: DocVideoStatus
  auditStatus?: DocVideoAuditStatus
  broadCode?: string
  narrowCode?: string
  deleted?: number
  pageNum?: number
  pageSize?: number
}

/** 视频分页数据 */
export interface DocVideoPageData {
  list: DocVideo[]
  total: number
  pageNum: number
  pageSize: number
}

/** 新增视频输入 */
export interface DocVideoCreateInput {
  userId: string
  videoTitle: string
  fileId?: string
  coverFileId?: string
  tags?: string
  fileContent?: string
  broadCode: string
  narrowCode?: string
  metaData?: string
  status?: DocVideoStatus
  auditStatus?: DocVideoAuditStatus
  isPinned?: number
  isRecommended?: number
}

/** 修改视频输入 */
export interface DocVideoUpdateInput {
  id: string
  videoTitle?: string
  fileId?: string
  coverFileId?: string
  tags?: string
  fileContent?: string
  broadCode?: string
  narrowCode?: string
  metaData?: string
  status?: DocVideoStatus
  auditStatus?: DocVideoAuditStatus
  isPinned?: number
  isRecommended?: number
}

/** 批量更新状态参数 */
export interface DocVideoBatchStatusParams {
  ids: string[]
  status: DocVideoStatus
}

/** 保存草稿输入 */
export interface DocVideoDraftInput {
  userId: string
  videoTitle: string
  fileId?: string
  coverFileId?: string
  tags?: string
  fileContent?: string
  broadCode: string
  narrowCode?: string
}

/** 视频交互数据 */
export interface DocVideoInteraction {
  success: boolean
  viewCount: number
  likeCount: number
  collectCount: number
  hasLiked: boolean | null
  hasCollected: boolean | null
}

// ===== 视频评论管理类型 =====

/** 评论状态：1-正常，2-隐藏，3-删除 */
export type DocVideoCommentStatus = 1 | 2 | 3

/** 评论审核状态：0-待审核，1-审核通过，2-审核驳回 */
export type DocVideoCommentAuditStatus = 0 | 1 | 2

/** 评论作者信息（前台接口返回格式） */
export interface DocVideoCommentAuthor {
  id: string
  name: string
  avatar: string
}

/** 被回复对象信息（前台接口返回格式） */
export interface DocVideoCommentReplyTo {
  id: string
  name: string
}

/** 前台评论回复项（挂在根评论下的回复） */
export interface DocVideoCommentReply {
  id: string
  content: string
  createdAt: string
  likes: number
  isLiked: boolean
  status: DocVideoCommentStatus
  author: DocVideoCommentAuthor
  replyTo: DocVideoCommentReplyTo
}

/** 前台评论列表项（对接 /comments/{videoId} 接口） */
export interface DocVideoComment {
  id: string
  content: string
  createdAt: string
  likes: number
  isLiked: boolean
  status: DocVideoCommentStatus
  author: DocVideoCommentAuthor
  replies: DocVideoCommentReply[]
}

/** 前台评论分页数据 */
export interface DocVideoCommentPageData {
  list: DocVideoComment[]
  total: number
  pageNum: number
  pageSize: number
}

/** 后台评论列表项（对接后台管理接口） */
export interface DocVideoCommentAdmin {
  id: string
  videoId: string
  commentUserId: string
  commentContent: string
  parentCommentId: string | null
  replyUserId: string | null
  auditStatus: DocVideoCommentAuditStatus
  status: DocVideoCommentStatus
  version: number
  deleted: number
  createTime: string
  updateTime: string
}

/** 评论查询参数 */
export interface DocVideoCommentQueryParams {
  videoId?: string
  commentUserId?: string
  commentContent?: string
  auditStatus?: DocVideoCommentAuditStatus
  status?: DocVideoCommentStatus
  deleted?: number
  pageNum?: number
  pageSize?: number
}

/** 修改评论输入 */
export interface DocVideoCommentUpdateInput {
  id: string
  commentContent?: string
  auditStatus?: DocVideoCommentAuditStatus
  status?: DocVideoCommentStatus
}
