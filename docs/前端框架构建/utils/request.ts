// ===== 1. 依赖导入区域 =====
import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { getToken, removeToken, removeUserInfo } from './cookie'
import { message } from './message'
import type { ApiResponse, ApiError } from '@/types'

// ===== 2. TODO待处理导入区域 =====
// 暂无

// ===== 3. 状态控制逻辑区域 =====
// API 基础配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
const REQUEST_TIMEOUT = 30000

// 请求队列（用于取消重复请求）
const pendingMap = new Map<string, AbortController>()

// ===== 4. 通用工具函数区域 =====
/**
 * 生成请求唯一标识
 * @param config 请求配置
 * @returns 请求标识
 */
function getRequestKey(config: AxiosRequestConfig): string {
  return `${config.method}_${config.url}_${JSON.stringify(config.params)}_${JSON.stringify(config.data)}`
}

/**
 * 添加请求到队列
 * @param config 请求配置
 */
function addPending(config: AxiosRequestConfig): void {
  const key = getRequestKey(config)
  const controller = new AbortController()
  config.signal = controller.signal
  pendingMap.set(key, controller)
}

/**
 * 移除请求从队列
 * @param config 请求配置
 */
function removePending(config: AxiosRequestConfig): void {
  const key = getRequestKey(config)
  if (pendingMap.has(key)) {
    const controller = pendingMap.get(key)
    controller?.abort()
    pendingMap.delete(key)
  }
}

/**
 * 清除所有 pending 请求
 */
export function clearPending(): void {
  pendingMap.forEach(controller => controller.abort())
  pendingMap.clear()
}

// ===== 5. 注释代码函数区 =====
// 暂无

// ===== 6. 错误处理函数区域 =====
/**
 * 处理 HTTP 错误
 * @param error 错误对象
 * @returns 处理后的错误信息
 */
function handleHttpError(error: ApiError): string {
  if (error.response) {
    const { status, data } = error.response
    switch (status) {
      case 401:
        removeToken()
        removeUserInfo()
        window.location.href = '/login'
        return '登录已过期，请重新登录'
      case 403:
        return '没有权限执行此操作'
      case 404:
        return '请求的资源不存在'
      case 500:
        return '服务器内部错误'
      case 502:
        return '网关错误'
      case 503:
        return '服务不可用'
      default:
        return data?.msg || `请求失败: ${status}`
    }
  }
  if (error.request) {
    return '网络请求失败，请检查网络连接'
  }
  return error.message || '未知错误'
}

// ===== 7. 数据处理函数区域 =====
// 暂无

// ===== 8. UI渲染逻辑区域 =====
// 暂无

// ===== 9. 页面初始化与事件绑定 =====
// 创建 axios 实例
const request: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 移除重复请求
    removePending(config)
    // 添加新请求到队列
    addPending(config)

    // 添加 Token
    const token = getToken()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    // 移除请求队列
    removePending(response.config)

    const { data } = response

    // 业务状态码处理
    if (data.code !== 200) {
      message.error(data.msg || '操作失败')

      // Token 过期处理
      if (data.code === 401) {
        removeToken()
        removeUserInfo()
        window.location.href = '/login'
      }

      return Promise.reject(new Error(data.msg))
    }

    return response
  },
  (error: ApiError) => {
    // 移除请求队列
    if (error.config) {
      removePending(error.config)
    }

    // 处理取消请求
    if (error.name === 'CanceledError') {
      return Promise.reject(error)
    }

    // 处理 HTTP 错误
    const errorMsg = handleHttpError(error)
    message.error(errorMsg)

    return Promise.reject(error)
  }
)

// ===== 10. TODO任务管理区域 =====
// TODO: 添加请求重试机制
// TODO: 添加请求缓存机制

// ===== 11. 导出区域 =====
export { request }
export default request
