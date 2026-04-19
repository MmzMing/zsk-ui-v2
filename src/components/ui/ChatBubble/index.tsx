/**
 * ChatBubble 气泡聊天组件
 *
 * 实现微信/QQ 风格的左右布局聊天界面，支持：
 * - 打字机效果（逐字显示）
 * - 气泡弹出动画（弹簧动画）
 * - 滚动加速（滚动时自动加快打字速度）
 * - 视口触发（进入视口后自动开始动画）
 * - 可交互问题气泡（点击展开/收起回复）
 * - 独立懒加载（每个气泡单独检测视口）
 *
 * 使用全局主题色变量，自动适配深色/浅色主题
 *
 * @example
 * ```tsx
 * <ChatBubble
 *   items={chatItems}
 *   questions={faqQuestions}
 *   typingSpeed={40}
 * />
 * ```
 */

// ===== 1. 依赖导入区域 =====
import { useEffect, useRef, useState, useCallback, useMemo, memo, CSSProperties } from 'react'
import { motion } from 'framer-motion'
import { useUserStore } from '@/stores/user'

// ===== 2. 类型定义区域 =====

/** 消息角色类型 */
export type MessageRole = 'user' | 'bot'

/** 聊天消息接口 */
export interface ChatMessage {
  id: string
  role: MessageRole
  content: string
}

/** 分隔线接口 */
export interface ChatDivider {
  id: string
  type: 'divider'
  content: string
}

/** 聊天条目类型（消息或分隔线） */
export type ChatItem = (ChatMessage & { type: 'message' }) | ChatDivider

/** 可交互问题接口 */
export interface ChatQuestion {
  id: string
  label: string
  reply: string
}

/** 主组件 Props 接口 */
interface ChatBubbleProps {
  items: ChatItem[]
  questions?: ChatQuestion[]
  typingSpeed?: number
  className?: string
}

/** 气泡组件 Props 接口 */
interface BubbleItemProps {
  message: ChatMessage
  typingSpeed: number
  isAccelerated: boolean
}

/** 问题气泡组件 Props 接口 */
interface QuestionBubbleProps {
  question: ChatQuestion
  typingSpeed: number
  isAccelerated: boolean
}

// ===== 3. 样式常量区域 =====

/** 气泡基础样式（移除 backdropFilter，减少 GPU 合成层开销） */
const BUBBLE_BASE: CSSProperties = {
  maxWidth: 600,
  minWidth: 220,
  minHeight: 64,
  padding: '20px 28px',
  fontSize: 18,
  lineHeight: 1.7,
  wordBreak: 'break-word',
}

/** 用户气泡样式（深色背景，金色文字） */
const USER_BUBBLE_STYLE: CSSProperties = {
  ...BUBBLE_BASE,
  border: '1.5px solid var(--color-warning)',
  borderRadius: '20px 20px 5px 20px',
  color: 'var(--color-default-900)',
  transformOrigin: '100% 50%',
}

/** Bot 气泡样式（金色背景，黑色文字） */
const BOT_BUBBLE_STYLE: CSSProperties = {
  ...BUBBLE_BASE,
  border: '1px solid rgba(245, 165, 36, 0.8)',
  background: 'rgba(245, 165, 36, 0.65)',
  borderRadius: '20px 20px 20px 5px',
  color: '#000000',
  transformOrigin: '0% 50%',
}

/** 问题气泡激活样式（点击后高亮） */
const QUESTION_BUBBLE_ACTIVE_STYLE: CSSProperties = {
  ...USER_BUBBLE_STYLE,
  cursor: 'pointer',
  userSelect: 'none',
  background: 'rgba(245, 165, 36, 0.65)',
  color: 'var(--color-background)',
  transition: 'background 0.25s, color 0.25s',
}

/** 问题气泡默认样式 */
const QUESTION_BUBBLE_DEFAULT_STYLE: CSSProperties = {
  ...USER_BUBBLE_STYLE,
  cursor: 'pointer',
  userSelect: 'none',
  transition: 'background 0.25s, color 0.25s',
}

