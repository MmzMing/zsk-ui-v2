/**
 * StatusState - 通用状态显示组件
 * 处理空状态、错误、网络异常、无权限及加载中等多种视觉反馈
 */
import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button, Spinner } from '@heroui/react'
import { 
  Inbox, 
  AlertCircle, 
  WifiOff, 
  ShieldAlert, 
  RefreshCw,
  SearchX
} from 'lucide-react'
import { cn } from '@/utils'

export type StatusType = 'empty' | 'error' | 'network' | 'forbidden' | 'loading' | 'search-empty'

interface StatusStateProps {
  /** 状态类型 */
  type?: StatusType
  /** 标题 */
  title?: string
  /** 描述文字 */
  description?: string
  /** 按钮文字 */
  actionText?: string
  /** 按钮点击回调 */
  onAction?: () => void
  /** 自定义图标 */
  icon?: React.ReactNode
  /** 场景：前台或后台 */
  scene?: 'front' | 'admin'
  /** 容器类名 */
  className?: string
  /** 是否全屏占满 */
  full?: boolean
}

const STATUS_CONFIG = {
  empty: {
    icon: Inbox,
    title: '暂无数据',
    description: '这里空空如也，什么都没有发现',
    color: 'text-default-400'
  },
  'search-empty': {
    icon: SearchX,
    title: '未搜索到结果',
    description: '尝试换个关键词再搜搜看吧',
    color: 'text-warning-500'
  },
  error: {
    icon: AlertCircle,
    title: '系统出错',
    description: '服务器开小差了，请稍后再试',
    color: 'text-danger-500'
  },
  network: {
    icon: WifiOff,
    title: '网络断开',
    description: '请检查您的网络连接是否正常',
    color: 'text-default-500'
  },
  forbidden: {
    icon: ShieldAlert,
    title: '无权访问',
    description: '您没有权限访问该页面，请联系管理员',
    color: 'text-danger-500'
  },
  loading: {
    icon: null,
    title: '努力加载中',
    description: '请稍等片刻，精彩即将呈现',
    color: 'text-primary-500'
  }
}

/**
 * 通用状态显示组件 (空状态/错误状态/加载状态)
 * 设计风格：简约、动效、区分前后台
 */
export function StatusState({
  type = 'empty',
  title,
  description,
  actionText,
  onAction,
  icon,
  scene = 'front',
  className,
  full = false
}: StatusStateProps) {
  const config = STATUS_CONFIG[type]
  const IconComponent = config.icon
  const isFront = scene === 'front'

  const content = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center",
        full && "min-h-[400px] w-full",
        className
      )}
    >
      {/* 图标区域 */}
      <div className="relative mb-6">
        <AnimatePresence mode="wait">
          {type === 'loading' ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, rotate: 0 }}
              animate={{ opacity: 1, rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            >
              <Spinner size="lg" color="primary" variant="wave" />
            </motion.div>
          ) : (
            <motion.div
              key={type}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className={cn(
                "p-4 rounded-full",
                isFront ? "bg-default-50 shadow-inner" : "bg-content2"
              )}
            >
              {icon || (IconComponent && (
                <IconComponent 
                  size={isFront ? 64 : 48} 
                  strokeWidth={1.5}
                  className={config.color} 
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* 前台装饰性背景动效 */}
        {isFront && type !== 'loading' && (
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
            transition={{ repeat: Infinity, duration: 4 }}
            className="absolute inset-0 -z-10 bg-primary-500/10 blur-3xl rounded-full"
          />
        )}
      </div>

      {/* 文字区域 */}
      <div className="space-y-2 max-w-[280px]">
        <h3 className={cn(
          "font-bold tracking-tight",
          isFront ? "text-2xl text-foreground" : "text-lg text-default-700"
        )}>
          {title || config.title}
        </h3>
        <p className={cn(
          "text-sm leading-relaxed",
          isFront ? "text-default-500" : "text-default-400"
        )}>
          {description || config.description}
        </p>
      </div>

      {/* 操作按钮 */}
      {onAction && (
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-8"
        >
          <Button
            color="primary"
            variant={isFront ? "shadow" : "flat"}
            radius="full"
            onPress={onAction}
            startContent={type === 'error' || type === 'network' ? <RefreshCw size={18} /> : null}
            className={cn(
              "px-8 font-medium",
              isFront && "bg-gradient-to-tr from-primary-500 to-secondary-500 text-white shadow-lg shadow-primary-500/20"
            )}
          >
            {actionText || (type === 'error' || type === 'network' ? '重试一次' : '回到首页')}
          </Button>
        </motion.div>
      )}
    </motion.div>
  )

  return content
}
