/**
 * 富文本编辑器主组件
 */

import { useEditor, EditorContent } from '@tiptap/react'
import { useEffect } from 'react'
import { Toolbar } from './Toolbar'
import { BubbleMenu } from './BubbleMenu'
import { getExtensions } from './extensions'
import { Card } from '@heroui/react'

export interface EditorProps {
  /**
   * 编辑器内容 (HTML)
   */
  value?: string
  /**
   * 内容变更回调
   */
  onChange?: (content: string) => void
  /**
   * 占位符文本
   */
  placeholder?: string
  /**
   * 是否可编辑
   */
  editable?: boolean
  /**
   * 自定义类名
   */
  className?: string
}

/**
 * 富文本编辑器组件
 * 基于 Tiptap 封装，集成了工具栏、气泡菜单和常用扩展
 */
export function Editor({
  value = '',
  onChange,
  placeholder = '请输入内容...',
  editable = true,
  className = '',
}: EditorProps) {
  // 初始化编辑器实例
  const editor = useEditor({
    extensions: getExtensions({ placeholder }),
    content: value,
    editable,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base lg:prose-lg xl:prose-xl focus:outline-none max-w-none p-4 min-h-[150px]',
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML())
    },
  })

  // 监听外部 value 变化，同步更新编辑器内容
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      // 只有当编辑器未处于焦点状态时才同步外部内容，防止输入冲突
      if (!editor.isFocused) {
        editor.commands.setContent(value)
      }
    }
  }, [value, editor])

  // 监听编辑状态变化
  useEffect(() => {
    if (editor) {
      editor.setEditable(editable)
    }
  }, [editable, editor])

  if (!editor) {
    return null
  }

  return (
    <Card className={`border border-default-200 overflow-hidden shadow-sm ${className}`}>
      {/* 编辑工具栏 */}
      {editable && <Toolbar editor={editor} />}
      
      {/* 选中文字后的浮动菜单 */}
      {editable && <BubbleMenu editor={editor} />}
      
      {/* 编辑器内容区域 */}
      <EditorContent editor={editor} />
      
      {/* 底部状态栏（字数统计） */}
      <div className="px-4 py-2 text-tiny text-default-400 border-t border-default-100 flex justify-end">
        {editor.storage.characterCount.characters()} 字符
      </div>
    </Card>
  )
}

