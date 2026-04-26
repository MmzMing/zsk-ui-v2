/**
 * Markdown 编辑器组件 - 基于 Milkdown Crepe (@milkdown/crepe + @milkdown/react)
 *
 * 使用方式：
 *   <MarkdownEditor value={md} onChange={setMd} placeholder="输入 markdown..." />
 *
 * 注意：Crepe 内部为非受控编辑器，组件仅在 value 与当前内容不一致时强制刷新一次。
 */

import '@milkdown/crepe/theme/common/style.css'
import lightThemeUrl from '@milkdown/crepe/theme/frame.css?url'
import darkThemeUrl from '@milkdown/crepe/theme/frame-dark.css?url'

import { useEffect, useRef, useState } from 'react'
import { Crepe } from '@milkdown/crepe'
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react'

/**
 * 读取当前 <html> 上的实际主题。
 * 由 `useTheme()` 写入 `class="dark"` / `data-theme="..."`，
 * 与前台/后台主题独立设置保持一致。
 */
function readActualTheme(): 'light' | 'dark' {
  if (typeof document === 'undefined') return 'light'
  const root = document.documentElement
  if (root.classList.contains('dark')) return 'dark'
  const attr = root.getAttribute('data-theme')
  if (attr === 'dark') return 'dark'
  if (attr === 'light') return 'light'
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'light'
}

/**
 * 监听 <html> 的 class / data-theme 变化，返回当前主题。
 * 这样编辑器主题跟随全局 useTheme()，自动适配前台/后台独立主题。
 */
function useActualTheme(): 'light' | 'dark' {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => readActualTheme())

  useEffect(() => {
    if (typeof document === 'undefined') return

    const root = document.documentElement
    const sync = () => setTheme(readActualTheme())

    const observer = new MutationObserver(sync)
    observer.observe(root, { attributes: true, attributeFilter: ['class', 'data-theme'] })

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener('change', sync)

    return () => {
      observer.disconnect()
      mq.removeEventListener('change', sync)
    }
  }, [])

  return theme
}

/**
 * 根据当前主题切换 Milkdown Crepe 的样式表。
 */
function useMilkdownTheme() {
  const actual = useActualTheme()

  useEffect(() => {
    const id = 'milkdown-crepe-theme'
    let link = document.getElementById(id) as HTMLLinkElement | null

    if (!link) {
      link = document.createElement('link')
      link.id = id
      link.rel = 'stylesheet'
      document.head.appendChild(link)
    }

    link.href = actual === 'dark' ? darkThemeUrl : lightThemeUrl
  }, [actual])
}

export interface MarkdownEditorProps {
  /** Markdown 文本 */
  value?: string
  /** 内容变更回调，返回 markdown 字符串 */
  onChange?: (markdown: string) => void
  /** 占位文本 */
  placeholder?: string
  /** 是否只读 */
  readOnly?: boolean
  /** 编辑区高度 (默认 400px) */
  height?: number | string
  /** 自定义 className，作用于外层容器 */
  className?: string
}

/**
 * 内部编辑器（必须包裹在 MilkdownProvider 内）
 */
function CrepeEditor({
  value = '',
  onChange,
  placeholder,
  readOnly,
}: Pick<MarkdownEditorProps, 'value' | 'onChange' | 'placeholder' | 'readOnly'>) {
  // 保存 Crepe 实例引用，便于受控同步与事件监听
  const crepeRef = useRef<Crepe | null>(null)
  // 最近一次由编辑器内部触发的内容快照，避免外部回写造成循环
  const lastEmittedRef = useRef<string>(value)

  useEditor((root) => {
    const crepe = new Crepe({
      root,
      defaultValue: value,
      featureConfigs: {
        [Crepe.Feature.Placeholder]: {
          text: placeholder ?? '请输入 Markdown 内容...',
        },
      },
    })

    crepe.on((listener) => {
      listener.markdownUpdated((_ctx, markdown) => {
        lastEmittedRef.current = markdown
        onChange?.(markdown)
      })
    })

    crepeRef.current = crepe
    return crepe
  })

  // 只读切换
  useEffect(() => {
    crepeRef.current?.setReadonly(!!readOnly)
  }, [readOnly])

  return <Milkdown />
}

/**
 * Markdown 编辑器（Milkdown Crepe 封装）
 */
export function MarkdownEditor({
  value = '',
  onChange,
  placeholder,
  readOnly = false,
  height = 400,
  className,
}: MarkdownEditorProps) {
  useMilkdownTheme()

  return (
    <div
      className={
        'zsk-milkdown-editor border border-default-200 rounded-md overflow-hidden bg-content1 ' +
        (className ?? '')
      }
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
    >
      <MilkdownProvider>
        <CrepeEditor
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          readOnly={readOnly}
        />
      </MilkdownProvider>
    </div>
  )
}

export default MarkdownEditor
