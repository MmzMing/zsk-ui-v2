/**
 * ChatBubble 气泡聊天组件
 * 
 * 实现微信/QQ 风格的左右布局聊天界面，支持：
 * - 打字机效果（逐字显示）
 * - 气泡弹出动画（弹簧动画）
 * - 滚动加速（滚动时自动加快打字速度）
 * - 视口触发（进入视口后自动开始动画）
 * - 可交互问题气泡（点击展开/收起回复）
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
import { useEffect, useRef, useState, useCallback, CSSProperties } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  itemDelay?: number
  className?: string
}

/** 气泡组件 Props 接口 */
interface BubbleItemProps {
  message: ChatMessage
  visible: boolean
  typingSpeed: number
}

/** 问题气泡组件 Props 接口 */
interface QuestionBubbleProps {
  question: ChatQuestion
  visible: boolean
  typingSpeed: number
}

// ===== 3. 样式常量区域 =====

/** 气泡基础样式 */
const BUBBLE_BASE: CSSProperties = {
  maxWidth: 600,
  minWidth: 220,
  minHeight: 64,
  padding: '20px 28px',
  fontSize: 18,
  lineHeight: 1.7,
  wordBreak: 'break-word',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
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
  border: '1px solid rgba(245, 165, 36,)',
  background: 'rgba(245, 165, 36, 0.65)',
  borderRadius: '20px 20px 20px 5px',
  color: '#000000',
  transformOrigin: '0% 50%',
}

/** 气泡弹出动画参数（弹簧效果） */
const BUBBLE_SPRING = { type: 'spring' as const, stiffness: 280, damping: 20 }

/** 头像弹出动画参数（弹簧效果，比气泡稍快） */
const AVATAR_SPRING = { type: 'spring' as const, stiffness: 320, damping: 22 }

// ===== 4. 工具 Hook 区域 =====

/**
 * 打字机效果 Hook
 * 
 * @param text - 要显示的文本内容
 * @param shouldStart - 是否开始打字动画
 * @param typingSpeed - 打字速度（毫秒/字符）
 * @returns {object} - 包含显示文本和完成状态
 */
function useTypewriter(text: string, shouldStart: boolean, typingSpeed: number) {
  const [displayed, setDisplayed] = useState('')
  const [isDone, setIsDone] = useState(false)
  const startedRef = useRef(false)
  const indexRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const speedRef = useRef(typingSpeed)
  
  speedRef.current = typingSpeed

  useEffect(() => {
    if (!shouldStart || startedRef.current) return
    
    startedRef.current = true
    indexRef.current = 0
    setDisplayed('')
    setIsDone(false)

    const tick = () => {
      if (indexRef.current < text.length) {
        indexRef.current++
        setDisplayed(text.slice(0, indexRef.current))
        timerRef.current = setTimeout(tick, speedRef.current)
      } else {
        setIsDone(true)
      }
    }

    timerRef.current = setTimeout(tick, speedRef.current)
    
    return () => { 
      if (timerRef.current) clearTimeout(timerRef.current) 
    }
  }, [shouldStart])

  return { displayed, isDone }
}

// ===== 5. 子组件区域 =====

/** Bot 头像图片 URL */
const BOT_AVATAR_URL = 'https://i.stardots.io/784774835/StarDots-2026041821090663484.jpg'

/**
 * Bot 头像组件
 * 
 * @returns {JSX.Element} - Bot 头像元素
 */
