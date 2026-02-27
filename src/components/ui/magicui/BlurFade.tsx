"use client"

// ===== 依赖导入区域 =====
import { forwardRef } from "react"
import { motion, type Variants, type MotionProps } from "framer-motion"

// ===== 类型定义区域 =====

/**
 * BlurFade 组件属性
 * 支持模糊淡入淡出动画效果
 */
interface BlurFadeProps extends MotionProps {
  /** 子元素 */
  children: React.ReactNode
  /** 自定义样式类名 */
  className?: string
  /** 动画持续时间，默认 0.4s */
  duration?: number
  /** 动画延迟时间，默认 0s */
  delay?: number
  /** 偏移距离，默认 6px */
  offset?: number
  /** 动画方向，默认 'down' */
  direction?: "up" | "down" | "left" | "right"
  /** 模糊程度，默认 '6px' */
  blur?: string
}

// ===== 组件定义区域 =====

/**
 * 模糊淡入淡出动画组件
 * 
 * 元素从指定方向滑入并伴随模糊效果淡入显示
 * 退出时反向滑出并恢复模糊效果
 *
 * @example
 * <BlurFade direction="up" blur="6px" delay={0.1}>
 *   <div>内容</div>
 * </BlurFade>
 */
export const BlurFade = forwardRef<HTMLDivElement, BlurFadeProps>(
  (
    {
      children,
      className,
      duration = 0.4,
      delay = 0,
      offset = 6,
      direction = "down",
      blur = "6px",
      variants,
      ...props
    },
    ref
  ) => {
    // 根据方向确定动画轴向
    const axis = direction === "left" || direction === "right" ? "x" : "y"
    // 根据方向确定偏移正负
    const offsetValue = direction === "right" || direction === "down" ? -offset : offset

    // 默认动画变体配置
    const defaultVariants: Variants = {
      // 初始状态：偏移 + 透明 + 模糊
      initial: {
        [axis]: offsetValue,
        opacity: 0,
        filter: `blur(${blur})`,
      },
      // 动画状态：归位 + 不透明 + 清晰
      animate: {
        [axis]: 0,
        opacity: 1,
        filter: `blur(0px)`,
      },
      // 退出状态：偏移 + 透明 + 模糊
      exit: {
        [axis]: offsetValue,
        opacity: 0,
        filter: `blur(${blur})`,
      }
    }
    const combinedVariants = variants || defaultVariants

    return (
      <motion.div
        ref={ref}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={combinedVariants}
        transition={{
          delay: 0.04 + delay,
          duration,
          ease: "easeOut",
        }}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)
BlurFade.displayName = "BlurFade"
