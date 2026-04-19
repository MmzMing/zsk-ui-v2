// ===== 1. 依赖导入区域 =====
import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { cn } from '@/utils'
import { useTheme } from '@/hooks'
import { useTranslation } from 'react-i18next'
import { Anchor, Ship, Clock, Users } from 'lucide-react'

// ===== 2. TODO待处理导入区域 =====

// ===== 3. 状态控制逻辑区域 =====

// ===== 4. 通用工具函数区域 =====

// ===== 5. 注释代码函数区 =====

// ===== 6. 错误处理函数区域 =====

// ===== 7. 数据处理函数区域 =====

// ===== 8. UI渲染逻辑区域 =====

/**
 * SVG 滤镜组件 - 提供纸张纹理和边缘粗糙效果
 * 用于增强视觉层次感和复古风格
 */
const TextureFilters = () => (
  <svg className="hidden">
    <defs>
      {/* 纸张纹理滤镜 - 模拟粗糙纸张质感 */}
      <filter id="paper-texture">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
        <feComponentTransfer>
          <feFuncA type="linear" slope="0.4" />
        </feComponentTransfer>
        <feBlend mode="multiply" in="SourceGraphic" />
      </filter>
      
      {/* 边缘粗糙滤镜 - 模拟剪纸边缘不规则效果 */}
      <filter id="rough-edges">
        <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="1" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
      </filter>
    </defs>
  </svg>
)

/**
 * 闪电组件 - 随机生成闪电路径动画
 * 
 * @param {Object} props - 组件属性
 * @param {boolean} props.isBig - 是否为大闪电效果
 */
const Lightning = ({ isBig }: { isBig: boolean }) => {
  // 生成随机闪电路径 - 使用分形噪声原理生成自然闪电形状
  const points = useMemo(() => {
    let path = "M 50 0 "
    let x = 50
    let y = 0
    while (y < 100) {
      y += Math.random() * 10 + 5
      x += (Math.random() - 0.5) * 20
      path += `L ${x} ${y} `
    }
    return path
  }, [])

  return (
    <motion.svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className={cn(
        "absolute top-0 left-1/2 w-full h-full -translate-x-1/2 pointer-events-none z-10",
        isBig ? "opacity-100 drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]" : "opacity-70"
      )}
      initial={{ opacity: 0, pathLength: 0 }}
      animate={{ opacity: [0, 1, 0], pathLength: 1 }}
      transition={{ duration: 0.2 }}
    >
      <path d={points} stroke="white" strokeWidth={isBig ? 1.5 : 0.5} fill="none" />
    </motion.svg>
  )
}

/**
 * 雨滴组件 - 生成随机下落的雨滴效果
 * 仅在暗色主题下显示，营造暴风雨氛围
 */
