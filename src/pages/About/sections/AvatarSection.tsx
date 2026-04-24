/**
 * 第1层 — 博主信息区
 *
 * 垂直布局：大头像 -> 个人介绍 -> 赞助区
 */

import { useTranslation } from 'react-i18next'
import { Github, Mail, ExternalLink } from 'lucide-react'
import { SiBilibili } from 'react-icons/si'
import { PixelatedCanvas } from '@/components/ui/aceternity/pixelated-canvas'
import { BlurFade } from '@/components/ui/magicui/BlurFade'
import { InteractiveHoverButton } from '@/components/ui/magicui/InteractiveHoverButton'
import { useBilibiliLive } from '@/hooks/useBilibiliLive'
import { BILIBILI_ROOM_ID, SPONSOR_ITEMS, SOCIAL_LINKS } from '../about-data'

/** 大头照图片 URL */
const AVATAR_URL = 'https://i.stardots.io/784774835/StarDots-2026041821090663484.jpg'

/** 社交图标映射 */
const SOCIAL_ICON_MAP: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  Github,
  Mail,
  SiBilibili,
}

export function AvatarSection() {
  const { t } = useTranslation('about')
  const liveStatus = useBilibiliLive(BILIBILI_ROOM_ID)

  return (
    <section className="flex flex-col items-center gap-8 py-12 px-4">
      {/* 第一层 — 大头像 + 直播状态 + 社交链接 */}
      <BlurFade direction="down" delay={0} duration={0.6} className="flex flex-col items-center gap-6">
        <div className="relative">
          <PixelatedCanvas
            src={AVATAR_URL}
            width={280}
            height={280}
            cellSize={5}
            dotScale={0.85}
            shape="circle"
            interactive={true}
            distortionMode="swirl"
            distortionStrength={4}
            distortionRadius={80}
            fadeOnLeave={true}
            maxFps={60}
            className="rounded-full"
          />

          {/* 直播状态指示器 */}
          <a
            href={liveStatus.url}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 hover:scale-105"
            style={{
              background: liveStatus.isLive
                ? 'rgba(34, 197, 94, 0.15)'
                : 'rgba(212, 212, 212, 0.15)',
              border: liveStatus.isLive
                ? '1px solid hsl(var(--color-success))'
                : '1px solid hsl(var(--color-default-300))',
              color: liveStatus.isLive
                ? 'hsl(var(--color-success))'
                : 'hsl(var(--color-default-500))',
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{
                background: liveStatus.isLive
                  ? 'hsl(var(--color-success))'
                  : 'hsl(var(--color-default-400))',
                animation: liveStatus.isLive
                  ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                  : 'none',
              }}
            />
            {liveStatus.isLive ? t('bio.liveNow') : t('bio.liveOff')}
          </a>
        </div>

        {/* 社交链接 */}
        <div className="flex items-center gap-4">
          {SOCIAL_LINKS.map((link) => {
            const IconComp = SOCIAL_ICON_MAP[link.icon]
            if (!IconComp) return null
            return (
              <a
                key={link.icon}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full flex items-center justify-center text-default-600 hover:text-primary transition-all duration-200 hover:scale-110"
              >
                <IconComp size={18} />
              </a>
            )
          })}
        </div>
      </BlurFade>

      {/* 第二层 — 个人介绍 */}
      <BlurFade direction="down" delay={0.2} duration={0.6} className="flex flex-col items-center text-center gap-4 max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold text-default-900">{t('bio.name')}</h1>
          <p className="text-lg text-default-500 mt-1">{t('bio.tagline')}</p>
        </div>

        <p className="text-default-700 leading-relaxed text-base">
          {t('bio.description')}
        </p>
      </BlurFade>

      {/* 第三层 — 赞助商横幅 */}
      <BlurFade direction="down" delay={0.4} duration={0.5} className="w-full max-w-4xl">
        <div className="flex items-center justify-center gap-4 px-6 py-4">
          <span className="text-sm text-default-500 mr-2 shrink-0">{t('bio.sponsors')}</span>

          <div className="flex items-center gap-4 flex-wrap justify-center">
            {SPONSOR_ITEMS.map((sponsor) => (
              <a
                key={sponsor.name}
                href={sponsor.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-default-700 hover:text-primary hover:shadow-sm transition-all duration-200 hover:scale-105"
              >
                {sponsor.name}
                <ExternalLink size={12} />
              </a>
            ))}
          </div>

          <InteractiveHoverButton className="ml-4 shrink-0 text-xs">
            {t('bio.becomeSponsor')}
          </InteractiveHoverButton>
        </div>
      </BlurFade>
    </section>
  )
}