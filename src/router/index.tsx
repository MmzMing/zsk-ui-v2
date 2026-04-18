/**
 * 路由配置
 * 按照企业级别开发，由后端API权限控制
 */
import { createBrowserRouter, type RouteObject, Outlet, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'

import { ProtectedRoute } from './ProtectedRoute'
import { PublicRoute } from './PublicRoute'
import { AdminLayout } from '@/components/layout/admin'
import { FrontLayout } from '@/components/layout/front'
import { AuthLayout } from '@/components/layout/auth'
import { useTheme } from '@/hooks/useTheme'
import { GlobalLoading } from '@/components/ui/GlobalLoading'
import { GlobalModal } from '@/components/ui/GlobalModal'
import { Watermark } from '@/components/ui/Watermark'

const HomePage = lazy(() => import('@/pages/Home'))
const TestPage = lazy(() => import('@/pages/Test'))
const ProfilePage = lazy(() => import('@/pages/Profile'))
const LoginPage = lazy(() => import('@/pages/Auth/Login'))
const CallbackPage = lazy(() => import('@/pages/Auth/Callback'))
const NotFoundPage = lazy(() => import('@/pages/NotFound'))

// 后台管理页面
const AdminDashboard = lazy(() => import('@/pages/Admin/Dashboard'))

// 机器人平台页面
const RobotDingding = lazy(() => import('@/pages/Admin/Robot/Dingding'))
const RobotWechat = lazy(() => import('@/pages/Admin/Robot/Wechat'))
const RobotNapcat = lazy(() => import('@/pages/Admin/Robot/Napcat'))
const RobotQQ = lazy(() => import('@/pages/Admin/Robot/QQ'))

// 人员管理页面
const PersonnelMenu = lazy(() => import('@/pages/Admin/Personnel/Menu'))
const PersonnelRole = lazy(() => import('@/pages/Admin/Personnel/Role'))
const PersonnelUser = lazy(() => import('@/pages/Admin/Personnel/User'))

// 视频管理页面
const VideoList = lazy(() => import('@/pages/Admin/Video/List'))
const VideoUpload = lazy(() => import('@/pages/Admin/Video/Upload'))
const VideoAudit = lazy(() => import('@/pages/Admin/Video/Audit'))

// 文档管理页面
const DocumentEdit = lazy(() => import('@/pages/Admin/Document/Edit'))
const DocumentList = lazy(() => import('@/pages/Admin/Document/List'))
const DocumentUpload = lazy(() => import('@/pages/Admin/Document/Upload'))
const DocumentAudit = lazy(() => import('@/pages/Admin/Document/Audit'))

// 系统管理页面
const SystemConfig = lazy(() => import('@/pages/Admin/System/Config'))
const SystemPermission = lazy(() => import('@/pages/Admin/System/Permission'))
const SystemDictionary = lazy(() => import('@/pages/Admin/System/Dictionary'))

// 系统运维页面
const OpsMonitor = lazy(() => import('@/pages/Admin/Ops/Monitor'))
const OpsCache = lazy(() => import('@/pages/Admin/Ops/Cache'))
const OpsLog = lazy(() => import('@/pages/Admin/Ops/Log'))
const OpsSystem = lazy(() => import('@/pages/Admin/Ops/System'))
const OpsBehavior = lazy(() => import('@/pages/Admin/Ops/Behavior'))

function PageLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  )
}

function withSuspense(Component: React.LazyExoticComponent<React.ComponentType>) {
  return (
    <Suspense fallback={<PageLoading />}>
      <Component />
    </Suspense>
  )
}

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

export const routes: RouteObject[] = [
  {
    element: <RootLayout />,
    children: [
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
      {
        element: <PublicRoute />,
        children: [
          {
            element: <AuthLayout />,
            children: [
              {
                path: '/login',
                element: withSuspense(LoginPage),
              },
              {
                path: '/auth/callback',
                element: withSuspense(CallbackPage),
              },
            ],
          },
        ],
      },
      {
        path: '/profile',
        element: <ProtectedRoute />,
        children: [
          {
            element: <FrontLayout />,
            children: [
              {
                index: true,
                element: withSuspense(ProfilePage),
              },
            ],
          },
        ],
      },
      {
        path: '/admin',
        element: <ProtectedRoute />,
        children: [
          {
            path: '',
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
          {
            path: 'robot',
            children: [
              {
                path: 'dingding',
                element: withSuspense(RobotDingding),
              },
              {
                path: 'wechat',
                element: withSuspense(RobotWechat),
              },
              {
                path: 'napcat',
                element: withSuspense(RobotNapcat),
              },
              {
                path: 'qq',
                element: withSuspense(RobotQQ),
              },
            ],
          },
          {
            path: 'personnel',
            children: [
              {
                path: 'menu',
                element: withSuspense(PersonnelMenu),
              },
              {
                path: 'role',
                element: withSuspense(PersonnelRole),
              },
              {
                path: 'user',
                element: withSuspense(PersonnelUser),
              },
            ],
          },
          {
            path: 'video',
            children: [
              {
                path: 'list',
                element: withSuspense(VideoList),
              },
              {
                path: 'upload',
                element: withSuspense(VideoUpload),
              },
              {
                path: 'audit',
                element: withSuspense(VideoAudit),
              },
            ],
          },
          {
            path: 'document',
            children: [
              {
                path: 'edit',
                element: withSuspense(DocumentEdit),
              },
              {
                path: 'list',
                element: withSuspense(DocumentList),
              },
              {
                path: 'upload',
                element: withSuspense(DocumentUpload),
              },
              {
                path: 'audit',
                element: withSuspense(DocumentAudit),
              },
            ],
          },
          {
            path: 'system',
            children: [
              {
                path: 'config',
                element: withSuspense(SystemConfig),
              },
              {
                path: 'permission',
                element: withSuspense(SystemPermission),
              },
              {
                path: 'dictionary',
                element: withSuspense(SystemDictionary),
              },
            ],
          },
          {
            path: 'ops',
            children: [
              {
                path: 'monitor',
                element: withSuspense(OpsMonitor),
              },
              {
                path: 'cache',
                element: withSuspense(OpsCache),
              },
              {
                path: 'log',
                element: withSuspense(OpsLog),
              },
              {
                path: 'system',
                element: withSuspense(OpsSystem),
              },
              {
                path: 'behavior',
                element: withSuspense(OpsBehavior),
              },
            ],
          },
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
        ],
      },
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

export const router = createBrowserRouter(routes)