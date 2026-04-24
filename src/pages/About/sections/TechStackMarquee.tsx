/**
 * 第2层 — 技术栈图标墙跑马灯
 *
 * 使用 framer-motion 实现单向匀速无限水平滚动
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Coffee, Database, Code2, Server, Box, Wind, GitBranch, GitMerge,
  Terminal, Globe, Paintbrush, Hexagon, Zap, Layers, Cloud, Shield,
  Braces, LayoutDashboard, FileCode, Cpu,
} from 'lucide-react'
import { BlurFade } from '@/components/ui/magicui/BlurFade'
import { TECH_STACK_ITEMS } from '../about-data'

/** lucide-react 图标映射 */
const LUCIDE_ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>> = {
  Coffee, Database, Code2, Server, Box, Wind, GitBranch, GitMerge,
  Terminal, Globe, Paintbrush, Hexagon, Zap, Layers, Cloud, Shield,
  Braces, LayoutDashboard, FileCode, Cpu,
}

export function TechStackMarquee() {
  const { t } = useTranslation('about')
  const [isHovered, setIsHovered] = useState(false)

  // 三倍内容拼接实现无缝循环
  const tripledItems = [...TECH_STACK_ITEMS, ...TECH_STACK_ITEMS, ...TECH_STACK_ITEMS]

  return (
    <section className="py-12 px-4">
      <BlurFade direction="up" delay={0.4} duration={0.5}>
        <h2 className="text-2xl font-bold text-default-900 mb-6 text-center">
          {t('techStack.title')}
        </h2>
      </BlurFade>

      {/* 跑马灯区域 — 使用渐变遮罩实现边缘渐隐 */}
      <div
        className="relative overflow-hidden w-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* 左侧渐变遮罩 */}
        <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[var(--color-content)] to-transparent z-10" />
        {/* 右侧渐变遮罩 */}
        <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[var(--color-content)] to-transparent z-10" />

        {/* 滚动容器 */}
        <motion.div
          className="flex items-center gap-6 py-4"
          animate={{
            x: ['0%', '-33.33%'],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: 'linear',
            repeatType: 'loop',
          }}
          style={{
            width: 'fit-content',
            animationPlayState: isHovered ? 'paused' : 'running',
          }}
        >
          {tripledItems.map((item, index) => {
            const IconComp = item.source === 'lucide'
              ? LUCIDE_ICON_MAP[item.icon]
              : null

            return (
              <div
                key={`${item.name}-${index}`}
                className="flex items-center justify-center shrink-0 transition-all duration-300 hover:scale-110"
                style={{ minWidth: 60 }}
              >
                {IconComp ? (
                  <IconComp size={36} style={{ color: item.color }} />
                ) : (
                  <div
                    className="w-9 h-9 rounded-md flex items-center justify-center text-xs font-bold"
                    style={{ background: `${item.color}20`, color: item.color }}
                  >
                    {item.name.slice(0, 2)}
                  </div>
                )}
              </div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}