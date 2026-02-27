/**
 * API 请求配置
 */

import type { InternalAxiosRequestConfig } from 'axios'

// API 基础配置
export const API_CONFIG = {
  /** 基础 URL */
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  /** 请求超时时间（毫秒） */
  timeout: 30000,
  /** 请求头 */
  headers: {
    'Content-Type': 'application/json',
  },
} as const

// 请求配置接口
export interface RequestConfig extends InternalAxiosRequestConfig {
  /** 是否显示加载状态 */
  loading?: boolean
  /** 是否显示错误提示 */
  showError?: boolean
  /** 是否显示成功提示 */
  showSuccess?: boolean
  /** 成功提示消息 */
  successMessage?: string
  /** 是否携带 Token */
  withToken?: boolean
  /** 是否重试 */
  retry?: boolean
  /** 重试次数 */
  retryCount?: number
}

// 环境变量类型声明
declare global {
  interface ImportMetaEnv {
    readonly VITE_API_BASE_URL: string
  }
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
}
