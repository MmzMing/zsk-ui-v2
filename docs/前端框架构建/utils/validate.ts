// ===== 1. 依赖导入区域 =====
// 暂无

// ===== 2. TODO待处理导入区域 =====
// 暂无

// ===== 3. 状态控制逻辑区域 =====
// 验证规则正则表达式
const REGEX_PATTERNS = {
  // 邮箱
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  // 手机号（中国大陆）
  PHONE: /^1[3-9]\d{9}$/,
  // 用户名（字母开头，允许字母数字下划线，4-20位）
  USERNAME: /^[a-zA-Z][a-zA-Z0-9_]{3,19}$/,
  // 密码（至少8位，包含字母和数字）
  PASSWORD: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/,
  // 强密码（至少8位，包含大小写字母、数字和特殊字符）
  STRONG_PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  // URL
  URL: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
  // IP地址
  IP: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  // 身份证号（18位）
  ID_CARD: /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/,
  // 中文
  CHINESE: /^[\u4e00-\u9fa5]+$/,
  // 数字
  NUMBER: /^-?\d+(\.\d+)?$/,
  // 整数
  INTEGER: /^-?\d+$/,
  // 正整数
  POSITIVE_INTEGER: /^[1-9]\d*$/,
  // 验证码（6位数字）
  CAPTCHA: /^\d{6}$/
} as const

// ===== 4. 通用工具函数区域 =====
/**
 * 验证是否为空
 * @param value 值
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
 * 验证邮箱
 * @param email 邮箱
 * @returns 是否有效
 */
export function isEmail(email: string): boolean {
  return REGEX_PATTERNS.EMAIL.test(email)
}

/**
 * 验证手机号
 * @param phone 手机号
 * @returns 是否有效
 */
export function isPhone(phone: string): boolean {
  return REGEX_PATTERNS.PHONE.test(phone)
}

/**
 * 验证用户名
 * @param username 用户名
 * @returns 是否有效
 */
export function isUsername(username: string): boolean {
  return REGEX_PATTERNS.USERNAME.test(username)
}

/**
 * 验证密码
 * @param password 密码
 * @param strong 是否强密码
 * @returns 是否有效
 */
export function isPassword(password: string, strong: boolean = false): boolean {
  if (strong) {
    return REGEX_PATTERNS.STRONG_PASSWORD.test(password)
  }
  return REGEX_PATTERNS.PASSWORD.test(password)
}

/**
 * 验证URL
 * @param url URL
 * @returns 是否有效
 */
export function isUrl(url: string): boolean {
  return REGEX_PATTERNS.URL.test(url)
}

/**
 * 验证IP地址
 * @param ip IP地址
 * @returns 是否有效
 */
export function isIp(ip: string): boolean {
  return REGEX_PATTERNS.IP.test(ip)
}

/**
 * 验证身份证号
 * @param idCard 身份证号
 * @returns 是否有效
 */
export function isIdCard(idCard: string): boolean {
  return REGEX_PATTERNS.ID_CARD.test(idCard)
}

/**
 * 验证是否为中文
 * @param text 文本
 * @returns 是否有效
 */
export function isChinese(text: string): boolean {
  return REGEX_PATTERNS.CHINESE.test(text)
}

/**
 * 验证是否为数字
 * @param value 值
 * @returns 是否有效
 */
export function isNumber(value: string): boolean {
  return REGEX_PATTERNS.NUMBER.test(value)
}

/**
 * 验证是否为整数
 * @param value 值
 * @returns 是否有效
 */
export function isInteger(value: string): boolean {
  return REGEX_PATTERNS.INTEGER.test(value)
}

/**
 * 验证是否为正整数
 * @param value 值
 * @returns 是否有效
 */
export function isPositiveInteger(value: string): boolean {
  return REGEX_PATTERNS.POSITIVE_INTEGER.test(value)
}

/**
 * 验证验证码
 * @param captcha 验证码
 * @returns 是否有效
 */
export function isCaptcha(captcha: string): boolean {
  return REGEX_PATTERNS.CAPTCHA.test(captcha)
}

/**
 * 验证长度范围
 * @param value 值
 * @param min 最小长度
 * @param max 最大长度
 * @returns 是否有效
 */
export function isLength(value: string, min: number, max: number): boolean {
  const len = value?.length || 0
  return len >= min && len <= max
}

/**
 * 验证数值范围
 * @param value 值
 * @param min 最小值
 * @param max 最大值
 * @returns 是否有效
 */
export function isRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max
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
// TODO: 添加更多验证函数

// ===== 11. 导出区域 =====
export { REGEX_PATTERNS }
