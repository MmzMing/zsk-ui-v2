/**
 * 搜索页空状态/错误占位
 */

import { Button } from '@heroui/react'
import { SearchX, AlertCircle } from 'lucide-react'

interface EmptyStateProps {
  variant: 'empty' | 'error'
  keyword?: string
  message?: string
  onRetry?: () => void
}

export function EmptyState({ variant, keyword, message, onRetry }: EmptyStateProps) {
  const isError = variant === 'error'
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-default-500">
      {isError ? (
        <AlertCircle className="h-12 w-12 text-default-600" />
      ) : (
        <SearchX className="h-12 w-12 text-default-400" />
      )}
      <p className="text-sm">
        {isError
          ? message || '加载失败，请稍后重试'
          : keyword
          ? `未找到与「${keyword}」相关的内容`
          : '输入关键字开始搜索'}
      </p>
      {isError && onRetry && (
        <Button color="default" variant="flat" size="sm" onPress={onRetry}>
          重试
        </Button>
      )}
    </div>
  )
}
