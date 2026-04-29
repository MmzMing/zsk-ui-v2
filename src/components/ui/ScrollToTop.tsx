/**
 * ScrollToTop 返回顶部按钮组件
 * 页面滚动超过阈值后显示，点击平滑滚动回顶部
 */

import { useCallback } from 'react'
import { Button } from '@heroui/react'
import { ArrowUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'

import { useScrollPosition } from '@/hooks/useScrollPosition'
import { getLenisInstance } from '@/hooks/useLenis'

interface ScrollToTopProps {
  /** 显示按钮的滚动阈值（像素），默认 300 */
  threshold?: number
  /** 按钮位置 className，默认右下角 */
  className?: string
}

export function ScrollToTop({ threshold = 300, className }: ScrollToTopProps) {
  const { t } = useTranslation('common')
  const { scrollY } = useScrollPosition({ threshold })
  const isVisible = scrollY > threshold

  const handleScrollToTop = useCallback(() => {
    const lenis = getLenisInstance()
    if (lenis) {
      lenis.scrollTo(0, { duration: 0.8 })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className={`fixed bottom-8 right-8 z-50 ${className ?? ''}`}
        >
          <Button
            isIconOnly
            variant="bordered"
            size="lg"
            radius="full"
            aria-label={t('scrollToTop')}
            onPress={handleScrollToTop}
            className="bg-white/90 dark:bg-black/90 border-black/20 dark:border-white/20 text-black dark:text-white shadow-lg backdrop-blur-md transition-all hover:shadow-xl hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black"
          >
            <ArrowUp className="size-5" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ScrollToTop
