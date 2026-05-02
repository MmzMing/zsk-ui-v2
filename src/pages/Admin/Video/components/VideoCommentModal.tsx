/**
 * 视频评论管理弹窗
 *
 * 功能：
 * - 根据视频ID查询该视频的所有评论（使用前台 /comments/{videoId} 接口）
 * - 采用B站式评论结构：根评论 + 挂在根评论下的回复列表
 * - 评论内容限制100字显示，悬停查看完整内容（超过100字自动换行）
 * - 支持 Switch 切换评论状态（1正常 / 2隐藏）
 * - 支持删除评论
 * - 后端分页
 */

// ===== 1. 依赖导入区域 =====
import { useState, useEffect, useCallback } from 'react'

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Switch,
  Tooltip,
  Pagination,
  Avatar,
  Chip,
} from '@heroui/react'

import { MessageSquare, Trash2, X, ThumbsUp } from 'lucide-react'

import { toast } from '@/utils/toast'
import { formatDateTime, truncateText } from '@/utils/format'

import { StatusState } from '@/components/ui/StatusState'

import {
  getDocVideoComments,
  deleteDocVideoComment,
  updateDocVideoComment,
} from '@/api/admin/video'

import type {
  DocVideoComment,
  DocVideoCommentStatus,
  DocVideoCommentPageData,
} from '@/types/video.types'

import { PAGINATION } from '@/constants'

// ===== 2. TODO待处理导入区域 =====

// ===== 3. 状态控制逻辑区域 =====

const DEFAULT_PAGE_SIZE = PAGINATION.DEFAULT_PAGE_SIZE as number

// ===== 4. 通用工具函数区域 =====

/**
 * 截断评论内容，超过100字显示省略号
 * 使用工具函数 truncateText 实现
 */
function truncateComment(content: string, maxLength = 100): string {
  if (!content) return '-'
  return truncateText(content, maxLength)
}

/**
 * 获取评论状态对应的 Chip 颜色
 */
function getCommentStatusColor(status: DocVideoCommentStatus): 'success' | 'warning' | 'danger' {
  const colorMap: Record<number, 'success' | 'warning' | 'danger'> = {
    1: 'success',
    2: 'warning',
    3: 'danger',
  }
  return colorMap[status] ?? 'default'
}

/**
 * 获取评论状态的显示标签
 */
function getCommentStatusLabel(status: DocVideoCommentStatus): string {
  const labelMap: Record<number, string> = {
    1: '正常',
    2: '隐藏',
    3: '删除',
  }
  return labelMap[status] ?? String(status)
}

// ===== 5. 注释代码函数区 =====

// ===== 6. 错误处理函数区域 =====

// ===== 7. 数据处理函数区域 =====

// ===== 8. UI渲染逻辑区域 =====

export interface VideoCommentModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  videoId: string
  videoTitle?: string
}

/**
 * 单条评论项组件（根评论或回复共用）
 */
interface CommentItemProps {
  id: string
  authorName: string
  authorAvatar: string
  content: string
  createdAt: string
  likes: number
  status: DocVideoCommentStatus
  isReply?: boolean
  replyToName?: string
  onToggleStatus: (id: string, currentStatus: DocVideoCommentStatus) => void
  onDelete: (id: string) => void
}

