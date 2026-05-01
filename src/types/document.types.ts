/**
 * 文档（笔记）类型定义
 * 对接后端 DocNoteController 接口
 */

// 文档状态：1-发布，2-下架，3-草稿
export type DocNoteStatus = 1 | 2 | 3

// 审核状态：0-待审核，1-已通过，2-已拒绝
export type DocAuditStatus = 0 | 1 | 2

/** 作者信息 */
export interface DocAuthor {
  id: string
  name: string
  avatar: string
}

/** 封面文件信息 */
export interface DocCoverFile {
  fileId: string
  fileUrl: string
}

/** 统计信息 */
export interface DocStats {
  views: number
  likes: number
  favorites: number
  isLiked: boolean
  isFavorited: boolean
}

/** 文档列表项 */
export interface DocNote {
  id: string
  userId: string
  author: DocAuthor
  noteName: string
  noteTags: string
  description: string
  coverFile: DocCoverFile
  broadCode: string
  narrowCode: string
  noteGrade: number
  noteMode: number
  suitableUsers: string
  auditStatus: DocAuditStatus
  status: DocNoteStatus
  stats: DocStats
  publishTime: string
  isPinned: number
  isRecommended: number
  seoTitle: string
  seoDescription: string
  seoKeywords: string
  deleted: number
  createTime: string
  updateTime: string
}

/** 文档查询参数 */
export interface DocNoteQueryParams {
  userId?: string
  noteName?: string
  status?: DocNoteStatus
  auditStatus?: DocAuditStatus
  broadCode?: string
  deleted?: number
  pageNum?: number
  pageSize?: number
}

/** 文档分页数据 */
export interface DocNotePageData {
  list: DocNote[]
  total: number
  pageNum: number
  pageSize: number
}

/** 新增文档输入 */
export interface DocNoteCreateInput {
  userId: string
  noteName: string
  noteTags?: string
  description?: string
  coverFileId?: string
  broadCode: string
  narrowCode?: string
  noteGrade?: number
  noteMode?: number
  suitableUsers?: string
  status?: DocNoteStatus
  auditStatus?: DocAuditStatus
  publishTime?: string
  cover?: string
  isPinned?: number
  isRecommended?: number
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string
}

/** 修改文档输入 */
export interface DocNoteUpdateInput {
  id: string
  noteName?: string
  noteTags?: string
  description?: string
  coverFileId?: string
  broadCode?: string
  narrowCode?: string
  noteGrade?: number
  noteMode?: number
  suitableUsers?: string
  status?: DocNoteStatus
  auditStatus?: DocAuditStatus
  publishTime?: string
  cover?: string
  isPinned?: number
  isRecommended?: number
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string
}

/** 批量更新状态参数 */
export interface DocNoteBatchStatusParams {
  ids: string[]
  status: 'published' | 'offline'
}

/** 批量迁移分类参数 */
export interface DocNoteBatchCategoryParams {
  ids: string[]
  category: string
}

/** 笔记正文详情（document_note_dtl） */
export interface DocNoteDtl {
  id: string
  tenantId: string
  noteId: string
  content: string
  version: string
  createName: string
  createTime: string
  updateName: string
  updateTime: string
  deleted: number
}

/** 笔记元信息提交体（创建/更新聚合接口） */
export interface DocNoteAggregateMeta {
  id?: string
  userId?: string
  noteName: string
  noteTags?: string
  description?: string
  coverFileId?: string
  broadCode: string
  narrowCode?: string
  noteGrade?: number
  noteMode?: number
  suitableUsers?: string
  status?: DocNoteStatus
  auditStatus?: DocAuditStatus
  publishTime?: string
  isPinned?: number
  isRecommended?: number
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string
}

/** 创建/更新聚合（元信息 + 正文） */
export interface DocNoteAggregateInput {
  docNote: DocNoteAggregateMeta
  content: string
}

/** 聚合查询返回（元信息 + 正文） */
export interface DocNoteFull extends DocNote {
  /** 笔记正文（Markdown） */
  content: string
}

// ===== 笔记评论管理类型 =====

/** 评论状态：1-正常，2-隐藏，3-删除 */
export type DocCommentStatus = 1 | 2 | 3

/** 评论审核状态：0-待审核，1-审核通过，2-审核驳回 */
export type DocCommentAuditStatus = 0 | 1 | 2

/** 评论作者信息（前台接口返回格式） */
export interface DocCommentAuthor {
  id: string
  name: string
  avatar: string
}

/** 被回复对象信息（前台接口返回格式） */
export interface DocCommentReplyTo {
  id: string
  name: string
}

/** 前台评论列表项（对接 /comments/{noteId} 接口） */
export interface DocNoteComment {
  id: string
  content: string
  createdAt: string
  likes: number
  isLiked: boolean
  status: DocCommentStatus
  author: DocCommentAuthor
  replies: DocNoteCommentReply[]
}

/** 前台评论回复项（挂在根评论下的回复） */
export interface DocNoteCommentReply {
  id: string
  content: string
  createdAt: string
  likes: number
  isLiked: boolean
  status: DocCommentStatus
  author: DocCommentAuthor
  replyTo: DocCommentReplyTo
}

