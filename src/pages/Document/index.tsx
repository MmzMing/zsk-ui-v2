/**
 * 文档详情页
 * 左-中-右三栏布局，渐进式加载，评论区懒加载
 * 左侧：Tracing Beam 装饰光束
 * 中间：导航栏 → 元信息 → 交互栏 → 正文 → 评论区
 * 右侧：悬浮目录 + 回顶滑块
 * 移动端：隐藏左右栏，单栏展示
 */

// ===== 1. 依赖导入区域 =====
// React 核心
import { useMemo } from 'react'

// React Router
import { useParams } from 'react-router-dom'

// 组件
import { StatusState } from '@/components/ui/StatusState'
import { MarkdownPreview } from '@/components/ui/editor'

// 自定义 Hooks
import { useDocumentDetail } from '@/hooks/useDocumentDetail'

// 页面子组件
import DocumentNavBar from './DocumentNavBar'
import DocumentMeta from './DocumentMeta'
import DocumentInteraction from './DocumentInteraction'
import CommentSection from './CommentSection'
import FloatingTOC from './FloatingTOC'
import type { TocItem } from './FloatingTOC'
import TracingBeam from './TracingBeam'
import ScrollToTopLever from './ScrollToTopLever'
import DocumentDetailSkeleton from './DocumentDetailSkeleton'

// 第三方类型
import type { Components } from 'react-markdown'

// ===== 2. 通用工具函数区域 =====
/**
 * 从 Markdown 文本中提取 h1-h4 标题
 * @param md - Markdown 文本
 * @returns 目录项列表
 */
function extractHeadings(md: string): TocItem[] {
  const headingRegex = /^(#{1,4})\s+(.+)$/gm
  const result: TocItem[] = []
  let match: RegExpExecArray | null
  while ((match = headingRegex.exec(md)) !== null) {
    const level = match[1].length
    const text = match[2].trim()
    const id =
      'h-' +
      text
        .toLowerCase()
        .replace(/<[^>]*>/g, '')
        .replace(/[^\w一-鿿]+/g, '-')
        .replace(/^-+|-+$/g, '')
    result.push({ id, text, level })
  }
  return result
}

/**
 * 生成标题组件的 props 映射，为每个级别生成带 id 的标题
 * @returns React Markdown 组件映射
 */
function buildHeadingComponents(): Components {
  const headingLevels = ['h1', 'h2', 'h3', 'h4'] as const
  const components: Components = {}
  headingLevels.forEach((level) => {
    components[level] = ({ children, ...props }: Record<string, unknown>) => {
      const text =
        typeof children === 'string'
          ? children
          : Array.isArray(children)
            ? children
                .map((c) => (typeof c === 'string' ? c : ''))
                .join('')
            : ''
      const id =
        'h-' +
        text
          .toLowerCase()
          .replace(/<[^>]*>/g, '')
          .replace(/[^\w一-鿿]+/g, '-')
          .replace(/^-+|-+$/g, '')
      const Tag = level as keyof JSX.IntrinsicElements
      return <Tag id={id} {...props}>{children}</Tag>
    }
  })
  return components
}

// ===== 3. 导出区域 =====
/**
 * 文档详情页组件
 */
export default function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>()

  const {
    detail,
    interaction,
    isLoading,
    error,
    likeLoading,
    favLoading,
    followLoading,
    handleLike,
    handleFavorite,
    handleFollow,
    handleShare,
  } = useDocumentDetail(id!)

  // 提取目录
  const tocItems = useMemo(
    () => (detail?.content ? extractHeadings(detail.content) : []),
    [detail?.content]
  )

  // 标题渲染组件（带 id 锚点）
  const headingComponents = useMemo(() => buildHeadingComponents(), [])

  // 错误态
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <StatusState type="error" />
          <p className="text-lg text-default-600">文档未找到</p>
          <p className="text-sm text-default-400">请检查链接是否正确，或返回搜索页</p>
          <a
            href="/search"
            className="inline-block text-sm text-primary hover:underline"
          >
            返回搜索
          </a>
        </div>
      </div>
    )
  }

  // 加载态（骨架屏）
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 max-w-7xl">
          <DocumentDetailSkeleton />
        </div>
      </div>
    )
  }

  // 无数据
  if (!detail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <StatusState type="empty" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex gap-8">
          {/* 左侧：Tracing Beam */}
          <div className="hidden md:block w-16 shrink-0 relative">
            <TracingBeam />
          </div>

          {/* 中间：主内容区 */}
          <div className="flex-1 min-w-0 max-w-[780px] mx-auto">
            {/* 顶部导航栏 */}
            <DocumentNavBar title={detail.title} />

            {/* 文档元信息区 */}
            <DocumentMeta
              detail={detail}
              loading={false}
            />

            {/* 交互信息区 */}
            <DocumentInteraction
              docId={id!}
              interaction={interaction}
              likeLoading={likeLoading}
              favLoading={favLoading}
              followLoading={followLoading}
              onLike={handleLike}
              onFavorite={handleFavorite}
              onFollow={handleFollow}
              onShare={handleShare}
            />

            {/* 文档正文渲染区 */}
            <section className="py-8">
              <MarkdownPreview
                value={detail.content ?? ''}
                className="max-w-none"
                components={headingComponents}
              />
            </section>

            {/* 评论区 */}
            <CommentSection noteId={id!} />
          </div>

          {/* 右侧：悬浮目录 + 回顶滑块 */}
          <aside className="hidden md:block shrink-0">
            <div className="sticky top-20 space-y-6">
              <FloatingTOC items={tocItems} />
              <ScrollToTopLever />
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