function CommentItem({
  id,
  authorName,
  authorAvatar,
  content,
  createdAt,
  likes,
  status,
  isReply = false,
  replyToName,
  onToggleStatus,
  onDelete,
}: CommentItemProps) {
  return (
    <div className={`flex gap-3 ${isReply ? 'ml-12 mt-3' : 'mt-4'}`}>
      {/* 用户头像 */}
      <Avatar src={authorAvatar} name={authorName} size="sm" className="flex-shrink-0" />

      {/* 评论内容区域 */}
      <div className="flex-1 min-w-0">
        {/* 头部：用户名 + 回复对象 + 时间 */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium">{authorName}</span>
          {isReply && replyToName && (
            <span className="text-xs text-default-500">
              回复 <span className="text-primary">{replyToName}</span>
            </span>
          )}
          <span className="text-xs text-default-400">
            {createdAt ? formatDateTime(createdAt) : '-'}
          </span>
        </div>

        {/* 评论内容：超过100字截断，悬停显示完整内容 */}
        <div className="mt-1">
          <Tooltip
            content={
              <div className="max-w-xs whitespace-normal break-words text-sm">
                {content || '-'}
              </div>
            }
            placement="top-start"
            delay={300}
            closeDelay={100}
          >
            <p className="text-sm text-default-700 cursor-help leading-relaxed">
              {truncateComment(content)}
            </p>
          </Tooltip>
        </div>

        {/* 底部：点赞数 + 状态开关 + 删除按钮 */}
        <div className="flex items-center gap-3 mt-2">
          {/* 点赞数 */}
          <div className="flex items-center gap-1 text-xs text-default-500">
            <ThumbsUp size={12} />
            <span>{likes}</span>
          </div>

          {/* 状态切换开关 */}
          <div className="flex items-center gap-2">
            <Switch
              size="sm"
              color="primary"
              isSelected={status === 1}
              onValueChange={() => onToggleStatus(id, status)}
              aria-label="评论状态"
            />
            <Chip size="sm" variant="flat" color={getCommentStatusColor(status)}>
              {getCommentStatusLabel(status)}
            </Chip>
          </div>

          {/* 删除按钮 */}
          <Button
            isIconOnly
            size="sm"
            variant="light"
            color="danger"
            className="min-w-0 w-6 h-6"
            onPress={() => onDelete(id)}
          >
            <Trash2 size={12} />
          </Button>
        </div>
      </div>
    </div>
  )
}

/**
 * 根评论组件（包含回复列表）
 */
interface RootCommentProps {
  comment: DocVideoComment
  onToggleStatus: (id: string, currentStatus: DocVideoCommentStatus) => void
  onDelete: (id: string) => void
}

function RootComment({ comment, onToggleStatus, onDelete }: RootCommentProps) {
  return (
    <div className="py-3 border-b border-default-800 last:border-b-0">
      {/* 根评论 */}
      <CommentItem
        id={comment.id}
        authorName={comment.author.name}
        authorAvatar={comment.author.avatar}
        content={comment.content}
        createdAt={comment.createdAt}
        likes={comment.likes}
        status={comment.status}
        onToggleStatus={onToggleStatus}
        onDelete={onDelete}
      />

      {/* 回复列表（B站式结构：所有回复挂在根评论下） */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              id={reply.id}
              authorName={reply.author.name}
              authorAvatar={reply.author.avatar}
              content={reply.content}
              createdAt={reply.createdAt}
              likes={reply.likes}
              status={reply.status}
              isReply
              replyToName={reply.replyTo?.name}
              onToggleStatus={onToggleStatus}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * 视频评论管理弹窗组件
 */
export function VideoCommentModal({ isOpen, onOpenChange, videoId, videoTitle }: VideoCommentModalProps) {
  // 评论列表状态
  const [commentList, setCommentList] = useState<DocVideoComment[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(DEFAULT_PAGE_SIZE)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  /**
   * 获取评论列表（使用前台 /comments/{videoId} 接口）
   */
  const fetchCommentList = useCallback(async () => {
    if (!videoId) return

    setIsLoading(true)
    try {
      const data: DocVideoCommentPageData = await getDocVideoComments(videoId, page, pageSize, 'new')

      if (data && data.list) {
        setCommentList(data.list)
        setTotal(data.total || 0)
        const calculatedTotalPages = Math.ceil((data.total || 0) / pageSize)
        setTotalPages(calculatedTotalPages > 0 ? calculatedTotalPages : 1)
      } else {
        setCommentList([])
        setTotal(0)
        setTotalPages(0)
      }
    } catch (error) {
      console.error('获取评论列表失败：', error)
      toast.error('获取评论列表失败')
      setCommentList([])
      setTotal(0)
      setTotalPages(0)
    } finally {
      setIsLoading(false)
    }
  }, [videoId, page, pageSize])

  /**
   * 切换评论状态（正常/隐藏）
   * 更新成功后直接修改本地状态，避免重新请求整个列表
   */
  const handleToggleStatus = useCallback(
    async (id: string, currentStatus: DocVideoCommentStatus) => {
      const newStatus: DocVideoCommentStatus = currentStatus === 1 ? 2 : 1
      try {
        await updateDocVideoComment({
          id,
          status: newStatus,
        })
        toast.success('状态更新成功')
        // 直接更新本地状态，避免刷新整个列表
        setCommentList((prev) =>
          prev.map((comment) => {
            // 更新根评论
            if (comment.id === id) {
              return { ...comment, status: newStatus }
            }
            // 更新回复
            if (comment.replies) {
              return {
                ...comment,
                replies: comment.replies.map((reply) =>
                  reply.id === id ? { ...reply, status: newStatus } : reply
                ),
              }
            }
            return comment
          })
        )
      } catch (error) {
        const message = error instanceof Error ? error.message : '状态更新失败'
        toast.error(message)
        console.error('切换评论状态失败：', error)
      }
    },
    []
  )

  /**
   * 删除评论
   */
  const handleDeleteComment = useCallback(
    async (id: string) => {
      try {
        await deleteDocVideoComment(id)
        toast.success('删除成功')
        fetchCommentList()
      } catch (error) {
        const message = error instanceof Error ? error.message : '删除失败'
        toast.error(message)
        console.error('删除评论失败：', error)
      }
    },
    [fetchCommentList]
  )

  // ===== 9. 页面初始化与事件绑定 =====

  useEffect(() => {
    if (isOpen && videoId) {
      setPage(1)
      fetchCommentList()
    }
  }, [isOpen, videoId])

  useEffect(() => {
    if (isOpen && videoId) {
      fetchCommentList()
    }
  }, [page, pageSize])

  // ===== 10. TODO任务管理区域 =====

  // ===== 11. 导出区域 =====

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl" scrollBehavior="inside">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              <div className="flex items-center gap-2">
                <MessageSquare size={18} className="text-primary" />
                <span>评论管理</span>
                {videoTitle && (
                  <span className="text-sm text-default-500 font-normal truncate max-w-48">
                    - {videoTitle}
                  </span>
                )}
              </div>
            </ModalHeader>

            <ModalBody className="px-4 py-2 min-h-[300px]">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <StatusState type="loading" scene="admin" />
                </div>
              ) : commentList.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <StatusState type="empty" scene="admin" />
                </div>
              ) : (
                <div className="flex flex-col">
                  {/* 评论树状列表 */}
                  {commentList.map((comment) => (
                    <RootComment
                      key={comment.id}
                      comment={comment}
                      onToggleStatus={handleToggleStatus}
                      onDelete={handleDeleteComment}
                    />
                  ))}
                </div>
              )}

              {/* 分页控件 */}
              {!isLoading && total > 0 && (
                <div className="flex items-center justify-end gap-2 mt-4 pt-2 border-t border-default-800">
                  <span className="text-xs text-default-400">共 {total} 条</span>
                  <Pagination
                    total={totalPages}
                    page={page}
                    onChange={setPage}
                    size="sm"
                    showControls
                  />
                </div>
              )}
            </ModalBody>

            <ModalFooter>
              <Button variant="flat" onPress={onClose} startContent={<X size={16} />}>
                关闭
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

export default VideoCommentModal
