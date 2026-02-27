/**
 * 工具函数统一导出
 */

export * from './common'
export * from './format'
export * from './storage'
export * from './validate'
export * from './toast'
// 别名导出
export { getStorageValue as getStorage } from './storage'

/**
 * 类名合并工具
 * 基于 clsx 和 tailwind-merge
 */
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * 合并 Tailwind CSS 类名
 * @param inputs - 类名列表
 * @returns 合并后的类名字符串
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
