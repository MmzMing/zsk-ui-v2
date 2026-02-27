/**
 * GlobalLoading - 全局加载遮罩组件
 * 结合 useUIStore 控制显示/隐藏，支持自定义文字
 */
import { Spinner } from "@heroui/react"
import { useUIStore } from "@/stores/ui"

export function GlobalLoading() {
  const { isLoading, loadingText } = useUIStore()

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Spinner 
        classNames={{
          label: "text-white mt-4 font-medium"
        }} 
        label={loadingText || "加载中..."} 
        variant="wave" 
        color="primary" 
        size="lg"
      />
    </div>
  )
}
