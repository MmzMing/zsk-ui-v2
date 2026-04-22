/**
 * Markdown 预览组件 - 基于 react-markdown + remark-gfm
 *
 * 渲染 Markdown 字符串为带 Tailwind Typography 样式的 HTML，
 * 支持 GFM (表格、删除线、任务列表等)。
 */

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export interface MarkdownPreviewProps {
  /** Markdown 文本 */
  value?: string
  /** 自定义 className */
  className?: string
}

/**
 * Markdown 预览（react-markdown 封装）
 */
export function MarkdownPreview({ value = '', className }: MarkdownPreviewProps) {
  return (
    <div
      className={
        'prose prose-sm max-w-none dark:prose-invert ' +
        'prose-pre:bg-content2 prose-pre:text-foreground ' +
        'prose-code:before:content-none prose-code:after:content-none ' +
        (className ?? '')
      }
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
    </div>
  )
}

export default MarkdownPreview
