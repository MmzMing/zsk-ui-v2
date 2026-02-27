/**
 * 用户状态管理
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserInfo, TokenInfo } from '@/types'

// 用户状态接口
interface UserState {
  /** 用户信息 */
  userInfo: UserInfo | null
  /** Token 信息 */
  tokenInfo: TokenInfo | null
  /** 是否已登录 */
  isLoggedIn: boolean
  /** 是否正在加载 */
  isLoading: boolean

  // Actions
  /** 设置用户信息 */
  setUserInfo: (user: UserInfo | null) => void
  /** 设置 Token 信息 */
  setTokenInfo: (token: TokenInfo | null) => void
  /** 登出 */
  logout: () => void
  /** 设置加载状态 */
  setLoading: (loading: boolean) => void
}

// 创建用户 Store
export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      userInfo: null,
      tokenInfo: null,
      isLoggedIn: false,
      isLoading: false,

      setUserInfo: (user) =>
        set({
          userInfo: user,
          isLoggedIn: !!user,
        }),

      setTokenInfo: (token) =>
        set({
          tokenInfo: token,
        }),

      logout: () =>
        set({
          userInfo: null,
          tokenInfo: null,
          isLoggedIn: false,
        }),

      setLoading: (loading) =>
        set({
          isLoading: loading,
        }),
    }),
    {
      name: 'zsk-user-store',
      partialize: (state) => ({
        userInfo: state.userInfo,
        tokenInfo: state.tokenInfo,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
)
