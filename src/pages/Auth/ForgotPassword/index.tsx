/**
 * 忘记密码页面
 * 
 * 功能：提供密码找回功能，支持邮箱验证码验证和密码重置
 * 包含 Cloudflare Turnstile 人机校验，用于获取验证码前的安全验证
 */

// ===== 1. 依赖导入区域 =====
import { useState, useEffect } from 'react'
import { Button, Input, InputOtp, Link } from '@heroui/react'
import { InteractiveHoverButton } from '@/components/ui/magicui/InteractiveHoverButton'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff } from 'lucide-react'
import { Turnstile } from '@marsidev/react-turnstile'
import { sendPasswordResetCode, verifyResetCode, resetPassword } from '@/api/auth'
import { toast } from '@/utils/toast'
import { validateEmail, validatePassword } from '@/utils/validate'
import { AuthLayout } from '../AuthLayout'

// ===== 2. TODO待处理导入区域 =====

export default function ForgotPasswordPage() {
  // ===== 3. 状态控制逻辑区域 =====
  const { t } = useTranslation('auth')
  const navigate = useNavigate()
  
  const [loading, setLoading] = useState(false)
  const [sendingCode, setSendingCode] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [isCodeSent, setIsCodeSent] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isConfirmVisible, setIsConfirmVisible] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  
  // Cloudflare Turnstile 人机校验状态
  const [turnstileToken, setTurnstileToken] = useState('')
  
  const [formData, setFormData] = useState({
    email: '',
    code: '',
    password: '',
    confirmPassword: ''
  })

  const [errors, setErrors] = useState({
    email: '',
    code: '',
    password: '',
    confirmPassword: ''
  })

  const [touched, setTouched] = useState({
    email: false,
    password: false,
    confirmPassword: false
  })

  // ===== 4. 通用工具函数区域 =====

  /**
   * 切换密码可见性
   */
  const toggleVisibility = () => setIsVisible(!isVisible)
  
  /**
   * 切换确认密码可见性
   */
  const toggleConfirmVisibility = () => setIsConfirmVisible(!isConfirmVisible)

  /**
   * 校验表单字段
   * @param key - 字段名
   * @param value - 字段值
   */
  const validateField = (key: string, value: string) => {
    let error = ''
    if (key === 'email') {
      if (!validateEmail(value)) {
        error = t('validation.emailInvalid')
      }
    } else if (key === 'password') {
      const result = validatePassword(value)
      if (!result.isValid) {
        error = result.message || t('validation.passwordMinLength')
      }
    } else if (key === 'confirmPassword') {
      if (value !== formData.password) {
        error = t('validation.passwordMismatch')
      }
    } else if (key === 'code') {
      if (value.length !== 6) {
        error = t('validation.codeLength')
      }
    }
    setErrors(prev => ({ ...prev, [key]: error }))
    return error
  }

  /**
   * 处理表单输入变化
   * @param key - 字段名
   * @param value - 字段值
   */
  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }))
    
    if (touched[key as keyof typeof touched] || errors[key as keyof typeof errors]) {
      if (key === 'password' && touched.confirmPassword) {
        setErrors(prev => ({ 
          ...prev, 
          password: validatePassword(value).message || (validatePassword(value).isValid ? '' : t('validation.passwordMinLength')),
          confirmPassword: value === formData.confirmPassword ? '' : t('validation.passwordMismatch')
        }))
      } else {
        validateField(key, value)
      }
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
   */
  const handleSendCode = async () => {
    const emailError = validateField('email', formData.email)
    if (emailError) {
      toast.error(emailError)
      return
    }
    
    if (!turnstileToken) {
      toast.error(t('turnstile.verificationRequired'))
      return
    }
    
    setSendingCode(true)
    try {
      await sendPasswordResetCode({
        email: formData.email,
        captchaVerification: turnstileToken
      })
      toast.success(t('forgotPassword.codeSent'))
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
      email: validateEmail(formData.email) ? '' : t('validation.emailInvalid'),
      code: formData.code.length === 6 ? '' : t('validation.codeLength'),
      password: validatePassword(formData.password).isValid ? '' : (validatePassword(formData.password).message || t('validation.passwordMinLength')),
      confirmPassword: formData.password === formData.confirmPassword ? '' : t('validation.passwordMismatch')
    }

    setErrors(newErrors)
    setTouched({
      email: true,
      password: true,
      confirmPassword: true
    })

    const hasError = Object.values(newErrors).some(err => err !== '')
    if (hasError) {
      toast.error(t('forgotPassword.formCheck'))
      return
    }

    setLoading(true)
    try {
      // 第一步：验证验证码
      const token = await verifyResetCode({ 
        email: formData.email, 
        code: formData.code 
      })
      
      // 第二步：重置密码
      await resetPassword({
        email: formData.email,
        verifyToken: token,
        newPassword: formData.password 
      })
      
      toast.success(t('forgotPassword.success'))
      navigate('/login')
    } catch (error) {
      console.error('重置密码失败：', error)
    } finally {
      setLoading(false)
    }
  }

  // ===== 8. UI渲染逻辑区域 =====
  
  // ===== 9. 页面初始化与事件绑定 =====

  // ===== 10. TODO任务管理区域 =====

  // ===== 11. 导出区域 =====
  return (
    <AuthLayout
      isTyping={isTyping}
      showPassword={isVisible || isConfirmVisible}
      passwordLength={formData.password.length + formData.confirmPassword.length}
    >
      <div className="space-y-8">
        {/* 页面标题区域 */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{t('forgotPassword.title')}</h1>
          <p className="text-default-500">{t('forgotPassword.subtitle')}</p>
        </div>

        {/* 重置密码表单 */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            {/* 邮箱输入框 */}
            <Input
              label={t('forgotPassword.email')}
              description={t('forgotPassword.emailPlaceholder')}
              type="email"
              variant="flat"
              labelPlacement="inside"
              value={formData.email}
              onValueChange={(v) => handleInputChange('email', v)}
              onBlur={() => handleBlur('email')}
              onFocus={() => setIsTyping(true)}
              isInvalid={!!errors.email}
              errorMessage={errors.email}
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
                    value={formData.code}
                    isInvalid={!!errors.code}
                    isDisabled={!isCodeSent}
                    onValueChange={(v) => handleInputChange('code', v)}
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
                  onPress={handleSendCode}
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
              {errors.code && (
                <div className="text-tiny text-danger px-1">
                  {errors.code}
                </div>
              )}
            </div>
            
            {/* 新密码输入框 */}
            <Input
              label={t('forgotPassword.newPassword')}
              description={t('forgotPassword.newPasswordPlaceholder')}
              type={isVisible ? "text" : "password"}
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
            />
            
            {/* 确认密码输入框 */}
            <Input
              label={t('forgotPassword.confirmPassword')}
              description={t('forgotPassword.confirmPasswordPlaceholder')}
              type={isConfirmVisible ? "text" : "password"}
              variant="flat"
              labelPlacement="inside"
              value={formData.confirmPassword}
              onValueChange={(v) => handleInputChange('confirmPassword', v)}
              onBlur={() => handleBlur('confirmPassword')}
              onFocus={() => setIsTyping(true)}
              isInvalid={!!errors.confirmPassword}
              errorMessage={errors.confirmPassword}
              endContent={
                <button className="focus:outline-none" type="button" onClick={toggleConfirmVisibility}>
                  {isConfirmVisible ? (
                    <EyeOff className="text-2xl text-default-400 pointer-events-none" />
                  ) : (
                    <Eye className="text-2xl text-default-400 pointer-events-none" />
                  )}
                </button>
              }
            />
          </div>

          {/* 提交按钮 */}
          <div className="flex justify-center">
            <InteractiveHoverButton
              type="submit"
              className="w-full"
              disabled={loading || !isCodeSent}
            >
              {loading ? t('forgotPassword.resetting') : t('forgotPassword.submit')}
            </InteractiveHoverButton>
          </div>

          {/* 返回登录链接 */}
          <div className="text-center text-sm">
            <Link href="/login" size="sm" className="font-medium">
              {t('forgotPassword.backToLogin')}
            </Link>
          </div>
        </form>
      </div>
    </AuthLayout>
  )
}