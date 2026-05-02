/**
 * Lenis 平滑滚动 Hook
 * 用于初始化和管理 Lenis 平滑滚动实例
 */

// ===== 1. 依赖导入区域 =====
// React 核心
import { useEffect } from 'react'

// 第三方库
import Lenis from 'lenis'

// ===== 2. 类型定义区域 =====
/** Lenis 配置选项类型 */
type LenisOptions = Partial<{
  /** 动画持续时间 */
  duration: number
  /** 缓动函数 */
  easing: (t: number) => number
  /** 是否启用平滑滚轮 */
  smoothWheel: boolean
  /** 滚轮 multiplier */
  wheelMultiplier: number
  /** 触摸 multiplier */
  touchMultiplier: number
}>

// ===== 3. 状态控制逻辑区域 =====
/** 模块级 Lenis 实例引用，供其他组件访问 */
let lenisInstance: Lenis | null = null

// ===== 4. 通用工具函数区域 =====
/**
 * 获取当前 Lenis 实例
 * 用于在其他组件中调用 lenis.scrollTo 等方法
 */
export function getLenisInstance(): Lenis | null {
  return lenisInstance
}

// ===== 8. UI渲染逻辑区域 =====
/**
 * Lenis 平滑滚动 Hook
 *
 * @param options - Lenis 配置选项
 * @example
 * // 默认配置
 * useLenis()
 *
 * // 自定义配置
 * useLenis({
 *   duration: 1.5,
 *   smoothWheel: true
 * })
 */
export function useLenis(options?: LenisOptions) {
  useEffect(() => {
    // 初始化 Lenis 实例
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      prevent: (node: HTMLElement) => {
        return !!node.closest?.('[role="dialog"]') || !!node.closest?.('[data-lenis-prevent]')
      },
      ...options
    })

    lenisInstance = lenis

    // 动画循环
    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    // 清理函数
    return () => {
      lenis.destroy()
      lenisInstance = null
    }
  }, [options])
}

export default useLenis
