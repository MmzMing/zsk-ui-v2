import { useState, useRef, useEffect } from 'react'
import { Input, Button } from '@heroui/react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Stepper, Step } from '@/components/ui/reactbits'
import { CaptchaModal, type CaptchaModalRef } from '@/components/auth'
import { sendPasswordResetCode, verifyResetCode, resetPassword } from '@/api/auth'
import { toast } from '@/utils/toast'
import { Mail, Lock, ShieldCheck, ArrowLeft } from 'lucide-react'

export default function ForgotPasswordPage() {
  const { t } = useTranslation('auth')
  const navigate = useNavigate()
  const captchaRef = useRef<CaptchaModalRef>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  
  // 表单状态
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [verifyToken, setVerifyToken] = useState('')
  
  // 倒计时
  const [countdown, setCountdown] = useState(0)

  // 发送验证码逻辑
  const handleSendCode = async () => {
    if (!email) {
      toast.error(t('forgotPassword.emailRequired'))
      return
    }
    // 打开滑块验证
    captchaRef.current?.open()
  }

  // 滑块验证通过回调
  const handleCaptchaVerify = async (verification: string) => {
    await sendPasswordResetCode({
      email,
      captchaVerification: verification
    })
    toast.success(t('forgotPassword.codeSent'))
    setCountdown(60)
  }

  // 倒计时效果
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [countdown])

  // 下一步校验
  const handleStepChange = async (step: number) => {
    // 第一步：验证邮箱和验证码
    if (step === 2 && currentStep === 1) {
      if (!email || !code) {
        toast.error(t('forgotPassword.infoRequired'))
        return
      }
      setLoading(true)
      try {
        const token = await verifyResetCode({ email, code })
        setVerifyToken(token)
        setCurrentStep(2)
      } catch (error) {
        console.error('验证码校验失败：', error)
      } finally {
        // toast 在 api 层已经提示了
        setLoading(false)
      }
    }
    // 其他步骤切换（这里主要是回退）
    else {
      setCurrentStep(step)
    }
  }

  // 提交重置密码
  const handleSubmit = async () => {
    if (!password || !confirmPassword) {
      toast.error(t('forgotPassword.passwordRequired'))
      return
    }
    if (password !== confirmPassword) {
      toast.error(t('forgotPassword.passwordMismatch'))
      return
    }

    setLoading(true)
    try {
      await resetPassword({
        email,
        verifyToken,
        newPassword: password // 这里后端要求 RSA 加密，后续根据需要接入加密库
      })
      toast.success(t('forgotPassword.success'))
      navigate('/login')
    } catch (error) {
      console.error('重置密码失败：', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-content2/20">
      <div className="w-full max-w-lg p-8 bg-content1 rounded-2xl shadow-xl">
        <div className="mb-8 text-center relative">
          <Button 
            isIconOnly 
            variant="light" 
            className="absolute left-0 top-0" 
            onPress={() => navigate('/login')}
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold">{t('forgotPassword.title')}</h1>
          <p className="text-default-500 text-sm mt-2">{t('forgotPassword.subtitle')}</p>
        </div>

        <Stepper
          initialStep={1}
          onStepChange={handleStepChange}
          onFinalStepCompleted={handleSubmit}
          backButtonText={t('forgotPassword.prevStep')}
          nextButtonText={t('forgotPassword.nextStep')}
          isNextDisabled={loading}
          isLoading={loading}
          disableStepIndicators={true} // 禁止点击步骤条切换
        >
          {/* 第一步：验证身份 */}
          <Step>
            <div className="space-y-6 py-4">
              <Input
                label={t('forgotPassword.email')}
                placeholder={t('forgotPassword.emailPlaceholder')}
                value={email}
                onValueChange={setEmail}
                startContent={<Mail className="text-default-400" size={20} />}
                variant="bordered"
              />
              <div className="flex gap-4">
                <Input
                  label={t('forgotPassword.code')}
                  placeholder={t('forgotPassword.codePlaceholder')}
                  value={code}
                  onValueChange={setCode}
                  startContent={<ShieldCheck className="text-default-400" size={20} />}
                  variant="bordered"
                  className="flex-1"
                />
                <Button 
                  color="primary" 
                  variant="flat" 
                  className="h-14 w-32"
                  onPress={handleSendCode}
                  isDisabled={countdown > 0 || !email}
                >
                  {countdown > 0 ? t('common.seconds', { count: countdown }) : t('common.getCode')}
                </Button>
              </div>
            </div>
          </Step>

          {/* 第二步：重置密码 */}
          <Step>
            <div className="space-y-6 py-4">
              <Input
                label={t('forgotPassword.newPassword')}
                placeholder={t('forgotPassword.newPasswordPlaceholder')}
                type="password"
                value={password}
                onValueChange={setPassword}
                startContent={<Lock className="text-default-400" size={20} />}
                variant="bordered"
              />
              <Input
                label={t('forgotPassword.confirmPassword')}
                placeholder={t('forgotPassword.confirmPasswordPlaceholder')}
                type="password"
                value={confirmPassword}
                onValueChange={setConfirmPassword}
                startContent={<Lock className="text-default-400" size={20} />}
                variant="bordered"
                isInvalid={confirmPassword !== '' && password !== confirmPassword}
                errorMessage={confirmPassword !== '' && password !== confirmPassword ? t('forgotPassword.passwordMismatch') : ""}
              />
            </div>
          </Step>
        </Stepper>

        <CaptchaModal ref={captchaRef} onVerify={handleCaptchaVerify} />
      </div>
    </div>
  )
}
