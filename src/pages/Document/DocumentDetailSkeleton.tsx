/**
 * 文档详情骨架屏
 * 模拟导航栏、元信息、交互栏、正文、评论区的加载态
 */

// ===== 1. 导出区域 =====
/**
 * 文档详情骨架屏组件
 */
export default function DocumentDetailSkeleton() {
  return (
    <div className="animate-pulse">
      {/* 导航栏骨架 */}
      <div className="flex items-center gap-3 h-14 border-b border-default-200">
        <div className="h-4 w-20 rounded-full bg-default-100" />
        <div className="h-4 w-8 rounded-full bg-default-100" />
        <div className="h-4 w-12 rounded-full bg-default-100" />
      </div>

      {/* 元信息骨架 */}
      <div className="py-6 border-b border-default-200 space-y-3">
        <div className="h-7 w-3/4 rounded-full bg-default-100" />
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded-full bg-default-100" />
          <div className="h-4 w-20 rounded-full bg-default-100" />
          <div className="h-4 w-24 rounded-full bg-default-100" />
        </div>
        <div className="flex gap-2">
          <div className="h-6 w-14 rounded-full bg-default-100" />
          <div className="h-6 w-14 rounded-full bg-default-100" />
          <div className="h-6 w-14 rounded-full bg-default-100" />
        </div>
        <div className="h-4 w-full rounded-full bg-default-100" />
        <div className="h-4 w-2/3 rounded-full bg-default-100" />
      </div>

      {/* 交互栏骨架 */}
      <div className="flex items-center gap-6 py-4 border-b border-default-200">
        <div className="h-8 w-16 rounded-full bg-default-100" />
        <div className="h-8 w-16 rounded-full bg-default-100" />
        <div className="h-8 w-16 rounded-full bg-default-100" />
        <div className="h-8 w-16 rounded-full bg-default-100" />
        <div className="w-px h-5 bg-default-200" />
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded-full bg-default-100" />
          <div className="h-4 w-16 rounded-full bg-default-100" />
          <div className="h-4 w-12 rounded-full bg-default-100" />
          <div className="h-8 w-16 rounded-full bg-default-100" />
        </div>
      </div>

      {/* 正文骨架 */}
      <div className="py-8 space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i.toString()}
            className="h-4 rounded-full bg-default-100"
            style={{ width: `${60 + Math.random() * 40}%` }}
          />
        ))}
      </div>

      {/* 评论区骨架 */}
      <div className="py-6 border-t border-default-200 space-y-4">
        <div className="h-6 w-24 rounded-full bg-default-100" />
        <div className="h-20 w-full rounded-lg bg-default-100" />
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-full bg-default-100 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-20 rounded-full bg-default-100" />
              <div className="h-4 w-full rounded-full bg-default-100" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
