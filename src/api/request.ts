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
import { getStorageValue, removeStorage } from '@/utils/storage'
import { STORAGE_KEYS } from '@/utils/storage'
import { toast } from '@/utils/toast'
import type { ApiResponse } from '@/types'

// 创建 axios 实例
const request: AxiosInstance = axios.create(API_CONFIG)

// 请求拦截器
request.interceptors.request.use(
  (config: RequestConfig) => {
    // 添加 Token，优先从 Cookie 读取
    const token = getStorageValue<string>(STORAGE_KEYS.TOKEN, undefined, 'cookie')
    if (token && config.withToken !== false) {
      config.headers.Authorization = `Bearer ${token}`
    }

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

function handleAuthError(message?: string): void {
  removeStorage(STORAGE_KEYS.TOKEN, 'cookie')
  removeStorage(STORAGE_KEYS.USER_INFO)
  removeStorage(STORAGE_KEYS.USER_STATS)
  removeStorage(STORAGE_KEYS.MENU_CACHE)

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
    const { data } = response

    // 检查业务状态码：兼容 code === 0（前端约定）和 code === 200（后端实际返回）
    const isSuccess = data.code === 0 || (data.code === 200 && data.success !== false)
    
    if (!isSuccess) {
      // 检查业务层鉴权错误：业务码为 401 或错误信息包含鉴权相关关键词
      const isAuthError = data.code === 401 || 
                         (data.msg && data.msg.includes('鉴权')) ||
                         (data.msg && data.msg.includes('登录'))
      
      if (isAuthError) {
        handleAuthError(data.msg)
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
          handleAuthError()
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
