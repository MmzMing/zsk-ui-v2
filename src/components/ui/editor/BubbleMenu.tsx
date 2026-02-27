/**
 * 文本选中后的气泡菜单组件
 */

import { type Editor } from '@tiptap/react'
import { BubbleMenu as TiptapBubbleMenu } from '@tiptap/react/menus'
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Link as LinkIcon,
} from 'lucide-react'
import { Button, ButtonGroup } from '@heroui/react'
import { useCallback } from 'react'

interface BubbleMenuProps {
  /** 编辑器实例 */
  editor: Editor | null
}

/**
 * 气泡菜单，当用户选中文本时显示，提供快速格式化选项
 */
export function BubbleMenu({ editor }: BubbleMenuProps) {
  if (!editor) {
    return null
  }

  // 处理链接设置
  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('请输入链接URL', previousUrl)

    if (url === null) {
      return
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  return (
    <TiptapBubbleMenu
      editor={editor}
      className="bg-content1 shadow-lg rounded-lg overflow-hidden border border-default-200 flex"
    >
      <ButtonGroup size="sm" variant="light">
        <Button
          isIconOnly
          className={editor.isActive('bold') ? 'bg-default-200' : ''}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold size={16} />
        </Button>
        <Button
          isIconOnly
          className={editor.isActive('italic') ? 'bg-default-200' : ''}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic size={16} />
        </Button>
        <Button
          isIconOnly
          className={editor.isActive('strike') ? 'bg-default-200' : ''}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough size={16} />
        </Button>
        <Button
          isIconOnly
          className={editor.isActive('code') ? 'bg-default-200' : ''}
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          <Code size={16} />
        </Button>
        <Button
          isIconOnly
          className={editor.isActive('link') ? 'bg-default-200' : ''}
          onClick={setLink}
        >
          <LinkIcon size={16} />
        </Button>
      </ButtonGroup>
    </TiptapBubbleMenu>
  )
}

