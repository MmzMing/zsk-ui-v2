/**
 * Watermark - 全局水印组件
 * 支持自定义文字、防篡改机制，可根据应用设置动态开启
 */
import { useEffect, useRef, useState } from 'react'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { useLocation } from 'react-router-dom'

interface WatermarkProps {
  /** 自定义文字，默认使用用户名+日期 */
  content?: string
  /** 字体大小 */
  fontSize?: number
  /** 旋转角度 */
  rotate?: number
  /** 透明度 */
  opacity?: number
  /** 间距 */
  gap?: [number, number]
}

/**
 * 全局水印组件
 * 支持防篡改（MutationObserver）
 */
export function Watermark({
  content,
  fontSize = 16,
  rotate = -20,
  opacity = 0.1,
  gap = [100, 100]
}: WatermarkProps) {
  const watermarkRef = useRef<HTMLDivElement>(null)
  const location = useLocation()
  
  // 获取应用配置
  const showWatermark = useAppStore(state => {
    // 如果在后台路由，使用后台配置
    if (location.pathname.startsWith('/admin')) {
      return state.adminSettings.showWatermark
    }
    return state.showWatermark
  })
  
  const { userInfo } = useUserStore()
  const [base64, setBase64] = useState('')

  // 生成水印图片
  useEffect(() => {
    if (!showWatermark) return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const text = content || `${userInfo?.name || 'ZSK'} ${new Date().toLocaleDateString()}`
    const [gapX, gapY] = gap
    
    // 计算画布大小
    const angle = (rotate * Math.PI) / 180
    const textWidth = ctx.measureText(text).width + 20
    const canvasWidth = textWidth + gapX
    const canvasHeight = gapY + 50

    canvas.width = canvasWidth
    canvas.height = canvasHeight

    ctx.rotate(angle)
    ctx.font = `${fontSize}px sans-serif`
    ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, 0, canvasHeight / 2)

    setBase64(canvas.toDataURL())
  }, [showWatermark, content, userInfo, fontSize, rotate, opacity, gap])

  // 防篡改逻辑
  useEffect(() => {
    if (!showWatermark || !watermarkRef.current || !base64) return

    const target = watermarkRef.current
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        // 如果属性被修改或节点被删除
        if (mutation.type === 'attributes' || mutation.type === 'childList') {
          // 强制恢复样式
          target.setAttribute(
            'style',
            `
            position: fixed;
            inset: 0;
            z-index: 9999;
            pointer-events: none;
            background-repeat: repeat;
            background-image: url(${base64});
            `
          )
        }
      })
    })

    observer.observe(target.parentElement || document.body, {
      attributes: true,
      childList: true,
      subtree: true,
      attributeFilter: ['style', 'class']
    })

    return () => observer.disconnect()
  }, [showWatermark, base64])

  if (!showWatermark) return null

  return (
    <div
      ref={watermarkRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        pointerEvents: 'none',
        backgroundRepeat: 'repeat',
        backgroundImage: `url(${base64})`
      }}
    />
  )
}
