/**
 * 登录页面
 */

import { useState, useRef, useEffect } from 'react'
import { Button, Input, Checkbox, Link, InputOtp, Divider } from '@heroui/react'
import { InteractiveHoverButton } from '@/components/ui/magicui/InteractiveHoverButton'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, Github } from 'lucide-react'
import { FaQq, FaWeixin } from 'react-icons/fa'
import { CaptchaModal, type CaptchaModalRef, PolicyModal, type PolicyModalRef } from '@/components/auth'
import { login, getPublicKey, sendEmailCode, getThirdPartyUrl } from '@/api/auth'
import { toast } from '@/utils/toast'
import { validateAccount, validatePassword } from '@/utils/validate'
import { useUserStore } from '@/stores/user'
import { encryptPassword } from '@/utils/crypto'
import { setStorage, STORAGE_KEYS } from '@/utils/storage'

export default function LoginPage() {
  const { t } = useTranslation('auth')
  const navigate = useNavigate()
  const setUserInfo = useUserStore(state => state.setUserInfo)
  
  const captchaRef = useRef<CaptchaModalRef>(null)
  const policyRef = useRef<PolicyModalRef>(null)
  
  const [loading, setLoading] = useState(false)
  const [sendingCode, setSendingCode] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [isCodeSent, setIsCodeSent] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    emailCode: '',
    remember: false
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

  const toggleVisibility = () => setIsVisible(!isVisible)

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

  const handleInputChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }))
    
    // 如果已经触发过校验（或者正在输入），实时更新错误状态
    if (touched[key as keyof typeof touched]) {
      validateField(key, value)
    } else if (errors[key as keyof typeof errors]) {
      // 如果已经有错误（比如提交后），也实时更新
      setErrors(prev => ({ ...prev, [key]: '' }))
    }
  }

  const handleBlur = (key: string) => {
    setTouched(prev => ({ ...prev, [key]: true }))
    validateField(key, formData[key as keyof typeof formData] as string)
  }

  // 倒计时
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [countdown])

  // 点击发送验证码
  const handleSendCodeClick = () => {
    if (!formData.username) {
      toast.error(t('login.accountRequired'))
      return
    }
    captchaRef.current?.open()
  }

  // 滑块验证成功回调
  const handleCaptchaVerify = async (verification: string) => {
    setSendingCode(true)
    try {
      // 这里的接口可能是根据用户名或邮箱发送验证码
      // 根据文档：带着一次性token去调用后端的邮箱接口
      await sendEmailCode({
        email: formData.username, // 假设账号就是邮箱，或者后端能识别
        captchaVerification: verification
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const newErrors = {
      username: '',
      password: '',
      emailCode: ''
    }
    let hasError = false

    const accountResult = validateAccount(formData.username)
    if (!accountResult.isValid) {
      newErrors.username = formData.username.includes('@') ? t('validation.emailInvalid') : t('validation.usernameFormat')
      hasError = true
    }

    const passwordResult = validatePassword(formData.password)
    if (!passwordResult.isValid) {
      newErrors.password = t('validation.passwordMinLength')
      hasError = true
    }

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
      
      // 3. 登录
      const res = await login({
        username: formData.username,
        password: encryptedPassword,
        emailCode: formData.emailCode,
        loginType: 'password_code' // 假设的类型
      })
      
      // 4. 保存到 Cookie
      setStorage(STORAGE_KEYS.TOKEN, res.accessToken, 'cookie')
      setStorage(STORAGE_KEYS.USER_INFO, res, 'cookie')
      
      setUserInfo({
        id: res.userId.toString(),
        name: res.username,
        avatar: res.avatar,
        email: formData.username, // 暂时用账号填充
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

  // 第三方登录
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

  return (
    <div className="flex items-center justify-center min-h-screen bg-content2/20 px-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-content1 rounded-2xl shadow-xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">{t('login.header')}</h1>
          <p className="text-default-500 mt-2">{t('login.subtitle')}</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              label={t('login.account')}
              description={t('login.accountPlaceholder')}
              variant="flat"
              labelPlacement="inside"
              value={formData.username}
              onValueChange={(v) => handleInputChange('username', v)}
              onBlur={() => handleBlur('username')}
              isInvalid={!!errors.username}
              errorMessage={errors.username}
            />
            <Input
              label={t('login.password')}
              description={t('login.passwordPlaceholder')}
              variant="flat"
              labelPlacement="inside"
              value={formData.password}
              onValueChange={(v) => handleInputChange('password', v)}
              onBlur={() => handleBlur('password')}
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
            
            <div className="flex flex-col gap-2">
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
                  color="default" 
                  variant="flat" 
                  className="h-10"
                  onPress={handleSendCodeClick}
                  isDisabled={countdown > 0}
                  isLoading={sendingCode}
                >
                  {countdown > 0 ? t('common.seconds', { count: countdown }) : t('common.getCode')}
                </Button>
              </div>
              {errors.emailCode && (
                <div className="text-tiny text-danger px-1">
                  {errors.emailCode}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Checkbox 
              isSelected={formData.remember} 
              onValueChange={(v) => handleInputChange('remember', v)}
              size="sm"
            >
              {t('login.rememberMe')}
            </Checkbox>
            <Link href="/forgot-password" size="sm" color="primary">
              {t('login.forgotPassword')}
            </Link>
          </div>

          <div className="flex justify-center">
            <InteractiveHoverButton
              type="submit"
              className="w-full"
              disabled={loading || !isCodeSent}
            >
              {loading ? '登录中...' : t('login.submit')}
            </InteractiveHoverButton>
          </div>

          <div className="text-center text-sm">
            <span className="text-default-500">{t('login.noAccount')}</span>
            <Link href="/register" size="sm" className="ml-1 font-medium">
              {t('login.registerNow')}
            </Link>
          </div>

          <div className="flex items-center gap-4 w-full">
            <Divider className="flex-1" />
            <span className="text-tiny text-default-400">其他登录方式</span>
            <Divider className="flex-1" />
          </div>

          <div className="flex justify-center gap-6">
            <Button
              isIconOnly
              variant="light"
              onPress={() => handleThirdPartyLogin('github')}
              className="w-12 h-12 min-w-12 rounded-full hover:bg-default-100"
            >
              <Github size={28} />
            </Button>
            <Button
              isIconOnly
              variant="light"
              onPress={() => handleThirdPartyLogin('qq')}
              className="w-12 h-12 min-w-12 rounded-full text-[#12B7F5] hover:bg-[#12B7F5]/10"
            >
              <FaQq size={28} />
            </Button>
            <Button
              isIconOnly
              variant="light"
              onPress={() => handleThirdPartyLogin('wechat')}
              className="w-12 h-12 min-w-12 rounded-full text-[#07C160] hover:bg-[#07C160]/10"
            >
              <FaWeixin size={28} />
            </Button>
          </div>
        </form>

        {/* 页脚隐私协议 */}
        <div className="pt-6 border-t border-default-100 text-center text-xs text-default-400">
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


      <CaptchaModal ref={captchaRef} onVerify={handleCaptchaVerify} />
      <PolicyModal ref={policyRef} />
    </div>
  )
}

