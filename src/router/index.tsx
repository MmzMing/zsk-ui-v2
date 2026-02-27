/**
 * 路由配置
 */
import { createBrowserRouter, type RouteObject, Outlet, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'

// 布局组件
import { AdminLayout } from '@/components/layout/admin'
import { FrontLayout } from '@/components/layout/front'
import { AuthLayout } from '@/components/layout/auth'
import { useTheme } from '@/hooks/useTheme'
import { GlobalLoading } from '@/components/ui/GlobalLoading'
import { GlobalModal } from '@/components/ui/GlobalModal'
import { Watermark } from '@/components/ui/Watermark'

// 懒加载页面组件
const HomePage = lazy(() => import('@/pages/Home'))
const TestPage = lazy(() => import('@/pages/Test'))
const LoginPage = lazy(() => import('@/pages/Auth/Login'))
const RegisterPage = lazy(() => import('@/pages/Auth/Register'))
const ForgotPasswordPage = lazy(() => import('@/pages/Auth/ForgotPassword'))
const CallbackPage = lazy(() => import('@/pages/Auth/Callback'))
const NotFoundPage = lazy(() => import('@/pages/NotFound'))

// 后台管理页面
const AdminDashboard = lazy(() => import('@/pages/Admin/Dashboard'))

// 加载中组件
function PageLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  )
}

// 包装懒加载组件
function withSuspense(Component: React.LazyExoticComponent<React.ComponentType>) {
  return (
    <Suspense fallback={<PageLoading />}>
      <Component />
    </Suspense>
  )
}

// 根布局组件，用于应用全局主题
function RootLayout() {
  useTheme()
  return (
    <>
      <Outlet />
      <GlobalLoading />
      <GlobalModal />
      <Watermark />
    </>
  )
}

// 路由配置
export const routes: RouteObject[] = [
  {
    element: <RootLayout />,
    children: [
      // 前台路由
      {
        path: '/',
        element: <FrontLayout />,
        children: [
          {
            index: true,
            element: withSuspense(HomePage),
          },
          {
            path: 'test',
            element: withSuspense(TestPage),
          },
        ],
      },

      // 认证路由
      {
        element: <AuthLayout />,
        children: [
          {
            path: '/login',
            element: withSuspense(LoginPage),
          },
          {
            path: '/register',
            element: withSuspense(RegisterPage),
          },
          {
            path: '/forgot-password',
            element: withSuspense(ForgotPasswordPage),
          },
          {
            path: '/auth/callback',
            element: withSuspense(CallbackPage),
          },
        ],
      },

      // 后台管理路由
      {
        path: '/admin',
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: withSuspense(AdminDashboard),
          },
          {
            path: 'dashboard',
            element: withSuspense(AdminDashboard),
          },
          // 其他后台路由可以在这里添加
          {
            path: '*',
            element: (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <h2 className="text-xl font-bold">页面开发中</h2>
                  <p className="text-default-500 mt-2">该页面正在开发中，请稍后再来</p>
                </div>
              </div>
            ),
          },
        ],
      },

      // 404
      {
        path: '/404',
        element: withSuspense(NotFoundPage),
      },
      {
        path: '*',
        element: <Navigate to="/404" replace />,
      },
    ]
  }
]

// 创建路由实例
export const router = createBrowserRouter(routes)
