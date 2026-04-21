/**
 * 系统监控页面
 * 用于展示系统资源使用情况和性能监控
 */

import { Card, CardBody } from '@heroui/react'
import { Monitor } from 'lucide-react'
import { StatusState } from '@/components/ui/StatusState'

export default function SystemPage() {
  return (
    <div className="flex flex-col gap-4 p-4 md:p-0 h-full">
      <Card className="h-full">
        <CardBody className="p-0 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-divider">
            <div className="flex items-center gap-2">
              <Monitor size={18} className="text-primary" />
              <span className="font-semibold text-sm">系统监控</span>
            </div>
          </div>
          <div className="flex-1 p-6">
            <StatusState type="empty" scene="admin" />
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
