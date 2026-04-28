/**
 * 视频详情骨架屏
 * 模拟视频播放器、标题、作者信息、交互按钮的加载态
 */

export default function VideoDetailSkeleton() {
  return (
    <div className="animate-pulse">
      {/* 面包屑骨架 */}
      <div className="flex items-center gap-3 h-14 border-b border-default-200">
        <div className="h-4 w-20 rounded-full bg-default-100" />
        <div className="h-4 w-8 rounded-full bg-default-100" />
        <div className="h-4 w-12 rounded-full bg-default-100" />
      </div>

      {/* 视频播放器骨架 */}
      <div className="aspect-video w-full rounded-xl bg-default-100 mt-4" />

      {/* 标题骨架 */}
      <div className="mt-4 space-y-2">
        <div className="h-6 w-3/4 rounded-full bg-default-100" />
        <div className="h-4 w-1/2 rounded-full bg-default-100" />
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
          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-full bg-default-100 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 rounded-full bg-default-100" />
              <div className="h-4 w-3/4 rounded-full bg-default-100" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