/** 气泡弹出动画参数（弹簧效果） */
const BUBBLE_SPRING = { type: 'spring' as const, stiffness: 280, damping: 20 }

/** 头像弹出动画参数（弹簧效果，比气泡稍快） */
const AVATAR_SPRING = { type: 'spring' as const, stiffness: 320, damping: 22 }

/** 气泡初始动画状态 */
const BUBBLE_INITIAL = { opacity: 0, scaleX: 0.08, scaleY: 0.3 }

/** 气泡显示动画状态 */
const BUBBLE_ANIMATE_VISIBLE = { opacity: 1, scaleX: 1, scaleY: 1 }

/** 气泡隐藏动画状态 */
const BUBBLE_ANIMATE_HIDDEN = { opacity: 0, scaleX: 0.08, scaleY: 0.3 }

/** 头像初始动画状态 */
const AVATAR_INITIAL = { opacity: 0, scale: 0 }

/** 头像显示动画状态 */
const AVATAR_ANIMATE_VISIBLE = { opacity: 1, scale: 1 }

/** 头像隐藏动画状态 */
const AVATAR_ANIMATE_HIDDEN = { opacity: 0, scale: 0 }

// 滚动加速配置
const ACCELERATED_SPEED = 2
const SPEED_RECOVER_DELAY = 300

// ===== 4. 工具 Hook 区域 =====

/**
 * 使用 IntersectionObserver 检测元素是否进入视窗
 */
function useInView(options: IntersectionObserverInit = {}) {
  const ref = useRef<HTMLDivElement>(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting)
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px',
      ...options,
    })

    const element = ref.current
    if (element) observer.observe(element)

    return () => observer.disconnect()
  }, [options])

  return [ref, isInView] as const
}

/**
 * 打字机效果 Hook
 *
 * 通过 speedRef 实时响应速度变化，无需重启动画
 * 支持加速模式，滚动时直接完成打字
 *
 * @param text - 要显示的文本内容
 * @param shouldStart - 是否开始打字动画
 * @param typingSpeed - 打字速度（毫秒/字符）
 * @param isAccelerated - 是否处于加速模式
 * @param resetKey - 重置键，变化时重新开始打字（用于收起再展开场景）
 */
