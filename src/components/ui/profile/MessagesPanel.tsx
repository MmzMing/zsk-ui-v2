/**
 * MessagesPanel 消息管理组件
 * 显示系统消息、评论通知、点赞通知、关注通知等
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Card, CardBody, Badge } from '@heroui/react'
import { Bell, MessageCircle, Heart, UserPlus, Check, Settings, Filter } from 'lucide-react'

export type MessageType = 'system' | 'comment' | 'like' | 'follow'

export interface Message {
  id: string
  type: MessageType
  title: string
  content: string
  isRead: boolean
  createdAt: string
}

interface MessagesPanelProps {
  initialMessages?: Message[]
}

export function MessagesPanel({ initialMessages }: MessagesPanelProps) {
  const { t } = useTranslation('profile')
  const [messages, setMessages] = useState<Message[]>(initialMessages || [
    {
      id: '1',
      type: 'system',
      title: '系统通知',
      content: '您的账户已成功升级为高级会员',
      isRead: false,
      createdAt: '2024-01-15 10:30',
    },
    {
      id: '2',
      type: 'comment',
      title: '评论通知',
      content: '张三评论了您的作品「前端入门指南」',
      isRead: false,
      createdAt: '2024-01-15 09:15',
    },
    {
      id: '3',
      type: 'like',
      title: '点赞通知',
      content: '李四点赞了您的作品「React 实战教程」',
      isRead: true,
      createdAt: '2024-01-14 16:45',
    },
    {
      id: '4',
      type: 'follow',
      title: '关注通知',
      content: '王五关注了您',
      isRead: true,
      createdAt: '2024-01-14 14:20',
    },
    {
      id: '5',
      type: 'system',
      title: '系统通知',
      content: '新版本已发布，欢迎体验新功能',
      isRead: true,
      createdAt: '2024-01-13 08:00',
    },
  ])

  const [filter, setFilter] = useState<MessageType | 'all'>('all')
  const [showSettings, setShowSettings] = useState(false)

  const getIcon = (type: MessageType) => {
    switch (type) {
      case 'system':
        return <Bell className="w-5 h-5 text-primary" />
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-blue-500" />
      case 'like':
        return <Heart className="w-5 h-5 text-red-500" />
      case 'follow':
        return <UserPlus className="w-5 h-5 text-green-500" />
    }
  }

  const getTypeLabel = (type: MessageType) => {
    switch (type) {
      case 'system':
        return t('messages.system')
      case 'comment':
        return t('messages.comment')
      case 'like':
        return t('messages.like')
      case 'follow':
        return t('messages.follow')
    }
  }

  const handleMarkAsRead = (id: string) => {
    setMessages(prev => prev.map(msg =>
      msg.id === id ? { ...msg, isRead: true } : msg
    ))
  }

  const handleMarkAllRead = () => {
    setMessages(prev => prev.map(msg => ({ ...msg, isRead: true })))
  }

  const filteredMessages = filter === 'all'
    ? messages
    : messages.filter(msg => msg.type === filter)

  const unreadCount = messages.filter(msg => !msg.isRead).length

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-gradient-to-br from-[var(--primary-color)]/20 via-[var(--primary-color)]/5 to-transparent p-6 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <Bell className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-default-900">{t('messages.title')}</h2>
            <p className="text-sm text-default-500">{t('messages.subtitle')}</p>
          </div>
        </div>
      </div>

      <Card className="shadow-lg">
        <CardBody className="p-0">
          <div className="p-4 border-b border-default-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-default-500" />
              {(['all', 'system', 'comment', 'like', 'follow'] as const).map(type => (
                <Button
                  key={type}
                  variant="light"
                  size="sm"
                  className={`transition-all duration-300 hover:scale-105 ${filter === type ? 'bg-default-200/50 text-default-700' : ''}`}
                  onClick={() => setFilter(type)}
                >
                  {type === 'all' ? t('messages.all') : getTypeLabel(type)}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="light"
                  onClick={handleMarkAllRead}
                  className="bg-[var(--primary-color)]/20 text-[var(--primary-color)] hover:bg-[var(--primary-color)]/30 transition-all duration-300 hover:scale-105"
                >
                  <Check className="w-4 h-4 mr-2" />
                  {t('messages.markAllRead')}
                </Button>
              )}
              <Button
                isIconOnly
                variant="light"
                onClick={() => setShowSettings(!showSettings)}
                className="transition-all duration-300 hover:scale-105"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="divide-y divide-default-100">
            {filteredMessages.length === 0 ? (
              <div className="p-12 text-center">
                <Bell className="w-12 h-12 text-default-300 mx-auto mb-4" />
                <p className="text-default-500">{t('messages.noMessages')}</p>
              </div>
            ) : (
              filteredMessages.map((msg, index) => (
                <div
                  key={msg.id}
                  className={`p-4 hover:bg-default-50 transition-all duration-300 animate-in slide-in-from-left-2 duration-300 ${index > 0 ? `delay-${index * 50}` : ''}`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${!msg.isRead ? 'bg-primary/10 scale-110' : 'bg-default-100'}`}>
                      {getIcon(msg.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant="flat"
                          className={msg.isRead ? 'bg-default-100 text-default-600' : 'bg-primary/10 text-primary'}
                        >
                          {getTypeLabel(msg.type)}
                        </Badge>
                        {!msg.isRead && (
                          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        )}
                      </div>
                      <p className={`text-sm ${msg.isRead ? 'text-default-600' : 'text-default-900 font-medium'}`}>
                        {msg.content}
                      </p>
                      <p className="text-xs text-default-400 mt-1">
                        {msg.createdAt}
                      </p>
                    </div>
                    {!msg.isRead && (
                      <Button
                        variant="light"
                        size="sm"
                        onClick={() => handleMarkAsRead(msg.id)}
                        className="flex-shrink-0 transition-all duration-300 hover:scale-105"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}