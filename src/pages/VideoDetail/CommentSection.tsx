/**
 * 评论区（懒加载）
 * B站式二级评论结构，支持热门/最新排序、发表评论、点赞
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import { Button, Avatar, Spinner, Textarea } from '@heroui/react'
import { Heart, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { Tabs as AceternityTabs } from '@/components/ui/aceternity/tabs'
import { toast } from '@/utils/toast'
import { useUserStore } from '@/stores/user'
import {
  getHomeVideoComments,
  postHomeVideoComment,
  toggleHomeVideoCommentLike,
} from '@/api/video'
import type { HomeVideoComment, HomeVideoCommentPageData } from '@/types/video-home.types'

interface Props {
  videoId: string
}

function relativeTime(dateStr: string): string {
  const now = Date.now()
  const past = new Date(dateStr).getTime()
  const diff = Math.floor((now - past) / 1000)
  if (diff < 60) return '刚刚'
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`
  if (diff < 2592000) return `${Math.floor(diff / 86400)}天前`
  return dateStr.slice(0, 10)
}

function CommentItem({
  comment,
  videoId,
  onReply,
  onLike,
  depth,
}: {
  comment: HomeVideoComment
  videoId: string
  onReply: (parentId: string, replyToId: string, replyToName: string) => void
  onLike: (commentId: string, isLiked: boolean) => void
  depth: number
}) {
  const [showReplies, setShowReplies] = useState(depth === 0)
  const hasReplies = comment.replies && comment.replies.length > 0

  return (
    <div className={depth > 0 ? 'ml-10' : ''}>
      <div className="flex gap-3 py-3">
        <Avatar
          src={comment.author.avatar}
          name={comment.author.name}
          size="sm"
          className="w-8 h-8 shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">{comment.author.name}</span>
            <span className="text-xs text-default-400">{relativeTime(comment.createdAt)}</span>
          </div>

          {comment.replyTo && (
            <span className="text-xs text-primary mr-1">回复 @{comment.replyTo.name}</span>
          )}

          <p className="text-sm text-default-700 mt-1 break-words">{comment.content}</p>

          <div className="flex items-center gap-4 mt-2">
            <button
              className="flex items-center gap-1 text-xs text-default-400 hover:text-danger transition-colors"
              onClick={() => onLike(comment.id, comment.isLiked)}
            >
              <Heart
                size={14}
                className={comment.isLiked ? 'fill-danger text-danger' : ''}
              />
              {comment.likes > 0 && comment.likes}
            </button>
            {depth === 0 && (
              <button
                className="flex items-center gap-1 text-xs text-default-400 hover:text-primary transition-colors"
                onClick={() => onReply(comment.id, comment.author.id, comment.author.name)}
              >
                <MessageCircle size={14} />
                回复
              </button>
            )}
          </div>
        </div>
      </div>

      {hasReplies && depth === 0 && (
        <div>
          {!showReplies ? (
            <button
              className="flex items-center gap-1 text-xs text-primary ml-10 mb-2"
              onClick={() => setShowReplies(true)}
            >
              <ChevronDown size={14} />
              展开 {comment.replies.length} 条回复
            </button>
          ) : (
            <>
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  videoId={videoId}
                  onReply={onReply}
                  onLike={onLike}
                  depth={1}
                />
              ))}
              <button
                className="flex items-center gap-1 text-xs text-default-400 ml-10 mb-2"
                onClick={() => setShowReplies(false)}
              >
                <ChevronUp size={14} />
                收起回复
              </button>
            </>
          )}
        </div>
      )}

      {hasReplies && depth > 0 && (
        <div>
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              videoId={videoId}
              onReply={onReply}
              onLike={onLike}
              depth={2}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function CommentSection({ videoId }: Props) {
  const userInfo = useUserStore((s) => s.userInfo)
  const isLoggedIn = !!userInfo

  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<HomeVideoCommentPageData | null>(null)
  const [sort, setSort] = useState<'hot' | 'new'>('new')
  const [pageNum, setPageNum] = useState(1)
  const [loadingMore, setLoadingMore] = useState(false)

  const [inputText, setInputText] = useState('')
  const [replyTo, setReplyTo] = useState<{
    parentId: string
    replyToId: string
    replyToName: string
  } | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const sentinelRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  // 懒加载触发
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !visible) {
          setVisible(true)
        }
      },
      { rootMargin: '200px' }
    )
    observerRef.current.observe(el)
    return () => observerRef.current?.disconnect()
  }, [visible])

  // 加载评论
  useEffect(() => {
    if (!visible || loading) return

    const fetchComments = async () => {
      setLoading(true)
      try {
        const res = await getHomeVideoComments(videoId, {
          pageNum: 1,
          pageSize: 10,
          sort,
        })
        setData(res)
        setPageNum(1)
      } catch {
        toast.error('评论加载失败')
      } finally {
        setLoading(false)
      }
    }
    fetchComments()
  }, [visible, videoId, sort])

  // 加载更多
  const loadMore = useCallback(async () => {
    if (!data || loadingMore) return
    setLoadingMore(true)
    try {
      const next = pageNum + 1
      const res = await getHomeVideoComments(videoId, {
        pageNum: next,
        pageSize: 10,
        sort,
      })
      setData({
        ...res,
        list: [...data.list, ...res.list],
      })
      setPageNum(next)
    } catch {
      toast.error('加载更多失败')
    } finally {
      setLoadingMore(false)
    }
  }, [data, loadingMore, pageNum, videoId, sort])

  // 发表评论
  const handleSubmit = useCallback(async () => {
    if (!inputText.trim()) return
    if (!isLoggedIn) {
      toast.info('请先登录')
      return
    }
    setSubmitting(true)
    try {
      await postHomeVideoComment({
        videoId,
        content: inputText.trim(),
        parentId: replyTo?.parentId ?? null,
        replyToId: replyTo?.replyToId ?? null,
      })
      toast.success('评论发表成功')
      setInputText('')
      setReplyTo(null)
      const res = await getHomeVideoComments(videoId, { pageNum: 1, pageSize: 10, sort })
      setData(res)
      setPageNum(1)
    } catch {
      toast.error('评论发表失败')
    } finally {
      setSubmitting(false)
    }
  }, [inputText, isLoggedIn, videoId, replyTo, sort])

  // 评论点赞
  const handleCommentLike = useCallback(
    async (commentId: string, isLiked: boolean) => {
      if (!isLoggedIn) {
        toast.info('请先登录')
        return
      }
      const updateItem = (list: HomeVideoComment[]): HomeVideoComment[] =>
        list.map((c) => {
          if (c.id === commentId) {
            return { ...c, isLiked: !isLiked, likes: c.likes + (isLiked ? -1 : 1) }
          }
          if (c.replies?.length) {
            return { ...c, replies: updateItem(c.replies) }
          }
          return c
        })

      setData((prev) => (prev ? { ...prev, list: updateItem(prev.list) } : prev))

      try {
        await toggleHomeVideoCommentLike(commentId)
      } catch {
        setData((prev) => (prev ? { ...prev, list: updateItem(prev.list) } : prev))
        toast.error('操作失败')
      }
    },
    [isLoggedIn]
  )

  const handleReply = useCallback(
    (parentId: string, replyToId: string, replyToName: string) => {
      if (!isLoggedIn) {
        toast.info('请先登录')
        return
      }
      setReplyTo({ parentId, replyToId, replyToName })
    },
    [isLoggedIn]
  )

  const hasMore = data ? data.total > data.list.length : false

  return (
    <section className="py-6 border-t border-default-200">
      <div ref={sentinelRef} />

      {!visible && (
        <div className="flex items-center justify-center py-8">
          <Spinner size="sm" />
          <span className="text-sm text-default-400 ml-2">评论区即将加载...</span>
        </div>
      )}

      {visible && (
        <>
          <h3 className="text-lg font-semibold text-foreground mb-4">
            评论 {data ? `(${data.total})` : ''}
          </h3>

          {/* 排序切换 */}
          <div className="mb-4">
            <AceternityTabs
              tabs={[
                { title: '最新', value: 'new' },
                { title: '热门', value: 'hot' },
              ]}
              activeValue={sort}
              onValueChange={(v) => setSort(v as 'new' | 'hot')}
              containerClassName="w-auto"
              tabClassName="text-sm font-medium text-default-700 dark:text-default-300"
              activeTabClassName="bg-default-800 text-white dark:bg-default-100 dark:text-default-900"
              layoutIdNamespace="video-comment-sort-pill"
            />
          </div>

          {/* 评论输入框 */}
          <div className="mb-6">
            {replyTo && (
              <div className="flex items-center gap-2 mb-2 text-xs text-default-500">
                <span>回复 @{replyTo.replyToName}</span>
                <button className="text-primary" onClick={() => setReplyTo(null)}>
                  取消
                </button>
              </div>
            )}
            <div className="flex gap-3">
              <Avatar
                src={userInfo?.avatar}
                name={userInfo?.name || '用户'}
                size="sm"
                className="w-8 h-8 shrink-0"
              />
              <div className="flex-1 space-y-2">
                <Textarea
                  placeholder={isLoggedIn ? '写下你的评论...' : '登录后发表评论'}
                  value={inputText}
                  onValueChange={setInputText}
                  minRows={2}
                  size="sm"
                  isDisabled={!isLoggedIn}
                />
                {isLoggedIn && (
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      color="default"
                      className="rounded-full bg-default-800 text-white dark:bg-default-100 dark:text-default-900"
                      onPress={handleSubmit}
                      isDisabled={!inputText.trim() || submitting}
                      isLoading={submitting}
                    >
                      发表
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 评论列表 */}
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : !data || data.list.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-default-400 text-sm">暂无评论，来说点什么吧</p>
            </div>
          ) : (
            <div>
              {data.list.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  videoId={videoId}
                  onReply={handleReply}
                  onLike={handleCommentLike}
                  depth={0}
                />
              ))}

              {hasMore && (
                <div className="flex justify-center py-4">
                  <Button
                    variant="light"
                    size="sm"
                    onPress={loadMore}
                    isLoading={loadingMore}
                  >
                    加载更多
                  </Button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </section>
  )
}