function BotAvatar() {
  return (
    <div
      className="flex-shrink-0 rounded-full overflow-hidden"
      style={{
        width: 52,
        height: 52,
        marginRight: 14,
      }}
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
}

/**
 * 用户头像组件
 * 
 * 优先从 userStore 获取头像，若无则显示用户名首字母
 * 
 * @returns {JSX.Element} - 用户头像元素
 */
function UserAvatar() {
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
          onError={(e) => { e.currentTarget.style.display = 'none' }}
        />
      ) : (
        <span className="text-base font-semibold" style={{ color: 'var(--color-warning)' }}>
          {name.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  )
}

/**
 * 打字光标组件
 * 
 * 显示闪烁光标，模拟打字中效果
 * 
 * @returns {JSX.Element} - 光标元素
 */
function TypingCursor() {
  return (
    <motion.span
      className="inline-block w-0.5 bg-current ml-1 align-text-bottom"
      style={{ height: '1.1em' }}
      animate={{ opacity: [1, 0] }}
      transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
    />
  )
}

/**
 * 普通气泡组件
 * 
 * 渲染单条聊天消息，包含头像和气泡
 * 
 * @param message - 消息数据
 * @param visible - 是否可见（控制入场动画）
 * @param typingSpeed - 打字速度
 * @returns {JSX.Element} - 气泡元素
 */
function BubbleItem({ message, visible, typingSpeed }: BubbleItemProps) {
  const isUser = message.role === 'user'
  const [avatarVisible, setAvatarVisible] = useState(false)
  const [bubbleVisible, setBubbleVisible] = useState(false)
  const [typingStarted, setTypingStarted] = useState(false)

  const { displayed, isDone } = useTypewriter(message.content, typingStarted, typingSpeed)

  useEffect(() => {
    if (!visible) return
    
    setAvatarVisible(true)
    
    const t = setTimeout(() => {
      setBubbleVisible(true)
      requestAnimationFrame(() => setTypingStarted(true))
    }, 180)
    
    return () => clearTimeout(t)
  }, [visible])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={`flex items-end ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' as const }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={avatarVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
            transition={AVATAR_SPRING}
          >
            {isUser ? <UserAvatar /> : <BotAvatar />}
          </motion.div>

          <motion.div
            style={isUser ? USER_BUBBLE_STYLE : BOT_BUBBLE_STYLE}
            initial={{ opacity: 0, scaleX: 0.08, scaleY: 0.3 }}
            animate={bubbleVisible ? { opacity: 1, scaleX: 1, scaleY: 1 } : { opacity: 0, scaleX: 0.08, scaleY: 0.3 }}
            transition={BUBBLE_SPRING}
          >
            {displayed}
            {typingStarted && !isDone && <TypingCursor />}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * 分隔线组件
 * 
 * 用于分隔聊天内容区域
 * 
 * @param content - 分隔线文字
 * @param visible - 是否可见
 * @returns {JSX.Element} - 分隔线元素
 */
function DividerItem({ content, visible }: { content: string; visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
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
      )}
    </AnimatePresence>
  )
}

/**
 * 可交互问题气泡组件
 * 
 * 点击问题气泡可展开/收起 Bot 回复，带有平滑的高度动画
 * 
 * @param question - 问题数据
 * @param visible - 是否可见
 * @param typingSpeed - 打字速度
 * @returns {JSX.Element} - 问题气泡元素
 */
function QuestionBubble({ question, visible, typingSpeed }: QuestionBubbleProps) {
  const [avatarVisible, setAvatarVisible] = useState(false)
  const [bubbleVisible, setBubbleVisible] = useState(false)
  const [replyOpen, setReplyOpen] = useState(false)
  const [replyAvatarVisible, setReplyAvatarVisible] = useState(false)
  const [replyBubbleVisible, setReplyBubbleVisible] = useState(false)
  const [replyTypingStarted, setReplyTypingStarted] = useState(false)
  const [replyHeight, setReplyHeight] = useState(0)
  const replyContentRef = useRef<HTMLDivElement>(null)

  const { displayed, isDone } = useTypewriter(question.reply, replyTypingStarted, typingSpeed)

  useEffect(() => {
    if (!visible) return
    
    setAvatarVisible(true)
    const t = setTimeout(() => setBubbleVisible(true), 180)
    
    return () => clearTimeout(t)
  }, [visible])

  useEffect(() => {
    const el = replyContentRef.current
    if (!el) return
    
    const ro = new ResizeObserver(() => setReplyHeight(el.scrollHeight))
    ro.observe(el)
    
    return () => ro.disconnect()
  }, [])

  const handleToggle = useCallback(() => {
    if (!replyOpen) {
      setReplyOpen(true)
      setReplyAvatarVisible(true)
      
      setTimeout(() => {
        setReplyBubbleVisible(true)
        requestAnimationFrame(() => setReplyTypingStarted(true))
      }, 180)
    } else {
      if (replyContentRef.current) setReplyHeight(replyContentRef.current.scrollHeight)
      setReplyOpen(false)
      setReplyBubbleVisible(false)
      setReplyAvatarVisible(false)
    }
  }, [replyOpen])

  const questionBubbleStyle: CSSProperties = {
    ...USER_BUBBLE_STYLE,
    cursor: 'pointer',
    userSelect: 'none',
    background: replyOpen ? 'rgba(245, 165, 36, 0.65)' : USER_BUBBLE_STYLE.background as string,
    color: replyOpen ? 'var(--color-background)' : USER_BUBBLE_STYLE.color as string,
    transition: 'background 0.25s, color 0.25s',
  }

  return (
    <div className="flex flex-col">
      <AnimatePresence>
        {visible && (
          <motion.div
            className="flex items-end flex-row-reverse"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' as const }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={avatarVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
              transition={AVATAR_SPRING}
            >
              <UserAvatar />
            </motion.div>

            <motion.div
              style={questionBubbleStyle}
              initial={{ opacity: 0, scaleX: 0.08, scaleY: 0.3 }}
              animate={bubbleVisible ? { opacity: 1, scaleX: 1, scaleY: 1 } : { opacity: 0, scaleX: 0.08, scaleY: 0.3 }}
              transition={BUBBLE_SPRING}
              onClick={bubbleVisible ? handleToggle : undefined}
              whileHover={bubbleVisible ? { scale: 1.02 } : {}}
              whileTap={bubbleVisible ? { scale: 0.98 } : {}}
            >
              {question.label}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={false}
        animate={{
          height: replyOpen ? replyHeight : 0,
          opacity: replyOpen ? 1 : 0,
          marginTop: replyOpen ? 24 : 0,
        }}
        transition={{ duration: 0.42, ease: [0.4, 0, 0.2, 1] }}
        style={{ overflow: 'hidden' }}
      >
        <div ref={replyContentRef}>
          <div className="flex items-end flex-row">
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={replyAvatarVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
              transition={AVATAR_SPRING}
            >
              <BotAvatar />
            </motion.div>

            <motion.div
              style={BOT_BUBBLE_STYLE}
              initial={{ opacity: 0, scaleX: 0.08, scaleY: 0.3 }}
              animate={replyBubbleVisible ? { opacity: 1, scaleX: 1, scaleY: 1 } : { opacity: 0, scaleX: 0.08, scaleY: 0.3 }}
              transition={BUBBLE_SPRING}
            >
              {isDone ? question.reply : displayed}
              {replyTypingStarted && !isDone && <TypingCursor />}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ===== 6. 主组件区域 =====

/**
 * ChatBubble 主组件
 * 
 * 整合所有子组件，实现完整的聊天界面
 * 
 * @param items - 聊天消息列表
 * @param questions - 可交互问题列表（可选）
 * @param typingSpeed - 打字速度（毫秒/字符），默认 40
 * @param itemDelay - 条目间渐进延迟（毫秒），默认 500
 * @param className - 自定义类名
 * @returns {JSX.Element} - 聊天组件
 */
export function ChatBubble({
  items,
  questions = [],
  typingSpeed = 40,
  itemDelay = 500,
  className = '',
}: ChatBubbleProps) {
  const allEntries = [
    ...items.map((item) => ({ kind: 'item' as const, data: item })),
    ...questions.map((q) => ({ kind: 'question' as const, data: q })),
  ]
  const total = allEntries.length

  const [visibleCount, setVisibleCount] = useState(0)
  const [currentSpeed, setCurrentSpeed] = useState(typingSpeed)
  const triggerRef = useRef<HTMLDivElement>(null)
  const startedRef = useRef(false)
  const speedResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const el = triggerRef.current
    if (!el) return
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || startedRef.current) return
        
        startedRef.current = true
        observer.disconnect()
        
        let count = 1
        setVisibleCount(1)
        
        const interval = setInterval(() => {
          count++
          setVisibleCount(count)
          if (count >= total) clearInterval(interval)
        }, itemDelay)
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )
    
    observer.observe(el)
    
    return () => observer.disconnect()
  }, [total, itemDelay])

  useEffect(() => {
    const handleScroll = () => {
      setCurrentSpeed(8)
      
      if (speedResetTimerRef.current) clearTimeout(speedResetTimerRef.current)
      speedResetTimerRef.current = setTimeout(() => setCurrentSpeed(typingSpeed), 800)
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (speedResetTimerRef.current) clearTimeout(speedResetTimerRef.current)
    }
  }, [typingSpeed])

  return (
    <div className={`relative w-full ${className}`}>
      <div ref={triggerRef} style={{ height: 1, marginBottom: -1 }} />
      
      <div className="flex flex-col gap-10 w-full px-6 py-8">
        {allEntries.map((entry, index) => {
          const isVisible = index < visibleCount
          
          if (entry.kind === 'item') {
            const item = entry.data
            
            if (item.type === 'divider') {
              return (
                <DividerItem 
                  key={item.id} 
                  content={item.content} 
                  visible={isVisible} 
                />
              )
            }
            
            return (
              <BubbleItem 
                key={item.id} 
                message={item} 
                visible={isVisible} 
                typingSpeed={currentSpeed} 
              />
            )
          }
          
          return (
            <QuestionBubble 
              key={entry.data.id} 
              question={entry.data} 
              visible={isVisible} 
              typingSpeed={currentSpeed} 
            />
          )
        })}
      </div>
    </div>
  )
}

export default ChatBubble
