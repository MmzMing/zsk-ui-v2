/**
 * 数据统计条
 * 展示用户作品统计：总获赞 / 总浏览 / 总收藏 / 笔记数 / 视频数
 * 黑白风格，水平等分排列
 */

// ===== 1. 依赖导入区域 =====
// 图标 (Lucide 优先)
import { Heart, Eye, BookMarked, FileText, Video } from 'lucide-react'

// 类型定义
import type { DocHomeUserStatsVo } from '@/types/document.types'

// ===== 2. Props 类型定义 =====
interface UserStatsBarProps {
  /** 统计数据 */
  stats: DocHomeUserStatsVo | null
  /** 加载中 */
  loading: boolean
}

// ===== 3. 通用工具函数区域 =====
/**
 * 格式化数字显示
 * @param n - 数字
 * @returns 格式化后的字符串
 */
function formatCount(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}万`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

/** 统计项配置 */
const STATS_CONFIG = [
  { key: 'totalLikeCount', label: '获赞', icon: Heart },
  { key: 'totalViewCount', label: '浏览', icon: Eye },
  { key: 'totalFavoriteCount', label: '收藏', icon: BookMarked },
  { key: 'noteCount', label: '笔记', icon: FileText },
  { key: 'videoCount', label: '视频', icon: Video },
] as const

// ===== 8. UI渲染逻辑区域 =====
/**
 * 数据统计条组件
 * 水平等分排列，5 个统计项一行
 */
export default function UserStatsBar({ stats, loading }: UserStatsBarProps) {
  return (
    <section className="py-5 border-b border-default-800">
      <div className="grid grid-cols-5 gap-2">
        {STATS_CONFIG.map(({ key, label, icon: Icon }) => (
          <div key={key} className="flex flex-col items-center gap-1">
            {/* 图标 */}
            <Icon className="w-4 h-4 text-default-400" />

            {/* 数字 */}
            {loading ? (
              <div className="h-5 w-10 rounded-full bg-default-100 animate-pulse" />
            ) : (
              <span className="text-lg font-bold text-foreground">
                {formatCount(stats?.[key] ?? 0)}
              </span>
            )}

            {/* 标签 */}
            <span className="text-xs text-default-500">{label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
