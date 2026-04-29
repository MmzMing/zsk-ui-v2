/**
 * Markdown 预览组件（性能优化版）
 * 针对超长文档优化：单实例 ReactMarkdown + React.memo 避免重复渲染
 * 虚拟滚动在混合布局中效果不佳，改为一次性渲染 + 防抖优化
 */

// ===== 1. 依赖导入区域 =====
// React 核心
import { memo } from 'react'

// Markdown 渲染
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Components } from 'react-markdown'

// ===== 2. 类型定义区域 =====
interface VirtualMarkdownPreviewProps {
  /** Markdown 文本 */
  value?: string
  /** 自定义 className */
  className?: string
  /** 自定义组件覆盖 */
  components?: Components
}

// ===== 3. 导出区域 =====
/**
 * Markdown 预览（性能优化版）
 * 使用单实例 ReactMarkdown 一次性解析渲染
 * 配合 React.memo 避免父组件状态变化时重复解析
 */
export const VirtualMarkdownPreview = memo(function VirtualMarkdownPreview({
  value = '',
  className,
  components,
}: VirtualMarkdownPreviewProps) {
  return (
    <div
      className={
        'zsk-markdown-preview prose prose-sm max-w-none dark:prose-invert ' +
        'prose-pre:bg-content2 prose-pre:text-foreground ' +
        'prose-code:before:content-none prose-code:after:content-none ' +
        (className ?? '')
      }
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {value}
      </ReactMarkdown>
    </div>
  )
})

export default VirtualMarkdownPreview
