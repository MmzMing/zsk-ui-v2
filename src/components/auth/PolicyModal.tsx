import { useState, useImperativeHandle, forwardRef } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button
} from '@heroui/react'
import { useTranslation } from 'react-i18next'

export interface PolicyModalRef {
  open: (type: 'terms' | 'privacy') => void
  close: () => void
}

/**
 * 隐私政策和服务条款弹窗
 */
export const PolicyModal = forwardRef<PolicyModalRef>((_, ref) => {
  const { t } = useTranslation('auth')
  const [isOpen, setIsOpen] = useState(false)
  const [type, setType] = useState<'terms' | 'privacy'>('terms')

  useImperativeHandle(ref, () => ({
    open: (t) => {
      setType(t)
      setIsOpen(true)
    },
    close: () => setIsOpen(false)
  }))

  const title = type === 'terms' ? t('policy.termsTitle') : t('policy.privacyTitle')

  const content = type === 'terms' ? (
    <div className="space-y-4">
      <p>欢迎使用知识库小破站（以下简称&quot;本站&quot;）。请您在注册和使用本站服务前仔细阅读本协议。</p>
      <h3 className="font-bold">1. 服务内容</h3>
      <p>本站为用户提供知识库管理、文档分享、在线编辑等服务。用户可以上传、编辑、分享文档，也可以浏览其他用户公开的文档。</p>
      <h3 className="font-bold">2. 用户账号</h3>
      <p>用户注册时应提供真实、准确的信息。用户应妥善保管账号密码，因用户保管不善导致的损失由用户自行承担。</p>
      <h3 className="font-bold">3. 用户行为规范</h3>
      <p>用户在使用本站服务时，不得发布违法、违规、侵犯他人权益的内容。本站有权对违规内容进行处理。</p>
    </div>
  ) : (
    <div className="space-y-4">
      <p>知识库小破站非常重视您的隐私保护。本隐私政策旨在向您说明我们如何收集、使用 and 保护您的个人信息。</p>
      <h3 className="font-bold">1. 信息收集</h3>
      <p>我们收集的信息包括：注册信息（用户名、邮箱）、使用记录（文档操作、访问记录）、设备信息（IP地址、浏览器类型）。</p>
      <h3 className="font-bold">2. 信息使用</h3>
      <p>我们使用您的信息用于：提供服务、改进产品、安全防护、通知推送。</p>
      <h3 className="font-bold">3. 信息保护</h3>
      <p>我们采取严格的安全措施保护您的信息，防止未经授权的访问、使用或泄露。</p>
    </div>
  )

  return (
    <Modal 
      isOpen={isOpen} 
      onOpenChange={setIsOpen}
      size="2xl"
      scrollBehavior="inside"
      backdrop="blur"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">{title}</ModalHeader>
            <ModalBody>
              {content}
            </ModalBody>
            <ModalFooter>
              <Button color="primary" onPress={onClose}>
                {t('policy.read')}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
})

PolicyModal.displayName = 'PolicyModal'
