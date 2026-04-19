/**
 * 应用入口组件
 */

import { RouterProvider } from 'react-router-dom'
import { HeroUIProvider, ToastProvider } from '@heroui/react'
import { router } from '@/router'
import { useLenis } from '@/hooks/useLenis'
import { useUserInit } from '@/hooks/useUserInit'

export default function App() {
  // 使用自定义 hooks
  useLenis()
  const { isInit } = useUserInit()

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
