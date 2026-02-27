/**
 * SiteLogo - 网站图标组件
 * 一个书本 + 星星的知识库图标
 */

import { cn } from '@/utils'

interface SiteLogoProps {
  /** 图标尺寸 */
  size?: 'sm' | 'md' | 'lg'
  /** 自定义类名 */
  className?: string
}

const SIZE_MAP = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-10 h-10'
}

export function SiteLogo({ size = 'md', className }: SiteLogoProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(SIZE_MAP[size], className)}
      aria-label="知识库小破站"
    >
      {/* 书本主体 */}
      <path
        d="M4 6C4 4.89543 4.89543 4 6 4H14C15.1046 4 16 4.89543 16 6V26C16 27.1046 15.1046 28 14 28H6C4.89543 28 4 27.1046 4 26V6Z"
        className="fill-default-200 stroke-default-900"
        strokeWidth="1.5"
      />
      {/* 书本右侧页面 */}
      <path
        d="M16 6C16 4.89543 16.8954 4 18 4H26C27.1046 4 28 4.89543 28 6V26C28 27.1046 27.1046 28 26 28H18C16.8954 28 16 27.1046 16 26V6Z"
        className="fill-default-100 stroke-default-900"
        strokeWidth="1.5"
      />
      {/* 书脊 */}
      <line
        x1="16"
        y1="4"
        x2="16"
        y2="28"
        className="stroke-default-900"
        strokeWidth="1.5"
      />
      {/* 左侧书页线条 */}
      <line x1="7" y1="9" x2="13" y2="9" className="stroke-default-400" strokeWidth="1" strokeLinecap="round" />
      <line x1="7" y1="13" x2="13" y2="13" className="stroke-default-400" strokeWidth="1" strokeLinecap="round" />
      <line x1="7" y1="17" x2="11" y2="17" className="stroke-default-400" strokeWidth="1" strokeLinecap="round" />
      {/* 星星装饰 */}
      <path
        d="M22 8L22.5 9.5L24 10L22.5 10.5L22 12L21.5 10.5L20 10L21.5 9.5L22 8Z"
        className="fill-default-400"
      />
      <path
        d="M25 14L25.3536 15.1464L26.5 15.5L25.3536 15.8536L25 17L24.6464 15.8536L23.5 15.5L24.6464 15.1464L25 14Z"
        className="fill-default-300"
      />
    </svg>
  )
}

export default SiteLogo
