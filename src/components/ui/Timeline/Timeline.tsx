import { cn } from '@/utils'

export interface TimelineItem {
  id: string
  time: string
  type: string
  message: string
  result: string
  instanceId?: string
}

interface TimelineProps {
  items: TimelineItem[]
  className?: string
}

const typeColors: Record<string, string> = {
  refresh: 'bg-blue-500',
  batchDelete: 'bg-red-500',
  delete: 'bg-red-500',
  warmup: 'bg-green-500',
  clear: 'bg-orange-500',
  default: 'bg-gray-500'
}

const resultColors: Record<string, string> = {
  success: 'text-green-500 bg-green-500/10',
  failure: 'text-red-500 bg-red-500/10',
  error: 'text-red-500 bg-red-500/10',
  default: 'text-gray-500 bg-gray-500/10'
}

const typeLabels: Record<string, string> = {
  refresh: '刷新',
  batchDelete: '批量删除',
  delete: '删除',
  warmup: '预热',
  clear: '清空',
  default: '操作'
}

export function TimelineItem({ item }: { item: TimelineItem }) {
  return (
    <div className="flex gap-4 pb-6 last:pb-0">
      <div className="flex flex-col items-center">
        <div className={cn(
          'w-3 h-3 rounded-full flex-shrink-0 shadow-lg',
          typeColors[item.type] || typeColors.default
        )} />
        {item.id !== 'last' && (
          <div className="w-0.5 h-full bg-divider mt-2 flex-shrink-0" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-default-900">
            {typeLabels[item.type] || typeLabels.default}
          </span>
          <span className={cn(
            'text-xs px-2 py-0.5 rounded-full',
            resultColors[item.result] || resultColors.default
          )}>
            {item.result === 'success' ? '成功' : '失败'}
          </span>
        </div>
        <p className="text-sm text-default-600 mb-1 line-clamp-2">
          {item.message}
        </p>
        <div className="flex items-center gap-3 text-xs text-default-500">
          <span>{item.time}</span>
          {item.instanceId && (
            <span className="px-1.5 py-0.5 bg-default-100 rounded">
              {item.instanceId}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export function Timeline({ items, className }: TimelineProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-default-500">
        <div className="w-16 h-16 rounded-full bg-default-100 flex items-center justify-center mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p>暂无操作日志</p>
      </div>
    )
  }

  return (
    <div className={cn('relative', className)}>
      <div className="space-y-0">
        {items.map((item, index) => (
          <TimelineItem key={item.id} item={{ ...item, id: index === items.length - 1 ? 'last' : item.id }} />
        ))}
      </div>
    </div>
  )
}

export default Timeline
