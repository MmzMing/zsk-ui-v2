/**
 * Tracing Beam 装饰光束
 * 左侧滚动驱动的光束动画效果
 * 直线为主，顶部有类似 Git 分支图转弯折线
 */

import { useRef } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'motion/react'

export default function TracingBeam() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })

  const pathLength = useSpring(useTransform(scrollYProgress, [0, 1], [0, 1]), {
    stiffness: 200,
    damping: 30,
  })

  return (
    <div ref={ref} className="hidden md:flex w-16 shrink-0 relative justify-center">
      <div className="sticky top-20 h-[calc(100vh-120px)]">
        <svg
          className="w-16 h-full"
          viewBox="0 0 64 800"
          fill="none"
          preserveAspectRatio="none"
        >
          {/* 背景路径：顶部折线 + 垂直直线 */}
          <path
            d="M 32 0 L 32 40 L 48 40 L 48 80 L 32 80 L 32 800"
            stroke="hsl(var(--heroui-default-200))"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* 光束路径 */}
          <motion.path
            d="M 32 0 L 32 40 L 48 40 L 48 80 L 32 80 L 32 800"
            stroke="hsl(var(--heroui-primary))"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            style={{ pathLength }}
          />
          {/* 光束头部圆点 */}
          <motion.circle
            cx="32"
            cy="0"
            r="4"
            fill="hsl(var(--heroui-primary))"
            style={{
              cy: useTransform(scrollYProgress, [0, 1], [0, 800]),
            }}
          />
        </svg>
      </div>
    </div>
  )
}
