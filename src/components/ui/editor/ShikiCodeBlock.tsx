/**
 * Shiki 代码高亮组件
 * 基于 Shiki 的 codeToHtml 实现，支持主题自适应、复制、展开收起、行号
 * 使用双主题配置（light-plus / dark-plus），通过 CSS 变量自动切换
 * 用于 react-markdown 的 code 组件覆盖
 */

// ===== 1. 依赖导入区域 =====
// React 核心
import { useState, useEffect, memo } from 'react'

// Shiki 高亮
import { codeToHtml } from 'shiki'

// 图标
import { Copy, Check, ChevronDown } from 'lucide-react'

// ===== 2. 常量定义区域 =====
/** 超过此行数时默认折叠 */
const DEFAULT_COLLAPSE_LINES = 15

// ===== 3. 状态控制逻辑区域 =====
/**
 * 从 className 中提取语言标识
 * react-markdown 会将 ```ts 解析为 className="language-ts"
 */
function extractLanguage(className?: string): string | undefined {
  if (!className) return undefined
  const match = className.match(/language-(\w+)/)
  return match ? match[1] : undefined
}

/**
 * 计算代码行数
 */
function countLines(code: string): number {
  return code.split('\n').length
}

/**
 * 生成行号 HTML（与 Shiki 输出的 pre 结构对齐）
 */
function generateLineNumbers(lineCount: number): string {
  const numbers = Array.from({ length: lineCount }, (_, i) => i + 1).join('\n')
  return `<code class="line-numbers">${numbers}</code>`
}

/**
 * 处理 Shiki 生成的 HTML，保留 CSS 变量但移除背景色
 * Shiki 会生成类似这样的 style：
 * style="background-color:#ffffff;--shiki-dark-bg:#1e1e1e;color:#24292eff;--shiki-dark:#d4d4d4"
 * 我们需要保留 --shiki-dark 变量，但移除亮色背景色（因为由 CSS 控制）
 */
function processShikiHtml(html: string): string {
  return html.replace(/<pre[^>]*style="([^"]*)"[^>]*>/g, (_match, style) => {
    const cleanedStyle = style
      // 移除亮色背景色，但保留 --shiki-dark-bg 变量
      .replace(/background-color:#[^;]+;?/g, '')
      .replace(/background:[^;]+;?/g, '')
      .trim()
    if (cleanedStyle) {
      return `<pre style="${cleanedStyle}">`
    }
    return '<pre>'
  })
}

// ===== 4. UI 渲染逻辑区域 =====
/**
 * Shiki 代码高亮块
 * 异步调用 Shiki 的 codeToHtml 生成高亮 HTML
 * 支持：主题自适应、复制、展开/收起、行号
 * 行内代码直接返回原样，避免性能开销
 */
