/**
 * Aceternity UI - Animated Tabs
 * 来源：https://ui.aceternity.com/components/tabs（registry @aceternity/tabs-demo）
 * 调整：
 * 1. 路径别名 @/lib/utils → @/utils（项目约定）
 * 2. 增加受控模式（activeValue + onValueChange），用于驱动外部 TabPanel
 * 3. 当未提供 content 时不渲染下方 FadeInDiv 堆叠层
 * 4. 修复：简化状态管理，避免不必要的重新排序导致 layoutId 动画冲突
 */

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/utils'

type Tab = {
  title: string
  value: string
  content?: string | React.ReactNode
}

interface TabsProps {
  tabs: Tab[]
  containerClassName?: string
  activeTabClassName?: string
  tabClassName?: string
  contentClassName?: string
  /** 受控当前激活值 */
  activeValue?: string
  /** 受控切换回调 */
  onValueChange?: (value: string) => void
  /** layoutId 命名空间，避免多个实例胶囊共享导致跳动 */
  layoutIdNamespace?: string
}

export const Tabs = ({
  tabs: propTabs,
  containerClassName,
  activeTabClassName,
  tabClassName,
  contentClassName,
  activeValue,
  onValueChange,
  layoutIdNamespace = 'clickedbutton',
}: TabsProps) => {
  // 直接使用 useMemo 计算当前激活项，避免 useEffect 导致的额外渲染
  const active = useMemo(() => {
    if (activeValue === undefined) return propTabs[0]
    return propTabs.find((t) => t.value === activeValue) ?? propTabs[0]
  }, [activeValue, propTabs])

  const handleClick = (tab: Tab) => {
    onValueChange?.(tab.value)
  }

  const [hovering, setHovering] = useState(false)

  // 是否有内容堆叠层
  const hasContent = propTabs.some((t) => t.content !== undefined)

  return (
    <>
      <div
        className={cn(
          'flex flex-row items-center justify-start [perspective:1000px] relative overflow-auto sm:overflow-visible no-visible-scrollbar max-w-full w-full',
          containerClassName
        )}
      >
        {propTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleClick(tab)}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            className={cn('relative px-4 py-2 rounded-full', tabClassName)}
            style={{
              transformStyle: 'preserve-3d',
            }}
          >
            {active.value === tab.value && (
              <motion.div
                layoutId={layoutIdNamespace}
                transition={{ type: 'spring', bounce: 0.3, duration: 0.6 }}
                className={cn(
                  'absolute inset-0 bg-gray-200 dark:bg-zinc-800 rounded-full',
                  activeTabClassName
                )}
              />
            )}

            <span className={cn(
              'relative block',
              active.value === tab.value && activeTabClassName
            )}>{tab.title}</span>
          </button>
        ))}
      </div>

      {hasContent && (
        <FadeInDiv
          tabs={propTabs}
          active={active}
          key={active.value}
          hovering={hovering}
          className={cn('mt-32', contentClassName)}
        />
      )}
    </>
  )
}

export const FadeInDiv = ({
  className,
  tabs,
  active,
  hovering,
}: {
  className?: string
  key?: string
  tabs: Tab[]
  active: Tab
  hovering?: boolean
}) => {
  const isActive = (tab: Tab) => {
    return tab.value === active.value
  }

  // 将激活项排在最前面
  const sortedTabs = useMemo(() => {
    const idx = tabs.findIndex((t) => t.value === active.value)
    if (idx <= 0) return tabs
    const newTabs = [...tabs]
    const selected = newTabs.splice(idx, 1)
    newTabs.unshift(selected[0])
    return newTabs
  }, [tabs, active])

  return (
    <div className="relative w-full h-full">
      {sortedTabs.map((tab, idx) => (
        <motion.div
          key={tab.value}
          layoutId={tab.value}
          style={{
            scale: 1 - idx * 0.1,
            top: hovering ? idx * -50 : 0,
            zIndex: -idx,
            opacity: idx < 3 ? 1 - idx * 0.1 : 0,
          }}
          animate={{
            y: isActive(tab) ? [0, 40, 0] : 0,
          }}
          className={cn('w-full h-full absolute top-0 left-0', className)}
        >
          {tab.content}
        </motion.div>
      ))}
    </div>
  )
}
