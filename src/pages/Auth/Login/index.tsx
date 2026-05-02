/**
 * 登录页面 - 无密码邮箱登录版本
 * 
 * 功能：提供用户登录入口，支持第三方登录和无密码邮箱登录
 * 流程：输邮箱 -> 过人机 -> 点邮箱链接 -> 直接登录（后端写Cookie）
 */

// ===== 1. 依赖导入区域 =====
import { useState, useRef } from 'react'
import { Button, Input, Divider } from '@heroui/react'
import { InteractiveHoverButton } from '@/components/ui/magicui/InteractiveHoverButton'
import { useTranslation } from 'react-i18next'
import { Github } from 'lucide-react'
import { FaQq, FaWeixin } from 'react-icons/fa'
import { Turnstile } from '@marsidev/react-turnstile'
import { PolicyModal, type PolicyModalRef } from '@/components/auth'
import { getThirdPartyUrl, sendMagicLink } from '@/api/auth'
import { toast } from '@/utils/toast'
import { validateEmail } from '@/utils/validate'
import { AuthLayout } from '../AuthLayout'
import { useNavigate } from 'react-router-dom'

export default function LoginPage() {
  // ===== 3. 状态控制逻辑区域 =====
  const { t } = useTranslation('auth')
  const navigate = useNavigate()
  
  const policyRef = useRef<PolicyModalRef>(null)
  
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  
  // Cloudflare Turnstile 人机校验状态
  const [turnstileToken, setTurnstileToken] = useState('')
  
  const [formData, setFormData] = useState({
    email: ''
  })
  
  const [errors, setErrors] = useState({
    email: ''
  })
  
  // 邮箱输入框聚焦状态
  const [isEmailFocused, setIsEmailFocused] = useState(false)

  // ===== 4. 通用工具函数区域 =====

  /**
   * 校验邮箱格式
   * @param email - 邮箱地址
   */
  const validateEmailField = (email: string) => {
    let error = ''
    if (!email) {
      error = t('login.emailRequired')
    } else if (!validateEmail(email)) {
      error = t('validation.emailInvalid')
    }
    setErrors(prev => ({ ...prev, email: error }))
    return !error
  }

  /**
   * 处理表单输入变化
   * @param key - 字段名
   * @param value - 字段值
   */
  const handleInputChange = (key: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [key]: value }))
    
    // 如果已经有错误，尝试清除
    if (errors[key as keyof typeof errors]) {
      if (typeof value === 'string') {
        validateEmailField(value)
      }
    }
  }

  // ===== 7. 数据处理函数区域 =====

  /**
   * 处理发送登录邮件
   * 流程：校验邮箱 -> 检查人机校验 -> 发送魔法链接
   */
  const handleSendLoginEmail = async () => {
    // 校验邮箱
    const isValid = validateEmailField(formData.email)
    if (!isValid) {
      return
    }
    
    // 校验 Turnstile 是否完成
    if (!turnstileToken) {
      toast.error(t('turnstile.verificationRequired'))
      return
    }
    
    setLoading(true)
    try {
      // 发送魔法链接（直接使用 turnstileToken）
      await sendMagicLink({
        email: formData.email,
        turnstileToken: turnstileToken
      })
      
      setEmailSent(true)
      toast.success(t('login.emailSent'))
    } catch (error) {
      console.error('发送登录邮件失败：', error)
      toast.error('发送魔法链接失败，请稍后重试')
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
      sessionStorage.setItem('loginType', type)
      const url = await getThirdPartyUrl(type)
      if (url) {
        window.location.href = url
      } else {
        toast.error('获取授权链接失败')
      }
    } catch {
      toast.error('获取授权链接失败')
    }
  }

  // ===== 11. 导出区域 =====
  return (
    <AuthLayout
      isTyping={isEmailFocused}
      showPassword={false}
      passwordLength={0}
    >
      <div className="space-y-8">
        {/* 移动端：知识库小破站 Logo */}
        <div className="flex justify-center lg:hidden">
          <button
            className="text-lg font-semibold text-primary hover:opacity-80 transition-opacity"
            onClick={() => navigate('/')}
          >
            {t('common.appName')}
          </button>
        </div>

        {/* 页面标题区域 */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{t('login.header')}</h1>
          <p className="text-default-500">{t('login.subtitle')}</p>
        </div>

        {/* 第三方登录按钮 - 放在上方 */}
        <div className="space-y-3">
          <Button
            variant="bordered"
            color="default"
            size="md"
            className="w-full px-4 gap-3 transition-all duration-200 hover:bg-default-100 hover:border-primary hover:shadow-md hover:-translate-y-0.5"
            onPress={() => handleThirdPartyLogin('github')}
          >
            <Github size={20} />
            <span className="font-medium">{t('login.github')}</span>
          </Button>
          
          <Button
            variant="bordered"
            color="default"
            size="md"
            className="w-full px-4 gap-3 transition-all duration-200 hover:bg-default-100 hover:border-primary hover:shadow-md hover:-translate-y-0.5"
            onPress={() => handleThirdPartyLogin('qq')}
          >
            <FaQq size={20} className="text-[#12B7F5]" />
            <span className="font-medium">{t('login.qq')}</span>
          </Button>
          
          <Button
            variant="bordered"
            color="default"
            size="md"
            className="w-full px-4 gap-3 transition-all duration-200 hover:bg-default-100 hover:border-primary hover:shadow-md hover:-translate-y-0.5"
            onPress={() => handleThirdPartyLogin('wechat')}
          >
            <FaWeixin size={20} className="text-[#07C160]" />
            <span className="font-medium">{t('login.wechat')}</span>
          </Button>
        </div>

        {/* 分隔线 */}
        <div className="flex items-center gap-4 w-full">
          <Divider className="flex-1" />
          <span className="text-tiny text-default-400 font-medium">{t('login.orContinue')}</span>
          <Divider className="flex-1" />
        </div>

        {/* 邮箱登录表单 */}
        {!emailSent ? (
          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSendLoginEmail(); }}>
            {/* 邮箱输入框 */}
            <Input
              label={t('login.email')}
              variant="flat"
              labelPlacement="outside"
              type="email"
              name="email"
              description={t('login.emailPlaceholder')}
              value={formData.email}
              onValueChange={(v) => handleInputChange('email', v)}
              isInvalid={!!errors.email}
              errorMessage={errors.email}
              onFocus={() => setIsEmailFocused(true)}
              onBlur={() => {
                setIsEmailFocused(false)
                validateEmailField(formData.email)
              }}
              autoComplete="email"
              validationBehavior="aria"
            />
            
            {/* Cloudflare Turnstile 人机校验 */}
            <div className="flex justify-center">
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
            
            {/* 登录按钮 */}
            <div className="flex justify-center">
              <InteractiveHoverButton
                type="submit"
                className="w-full"
                disabled={loading || !turnstileToken}
              >
                {loading ? t('login.sending') : t('login.submit')}
              </InteractiveHoverButton>
            </div>
          </form>
        ) : (
          /* 发送成功提示 */
          <div className="space-y-4 text-center">
            <div className="border border-default-200 rounded-lg p-6">
              <div className="flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-default-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-default-900 mb-1">{t('login.emailSent')}</h3>
              <p className="text-sm text-default-500">{t('login.checkEmail')}</p>
            </div>
            
            <Button
              variant="bordered"
              color="default"
              className="w-full border-default-200"
              onPress={() => {
                setEmailSent(false)
                setTurnstileToken('')
              }}
            >
              重新发送
            </Button>
          </div>
        )}

        {/* 页脚隐私协议 */}
        <div className="pt-6 border-t border-default-800 text-center text-xs text-default-400">
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