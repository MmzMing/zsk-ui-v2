/**
 * GlobalLoading - 全局加载遮罩组件
 * 使用 GitHub Octocat（章鱼猫）作为加载动画，结合 useUIStore 控制显示/隐藏
 */
import { useUIStore } from '@/stores/ui'

/**
 * 章鱼猫 SVG 组件
 * 路径源自 GitHub 公开 Octocat 矢量轮廓，做了简化以适应单色场景
 */
function OctocatIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 0C3.58 0 0 3.58 0 8a8.013 8.013 0 0 0 5.47 7.59c.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"
      />
    </svg>
  )
}

export function GlobalLoading() {
  const { isLoading, loadingText } = useUIStore()

  if (!isLoading) return null

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-black/50 backdrop-blur-sm"
      role="status"
      aria-live="polite"
    >
      {/* 章鱼猫主体：脉冲缩放 + 浮动 */}
      <div className="relative w-24 h-24">
        {/* 外圈光晕 */}
        <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
        <span className="absolute inset-2 rounded-full bg-primary/10" />
        {/* Octocat */}
        <OctocatIcon className="relative w-24 h-24 text-white drop-shadow-lg octocat-bob" />
      </div>

      <p className="text-white font-medium tracking-wide select-none">
        {loadingText || '加载中...'}
      </p>

      {/* 局部样式：浮动动画 */}
      <style>{`
        @keyframes octocatBob {
          0%, 100% { transform: translateY(0) rotate(-4deg); }
          50%      { transform: translateY(-6px) rotate(4deg); }
        }
        .octocat-bob {
          animation: octocatBob 1.6s ease-in-out infinite;
          transform-origin: center;
        }
      `}</style>
    </div>
  )
}
