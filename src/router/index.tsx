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
import { GlobalModal } from '@/components/ui/GlobalModal'
import { Watermark } from '@/components/ui/Watermark'
import { StatusState } from '@/components/ui/StatusState'

const HomePage = lazy(() => import('@/pages/Home'))
const AboutPage = lazy(() => import('@/pages/About'))
const TestPage = lazy(() => import('@/pages/Test'))
const DocumentDetailPage = lazy(() => import('@/pages/Document'))
const VideoDetailPage = lazy(() => import('@/pages/VideoDetail'))
const SearchPage = lazy(() => import('@/pages/Search'))
const ProfilePage = lazy(() => import('@/pages/Profile'))
const UserHomePage = lazy(() => import('@/pages/UserHome'))
const CategoriesPage = lazy(() => import('@/pages/Categories'))
const LoginPage = lazy(() => import('@/pages/Auth/Login'))
const CallbackPage = lazy(() => import('@/pages/Auth/Callback'))
const NotFoundPage = lazy(() => import('@/pages/NotFound'))
const NoPermissionPage = lazy(() => import('@/pages/NoPermission'))

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
const VideoCollection = lazy(() => import('@/pages/Admin/Video/Collection'))

// 文档管理页面
const DocumentList = lazy(() => import('@/pages/Admin/Document/List'))
const DocumentCreateEdit = lazy(() => import('@/pages/Admin/Document/CreateEdit'))
const DocumentEditor = lazy(() => import('@/pages/Admin/Document/Editor'))

// 审批流页面
const AuditFront = lazy(() => import('@/pages/Admin/Audit/FrontAudit'))

// 系统管理页面
const SystemConfig = lazy(() => import('@/pages/Admin/System/Config'))
const SystemDictionary = lazy(() => import('@/pages/Admin/System/Dictionary'))

// 系统运维页面
const CachePage = lazy(() => import('@/pages/Admin/Monitor/Cache'))
const BehaviorPage = lazy(() => import('@/pages/Admin/Monitor/Behavior'))
const SysLogPage = lazy(() => import('@/pages/Admin/Monitor/SysLog'))
const NoticePage = lazy(() => import('@/pages/Admin/Monitor/Notice'))

function PageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-content">
      <StatusState type="loading" />
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
            path: 'about',
            element: withSuspense(AboutPage),
          },
          {
            path: 'search',
            element: withSuspense(SearchPage),
          },
          {
            path: 'categories',
            element: withSuspense(CategoriesPage),
          },
          {
            path: 'test',
            element: withSuspense(TestPage),
          },
          {
            path: 'document/:id',
            element: withSuspense(DocumentDetailPage),
          },
          {
            path: 'video/:id',
            element: withSuspense(VideoDetailPage),
          },
          {
            path: 'user/:id',
            element: withSuspense(UserHomePage),
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
                path: 'collection',
                element: withSuspense(VideoCollection),
              },
            ],
          },
          {
            path: 'document',
            children: [
              {
                path: 'list',
                element: withSuspense(DocumentList),
              },
              {
                path: 'create-edit',
                element: withSuspense(DocumentCreateEdit),
              },
              {
                path: 'editor',
                element: withSuspense(DocumentEditor),
              },
              {
                path: 'editor/:id',
                element: withSuspense(DocumentEditor),
              },
            ],
          },
          {
            path: 'audit',
            children: [
              {
                path: 'front',
                element: withSuspense(AuditFront),
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
                path: 'dictionary',
                element: withSuspense(SystemDictionary),
              },
            ],
          },
          {
            path: 'monitor',
            children: [
              {
                path: 'cache',
                element: withSuspense(CachePage),
              },
              {
                path: 'behavior',
                element: withSuspense(BehaviorPage),
              },
              {
                path: 'syslog',
                element: withSuspense(SysLogPage),
              },
              {
                path: 'notice',
                element: withSuspense(NoticePage),
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
        path: '/403',
        element: withSuspense(NoPermissionPage),
      },
      {
        path: '*',
        element: <Navigate to="/404" replace />,
      },
    ]
  }
]

export const router = createBrowserRouter(routes)