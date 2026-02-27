import { create } from 'zustand'
import type { ReactNode } from 'react'

interface ModalConfig {
  title?: string
  content: ReactNode
  footer?: ReactNode
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full'
  onConfirm?: () => void | Promise<void>
  onCancel?: () => void
  confirmText?: string
  cancelText?: string
  showFooter?: boolean
  isDismissable?: boolean
}

interface ModalState {
  isOpen: boolean
  config: ModalConfig | null
  confirmLoading: boolean
  openModal: (config: ModalConfig) => void
  closeModal: () => void
  setConfirmLoading: (loading: boolean) => void
}

export const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  config: null,
  confirmLoading: false,
  openModal: (config) => set({ isOpen: true, config, confirmLoading: false }),
  closeModal: () => set({ isOpen: false, config: null, confirmLoading: false }),
  setConfirmLoading: (loading) => set({ confirmLoading: loading }),
}))

/**
 * 命令式调用工具
 */
export const modal = {
  confirm: (config: ModalConfig) => {
    useModalStore.getState().openModal(config)
  },
  close: () => {
    useModalStore.getState().closeModal()
  }
}
