/**
 * 应用入口组件
 */

import { useEffect, useState } from 'react'
import { RouterProvider } from 'react-router-dom'
import { HeroUIProvider, ToastProvider } from '@heroui/react'
import Lenis from 'lenis'
import { router } from '@/router'
import { useUserStore } from '@/stores/user'
import { getCurrentUser } from '@/api/auth'
import { getStorageValue, STORAGE_KEYS } from '@/utils/storage'

export default function App() {
  const setUserInfo = useUserStore(state => state.setUserInfo)
  const setLoading = useUserStore(state => state.setLoading)
  const userInfo = useUserStore(state => state.userInfo)
  const [isInit, setIsInit] = useState(false)

  useEffect(() => {
    // 初始化 Lenis 实例
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2
    })

    // 动画循环
    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    // 清理函数
    return () => {
      lenis.destroy()
    }
  }, [])

  useEffect(() => {
    // 初始化用户登录状态
    const initUser = async () => {
      setLoading(true)
      try {
        // 只有当 Cookie 中有 token 且用户信息未设置时，才调用接口刷新
        const token = getStorageValue<string>(STORAGE_KEYS.TOKEN, undefined, 'cookie')
        if (token && !userInfo) {
          const user = await getCurrentUser()
          if (user) {
            setUserInfo(user)
          }
        }
      } catch (error) {
        // 用户未登录或其他错误，不做处理
      } finally {
        setLoading(false)
        setIsInit(true)
      }
    }

    initUser()
  }, [setUserInfo, setLoading, userInfo])

  // 等待初始化完成后再渲染
  if (!isInit) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-content2/20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <HeroUIProvider>
      <ToastProvider />
      <RouterProvider router={router} />
    </HeroUIProvider>
  )
}
