/**
 * 富文本编辑器组件 - 基于 wangEditor (@wangeditor/editor + @wangeditor/editor-for-react)
 *
 * 使用方式：
 *   <Editor value={html} onChange={setHtml} placeholder="请输入内容..." />
 */

import '@wangeditor/editor/dist/css/style.css'

import { useEffect, useState } from 'react'
import { Editor as WangEditor, Toolbar as WangToolbar } from '@wangeditor/editor-for-react'
import type { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor'
import { i18nChangeLanguage } from '@wangeditor/editor'

// 默认中文
i18nChangeLanguage('zh-CN')

export interface EditorProps {
  /** 编辑器 HTML 内容 */
  value?: string
  /** 内容变更回调，返回 HTML 字符串 */
  onChange?: (html: string) => void
  /** 占位文本 */
  placeholder?: string
  /** 是否只读 */
  readOnly?: boolean
  /** 编辑区高度 (默认 400px) */
  height?: number | string
  /** 编辑器模式 default | simple */
  mode?: 'default' | 'simple'
  /** 自定义 className，作用于外层容器 */
  className?: string
}

/**
 * 富文本编辑器（wangEditor 封装）
 */
export function Editor({
  value = '',
  onChange,
  placeholder = '请输入内容...',
  readOnly = false,
  height = 400,
  mode = 'default',
  className,
}: EditorProps) {
  // 编辑器实例（必须用 useState，否则潜在的引用问题）
  const [editor, setEditor] = useState<IDomEditor | null>(null)
  // 内部 html，避免外部 setState 触发循环
  const [html, setHtml] = useState<string>(value)

  useEffect(() => {
    if (value !== html) {
      setHtml(value)
    }
  }, [value])

  // 卸载时销毁编辑器，防止内存泄漏
  useEffect(() => {
    return () => {
      if (editor == null) return
      editor.destroy()
      setEditor(null)
    }
  }, [editor])

  const toolbarConfig: Partial<IToolbarConfig> = {}

  const editorConfig: Partial<IEditorConfig> = {
    placeholder,
    readOnly,
    MENU_CONF: {
      uploadImage: {
        // 默认使用 base64 (10M 内)
        base64LimitSize: 10 * 1024 * 1024,
      },
    },
  }

  return (
    <div
      className={
        'zsk-wang-editor border border-default-200 rounded-md overflow-hidden ' +
        (className ?? '')
      }
    >
      <WangToolbar
        editor={editor}
        defaultConfig={toolbarConfig}
        mode={mode}
        style={{ borderBottom: '1px solid hsl(var(--heroui-default-200))' }}
      />
      <WangEditor
        defaultConfig={editorConfig}
        value={html}
        onCreated={setEditor}
        onChange={(ed) => {
          const next = ed.getHtml()
          setHtml(next)
          onChange?.(next)
        }}
        mode={mode}
        style={{ height: typeof height === 'number' ? `${height}px` : height, overflowY: 'hidden' }}
      />
    </div>
  )
}

export default Editor
