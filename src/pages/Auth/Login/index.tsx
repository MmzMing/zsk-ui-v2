/**
 * 登录页面
 * 
 * 功能：提供用户登录入口，支持账号密码登录和第三方登录
 * 包含 Cloudflare Turnstile 人机校验，用于获取验证码前的安全验证
 */

// ===== 1. 依赖导入区域 =====
import { useState, useRef, useEffect } from 'react'
import { Button, Input, Link, InputOtp, Divider } from '@heroui/react'
import { InteractiveHoverButton } from '@/components/ui/magicui/InteractiveHoverButton'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, Github } from 'lucide-react'
import { FaQq, FaWeixin } from 'react-icons/fa'
import { Turnstile } from '@marsidev/react-turnstile'
import { PolicyModal, type PolicyModalRef } from '@/components/auth'
import { login, getPublicKey, sendEmailCode, getThirdPartyUrl } from '@/api/auth'
import { toast } from '@/utils/toast'
import { validateAccount, validatePassword } from '@/utils/validate'
import { useUserStore } from '@/stores/user'
import { encryptPassword } from '@/utils/crypto'
import { setStorage, STORAGE_KEYS } from '@/utils/storage'
import { AuthLayout } from '../AuthLayout'

// ===== 2. TODO待处理导入区域 =====

