/**
 * 用户行为页面（系统运维 → 用户行为）
 *
 * 页面布局：
 * - 顶部 Card：在线用户列表（用户维度，一用户一行 + 多设备数）
 * - 下方 Card：用户行为列表（按 operTime 倒序的行为事件）
 * - 弹窗组件：行为详情、强制下线确认
 *
 * 功能模块：
 * - 在线用户：分页、按用户名/昵称/IP 模糊搜索、强制下线（单个/批量）
 * - 用户行为：分页、按业务类型/状态/时间/IP/操作人/标题筛选
 * - 行为详情：完整请求参数、响应结果、方法签名、错误信息
 *
 * 后端接口：
 * - GET  /api/system/login/online/page          分页在线用户
 * - POST /api/system/login/online/forceLogout   按 userId 批量强制下线
 * - GET  /api/system/monitor/behavior/users     行为审计用户聚合（侧边筛选源）
 * - GET  /api/system/monitor/behavior/events    分页行为列表
 * - GET  /api/system/monitor/behavior/{id}      行为详情
 */

// ===== 1. 依赖导入区域 =====

// React 核心
import { useState, useEffect, useCallback, Fragment, useMemo } from 'react'

// HeroUI 组件
import {
  Avatar,
  Button,
  Input,
  Select,
  SelectItem,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Card,
  CardBody,
  useDisclosure,
  Tooltip,
  Pagination,
  Spinner,
} from '@heroui/react'

// 图标（Lucide React）
import {
  Search,
  RefreshCw,
  Users,
  Activity,
  Eye,
  RotateCcw,
  LogOut,
  Clock,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react'

// 工具函数
import { toast } from '@/utils/toast'
import { formatDateTime } from '@/utils/format'

// 常量
import { PAGINATION } from '@/constants'

// 通用状态组件
import { StatusState } from '@/components/ui/StatusState'

// API 接口
import { getOnlineUserPage, forceLogoutUsers } from '@/api/admin/online'
import {
  getBehaviorEventsPage,
  getBehaviorDetail,
} from '@/api/admin/behavior'

// 类型定义
import type {
  OnlineUser,
  OnlineUserQueryParams,
} from '@/types/online.types'
import type {
  BehaviorEvent,
  BehaviorDetail,
  BehaviorQueryParams,
  BehaviorBusinessType,
  BehaviorStatus,
} from '@/types/behavior.types'
import {
  BEHAVIOR_BUSINESS_TYPE_OPTIONS,
  BEHAVIOR_STATUS_OPTIONS,
} from '@/types/behavior.types'

// ============================================================================
// 子组件：行为详情弹窗
// ----------------------------------------------------------------------------
// 加载详情时会触发 GET /api/system/monitor/behavior/{id}，拿到完整 operParam /
// jsonResult / method / errorMsg 后渲染。详情数据由父组件统一加载并通过 props 传入，
// 弹窗本身仅负责渲染与格式化。
// ============================================================================

interface BehaviorDetailModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  /** 详情数据；为 null 时不渲染内容 */
  detail: BehaviorDetail | null
  /** 是否处于加载中 */
  loading: boolean
}

