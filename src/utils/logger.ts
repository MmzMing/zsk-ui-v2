/**
 * 日志工具封装
 * 提供统一的日志管理，支持开发环境和生产环境的不同行为
 */

/**
 * 日志级别
 */
type LogLevel = 'debug' | 'info' | 'warn' | 'error'

/**
 * 日志配置
 */
const LOG_CONFIG = {
  /** 是否启用日志 */
  enabled: process.env.NODE_ENV !== 'production',
  /** 是否显示时间戳 */
  showTimestamp: true,
  /** 是否显示日志级别 */
  showLevel: true,
}

/**
 * 获取带颜色的日志级别标签
 */
function getLevelTag(level: LogLevel): string {
  const tags: Record<LogLevel, string> = {
    debug: '\x1b[36m[DEBUG]\x1b[0m',
    info: '\x1b[32m[INFO]\x1b[0m',
    warn: '\x1b[33m[WARN]\x1b[0m',
    error: '\x1b[31m[ERROR]\x1b[0m',
  }
  return tags[level]
}

/**
 * 获取时间戳
 */
function getTimestamp(): string {
  const now = new Date()
  return now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

/**
 * 基础日志函数
 */
function log(level: LogLevel, ...args: unknown[]): void {
  if (!LOG_CONFIG.enabled) return

  const parts: string[] = []
  
  if (LOG_CONFIG.showTimestamp) {
    parts.push(`[${getTimestamp()}]`)
  }
  
  if (LOG_CONFIG.showLevel) {
    parts.push(getLevelTag(level))
  }

  switch (level) {
    case 'debug':
      console.debug(...parts, ...args)
      break
    case 'info':
      console.info(...parts, ...args)
      break
    case 'warn':
      console.warn(...parts, ...args)
      break
    case 'error':
      console.error(...parts, ...args)
      break
  }
}

/**
 * 日志工具对象
 */
export const logger = {
  /**
   * 调试日志
   * @param args - 日志内容
   */
  debug: (...args: unknown[]) => log('debug', ...args),

  /**
   * 信息日志
   * @param args - 日志内容
   */
  info: (...args: unknown[]) => log('info', ...args),

  /**
   * 警告日志
   * @param args - 日志内容
   */
  warn: (...args: unknown[]) => log('warn', ...args),

  /**
   * 错误日志
   * @param args - 日志内容
   */
  error: (...args: unknown[]) => log('error', ...args),

  /**
   * 分组日志
   * @param label - 分组标签
   * @param args - 日志内容
   */
  group: (label: string, ...args: unknown[]) => {
    if (!LOG_CONFIG.enabled) return
    console.group(label)
    console.log(...args)
  },

  /**
   * 结束分组
   */
  groupEnd: () => {
    if (!LOG_CONFIG.enabled) return
    console.groupEnd()
  },

  /**
   * 表格日志
   * @param data - 表格数据
   */
  table: (data: unknown) => {
    if (!LOG_CONFIG.enabled) return
    console.table(data)
  },

  /**
   * 性能计时开始
   * @param label - 计时标签
   */
  time: (label: string) => {
    if (!LOG_CONFIG.enabled) return
    console.time(label)
  },

  /**
   * 性能计时结束
   * @param label - 计时标签
   */
  timeEnd: (label: string) => {
    if (!LOG_CONFIG.enabled) return
    console.timeEnd(label)
  },
}

export default logger
