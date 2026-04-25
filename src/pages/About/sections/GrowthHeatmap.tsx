/**
 * 第3层 — 技术成长热力图
 *
 * 参考 GitHub 贡献热力图风格，展示贪吃蛇动画效果
 * 入场动画使用 BlurFade 逐列渐入
 */

import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { BlurFade } from '@/components/ui/magicui/BlurFade'
import { useUIStore } from '@/stores/ui'

/** GitHub Contribution Snake SVG URL */
const SNAKE_SVG_URL = 'https://raw.githubusercontent.com/MmzMing/MmzMing/output/github-contribution-grid-snake-dark.svg'

export function GrowthHeatmap() {
  const { t } = useTranslation('about')
  const { showLoading, hideLoading } = useUIStore()

  useEffect(() => {
    showLoading('章鱼猫正在爬取贡献数据...')
  }, [showLoading])

  return (
    <section className="py-12 px-4">
      <BlurFade direction="up" delay={0.5} duration={0.5}>
        <div className="flex flex-col gap-2 mb-6 text-center">
          <h2 className="text-2xl font-bold text-default-900">{t('heatmap.title')}</h2>
        </div>
      </BlurFade>

      <BlurFade direction="up" delay={0.6} duration={0.5}>
        <div className="w-full flex justify-center overflow-x-auto">
          <div className="relative max-w-4xl">
            <img
              src={SNAKE_SVG_URL}
              alt="GitHub Contribution Snake"
              className="w-full h-auto rounded-lg"
              loading="lazy"
              onLoad={() => hideLoading()}
              onError={() => hideLoading()}
            />
          </div>
        </div>
      </BlurFade>
    </section>
  )
}