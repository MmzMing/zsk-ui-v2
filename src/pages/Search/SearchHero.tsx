/**
 * 搜索头部：搜索框 + 历史 + 热词
 */

import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Input, Chip } from '@heroui/react'
import { Search, X, History, Flame } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const HISTORY_KEY = 'zsk_search_history'
const HISTORY_MAX = 10

const HOT_KEYWORDS = ['React', 'Vite', 'TypeScript', 'HeroUI', 'TailwindCSS', '动画']

interface SearchHeroProps {
  /** 当前关键字 */
  keyword: string
  /** 提交关键字（回车/点击历史/点击热词） */
  onSubmit: (keyword: string) => void
}

function loadHistory(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.slice(0, HISTORY_MAX) : []
  } catch {
    return []
  }
}

function saveHistory(list: string[]) {
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, HISTORY_MAX)))
  } catch (err) {
    console.error('保存搜索历史失败：', err)
  }
}

export function SearchHero({ keyword, onSubmit }: SearchHeroProps) {
  const [value, setValue] = useState(keyword)
  const [focused, setFocused] = useState(false)
  const [history, setHistory] = useState<string[]>(() => loadHistory())
  const wrapperRef = useRef<HTMLDivElement>(null)

  // 外部 keyword 变化时同步
  useEffect(() => {
    setValue(keyword)
  }, [keyword])

  // 全局 / 唤起，Esc 失焦
  useEffect(() => {
    const inputEl = () => wrapperRef.current?.querySelector<HTMLInputElement>('input')
    const handleKey = (e: globalThis.KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const isTyping =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          (target as HTMLElement).isContentEditable)
      if (e.key === '/' && !isTyping) {
        e.preventDefault()
        inputEl()?.focus()
      }
      if (e.key === 'Escape') {
        inputEl()?.blur()
        setFocused(false)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  // 点击外部关闭面板
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!wrapperRef.current) return
      if (!wrapperRef.current.contains(e.target as Node)) {
        setFocused(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const submit = (next: string) => {
    const trimmed = next.trim()
    onSubmit(trimmed)
    setValue(trimmed)
    setFocused(false)
    if (!trimmed) return
    const merged = [trimmed, ...history.filter((it) => it !== trimmed)].slice(0, HISTORY_MAX)
    setHistory(merged)
    saveHistory(merged)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      submit(value)
    }
  }

  const removeHistory = (item: string) => {
    const next = history.filter((it) => it !== item)
    setHistory(next)
    saveHistory(next)
  }

  const clearHistory = () => {
    setHistory([])
    saveHistory([])
  }

  const showPanel = focused

  return (
    <div ref={wrapperRef} className="relative w-full">
      <motion.div
        animate={{ width: focused ? '100%' : '100%' }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-3xl"
      >
        <Input
          aria-label="全站搜索"
          size="lg"
          radius="full"
          placeholder="搜索文档、视频…   按 / 快速聚焦"
          value={value}
          onValueChange={setValue}
          onFocus={() => setFocused(true)}
          onKeyDown={handleKeyDown}
          startContent={<Search className="h-4 w-4 text-default-500" />}
          endContent={
            value ? (
              <button
                type="button"
                onClick={() => {
                  setValue('')
                  submit('')
                }}
                aria-label="清除关键字"
                className="rounded-full p-1 text-default-500 transition hover:bg-default-100 hover:text-default-700"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null
          }
          classNames={{
            inputWrapper: 'bg-content1 shadow-sm border border-default-200',
          }}
        />
      </motion.div>

      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-1/2 top-full z-30 mt-2 w-full max-w-3xl -translate-x-1/2 rounded-2xl bg-content1 p-4 shadow-lg"
          >
            {history.length > 0 && (
              <div className="mb-3">
                <div className="mb-2 flex items-center justify-between text-xs text-default-500">
                  <span className="flex items-center gap-1">
                    <History className="h-3.5 w-3.5" />
                    搜索历史
                  </span>
                  <button
                    type="button"
                    onClick={clearHistory}
                    className="text-default-500 hover:text-default-800 dark:hover:text-default-200"
                  >
                    清空
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {history.map((item) => (
                    <Chip
                      key={item}
                      variant="flat"
                      size="sm"
                      onClose={() => removeHistory(item)}
                      onClick={() => submit(item)}
                      className="cursor-pointer"
                    >
                      {item}
                    </Chip>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="mb-2 flex items-center gap-1 text-xs text-default-500">
                <Flame className="h-3.5 w-3.5" />
                热门关键词
              </div>
              <div className="flex flex-wrap gap-2">
                {HOT_KEYWORDS.map((item) => (
                  <Chip
                    key={item}
                    variant="flat"
                    size="sm"
                    onClick={() => submit(item)}
                    className="cursor-pointer bg-default-100 text-default-800 dark:bg-default-800 dark:text-default-200"
                  >
                    {item}
                  </Chip>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
