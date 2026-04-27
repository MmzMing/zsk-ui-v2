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

/** 状态选项 */
export interface DocNoteStatusOption {
  value: DocNoteStatus
  label: string
}

/** 审核状态选项 */
export interface DocAuditStatusOption {
  value: DocAuditStatus
  label: string
}

/** 文档状态选项列表 */
export const DOC_NOTE_STATUS_OPTIONS: DocNoteStatusOption[] = [
  { value: 1, label: '发布' },
  { value: 2, label: '下架' },
  { value: 3, label: '草稿' }
]

/** 审核状态选项列表 */
export const DOC_AUDIT_STATUS_OPTIONS: DocAuditStatusOption[] = [
  { value: 0, label: '待审核' },
  { value: 1, label: '已通过' },
  { value: 2, label: '已拒绝' }
]

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
