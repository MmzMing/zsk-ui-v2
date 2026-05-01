/** 通知公告相关类型定义 */

/** 公告类型：1-通知 / 2-公告 */
export type NoticeType = '1' | '2'

/** 公告状态：0-正常 / 1-关闭 */
export type NoticeStatus = '0' | '1'

/** 通知公告实体 */
export interface SysNotice {
  id: string
  noticeTitle: string
  noticeType: NoticeType
  content: string
  status: NoticeStatus
  createBy?: string
  createTime?: string
  updateBy?: string
  updateTime?: string
}

/** 查询参数 */
export interface SysNoticeQueryParams {
  noticeTitle?: string
  status?: NoticeStatus
}

/** 创建请求体 */
export interface SysNoticeCreateInput {
  noticeTitle: string
  noticeType: NoticeType
  content: string
  status?: NoticeStatus
}

/** 更新请求体 */
export interface SysNoticeUpdateInput {
  id: string
  noticeTitle?: string
  noticeType?: NoticeType
  content?: string
  status?: NoticeStatus
}
