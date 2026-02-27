/**
 * 编辑器扩展配置
 */

import { StarterKit } from '@tiptap/starter-kit'
import { Placeholder } from '@tiptap/extension-placeholder'
import { Image } from '@tiptap/extension-image'
import { Link } from '@tiptap/extension-link'
import { Table } from '@tiptap/extension-table'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableRow } from '@tiptap/extension-table-row'
import { CharacterCount } from '@tiptap/extension-character-count'

/**
 * 获取编辑器扩展列表
 * @param placeholder 占位符文本
 * @returns 扩展数组
 */
export const getExtensions = ({ placeholder = '请输入内容...' }: { placeholder?: string } = {}) => [
  // 核心套件：包含基础的文本编辑功能
  StarterKit.configure({
    heading: {
      levels: [1, 2, 3],
    },
    bulletList: {
      HTMLAttributes: {
        class: 'list-disc list-outside leading-3 ml-4',
      },
    },
    orderedList: {
      HTMLAttributes: {
        class: 'list-decimal list-outside leading-3 ml-4',
      },
    },
    blockquote: {
      HTMLAttributes: {
        class: 'border-l-4 border-primary pl-4 italic my-4',
      },
    },
    codeBlock: {
      HTMLAttributes: {
        class: 'rounded-lg bg-default-100 p-4 font-mono text-sm my-4',
      },
    },
  }),
  // 占位符扩展
  Placeholder.configure({
    placeholder,
    emptyEditorClass: 'is-editor-empty',
  }),
  // 图片扩展
  Image.configure({
    HTMLAttributes: {
      class: 'rounded-lg border border-default-200 shadow-sm max-w-full h-auto my-4',
    },
    allowBase64: true,
  }),
  // 链接扩展
  Link.configure({
    openOnClick: false,
    HTMLAttributes: {
      class: 'text-primary underline decoration-primary/30 hover:decoration-primary transition-colors cursor-pointer',
    },
  }),
  // 表格相关扩展
  Table.configure({
    resizable: true,
    HTMLAttributes: {
      class: 'border-collapse table-auto w-full my-4',
    },
  }),
  TableRow,
  TableHeader.configure({
    HTMLAttributes: {
      class: 'border border-default-200 bg-default-100 p-2 text-left font-bold',
    },
  }),
  TableCell.configure({
    HTMLAttributes: {
      class: 'border border-default-200 p-2',
    },
  }),
  // 字数统计扩展
  CharacterCount.configure({
    limit: 10000,
  }),
]

