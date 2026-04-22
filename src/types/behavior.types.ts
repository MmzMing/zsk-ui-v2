/**
 * 行为审计类型定义
 *
 * 对接后端：
 *   /api/system/monitor/behavior/users   行为审计用户列表
 *   /api/system/monitor/behavior/events  分页查询用户行为
 *   /api/system/monitor/behavior/{id}    行为详情
 */

// ===== 1. 枚举与字面量类型 =====

/** 操作状态：0 正常，1 异常 */
export type BehaviorStatus = 0 | 1

/**
 * 行为类型代码
 * 与后端 businessType 对齐：
 * 0 其它 / 1 新增 / 2 修改 / 3 删除 / 4 授权 / 5 导出 / 6 导入
 * 7 强退 / 8 生成代码 / 9 清空数据 / 10 查询
 */
export type BehaviorBusinessType =
  | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

/** 风险等级（后端按操作次数计算：>100 high / >50 medium / 其它 low） */
export type BehaviorRiskLevel = 'low' | 'medium' | 'high'

// ===== 2. 实体定义 =====

/**
 * 行为审计用户聚合
 * 来源：GET /api/system/monitor/behavior/users
 */
export interface BehaviorUser {
  /** 操作人员（账号名，对应 sys_user.user_name） */
  operName: string
  /** 累计行为次数 */
  operCount: number
  /** 最近一次行为时间（yyyy-MM-dd HH:mm:ss） */
  lastOperTime: string
  /** 最近一次行为IP */
  lastOperIp: string
  /** 风险等级 */
  riskLevel: BehaviorRiskLevel
}

/**
 * 行为事件（列表项）
 * 来源：GET /api/system/monitor/behavior/events
 *
 * 备注：列表场景下后端会将 operParam / jsonResult 截断到 200 字符；
 *      若需完整内容请调用「行为详情」接口。
 */
export interface BehaviorEvent {
  /** 行为记录ID（MongoDB _id） */
  id: string
  /** 操作人员账号 */
  operName: string
  /** 模块标题（行为内容） */
  title: string
  /** 行为类型代码 */
  businessType: BehaviorBusinessType
  /** 行为类型名称（后端冗余字段，避免前端再做枚举翻译时的延迟） */
  actionType: string
  /** 请求URL */
  operUrl: string
  /** 请求方式 */
  requestMethod: string
  /** 请求参数（最多 200 字符，超出截断） */
  operParam: string
  /** 响应结果（最多 200 字符，超出截断） */
  jsonResult: string
  /** 操作IP */
  operIp: string
  /** 操作地点（IP 解析） */
  operLocation: string
  /** 操作状态（0正常 1异常） */
  status: BehaviorStatus
  /** 行为时间（yyyy-MM-dd HH:mm:ss） */
  operTime: string
  /** 耗时（毫秒） */
  costTime: number
}

/**
 * 行为详情
 * 来源：GET /api/system/monitor/behavior/{id}
 *
 * 与列表项相比额外携带：
 *   - method   控制器方法签名
 *   - errorMsg status=1 时的错误消息
 * 同时 operParam / jsonResult 不再截断。
 */
export interface BehaviorDetail extends BehaviorEvent {
  /** 控制器方法（全限定名 + 方法签名） */
  method?: string
  /** 错误消息（status=1 时有值） */
  errorMsg?: string | null
}

// ===== 3. 查询参数 =====

/**
 * 行为分页查询参数
 * 对应 GET /api/system/monitor/behavior/events
 */
export interface BehaviorQueryParams {
  /** 页码，默认 1 */
  pageNum?: number
  /** 每页大小，默认 10，最大 500 */
  pageSize?: number
  /** 操作人员账号（精确匹配，前端从用户列表选择） */
  userName?: string
  /** 行为类型代码 */
  businessType?: BehaviorBusinessType
  /** 模块标题（模糊查询） */
  title?: string
  /** 操作IP（模糊查询） */
  operIp?: string
  /** 操作状态（0正常 1异常） */
  status?: BehaviorStatus
  /** 行为开始时间（yyyy-MM-dd HH:mm:ss） */
  beginTime?: string
  /** 行为结束时间（yyyy-MM-dd HH:mm:ss） */
  endTime?: string
}

// ===== 4. 分页响应 =====

/**
 * 行为分页响应数据
 * 与后端通用分页结构保持一致
 */
export interface BehaviorPageData {
  list: BehaviorEvent[]
  total: number
  pageNum: number
  pageSize: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

// ===== 5. 选项常量（供 Select 组件直接消费） =====

/** Select 选项通用结构 */
interface SelectOption<T> {
  value: T
  label: string
}

/** 行为类型选项 */
export const BEHAVIOR_BUSINESS_TYPE_OPTIONS: SelectOption<BehaviorBusinessType>[] = [
  { value: 0, label: '其它' },
  { value: 1, label: '新增' },
  { value: 2, label: '修改' },
  { value: 3, label: '删除' },
  { value: 4, label: '授权' },
  { value: 5, label: '导出' },
  { value: 6, label: '导入' },
  { value: 7, label: '强退' },
  { value: 8, label: '生成代码' },
  { value: 9, label: '清空数据' },
  { value: 10, label: '查询' },
]

/** 操作状态选项 */
export const BEHAVIOR_STATUS_OPTIONS: SelectOption<BehaviorStatus>[] = [
  { value: 0, label: '正常' },
  { value: 1, label: '异常' },
]

/** 风险等级 → HeroUI 颜色映射（用于 Chip 着色） */
export const BEHAVIOR_RISK_COLOR_MAP: Record<BehaviorRiskLevel, 'success' | 'warning' | 'danger'> = {
  low: 'success',
  medium: 'warning',
  high: 'danger',
}

/** 风险等级 → 中文标签 */
export const BEHAVIOR_RISK_LABEL_MAP: Record<BehaviorRiskLevel, string> = {
  low: '低',
  medium: '中',
  high: '高',
}
