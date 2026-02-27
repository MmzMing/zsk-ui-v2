/**
 * 编辑器顶部工具栏组件
 */

import { type Editor } from '@tiptap/react'
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  Heading1,
  Heading2,
} from 'lucide-react'
import { Button, Tooltip } from '@heroui/react'
import { useCallback } from 'react'

interface ToolbarProps {
  /** 编辑器实例 */
  editor: Editor | null
}

/**
 * 顶部工具栏，提供文本格式化和多媒体插入功能
 */
export function Toolbar({ editor }: ToolbarProps) {
  if (!editor) {
    return null
  }

  // 处理图片插入
  const addImage = useCallback(() => {
    const url = window.prompt('请输入图片URL')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }, [editor])

  // 处理链接设置
  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('请输入链接URL', previousUrl)

    // 用户取消输入
    if (url === null) {
      return
    }

    // 清空链接
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    // 设置新链接
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  // 处理表格插入
  const addTable = useCallback(() => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }, [editor])

  // 格式化按钮配置
  const buttons = [
    {
      label: '加粗',
      icon: <Bold size={18} />,
      isActive: editor.isActive('bold'),
      onClick: () => editor.chain().focus().toggleBold().run(),
    },
    {
      label: '斜体',
      icon: <Italic size={18} />,
      isActive: editor.isActive('italic'),
      onClick: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      label: '删除线',
      icon: <Strikethrough size={18} />,
      isActive: editor.isActive('strike'),
      onClick: () => editor.chain().focus().toggleStrike().run(),
    },
    {
      label: '代码',
      icon: <Code size={18} />,
      isActive: editor.isActive('code'),
      onClick: () => editor.chain().focus().toggleCode().run(),
    },
    {
      label: '引用',
      icon: <Quote size={18} />,
      isActive: editor.isActive('blockquote'),
      onClick: () => editor.chain().focus().toggleBlockquote().run(),
    },
    {
      label: '一级标题',
      icon: <Heading1 size={18} />,
      isActive: editor.isActive('heading', { level: 1 }),
      onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      label: '二级标题',
      icon: <Heading2 size={18} />,
      isActive: editor.isActive('heading', { level: 2 }),
      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      label: '无序列表',
      icon: <List size={18} />,
      isActive: editor.isActive('bulletList'),
      onClick: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      label: '有序列表',
      icon: <ListOrdered size={18} />,
      isActive: editor.isActive('orderedList'),
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      label: '链接',
      icon: <LinkIcon size={18} />,
      isActive: editor.isActive('link'),
      onClick: setLink,
    },
    {
      label: '图片',
      icon: <ImageIcon size={18} />,
      isActive: false,
      onClick: addImage,
    },
    {
      label: '表格',
      icon: <TableIcon size={18} />,
      isActive: editor.isActive('table'),
      onClick: addTable,
    },
    {
      label: '撤销',
      icon: <Undo size={18} />,
      isActive: false,
      onClick: () => editor.chain().focus().undo().run(),
      disabled: !editor.can().undo(),
    },
    {
      label: '重做',
      icon: <Redo size={18} />,
      isActive: false,
      onClick: () => editor.chain().focus().redo().run(),
      disabled: !editor.can().redo(),
    },
  ]

  return (
    <div className="border-b border-default-200 p-2 flex flex-wrap gap-1 sticky top-0 bg-background z-10">
      {buttons.map((btn, index) => (
        <Tooltip key={index} content={btn.label}>
          <Button
            isIconOnly
            size="sm"
            variant={btn.isActive ? 'solid' : 'light'}
            color={btn.isActive ? 'primary' : 'default'}
            onClick={btn.onClick}
            isDisabled={btn.disabled}
            className="min-w-8 w-8 h-8"
          >
            {btn.icon}
          </Button>
        </Tooltip>
      ))}
    </div>
  )
}

