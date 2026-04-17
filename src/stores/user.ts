/**
 * 用户状态管理
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserInfo, TokenInfo } from '@/types'

interface UserState {
  userInfo: UserInfo | null
  tokenInfo: TokenInfo | null
  isLoggedIn: boolean
  isLoading: boolean
  permissions: string[]

  setUserInfo: (user: UserInfo | null) => void
  setTokenInfo: (token: TokenInfo | null) => void
  logout: () => void
  setLoading: (loading: boolean) => void
  setPermissions: (permissions: string[]) => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      userInfo: null,
      tokenInfo: null,
      isLoggedIn: false,
      isLoading: false,
      permissions: [],

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
          permissions: [],
        }),

      setLoading: (loading) =>
        set({
          isLoading: loading,
        }),

      setPermissions: (permissions) =>
        set({
          permissions,
        }),
    }),
    {
      name: 'zsk-user-store',
      partialize: (state) => ({
        userInfo: state.userInfo,
        tokenInfo: state.tokenInfo,
        isLoggedIn: state.isLoggedIn,
        permissions: state.permissions,
      }),
    }
  )
)