export const ShikiCodeBlock = memo(function ShikiCodeBlock({
  children,
  className,
  inline,
}: {
  children?: React.ReactNode
  className?: string
  inline?: boolean
}) {
  const [highlighted, setHighlighted] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const code = String(children ?? '').trimEnd()
  const language = extractLanguage(className)
  const lineCount = countLines(code)
  const shouldCollapse = lineCount > DEFAULT_COLLAPSE_LINES

  // 行内代码：不使用 Shiki，保持简洁的行内样式
  if (inline) {
    return (
      <code className="px-1.5 py-0.5 rounded bg-default-100 text-primary font-mono text-sm">
        {children}
      </code>
    )
  }

  // 空代码或单行代码可能也是行内场景，但 react-markdown 对 ``` 包裹的都会走这里
  // 只有真正的多行代码块才使用 Shiki 高亮
  const isMultiline = code.includes('\n')

  // 单行代码块（如 ```java Object object```）也当作行内处理
  if (!isMultiline && code.length < 50) {
    return (
      <code className="px-1.5 py-0.5 rounded bg-default-100 text-primary font-mono text-sm">
        {children}
      </code>
    )
  }

  useEffect(() => {
    let cancelled = false

    async function highlight() {
      try {
        // 使用双主题配置，同时生成 light 和 dark 的 CSS 变量
        // Shiki 会在每个 token 上添加 --shiki-dark 变量用于暗黑模式
        const html = await codeToHtml(code, {
          lang: language ?? 'text',
          themes: {
            light: 'light-plus',
            dark: 'dark-plus',
          },
          // 明确设置 CSS 变量前缀（Shiki 默认就是 --shiki-）
          cssVariablePrefix: '--shiki-',
          // 设置默认为亮色主题
          defaultColor: 'light',
        })
        // 处理 HTML 移除背景色
        const processedHtml = processShikiHtml(html)
        if (!cancelled) {
          setHighlighted(processedHtml)
        }
      } catch {
        // Shiki 高亮失败时回退到无高亮状态
        if (!cancelled) {
          setHighlighted(null)
        }
      }
    }

    highlight()

    return () => {
      cancelled = true
    }
  }, [code, language])

  // 复制代码到剪贴板
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      console.error('复制失败')
    }
  }

  // 切换展开/收起
  const handleToggleExpand = () => {
    setExpanded((prev) => !prev)
  }

  // 高亮完成前显示原始代码，避免闪烁
  if (!highlighted) {
    return (
      <span className="shiki-wrapper group relative overflow-hidden not-prose block">
        {/* 顶部信息栏：默认显示语言，悬停显示复制 */}
        <span className="absolute top-0 right-0 z-10 px-4 py-2">
          <span className="text-xs text-default-500 font-mono group-hover:hidden">
            {language ?? 'text'}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="hidden group-hover:flex items-center gap-1 text-xs text-default-500 hover:text-foreground transition-colors"
            title="复制代码"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>复制</span>
          </button>
        </span>
        <span className="relative overflow-auto block">
          <span className="flex">
            <span
              className="select-none flex-shrink-0 py-3 px-3 text-right text-xs text-default-400 font-mono leading-[1.6] block"
              dangerouslySetInnerHTML={{ __html: generateLineNumbers(lineCount) }}
            />
            <span className="flex-1 min-w-0 py-3 px-4 block">
              <code className={className}>{children}</code>
            </span>
          </span>
        </span>
      </span>
    )
  }

  return (
    <span className="shiki-wrapper group relative overflow-hidden not-prose block">
      {/* 顶部信息栏：默认显示语言，悬停显示复制 */}
      <span className="absolute top-0 right-0 z-10 px-4 py-2">
        <span className="text-xs text-default-500 font-mono group-hover:hidden">
          {language ?? 'text'}
        </span>
        {copied ? (
          <span className="hidden group-hover:flex items-center gap-1 text-xs text-success">
            <Check className="w-3.5 h-3.5" />
            <span>已复制</span>
          </span>
        ) : (
          <button
            type="button"
            onClick={handleCopy}
            className="hidden group-hover:flex items-center gap-1 text-xs text-default-500 hover:text-foreground transition-colors"
            title="复制代码"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>复制</span>
          </button>
        )}
      </span>

      {/* 代码区域 */}
      <span
        className={
          'relative overflow-auto block ' +
          (shouldCollapse && !expanded ? 'max-h-[360px]' : '')
        }
      >
        {/* 行号 + 高亮代码 */}
        <span className="flex">
          {/* 行号列 */}
          <span
            className="select-none flex-shrink-0 py-3 px-3 text-right text-xs text-default-400 font-mono leading-[1.6] block"
            dangerouslySetInnerHTML={{
              __html: generateLineNumbers(lineCount),
            }}
          />
          {/* Shiki 高亮代码 - 双主题 CSS 变量自动切换 */}
        <span
          className="shiki flex-1 min-w-0 py-3 px-4 [&_pre]:!bg-transparent block"
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
        </span>

        {/* 折叠遮罩 */}
        {shouldCollapse && !expanded && (
          <span className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none block" />
        )}
      </span>

      {/* 底部展开按钮 */}
      {shouldCollapse && !expanded && (
        <span className="flex justify-center py-2 block">
          <button
            type="button"
            onClick={handleToggleExpand}
            className="flex items-center gap-1 px-4 py-1.5 rounded-full text-xs text-default-500 bg-default-100 hover:bg-default-200 hover:text-foreground transition-colors"
          >
            <ChevronDown className="w-3.5 h-3.5" />
            <span>显示更多</span>
          </button>
        </span>
      )}
    </span>
  )
})

export default ShikiCodeBlock
