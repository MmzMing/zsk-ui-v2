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
import { getUserWorks, getSystemUserInfo } from '@/api/profile'
import type { UserWork } from '@/api/profile'
import type { SysUser } from '@/types/user.types'
import { useUserStore } from '@/stores/user'

/**
 * ProfilePage 个人中心页面
 */
export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<ProfileTab>('edit')
  const [works, setWorks] = useState<UserWork[]>([])
  const [worksLoading, setWorksLoading] = useState(true)
  const [sysUser, setSysUser] = useState<SysUser | null>(null)
  
  const { userInfo, isLoggedIn } = useUserStore()

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

  const handleTabChange = useCallback((tab: ProfileTab) => {
    setActiveTab(tab)
  }, [])

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