export default function LoginPage() {
  // ===== 3. 状态控制逻辑区域 =====
  const { t } = useTranslation('auth')
  const navigate = useNavigate()
  const setUserInfo = useUserStore(state => state.setUserInfo)
  
  const policyRef = useRef<PolicyModalRef>(null)
  
  const [loading, setLoading] = useState(false)
  const [sendingCode, setSendingCode] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [isCodeSent, setIsCodeSent] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  
  // Cloudflare Turnstile 人机校验状态
  const [turnstileToken, setTurnstileToken] = useState('')
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    emailCode: ''
  })
  
  const [errors, setErrors] = useState({
    username: '',
    password: '',
    emailCode: ''
  })

  const [touched, setTouched] = useState({
    username: false,
    password: false
  })

  // ===== 4. 通用工具函数区域 =====
  
  /**
   * 切换密码可见性
   */
  const toggleVisibility = () => setIsVisible(!isVisible)

  /**
   * 校验表单字段
   * @param key - 字段名
   * @param value - 字段值
   */
  const validateField = (key: string, value: string) => {
    let error = ''
    if (key === 'username') {
      const result = validateAccount(value)
      if (!result.isValid) {
        if (value.includes('@')) {
          error = t('validation.emailInvalid')
        } else if (!value) {
          error = t('validation.usernameRequired')
        } else {
          error = t('validation.usernameFormat')
        }
      }
    } else if (key === 'password') {
      const result = validatePassword(value)
      if (!result.isValid) error = t('validation.passwordMinLength')
    }
    setErrors(prev => ({ ...prev, [key]: error }))
  }

  /**
   * 处理表单输入变化
   * @param key - 字段名
   * @param value - 字段值
   */
  const handleInputChange = (key: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [key]: value }))
    
    // 如果已经触发过校验，实时更新错误状态
    if (touched[key as keyof typeof touched]) {
      if (typeof value === 'string') {
        validateField(key, value)
      }
    } else if (errors[key as keyof typeof errors]) {
      // 如果已经有错误，清除错误
      setErrors(prev => ({ ...prev, [key]: '' }))
    }
  }

  /**
   * 处理字段失焦
   * @param key - 字段名
   */
  const handleBlur = (key: string) => {
    setTouched(prev => ({ ...prev, [key]: true }))
    validateField(key, formData[key as keyof typeof formData] as string)
    setIsTyping(false)
  }

  // ===== 5. 注释代码函数区 =====

  // ===== 6. 错误处理函数区域 =====

  // ===== 7. 数据处理函数区域 =====

  /**
   * 验证码倒计时逻辑
   */
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [countdown])

  /**
   * 处理发送验证码点击事件
   * 需先完成 Turnstile 人机校验才能发送验证码
   */
  const handleSendCodeClick = async () => {
    // 校验账号是否输入
    if (!formData.username) {
      toast.error(t('login.accountRequired'))
      return
    }
    
    // 校验 Turnstile 是否完成
    if (!turnstileToken) {
      toast.error(t('turnstile.verificationRequired'))
      return
    }
    
    setSendingCode(true)
    try {
      // 调用发送验证码接口，携带 Turnstile token
      await sendEmailCode({
        email: formData.username,
        captchaVerification: turnstileToken
      })
      toast.success(t('login.codeSent'))
      setCountdown(60)
      setIsCodeSent(true)
    } catch (error) {
      console.error('发送验证码失败：', error)
    } finally {
      setSendingCode(false)
    }
  }

  /**
   * 处理表单提交
   * @param e - 表单提交事件
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const newErrors = {
      username: '',
      password: '',
      emailCode: ''
    }
    let hasError = false

    // 校验账号
    const accountResult = validateAccount(formData.username)
    if (!accountResult.isValid) {
      newErrors.username = formData.username.includes('@') 
        ? t('validation.emailInvalid') 
        : t('validation.usernameFormat')
      hasError = true
    }

    // 校验密码
    const passwordResult = validatePassword(formData.password)
    if (!passwordResult.isValid) {
      newErrors.password = t('validation.passwordMinLength')
      hasError = true
    }

    // 校验验证码
    if (!formData.emailCode) {
      newErrors.emailCode = t('validation.codeRequired')
      hasError = true
    } else if (formData.emailCode.length !== 6) {
      newErrors.emailCode = t('validation.codeLength')
      hasError = true
    }

    if (hasError) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    try {
      // 1. 获取公钥
      const { publicKey } = await getPublicKey()
      
      // 2. 加密密码
      const encryptedPassword = encryptPassword(formData.password, publicKey)
      
      // 3. 调用登录接口
      const res = await login({
        username: formData.username,
        password: encryptedPassword,
        emailCode: formData.emailCode,
        loginType: 'password_code'
      })
      
      // 4. 保存登录状态到 Cookie
      setStorage(STORAGE_KEYS.TOKEN, res.accessToken, 'cookie')
      setStorage(STORAGE_KEYS.USER_INFO, res, 'cookie')
      
      // 5. 更新全局用户状态
      setUserInfo({
        id: res.userId.toString(),
        name: res.username,
        avatar: res.avatar,
        email: formData.username,
        role: 'user',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      
      toast.success(t('login.success'))
      navigate('/')
    } catch (error) {
      console.error('登录失败：', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 处理第三方登录
   * @param type - 第三方登录类型（github/qq/wechat）
   */
  const handleThirdPartyLogin = async (type: string) => {
    try {
      // 存储当前登录类型，以便回调时使用
      sessionStorage.setItem('loginType', type)
      const url = await getThirdPartyUrl(type)
      if (url) {
        window.location.href = url
      } else {
        toast.error('获取授权链接失败')
      }
    } catch (error) {
      console.error('获取第三方登录链接失败：', error)
      toast.error('获取授权链接失败')
    }
  }

  // ===== 8. UI渲染逻辑区域 =====
  
  // ===== 9. 页面初始化与事件绑定 =====

  // ===== 10. TODO任务管理区域 =====

  // ===== 11. 导出区域 =====
  return (
    <AuthLayout
      isTyping={isTyping}
      showPassword={isVisible}
      passwordLength={formData.password.length}
    >
      <div className="space-y-8">
        {/* 页面标题区域 */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{t('login.header')}</h1>
          <p className="text-default-500">{t('login.subtitle')}</p>
        </div>

        {/* 登录表单 */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            {/* 账号输入框 */}
            <Input
              label={t('login.account')}
              description={t('login.accountPlaceholder')}
              variant="flat"
              labelPlacement="inside"
              value={formData.username}
              onValueChange={(v) => handleInputChange('username', v)}
              onBlur={() => handleBlur('username')}
              onFocus={() => setIsTyping(true)}
              isInvalid={!!errors.username}
              errorMessage={errors.username}
            />
            
            {/* 密码输入框 */}
            <Input
              label={t('login.password')}
              description={t('login.passwordPlaceholder')}
              variant="flat"
              labelPlacement="inside"
              value={formData.password}
              onValueChange={(v) => handleInputChange('password', v)}
              onBlur={() => handleBlur('password')}
              onFocus={() => setIsTyping(true)}
              isInvalid={!!errors.password}
              errorMessage={errors.password}
              endContent={
                <button className="focus:outline-none" type="button" onClick={toggleVisibility}>
                  {isVisible ? (
                    <EyeOff className="text-2xl text-default-400 pointer-events-none" />
                  ) : (
                    <Eye className="text-2xl text-default-400 pointer-events-none" />
                  )}
                </button>
              }
              type={isVisible ? "text" : "password"}
            />
            
            {/* 验证码区域 */}
            <div className="flex flex-col gap-2">
              {/* 验证码输入框和获取按钮 */}
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <InputOtp
                    length={6}
                    size="md"
                    radius="lg"
                    variant="flat"
                    value={formData.emailCode}
                    isInvalid={!!errors.emailCode}
                    isDisabled={!isCodeSent}
                    onValueChange={(v) => handleInputChange('emailCode', v)}
                    classNames={{
                      base: `w-full ${!isCodeSent ? 'opacity-50 cursor-not-allowed' : ''}`,
                      wrapper: "w-full",
                      segmentWrapper: "w-full justify-between gap-1",
                      segment: `flex-1 h-10 text-md min-w-0 !rounded-[8px] ${!isCodeSent ? 'pointer-events-none' : ''}`,
                      helperWrapper: "hidden"
                    }}
                  />
                </div>
                <Button
                  color="primary"
                  variant="flat"
                  className="h-10"
                  onPress={handleSendCodeClick}
                  isDisabled={countdown > 0}
                  isLoading={sendingCode}
                >
                  {countdown > 0 ? t('common.seconds', { count: countdown }) : t('common.getCode')}
                </Button>
              </div>
              
              {/* Cloudflare Turnstile 人机校验 */}
              <div className="flex justify-start">
                <Turnstile
                  siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
                  onSuccess={(token) => {
                    setTurnstileToken(token)
                  }}
                  onError={() => {
                    setTurnstileToken('')
                  }}
                  onExpire={() => {
                    setTurnstileToken('')
                  }}
                  onTimeout={() => {
                    setTurnstileToken('')
                  }}
                />
              </div>
              
              {/* 验证码错误提示 */}
              {errors.emailCode && (
                <div className="text-tiny text-danger px-1">
                  {errors.emailCode}
                </div>
              )}
            </div>
          </div>

          {/* 登录按钮 */}
          <div className="flex justify-center">
            <InteractiveHoverButton
              type="submit"
              className="w-full"
              disabled={loading || !isCodeSent}
            >
              {loading ? '登录中...' : t('login.submit')}
            </InteractiveHoverButton>
          </div>

          {/* 注册链接和忘记密码 */}
          <div className="text-center text-sm">
            <span className="text-default-500">{t('login.noAccount')}</span>
            <Link href="/register" size="sm" className="ml-1 font-medium">
              {t('login.registerNow')}
            </Link>
            <span className="text-default-400 mx-2">|</span>
            <Link href="/forgot-password" size="sm" color="primary">
              {t('login.forgotPassword')}
            </Link>
          </div>

          {/* 第三方登录分隔线 */}
          <div className="flex items-center gap-4 w-full">
            <Divider className="flex-1" />
            <span className="text-tiny text-default-400">其他登录方式</span>
            <Divider className="flex-1" />
          </div>

          {/* 第三方登录按钮 */}
          <div className="flex justify-center gap-6">
            <Button
              isIconOnly
              variant="flat"
              radius="full"
              onPress={() => handleThirdPartyLogin('github')}
              className="w-12 h-12 min-w-12 hover:bg-default-100"
            >
              <Github size={24} />
            </Button>
            <Button
              isIconOnly
              variant="flat"
              radius="full"
              onPress={() => handleThirdPartyLogin('qq')}
              className="w-12 h-12 min-w-12 text-[#12B7F5] hover:bg-[#12B7F5]/10"
            >
              <FaQq size={24} />
            </Button>
            <Button
              isIconOnly
              variant="flat"
              radius="full"
              onPress={() => handleThirdPartyLogin('wechat')}
              className="w-12 h-12 min-w-12 text-[#07C160] hover:bg-[#07C160]/10"
            >
              <FaWeixin size={24} />
            </Button>
          </div>
        </form>

        {/* 页脚隐私协议 */}
        <div className="pt-6 border-t border-divider text-center text-xs text-default-400">
          {t('login.policyPrefix')}
          <Button
            variant="light"
            size="sm"
            className="px-1 h-auto min-w-0 text-xs text-primary"
            onPress={() => policyRef.current?.open('terms')}
          >
            {t('login.terms')}
          </Button>
          {t('login.policyAnd')}
          <Button
            variant="light"
            size="sm"
            className="px-1 h-auto min-w-0 text-xs text-primary"
            onPress={() => policyRef.current?.open('privacy')}
          >
            {t('login.privacy')}
          </Button>
        </div>
      </div>

      {/* 隐私政策弹窗 */}
      <PolicyModal ref={policyRef} />
    </AuthLayout>
  )
}