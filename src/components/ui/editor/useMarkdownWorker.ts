/**
 * Markdown AST Web Worker 解析 Hook
 * 将 remark 解析移至 Worker 线程，避免阻塞主线程
 * 返回解析后的 hast 或 null（解析中/失败时）
 */

import { useState, useEffect, useRef, useCallback } from 'react'

interface WorkerResult {
  id: string
  hast?: unknown
  error?: string
}

interface UseMarkdownWorkerReturn {
  /** 解析结果 hast，未完成时为 null */
  hast: unknown | null
  /** 是否正在解析 */
  isParsing: boolean
  /** 解析错误信息 */
  error: string | null
}

let messageId = 0

export function useMarkdownWorker(markdown: string): UseMarkdownWorkerReturn {
  const [hast, setHast] = useState<unknown | null>(null)
  const [isParsing, setIsParsing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const workerRef = useRef<Worker | null>(null)
  const pendingIdRef = useRef<string>('')

  // 惰性初始化 Worker
  const getWorker = useCallback(() => {
    if (!workerRef.current) {
      workerRef.current = new Worker(
        new URL('./markdown.worker.ts', import.meta.url),
        { type: 'module' }
      )
    }
    return workerRef.current
  }, [])

  useEffect(() => {
    if (!markdown) {
      setHast(null)
      setIsParsing(false)
      setError(null)
      return
    }

    const id = `msg-${++messageId}`
    pendingIdRef.current = id
    setIsParsing(true)
    setError(null)

    const worker = getWorker()

    const handleMessage = (e: MessageEvent<WorkerResult>) => {
      if (e.data.id !== pendingIdRef.current) return
      if (e.data.error) {
        setError(e.data.error)
        setHast(null)
      } else {
        setHast(e.data.hast)
      }
      setIsParsing(false)
    }

    worker.addEventListener('message', handleMessage)
    worker.postMessage({ id, markdown })

    return () => {
      worker.removeEventListener('message', handleMessage)
    }
  }, [markdown, getWorker])

  // 组件卸载时终止 Worker
  useEffect(() => {
    return () => {
      workerRef.current?.terminate()
      workerRef.current = null
    }
  }, [])

  return { hast, isParsing, error }
}
