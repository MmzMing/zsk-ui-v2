/**
 * 视频详情面包屑导航
 * 返回搜索 + 面包屑路径
 */

import { Link } from 'react-router-dom'

interface Props {
  title?: string
}

export default function VideoBreadcrumb({ title }: Props) {
  return (
    <nav className="flex items-center gap-3 h-14 border-b border-default-800">
      <Link
        to="/"
        className="text-sm text-default-500 hover:text-primary transition-colors"
      >
        首页
      </Link>
      <span className="text-default-300">/</span>
      <Link
        to="/search"
        className="text-sm text-default-500 hover:text-primary transition-colors"
      >
        搜索
      </Link>
      {title && (
        <>
          <span className="text-default-300">/</span>
          <span className="text-sm text-default-700 truncate max-w-[200px]">{title}</span>
        </>
      )}
    </nav>
  )
}
