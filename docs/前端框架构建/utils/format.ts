// ===== 1. 依赖导入区域 =====
import dayjs from 'dayjs'

// ===== 2. TODO待处理导入区域 =====
// 暂无

// ===== 3. 状态控制逻辑区域 =====
// 日期格式常量
const DATE_FORMAT = {
  DATE: 'YYYY-MM-DD',
  DATETIME: 'YYYY-MM-DD HH:mm:ss',
  TIME: 'HH:mm:ss',
  MONTH: 'YYYY-MM'
} as const

// 文件大小单位
const FILE_SIZE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']

// ===== 4. 通用工具函数区域 =====
/**
 * 格式化日期
 * @param date 日期
 * @param format 格式
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: string | number | Date, format: string = DATE_FORMAT.DATE): string {
  if (!date) return '-'
  return dayjs(date).format(format)
}

/**
 * 格式化日期时间
 * @param date 日期
 * @returns 格式化后的日期时间字符串
 */
export function formatDateTime(date: string | number | Date): string {
  return formatDate(date, DATE_FORMAT.DATETIME)
}

/**
 * 格式化时间戳为相对时间
 * @param date 日期
 * @returns 相对时间字符串
 */
export function formatRelativeTime(date: string | number | Date): string {
  if (!date) return '-'
  const now = dayjs()
  const target = dayjs(date)
  const diffMinutes = now.diff(target, 'minute')
  const diffHours = now.diff(target, 'hour')
  const diffDays = now.diff(target, 'day')
  
  if (diffMinutes < 1) return '刚刚'
  if (diffMinutes < 60) return `${diffMinutes}分钟前`
  if (diffHours < 24) return `${diffHours}小时前`
  if (diffDays < 30) return `${diffDays}天前`
  return target.format(DATE_FORMAT.DATE)
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @param decimals 小数位数
 * @returns 格式化后的文件大小字符串
 */
export function formatFileSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 B'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + FILE_SIZE_UNITS[i]
}

/**
 * 格式化数字（添加千分位）
 * @param num 数字
 * @returns 格式化后的数字字符串
 */
export function formatNumber(num: number | string): string {
  if (num === null || num === undefined || num === '') return '0'
  const n = typeof num === 'string' ? parseFloat(num) : num
  if (isNaN(n)) return '0'
  return n.toLocaleString('zh-CN')
}

/**
 * 格式化金额
 * @param amount 金额
 * @param decimals 小数位数
 * @returns 格式化后的金额字符串
 */
export function formatMoney(amount: number | string, decimals: number = 2): string {
  if (amount === null || amount === undefined || amount === '') return '0.00'
  const n = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(n)) return '0.00'
  return '¥' + n.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
}

/**
 * 格式化百分比
 * @param value 数值（0-1之间）
 * @param decimals 小数位数
 * @returns 格式化后的百分比字符串
 */
export function formatPercent(value: number, decimals: number = 2): string {
  if (value === null || value === undefined || isNaN(value)) return '0%'
  return (value * 100).toFixed(decimals) + '%'
}

/**
 * 格式化持续时间（秒转时分秒）
 * @param seconds 秒数
 * @returns 格式化后的时间字符串
 */
export function formatDuration(seconds: number): string {
  if (!seconds || seconds < 0) return '00:00'

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

/**
 * 格式化时间（只显示时分）
 * @param date 日期
 * @returns 格式化后的时间字符串 HH:mm
 */
export function formatTime(date: string | number | Date): string {
  if (!date) return '-'
  return dayjs(date).format('HH:mm')
}

/**
 * 截断文本
 * @param text 文本
 * @param length 长度
 * @param suffix 后缀
 * @returns 截断后的文本
 */
export function truncateText(text: string, length: number, suffix: string = '...'): string {
  if (!text) return ''
  if (text.length <= length) return text
  return text.substring(0, length) + suffix
}

/**
 * 驼峰转短横线
 * @param str 驼峰字符串
 * @returns 短横线字符串
 */
export function camelToKebab(str: string): string {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase()
}

/**
 * 短横线转驼峰
 * @param str 短横线字符串
 * @returns 驼峰字符串
 */
export function kebabToCamel(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
}

// ===== 5. 注释代码函数区 =====
// 暂无

// ===== 6. 错误处理函数区域 =====
// 暂无

// ===== 7. 数据处理函数区域 =====
// 暂无

// ===== 8. UI渲染逻辑区域 =====
// 暂无

// ===== 9. 页面初始化与事件绑定 =====
// 暂无

// ===== 10. TODO任务管理区域 =====
// TODO: 添加更多格式化函数

// ===== 11. 导出区域 =====
export { DATE_FORMAT }
