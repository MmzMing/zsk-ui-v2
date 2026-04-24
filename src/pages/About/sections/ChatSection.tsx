/**
 * 第4层 — 气泡弹窗对话
 *
 * 移植 ChatBubble 组件，展示关于博主的 FAQ 对话
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@heroui/react'
import { BlurFade } from '@/components/ui/magicui/BlurFade'
import { ChatBubble } from '@/components/ui/ChatBubble'
import { ABOUT_CHAT_ITEMS, ABOUT_CHAT_QUESTIONS } from '../about-data'

export function ChatSection() {
  const { t } = useTranslation('about')
  const [chatKey, setChatKey] = useState(0)

  return (
    <section className="py-12 px-4">
      <BlurFade direction="up" delay={0.7} duration={0.5}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold text-default-900">{t('chat.title')}</h2>
            <p className="text-default-500 text-sm">{t('chat.subtitle')}</p>
          </div>
          <Button
            variant="bordered"
            size="sm"
            onClick={() => setChatKey((k) => k + 1)}
          >
            {t('chat.replay')}
          </Button>
        </div>
      </BlurFade>

      <BlurFade direction="up" delay={0.8} duration={0.5}>
        <div className="w-full max-w-4xl mx-auto">
          <ChatBubble
            key={chatKey}
            items={ABOUT_CHAT_ITEMS}
            questions={ABOUT_CHAT_QUESTIONS}
            typingSpeed={38}
          />
        </div>
      </BlurFade>
    </section>
  )
}