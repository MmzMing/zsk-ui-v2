/**
 * 第1层 — 博主信息区
 *
 * 垂直布局：大头像 -> 个人介绍 -> 赞助区
 */

import { useTranslation } from 'react-i18next'
import { Github, Mail, ExternalLink, Monitor } from 'lucide-react'
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
          <div
            className="relative rounded-full border-4 p-1 transition-colors duration-300"
            style={{
              borderColor: liveStatus.isLive ? '#FF6B9D' : 'hsl(var(--color-default-300))',
            }}
          >
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
          </div>

          <a
            href={liveStatus.url}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-2.5 px-6 py-2 rounded-full text-base font-bold transition-all duration-300 hover:scale-105"
            style={{
              background: liveStatus.isLive
                ? 'linear-gradient(135deg, #FF6B9D 0%, #FF4757 100%)'
                : 'rgba(156, 163, 175, 0.8)',
              color: liveStatus.isLive ? 'white' : 'hsl(var(--color-default-700))',
              boxShadow: liveStatus.isLive ? '0 4px 12px rgba(255, 107, 157, 0.4)' : 'none',
            }}
          >
            <Monitor size={20} className={liveStatus.isLive ? 'fill-white' : ''} />
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