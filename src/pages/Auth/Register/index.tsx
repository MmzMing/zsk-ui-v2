/**
 * 注册页面
 */

import { useState, useRef, useEffect } from 'react'
import { Button, Input, Link, InputOtp } from '@heroui/react'
import { InteractiveHoverButton } from '@/components/ui/magicui/InteractiveHoverButton'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff } from 'lucide-react'
import { CaptchaModal, type CaptchaModalRef, PolicyModal, type PolicyModalRef } from '@/components/auth'
import { register, sendEmailCode } from '@/api/auth'
import { toast } from '@/utils/toast'
import { validateUsername, validateEmail, validatePassword } from '@/utils/validate'
import { AuthLayout } from '../AuthLayout'

export default function RegisterPage() {
  const { t } = useTranslation('auth')
  const navigate = useNavigate()
  
  const captchaRef = useRef<CaptchaModalRef>(null)
  const policyRef = useRef<PolicyModalRef>(null)
  
  const [loading, setLoading] = useState(false)
  const [sendingCode, setSendingCode] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [isConfirmVisible, setIsConfirmVisible] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    code: '',
    uuid: '' // 存储滑块验证后的 uuid 或凭证
  })

  const [errors, setErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    code: ''
  })

  const [touched, setTouched] = useState({
    username: false,
    email: false,
    password: false,
    confirmPassword: false
  })

  const toggleVisibility = () => setIsVisible(!isVisible)
  const toggleConfirmVisibility = () => setIsConfirmVisible(!isConfirmVisible)

  const validateField = (key: string, value: string) => {
    let error = ''
    if (key === 'username') {
      if (!validateUsername(value)) {
        error = t('validation.usernameFormat')
      }
    } else if (key === 'email') {
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

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }))
    
    // 如果已经触发过校验，或者已经有错误，则实时更新错误状态
    if (touched[key as keyof typeof touched] || errors[key as keyof typeof errors]) {
      // 这里的 validateField 需要最新的 formData，但 setFormData 是异步的
      // 所以对于 confirmPassword 这种依赖其他字段的，需要特殊处理
      if (key === 'password' && touched.confirmPassword) {
        // 如果密码变了，且确认密码已经 touch 过，需要重新校验确认密码
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

  const handleBlur = (key: string) => {
    setTouched(prev => ({ ...prev, [key]: true }))
    validateField(key, formData[key as keyof typeof formData] as string)
    setIsTyping(false)
  }

  // 发送邮件验证码
  const handleSendCode = () => {
    const emailError = validateField('email', formData.email)
    if (emailError) {
      toast.error(emailError)
      return
    }
    captchaRef.current?.open()
  }

  // 滑块验证成功后发送邮件
  const handleCaptchaVerify = async (verification: string) => {
    setSendingCode(true)
    try {
      await sendEmailCode({
        email: formData.email,
        captchaVerification: verification
      })
      toast.success(t('register.codeSent'))
      setCountdown(60)
      // 记录验证凭证
      handleInputChange('uuid', verification)
    } catch (error) {
      console.error('发送验证码失败：', error)
    } finally {
      setSendingCode(false)
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 全量校验
    const newErrors = {
      username: validateUsername(formData.username) ? '' : t('validation.usernameFormat'),
      email: validateEmail(formData.email) ? '' : t('validation.emailInvalid'),
      password: validatePassword(formData.password).isValid ? '' : (validatePassword(formData.password).message || t('validation.passwordMinLength')),
      confirmPassword: formData.password === formData.confirmPassword ? '' : t('validation.passwordMismatch'),
      code: formData.code.length === 6 ? '' : t('validation.codeLength')
    }

    setErrors(newErrors)
    setTouched({
      username: true,
      email: true,
      password: true,
      confirmPassword: true
    })

    const hasError = Object.values(newErrors).some(err => err !== '')
    if (hasError) {
      toast.error(t('register.formCheck'))
      return
    }

    setLoading(true)
    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        code: formData.code,
        uuid: formData.uuid
      })
      toast.success(t('register.success'))
      navigate('/login')
    } catch (error) {
      console.error('注册失败：', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      isTyping={isTyping}
      showPassword={isVisible || isConfirmVisible}
      passwordLength={formData.password.length + formData.confirmPassword.length}
    >
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{t('register.header')}</h1>
          <p className="text-default-500">{t('register.subtitle')}</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              label={t('register.username')}
              description={t('register.usernameDesc')}
              variant="flat"
              labelPlacement="inside"
              value={formData.username}
              onValueChange={(v) => handleInputChange('username', v)}
              onBlur={() => handleBlur('username')}
              onFocus={() => setIsTyping(true)}
              isInvalid={!!errors.username}
              errorMessage={errors.username}
            />
            <Input
              label={t('register.email')}
              description={t('register.emailDesc')}
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
            
            <Input
              label={t('register.password')}
              description={t('register.passwordDesc')}
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
            <Input
              label={t('register.confirmPassword')}
              description={t('register.confirmPasswordDesc')}
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

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 h-10">
                <div className="flex-1 h-full">
                  <InputOtp
                    length={6}
                    size="sm"
                    radius="lg"
                    variant="flat"
                    value={formData.code}
                    isInvalid={!!errors.code}
                    onValueChange={(v) => handleInputChange('code', v)}
                    classNames={{
                      base: "w-full h-full",
                      wrapper: "w-full h-full",
                      segmentWrapper: "w-full h-full justify-between gap-1",
                      segment: "flex-1 h-full text-sm min-w-0 !rounded-[8px]",
                      helperWrapper: "hidden"
                    }}
                  />
                </div>
                <Button 
                  color="primary" 
                  variant="flat" 
                  className="h-10 min-w-[100px]"
                  onPress={handleSendCode}
                  isDisabled={countdown > 0}
                  isLoading={sendingCode}
                >
                  {countdown > 0 ? t('common.seconds', { count: countdown }) : t('common.getCode')}
                </Button>
              </div>
              {errors.code && (
                <div className="text-tiny text-danger px-1">
                  {errors.code}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-center">
            <InteractiveHoverButton
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? '注册中...' : t('register.submit')}
            </InteractiveHoverButton>
          </div>

          <div className="text-center text-sm">
            <span className="text-default-500">{t('register.hasAccount')}</span>
            <Link href="/login" size="sm" className="ml-1 font-medium">
              {t('register.backToLogin')}
            </Link>
          </div>
        </form>

        {/* 页脚隐私协议 */}
        <div className="pt-6 border-t border-divider text-center text-xs text-default-400">
          {t('register.policyPrefix')}
          <Button 
            variant="light" 
            size="sm" 
            className="px-1 h-auto min-w-0 text-xs text-primary"
            onPress={() => policyRef.current?.open('terms')}
          >
            {t('register.terms')}
          </Button>
          {t('register.policyAnd')}
          <Button 
            variant="light" 
            size="sm" 
            className="px-1 h-auto min-w-0 text-xs text-primary"
            onPress={() => policyRef.current?.open('privacy')}
          >
            {t('register.privacy')}
          </Button>
        </div>
      </div>

      <CaptchaModal ref={captchaRef} onVerify={handleCaptchaVerify} />
      <PolicyModal ref={policyRef} />
    </AuthLayout>
  )
}
