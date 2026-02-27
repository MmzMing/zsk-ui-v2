/**
 * GlobalModal - 全局对话框组件
 * 基于 HeroUI Modal 封装，支持命令式调用 (modal.confirm)
 */
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button
} from "@heroui/react"
import { useModalStore } from "@/stores/modal"

export function GlobalModal() {
  const { isOpen, config, closeModal, confirmLoading, setConfirmLoading } = useModalStore()

  if (!config) return null

  const handleConfirm = async () => {
    if (config.onConfirm) {
      setConfirmLoading(true)
      try {
        await config.onConfirm()
        closeModal()
      } catch (error) {
        console.error("Modal confirm error:", error)
      } finally {
        setConfirmLoading(false)
      }
    } else {
      closeModal()
    }
  }

  const handleCancel = () => {
    config.onCancel?.()
    closeModal()
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onOpenChange={closeModal}
      size={config.size || "md"}
      isDismissable={config.isDismissable !== false}
      backdrop="blur"
    >
      <ModalContent>
        {() => (
          <>
            {config.title && (
              <ModalHeader className="flex flex-col gap-1">{config.title}</ModalHeader>
            )}
            <ModalBody>
              {config.content}
            </ModalBody>
            {config.showFooter !== false && (
              <ModalFooter>
                <Button color="default" variant="light" onPress={handleCancel}>
                  {config.cancelText || "取消"}
                </Button>
                <Button 
                  color="primary" 
                  onPress={handleConfirm} 
                  isLoading={confirmLoading}
                >
                  {config.confirmText || "确定"}
                </Button>
              </ModalFooter>
            )}
          </>
        )}
      </ModalContent>
    </Modal>
  )
}
