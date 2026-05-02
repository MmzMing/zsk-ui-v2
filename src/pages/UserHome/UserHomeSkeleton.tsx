/**
 * 用户主页骨架屏
 * 模拟用户信息区、统计条、筛选栏、作品网格的加载态
 * 黑白风格
 */

// ===== 1. 导出区域 =====
/**
 * 用户主页骨架屏组件
 */
export default function UserHomeSkeleton() {
  return (
    <div className="animate-pulse">
      {/* 用户信息区骨架 */}
      <div className="flex items-center gap-4 py-6 border-b border-default-800">
        <div className="w-16 h-16 rounded-full bg-default-100 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-6 w-32 rounded-full bg-default-100" />
          <div className="h-4 w-20 rounded-full bg-default-100" />
        </div>
        <div className="h-8 w-20 rounded-full bg-default-100" />
      </div>

      {/* 统计条骨架 */}
      <div className="py-5 border-b border-default-800">
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i.toString()} className="flex flex-col items-center gap-1">
              <div className="w-4 h-4 rounded-full bg-default-100" />
              <div className="h-5 w-10 rounded-full bg-default-100" />
              <div className="h-3 w-8 rounded-full bg-default-100" />
            </div>
          ))}
        </div>
      </div>

      {/* 筛选栏骨架 */}
      <div className="flex items-center gap-4 py-4">
        <div className="h-10 w-48 rounded-lg bg-default-100" />
        <div className="h-6 w-16 rounded-full bg-default-100" />
      </div>

      {/* 作品网格骨架 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i.toString()}>
            <div className="aspect-[4/3] rounded-2xl bg-default-100" />
            <div className="px-1 py-3 space-y-2">
              <div className="h-4 w-3/4 rounded-full bg-default-100" />
              <div className="flex gap-3">
                <div className="h-3 w-12 rounded-full bg-default-100" />
                <div className="h-3 w-12 rounded-full bg-default-100" />
                <div className="h-3 w-12 rounded-full bg-default-100" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
