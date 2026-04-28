/**
 * 关键字高亮组件
 */

import { useMemo, type ReactNode } from 'react'

interface HighlightTextProps {
  /** 原始文本 */
  text: string
  /** 关键字 */
  keyword: string
  /** 自定义 class */
  className?: string
}

/**
 * 转义正则特殊字符
 */
function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function HighlightText({ text, keyword, className }: HighlightTextProps) {
  const nodes: ReactNode = useMemo(() => {
    if (!keyword || !text) return text
    const escaped = escapeRegExp(keyword.trim())
    if (!escaped) return text
    const regex = new RegExp(`(${escaped})`, 'ig')
    const parts = text.split(regex)
    return parts.map((part, idx) =>
      regex.test(part) ? (
        <mark
          key={idx}
          className="rounded bg-primary-100 px-0.5 text-primary-700 dark:bg-primary-900/40 dark:text-primary-200"
        >
          {part}
        </mark>
      ) : (
        <span key={idx}>{part}</span>
      )
    )
  }, [text, keyword])

  return <span className={className}>{nodes}</span>
}
