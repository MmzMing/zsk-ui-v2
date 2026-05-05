/**
 * Axios 请求封装
 * 统一处理请求拦截、响应拦截、错误处理
 */

import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type AxiosError,
} from 'axios'
import { API_CONFIG, type RequestConfig } from './config'
import { removeStorage, clearAllCookies } from '@/utils/storage'
import { STORAGE_KEYS } from '@/utils/storage'
import { toast } from '@/utils/toast'
import type { ApiResponse } from '@/types'

// 创建 axios 实例
const request: AxiosInstance = axios.create({
  ...API_CONFIG,
  withCredentials: true, // 允许携带 Cookie
})

// 请求拦截器
request.interceptors.request.use(
  (config: RequestConfig) => {
    // 添加时间戳防止缓存
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now(),
      }
    }

    return config
  },
  (error: AxiosError) => {
    console.error('请求拦截错误：', error)
    return Promise.reject(error)
  }
)

/**
 * 处理登录过期
 * 仅在确认登录过期时调用（如 Cookie 失效），清除本地缓存、Cookie 并跳转登录页
 */
function handleLoginExpired(message?: string): void {
  removeStorage(STORAGE_KEYS.USER_INFO)
  clearAllCookies()

  if (typeof window !== 'undefined') {
    const currentPath = window.location.pathname
    if (currentPath !== '/login') {
      toast.error(message || '登录已过期，请重新登录')
      setTimeout(() => {
        window.location.href = '/login'
      }, 2000)
    }
  } else {
    toast.error(message || '登录已过期，请重新登录')
  }
}

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse<ApiResponse & { success?: boolean }>) => {
    const { data, config } = response

    const skipAuthRedirect = (config as RequestConfig).skipAuthRedirect

    const isSuccess = data.code === 0 || (data.code === 200 && data.success !== false)
    
    if (!isSuccess) {
      const isLoginExpired = data.code === 401 &&
        data.msg && (data.msg.includes('过期') || data.msg.includes('失效') || data.msg.includes('expired'))

      if (isLoginExpired) {
        if (!skipAuthRedirect) {
          handleLoginExpired(data.msg)
        }
      } else if (data.code === 401) {
        if (!skipAuthRedirect) {
          toast.error(data.msg || '无访问权限')
        }
      }
      
      const error = new Error(data.msg || '请求失败')
      return Promise.reject(error)
    }

    return response
  },
  (error: AxiosError<ApiResponse>) => {
    // 处理 HTTP 错误
    if (error.response) {
      const { status, data } = error.response

      switch (status) {
        case 401:
          if (!(error.config as RequestConfig).skipAuthRedirect) {
            handleLoginExpired()
          }
          break
        case 403:
          toast.error('没有权限访问该资源')
          break
        case 404:
          toast.error('请求的资源不存在')
          break
        case 500:
          toast.error('服务器内部错误')
          break
        default:
          toast.error(`请求错误：${status}`)
      }

      const message = data?.msg || `请求失败 (${status})`
      return Promise.reject(new Error(message))
    }

    // 处理网络错误
    if (error.code === 'ECONNABORTED') {
      const msg = '请求超时，请稍后重试'
      toast.error(msg)
      return Promise.reject(new Error(msg))
    }

    const msg = '网络错误，请检查网络连接'
    toast.error(msg)
    return Promise.reject(new Error(msg))
  }
)

// 封装 GET 请求
export async function get<T>(
  url: string,
  params?: Record<string, unknown>,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await request.get<ApiResponse<T>>(url, {
    params,
    ...config,
  })
  return response.data.data!
}

// 封装 POST 请求
export async function post<T>(
  url: string,
  data?: Record<string, unknown>,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await request.post<ApiResponse<T>>(url, data, config)
  return response.data.data!
}

// 封装 PUT 请求
export async function put<T>(
  url: string,
  data?: Record<string, unknown>,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await request.put<ApiResponse<T>>(url, data, config)
  return response.data.data!
}

// 封装 DELETE 请求
export async function del<T>(
  url: string,
  data?: Record<string, unknown>,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await request.delete<ApiResponse<T>>(url, {
    data,
    ...config,
  })
  return response.data.data!
}

// 封装 PATCH 请求
export async function patch<T>(
  url: string,
  data?: Record<string, unknown>,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await request.patch<ApiResponse<T>>(url, data, config)
  return response.data.data!
}

// 导出 axios 实例供特殊场景使用
export { request }
