/**
 * 缓存管理类型定义
 * 对接后端 CacheSysController 接口
 */

// ===== 缓存实例相关类型 =====

/** 缓存实例信息 */
export interface CacheInstance {
  /** 缓存名称 */
  cacheName: string
  /** 缓存键数量 */
  keyCount: number
  /** 缓存命中率 */
  hitRate: number
  /** 缓存大小（字节） */
  size?: number
}

// ===== 缓存键相关类型 =====

/** 缓存键信息 */
export interface CacheKeyInfo {
  /** 缓存键名 */
  cacheKey: string
  /** 缓存名称 */
  cacheName: string
  /** 缓存值 */
  cacheValue: string
  /** 过期时间（秒） */
  ttl: number
  /** 过期时间描述 */
  ttlDesc: string
  /** 数据大小（字节） */
  dataSize: number
  /** 数据类型 */
  dataType: string
  /** 创建时间（时间戳） */
  createTime: number
}

/** 缓存键查询参数 */
export interface CacheKeyQueryParams {
  /** 缓存名称 */
  cacheName?: string
  /** 关键字搜索 */
  keyword?: string
  /** 页码，默认1 */
  pageNum?: number
  /** 每页大小，默认10 */
  pageSize?: number
}

/** 分页响应数据 */
export interface PageResult<T> {
  /** 数据列表 */
  list: T[]
  /** 总数量 */
  total: number
  /** 当前页码 */
  pageNum?: number
  /** 每页大小 */
  pageSize?: number
  /** 总页数 */
  totalPages?: number
}

/** 缓存键分页响应数据 */
export type CacheKeyPageData = PageResult<CacheKeyInfo>

// ===== 缓存详情相关类型 =====

/** 缓存详细信息 */
export interface CacheDetail {
  /** 缓存键名 */
  cacheKey: string
  /** 缓存值（完整内容） */
  value: unknown
  /** 缓存类型 */
  type: string
  /** 过期时间 */
  expireTime?: string
  /** 创建时间 */
  createTime?: string
}

// ===== Redis信息相关类型 =====

/** Redis服务器信息 */
export interface RedisInfo {
  /** Redis版本 */
  redisVersion?: string
  /** 运行模式 */
  mode?: string
  /** 连接客户端数 */
  connectedClients?: number
  /** 已使用内存（字节） */
  usedMemory?: number
  /** 最大内存（字节） */
  maxMemory?: number
  /** 内存使用率 */
  memoryUsage?: number
  /** 键总数 */
  totalKeys?: number
  /** 过期键数 */
  expiredKeys?: number
  /** 命中率 */
  hitRate?: number
  /** 每秒操作数 */
  opsPerSecond?: number
  /** 运行时长（秒） */
  uptimeInSeconds?: number
}

// ===== 统计信息相关类型 =====

/** 缓存统计信息 */
export interface CacheStatistics {
  /** 总缓存键数（后端返回字符串） */
  totalKeys: string | number
  /** 已使用内存（字节，后端返回字符串） */
  memoryUsed?: string | number
  /** 命中率（百分比） */
  hitRate: number
  /** QPS（每秒查询数，后端返回字符串） */
  qps?: string | number
  /** 今日命中次数 */
  todayHits?: number
  /** 今日未命中次数 */
  todayMisses?: number
  /** 平均响应时间（毫秒） */
  avgResponseTime?: number
}

// ===== 图表数据相关类型 =====

/** 饼图数据点 */
export interface PieChartDataPoint {
  /** 扇形标签名称 */
  name: string
  /** 扇形数值 */
  value: number
}

/** 仪表盘数据 */
export interface GaugeChartData {
  /** 当前数值 */
  value: number
  /** 最小值 */
  min: number
  /** 最大值 */
  max: number
  /** 显示名称 */
  name: string
}

// ===== 缓存日志相关类型 =====

/** 缓存操作日志（旧版本） */
export interface CacheLog {
  /** 日志ID */
  id: string
  /** 操作类型：READ/WRITE/DELETE/EXPIRE */
  operation: 'READ' | 'WRITE' | 'DELETE' | 'EXPIRE'
  /** 缓存键名 */
  cacheKey: string
  /** 操作结果：SUCCESS/FAILURE/MISS */
  result: 'SUCCESS' | 'FAILURE' | 'MISS'
  /** 操作耗时（毫秒） */
  duration?: number
  /** 操作时间 */
  timestamp: string
  /** 操作者 */
  operator?: string
}

/** 缓存操作日志（新版本，支持操作日志列表） */
export interface CacheOperationLog {
  /** 日志ID */
  id: string
  /** 实例ID */
  instanceId: string
  /** 操作时间 */
  operTime: string
  /** 操作类型 */
  operType: 'refresh' | 'batchDelete' | 'delete' | 'warmup' | 'clear' | string
  /** 操作消息 */
  message: string
  /** 操作结果 */
  result: 'success' | 'failure' | string
}

// ===== 预热相关类型 =====

/** 缓存预热请求参数 */
export interface WarmupRequestParams {
  /** 需要预热的缓存名称列表 */
  cacheNames?: string[]
}

/** 单个缓存预热结果 */
export interface WarmupResult {
  /** 缓存名称 */
  cacheName: string
  /** 是否成功 */
  success: boolean
  /** 预热数量 */
  count: number
  /** 耗时（毫秒） */
  duration: number
}

// ===== TTL刷新参数 =====

/** 刷新TTL参数 */
export interface RefreshTtlParams {
  /** 缓存键名 */
  cacheKey: string
  /** 新的TTL（秒），不传则使用默认值 */
  ttl?: number
}

/** 批量刷新TTL参数 */
export interface BatchRefreshTtlParams {
  /** 缓存键名与TTL的映射 */
  cacheKeyTtlMap: Record<string, number>
}