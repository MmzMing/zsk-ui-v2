import { create } from 'zustand'

interface UIState {
  isLoading: boolean
  loadingText?: string
  showLoading: (text?: string) => void
  hideLoading: () => void
}

export const useUIStore = create<UIState>((set) => ({
  isLoading: false,
  loadingText: '',
  showLoading: (text = '') => set({ isLoading: true, loadingText: text }),
  hideLoading: () => set({ isLoading: false, loadingText: '' }),
}))
