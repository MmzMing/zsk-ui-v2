/**
 * 个人中心页面
 * 左侧用户卡片 + 右侧内容区
 * 作品列表根据用户ID加载（使用 docHomeUser 接口）
 */

// ===== 1. 依赖导入区域 =====
// React 核心
import { useState, useEffect, useCallback } from 'react'

// HeroUI 组件
import { ProfileCard, type ProfileTab } from '@/components/ui/profile/ProfileCard'
import { WorksGrid } from '@/components/ui/profile/WorksGrid'
import { EditProfile } from '@/components/ui/profile/EditProfile'
import { MessagesPanel } from '@/components/ui/profile/MessagesPanel'
import { SecurityPanel } from '@/components/ui/profile/SecurityPanel'

// API
import { getSystemUserInfo } from '@/api/profile'
import { getDocHomeUserWorks } from '@/api/document'

// 类型定义
import type { UserWork } from '@/api/profile'
import type { SysUser } from '@/api/auth'
import type { DocHomeUserWorksVo } from '@/types/document.types'

// 状态管理
import { useUserStore } from '@/stores/user'

// ===== 4. 通用工具函数区域 =====
/**
 * 将 DocHomeUserWorksVo 转换为 UserWork 格式
 * docHomeUser 接口返回的字段与 profile 接口不同，需要映射
 * @param vo - docHomeUser 接口返回的作品数据
 * @returns 符合 UserWork 类型的作品数据
 */
function mapDocWorkToUserWork(vo: DocHomeUserWorksVo): UserWork {
  return {
    id: vo.id,
    title: vo.title,
    cover: vo.coverUrl,
    description: vo.description,
    type: vo.type === 'note' ? 'document' : vo.type,
    status: 'published',
    views: vo.viewCount,
    likes: vo.likeCount,
    comments: 0,
    createdAt: vo.createTime,
    updatedAt: vo.createTime,
  }
}

// ===== 8. UI渲染逻辑区域 =====
/**
 * ProfilePage 个人中心页面
 */
export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<ProfileTab>('edit')
  const [works, setWorks] = useState<UserWork[]>([])
  const [worksLoading, setWorksLoading] = useState(true)
  const [sysUser, setSysUser] = useState<SysUser | null>(null)

  const { userInfo, isLoggedIn } = useUserStore()

  // ===== 9. 页面初始化与事件绑定 =====
  /**
   * 获取系统用户详细信息
   */
  useEffect(() => {
    const fetchSysUser = async () => {
      if (userInfo?.id) {
        try {
          const data = await getSystemUserInfo(userInfo.id)
          setSysUser(data)
        } catch (error) {
          console.error('获取系统用户信息失败：', error)
        }
      }
    }
    fetchSysUser()
  }, [userInfo?.id])

  /**
   * 根据用户ID加载作品列表
   * 使用 docHomeUser 接口，通过 userId 查询已发布作品
   */
  useEffect(() => {
    async function loadWorks() {
      if (!userInfo?.id) return
      try {
        const data = await getDocHomeUserWorks(userInfo.id, {
          pageNum: 1,
          pageSize: 12,
        })
        const mappedWorks = (data.list || []).map(mapDocWorkToUserWork)
        setWorks(mappedWorks)
      } catch (error) {
        console.error('加载作品列表失败：', error)
      } finally {
        setWorksLoading(false)
      }
    }
    if (activeTab === 'works' && userInfo?.id) {
      setWorksLoading(true)
      loadWorks()
    }
  }, [activeTab, userInfo?.id])

  /**
   * Tab 切换回调
   */
  const handleTabChange = useCallback((tab: ProfileTab) => {
    setActiveTab(tab)
  }, [])

  /**
   * 点击作品回调
   */
  const handleWorkClick = useCallback((work: UserWork) => {
    console.log('点击作品：', work.id)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-default-900 mb-8">个人中心</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-shrink-0 w-full lg:w-auto">
            <ProfileCard
              userInfo={userInfo || undefined}
              sysUser={sysUser}
              loading={!isLoggedIn}
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />
          </div>

          <div className="flex-1">
            {activeTab === 'edit' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-default-900">编辑信息</h3>
                <EditProfile userInfo={userInfo} />
              </div>
            )}
            {activeTab === 'works' && (
              <WorksGrid
                initialWorks={works}
                loading={worksLoading}
                onWorkClick={handleWorkClick}
              />
            )}
            {activeTab === 'messages' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-default-900">消息管理</h3>
                <MessagesPanel />
              </div>
            )}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-default-900">账户设置</h3>
                <SecurityPanel email={userInfo?.email} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
