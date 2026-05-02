/**
 * 用户信息卡片区
 * 展示用户头像、昵称、粉丝数、关注按钮
 * 黑白风格，水平布局
 */

// ===== 1. 依赖导入区域 =====
// HeroUI 组件
import { Avatar, Button } from '@heroui/react'

// 图标 (Lucide 优先)
import { UserPlus, UserCheck } from 'lucide-react'

// 类型定义
import type { DocHomeAuthor } from '@/types/document.types'

// ===== 2. Props 类型定义 =====
interface UserInfoCardProps {
  /** 作者信息（头像/昵称/粉丝/关注状态） */
  author: DocHomeAuthor | null
  /** 是否已关注 */
  isFollowing: boolean
  /** 关注操作加载中 */
  followLoading: boolean
  /** 关注/取关回调 */
  onFollow: () => void
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

// ===== 8. UI渲染逻辑区域 =====
/**
 * 用户信息卡片区组件
 * 水平布局：左侧头像 → 右侧昵称 + 粉丝数 + 关注按钮
 */
export default function UserInfoCard({
  author,
  isFollowing,
  followLoading,
  onFollow,
}: UserInfoCardProps) {
  // 加载态骨架屏
  if (!author) {
    return (
      <section className="flex items-center gap-4 py-6 border-b border-default-800">
        <div className="w-16 h-16 rounded-full bg-default-100 animate-pulse shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-6 w-32 rounded-full bg-default-100 animate-pulse" />
          <div className="h-4 w-20 rounded-full bg-default-100 animate-pulse" />
        </div>
        <div className="h-8 w-20 rounded-full bg-default-100 animate-pulse" />
      </section>
    )
  }

  return (
    <section className="flex items-center gap-4 py-6 border-b border-default-800">
      {/* 用户头像 */}
      <Avatar
        src={author.avatar}
        name={author.name?.charAt(0)}
        className="w-16 h-16 text-2xl shrink-0 border-2 border-foreground"
        classNames={{
          base: 'bg-foreground',
          name: 'font-bold text-background',
        }}
      />

      {/* 昵称 + 粉丝数 */}
      <div className="flex-1 min-w-0">
        <h1 className="text-2xl font-bold text-foreground truncate">
          {author.name}
        </h1>
        <p className="text-sm text-default-500 mt-0.5">
          {formatCount(author.fans)} 粉丝
        </p>
      </div>

      {/* 关注按钮 */}
      <Button
        size="sm"
        variant={isFollowing ? 'flat' : 'bordered'}
        className={`h-8 text-xs rounded-full shrink-0 ${
          isFollowing
            ? 'bg-default-100 text-default-600'
            : 'border-foreground text-foreground hover:bg-foreground hover:text-background'
        }`}
        isDisabled={followLoading}
        onPress={onFollow}
        startContent={
          isFollowing ? <UserCheck size={14} /> : <UserPlus size={14} />
        }
      >
        {isFollowing ? '已关注' : '关注'}
      </Button>
    </section>
  )
}
