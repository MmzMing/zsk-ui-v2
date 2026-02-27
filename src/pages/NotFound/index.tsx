/**
 * 404 页面 - 故障艺术主题
 * 赛博朋克风格的创意 404 页面
 */

import { Button } from '@heroui/react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

// ===== 1. 故障文字组件 =====
function GlitchText({ text, className = '' }: { text: string; className?: string }) {
  const [isGlitching, setIsGlitching] = useState(false)
  const [isHovering, setIsHovering] = useState(false)

  // 随机触发故障效果
  useEffect(() => {
    const interval = setInterval(() => {
      setIsGlitching(true)
      setTimeout(() => setIsGlitching(false), 150 + Math.random() * 200)
    }, 3000 + Math.random() * 4000)

    return () => clearInterval(interval)
  }, [])

  const active = isGlitching || isHovering

  return (
    <div 
      className={`relative inline-block ${className} cursor-pointer`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* 红色偏移层 */}
      <motion.div
        className="absolute inset-0 text-[#ff0040]"
        animate={
          active
            ? { x: [-3, 3, -2, 2, 0], opacity: [0, 1, 0.8, 1, 0] }
            : { x: 0, opacity: 0 }
        }
        transition={{ 
          duration: 0.2,
          repeat: isHovering ? Infinity : 0,
          repeatDelay: 0.1
        }}
      >
        {text}
      </motion.div>

      {/* 蓝色偏移层 */}
      <motion.div
        className="absolute inset-0 text-[#00ffff]"
        animate={
          active
            ? { x: [3, -3, 2, -2, 0], opacity: [0, 1, 0.8, 1, 0] }
            : { x: 0, opacity: 0 }
        }
        transition={{ 
          duration: 0.2,
          repeat: isHovering ? Infinity : 0,
          repeatDelay: 0.2
        }}
      >
        {text}
      </motion.div>

      {/* 主文字 */}
      <span className="relative z-10">{text}</span>
    </div>
  )
}

// ===== 2. 扫描线效果 =====
function Scanlines() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
      <div
        className="absolute inset-0"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 0, 0, 0.3) 2px,
            rgba(0, 0, 0, 0.3) 4px
          )`,
        }}
      />
    </div>
  )
}

// ===== 3. CRT 屏幕噪点 =====
function NoiseOverlay() {
  return (
    <div
      className="absolute inset-0 pointer-events-none opacity-[0.03]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }}
    />
  )
}

// ===== 4. 像素碎片动画 =====
function PixelDebris() {
  const debris = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 2,
    size: 4 + Math.random() * 8,
    duration: 2 + Math.random() * 2,
  }))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {debris.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute bg-white/80"
          style={{
            left: `${piece.x}%`,
            width: piece.size,
            height: piece.size,
          }}
          initial={{ top: '-10%', opacity: 0 }}
          animate={{
            top: ['-10%', '110%'],
            opacity: [0, 1, 0],
            rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
          }}
          transition={{
            duration: piece.duration,
            delay: piece.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  )
}

// ===== 5. 随机错误代码流 =====
function ErrorStream() {
  const { t } = useTranslation('common')
  const lines = [
    'ERROR: PAGE_NOT_FOUND',
    '404: RESOURCE_MISSING',
    'WARNING: DIV_ID_NOT_EXIST',
    t('notFound.lost'),
    'ERROR_CODE: 0x404',
    'FAILED TO LOCATE',
    t('notFound.title'),
  ]

  const [activeLines, setActiveLines] = useState<{ id: number; text: string; x: number; delay: number }[]>([])

  useEffect(() => {
    const addLine = () => {
      const newLine = {
        id: Date.now(),
        text: lines[Math.floor(Math.random() * lines.length)],
        x: Math.random() * 60 + 20,
        delay: Math.random() * 2,
      }
      setActiveLines((prev) => [...prev.slice(-5), newLine])

      setTimeout(() => {
        setActiveLines((prev) => prev.filter((l) => l.id !== newLine.id))
      }, 3000)
    }

    const interval = setInterval(addLine, 1500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {activeLines.map((line) => (
        <motion.p
          key={line.id}
          className="absolute text-xs font-mono text-[#00ff88]/60 whitespace-nowrap"
          style={{ left: `${line.x}%` }}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: [0, 300], opacity: [0, 1, 0] }}
          transition={{ duration: 3, delay: line.delay }}
        >
          {line.text}
        </motion.p>
      ))}
    </div>
  )
}

// ===== 6. 主页面组件 =====
export default function NotFoundPage() {
  const { t } = useTranslation('common')
  
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#0a0a0a]">
      {/* 背景特效层 */}
      <Scanlines />
      <NoiseOverlay />
      <PixelDebris />
      <ErrorStream />

      {/* 网格背景 */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 136, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 136, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* 顶部装饰条 */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ff0040] via-[#00ff88] to-[#00ffff]" />

      {/* 主要内容 */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-4">
        {/* 404 - 故障艺术效果 */}
        <GlitchText
          text="404"
          className="text-[10rem] md:text-[18rem] font-black font-mono tracking-tighter leading-none"
        />

        {/* 错误信息 */}
        <div className="text-center space-y-2">
          <GlitchText
            text={t('notFound.title')}
            className="text-xl md:text-2xl font-bold font-mono text-[#00ffff]"
          />
          <p className="text-sm md:text-base text-white/50 font-mono">
            {t('notFound.desc')}
          </p>
        </div>

        {/* 装饰性错误码 */}
        <div className="flex gap-4 text-xs font-mono text-[#ff0040]/60">
          <span>ERR_{Math.random().toString(36).substring(7).toUpperCase()}</span>
          <span>{`0x${Math.floor(Math.random() * 16777215).toString(16).toUpperCase()}`}</span>
        </div>

        {/* 分割线 */}
        <div className="w-full max-w-md h-px bg-gradient-to-r from-transparent via-[#00ff88]/30 to-transparent" />

        {/* 返回按钮 - 简约白 */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            as={Link}
            to="/"
            size="lg"
            variant="bordered"
            className="font-mono text-sm border-white/30 text-white/80 hover:bg-white/10 hover:border-white/50 transition-all duration-300"
          >
            <span className="mr-2">←</span>
            {t('notFound.backHome')}
          </Button>
        </motion.div>
      </div>

      {/* 底部装饰 */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-8 text-xs font-mono text-white/20">
        <span>SYS.404.ERR</span>
        <span>{`// ${new Date().toISOString().split('T')[0]}`}</span>
        <span>STATUS: CRITICAL</span>
      </div>

      {/* 角落装饰 */}
      <div className="absolute top-4 left-4 w-16 h-16 border-l-2 border-t-2 border-[#00ff88]/40" />
      <div className="absolute top-4 right-4 w-16 h-16 border-r-2 border-t-2 border-[#00ffff]/40" />
      <div className="absolute bottom-4 left-4 w-16 h-16 border-l-2 border-b-2 border-[#ff0040]/40" />
      <div className="absolute bottom-4 right-4 w-16 h-16 border-r-2 border-b-2 border-[#00ff88]/40" />
    </div>
  )
}
