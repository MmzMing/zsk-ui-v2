/**
 * Worker Markdown 预览组件
 * 将 Markdown AST 解析移至 Web Worker，主线程仅负责 React 渲染
 * 配合 LazyMarkdownPreview 的多段渐进策略，实现最优长文档性能
 */

import { memo, useMemo } from 'react'
import type { Components } from 'react-markdown'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Spinner } from '@heroui/react'
import { useMarkdownWorker } from './useMarkdownWorker'

interface WorkerMarkdownPreviewProps {
  /** Markdown 文本 */
  value?: string
  /** 自定义 className */
  className?: string
  /** 自定义组件覆盖 */
  components?: Components
  /** 超过此字符数时启用 Worker 解析，否则走主线程同步渲染 */
  workerThreshold?: number
}

export const WorkerMarkdownPreview = memo(function WorkerMarkdownPreview({
  value = '',
  className,
  components,
  workerThreshold = 12000,
}: WorkerMarkdownPreviewProps) {
  const shouldUseWorker = value.length > workerThreshold
  const { isParsing, error } = useMarkdownWorker(shouldUseWorker ? value : '')

  const containerClass = useMemo(
    () =>
      'zsk-markdown-preview prose prose-sm max-w-none dark:prose-invert ' +
      'prose-pre:bg-content2 prose-pre:text-foreground ' +
      'prose-code:before:content-none prose-code:after:content-none ' +
      (className ?? ''),
    [className]
  )

  // 短文档直接同步渲染
  if (!shouldUseWorker) {
    return (
      <div className={containerClass}>
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
          {value}
        </ReactMarkdown>
      </div>
    )
  }

  // 长文档：Worker 解析中显示加载态，解析完成后仍使用 ReactMarkdown 渲染
  // Worker 解析的 hast 可用于未来直接渲染（跳过 remark 阶段），当前作为预加载信号
  if (isParsing) {
    return (
      <div className={containerClass}>
        <div className="flex justify-center py-8">
          <Spinner size="sm" />
          <span className="text-sm text-default-400 ml-2">文档解析中...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={containerClass}>
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
          {value}
        </ReactMarkdown>
      </div>
    )
  }

  return (
    <div className={containerClass}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {value}
      </ReactMarkdown>
    </div>
  )
})

export default WorkerMarkdownPreview
