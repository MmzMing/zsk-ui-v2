/**
 * 关于博主页面 — 数据定义
 *
 * 包含技术栈列表、热力图数据、赞助商列表、对话数据
 */

import type { ChatItem, ChatQuestion } from '@/components/ui/ChatBubble'

/** 技术栈图标项 */
export interface TechStackItem {
  /** 图标名称（lucide-react 图标 key 或 react-icons 路径） */
  icon: string
  /** 技术名称 */
  name: string
  /** 图标来源 */
  source: 'lucide' | 'react-icons'
  /** 颜色（CSS 变量或 hex） */
  color: string
}

/** 热力图活动等级 */
export type HeatmapLevel = 0 | 1 | 2 | 3 | 4

/** 热力图数据项 */
export interface HeatmapDay {
  /** 日期 YYYY-MM-DD */
  date: string
  /** 活动等级 0-4 */
  level: HeatmapLevel
  /** 描述文案 */
  desc: string
}

/** 赞助商信息 */
export interface SponsorItem {
  /** 名称 */
  name: string
  /** logo URL（可选） */
  logo?: string
  /** 跳转链接 */
  url: string
}

/** 社交链接 */
export interface SocialLink {
  /** 图标名称 */
  icon: string
  /** 链接 */
  url: string
  /** 来源 */
  source: 'lucide' | 'react-icons'
}

// ===== 技术栈列表 =====

export const TECH_STACK_ITEMS: TechStackItem[] = [
  { icon: 'Coffee', name: 'Java', source: 'lucide', color: '#ED8B00' },
  { icon: 'SiSpringboot', name: 'Spring Boot', source: 'react-icons', color: '#6DB33F' },
  { icon: 'Database', name: 'MySQL', source: 'lucide', color: '#4479A1' },
  { icon: 'Code2', name: 'React', source: 'lucide', color: '#61DAFB' },
  { icon: 'FileType', name: 'TypeScript', source: 'lucide', color: '#3178C6' },
  { icon: 'Server', name: 'Docker', source: 'lucide', color: '#2496ED' },
  { icon: 'Box', name: 'Redis', source: 'lucide', color: '#DC382D' },
  { icon: 'Wind', name: 'Kafka', source: 'lucide', color: '#231F20' },
  { icon: 'GitBranch', name: 'MyBatis', source: 'lucide', color: '#C23B22' },
  { icon: 'GitMerge', name: 'Git', source: 'lucide', color: '#F05032' },
  { icon: 'Terminal', name: 'Linux', source: 'lucide', color: '#FCC624' },
  { icon: 'Globe', name: 'Nginx', source: 'lucide', color: '#009639' },
  { icon: 'Paintbrush', name: 'TailwindCSS', source: 'lucide', color: '#06B6D4' },
  { icon: 'Hexagon', name: 'Node.js', source: 'lucide', color: '#339933' },
  { icon: 'Zap', name: 'Vite', source: 'lucide', color: '#646CFF' },
  { icon: 'Layers', name: 'Vue', source: 'lucide', color: '#4FC08D' },
  { icon: 'Cloud', name: 'Spring Cloud', source: 'lucide', color: '#6DB33F' },
  { icon: 'Shield', name: 'Spring Security', source: 'lucide', color: '#6DB33F' },
  { icon: 'Braces', name: 'Gradle', source: 'lucide', color: '#02303A' },
  { icon: 'LayoutDashboard', name: 'Hibernate', source: 'lucide', color: '#59666C' },
]

// ===== 热力图 mock 数据 =====

/** 生成过去一年的热力图数据 */
export function generateHeatmapData(): HeatmapDay[] {
  const data: HeatmapDay[] = []
  const now = new Date()
  const startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())

  const descriptions = [
    '发布了一篇技术博客',
    '提交了代码优化',
    '学习了新框架',
    '修复了一个 Bug',
    '参与了开源贡献',
    '完成了项目重构',
    '分享了技术心得',
  ]

  let currentDate = new Date(startDate)
  while (currentDate <= now) {
    const dayOfWeek = currentDate.getDay()
    // 周末活动较少
    const baseActivity = dayOfWeek === 0 || dayOfWeek === 6 ? 0.3 : 0.6
    // 近期活动更多
    const monthProgress = (currentDate.getMonth() + 1) / 12
    const recentBoost = monthProgress > 0.8 ? 0.3 : 0
    const rand = Math.random()
    const activity = rand * baseActivity + recentBoost

    let level: HeatmapLevel
    if (activity < 0.15) level = 0
    else if (activity < 0.35) level = 1
    else if (activity < 0.55) level = 2
    else if (activity < 0.75) level = 3
    else level = 4

    data.push({
      date: currentDate.toISOString().split('T')[0],
      level,
      desc: level > 0 ? descriptions[Math.floor(Math.random() * descriptions.length)] : '',
    })

    currentDate.setDate(currentDate.getDate() + 1)
  }

  return data
}

// ===== 赞助商 mock 数据 =====

export const SPONSOR_ITEMS: SponsorItem[] = [
  {
    name: 'StarDots',
    url: 'https://stardots.io',
  },
  {
    name: '智数科云',
    url: 'https://zsk.cloud',
  },
  {
    name: 'JetBrains',
    url: 'https://jetbrains.com',
  },
]

// ===== 社交链接 =====

export const SOCIAL_LINKS: SocialLink[] = [
  { icon: 'Github', url: 'https://github.com/mmming', source: 'lucide' },
  { icon: 'SiBilibili', url: 'https://space.bilibili.com/784774835', source: 'react-icons' },
  { icon: 'Mail', url: 'mailto:contact@zsk.cloud', source: 'lucide' },
]

// ===== 对话数据 =====

export const ABOUT_CHAT_ITEMS: ChatItem[] = [
  { id: '1', type: 'message', role: 'bot', content: '你好！我是知识库小破站的博主，一个热爱技术分享的全栈开发者。' },
  { id: '2', type: 'message', role: 'user', content: '你主要做哪些技术方向？' },
  { id: '3', type: 'message', role: 'bot', content: '我主要专注于 Java 后端开发（Spring Boot / Spring Cloud），同时也在做前端（React + TypeScript）和运维（Docker / K8s）。' },
  { id: '4', type: 'message', role: 'user', content: '这个网站是怎么搭建的？' },
  { id: '5', type: 'message', role: 'bot', content: '前端使用 React 19 + Vite 7 + HeroUI，后端基于 Spring Boot，部署在 Docker 容器中。整个项目从设计到上线都是一个人完成的。' },
  { id: '6', type: 'divider', content: '了解更多' },
]

export const ABOUT_CHAT_QUESTIONS: ChatQuestion[] = [
  {
    id: 'q1',
    label: '你有什么开源项目吗？',
    reply: '目前知识库小破站的前端代码已经在 GitHub 上开源，还有一些 Spring Boot 的工具类库正在整理中，敬请期待！',
  },
  {
    id: 'q2',
    label: '如何联系你合作？',
    reply: '可以通过邮件 contact@zsk.cloud 或者 GitHub Issues 联系我，欢迎技术交流、项目合作和广告赞助。',
  },
  {
    id: 'q3',
    label: '你平时在哪里直播？',
    reply: '我在 B站直播间进行技术分享和编程直播，主要讲解 Spring Boot 实战和前端开发技巧。关注我的 B站账号可以收到开播提醒！',
  },
]

// ===== B站直播间配置 =====

/** B站直播间房间号 */
export const BILIBILI_ROOM_ID = '784774835'

/** B站直播间 URL */
export const BILIBILI_LIVE_URL = `https://live.bilibili.com/${BILIBILI_ROOM_ID}`