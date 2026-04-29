/**
 * Tracing Beam 装饰光束
 * 已替换为 ScrollProgress 顶部滚动进度条
 */

// ===== 1. 依赖导入区域 =====
// 组件
import { ScrollProgress } from '@/components/ui/ScrollProgress'

// ===== 2. 导出区域 =====
/**
 * Tracing Beam 装饰光束组件
 * 现在渲染为顶部滚动进度条
 */
export default function TracingBeam() {
  return <ScrollProgress />
}