const Rain = () => {
  // 生成随机雨滴数据 - 控制雨滴位置、延迟和下落速度
  const raindrops = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * -100}%`,
      delay: Math.random() * 2,
      duration: 0.8 + Math.random() * 0.6
    }))
  }, [])

  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
      {raindrops.map((drop) => (
        <motion.div
          key={drop.id}
          className="absolute w-[1.5px] h-[30px] bg-white/20"
          style={{ 
            left: drop.left, 
            top: drop.top,
            transform: 'rotate(15deg)' // 雨滴倾斜角度，模拟风雨效果
          }}
          animate={{
            y: ["0vh", "120vh"],
            opacity: [0, 0.5, 0]
          }}
          transition={{
            duration: drop.duration,
            repeat: Infinity,
            delay: drop.delay,
            ease: "linear"
          }}
        />
      ))}
    </div>
  )
}

/**
 * 波浪组件 - 生成不同类型的波浪动画效果
 * 
 * @param {Object} props - 波浪属性
 * @param {number} props.delay - 动画延迟时间(秒)
 * @param {number} props.duration - 动画周期(秒)
 * @param {string} props.yOffset - 垂直偏移量
 * @param {string} props.color - 波浪颜色
 * @param {number} props.zIndex - z-index层级
 * @param {number} [props.amplitude=20] - 波浪振幅
 * @param {number} [props.direction=1] - 移动方向(1向右/-1向左)
 * @param {'ripple' | 'normal' | 'violent'} [props.type='normal'] - 波浪类型
 */
const WaveLayer = ({ 
  delay, 
  duration, 
  yOffset, 
  color, 
  zIndex, 
  amplitude = 20,
  direction = 1,
  type = 'normal'
}: { 
  delay: number
  duration: number
  yOffset: string
  color: string
  zIndex: number
  amplitude?: number
  direction?: number
  type?: 'ripple' | 'normal' | 'violent'
}) => {
  
  const { actualTheme } = useTheme()
  const isLight = actualTheme === 'light'
  
  // 锯齿状/倒钩状波浪路径定义
  const paths = {
    // 涟漪：平缓的起伏效果，用于明亮主题
    ripple: "M0,60 C300,70 600,50 900,60 C1050,65 1200,55 1200,60 L1200,500 L0,500 Z",
    // 普通波浪：尖锐的锯齿效果
    normal: (() => {
      let d = "M0,100 ";
      for(let i=0; i<12; i++) {
        d += `Q ${i*100+50} 0 ${i*100+100} 100 `;
      }
      d += "L 1200 500 L 0 500 Z";
      return d;
    })(),
    // 剧烈巨浪：更夸张的倒钩，模拟暴风雨中的尖浪效果
    violent: (() => {
      let d = "M0,150 ";
      for(let i=0; i<8; i++) {
        // 模仿图片中的尖刺：左侧平缓，右侧陡峭
        d += `C ${i*150+50} 150, ${i*150+80} 0, ${i*150+150} 150 `; 
      }
      d += "L 1200 800 L 0 800 Z";
      return d;
    })()
  }

  const path = paths[type]

  return (
    <motion.div
      className={`absolute left-[-25%] right-[-25%] bottom-0 ${color}`}
      style={{ 
        bottom: yOffset, 
        zIndex, 
        height: type === 'violent' ? '80vh' : (type === 'normal' ? '60vh' : '50vh') 
      }}
      animate={{
        x: direction > 0 
          ? ["-10%", "0%", "-10%"] 
          : ["0%", "-10%", "0%"],
        y: [0, -amplitude, 0],
      }}
      transition={{
        duration: duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay: delay
      }}
    >
      <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1200 500">
        <path 
          d={path} 
          fill="currentColor"
          filter={isLight ? 'none' : "url(#rough-edges)"}
        />
      </svg>
    </motion.div>
  )
}

/**
 * 小船组件 - 模拟小船在波浪中航行的效果
 * 根据主题不同，摆动幅度有所区别
 */
const Boat = () => {
  const controls = useAnimation()
  const { actualTheme } = useTheme()
  const isLight = actualTheme === 'light'

  // 随机不规则摆动逻辑 - 明亮主题更平缓，暗色主题更剧烈
  useEffect(() => {
    let isMounted = true
    
    const randomAnimate = async () => {
      while (isMounted) {
        await controls.start({
          y: isLight 
            ? Math.random() * 30 - 15 
            : Math.random() * 120 - 40,
          rotate: isLight 
            ? Math.random() * 10 - 5 
            : Math.random() * 40 - 20,
          scale: 0.95 + Math.random() * 0.1,
          transition: { 
            duration: isLight 
              ? 2 + Math.random() * 2 
              : 0.8 + Math.random() * 1.5,
            ease: "easeInOut" 
          }
        })
      }
    }

    randomAnimate()
    return () => { isMounted = false }
  }, [controls, isLight])

  return (
    <motion.div
      className="absolute z-30 w-[1000px] h-[600px]"
      style={{ bottom: isLight ? '25%' : '35%' }}
      initial={{ x: "110vw", y: 0, rotate: 0 }}
      animate={{ 
        x: ["110vw", "-120vw"],
      }}
      transition={{ 
        duration: isLight ? 60 : 40,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      <motion.div
        className="w-full h-full relative"
        animate={controls}
      >
        <img 
          src="/test/海盗船.svg" 
          alt="Pirate Ship"
          className="w-full h-full object-contain drop-shadow-2xl"
          style={{ 
            filter: isLight 
              ? 'url(#rough-edges) brightness(0.8)' 
              : 'url(#rough-edges) brightness(0)',
            transform: 'scaleX(-1)',
            opacity: isLight ? 0.9 : 1
          }} 
        />
      </motion.div>
    </motion.div>
  )
}

/**
 * 航海记录组件 - 展示网站运行统计数据
 * 包括运行时长、访问人数和服务状态
 */
const VoyageStats = () => {
  const { actualTheme } = useTheme()
  const { t } = useTranslation('banner')
  const isLight = actualTheme === 'light'
  const [stats, setStats] = useState({
    uptime: '',
    visitors: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  // 获取统计数据 - 从 API 或使用默认值
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/stats`)
        if (response.ok) {
          const data = await response.json()
          setStats({
            uptime: formatUptime(data.uptime || 0),
            visitors: data.visitors || 0
          })
        } else {
          // API 失败时使用默认值
          setStats({
            uptime: formatUptime(86400 * 30),
            visitors: 12345
          })
        }
      } catch {
        // 网络异常时使用默认值
        setStats({
          uptime: formatUptime(86400 * 30),
          visitors: 12345
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  /**
   * 格式化运行时长显示
   * 
   * @param {number} seconds - 总秒数
   * @returns {string} 格式化后的时长字符串
   */
  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${days}天 ${hours}小时 ${minutes}分钟`
  }

  /**
   * 格式化数字显示
   * 超过1万时显示为"X.X万"格式
   * 
   * @param {number} num - 数字
   * @returns {string} 格式化后的数字字符串
   */
  const formatNumber = (num: number): string => {
    if (num >= 10000) {
      return (num / 10000).toFixed(1) + '万'
    }
    return num.toLocaleString()
  }

  // 统计数据项配置
  const statItems = [
    {
      icon: Clock,
      label: t('stats.uptimeLabel', '航海时长'),
      value: isLoading ? t('stats.loading', '加载中...') : stats.uptime,
      tooltip: t('stats.uptimeTooltip', '网站运行总时长')
    },
    {
      icon: Users,
      label: t('stats.visitorsLabel', '船员人数'),
      value: isLoading ? '---' : formatNumber(stats.visitors),
      tooltip: t('stats.visitorsTooltip', '累计浏览人数')
    },
    {
      icon: Ship,
      label: t('stats.statusLabel', '航行状态'),
      value: t('stats.statusValue', '一帆风顺'),
      tooltip: t('stats.statusTooltip', '当前服务状态')
    }
  ]

  return (
    <motion.div
      className={cn(
        "mt-4 sm:mt-6 md:mt-8 flex flex-wrap gap-4 sm:gap-6 md:gap-8 lg:gap-12",
        isLight ? "text-slate-600" : "text-gray-400"
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
    >
      {statItems.map((item) => (
        <div key={item.label} className="relative">
          <motion.div
            className={cn(
              "flex items-center gap-1.5 sm:gap-2 cursor-help",
              isLight ? "hover:text-slate-800" : "hover:text-white"
            )}
            whileHover={{ scale: 1.05 }}
            onMouseEnter={() => setHoveredItem(item.label)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <item.icon className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm font-medium">{item.value}</span>
          </motion.div>
          
          {/* 悬停提示框 */}
          <AnimatePresence>
            {hoveredItem === item.label && (
              <motion.div
                className={cn(
                  "absolute left-1/2 -translate-x-1/2 -top-10 px-3 py-2 rounded-lg text-xs whitespace-nowrap z-50",
                  isLight 
                    ? "bg-slate-800 text-white" 
                    : "bg-white/10 text-gray-200 backdrop-blur-sm"
                )}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <div className="font-medium">{item.label}</div>
                <div className="opacity-70">{item.tooltip}</div>
                <div className={cn(
                  "absolute left-1/2 -translate-x-1/2 top-full w-0 h-0",
                  "border-l-8 border-r-8 border-t-8 border-transparent",
                  isLight ? "border-t-slate-800" : "border-t-white/10"
                )} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </motion.div>
  )
}

// ===== 9. 页面初始化与事件绑定 =====

// ===== 10. TODO任务管理区域 =====

// ===== 11. 导出区域 =====

/**
 * 首页 Banner 组件 - 展示暴风雨/风平浪静主题的动态背景
 * 包含闪电、雨滴、波浪、小船等动画效果
 * 根据主题模式显示不同的视觉风格
 */
export default function HomeBanner() {
  const { actualTheme } = useTheme()
  const isLight = actualTheme === 'light'
  const [lightningState, setLightningState] = useState<'none' | 'normal' | 'big'>('none')
  const { t } = useTranslation('banner')
  
  // 闪电控制逻辑 - 仅在暗色主题显示，随机生成闪电效果
  useEffect(() => {
    if (isLight) {
      setLightningState('none')
      return
    }
    
    const loop = () => {
      const isBig = Math.random() > 0.7 
      setLightningState(isBig ? 'big' : 'normal')
      
      setTimeout(() => {
        setLightningState('none')
      }, isBig ? 200 : 100)
      
      const nextDelay = Math.random() * 3000 + 500
      setTimeout(loop, nextDelay)
    }
    
    const timer = setTimeout(loop, 2000)
    return () => clearTimeout(timer)
  }, [isLight])

  return (
    <div className={cn(
      "relative w-full h-screen overflow-hidden transition-colors duration-75 z-0",
      isLight 
        ? "bg-gradient-to-b from-white via-gray-100 to-gray-200" 
        : lightningState === 'big' 
          ? "bg-[#cfcfcf]" 
          : (lightningState === 'normal' ? "bg-[#2a2a2a]" : "bg-[#0f0f0f]"),
      lightningState === 'big' && !isLight && "animate-shake"
    )}>
      {/* SVG 滤镜定义 */}
      <TextureFilters />
      
      {/* 纸张纹理叠加层 */}
      <div className="absolute inset-0 z-40 pointer-events-none opacity-40 mix-blend-overlay"
           style={{ filter: isLight ? 'none' : 'url(#paper-texture)' }} />

      {/* 主内容区域 - 响应式布局 */}
      <div className={cn(
        "absolute top-24 sm:top-28 md:top-32 lg:top-20 xl:top-20 left-5 sm:left-8 md:left-12 lg:left-20 xl:left-20 z-40 pointer-events-none px-4",
        isLight ? "text-slate-800" : "mix-blend-difference text-[#e0e0e0]"
      )}>
        {/* 标题区域 */}
        <motion.div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <Anchor className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />
          <span className="text-xs sm:text-sm tracking-[0.2em] uppercase opacity-60">
            {isLight ? t('logTitle', '航海日志') : t('recordTitle', '航行记录')}
          </span>
        </motion.div>
        
        {/* 主标题动画 */}
        <motion.h1 
          className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black tracking-[0.05em] sm:tracking-[0.1em]"
          animate={{ opacity: [0.6, 0.8, 0.6] }}
          transition={{ duration: 3, repeat: Infinity }}
          style={{ 
            fontFamily: "'Georgia', 'Times New Roman', 'STSong', 'SimSun', serif",
            textShadow: isLight ? '2px 2px 4px rgba(0,0,0,0.1)' : '2px 2px 8px rgba(255,255,255,0.2)'
          }}
        >
          {isLight ? t('calmTitle', '风平浪静') : t('stormyTitle', '狂风暴雨')}
        </motion.h1>
        
        {/* 副标题 */}
        <motion.p 
          className="text-sm sm:text-base md:text-lg lg:text-xl mt-4 sm:mt-6 tracking-[0.1em] sm:tracking-[0.15em] opacity-70 max-w-[90%] sm:max-w-[80%]"
          style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
        >
          {isLight 
            ? t('calmSubtitle', '在这风平浪静的日子里，正是整理知识、规划学习的好时机') 
            : t('stormySubtitle', '外面风雨交加，不妨静下心来休息，为知识充电')}
        </motion.p>
        
        {/* 航海记录统计 */}
        <VoyageStats />
      </div>

      {/* 雨滴效果 - 仅暗色主题显示 */}
      {!isLight && <Rain />}

      {/* 闪电效果 - 仅暗色主题显示 */}
      <AnimatePresence>
        {lightningState !== 'none' && !isLight && (
          <Lightning isBig={lightningState === 'big'} />
        )}
      </AnimatePresence>

      {/* 乌云效果 - 仅暗色主题显示 */}
      {!isLight && (
        <div className="absolute top-0 w-full h-64 opacity-30 z-0">
          <svg viewBox="0 0 1000 200" className="w-full h-full" preserveAspectRatio="none">
             <path d="M0,50 Q200,100 400,50 T800,50 T1200,50 V200 H0 Z" fill="#333" filter="url(#rough-edges)" />
          </svg>
        </div>
      )}

      {/* 明亮主题：平静波浪 */}
      {isLight ? (
        <>
          <WaveLayer 
            type="ripple"
            delay={0} 
            duration={30} 
            yOffset="-5%" 
            color="text-gray-200" 
            zIndex={10} 
            amplitude={5}
            direction={1}
          />
          <WaveLayer 
            type="ripple"
            delay={1} 
            duration={25} 
            yOffset="-10%" 
            color="text-gray-300" 
            zIndex={20} 
            amplitude={10}
            direction={-1}
          />
          <WaveLayer 
            type="normal"
            delay={2} 
            duration={20} 
            yOffset="-15%" 
            color="text-gray-400" 
            zIndex={30} 
            amplitude={15}
            direction={1}
          />
          {/* 前浪 - 挡住小船 */}
          <WaveLayer 
            type="normal"
            delay={3} 
            duration={18} 
            yOffset="-25%" 
            color="text-gray-500" 
            zIndex={50} 
            amplitude={20}
            direction={-1}
          />
        </>
      ) : (
        /* 暗色主题：风暴波浪 */
        <>
          <WaveLayer 
            type="ripple"
            delay={0} 
            duration={20} 
            yOffset="-10%" 
            color="text-[#1a1a1a]" 
            zIndex={10} 
            amplitude={15}
            direction={1}
          />
          <WaveLayer 
            type="normal"
            delay={2} 
            duration={10} 
            yOffset="-20%" 
            color="text-[#0a0a0a]" 
            zIndex={20} 
            amplitude={30}
            direction={-1}
          />
          <WaveLayer 
            type="violent"
            delay={1} 
            duration={5} 
            yOffset="-30%" 
            color="text-[#050505]" 
            zIndex={40} 
            amplitude={60} 
            direction={1}
          />
          <WaveLayer 
            type="violent"
            delay={2} 
            duration={4} 
            yOffset="-40%" 
            color="text-[#000]" 
            zIndex={45} 
            amplitude={80} 
            direction={-1}
          />
        </>
      )}

      {/* 小船 - 不同主题调整颜色 */}
      <Boat />

      {/* 自定义动画样式 */}
      <style>{`
        @keyframes shake {
          0% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(-5px, 5px) rotate(-1deg); }
          50% { transform: translate(5px, -5px) rotate(1deg); }
          75% { transform: translate(-5px, -5px) rotate(-1deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }
        .animate-shake {
          animation: shake 0.2s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </div>
  )
}