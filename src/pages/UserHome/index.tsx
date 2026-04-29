/**
 * 用户作品主页
 * 左-中-右三栏布局，黑白风格
 * 左侧：Tracing Beam 装饰光束
 * 中间：用户信息 → 统计条 → 筛选栏 → 作品网格
 * 右侧：悬浮侧边栏（筛选 Tab + 排序方式）
 * 移动端：隐藏左右栏，单栏展示
 */

// ===== 1. 依赖导入区域 =====
// React 核心
import { useState, useMemo, useCallback } from 'react'

// React Router
import { useParams, useLocation, useNavigate } from 'react-router-dom'

// 组件
import { StatusState } from '@/components/ui/StatusState'

// 自定义 Hooks
import { useUserHome } from '@/hooks/useUserHome'

// 页面子组件
import UserInfoCard from './UserInfoCard'
import UserStatsBar from './UserStatsBar'
import UserWorksFilter from './UserWorksFilter'
import UserWorksGrid from './UserWorksGrid'
import UserHomeSidebar from './UserHomeSidebar'
import type { SortBy } from './UserHomeSidebar'
import TracingBeam from '../Document/TracingBeam'
import UserHomeSkeleton from './UserHomeSkeleton'

// 类型定义
import type { DocHomeAuthor, DocHomeUserWorksVo } from '@/types/document.types'

// ===== 2. TODO待处理导入区域 =====

// ===== 3. 状态控制逻辑区域 =====

// ===== 4. 通用工具函数区域 =====
/**
 * 从路由 state 中提取作者信息
 * 文档/视频详情页跳转时通过 state 传递作者数据
 * @param state - 路由 state 对象
 * @returns 作者信息或 null
 */
function extractAuthorFromState(state: unknown): DocHomeAuthor | null {
  if (!state || typeof state !== 'object') return null
  const s = state as Record<string, unknown>
  const author = s.author as DocHomeAuthor | undefined
  if (author && typeof author.id === 'string') {
    return author
  }
  return null
}

// ===== 7. 数据处理函数区域 =====
/**
 * 对作品列表进行前端内存排序
 * 后端接口暂不支持排序参数，仅对当前已加载数据排序
 * @param works - 作品列表
 * @param sortBy - 排序方式
 * @returns 排序后的作品列表
 */
function sortWorks(works: DocHomeUserWorksVo[], sortBy: SortBy): DocHomeUserWorksVo[] {
  const sorted = [...works]
  switch (sortBy) {
    case 'mostViewed':
      sorted.sort((a, b) => b.viewCount - a.viewCount)
      break
    case 'mostLiked':
      sorted.sort((a, b) => b.likeCount - a.likeCount)
      break
    case 'latest':
    default:
      sorted.sort(
        (a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
      )
      break
  }
  return sorted
}

// ===== 8. UI渲染逻辑区域 =====
/**
 * 用户作品主页组件
 */
export default function UserHomePage() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const navigate = useNavigate()

  // 从路由 state 提取作者信息
  const initialAuthor = useMemo(
    () => extractAuthorFromState(location.state),
    [location.state]
  )

  // 使用自定义 Hook 获取数据
  const {
    works,
    worksLoading,
    worksError,
    stats,
    statsLoading,
    hasMore,
    total,
    loadMore,
    loadingMore,
    typeFilter,
    setTypeFilter,
    author,
    isFollowing,
    followLoading,
    handleFollow,
  } = useUserHome(id!, initialAuthor)

  // 排序状态（前端内存排序）
  const [sortBy, setSortBy] = useState<SortBy>('latest')

  // 排序后的作品列表
  const sortedWorks = useMemo(() => sortWorks(works, sortBy), [works, sortBy])

  /**
   * 点击作品跳转到对应详情页
   */
  const handleWorkClick = useCallback(
    (work: DocHomeUserWorksVo) => {
      const path = work.type === 'video' ? `/video/${work.id}` : `/document/${work.id}`
      navigate(path)
    },
    [navigate]
  )

  // 错误态
  if (worksError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <StatusState type="error" />
          <p className="text-lg text-default-600">用户主页加载失败</p>
          <p className="text-sm text-default-400">请检查链接是否正确，或返回搜索页</p>
          <a
            href="/search"
            className="inline-block text-sm text-primary hover:underline"
          >
            返回搜索
          </a>
        </div>
      </div>
    )
  }

  // 加载态（骨架屏）
  if (worksLoading && works.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 max-w-7xl">
          <UserHomeSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex gap-8">
          {/* 左侧：Tracing Beam 装饰光束（桌面端） */}
          <div className="hidden md:block w-16 shrink-0 relative">
            <TracingBeam />
          </div>

          {/* 中间：主内容区 */}
          <div className="flex-1 min-w-0 max-w-[780px] mx-auto">
            {/* 用户信息卡片区 */}
            <UserInfoCard
              author={author}
              isFollowing={isFollowing}
              followLoading={followLoading}
              onFollow={handleFollow}
            />

            {/* 数据统计条 */}
            <UserStatsBar stats={stats} loading={statsLoading} />

            {/* 作品筛选栏 */}
            <UserWorksFilter
              typeFilter={typeFilter}
              onTypeChange={setTypeFilter}
              total={total}
            />

            {/* 作品网格 */}
            <UserWorksGrid
              works={sortedWorks}
              loading={worksLoading}
              loadingMore={loadingMore}
              hasMore={hasMore}
              onLoadMore={loadMore}
              onWorkClick={handleWorkClick}
            />
          </div>

          {/* 右侧：悬浮侧边栏（桌面端） */}
          <aside className="hidden md:block shrink-0">
            <div className="sticky top-20 space-y-6">
              <UserHomeSidebar
                typeFilter={typeFilter}
                onTypeChange={setTypeFilter}
                sortBy={sortBy}
                onSortChange={setSortBy}
              />
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
