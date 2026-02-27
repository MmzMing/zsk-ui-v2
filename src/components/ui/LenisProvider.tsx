import { ReactLenis } from 'lenis/react'
import type { LenisOptions } from 'lenis'

interface LenisProviderProps {
  children: React.ReactNode
  options?: LenisOptions
}

/**
 * Lenis 平滑滚动提供者
 * 用于全局启用 Lenis 平滑滚动效果
 */
export default function LenisProvider({ children, options }: LenisProviderProps) {
  return (
    <ReactLenis root options={{ 
      duration: 1.2, 
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
      orientation: "vertical", 
      gestureOrientation: "vertical", 
      smoothWheel: true, 
      wheelMultiplier: 1, 
      touchMultiplier: 2, 
      infinite: false, 
      ...options 
    }}>
      {children}
    </ReactLenis>
  )
}
