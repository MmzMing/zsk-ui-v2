/**
 * 前台视频详情类型定义
 * 对接后端 DocHomeVideoController 接口
 */

/** 前台视频元信息+详情 */
export interface HomeVideoDetail {
  id: string
  title: string
  description: string
  videoUrl: string
  coverUrl: string
  category: string
  tags: string[]
}

/** 前台视频作者信息（含粉丝/关注状态） */
export interface HomeVideoAuthor {
  id: string
  name: string
  avatar: string
  fans: number
  isFollowing: boolean
}

/** 前台视频交互信息 */
export interface HomeVideoInteraction {
  viewCount: number
  likeCount: number
  favoriteCount: number
  isLiked: boolean
  isFavorited: boolean
  author: HomeVideoAuthor
}

/** 交互操作结果（点赞/收藏/关注） */
export interface HomeVideoToggleResult {
  success: boolean
  status: boolean
  count: number
}

/** 前台评论作者信息（含粉丝/关注状态） */
export interface HomeVideoCommentAuthor {
  id: string
  name: string
  avatar: string
  fans: number
  isFollowing: boolean
}

/** 前台评论回复目标信息 */
export interface HomeVideoCommentReplyTo {
  id: string
  name: string
  avatar: string
  fans: number
  isFollowing: boolean
}

/** 前台评论列表项（B站式二级结构） */
export interface HomeVideoComment {
  id: string
  content: string
  author: HomeVideoCommentAuthor
  createdAt: string
  likes: number
  isLiked: boolean
  replies: HomeVideoComment[]
  replyTo: HomeVideoCommentReplyTo | null
}

/** 前台评论分页数据 */
export interface HomeVideoCommentPageData {
  list: HomeVideoComment[]
  total: number
  pageNum: number
  pageSize: number
}

/** 发表评论请求体 */
export interface HomeVideoCommentInput {
  videoId: string
  content: string
  parentId?: string | null
  replyToId?: string | null
}

/** 合集中的视频项 */
export interface HomeCollectionVideo {
  id: string
  title: string
  videoUrl: string
  coverUrl: string
  description: string
  viewCount: number
}

/** 视频合集 */
export interface HomeVideoCollection {
  id: string
  collectionName: string
  description: string
  coverUrl: string
  videoCount: number
  videos: HomeCollectionVideo[]
}
