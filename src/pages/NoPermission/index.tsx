/**
 * 403 页面 - 访问受限主题
 * 赛博朋克风格的创意 403 页面
 */

import { Button } from '@heroui/react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Home, ArrowLeft } from 'lucide-react'

function GlitchText({ text, className = '' }: { text: string; className?: string }) {
  const [isGlitching, setIsGlitching] = useState(false)
  const [isHovering, setIsHovering] = useState(false)

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

      <motion.div
        className="absolute inset-0 text-[#ffaa00]"
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

      <span className="relative z-10">{text}</span>
    </div>
  )
}

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

function PixelDebris() {
  const debris = Array.from({ length: 15 }, (_, i) => ({
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
          className="absolute bg-[#ff0040]/60"
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

function ErrorStream() {
  const { t } = useTranslation('common')
  const lines = [
    'ERROR: ACCESS_DENIED',
    '403: FORBIDDEN',
    'WARNING: PERMISSION_DENIED',
    t('noPermission.forbidden') || '权限被拒绝',
    'ERROR_CODE: 0x403',
    'ACCESS_RESTRICTED',
    'PERMISSION_REQUIRED',
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
          className="absolute text-xs font-mono text-[#ff0040]/70 whitespace-nowrap"
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

export default function NoPermissionPage() {
  const { t } = useTranslation('common')
  const navigate = useNavigate()

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#0a0a0a]">
      <Scanlines />
      <NoiseOverlay />
      <PixelDebris />
      <ErrorStream />

      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 0, 64, 0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 0, 64, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ff0040] via-[#ffaa00] to-[#ff0040]" />

      <div className="relative z-10 flex flex-col items-center gap-6 px-4">
        <GlitchText
          text="403"
          className="text-[10rem] md:text-[18rem] font-black font-mono tracking-tighter leading-none"
        />

        <div className="text-center space-y-2">
          <GlitchText
            text={t('noPermission.title') || 'ACCESS DENIED'}
            className="text-xl md:text-2xl font-bold font-mono text-[#ff0040]"
          />
          <p className="text-sm md:text-base text-white/50 font-mono">
            {t('noPermission.desc') || '您没有权限访问此页面，请联系管理员'}
          </p>
        </div>

        <div className="flex gap-4 text-xs font-mono text-[#ffaa00]/60">
          <span>ERR_{Math.random().toString(36).substring(7).toUpperCase()}</span>
          <span>{`0x${Math.floor(Math.random() * 16777215).toString(16).toUpperCase()}`}</span>
        </div>

        <div className="w-full max-w-md h-px bg-gradient-to-r from-transparent via-[#ff0040]/30 to-transparent" />

        <div className="flex gap-4">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="lg"
              variant="bordered"
              className="font-mono text-sm border-white/30 text-white/80 hover:bg-white/10 hover:border-white/50 transition-all duration-300"
              onClick={() => navigate(-1)}
              startContent={<ArrowLeft className="w-4 h-4" />}
            >
              {t('noPermission.back') || '返回上页'}
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              as={Link}
              to="/admin/dashboard"
              size="lg"
              variant="solid"
              className="font-mono text-sm bg-[#ff0040] hover:bg-[#cc0033] border-none text-white transition-all duration-300"
              startContent={<Home className="w-4 h-4" />}
            >
              {t('noPermission.backHome') || '返回首页'}
            </Button>
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-8 text-xs font-mono text-white/20">
        <span>SYS.403.FORBIDDEN</span>
        <span>{`// ${new Date().toISOString().split('T')[0]}`}</span>
        <span>STATUS: RESTRICTED</span>
      </div>

      <div className="absolute top-4 left-4 w-16 h-16 border-l-2 border-t-2 border-[#ff0040]/40" />
      <div className="absolute top-4 right-4 w-16 h-16 border-r-2 border-t-2 border-[#ffaa00]/40" />
      <div className="absolute bottom-4 left-4 w-16 h-16 border-l-2 border-b-2 border-[#ffaa00]/40" />
      <div className="absolute bottom-4 right-4 w-16 h-16 border-r-2 border-b-2 border-[#ff0040]/40" />
    </div>
  )
}