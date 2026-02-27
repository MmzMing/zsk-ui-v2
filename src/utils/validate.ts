/**
 * 数据校验工具函数
 */

// 邮箱正则
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

// 手机号正则（中国大陆）
const PHONE_REGEX = /^1[3-9]\d{9}$/

// URL 正则
const URL_REGEX = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/

// 身份证号正则
const ID_CARD_REGEX = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/

/**
 * 校验邮箱格式
 * @param email - 邮箱地址
 * @returns 是否为有效邮箱
 */
export function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email)
}

/**
 * 校验手机号格式（中国大陆）
 * @param phone - 手机号
 * @returns 是否为有效手机号
 */
export function validatePhone(phone: string): boolean {
  return PHONE_REGEX.test(phone)
}

/**
 * 校验 URL 格式
 * @param url - URL 地址
 * @returns 是否为有效 URL
 */
export function validateUrl(url: string): boolean {
  return URL_REGEX.test(url)
}

/**
 * 校验身份证号格式
 * @param idCard - 身份证号
 * @returns 是否为有效身份证号
 */
export function validateIdCard(idCard: string): boolean {
  return ID_CARD_REGEX.test(idCard)
}

/**
 * 校验用户名格式（默认长度 3-20 位，字母数字下划线）
 * @param username - 用户名
 * @returns 是否符合要求
 */
export function validateUsername(username: string): boolean {
  return /^[a-zA-Z0-9_]{3,20}$/.test(username)
}

/**
 * 校验账户（如果是邮箱则按邮箱校验，否则按用户名校验）
 * @param account - 账户字符串
 * @returns 校验结果：{ isValid: boolean, type: 'email' | 'username' | 'unknown', message?: string }
 */
export function validateAccount(account: string): { 
  isValid: boolean, 
  type: 'email' | 'username' | 'unknown', 
  message?: string 
} {
  if (isEmpty(account)) {
    return { isValid: false, type: 'unknown', message: '账户不能为空' }
  }

  // 如果包含 @，按邮箱校验
  if (account.includes('@')) {
    const isValidEmail = validateEmail(account)
    return { 
      isValid: isValidEmail, 
      type: 'email', 
      message: isValidEmail ? undefined : '请输入正确的邮箱格式' 
    }
  }

  // 否则按用户名校验
  const isValidUsername = validateUsername(account)
  return { 
    isValid: isValidUsername, 
    type: 'username', 
    message: isValidUsername ? undefined : '用户名长度需为3-20位（支持字母、数字、下划线）' 
  }
}

/**
 * 校验密码强度
 * @param password - 密码
 * @returns 强度信息：{ isValid: boolean, strength: 'weak' | 'medium' | 'strong', message?: string }
 */
export function validatePassword(password: string): {
  isValid: boolean,
  strength: 'weak' | 'medium' | 'strong',
  message?: string
} {
  if (password.length < 8) {
    return { isValid: false, strength: 'weak', message: '密码长度至少为8位' }
  }

  let strength: 'weak' | 'medium' | 'strong' = 'weak'
  const score = validatePasswordStrength(password)
  strength = score

  return { 
    isValid: true, 
    strength, 
    message: undefined 
  }
}

/**
 * 校验密码强度等级（返回等级字符串）
 * @param password - 密码
 * @returns 密码强度等级：weak | medium | strong
 */
export function validatePasswordStrength(
  password: string
): 'weak' | 'medium' | 'strong' {
  if (password.length < 8) return 'weak'

  let strength = 0
  if (/[a-z]/.test(password)) strength++
  if (/[A-Z]/.test(password)) strength++
  if (/\d/.test(password)) strength++
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++

  if (strength <= 1) return 'weak'
  if (strength <= 3) return 'medium'
  return 'strong'
}

/**
 * 校验是否为空值
 * @param value - 待校验值
 * @returns 是否为空
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

/**
 * 校验是否为数字
 * @param value - 待校验值
 * @returns 是否为数字
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value)
}

/**
 * 校验是否为整数
 * @param value - 待校验值
 * @returns 是否为整数
 */
export function isInteger(value: unknown): boolean {
  return Number.isInteger(value)
}

/**
 * 校验是否在指定范围内
 * @param value - 待校验值
 * @param min - 最小值
 * @param max - 最大值
 * @returns 是否在范围内
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max
}

/**
 * 校验字符串长度
 * @param str - 待校验字符串
 * @param minLength - 最小长度
 * @param maxLength - 最大长度
 * @returns 是否符合长度要求
 */
export function validateLength(
  str: string,
  minLength: number,
  maxLength?: number
): boolean {
  const length = str.length
  if (length < minLength) return false
  if (maxLength !== undefined && length > maxLength) return false
  return true
}
