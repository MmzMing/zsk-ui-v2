"use client"

// ===== 依赖导入区域 =====
import { forwardRef } from "react"
import { motion, type MotionProps, type Variants } from "framer-motion"

// ===== 类型定义区域 =====

/**
 * SlideFade 组件属性
 * 支持滑动淡入淡出动画效果
 */
interface SlideFadeProps extends MotionProps {
  /** 子元素 */
  children: React.ReactNode
  /** 自定义样式类名 */
  className?: string
  /** X轴偏移量，默认 20px */
  offsetX?: number
  /** Y轴偏移量，默认 0px */
  offsetY?: number
  /** 动画持续时间，默认 0.3s */
  duration?: number
}

// ===== 组件定义区域 =====

/**
 * 滑动淡入淡出动画组件
 * 
 * 元素从指定偏移位置滑入并淡入显示，退出时反向滑出并淡出
 * 使用 spring 弹簧动画实现入场效果，easeInOut 实现退场效果
 *
 * @example
 * <SlideFade offsetX={20} duration={0.3}>
 *   <div>内容</div>
 * </SlideFade>
 */
export const SlideFade = forwardRef<HTMLDivElement, SlideFadeProps>(
  ({ children, className, offsetX = 20, offsetY = 0, duration = 0.3, variants, ...props }, ref) => {
    // 默认动画变体配置
    const defaultVariants: Variants = {
      // 初始状态：透明 + 偏移
      initial: {
        opacity: 0,
        x: offsetX,
        y: offsetY,
      },
      // 动画状态：不透明 + 归位
      animate: {
        opacity: 1,
        x: 0,
        y: 0,
        transition: {
          type: "spring",
          stiffness: 260,
          damping: 20,
          duration,
        },
      },
      // 退出状态：透明 + 反向偏移
      exit: {
        opacity: 0,
        x: -offsetX,
        y: -offsetY,
        transition: {
           duration: 0.2,
           ease: "easeInOut"
        }
      },
    }

    return (
      <motion.div
        ref={ref}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants || defaultVariants}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)
SlideFade.displayName = "SlideFade"
