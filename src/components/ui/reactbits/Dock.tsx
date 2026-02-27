/**
 * Dock - macOS 风格 Dock 组件
 * 来源: React Bits (https://www.reactbits.dev/components/dock)
 * 带有悬停放大效果的 macOS 风格 Dock
 */

import {
  motion,
  MotionValue,
  useMotionValue,
  useSpring,
  useTransform,
  type SpringOptions,
  AnimatePresence
} from 'framer-motion'
import { Children, cloneElement, useEffect, useMemo, useRef, useState } from 'react'
import { useTheme } from '@/hooks/useTheme'

// Dock 项目数据类型
export type DockItemData = {
  icon: React.ReactNode
  label: React.ReactNode
  onClick: () => void
  className?: string
  /** 是否显示圆形背景 */
  noCircle?: boolean
  /** 是否在左侧显示分隔线 */
  showDivider?: boolean
}

// Dock 组件属性
export type DockProps = {
  /** Dock 项目列表 */
  items: DockItemData[]
  /** 自定义类名 */
  className?: string
  /** 放大感应距离 */
  distance?: number
  /** 面板高度 */
  panelHeight?: number
  /** 基础项目大小 */
  baseItemSize?: number
  /** Dock 高度 */
  dockHeight?: number
  /** 放大尺寸 */
  magnification?: number
  /** 弹簧动画配置 */
  spring?: SpringOptions
}

// DockItem 组件属性
type DockItemProps = {
  className?: string
  children: React.ReactNode
  onClick?: () => void
  mouseX: MotionValue<number>
  spring: SpringOptions
  distance: number
  baseItemSize: number
  magnification: number
}

// DockLabel 组件属性
type DockLabelProps = {
  className?: string
  children: React.ReactNode
  isHovered?: MotionValue<number>
}

// DockIcon 组件属性
type DockIconProps = {
  className?: string
  children: React.ReactNode
  isHovered?: MotionValue<number>
}

// DockItem 子组件
function DockItem({
  children,
  className = '',
  onClick,
  mouseX,
  spring,
  distance,
  magnification,
  baseItemSize,
  noCircle = false
}: DockItemProps & { noCircle?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const isHovered = useMotionValue(0)

  const mouseDistance = useTransform(mouseX, val => {
    const rect = ref.current?.getBoundingClientRect() ?? {
      x: 0,
      width: baseItemSize
    }
    return val - rect.x - baseItemSize / 2
  })

  const targetSize = useTransform(mouseDistance, [-distance, 0, distance], [baseItemSize, magnification, baseItemSize])
  const size = useSpring(targetSize, spring)
  const itemBg = 'bg-default-200/50 hover:bg-default-200'

  // 根据 noCircle 决定是否显示圆形背景
  const containerClass = noCircle
    ? `relative inline-flex items-center justify-center cursor-pointer ${className}`
    : `relative inline-flex items-center justify-center rounded-full transition-colors cursor-pointer ${itemBg} ${className}`

  return (
    <motion.div
      ref={ref}
      style={{
        width: size,
        height: size
      }}
      onHoverStart={() => isHovered.set(1)}
      onHoverEnd={() => isHovered.set(0)}
      onFocus={() => isHovered.set(1)}
      onBlur={() => isHovered.set(0)}
      onClick={onClick}
      className={containerClass}
      tabIndex={0}
      role="button"
      aria-haspopup="true"
    >
      {Children.map(children, child =>
        child && typeof child === 'object' && 'props' in child
          ? cloneElement(child as React.ReactElement<{ isHovered?: MotionValue<number> }>, { isHovered })
          : child
      )}
    </motion.div>
  )
}

// DockLabel 子组件
function DockLabel({ children, className = '', isHovered }: DockLabelProps) {
  const [isVisible, setIsVisible] = useState(false)
  const { actualTheme } = useTheme()
  const isDark = actualTheme === 'dark'
  const labelBg = isDark ? 'bg-[#060010]' : 'bg-white'
  const labelText = isDark ? 'text-white' : 'text-neutral-800'

  useEffect(() => {
    if (!isHovered) return
    const unsubscribe = isHovered.on('change', latest => {
      setIsVisible(latest === 1)
    })
    return () => unsubscribe()
  }, [isHovered])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: -10 }}
          exit={{ opacity: 0, y: 0 }}
          transition={{ duration: 0.2 }}
          className={`${className} absolute -top-6 left-1/2 w-fit whitespace-pre rounded-md px-2 py-0.5 text-xs ${labelBg} ${labelText} shadow-sm`}
          role="tooltip"
          style={{ x: '-50%' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// DockIcon 子组件
function DockIcon({ children, className = '' }: DockIconProps) {
  return <div className={`flex items-center justify-center ${className}`}>{children}</div>
}

// Dock 主组件
export default function Dock({
  items,
  className = '',
  spring = { mass: 0.1, stiffness: 150, damping: 12 },
  magnification = 70,
  distance = 200,
  panelHeight = 64,
  dockHeight = 256,
  baseItemSize = 50
}: DockProps) {
  const mouseX = useMotionValue(Infinity)
  const isHovered = useMotionValue(0)

  // 使用 HeroUI 的语义颜色，与主题抽屉保持一致
  const dockBg = 'bg-content1'

  const maxHeight = useMemo(() => Math.max(dockHeight, magnification + magnification / 2 + 4), [magnification, dockHeight])
  const heightRow = useTransform(isHovered, [0, 1], [panelHeight, maxHeight])
  const height = useSpring(heightRow, spring)

  return (
    <motion.div style={{ height, scrollbarWidth: 'none' }} className="mx-2 flex max-w-full items-center">
      <motion.div
        onMouseMove={({ pageX }) => {
          isHovered.set(1)
          mouseX.set(pageX)
        }}
        onMouseLeave={() => {
          isHovered.set(0)
          mouseX.set(Infinity)
        }}
        className={`${className} absolute bottom-2 left-1/2 transform -translate-x-1/2 flex items-center w-fit gap-4 rounded-full px-4 backdrop-blur-md ${dockBg}`}
        style={{ height: panelHeight }}
        role="toolbar"
        aria-label="应用 Dock"
      >
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-4">
            {item.showDivider && (
              <div className="w-px h-8 bg-divider/50 mx-1" />
            )}
            <DockItem
              onClick={item.onClick}
              className={item.className}
              mouseX={mouseX}
              spring={spring}
              distance={distance}
              magnification={magnification}
              baseItemSize={baseItemSize}
              noCircle={item.noCircle}
            >
              <DockIcon>{item.icon}</DockIcon>
              <DockLabel>{item.label}</DockLabel>
            </DockItem>
          </div>
        ))}
      </motion.div>
    </motion.div>
  )
}
