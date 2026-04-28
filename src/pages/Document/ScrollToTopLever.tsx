/**
 * 回顶拉动条
 * 向下拖拽释放后弹簧回弹，同时页面滚动到顶部
 */

import { useMotionValue, useSpring, motion } from 'motion/react'
import { useEffect, useState, useCallback } from 'react'
import { ChevronUp } from 'lucide-react'

export default function ScrollToTopLever() {
  const [visible, setVisible] = useState(false)
  const y = useMotionValue(0)
  const springY = useSpring(y, { stiffness: 300, damping: 20 })

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleDragEnd = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    y.set(0)
  }, [y])

  return (
    <motion.div
      className="flex flex-col items-center cursor-pointer select-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* 滑块轨道 */}
      <div className="relative w-8 h-20 flex flex-col items-center">
        {/* 轨道背景 */}
        <div className="absolute inset-0 w-1 bg-default-200 rounded-full left-1/2 -translate-x-1/2" />

        {/* 可拖拽滑块 */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-primary shadow-md flex items-center justify-center z-10"
          style={{ y: springY, top: 0 }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 56 }}
          dragElastic={0.1}
          onDragEnd={handleDragEnd}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronUp size={14} className="text-white" />
        </motion.div>
      </div>
      <span className="text-xs text-default-400 mt-1">回顶</span>
    </motion.div>
  )
}
