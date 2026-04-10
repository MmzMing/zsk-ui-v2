import { useState, useImperativeHandle, forwardRef, useRef } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@heroui/react'
import SliderCaptcha, { type ActionType } from 'rc-slider-captcha'
import { useTranslation } from 'react-i18next'
import { RefreshCcw } from 'lucide-react'
import { getCaptcha, checkCaptcha } from '@/api/auth'

interface CaptchaModalProps {
  /** 验证成功回调，返回后端校验通过的凭证 */
  onVerify: (verification: string) => Promise<void>
}

export interface CaptchaModalRef {
  open: () => void
  close: () => void
  refresh: () => void
}

/**
 * 滑块人机校验弹窗
 * 对接后端获取图片和校验逻辑
 */
export const CaptchaModal = forwardRef<CaptchaModalRef, CaptchaModalProps>(({ onVerify }, ref) => {
  const { t } = useTranslation('auth')
  const [isOpen, setIsOpen] = useState(false)
  const [uuid, setUuid] = useState('')
  const [y, setY] = useState(0)
  const actionRef = useRef<ActionType>(undefined)

  useImperativeHandle(ref, () => ({
    open: () => {
      setIsOpen(true)
      // 开启时自动刷新一次，确保图片是最新的
      setTimeout(() => actionRef.current?.refresh(), 100)
    },
    close: () => setIsOpen(false),
    refresh: () => actionRef.current?.refresh()
  }))

  const handleVerify = async (data: { x: number }) => {
    // 调用后端校验接口
    // data.x 为滑块拖动的水平距离
    const verification = await checkCaptcha({
      uuid,
      code: data.x.toString()
    })
    return verification
  }

  const handleSuccess = async (verification: string) => {
    try {
      await onVerify(verification)
      setIsOpen(false)
    } catch (error) {
      console.error('Captcha success callback error:', error)
    }
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onOpenChange={setIsOpen}
      size="sm"
      isDismissable={false}
      backdrop="blur"
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1">{t('captcha.title')}</ModalHeader>
            <ModalBody>
              <div className="flex justify-center py-4 w-full">
                <SliderCaptcha
                  mode="embed"
                  actionRef={actionRef}
                  request={async () => {
                    const res = await getCaptcha()
                    setUuid(res.uuid)
                    setY(res.y)
                    return {
                      bgUrl: res.bgUrl,
                      puzzleUrl: res.puzzleUrl,
                    }
                  }}
                  onVerify={handleVerify}
                  // @ts-expect-error rc-slider-captcha types
                  onSuccess={handleSuccess}
                  bgSize={{ width: 300, height: 150 }}
                  puzzleSize={{ width: 50, height: 50, top: y }}
                  showRefreshIcon={true}
                  autoRefreshOnError={true}
                />
              </div>
            </ModalBody>
            <ModalFooter className="justify-center border-t border-default-100 py-2">
              <div className="flex items-center gap-2 text-default-400 text-sm">
                <span>{t('captcha.tip')}</span>
                <button 
                  type="button"
                  className="flex items-center gap-1 text-primary hover:opacity-80 transition-opacity outline-none"
                  onClick={() => actionRef.current?.refresh()}
                >
                  <RefreshCcw size={14} />
                  <span>{t('captcha.refresh')}</span>
                </button>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
})

CaptchaModal.displayName = 'CaptchaModal'

