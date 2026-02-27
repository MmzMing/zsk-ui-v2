/**
 * 搜索弹窗组件
 * 包含 Aceternity UI 的 PlaceholdersAndVanishInput
 */

import { 
  Modal, 
  ModalContent, 
  ModalBody, 
  Kbd
} from '@heroui/react'
import { PlaceholdersAndVanishInput } from '@/components/ui/aceternity/PlaceholdersAndVanishInput'
import { HiOutlineSearch } from 'react-icons/hi'

interface SearchDialogProps {
  /** 是否打开 */
  isOpen: boolean
  /** 关闭回调 */
  onClose: () => void
}

export function SearchDialog({ isOpen, onClose }: SearchDialogProps) {
  // 搜索建议占位符
  const placeholders = [
    "搜索文章、分类或标签...",
    "如何使用 Aceternity UI?",
    "什么是知识库小破站?",
    "React 19 有哪些新特性?",
    "Vite 7 构建优化技巧"
  ]

  // 处理搜索提交
  const handleSearch = (_e: React.FormEvent<HTMLFormElement>) => {
    // 这里可以执行实际的搜索逻辑，比如跳转到搜索页面
    console.info('执行搜索...')
    // 延迟关闭，让用户看到消失动画
    setTimeout(() => {
      onClose()
    }, 1500)
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="2xl"
      backdrop="blur"
      placement="center"
      hideCloseButton
      classNames={{
        base: "bg-transparent shadow-none border-none",
        backdrop: "bg-black/40 backdrop-blur-md",
        wrapper: "z-[100]"
      }}
    >
      <ModalContent>
        <ModalBody className="p-0">
          <div className="flex flex-col gap-4">
            {/* 搜索输入区域 */}
            <div className="relative group">
              <PlaceholdersAndVanishInput
                placeholders={placeholders}
                onSubmit={handleSearch}
                className="max-w-none h-14 sm:h-16 text-base sm:text-lg"
              />
              
              {/* 装饰性图标 */}
              <div className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400 group-focus-within:text-default-900 transition-colors">
                <HiOutlineSearch size={20} />
              </div>
            </div>

            {/* 快捷键提示 */}
            <div className="flex justify-center items-center gap-4 text-neutral-400 text-sm py-2">
              <div className="flex items-center gap-1">
                <Kbd keys={["enter"]}>Enter</Kbd>
                <span>搜索</span>
              </div>
              <div className="flex items-center gap-1">
                <Kbd keys={["escape"]}>ESC</Kbd>
                <span>关闭</span>
              </div>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
