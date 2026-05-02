/**
 * 文档顶部导航栏
 * 返回按钮 + 可点击的面包屑导航
 */

// ===== 1. 依赖导入区域 =====
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
