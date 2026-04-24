/**
 * B站直播状态轮询 Hook
 *
 * 定时查询 B站直播间状态，返回开播/未开播信息
 */

import { useState, useEffect, useCallback } from 'react'
import { fetchBilibiliLiveStatus } from '@/api/bilibili'

/** 直播状态信息 */
export interface LiveStatus {
  /** 是否正在直播 */
  isLive: boolean
  /** 直播标题 */
  title: string
  /** 直播封面 */
  cover: string
  /** 直播间 URL */
  url: string
  /** 是否正在加载 */
  loading: boolean
}

/** 默认状态 */
const DEFAULT_STATUS: LiveStatus = {
  isLive: false,
  title: '',
  cover: '',
  url: '',
  loading: true,
}

/**
 * 获取 B站直播状态
 *
 * @param roomId - 直播间房间号
 * @param pollInterval - 轮询间隔（毫秒），默认 60000（1 分钟）
 * @returns 直播状态信息
 */
export function useBilibiliLive(roomId: string, pollInterval = 60000): LiveStatus {
  const [status, setStatus] = useState<LiveStatus>(DEFAULT_STATUS)

  const fetchStatus = useCallback(async () => {
    const result = await fetchBilibiliLiveStatus(roomId)
    setStatus({ ...result, loading: false })
  }, [roomId])

  useEffect(() => {
    fetchStatus()

    const timer = setInterval(fetchStatus, pollInterval)
    return () => clearInterval(timer)
  }, [fetchStatus, pollInterval])

  return status
}