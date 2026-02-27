/**
 * AnimatedThemeToggle - 动画主题切换组件
 * 来源: Magic UI (https://magicui.design/docs/components/animated-theme-toggler)
 * 使用 View Transition API 实现圆形扩散动画效果
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/utils'

interface AnimatedThemeToggleProps extends React.ComponentPropsWithoutRef<'button'> {
  /** 动画持续时间（毫秒） */
  duration?: number
}

export function AnimatedThemeToggle({
  className,
  duration = 400,
  ...props
}: AnimatedThemeToggleProps) {
  const { actualTheme, setThemeMode } = useTheme()
  const [isDark, setIsDark] = useState(actualTheme === 'dark')
  const buttonRef = useRef<HTMLButtonElement>(null)

  // 同步主题状态
  useEffect(() => {
    const updateTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'))
    }

    updateTheme()

    // 监听 DOM 变化
    const observer = new MutationObserver(updateTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })

    return () => observer.disconnect()
  }, [])

  // 切换主题
  const toggleTheme = useCallback(async () => {
    if (!buttonRef.current) return

    const x = buttonRef.current.offsetLeft + buttonRef.current.offsetWidth / 2
    const y = buttonRef.current.offsetTop + buttonRef.current.offsetTop / 2

    // 计算最大半径（覆盖整个视口）
    const maxRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    )

    // 检查浏览器是否支持 View Transition API
    if (!document.startViewTransition) {
      // 不支持则直接切换
      const newTheme = isDark ? 'light' : 'dark'
      setThemeMode(newTheme)
      setIsDark(newTheme === 'dark')
      return
    }

    // 使用 View Transition API
    const transition = document.startViewTransition(() => {
      flushSync(() => {
        const newTheme = isDark ? 'light' : 'dark'
        setThemeMode(newTheme)
        setIsDark(newTheme === 'dark')
      })
    })

    await transition.ready

    // 执行圆形扩散动画
    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${maxRadius}px at ${x}px ${y}px)`
        ]
      },
      {
        duration,
        easing: 'ease-out',
        pseudoElement: '::view-transition-new(root)'
      }
    )
  }, [isDark, duration, setThemeMode])

  return (
    <button
      ref={buttonRef}
      onClick={toggleTheme}
      className={cn(
        'relative flex items-center justify-center',
        'w-9 h-9 rounded-full',
        'bg-default-100 hover:bg-default-200',
        'text-default-600 hover:text-default-900',
        'transition-colors duration-200',
        'focus:outline-none focus:ring-2 focus:ring-default-500/50',
        className
      )}
      aria-label={isDark ? '切换到亮色主题' : '切换到暗色主题'}
      {...props}
    >
      <Sun
        className={cn(
          'absolute w-5 h-5 transition-all duration-300',
          isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
        )}
      />
      <Moon
        className={cn(
          'absolute w-5 h-5 transition-all duration-300',
          isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
        )}
      />
      <span className="sr-only">切换主题</span>
    </button>
  )
}

export default AnimatedThemeToggle
