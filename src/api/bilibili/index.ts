/**
 * B站直播状态 API 封装
 *
 * 使用 B站公开 API 查询直播间状态（开播/未开播）
 */

import axios from 'axios'

/** B站直播状态响应 */
interface BilibiliLiveInfo {
  /** 是否正在直播 */
  isLive: boolean
  /** 直播标题 */
  title: string
  /** 直播封面 URL */
  cover: string
  /** 直播间 URL */
  url: string
}

/** B站 API 响应格式 */
interface BilibiliApiResponse {
  code: number
  message: string
  data: {
    live_status: number // 0=未开播, 1=正在直播, 2=轮播
    title: string
    keyframe: string
    room_id: number
    short_id?: number
  } | null
}

const BILIBILI_API_URL = '/api/bilibili/room/v1/Room/get_info'

/**
 * 查询 B站直播间状态
 *
 * @param roomId - 直播间房间号
 * @returns 直播状态信息
 */
export async function fetchBilibiliLiveStatus(roomId: string): Promise<BilibiliLiveInfo> {
  try {
    const response = await axios.get<BilibiliApiResponse>(BILIBILI_API_URL, {
      params: { room_id: roomId },
      timeout: 10000,
      withCredentials: false,
    })

    const data = response.data?.data
    if (!data) {
      return { isLive: false, title: '', cover: '', url: `https://live.bilibili.com/${roomId}` }
    }

    return {
      isLive: data.live_status === 1,
      title: data.title || '',
      cover: data.keyframe || '',
      url: `https://live.bilibili.com/${roomId}`,
    }
  } catch {
    return { isLive: false, title: '', cover: '', url: `https://live.bilibili.com/${roomId}` }
  }
}