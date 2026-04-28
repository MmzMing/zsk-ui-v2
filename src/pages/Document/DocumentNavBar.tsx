/**
 * 文档顶部导航栏
 * 返回按钮 + 面包屑
 */

import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Props {
  title?: string
}

export default function DocumentNavBar({ title }: Props) {
  return (
    <nav className="flex items-center gap-3 h-14 border-b border-default-200">
      <Link
        to="/search"
        className="flex items-center gap-1 text-sm text-default-500 hover:text-primary transition-colors"
      >
        <ArrowLeft size={16} />
        <span>返回搜索</span>
      </Link>
      <span className="text-default-300">/</span>
      <span className="text-sm text-default-500">首页</span>
      <span className="text-default-300">/</span>
      <span className="text-sm text-default-500">搜索</span>
      {title && (
        <>
          <span className="text-default-300">/</span>
          <span className="text-sm text-default-700 truncate max-w-[200px]">{title}</span>
        </>
      )}
    </nav>
  )
}
