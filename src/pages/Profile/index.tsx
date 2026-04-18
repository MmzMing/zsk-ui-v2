/**
 * 个人中心页面
 * 左侧用户卡片 + 右侧内容区
 */

import { useState, useEffect, useCallback } from 'react'
import { ProfileCard, type ProfileTab } from '@/components/ui/profile/ProfileCard'
import { WorksGrid } from '@/components/ui/profile/WorksGrid'
import { EditProfile } from '@/components/ui/profile/EditProfile'
import { MessagesPanel } from '@/components/ui/profile/MessagesPanel'
import { SecurityPanel } from '@/components/ui/profile/SecurityPanel'
import { getUserWorks, getUserProfile } from '@/api/profile'
import type { UserWork, UserProfile } from '@/api/profile'
import { useUserStore } from '@/stores/user'

/**
 * ProfilePage 个人中心页面
 */
export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<ProfileTab>('edit')
  const [works, setWorks] = useState<UserWork[]>([])
  const [worksLoading, setWorksLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile | undefined>()
  
  const { userInfo, isLoggedIn } = useUserStore()

  // 加载作品列表
  useEffect(() => {
    async function loadWorks() {
      try {
        const data = await getUserWorks({ page: 1, pageSize: 12 })
        setWorks(data.list || [])
      } catch (error) {
        console.error('加载作品列表失败：', error)
      } finally {
        setWorksLoading(false)
      }
    }
    if (activeTab === 'works') {
      setWorksLoading(true)
      loadWorks()
    }
  }, [activeTab])

  // 加载用户资料
  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getUserProfile()
        setProfile(data)
      } catch (error) {
        console.error('加载用户资料失败：', error)
      }
    }
    if (isLoggedIn) {
      loadProfile()
    }
  }, [isLoggedIn])

  const handleTabChange = useCallback((tab: ProfileTab) => {
    setActiveTab(tab)
  }, [])

  const handleWorkClick = useCallback((work: UserWork) => {
    console.log('点击作品：', work.id)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <h1 className="text-2xl font-bold text-default-900 mb-8">个人中心</h1>

        {/* 主布局 */}
        <div className="flex gap-8">
          {/* 左侧用户卡片 */}
          <div className="flex-shrink-0">
            <ProfileCard
              userInfo={userInfo || undefined}
              loading={!isLoggedIn}
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />
          </div>

          {/* 右侧内容区 */}
          <div className="flex-1">
            {activeTab === 'edit' && (
              <EditProfile initialProfile={profile} />
            )}
            {activeTab === 'works' && (
              <WorksGrid
                initialWorks={works}
                loading={worksLoading}
                onWorkClick={handleWorkClick}
              />
            )}
            {activeTab === 'messages' && (
              <MessagesPanel />
            )}
            {activeTab === 'security' && (
              <SecurityPanel email={profile?.email} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}