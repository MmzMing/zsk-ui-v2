/**
 * 日期格式化工具函数
 * 基于 dayjs 实现
 */

import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import relativeTime from 'dayjs/plugin/relativeTime'
import customParseFormat from 'dayjs/plugin/customParseFormat'

// 配置 dayjs
dayjs.locale('zh-cn')
dayjs.extend(relativeTime)
dayjs.extend(customParseFormat)

/**
 * 格式化日期
 * @param date - 日期字符串或 Date 对象
 * @param format - 格式化模板，默认 'YYYY-MM-DD'
 * @returns 格式化后的日期字符串
 *
 * @example
 * formatDate('2024-01-01') // '2024-01-01'
 * formatDate(new Date(), 'YYYY年MM月DD日') // '2024年01月01日'
 */
export function formatDate(date: string | Date, format = 'YYYY-MM-DD'): string {
  return dayjs(date).format(format)
}

/**
 * 格式化时间
 * @param time - 时间字符串或 Date 对象
 * @param format - 格式化模板，默认 'HH:mm:ss'
 * @returns 格式化后的时间字符串
 */
export function formatTime(time: string | Date, format = 'HH:mm:ss'): string {
  return dayjs(time).format(format)
}

/**
 * 格式化日期时间
 * @param datetime - 日期时间字符串或 Date 对象
 * @param format - 格式化模板，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns 格式化后的日期时间字符串
 */
export function formatDateTime(
  datetime: string | Date,
  format = 'YYYY-MM-DD HH:mm:ss'
): string {
  return dayjs(datetime).format(format)
}

/**
 * 获取相对时间描述
 * @param date - 日期字符串或 Date 对象
 * @returns 相对时间描述，如 "3 天前"
 */
export function formatRelativeTime(date: string | Date): string {
  return dayjs(date).fromNow()
}

/**
 * 判断是否为今天
 * @param date - 日期字符串或 Date 对象
 * @returns 是否为今天
 */
export function isToday(date: string | Date): boolean {
  return dayjs(date).isSame(dayjs(), 'day')
}

/**
 * 判断是否为昨天
 * @param date - 日期字符串或 Date 对象
 * @returns 是否为昨天
 */
export function isYesterday(date: string | Date): boolean {
  return dayjs(date).isSame(dayjs().subtract(1, 'day'), 'day')
}

/**
 * 获取两个日期之间的天数差
 * @param startDate - 开始日期
 * @param endDate - 结束日期
 * @returns 天数差
 */
export function getDaysDiff(
  startDate: string | Date,
  endDate: string | Date
): number {
  return dayjs(endDate).diff(dayjs(startDate), 'day')
}

/**
 * 解析日期字符串
 * @param dateStr - 日期字符串
 * @param format - 解析格式
 * @returns dayjs 对象或 null
 */
export function parseDate(dateStr: string, format: string): dayjs.Dayjs | null {
  const parsed = dayjs(dateStr, format)
  return parsed.isValid() ? parsed : null
}

export { dayjs }
