/**
 * 文档详情页
 * 左-中-右三栏布局，渐进式加载，评论区懒加载
 * 左侧：Tracing Beam 装饰光束
 * 中间：导航栏 → 元信息 → 交互栏 → 正文 → 评论区
 * 右侧：悬浮目录
 * 移动端：隐藏左右栏，单栏展示
 * 已优化：组件拆分、memo、headingComponents 静态化、LazyMarkdownPreview 分片渲染
 */

// ===== 1. 依赖导入区域 =====
// React 核心
import { useMemo, memo, useCallback } from 'react'

// React Router
import { useParams } from 'react-router-dom'

// 组件
import { StatusState } from '@/components/ui/StatusState'
import { LazyMarkdownPreview } from '@/components/ui/editor'

// 工具函数
import { downloadTextAsFile } from '@/utils/common'

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
import DocumentDetailSkeleton from './DocumentDetailSkeleton'

// 第三方类型
import type { Components } from 'react-markdown'
import type { ElementType, ComponentPropsWithoutRef } from 'react'

// ===== 2. 通用工具函数区域 =====
/**
 * 标题文本转锚点 id 的统一逻辑
 * extractHeadings 和 headingComponents 共用，避免重复正则计算
 * @param text - 标题纯文本
 * @returns 锚点 id
 */
function headingTextToId(text: string): string {
  return (
    'h-' +
    text
      .toLowerCase()
      .replace(/<[^>]*>/g, '')
      .replace(/[^\w一-鿿]+/g, '-')
      .replace(/^-+|-+$/g, '')
  )
}

/**
 * 从 Markdown 文本中提取 h1-h4 标题
 * 自动过滤代码块（``` 和 ~~~）内的内容，避免代码注释被误识别为标题
 * @param md - Markdown 文本
 * @returns 目录项列表
 */
function extractHeadings(md: string): TocItem[] {
  // 过滤代码块内容，将代码块内的行替换为空行以保持行号一致
  const stripCodeBlocks = (text: string): string => {
    const lines = text.split('\n')
    const result: string[] = []
    let inCodeBlock = false

    for (const line of lines) {
      if (/^\s*(```|~~~)/.test(line)) {
        inCodeBlock = !inCodeBlock
        result.push('')
      } else if (!inCodeBlock) {
        result.push(line)
      } else {
        result.push('')
      }
    }

    return result.join('\n')
  }

  const cleanedMd = stripCodeBlocks(md)
  const headingRegex = /^(#{1,4})\s+(.+)$/gm
  const result: TocItem[] = []
  let match: RegExpExecArray | null

  while ((match = headingRegex.exec(cleanedMd)) !== null) {
    const level = match[1].length
    const text = match[2].trim()
    const id = headingTextToId(text)
    result.push({ id, text, level })
  }

  return result
}

const headingLevels = ['h1', 'h2', 'h3', 'h4'] as const

const headingComponents: Components = {}

headingLevels.forEach((level) => {
  headingComponents[level] = memo(
    function HeadingComponent({ children, ...props }: ComponentPropsWithoutRef<ElementType>) {
      const text =
        typeof children === 'string'
          ? children
          : Array.isArray(children)
            ? children
              .map((c) => (typeof c === 'string' ? c : ''))
              .join('')
            : ''
      const id = headingTextToId(text)
      const Tag = level as ElementType
      return <Tag id={id} {...props}>{children}</Tag>
    }
  )
})

// ===== 3. UI渲染逻辑区域 =====
/**
 * 文档正文渲染区（独立组件，避免父级状态变化导致重渲染）
 */
const DocumentContent = memo(function DocumentContent({ content }: { content: string }) {
  return (
    <section className="py-8">
      <LazyMarkdownPreview
        value={content}
        className="max-w-none"
        components={headingComponents}
        threshold={6000}
      />
    </section>
  )
})

// ===== 4. 导出区域 =====
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

  // 下载 Markdown 文件
  const handleDownload = useCallback(() => {
    if (!detail) return
    const filename = `${detail.title || '文档'}.md`
    downloadTextAsFile(detail.content ?? '', filename, 'text/markdown;charset=utf-8')
  }, [detail])

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
              onDownload={handleDownload}
            />

            {/* 文档正文渲染区 */}
            <DocumentContent content={detail.content ?? ''} />

            {/* 评论区 */}
            <CommentSection noteId={id!} />
          </div>

          {/* 右侧：悬浮目录 */}
          <aside className="hidden md:block shrink-0">
            <div className="sticky top-20 space-y-6">
              <FloatingTOC items={tocItems} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
