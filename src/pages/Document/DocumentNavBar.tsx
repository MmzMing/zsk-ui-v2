/**
 * 文档顶部导航栏
 * 返回按钮 + 面包屑
 */

// ===== 1. 依赖导入区域 =====
// 图标 (Lucide 优先)
import { ArrowLeft } from 'lucide-react'

// React Router
import { Link } from 'react-router-dom'

// ===== 2. Props 类型定义 =====
interface DocumentNavBarProps {
  title?: string
}

// ===== 3. 导出区域 =====
/**
 * 文档顶部导航栏组件
 */
export default function DocumentNavBar({ title }: DocumentNavBarProps) {
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
