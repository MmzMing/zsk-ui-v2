/**
 * 第4层 — 气泡弹窗对话
 *
 * 移植 ChatBubble 组件，展示关于博主的 FAQ 对话
 */

import { useTranslation } from 'react-i18next'
import { BlurFade } from '@/components/ui/magicui/BlurFade'
import { ChatBubble } from '@/components/ui/ChatBubble'
import { ABOUT_CHAT_ITEMS, ABOUT_CHAT_QUESTIONS } from '../about-data'

export function ChatSection() {
  const { t } = useTranslation('about')

  return (
    <section className="py-12 px-4">
      <BlurFade direction="up" delay={0.4} duration={0.5}>
        <h2 className="text-2xl font-bold text-default-900 mb-6 text-center">
          {t('chat.title')}
        </h2>
      </BlurFade>

      <BlurFade direction="up" delay={0.7} duration={0.5}>
        <div className="w-full max-w-4xl mx-auto">
          <ChatBubble
            items={ABOUT_CHAT_ITEMS}
            questions={ABOUT_CHAT_QUESTIONS}
            typingSpeed={38}
          />
        </div>
      </BlurFade>
    </section>
  )
}