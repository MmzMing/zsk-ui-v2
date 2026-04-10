/**
 * 应用入口组件
 */

import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { HeroUIProvider, ToastProvider } from '@heroui/react'
import Lenis from 'lenis'
import { router } from '@/router'

export default function App() {
  useEffect(() => {
    // 初始化Lenis实例
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

  return (
    <HeroUIProvider>
      <ToastProvider />
      <RouterProvider router={router} />
    </HeroUIProvider>
  )
}
