/**
 * 确认气泡组件
 * 用于删除等危险操作的二次确认
 */

import { useState, useCallback } from 'react'
import { Popover, PopoverTrigger, PopoverContent, Button } from '@heroui/react'
import { AlertTriangle } from 'lucide-react'

interface ConfirmPopoverProps {
  /** 触发元素 */
  children: React.ReactNode
  /** 确认提示标题 */
  title?: string
  /** 确认提示描述 */
  description?: string
  /** 确认按钮文案 */
  confirmText?: string
  /** 取消按钮文案 */
  cancelText?: string
  /** 确认按钮颜色 */
  confirmColor?: 'danger' | 'primary' | 'warning'
  /** 确认回调 */
  onConfirm: () => void | Promise<void>
}

export default function ConfirmPopover({
  children,
  title = '确认操作',
  description,
  confirmText = '确认',
  cancelText = '取消',
  confirmColor = 'danger',
  onConfirm,
}: ConfirmPopoverProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = useCallback(async () => {
    setIsLoading(true)
    try {
      await onConfirm()
      setIsOpen(false)
    } finally {
      setIsLoading(false)
    }
  }, [onConfirm])

  return (
    <Popover
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      placement="top"
      showArrow
    >
      <PopoverTrigger>{children}</PopoverTrigger>
      <PopoverContent>
        <div className="px-1 py-2 w-56">
          <div className="flex items-start gap-2">
            <AlertTriangle size={16} className="text-warning mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-small font-semibold">{title}</p>
              {description && (
                <p className="text-tiny text-default-500 mt-1">{description}</p>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-3">
            <Button size="sm" variant="flat" onPress={() => setIsOpen(false)}>
              {cancelText}
            </Button>
            <Button
              size="sm"
              color={confirmColor}
              isLoading={isLoading}
              onPress={handleConfirm}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
