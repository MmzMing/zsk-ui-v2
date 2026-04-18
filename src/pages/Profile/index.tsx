/**
 * 个人中心页面 - 占位页面
 * 等待设计文档完成后再进行开发
 */

import { Card } from '@heroui/react'
import { User } from 'lucide-react'

export default function ProfilePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-xl mx-auto p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <User className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-2">个人中心</h1>
        <p className="text-default-500">该页面正在设计中，敬请期待</p>
      </Card>
    </div>
  )
}