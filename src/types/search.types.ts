/**
 * 全站搜索相关类型定义
 */

// 搜索类型
export type SearchType = 'all' | 'video' | 'document'

// 排序方式
export type SearchSort = 'hot' | 'latest' | ''

// 时长筛选：'' 全部时长，week 一周内，month 一个月内，year 一年内
export type SearchDuration = '' | 'week' | 'month' | 'year'

// 视图模式
export type SearchView = 'card' | 'list'

// 搜索结果项
export interface SearchItem {
  /** 资源 ID（格式：类型_原始ID，如 video_123, document_456） */
  id: string
  /** 资源类型：video=视频，document=笔记 */
  type: 'video' | 'document'
  /** 标题 */
  title: string
  /** 更新时间 */
  updateTime: string
  /** 分类编码 */
  category: string
  /** 缩略图 URL */
  thumbnail: string
  /** 视频时长（仅视频） */
  duration: string | null
  /** 播放量（仅视频） */
  playCount: number | null
  /** 阅读量（仅笔记） */
  readCount: number | null
  /** 点赞数 */
  likeCount: number
  /** 作者 ID */
  authorId: string
  /** 作者名 */
  author: string
  /** 描述 */
  description: string
  /** 标签列表 */
  tags: string[]
}

// 搜索分页结果
export interface SearchPageResult {
  /** 数据列表 */
  list: SearchItem[]
  /** 总条数 */
  total: number
  /** 页码 */
  pageNum: number
  /** 每页数量 */
  pageSize: number
}

// 搜索请求参数
export interface SearchParams {
  /** 关键字 */
  keyword?: string
  /** 搜索类型 */
  type?: SearchType
  /** 排序 */
  sort?: SearchSort
  /** 分类编码 */
  category?: string
  /** 时长筛选 */
  duration?: SearchDuration
  /** 页码 */
  pageNum?: number
  /** 每页数量 */
  pageSize?: number
}