function useTypewriter(
  text: string,
  shouldStart: boolean,
  typingSpeed: number,
  isAccelerated: boolean,
  resetKey?: number,
) {
  const [displayed, setDisplayed] = useState('')
  const [isDone, setIsDone] = useState(false)
  const startedRef = useRef(false)
  const indexRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const speedRef = useRef(typingSpeed)
  speedRef.current = typingSpeed

  useEffect(() => {
    startedRef.current = false
    indexRef.current = 0
    setDisplayed('')
    setIsDone(false)
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [resetKey])

  useEffect(() => {
    if (!shouldStart || startedRef.current) return

    startedRef.current = true
    indexRef.current = 0
    setDisplayed('')
    setIsDone(false)

    const tick = () => {
      if (indexRef.current < text.length) {
        const currentSpeed = isAccelerated ? ACCELERATED_SPEED : speedRef.current
        indexRef.current++
        setDisplayed(text.slice(0, indexRef.current))
        timerRef.current = setTimeout(tick, currentSpeed)
      } else {
        setIsDone(true)
      }
    }

    timerRef.current = setTimeout(tick, speedRef.current)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [shouldStart, text])

  useEffect(() => {
    if (isAccelerated && !isDone) {
      setDisplayed(text)
      setIsDone(true)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isAccelerated, text, isDone])

  return { displayed, isDone }
}

// ===== 5. 子组件区域 =====

/** Bot 头像图片 URL */
const BOT_AVATAR_URL = 'https://i.stardots.io/784774835/StarDots-2026041821090663484.jpg'

/**
 * Bot 头像组件（memo 避免父组件重渲染时重复渲染）
 */
const BotAvatar = memo(function BotAvatar() {
  return (
    <div
      className="flex-shrink-0 rounded-full overflow-hidden"
      style={{ width: 52, height: 52, marginRight: 14 }}
    >
      <img
        src={BOT_AVATAR_URL}
        alt="bot"
        className="w-full h-full object-cover"
        onError={(e) => {
          e.currentTarget.style.display = 'none'
          e.currentTarget.parentElement!.style.background = 'var(--color-content1)'
        }}
      />
    </div>
  )
})

/**
 * 用户头像组件（memo 避免父组件重渲染时重复渲染）
 *
 * 优先从 userStore 获取头像，若无则显示用户名首字母
 */
const UserAvatar = memo(function UserAvatar() {
  const userInfo = useUserStore((s) => s.userInfo)
  const avatar = userInfo?.avatar
  const name = userInfo?.name ?? 'U'

  return (
    <div
      className="flex-shrink-0 rounded-full overflow-hidden flex items-center justify-center"
      style={{
        width: 52,
        height: 52,
        marginLeft: 14,
        background: 'rgba(245, 165, 36, 0.2)',
        border: '2px solid var(--color-warning)',
      }}
    >
      {avatar ? (
        <img
          src={avatar}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
      ) : (
        <span className="text-base font-semibold" style={{ color: 'var(--color-warning)' }}>
          {name.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  )
})

/**
 * 打字光标组件（memo 避免重复创建动画实例）
 */
const TypingCursor = memo(function TypingCursor() {
  return (
    <motion.span
      className="inline-block w-0.5 bg-current ml-1 align-text-bottom"
      style={{ height: '1.1em' }}
      animate={{ opacity: [1, 0] }}
      transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
    />
  )
})

/**
 * 普通气泡组件（独立懒加载）
 *
 * @param message - 消息数据
 * @param typingSpeed - 打字速度
 * @param isAccelerated - 是否处于滚动加速模式
 */
const BubbleItem = memo(function BubbleItem({ message, typingSpeed, isAccelerated }: BubbleItemProps) {
  const isUser = message.role === 'user'
  const [ref, isInView] = useInView()
  const [avatarVisible, setAvatarVisible] = useState(false)
  const [bubbleVisible, setBubbleVisible] = useState(false)
  const [typingStarted, setTypingStarted] = useState(false)

  const { displayed, isDone } = useTypewriter(
    message.content,
    typingStarted,
    typingSpeed,
    isAccelerated,
  )

  useEffect(() => {
    if (!isInView) return

    setAvatarVisible(true)

    const t = setTimeout(() => {
      setBubbleVisible(true)
      requestAnimationFrame(() => setTypingStarted(true))
    }, 180)

    return () => clearTimeout(t)
  }, [isInView])

  if (!isInView) {
    return (
      <div ref={ref} className={`flex items-end ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className="flex-shrink-0" style={{ width: 52, height: 52, marginRight: isUser ? 0 : 14, marginLeft: isUser ? 14 : 0 }} />
        <div style={{ ...(isUser ? USER_BUBBLE_STYLE : BOT_BUBBLE_STYLE), opacity: 0 }} />
      </div>
    )
  }

  return (
    <motion.div
      ref={ref}
      className={`flex items-end ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' as const }}
    >
      <motion.div
        initial={AVATAR_INITIAL}
        animate={avatarVisible ? AVATAR_ANIMATE_VISIBLE : AVATAR_ANIMATE_HIDDEN}
        transition={AVATAR_SPRING}
      >
        {isUser ? <UserAvatar /> : <BotAvatar />}
      </motion.div>

      <motion.div
        style={isUser ? USER_BUBBLE_STYLE : BOT_BUBBLE_STYLE}
        initial={BUBBLE_INITIAL}
        animate={bubbleVisible ? BUBBLE_ANIMATE_VISIBLE : BUBBLE_ANIMATE_HIDDEN}
        transition={BUBBLE_SPRING}
      >
        {displayed}
        {typingStarted && !isDone && <TypingCursor />}
      </motion.div>
    </motion.div>
  )
})

/**
 * 分隔线组件（独立懒加载）
 *
 * @param content - 分隔线文字
 */
const DividerItem = memo(function DividerItem({ content }: { content: string }) {
  const [ref, isInView] = useInView()

  if (!isInView) {
    return <div ref={ref} className="flex items-center gap-5 my-3" style={{ opacity: 0, height: 24 }} />
  }

  return (
    <motion.div
      ref={ref}
      className="flex items-center gap-5 my-3"
      initial={{ opacity: 0, y: 10, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      <div className="flex-1 h-px" style={{ background: 'var(--color-divider)' }} />
      <span
        className="text-sm whitespace-nowrap px-2"
        style={{ color: 'var(--color-warning)', letterSpacing: '0.05em' }}
      >
        {content}
      </span>
      <div className="flex-1 h-px" style={{ background: 'var(--color-divider)' }} />
    </motion.div>
  )
})

/**
 * 可交互问题气泡组件（独立懒加载）
 *
 * 点击问题气泡可展开/收起 Bot 回复，带有平滑的高度动画
 * 收起后再次展开会重新播放打字机动画
 *
 * @param question - 问题数据
 * @param typingSpeed - 打字速度
 * @param isAccelerated - 是否处于滚动加速模式
 */
const QuestionBubble = memo(function QuestionBubble({
  question,
  typingSpeed,
  isAccelerated,
}: QuestionBubbleProps) {
  const [ref, isInView] = useInView()
  const [avatarVisible, setAvatarVisible] = useState(false)
  const [bubbleVisible, setBubbleVisible] = useState(false)
  const [replyOpen, setReplyOpen] = useState(false)
  const [replyAvatarVisible, setReplyAvatarVisible] = useState(false)
  const [replyBubbleVisible, setReplyBubbleVisible] = useState(false)
  const [replyTypingStarted, setReplyTypingStarted] = useState(false)
  const [replyResetKey, setReplyResetKey] = useState(0)

  const { displayed, isDone } = useTypewriter(
    question.reply,
    replyTypingStarted,
    typingSpeed,
    isAccelerated,
    replyResetKey,
  )

  useEffect(() => {
    if (!isInView) return

    setAvatarVisible(true)
    const t = setTimeout(() => setBubbleVisible(true), 180)

    return () => clearTimeout(t)
  }, [isInView])

  const handleToggle = useCallback(() => {
    if (!replyOpen) {
      setReplyOpen(true)
      setReplyAvatarVisible(true)
      setReplyResetKey((k) => k + 1)
      setReplyTypingStarted(false)

      setTimeout(() => {
        setReplyBubbleVisible(true)
        requestAnimationFrame(() => setReplyTypingStarted(true))
      }, 180)
    } else {
      setReplyOpen(false)
      setReplyBubbleVisible(false)
      setReplyAvatarVisible(false)
      setReplyTypingStarted(false)
    }
  }, [replyOpen])

  const questionBubbleStyle = replyOpen ? QUESTION_BUBBLE_ACTIVE_STYLE : QUESTION_BUBBLE_DEFAULT_STYLE

  if (!isInView) {
    return (
      <div ref={ref} className="flex flex-col">
        <div className="flex items-end flex-row-reverse">
          <div className="flex-shrink-0" style={{ width: 52, height: 52, marginLeft: 14 }} />
          <div style={{ ...QUESTION_BUBBLE_DEFAULT_STYLE, opacity: 0 }} />
        </div>
      </div>
    )
  }

  return (
    <div ref={ref} className="flex flex-col">
      <motion.div
        className="flex items-end flex-row-reverse"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' as const }}
      >
        <motion.div
          initial={AVATAR_INITIAL}
          animate={avatarVisible ? AVATAR_ANIMATE_VISIBLE : AVATAR_ANIMATE_HIDDEN}
          transition={AVATAR_SPRING}
        >
          <UserAvatar />
        </motion.div>

        <motion.div
          style={questionBubbleStyle}
          initial={BUBBLE_INITIAL}
          animate={bubbleVisible ? BUBBLE_ANIMATE_VISIBLE : BUBBLE_ANIMATE_HIDDEN}
          transition={BUBBLE_SPRING}
          onClick={bubbleVisible ? handleToggle : undefined}
          whileHover={bubbleVisible ? { scale: 1.02 } : {}}
          whileTap={bubbleVisible ? { scale: 0.98 } : {}}
        >
          {question.label}
        </motion.div>
      </motion.div>

      <motion.div
        initial={false}
        animate={{
          height: replyOpen ? 'auto' : 0,
          opacity: replyOpen ? 1 : 0,
          marginTop: replyOpen ? 24 : 0,
        }}
        transition={{ duration: 0.42, ease: [0.4, 0, 0.2, 1] }}
        style={{ overflow: 'hidden' }}
      >
        <div className="flex items-end flex-row">
          <motion.div
            initial={AVATAR_INITIAL}
            animate={replyAvatarVisible ? AVATAR_ANIMATE_VISIBLE : AVATAR_ANIMATE_HIDDEN}
            transition={AVATAR_SPRING}
          >
            <BotAvatar />
          </motion.div>

          <motion.div
            style={BOT_BUBBLE_STYLE}
            initial={BUBBLE_INITIAL}
            animate={replyBubbleVisible ? BUBBLE_ANIMATE_VISIBLE : BUBBLE_ANIMATE_HIDDEN}
            transition={BUBBLE_SPRING}
          >
            {isDone ? question.reply : displayed}
            {replyTypingStarted && !isDone && <TypingCursor />}
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
})

// ===== 6. 主组件区域 =====

/**
 * ChatBubble 主组件
 *
 * 整合所有子组件，实现完整的聊天界面
 *
 * @param items - 聊天消息列表
 * @param questions - 可交互问题列表（可选）
 * @param typingSpeed - 打字速度（毫秒/字符），默认 40
 * @param className - 自定义类名
 */
export function ChatBubble({
  items,
  questions = [],
  typingSpeed = 40,
  className = '',
}: ChatBubbleProps) {
  const allEntries = useMemo(
    () => [
      ...items.map((item) => ({ kind: 'item' as const, data: item })),
      ...questions.map((q) => ({ kind: 'question' as const, data: q })),
    ],
    [items, questions],
  )

  const [isAccelerated, setIsAccelerated] = useState(false)
  const speedResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isAcceleratingRef = useRef(false)

  useEffect(() => {
    const handleScroll = () => {
      if (!isAcceleratingRef.current) {
        isAcceleratingRef.current = true
        setIsAccelerated(true)
      }

      if (speedResetTimerRef.current) clearTimeout(speedResetTimerRef.current)
      speedResetTimerRef.current = setTimeout(() => {
        isAcceleratingRef.current = false
        setIsAccelerated(false)
      }, SPEED_RECOVER_DELAY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (speedResetTimerRef.current) clearTimeout(speedResetTimerRef.current)
    }
  }, [])

  return (
    <div className={`relative w-full ${className}`}>
      <div className="flex flex-col gap-10 w-full px-6 py-8">
        {allEntries.map((entry) => {
          if (entry.kind === 'item') {
            const item = entry.data

            if (item.type === 'divider') {
              return <DividerItem key={item.id} content={item.content} />
            }

            return (
              <BubbleItem
                key={item.id}
                message={item}
                typingSpeed={typingSpeed}
                isAccelerated={isAccelerated}
              />
            )
          }

          return (
            <QuestionBubble
              key={entry.data.id}
              question={entry.data}
              typingSpeed={typingSpeed}
              isAccelerated={isAccelerated}
            />
          )
        })}
      </div>
    </div>
  )
}

export default ChatBubble