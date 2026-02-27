/**
 * 应用常量配置
 */

// 分页默认配置
export const PAGINATION = {
  /** 默认页码 */
  DEFAULT_PAGE: 1,
  /** 默认每页数量 */
  DEFAULT_PAGE_SIZE: 10,
  /** 每页数量选项 */
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  /** 最大每页数量 */
  MAX_PAGE_SIZE: 100,
} as const

// API 配置
export const API = {
  /** 请求超时时间（毫秒） */
  TIMEOUT: 30000,
  /** Token 存储键名 */
  TOKEN_KEY: 'zsk_token',
  /** 用户信息存储键名 */
  USER_INFO_KEY: 'zsk_user_info',
  /** 应用设置存储键名 */
  APP_SETTINGS_KEY: 'zsk_app_settings',
} as const

// 主题配置
export const THEME = {
  /** 支持的主题模式 */
  MODES: ['light', 'dark', 'system'] as const,
  /** 默认主题模式 */
  DEFAULT_MODE: 'system' as const,
  /** 默认主色调 */
  DEFAULT_PRIMARY_COLOR: '#537BF9',
} as const

// 布局配置
export const LAYOUT = {
  /** 默认菜单宽度 */
  DEFAULT_MENU_WIDTH: 220,
  /** 最小菜单宽度 */
  MIN_MENU_WIDTH: 160,
  /** 最大菜单宽度 */
  MAX_MENU_WIDTH: 300,
  /** 默认圆角 */
  DEFAULT_BORDER_RADIUS: 12,
  /** 最小圆角 */
  MIN_BORDER_RADIUS: 0,
  /** 最大圆角 */
  MAX_BORDER_RADIUS: 24,
  /** 默认字体大小 */
  DEFAULT_FONT_SIZE: 14,
  /** 字体大小选项 */
  FONT_SIZE_OPTIONS: [12, 14, 16, 18],
  /** 默认内容区边距 */
  DEFAULT_CONTENT_PADDING: 16,
  /** 内容区边距选项 */
  CONTENT_PADDING_OPTIONS: [8, 16, 24],
} as const

// 文件上传配置
export const UPLOAD = {
  /** 最大文件大小（字节） */
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  /** 允许的图片类型 */
  IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  /** 允许的视频类型 */
  VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/ogg'],
  /** 允许的文档类型 */
  DOCUMENT_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
} as const

// 正则表达式
export const REGEX = {
  /** 邮箱 */
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  /** 手机号（中国大陆） */
  PHONE: /^1[3-9]\d{9}$/,
  /** URL */
  URL: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
  /** 身份证号 */
  ID_CARD: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
} as const
