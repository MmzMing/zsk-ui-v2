/**
 * 认证页面布局组件
 * 为登录和注册页面提供统一布局，包含点击火花特效
 */

import { Outlet } from 'react-router-dom'
import ClickSpark from '@/components/ui/reactbits/ClickSpark'

export default function AuthLayout() {
  return (
    <ClickSpark sparkColor="#3b82f6" sparkSize={10} sparkRadius={15} duration={400}>
      <div className="min-h-screen bg-background">
        <Outlet />
      </div>
    </ClickSpark>
  )
}
