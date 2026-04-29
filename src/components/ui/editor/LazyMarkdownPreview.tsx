/**
 * 懒加载 Markdown 预览组件
 * 针对超长文档优化：首屏立即渲染，剩余内容通过 requestIdleCallback 渐进加载
 * 避免一次性渲染大量 DOM 导致页面卡顿
 */

// ===== 1. 依赖导入区域 =====
// React 核心
import { useState, useEffect, useRef, memo, useMemo } from 'react'

// 组件
import { MarkdownPreview } from './MarkdownPreview'

// HeroUI 组件
import { Spinner } from '@heroui/react'

// ===== 2. 类型定义区域 =====
interface LazyMarkdownPreviewProps {
  /** Markdown 文本 */
  value?: string
  /** 自定义 className */
  className?: string
  /** 自定义组件覆盖 */
  components?: import('react-markdown').Components
  /** 首屏渲染的字符数阈值，默认 8000 */
  threshold?: number
}

// ===== 3. 通用工具函数区域 =====
/**
 * 安全地分割 Markdown 内容
 * 优先在段落边界（双换行）处切割，避免破坏表格/代码块
 * @param content - 完整内容
 * @param threshold - 首屏字符阈值
 * @returns [首屏内容, 剩余内容]
 */
function splitContent(content: string, threshold: number): [string, string] {
  if (content.length <= threshold) return [content, '']

  // 优先在双换行处切割
  const breakPoint = content.lastIndexOf('\n\n', threshold)
  if (breakPoint > threshold * 0.5) {
    return [content.slice(0, breakPoint), content.slice(breakPoint)]
  }

  // 次选在单换行处切割
  const singleBreak = content.lastIndexOf('\n', threshold)
  if (singleBreak > threshold * 0.5) {
    return [content.slice(0, singleBreak), content.slice(singleBreak)]
  }

  // 兜底直接切割
  return [content.slice(0, threshold), content.slice(threshold)]
}

/**
 * 安全的 requestIdleCallback 封装
 */
function requestIdle(callback: () => void, timeout = 2000): number {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, { timeout })
  }
  // 降级使用 setTimeout
  return window.setTimeout(callback, 1)
}

function cancelIdle(id: number): void {
  if (typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
    window.cancelIdleCallback(id)
  } else {
    window.clearTimeout(id)
  }
}

// ===== 4. 导出区域 =====
/**
 * 懒加载 Markdown 预览
 * 超长文档分片渲染，避免一次性挂载大量 DOM
 */
export const LazyMarkdownPreview = memo(function LazyMarkdownPreview({
  value = '',
  className,
  components,
  threshold = 8000,
}: LazyMarkdownPreviewProps) {
  const [displayValue, setDisplayValue] = useState('')
  const [isPending, setIsPending] = useState(false)
  const idleRef = useRef<number | null>(null)
  const hasRenderedRef = useRef(false)

  const [firstChunk, restChunk] = useMemo(
    () => splitContent(value, threshold),
    [value, threshold]
  )

  useEffect(() => {
    // 重置状态
    setDisplayValue(firstChunk)
    setIsPending(!!restChunk)
    hasRenderedRef.current = false

    if (!restChunk) return

    // 使用 requestIdleCallback 在浏览器空闲时渲染剩余内容
    idleRef.current = requestIdle(() => {
      if (!hasRenderedRef.current) {
        hasRenderedRef.current = true
        setDisplayValue(value)
        setIsPending(false)
      }
    })

    return () => {
      if (idleRef.current) cancelIdle(idleRef.current)
    }
  }, [firstChunk, restChunk, value])

  return (
    <div className="relative">
      <MarkdownPreview value={displayValue} className={className} components={components} />
      {isPending && (
        <div className="flex justify-center py-6">
          <Spinner size="sm" />
          <span className="text-sm text-default-400 ml-2">内容加载中...</span>
        </div>
      )}
    </div>
  )
})

export default LazyMarkdownPreview
