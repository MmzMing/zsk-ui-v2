/**
 * 应用入口组件
 */

import { RouterProvider } from 'react-router-dom'
import { HeroUIProvider, ToastProvider } from '@heroui/react'
import { router } from '@/router'
import LenisProvider from '@/components/ui/LenisProvider'

export default function App() {
  return (
    <LenisProvider>
      <HeroUIProvider>
        <ToastProvider />
        <RouterProvider router={router} />
      </HeroUIProvider>
    </LenisProvider>
  )
}