/** 前台评论分页数据 */
export interface DocNoteCommentPageData {
  list: DocNoteComment[]
  total: number
  pageNum: number
  pageSize: number
}

/** 后台评论列表项（对接后台管理接口） */
export interface DocNoteCommentAdmin {
  id: string
  noteId: string
  commentUserId: string
  commentContent: string
  parentCommentId: string | null
  replyUserId: string | null
  auditStatus: DocCommentAuditStatus
  status: DocCommentStatus
  version: number
  deleted: number
  createTime: string
  updateTime: string
}

/** 评论查询参数 */
export interface DocNoteCommentQueryParams {
  noteId?: string
  commentUserId?: string
  commentContent?: string
  auditStatus?: DocCommentAuditStatus
  status?: DocCommentStatus
  deleted?: number
  pageNum?: number
  pageSize?: number
}

/** 修改评论输入 */
export interface DocNoteCommentUpdateInput {
  id: string
  commentContent?: string
  auditStatus?: DocCommentAuditStatus
  status?: DocCommentStatus
}

// ===== 前台文档详情类型（对接 docHomeNote 接口） =====

/** 前台文档元信息+详情 */
export interface DocHomeNoteDetail {
  id: string
  title: string
  content: string
  category: string
  tags: string
  description: string
  coverUrl: string
  date: string
}

/** 前台文档交互信息 */
export interface DocHomeInteraction {
  viewCount: number
  likeCount: number
  favoriteCount: number
  isLiked: boolean
  isFavorited: boolean
  author: DocHomeAuthor
}

/** 前台文档作者信息（含粉丝/关注状态） */
export interface DocHomeAuthor {
  id: string
  name: string
  avatar: string
  fans: number
  isFollowing: boolean
}

/** 前台评论作者信息（含粉丝/关注状态） */
export interface DocHomeCommentAuthor {
  id: string
  name: string
  avatar: string
  fans: number
  isFollowing: boolean
}

/** 前台评论回复目标信息 */
export interface DocHomeCommentReplyTo {
  id: string
  name: string
  avatar: string
  fans: number
  isFollowing: boolean
}

/** 前台评论列表项（对接 /comments/{noteId} 接口，B站式二级结构） */
export interface DocHomeComment {
  id: string
  content: string
  author: DocHomeCommentAuthor
  createdAt: string
  likes: number
  isLiked: boolean
  replies: DocHomeCommentReply[]
  replyTo: DocHomeCommentReplyTo | null
}

/** 前台评论回复项 */
export interface DocHomeCommentReply {
  id: string
  content: string
  author: DocHomeCommentAuthor
  createdAt: string
  likes: number
  isLiked: boolean
  replies: DocHomeCommentReply[]
  replyTo: DocHomeCommentReplyTo | null
}

/** 前台评论分页数据 */
export interface DocHomeCommentPageData {
  list: DocHomeComment[]
  total: number
  pageNum: number
  pageSize: number
}

/** 发表评论请求体 */
export interface DocHomeCommentInput {
  noteId: string
  content: string
  parentId?: string | null
  replyToId?: string | null
}

/** 交互操作结果 */
export interface DocHomeToggleResult {
  success: boolean
  status: boolean
  count: number
}

// ===== 前台用户作品主页类型（对接 docHomeUser 接口） =====

/** 用户作品类型筛选 */
export type DocHomeUserWorkType = 'note' | 'video'

/** 用户作品列表项（对接 /docHomeUser/{userId}/works 接口） */
export interface DocHomeUserWorksVo {
  /** 作品ID */
  id: string
  /** 作品标题 */
  title: string
  /** 作品类型（note-笔记 video-视频） */
  type: DocHomeUserWorkType
  /** 作品描述/简介 */
  description: string
  /** 封面图访问地址 */
  coverUrl: string
  /** 大类分类编码 */
  category: string
  /** 标签（多个用英文逗号分隔） */
  tags: string
  /** 浏览量（从Redis缓存获取） */
  viewCount: number
  /** 点赞数（从Redis缓存获取） */
  likeCount: number
  /** 收藏数（从Redis缓存获取） */
  favoriteCount: number
  /** 创建时间（格式：yyyy-MM-dd HH:mm:ss） */
  createTime: string
}

/** 用户作品分页数据 */
export interface DocHomeUserWorksPageData {
  /** 作品列表 */
  list: DocHomeUserWorksVo[]
  /** 总记录数 */
  total: number
  /** 当前页码 */
  pageNum: number
  /** 每页大小 */
  pageSize: number
  /** 总页数 */
  totalPages: number
  /** 是否有下一页 */
  hasNext: boolean
  /** 是否有上一页 */
  hasPrevious: boolean
}

/** 用户作品统计（对接 /docHomeUser/{userId}/stats 接口） */
export interface DocHomeUserStatsVo {
  /** 总获赞数（所有笔记点赞数 + 所有视频点赞数） */
  totalLikeCount: number
  /** 总浏览数（所有笔记浏览数 + 所有视频浏览数） */
  totalViewCount: number
  /** 总收藏数（所有笔记收藏数 + 所有视频收藏数） */
  totalFavoriteCount: number
  /** 已发布且审核通过的笔记数量 */
  noteCount: number
  /** 已发布且审核通过的视频数量 */
  videoCount: number
}
