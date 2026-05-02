/**
 * Markdown 预览组件 - 基于 react-markdown + remark-gfm
 *
 * 渲染 Markdown 字符串为带 Tailwind Typography 样式的 HTML，
 * 支持 GFM (表格、删除线、任务列表等)。
 * 已做性能优化：React.memo 避免不必要重渲染。
 */

import { memo } from 'react'
import type { Components } from 'react-markdown'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export interface MarkdownPreviewProps {
  /** Markdown 文本 */
  value?: string
  /** 自定义 className */
  className?: string
  /** 自定义组件覆盖（用于标题锚点等扩展） */
  components?: Components
}

/**
 * Markdown 预览（react-markdown 封装）
 * 使用 memo 避免父组件更新时重新解析渲染
 */
export const MarkdownPreview = memo(function MarkdownPreview({
  value = '',
  className,
  components,
}: MarkdownPreviewProps) {
  // 过滤空 src 图片，避免浏览器重新下载整个页面
  const defaultImgComponent: Components['img'] = ({ src, alt, ...props }) => {
    if (!src) return null
    return <img src={src} alt={alt} {...props} />
  }

  const mergedComponents = components
    ? { img: defaultImgComponent, ...components }
    : { img: defaultImgComponent }

  return (
    <div
      className={
        'zsk-markdown-preview prose prose-sm max-w-none dark:prose-invert ' +
        'prose-pre:bg-content2 prose-pre:text-foreground ' +
        'prose-code:before:content-none prose-code:after:content-none ' +
        '[&_code]:font-mono [&_code]:text-sm ' +
        (className ?? '')
      }
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={mergedComponents}>
        {value}
      </ReactMarkdown>
    </div>
  )
})

export default MarkdownPreview
