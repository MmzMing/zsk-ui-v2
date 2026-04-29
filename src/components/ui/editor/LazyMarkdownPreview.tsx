/**
 * 懒加载 Markdown 预览组件
 * 针对超长文档优化：多段渐进渲染，每段通过 requestIdleCallback 逐批加载
 * 避免一次性渲染大量 DOM 导致页面卡顿
 */

// ===== 1. 依赖导入区域 =====
// React 核心
import { useState, useEffect, useRef, memo, useMemo, useCallback } from 'react'

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
  /** 每段渲染的字符数阈值，默认 6000 */
  threshold?: number
}

// ===== 3. 通用工具函数区域 =====
/**
 * 将 Markdown 内容按段落边界分割为多个片段
 * 优先在双换行处切割，避免破坏表格/代码块
 * @param content - 完整内容
 * @param chunkSize - 每段字符数上限
 * @returns 分割后的片段数组
 */
function splitIntoChunks(content: string, chunkSize: number): string[] {
  if (content.length <= chunkSize) return [content]

  const chunks: string[] = []
  let remaining = content

  while (remaining.length > 0) {
    if (remaining.length <= chunkSize) {
      chunks.push(remaining)
      break
    }

    const breakPoint = remaining.lastIndexOf('\n\n', chunkSize)
    if (breakPoint > chunkSize * 0.5) {
      chunks.push(remaining.slice(0, breakPoint))
      remaining = remaining.slice(breakPoint)
      continue
    }

    const singleBreak = remaining.lastIndexOf('\n', chunkSize)
    if (singleBreak > chunkSize * 0.5) {
      chunks.push(remaining.slice(0, singleBreak))
      remaining = remaining.slice(singleBreak)
      continue
    }

    chunks.push(remaining.slice(0, chunkSize))
    remaining = remaining.slice(chunkSize)
  }

  return chunks
}

/**
 * 安全的 requestIdleCallback 封装
 * 优先使用浏览器原生 requestIdleCallback，降级为 setTimeout
 * 返回值统一为 number，便于 cancelIdle 取消
 */
function requestIdle(callback: () => void, timeout = 2000): number {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, { timeout })
  }
  return setTimeout(callback, 1) as unknown as number
}

/**
 * 安全的 cancelIdleCallback 封装
 * 对应 requestIdle 的取消操作
 */
function cancelIdle(id: number): void {
  if (typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
    window.cancelIdleCallback(id)
  } else {
    clearTimeout(id as unknown as ReturnType<typeof setTimeout>)
  }
}

// ===== 4. 导出区域 =====
/**
 * 懒加载 Markdown 预览
 * 超长文档多段渐进渲染：首段立即渲染，后续段逐批通过 requestIdleCallback 加载
 * 每段渲染时间可控，避免长时间阻塞主线程
 */
export const LazyMarkdownPreview = memo(function LazyMarkdownPreview({
  value = '',
  className,
  components,
  threshold = 6000,
}: LazyMarkdownPreviewProps) {
  const [renderedChunkCount, setRenderedChunkCount] = useState(1)
  const idleRef = useRef<number | null>(null)

  const chunks = useMemo(
    () => splitIntoChunks(value, threshold),
    [value, threshold]
  )

  const hasMoreChunks = renderedChunkCount < chunks.length

  // 逐批加载后续片段
  const scheduleNextChunk = useCallback(() => {
    if (!hasMoreChunks) return

    idleRef.current = requestIdle(() => {
      setRenderedChunkCount((prev) => Math.min(prev + 1, chunks.length))
    })
  }, [hasMoreChunks, chunks.length])

  // 当已渲染片段数 < 总片段数时，调度下一批
  useEffect(() => {
    if (!hasMoreChunks) return

    scheduleNextChunk()

    return () => {
      if (idleRef.current !== null) {
        cancelIdle(idleRef.current)
        idleRef.current = null
      }
    }
  }, [renderedChunkCount, hasMoreChunks, scheduleNextChunk])

  // 内容切换时重置
  useEffect(() => {
    setRenderedChunkCount(1)
  }, [value])

  // 拼接当前已渲染的片段
  const displayValue = useMemo(
    () => chunks.slice(0, renderedChunkCount).join(''),
    [chunks, renderedChunkCount]
  )

  return (
    <div className="relative">
      <MarkdownPreview value={displayValue} className={className} components={components} />
      {hasMoreChunks && (
        <div className="flex justify-center py-6">
          <Spinner size="sm" />
          <span className="text-sm text-default-400 ml-2">内容加载中...</span>
        </div>
      )}
    </div>
  )
})

export default LazyMarkdownPreview
