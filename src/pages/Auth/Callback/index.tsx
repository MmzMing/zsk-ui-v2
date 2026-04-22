/**
 * 第三方登录回调页面
 */
import { useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { thirdPartyCallback } from '@/api/auth'
import { useUserStore } from '@/stores/user'
import { setStorage, STORAGE_KEYS } from '@/utils/storage'
import { toast } from '@/utils/toast'

export default function CallbackPage() {
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
    
    // 从 sessionStorage 获取 loginType，或者从 URL 参数获取
    // 假设我们在发起授权时，将 loginType 存入了 sessionStorage
    // 或者我们通过 URL 路由参数来区分，例如 /callback/github
    // 这里暂时从 URL query parameter 'loginType' 获取，如果没有则尝试从 state 解析（假设后端 state 包含 loginType）
    // 如果都没有，可能需要调整后端授权 URL，带上 loginType 参数回来
    
    // 这里做一个简单的处理：尝试从 URL 参数获取，默认为 github (仅作示例)
    // 实际项目中，发起授权前应该 setItem('loginType', type)
    const storedLoginType = sessionStorage.getItem('loginType')
    const urlLoginType = searchParams.get('loginType')
    const loginType = urlLoginType || storedLoginType || 'github' 

    if (!code || !state) {
      toast.error('登录参数缺失')
      navigate('/login')
      return
    }

    const handleCallback = async () => {
      try {
        const res = await thirdPartyCallback({
          loginType,
          code,
          state
        })

        // 保存 Token 和用户信息（过期时间由后端 Set-Cookie 控制）
        setStorage(STORAGE_KEYS.TOKEN, res.accessToken, 'cookie')
        setStorage(STORAGE_KEYS.USER_INFO, res, 'cookie')
        
        setUserInfo({
          id: res.userId.toString(),
          name: res.username,
          avatar: res.avatar,
          email: '', // 第三方登录可能没有邮箱，视后端返回而定
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
  }, [searchParams, navigate, setUserInfo])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-content2/20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4" />
      <p className="text-default-500">正在处理登录...</p>
    </div>
  )
}
