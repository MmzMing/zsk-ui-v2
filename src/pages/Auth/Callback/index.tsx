/**
 * 第三方登录回调页面
 */
import { useEffect, useRef } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { githubCallback, wechatCallback, qqCallback } from '@/api/auth'
import type { LoginResult } from '@/types'
import { useUserStore } from '@/stores/user'
import { setStorage, STORAGE_KEYS } from '@/utils/storage'
import { toast } from '@/utils/toast'

// 平台与回调 API 映射
const callbackApiMap: Record<string, (code: string, state: string) => Promise<LoginResult>> = {
  github: githubCallback,
  wechat: wechatCallback,
  qq: qqCallback,
}

export default function CallbackPage() {
  const { platform } = useParams<{ platform: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const setUserInfo = useUserStore(state => state.setUserInfo)
  const processedRef = useRef(false)

  useEffect(() => {
    // 防止 React Strict Mode 下执行两次
    if (processedRef.current) return
    processedRef.current = true

    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const loginType = platform?.toLowerCase() || 'github'

    if (!code || !state) {
      toast.error('登录参数缺失')
      navigate('/login')
      return
    }

    // 获取对应的回调 API
    const callbackApi = callbackApiMap[loginType]
    if (!callbackApi) {
      toast.error('不支持的登录方式')
      navigate('/login')
      return
    }

    const handleCallback = async () => {
      try {
        const res = await callbackApi(code, state)

        // 保存用户信息（Cookie 由后端 Set-Cookie 控制）
        setStorage(STORAGE_KEYS.USER_INFO, res, 'local')
        
        setUserInfo({
          id: res.userId,
          name: res.nickname || res.username,
          avatar: res.avatar,
          email: '',
          roles: ['user'],
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })

        toast.success('登录成功')
        navigate('/')
      } catch {
        toast.error('登录失败，请重试')
        navigate('/login')
      }
    }

    handleCallback()
  }, [platform, searchParams, navigate, setUserInfo])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-content2/20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4" />
      <p className="text-default-500">正在处理登录...</p>
    </div>
  )
}