function BehaviorDetailModal({
  isOpen,
  onOpenChange,
  detail,
  loading,
}: BehaviorDetailModalProps) {
  /** 尝试格式化 JSON 字符串，失败则原样返回 */
  const formatJsonString = useCallback((str?: string | null): string => {
    if (!str) return '-'
    try {
      return JSON.stringify(JSON.parse(str), null, 2)
    } catch {
      return str
    }
  }, [])

  /** 行为类型代码 → 中文名称（容错回落到后端 actionType） */
  const getBusinessTypeLabel = useCallback(
    (code: BehaviorBusinessType, fallback?: string) => {
      const found = BEHAVIOR_BUSINESS_TYPE_OPTIONS.find(item => item.value === code)
      return found?.label || fallback || String(code)
    },
    [],
  )

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <Activity size={18} className="text-primary" />
          <span>行为详情</span>
          {detail && (
            <Chip size="sm" variant="flat" color="primary">
              {getBusinessTypeLabel(detail.businessType, detail.actionType)}
            </Chip>
          )}
        </ModalHeader>
        <ModalBody className="gap-4 pb-6">
          {loading || !detail ? (
            <div className="flex items-center justify-center py-10">
              <Spinner size="md" label="加载详情中..." />
            </div>
          ) : (
            <>
              {/* 基本信息：网格展示 */}
              <div className="grid grid-cols-2 gap-3">
                <DetailCell label="行为ID" value={detail.id} mono />
                <DetailCell label="操作人" value={detail.operName || '-'} />
                <DetailCell label="模块标题" value={detail.title || '-'} />
                <DetailCell
                  label="操作状态"
                  custom={
                    <div className="flex items-center gap-1">
                      {detail.status === 0 ? (
                        <CheckCircle2 size={14} className="text-success" />
                      ) : (
                        <AlertCircle size={14} className="text-danger" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          detail.status === 0 ? 'text-success' : 'text-danger'
                        }`}
                      >
                        {detail.status === 0 ? '正常' : '异常'}
                      </span>
                    </div>
                  }
                />
                <DetailCell
                  label="请求方式"
                  custom={
                    <Chip size="sm" variant="flat" color="secondary">
                      {detail.requestMethod}
                    </Chip>
                  }
                />
                <DetailCell label="耗时" value={`${detail.costTime}ms`} />
                <DetailCell label="操作IP" value={detail.operIp || '-'} mono />
                <DetailCell label="操作地点" value={detail.operLocation || '-'} />
                <DetailCell label="行为时间" value={formatDateTime(detail.operTime)} />
                {detail.method && (
                  <DetailCell label="方法签名" value={detail.method} mono fullSpan />
                )}
              </div>

              {/* 请求URL */}
              <div className="p-3 bg-default-50 rounded-lg">
                <div className="text-xs text-default-400 mb-1">请求URL</div>
                <div className="text-sm font-mono break-all">{detail.operUrl || '-'}</div>
              </div>

              {/* 请求参数 */}
              <div className="p-3 bg-default-50 rounded-lg">
                <div className="text-xs text-default-400 mb-1">请求参数</div>
                <pre className="text-xs font-mono whitespace-pre-wrap break-all max-h-48 overflow-auto bg-default-100 p-2 rounded">
                  {formatJsonString(detail.operParam)}
                </pre>
              </div>

              {/* 响应结果 */}
              <div className="p-3 bg-default-50 rounded-lg">
                <div className="text-xs text-default-400 mb-1">响应结果</div>
                <pre className="text-xs font-mono whitespace-pre-wrap break-all max-h-48 overflow-auto bg-default-100 p-2 rounded">
                  {formatJsonString(detail.jsonResult)}
                </pre>
              </div>

              {/* 错误信息（仅异常时显示） */}
              {detail.status === 1 && detail.errorMsg && (
                <div className="p-3 bg-danger-50 rounded-lg border border-danger-100">
                  <div className="text-xs text-danger-500 mb-1 flex items-center gap-1">
                    <ShieldAlert size={12} /> 错误信息
                  </div>
                  <pre className="text-xs font-mono whitespace-pre-wrap break-all max-h-32 overflow-auto text-danger-600">
                    {detail.errorMsg}
                  </pre>
                </div>
              )}
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={() => onOpenChange(false)}>
            关闭
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

/**
 * 详情面板单元格（标签 + 值）
 * 抽出来仅是为了避免 JSX 中重复的 div 结构
 */
function DetailCell({
  label,
  value,
  custom,
  mono = false,
  fullSpan = false,
}: {
  label: string
  value?: string
  custom?: React.ReactNode
  mono?: boolean
  fullSpan?: boolean
}) {
  return (
    <div className={`p-3 bg-default-50 rounded-lg ${fullSpan ? 'col-span-2' : ''}`}>
      <div className="text-xs text-default-400 mb-1">{label}</div>
      {custom ?? (
        <div className={`text-sm font-medium ${mono ? 'font-mono break-all' : ''}`}>
          {value}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// 子组件：强制下线确认弹窗
// ----------------------------------------------------------------------------
// 后端 forceLogout 是按 userId 批量执行（一次踢光所有设备），所以这里只需要展示
// 即将下线的人数即可，不需要按 token 维度展示。
// ============================================================================

interface ForceLogoutModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  selectedCount: number
  onConfirm: () => void
}

function ForceLogoutModal({
  isOpen,
  onOpenChange,
  selectedCount,
  onConfirm,
}: ForceLogoutModalProps) {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="sm">
      <ModalContent>
        <ModalHeader>
          <div className="flex items-center gap-2 text-danger">
            <LogOut size={18} />
            <span>强制下线确认</span>
          </div>
        </ModalHeader>
        <ModalBody>
          <p className="text-sm text-default-600">
            确定要强制下线选中的 {selectedCount} 位用户吗？此操作会清除其全部设备的登录状态。
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={() => onOpenChange(false)}>
            取消
          </Button>
          <Button
            color="danger"
            onPress={() => {
              onConfirm()
              onOpenChange(false)
            }}
          >
            确认下线
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

// ============================================================================
// 主组件：用户行为页面
// ============================================================================

export default function BehaviorPage() {
  // ===== 3. 状态控制逻辑区域 =====

  // ----- 在线用户表格状态 -----
  /** 在线用户列表数据 */
  const [onlineList, setOnlineList] = useState<OnlineUser[]>([])
  /** 在线用户加载状态 */
  const [onlineLoading, setOnlineLoading] = useState(false)
  /** 在线用户多选选中的 userId 集合（HeroUI 选中 key 为字符串，序列化前后注意类型） */
  const [onlineSelectedKeys, setOnlineSelectedKeys] = useState<Set<string>>(new Set())
  /** 在线用户分页 */
  const [onlinePageNum, setOnlinePageNum] = useState<number>(PAGINATION.DEFAULT_PAGE)
  const [onlinePageSize, setOnlinePageSize] = useState<number>(PAGINATION.DEFAULT_PAGE_SIZE)
  const [onlineTotal, setOnlineTotal] = useState(0)
  /** 在线用户搜索关键字（统一用 userName + nickName 模糊搜） */
  const [onlineSearch, setOnlineSearch] = useState('')
  const [onlineSearchInput, setOnlineSearchInput] = useState('')

  /** 强制下线弹窗 + 操作 loading */
  const forceLogoutModal = useDisclosure()
  const [forceLogoutLoading, setForceLogoutLoading] = useState(false)

  // ----- 行为列表表格状态 -----
  /** 行为列表数据 */
  const [behaviorList, setBehaviorList] = useState<BehaviorEvent[]>([])
  const [behaviorLoading, setBehaviorLoading] = useState(false)
  /** 行为查询参数（仅落已生效的部分；输入区另存在 input 状态中） */
  const [behaviorParams, setBehaviorParams] = useState<BehaviorQueryParams>({})
  /** 行为分页 */
  const [behaviorPageNum, setBehaviorPageNum] = useState<number>(PAGINATION.DEFAULT_PAGE)
  const [behaviorPageSize, setBehaviorPageSize] = useState<number>(PAGINATION.DEFAULT_PAGE_SIZE)
  const [behaviorTotal, setBehaviorTotal] = useState(0)

  /** 输入区状态：标题 / IP / 业务类型 / 状态 / 时间范围
   *  注意：操作人不再独立输入，由「在线用户」表格的点击选中驱动 */
  const [filterTitle, setFilterTitle] = useState('')
  const [filterOperIp, setFilterOperIp] = useState('')
  const [filterBusinessType, setFilterBusinessType] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [filterBeginTime, setFilterBeginTime] = useState('')
  const [filterEndTime, setFilterEndTime] = useState('')

  /** 当前选中的目标用户（来自上方在线用户表格的行点击）
   *  - userName 为后端精确匹配条件
   *  - nickName 用于在标题处展示更友好的名字
   *  未选中时下方行为列表不发起查询 */
  const [selectedUser, setSelectedUser] = useState<{
    userName: string
    nickName?: string
  } | null>(null)

  /** 详情弹窗与当前详情数据 */
  const detailModal = useDisclosure()
  const [currentDetail, setCurrentDetail] = useState<BehaviorDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  // ===== 4. 通用工具函数区域 =====

  /** 业务类型代码 → 标签（容错使用后端冗余 actionType） */
  const getBusinessTypeLabel = useCallback(
    (code: BehaviorBusinessType, fallback?: string) => {
      const found = BEHAVIOR_BUSINESS_TYPE_OPTIONS.find(item => item.value === code)
      return found?.label || fallback || String(code)
    },
    [],
  )

  /** 在线时长（秒）→ 中文展示 */
  const formatDuration = useCallback((seconds: number): string => {
    if (!seconds || seconds < 0) return '-'
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) return `${h}小时${m}分`
    if (m > 0) return `${m}分${s}秒`
    return `${s}秒`
  }, [])

  // ===== 7. 数据处理函数区域 =====

  /** 拉取在线用户分页数据 */
  const fetchOnlineList = useCallback(async () => {
    setOnlineLoading(true)
    try {
      const params: OnlineUserQueryParams = {
        pageNum: onlinePageNum,
        pageSize: onlinePageSize,
        // 搜索关键字优先按 userName 模糊查；空值由 API 层过滤
        userName: onlineSearch || undefined,
      }
      const data = await getOnlineUserPage(params)
      if (data && Array.isArray(data.list)) {
        setOnlineList(data.list)
        setOnlineTotal(Number(data.total) || 0)
      } else {
        setOnlineList([])
        setOnlineTotal(0)
      }
    } catch (error) {
      console.error('获取在线用户列表失败：', error)
      toast.error('获取在线用户列表失败')
      setOnlineList([])
      setOnlineTotal(0)
    } finally {
      setOnlineLoading(false)
    }
  }, [onlinePageNum, onlinePageSize, onlineSearch])

  /** 拉取行为列表分页数据
   *  仅当 selectedUser 存在时发起请求；userName 始终强制为选中用户的账号 */
  const fetchBehaviorList = useCallback(async () => {
    if (!selectedUser) {
      // 未选中用户，清空旧数据避免误导
      setBehaviorList([])
      setBehaviorTotal(0)
      return
    }
    setBehaviorLoading(true)
    try {
      const params: BehaviorQueryParams = {
        ...behaviorParams,
        userName: selectedUser.userName,
        pageNum: behaviorPageNum,
        pageSize: behaviorPageSize,
      }
      const data = await getBehaviorEventsPage(params)
      if (data && Array.isArray(data.list)) {
        setBehaviorList(data.list)
        setBehaviorTotal(Number(data.total) || 0)
      } else {
        setBehaviorList([])
        setBehaviorTotal(0)
      }
    } catch (error) {
      console.error('获取用户行为列表失败：', error)
      toast.error('获取用户行为列表失败')
      setBehaviorList([])
      setBehaviorTotal(0)
    } finally {
      setBehaviorLoading(false)
    }
  }, [selectedUser, behaviorParams, behaviorPageNum, behaviorPageSize])

  /** 强制下线选中用户 */
  const handleForceLogout = useCallback(async () => {
    const userIds = Array.from(onlineSelectedKeys)
      .map(key => Number(key))
      .filter(id => !Number.isNaN(id))
    if (userIds.length === 0) {
      toast.warning('请选择要下线的用户')
      return
    }
    setForceLogoutLoading(true)
    try {
      await forceLogoutUsers(userIds)
      toast.success(`已强制下线 ${userIds.length} 位用户`)
      setOnlineSelectedKeys(new Set())
      fetchOnlineList()
    } catch (error) {
      const message = error instanceof Error ? error.message : '强制下线失败'
      toast.error(message)
      console.error('强制下线失败：', error)
    } finally {
      setForceLogoutLoading(false)
    }
  }, [onlineSelectedKeys, fetchOnlineList])

  /** 单个强制下线 */
  const handleForceLogoutSingle = useCallback(
    async (userId: number) => {
      setForceLogoutLoading(true)
      try {
        await forceLogoutUsers([userId])
        toast.success('用户已下线')
        setOnlineSelectedKeys(prev => {
          const next = new Set(prev)
          next.delete(String(userId))
          return next
        })
        fetchOnlineList()
      } catch (error) {
        const message = error instanceof Error ? error.message : '强制下线失败'
        toast.error(message)
        console.error('单个强制下线失败：', error)
      } finally {
        setForceLogoutLoading(false)
      }
    },
    [fetchOnlineList],
  )

  /** 查看行为详情 */
  const handleViewDetail = useCallback(
    async (id: string) => {
      setDetailLoading(true)
      setCurrentDetail(null)
      detailModal.onOpen()
      try {
        const data = await getBehaviorDetail(id)
        setCurrentDetail(data)
      } catch (error) {
        const message = error instanceof Error ? error.message : '获取行为详情失败'
        toast.error(message)
        console.error('获取行为详情失败：', error)
        detailModal.onClose()
      } finally {
        setDetailLoading(false)
      }
    },
    [detailModal],
  )

  // ===== 8. UI 渲染逻辑区域（事件处理） =====

  /** 在线用户搜索：回车或点击搜索时把输入态同步到查询态 */
  const handleOnlineSearch = useCallback(() => {
    setOnlineSearch(onlineSearchInput.trim())
    setOnlinePageNum(1)
  }, [onlineSearchInput])

  /** 业务类型筛选 */
  const handleBusinessTypeChange = useCallback((keys: 'all' | Set<React.Key>) => {
    if (keys === 'all') return
    const value = Array.from(keys)[0] as string
    setFilterBusinessType(value)
    setBehaviorParams(prev => ({
      ...prev,
      businessType:
        value !== '' && value !== undefined
          ? (Number(value) as BehaviorBusinessType)
          : undefined,
    }))
    setBehaviorPageNum(1)
  }, [])

  /** 操作状态筛选 */
  const handleStatusChange = useCallback((keys: 'all' | Set<React.Key>) => {
    if (keys === 'all') return
    const value = Array.from(keys)[0] as string
    setFilterStatus(value)
    setBehaviorParams(prev => ({
      ...prev,
      status:
        value !== '' && value !== undefined
          ? (Number(value) as BehaviorStatus)
          : undefined,
    }))
    setBehaviorPageNum(1)
  }, [])

  /** 操作人精确匹配已改为由上方「在线用户」行点击选中驱动，此处不再需要 */

  /** 模块标题模糊匹配 */
  const handleApplyTitle = useCallback(() => {
    setBehaviorParams(prev => ({
      ...prev,
      title: filterTitle.trim() || undefined,
    }))
    setBehaviorPageNum(1)
  }, [filterTitle])

  /** 操作IP模糊匹配 */
  const handleApplyOperIp = useCallback(() => {
    setBehaviorParams(prev => ({
      ...prev,
      operIp: filterOperIp.trim() || undefined,
    }))
    setBehaviorPageNum(1)
  }, [filterOperIp])

  /** 时间范围 */
  const handleBeginTimeChange = useCallback((value: string) => {
    setFilterBeginTime(value)
    setBehaviorParams(prev => ({ ...prev, beginTime: value || undefined }))
    setBehaviorPageNum(1)
  }, [])

  const handleEndTimeChange = useCallback((value: string) => {
    setFilterEndTime(value)
    setBehaviorParams(prev => ({ ...prev, endTime: value || undefined }))
    setBehaviorPageNum(1)
  }, [])

  /** 重置行为筛选条件（不清除选中用户，保留当前目标） */
  const handleResetBehavior = useCallback(() => {
    setBehaviorParams({})
    setFilterTitle('')
    setFilterOperIp('')
    setFilterBusinessType('')
    setFilterStatus('')
    setFilterBeginTime('')
    setFilterEndTime('')
    setBehaviorPageNum(1)
  }, [])

  /** 取消选中用户，回到「请先选择用户」状态 */
  const handleClearSelectedUser = useCallback(() => {
    setSelectedUser(null)
    setBehaviorParams({})
    setFilterTitle('')
    setFilterOperIp('')
    setFilterBusinessType('')
    setFilterStatus('')
    setFilterBeginTime('')
    setFilterEndTime('')
    setBehaviorPageNum(1)
  }, [])

  /** 行为分页大小变更 */
  const handleBehaviorPageSizeChange = useCallback((keys: 'all' | Set<React.Key>) => {
    if (keys === 'all') return
    const value = Array.from(keys)[0] as string
    setBehaviorPageSize(Number(value))
    setBehaviorPageNum(1)
  }, [])

  /** 在线用户分页大小变更 */
  const handleOnlinePageSizeChange = useCallback((keys: 'all' | Set<React.Key>) => {
    if (keys === 'all') return
    const value = Array.from(keys)[0] as string
    setOnlinePageSize(Number(value))
    setOnlinePageNum(1)
  }, [])

  /** 打开强制下线确认弹窗 */
  const handleOpenForceLogout = useCallback(() => {
    if (onlineSelectedKeys.size === 0) {
      toast.warning('请先选择要下线的用户')
      return
    }
    forceLogoutModal.onOpen()
  }, [onlineSelectedKeys, forceLogoutModal])

  // ===== 9. 页面初始化与事件绑定 =====

  /** 初次加载 + 查询条件变化时重新拉取 */
  useEffect(() => {
    fetchOnlineList()
  }, [fetchOnlineList])

  useEffect(() => {
    fetchBehaviorList()
  }, [fetchBehaviorList])

  /** HeroUI 表格分页总数 */
  const onlineTotalPages = useMemo(
    () => Math.max(1, Math.ceil(onlineTotal / onlinePageSize)),
    [onlineTotal, onlinePageSize],
  )
  const behaviorTotalPages = useMemo(
    () => Math.max(1, Math.ceil(behaviorTotal / behaviorPageSize)),
    [behaviorTotal, behaviorPageSize],
  )

  // ===== 11. 导出区域：渲染 =====

  return (
    <div className="flex flex-col gap-4 p-4 md:p-0">
      {/* ===== 在线用户卡片 ===== */}
      <Card className="overflow-hidden">
        <CardBody className="p-0 flex flex-col overflow-hidden">
          {/* 标题栏 */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-default-800">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-primary" />
              <span className="font-semibold text-sm">在线用户</span>
              <Chip size="sm" variant="flat" color="primary">
                共 {onlineTotal} 人
              </Chip>
            </div>
            <div className="flex items-center gap-2">
              <Tooltip content="刷新数据" size="sm">
                <Button
                  size="sm"
                  variant="light"
                  isIconOnly
                  startContent={<RefreshCw size={14} />}
                  onPress={fetchOnlineList}
                  isLoading={onlineLoading}
                />
              </Tooltip>
            </div>
          </div>

          {/* 工具栏 */}
          <div className="px-4 py-3 border-b border-default-800">
            <div className="flex items-center gap-2 flex-wrap">
              <Input
                size="sm"
                placeholder="搜索用户账号"
                className="w-full sm:w-56"
                value={onlineSearchInput}
                onValueChange={setOnlineSearchInput}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleOnlineSearch()
                }}
                startContent={<Search size={14} className="text-default-400" />}
                isClearable
                onClear={() => {
                  setOnlineSearchInput('')
                  setOnlineSearch('')
                  setOnlinePageNum(1)
                }}
              />
              <Button size="sm" variant="flat" onPress={handleOnlineSearch}>
                搜索
              </Button>
              <div className="hidden sm:flex-1" />
              {onlineSelectedKeys.size > 0 && (
                <Button
                  size="sm"
                  variant="flat"
                  color="danger"
                  startContent={<LogOut size={14} />}
                  onPress={handleOpenForceLogout}
                  isLoading={forceLogoutLoading}
                >
                  批量下线({onlineSelectedKeys.size})
                </Button>
              )}
            </div>
          </div>

          {/* 表格 */}
          <div className="p-3 overflow-auto">
            {onlineLoading ? (
              <StatusState type="loading" scene="admin" />
            ) : (
              <Table
                aria-label="在线用户列表"
                selectionMode="multiple"
                selectedKeys={onlineSelectedKeys}
                onSelectionChange={keys => setOnlineSelectedKeys(keys as Set<string>)}
                onRowAction={(key) => {
                  const item = onlineList.find(u => String(u.userId) === String(key))
                  if (!item) return
                  setSelectedUser({
                    userName: item.userName,
                    nickName: item.nickName,
                  })
                  setBehaviorParams({})
                  setFilterTitle('')
                  setFilterOperIp('')
                  setFilterBusinessType('')
                  setFilterStatus('')
                  setFilterBeginTime('')
                  setFilterEndTime('')
                  setBehaviorPageNum(1)
                }}
                classNames={{ wrapper: 'p-0', thead: '[&>tr]:first:shadow-none' }}
              >
                <TableHeader>
                  <TableColumn key="user">用户信息</TableColumn>
                  <TableColumn key="ipaddr">登录IP</TableColumn>
                  <TableColumn key="loginLocation" className="hidden md:table-cell">
                    登录地点
                  </TableColumn>
                  <TableColumn key="loginTime">最近登录时间</TableColumn>
                  <TableColumn key="onlineDuration" className="hidden md:table-cell">
                    在线时长
                  </TableColumn>
                  <TableColumn key="deviceCount">设备数</TableColumn>
                  <TableColumn key="actions">操作</TableColumn>
                </TableHeader>
                <TableBody
                  items={onlineList.map(item => ({ ...item, key: String(item.userId) }))}
                  emptyContent={<StatusState type="empty" scene="admin" />}
                >
                  {item => (
                    <TableRow
                      key={String(item.userId)}
                      className={`cursor-pointer transition-colors ${
                        selectedUser?.userName === item.userName
                          ? 'bg-primary/10'
                          : 'hover:bg-default-100'
                      }`}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar src={item.avatar} name={item.nickName || item.userName} size="sm" />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              {item.nickName || item.userName}
                            </span>
                            <span className="text-xs text-default-400">{item.userName}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-mono text-default-600">
                          {item.ipaddr || '-'}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="text-sm text-default-600">{item.loginLocation || '-'}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-default-600">
                          {formatDateTime(item.loginTime)}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-1">
                          <Clock size={12} className="text-default-400" />
                          <span className="text-sm text-default-600">
                            {formatDuration(item.onlineDuration)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip size="sm" variant="flat" color={item.deviceCount > 1 ? 'warning' : 'default'}>
                          {item.deviceCount}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <Tooltip content="强制下线" size="sm">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            color="danger"
                            isLoading={forceLogoutLoading}
                            onPress={() => handleForceLogoutSingle(item.userId)}
                          >
                            <LogOut size={14} />
                          </Button>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>

          {/* 分页 */}
          {onlineTotal > 0 && (
            <div className="flex items-center justify-between px-4 py-2 border-t border-default-800">
              <div className="flex items-center gap-2">
                <Select
                  size="sm"
                  aria-label="在线用户每页条数"
                  className="w-24"
                  selectedKeys={[String(onlinePageSize)]}
                  onSelectionChange={handleOnlinePageSizeChange}
                  renderValue={() => `${onlinePageSize}条/页`}
                >
                  {PAGINATION.PAGE_SIZE_OPTIONS.map(size => (
                    <SelectItem key={String(size)} textValue={String(size)}>
                      {size}条/页
                    </SelectItem>
                  ))}
                </Select>
                <span className="text-xs text-default-400">共 {onlineTotal} 条</span>
              </div>
              <Pagination
                total={onlineTotalPages}
                page={onlinePageNum}
                onChange={setOnlinePageNum}
                size="sm"
                showControls
              />
            </div>
          )}
        </CardBody>
      </Card>

      {/* ===== 用户行为卡片 ===== */}
      <Card className="overflow-hidden">
        <CardBody className="p-0 flex flex-col overflow-hidden">
          {/* 标题栏：展示选中的用户名 */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-default-800">
            <div className="flex items-center gap-2">
              <Activity size={18} className="text-primary" />
              <span className="font-semibold text-sm">用户行为</span>
              {selectedUser ? (
                <>
                  <Chip
                    size="sm"
                    variant="flat"
                    color="secondary"
                    onClose={handleClearSelectedUser}
                  >
                    {selectedUser.nickName || selectedUser.userName}
                  </Chip>
                  <Chip size="sm" variant="flat" color="primary">
                    共 {behaviorTotal} 条
                  </Chip>
                </>
              ) : (
                <span className="text-xs text-default-400">请在上方点击用户查看行为记录</span>
              )}
            </div>
            <Tooltip content="刷新数据" size="sm">
              <Button
                size="sm"
                variant="light"
                isIconOnly
                isDisabled={!selectedUser}
                startContent={<RefreshCw size={14} />}
                onPress={fetchBehaviorList}
                isLoading={behaviorLoading}
              />
            </Tooltip>
          </div>

          {/* 查询工具栏（仅在已选中用户时展示） */}
          {selectedUser && (
          <div className="px-4 py-3 border-b border-default-800">
            <div className="flex items-center gap-2 flex-wrap">
              <Input
                size="sm"
                placeholder="模块标题"
                className="w-full sm:w-40"
                value={filterTitle}
                onValueChange={setFilterTitle}
                onKeyDown={e => e.key === 'Enter' && handleApplyTitle()}
                isClearable
                onClear={() => {
                  setFilterTitle('')
                  setBehaviorParams(prev => ({ ...prev, title: undefined }))
                }}
              />
              <Input
                size="sm"
                placeholder="操作IP"
                className="w-full sm:w-36"
                value={filterOperIp}
                onValueChange={setFilterOperIp}
                onKeyDown={e => e.key === 'Enter' && handleApplyOperIp()}
                isClearable
                onClear={() => {
                  setFilterOperIp('')
                  setBehaviorParams(prev => ({ ...prev, operIp: undefined }))
                }}
              />
              <Select
                size="sm"
                placeholder="行为类型"
                className="w-full sm:w-32"
                aria-label="行为类型筛选"
                selectedKeys={filterBusinessType !== '' ? [filterBusinessType] : []}
                onSelectionChange={handleBusinessTypeChange}
              >
                <Fragment key="business-type-items">
                  {BEHAVIOR_BUSINESS_TYPE_OPTIONS.map(option => (
                    <SelectItem key={String(option.value)} textValue={option.label}>
                      {option.label}
                    </SelectItem>
                  ))}
                </Fragment>
              </Select>
              <Select
                size="sm"
                placeholder="状态"
                className="w-full sm:w-28"
                aria-label="操作状态筛选"
                selectedKeys={filterStatus !== '' ? [filterStatus] : []}
                onSelectionChange={handleStatusChange}
              >
                <Fragment key="status-items">
                  {BEHAVIOR_STATUS_OPTIONS.map(option => (
                    <SelectItem key={String(option.value)} textValue={option.label}>
                      {option.label}
                    </SelectItem>
                  ))}
                </Fragment>
              </Select>
              <Input
                size="sm"
                type="datetime-local"
                aria-label="行为开始时间"
                className="w-full sm:w-44"
                value={filterBeginTime}
                onValueChange={handleBeginTimeChange}
                isClearable
                onClear={() => handleBeginTimeChange('')}
              />
              <Input
                size="sm"
                type="datetime-local"
                aria-label="行为结束时间"
                className="w-full sm:w-44"
                value={filterEndTime}
                onValueChange={handleEndTimeChange}
                isClearable
                onClear={() => handleEndTimeChange('')}
              />
              <Button
                size="sm"
                variant="flat"
                startContent={<RotateCcw size={14} />}
                onPress={handleResetBehavior}
              >
                重置
              </Button>
            </div>
          </div>
          )}

          {/* 表格：未选中用户时展示引导提示 */}
          <div className="p-3 overflow-auto">
            {!selectedUser ? (
              <div className="flex flex-col items-center justify-center py-16 text-default-400">
                <Users size={48} className="mb-3 opacity-40" />
                <p className="text-sm">请在上方「在线用户」列表中点击一位用户</p>
                <p className="text-xs mt-1">点击后将展示该用户的行为记录</p>
              </div>
            ) : behaviorLoading ? (
              <StatusState type="loading" scene="admin" />
            ) : (
              <Table
                aria-label="用户行为列表"
                classNames={{ wrapper: 'p-0', thead: '[&>tr]:first:shadow-none' }}
              >
                <TableHeader>
                  <TableColumn key="title">行为内容</TableColumn>
                  <TableColumn key="businessType">行为类型</TableColumn>
                  <TableColumn key="requestMethod" className="hidden md:table-cell">
                    请求方式
                  </TableColumn>
                  <TableColumn key="operIp" className="hidden lg:table-cell">
                    操作IP
                  </TableColumn>
                  <TableColumn key="operLocation" className="hidden lg:table-cell">
                    操作地点
                  </TableColumn>
                  <TableColumn key="status">状态</TableColumn>
                  <TableColumn key="costTime" className="hidden md:table-cell">
                    耗时
                  </TableColumn>
                  <TableColumn key="operTime">行为时间</TableColumn>
                  <TableColumn key="actions">操作</TableColumn>
                </TableHeader>
                <TableBody
                  items={behaviorList.map(item => ({ ...item, key: item.id }))}
                  emptyContent={<StatusState type="empty" scene="admin" />}
                >
                  {item => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {item.title ? (
                          <Tooltip content={item.title} size="sm">
                            <span className="text-sm text-default-600 truncate max-w-48 block cursor-pointer">
                              {item.title}
                            </span>
                          </Tooltip>
                        ) : (
                          <span className="text-sm text-default-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip size="sm" variant="flat" color="primary">
                          {getBusinessTypeLabel(item.businessType, item.actionType)}
                        </Chip>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Chip size="sm" variant="flat" color="secondary">
                          {item.requestMethod}
                        </Chip>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span className="text-sm font-mono text-default-600">
                          {item.operIp || '-'}
                        </span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span className="text-sm text-default-600">{item.operLocation || '-'}</span>
                      </TableCell>
                      <TableCell>
                        {item.status === 0 ? (
                          <Chip size="sm" variant="flat" color="success" startContent={<CheckCircle2 size={12} />}>
                            正常
                          </Chip>
                        ) : (
                          <Chip size="sm" variant="flat" color="danger" startContent={<AlertCircle size={12} />}>
                            异常
                          </Chip>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-1">
                          <Clock size={12} className="text-default-400" />
                          <span
                            className={`text-sm ${
                              item.costTime > 3000
                                ? 'text-danger'
                                : item.costTime > 1000
                                ? 'text-warning'
                                : 'text-default-600'
                            }`}
                          >
                            {item.costTime}ms
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-default-600">
                          {formatDateTime(item.operTime)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Tooltip content="查看详情" size="sm">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            color="primary"
                            onPress={() => handleViewDetail(item.id)}
                          >
                            <Eye size={14} />
                          </Button>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>

          {/* 分页（仅选中用户且有数据时展示） */}
          {selectedUser && behaviorTotal > 0 && (
            <div className="flex items-center justify-between px-4 py-2 border-t border-default-800">
              <div className="flex items-center gap-2">
                <Select
                  size="sm"
                  aria-label="用户行为每页条数"
                  className="w-24"
                  selectedKeys={[String(behaviorPageSize)]}
                  onSelectionChange={handleBehaviorPageSizeChange}
                  renderValue={() => `${behaviorPageSize}条/页`}
                >
                  {PAGINATION.PAGE_SIZE_OPTIONS.map(size => (
                    <SelectItem key={String(size)} textValue={String(size)}>
                      {size}条/页
                    </SelectItem>
                  ))}
                </Select>
                <span className="text-xs text-default-400">共 {behaviorTotal} 条</span>
              </div>
              <Pagination
                total={behaviorTotalPages}
                page={behaviorPageNum}
                onChange={setBehaviorPageNum}
                size="sm"
                showControls
              />
            </div>
          )}
        </CardBody>
      </Card>

      {/* 行为详情弹窗 */}
      <BehaviorDetailModal
        isOpen={detailModal.isOpen}
        onOpenChange={detailModal.onOpenChange}
        detail={currentDetail}
        loading={detailLoading}
      />

      {/* 强制下线确认弹窗 */}
      <ForceLogoutModal
        isOpen={forceLogoutModal.isOpen}
        onOpenChange={forceLogoutModal.onOpenChange}
        selectedCount={onlineSelectedKeys.size}
        onConfirm={handleForceLogout}
      />
    </div>
  )
}
