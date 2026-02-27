/**
 * 前台底部组件
 * 美观、简约的页脚设计
 */

import { Link } from 'react-router-dom'
import { Divider } from '@heroui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useMemo } from 'react'
import { 
  Mail, 
  MapPin, 
  Rss, 
  Github,
  Twitter,
  Shield,
  Send,
  BookOpen,
  FileText,
  Compass,
  Info
} from 'lucide-react'
import { cn } from '@/utils'
import { SiteLogo } from '@/components/ui/SiteLogo'

// 底部链接项类型
interface FooterLink {
  label: string
  href: string
  icon?: React.ReactNode
  external?: boolean
}

// 底部分组类型
interface FooterSection {
  title: string
  links: FooterLink[]
}

// 社交链接类型
interface SocialLink {
  icon: React.ReactNode
  href: string
  label: string
}

// 前台底部属性
interface FrontFooterProps {
  /** 自定义底部链接分组 */
  sections?: FooterSection[]
  /** 自定义社交链接 */
  socialLinks?: SocialLink[]
  /** 网站名称 */
  siteName?: string
  /** 网站描述 */
  siteDescription?: string
  /** 备案号 */
  icp?: string
  /** 公安备案号 */
  policeIcp?: string
  className?: string
}

export default function FrontFooter({
  sections,
  socialLinks,
  siteName = '知识库小破站',
  siteDescription = '分享知识，记录成长。一个专注于技术分享与学习的知识平台。',
  icp = '',
  policeIcp = '',
  className
}: FrontFooterProps) {
  const { t } = useTranslation(['navigation', 'common'])
  const currentYear = new Date().getFullYear()

  // 默认底部链接
  const defaultSections = useMemo<FooterSection[]>(() => [
    {
      title: t('footer.browse'),
      links: [
        { label: t('footer.home'), href: '/', icon: <BookOpen className="w-4 h-4" /> },
        { label: t('footer.articles'), href: '/articles', icon: <FileText className="w-4 h-4" /> },
        { label: t('footer.categories'), href: '/categories', icon: <Compass className="w-4 h-4" /> },
        { label: t('footer.about'), href: '/about', icon: <Info className="w-4 h-4" /> }
      ]
    },
    {
      title: t('footer.law'),
      links: [
        { label: t('footer.privacy'), href: '/privacy', icon: <Shield className="w-4 h-4" /> },
        { label: t('footer.terms'), href: '/terms', icon: <FileText className="w-4 h-4" /> }
      ]
    },
    {
      title: t('footer.contact'),
      links: [
        { label: t('footer.feedback'), href: '/feedback', icon: <Send className="w-4 h-4" /> },
        { label: t('footer.cooperation'), href: '/cooperation', icon: <Mail className="w-4 h-4" /> }
      ]
    }
  ], [t])

  // 默认社交链接
  const defaultSocialLinks = useMemo<SocialLink[]>(() => [
    { icon: <Github className="w-5 h-5" />, href: 'https://github.com', label: 'GitHub' },
    { icon: <Twitter className="w-5 h-5" />, href: 'https://twitter.com', label: 'Twitter' },
    { icon: <Mail className="w-5 h-5" />, href: 'mailto:contact@example.com', label: 'Email' }
  ], [])

  const currentSections = sections || defaultSections
  const currentSocialLinks = socialLinks || defaultSocialLinks

  // 渲染链接
  const renderLink = (link: FooterLink) => {
    const content = (
      <>
        {link.icon && <span className="opacity-60 text-inherit">{link.icon}</span>}
        <span className="text-inherit">{link.label}</span>
      </>
    )

    if (link.external) {
      return (
        <a
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 !text-default-500 hover:!text-default-900 transition-colors text-sm py-1 !no-underline"
        >
          {content}
        </a>
      )
    }

    return (
      <Link
        to={link.href}
        className="flex items-center gap-2 !text-default-500 hover:!text-default-900 transition-colors text-sm py-1 !no-underline"
      >
        {content}
      </Link>
    )
  }

  return (
    <footer
      className={cn(
        'w-full bg-background border-t border-divider/50',
        className
      )}
    >
      <div className="container mx-auto px-4">
        {/* 主要内容区域 */}
        <div className="py-16">
          {/* 顶部品牌区域 */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-10 mb-12">
            {/* 品牌信息 */}
            <div className="max-w-sm">
              <Link to="/" className="inline-flex items-center gap-3 mb-4 !no-underline">
                <SiteLogo size="lg" />
                <span className="text-2xl font-bold !text-default-900">
                  {siteName}
                </span>
              </Link>
              <p className="text-default-500 text-sm leading-relaxed mb-6">
                {siteDescription}
              </p>

              {/* 联系信息 */}
              <div className="flex flex-col gap-3">
                <a
                  href="mailto:contact@example.com"
                  className="flex items-center gap-3 text-sm !text-default-600 hover:!text-default-900 transition-colors group !no-underline"
                >
                  <Mail className="w-5 h-5 !text-default-400 group-hover:!text-default-900 transition-colors" />
                  <span className="text-inherit">contact@example.com</span>
                </a>
                <div className="flex items-center gap-3 text-sm text-default-600">
                  <MapPin className="w-5 h-5 !text-default-400" />
                  <span>{t('common:footer.location')}</span>
                </div>
              </div>
            </div>

            {/* 链接分组 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 lg:gap-16">
              {currentSections.map((section, sectionIndex) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: sectionIndex * 0.1 }}
                  viewport={{ once: true }}
                >
                  <h4 className="font-semibold text-default-900 mb-4 flex items-center gap-2">
                    <span className="w-1 h-4 rounded-full bg-default-900" />
                    {section.title}
                  </h4>
                  <nav className="flex flex-col gap-1">
                    {section.links.map((link) => (
                      <div key={link.label}>
                        {renderLink(link)}
                      </div>
                    ))}
                  </nav>
                </motion.div>
              ))}
            </div>
          </div>

          {/* 社交链接和订阅 */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pt-8 border-t border-divider/50">
            {/* 社交链接 */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-default-500 mr-2">{t('common:footer.followUs')}</span>
              {currentSocialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="!text-default-400 hover:!text-default-900 transition-all !no-underline"
                  title={social.label}
                >
                  <span className="text-inherit">{social.icon}</span>
                </motion.a>
              ))}
            </div>

            {/* 右侧信息 */}
            <div className="flex items-center gap-4 text-sm text-default-500">
              {icp && (
                <a
                  href="https://beian.miit.gov.cn/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:!text-default-900 transition-colors !no-underline !text-default-500"
                >
                  {icp}
                </a>
              )}
              <a
                href="/rss"
                className="flex items-center gap-1.5 hover:!text-default-900 transition-colors !no-underline !text-default-500"
              >
                <Rss className="w-4 h-4" />
                <span>RSS</span>
              </a>
            </div>
          </div>
        </div>

        {/* 底部版权区域 */}
        <Divider className="mb-0" />

        <div className="py-4 flex flex-col items-center justify-center gap-2 text-sm text-default-500">
          <span>&copy; {currentYear} {siteName}</span>
          {/* 备案信息 */}
          {(icp || policeIcp) && (
            <div className="flex items-center justify-center gap-2 flex-wrap text-xs text-default-400">
              {icp && (
                <a
                  href="https://beian.miit.gov.cn/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:!text-default-900 transition-colors !no-underline !text-default-400"
                >
                  {icp}
                </a>
              )}
              {icp && policeIcp && <span>·</span>}
              {policeIcp && (
                <a
                  href="https://www.gov.cn/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:!text-default-900 transition-colors !no-underline !text-default-400"
                >
                  {policeIcp}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </footer>
  )
}
