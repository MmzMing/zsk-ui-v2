/**
 * 前台审批页面
 *
 * 统一管理文档、视频、文档评论、视频评论的审核流程。
 * 页面布局：Tab切换（审核队列 | 审核日志）+ 工具栏 + 表格 + 分页
 *
 * 核心交互：
 * - 审核队列：按目标类型和审核状态筛选，支持单条/批量审核操作
 * - 审核日志：按目标类型筛选，展示审核操作历史
 * - 审核详情弹窗：展示审核记录完整信息
 * - 审核操作弹窗：通过/驳回，驳回时需填写审核意见和选择违规原因
 */

// ===== 1. 依赖导入区域 =====

// React 核心
import { useState, useEffect, useCallback } from 'react'

// HeroUI 组件
import {
  Button,
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
  Tabs,
  Tab,
  Textarea,
  Checkbox,
  CheckboxGroup,
  Tooltip,
  Pagination,
  Divider,
  Spinner
} from '@heroui/react'

// 图标（Lucide React）
import {
  CheckCircle,
  XCircle,
  RefreshCw,
  ClipboardCheck,
  FileText,
  Eye
} from 'lucide-react'

// 工具函数
import { toast } from '@/utils/toast'
import { formatDateTime } from '@/utils/format'
import { getDictLabel, getDictColor } from '@/stores/dict'
import { DICT_AUDIT_TARGET_TYPE, DICT_RISK_LEVEL } from '@/constants/dict'

// 通用状态组件
import { StatusState } from '@/components/ui/StatusState'

// 常量配置
import { PAGINATION } from '@/constants'

// API 接口
import {
  getAuditQueue,
  getAuditDetail,
  submitAudit,
  submitBatchAudit,
  getAuditLogs,
  getViolationReasons
} from '@/api/admin/audit'

// 类型定义
import type {
  AuditQueueItem,
  AuditDetail,
  AuditLogItem,
  ViolationReason,
  AuditTargetType,
  AuditStatus,
  AuditStatusValue,
  RiskLevel,
  AuditLogResult,
  AuditQueuePageData,
  AuditLogPageData
} from '@/types/audit.types'
import {
  AUDIT_TARGET_TYPE_OPTIONS,
  AUDIT_STATUS_OPTIONS,
  AUDIT_STATUS_NUMBER_MAP
} from '@/types/audit.types'

// ===== 2. TODO待处理导入区域 =====

// ===== 3. 常量定义区域 =====

const DEFAULT_PAGE_SIZE = PAGINATION.DEFAULT_PAGE_SIZE as number
const PAGE_SIZE_OPTIONS = [...PAGINATION.PAGE_SIZE_OPTIONS] as number[]

// ===== 4. 通用工具函数区域 =====

/**
 * 获取审核目标类型的显示标签
 */
function getTargetTypeLabel(targetType: AuditTargetType): string {
  return getDictLabel(DICT_AUDIT_TARGET_TYPE, targetType)
}

/**
 * 获取审核目标类型对应的 Chip 颜色
 */
function getTargetTypeColor(targetType: AuditTargetType): 'primary' | 'secondary' | 'success' | 'warning' {
  return getDictColor(DICT_AUDIT_TARGET_TYPE, targetType, 'primary') as 'primary' | 'secondary' | 'success' | 'warning'
}

/**
 * 获取审核状态的显示标签（基于字符串状态值）
 *
 * @param status - 审核状态字符串值
 * @returns 对应的中文标签
 */
function getAuditStatusLabel(status: AuditStatusValue): string {
  const labelMap: Record<AuditStatusValue, string> = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已驳回',
    withdrawn: '已撤回'
  }
  return labelMap[status] ?? status
}

/**
 * 获取审核状态对应的 Chip 颜色
 *
 * @param status - 审核状态字符串值
 * @returns Chip 颜色
 */
function getAuditStatusColor(status: AuditStatusValue): 'default' | 'success' | 'danger' | 'warning' {
  const colorMap: Record<AuditStatusValue, 'default' | 'success' | 'danger' | 'warning'> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
    withdrawn: 'default'
  }
  return colorMap[status] ?? 'default'
}

/**
 * 获取审核日志结果的显示标签
 *
 * @param result - 审核日志结果（1-通过 2-驳回 3-已撤回）
 * @returns 对应的中文标签
 */
function getAuditLogResultLabel(result: AuditLogResult): string {
  const labelMap: Record<AuditLogResult, string> = {
    1: '通过',
    2: '驳回',
    3: '撤回'
  }
  return labelMap[result] ?? String(result)
}

/**
 * 获取审核日志结果对应的 Chip 颜色
 *
 * @param result - 审核日志结果
 * @returns Chip 颜色
 */
function getAuditLogResultColor(result: AuditLogResult): 'success' | 'danger' | 'default' {
  const colorMap: Record<AuditLogResult, 'success' | 'danger' | 'default'> = {
    1: 'success',
    2: 'danger',
    3: 'default'
  }
  return colorMap[result] ?? 'default'
}

/**
 * 获取风险等级的显示标签
 */
function getRiskLevelLabel(riskLevel: RiskLevel): string {
  return getDictLabel(DICT_RISK_LEVEL, riskLevel)
}

/**
 * 获取风险等级对应的 Chip 颜色
 */
function getRiskLevelColor(riskLevel: RiskLevel): 'success' | 'warning' | 'danger' | 'default' {
  return getDictColor(DICT_RISK_LEVEL, riskLevel, 'default') as 'success' | 'warning' | 'danger' | 'default'
}

// ===== 5. 子组件区域 =====

/**
 * 审核详情弹窗组件
 * 展示审核记录的完整信息，包括审核类型、状态、风险等级、审核意见、违规原因等
 */
interface AuditDetailModalProps {
  /** 弹窗是否打开 */
  isOpen: boolean
  /** 弹窗打开/关闭状态变更回调 */
  onOpenChange: (open: boolean) => void
  /** 目标类型 */
  targetType: AuditTargetType
  /** 目标ID */
  targetId: string
}

function AuditDetailModal({ isOpen, onOpenChange, targetType, targetId }: AuditDetailModalProps) {
  const [detail, setDetail] = useState<AuditDetail | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  /** 弹窗打开时加载审核详情 */
  useEffect(() => {
    if (isOpen && targetType && targetId) {
      fetchDetail()
    }
  }, [isOpen, targetType, targetId])

  /** 获取审核详情数据 */
  const fetchDetail = async () => {
    setIsLoading(true)
    try {
      const data = await getAuditDetail({ targetType, targetId })
      setDetail(data)
    } catch (error) {
      console.error('获取审核详情失败：', error)
      toast.error('获取审核详情失败')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="lg"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader>
          <div className="flex items-center gap-2">
            <Eye size={18} className="text-primary" />
            <span>审核详情</span>
          </div>
        </ModalHeader>
        <ModalBody className="gap-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner size="sm" label="加载中..." />
            </div>
          ) : detail ? (
            <>
              {/* 基本信息 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-3 border-b border-default-800">
                  <h3 className="text-lg font-semibold">{detail.targetTitle}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-default-400">目标类型</label>
                    <Chip size="sm" variant="flat" color={getTargetTypeColor(detail.targetType)}>
                      {getTargetTypeLabel(detail.targetType)}
                    </Chip>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-default-400">审核类型</label>
                    <Chip size="sm" variant="flat" color={detail.auditType === 'ai' ? 'secondary' : 'primary'}>
                      {detail.auditType === 'ai' ? 'AI审核' : '人工审核'}
                    </Chip>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-default-400">审核状态</label>
                    <Chip
                      size="sm"
                      variant="dot"
                      color={getAuditStatusColor(AUDIT_STATUS_NUMBER_MAP[detail.auditStatus])}
                    >
                      {getAuditStatusLabel(AUDIT_STATUS_NUMBER_MAP[detail.auditStatus])}
                    </Chip>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-default-400">风险等级</label>
                    <Chip size="sm" variant="flat" color={getRiskLevelColor(detail.riskLevel)}>
                      {getRiskLevelLabel(detail.riskLevel)}
                    </Chip>
                  </div>
                </div>
              </div>

              <Divider />

              {/* 审核信息 */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">审核信息</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-default-400">审核人</label>
                    <p className="text-sm">{detail.auditorName || '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-default-400">审核时间</label>
                    <p className="text-sm">
                      {detail.auditTime ? formatDateTime(detail.auditTime) : '-'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-default-400">创建时间</label>
                    <p className="text-sm">{formatDateTime(detail.createTime)}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-default-400">审核意见</label>
                  <p className="text-sm bg-default-50 p-2 rounded-md">
                    {detail.auditMind || '无'}
                  </p>
                </div>
                {detail.violationIds && (
                  <div className="space-y-1">
                    <label className="text-xs text-default-400">违规原因ID</label>
                    <p className="text-sm">{detail.violationIds}</p>
                  </div>
                )}
                {detail.auditResult && (
                  <div className="space-y-1">
                    <label className="text-xs text-default-400">AI审核结果</label>
                    <pre className="text-xs bg-default-50 p-2 rounded-md overflow-auto max-h-40">
                      {detail.auditResult}
                    </pre>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-default-400 text-sm">
              暂无审核详情
            </div>
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
 * 审核操作弹窗组件
 * 支持通过和驳回两种操作，驳回时需填写审核意见和选择违规原因
 */
interface AuditActionModalProps {
  /** 弹窗是否打开 */
  isOpen: boolean
  /** 弹窗打开/关闭状态变更回调 */
  onOpenChange: (open: boolean) => void
  /** 审核操作模式：approve-通过 / reject-驳回 */
  mode: 'approve' | 'reject'
  /** 是否批量操作 */
  isBatch: boolean
  /** 目标类型 */
  targetType: AuditTargetType
  /** 目标ID列表 */
  targetIds: string[]
  /** 操作成功后的回调 */
  onSuccess: () => void
}

function AuditActionModal({
  isOpen,
  onOpenChange,
  mode,
  isBatch,
  targetType,
  targetIds,
  onSuccess
}: AuditActionModalProps) {
  const [auditMind, setAuditMind] = useState('')
  const [selectedViolationIds, setSelectedViolationIds] = useState<string[]>([])
  const [violationReasons, setViolationReasons] = useState<ViolationReason[]>([])
  const [isLoadingReasons, setIsLoadingReasons] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  /** 弹窗打开时加载违规原因列表 */
  useEffect(() => {
    if (isOpen && targetType) {
      fetchViolationReasons()
    }
  }, [isOpen, targetType])

  /** 弹窗关闭时重置表单 */
  useEffect(() => {
    if (!isOpen) {
      setAuditMind('')
      setSelectedViolationIds([])
    }
  }, [isOpen])

  /** 获取违规原因列表 */
  const fetchViolationReasons = async () => {
    setIsLoadingReasons(true)
    try {
      const data = await getViolationReasons(targetType)
      setViolationReasons(data)
    } catch (error) {
      console.error('获取违规原因失败：', error)
      toast.error('获取违规原因失败')
    } finally {
      setIsLoadingReasons(false)
    }
  }

  /** 提交审核结果 */
  const handleSubmit = useCallback(async () => {
    if (targetIds.length === 0) {
      toast.warning('请选择审核目标')
      return
    }

    if (mode === 'reject' && !auditMind.trim()) {
      toast.warning('驳回审核时请填写审核意见')
      return
    }

    setIsSubmitting(true)
    try {
      const auditStatus = mode === 'approve' ? 1 : 2
      const submitData = {
        targetType,
        auditStatus: auditStatus as 1 | 2,
        auditMind: auditMind.trim() || undefined,
        violationIds: mode === 'reject' && selectedViolationIds.length > 0
          ? selectedViolationIds
          : undefined
      }

      if (isBatch) {
        await submitBatchAudit({
          ...submitData,
          targetIds
        })
        toast.success(`批量${mode === 'approve' ? '通过' : '驳回'}成功`)
      } else {
        await submitAudit({
          ...submitData,
          targetId: targetIds[0]
        })
        toast.success(`${mode === 'approve' ? '通过' : '驳回'}成功`)
      }

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : '审核操作失败'
      toast.error(message)
      console.error('审核操作失败：', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [mode, isBatch, targetType, targetIds, auditMind, selectedViolationIds, onSuccess, onOpenChange])

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="md"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader>
          <div className="flex items-center gap-2">
            {mode === 'approve' ? (
              <CheckCircle size={18} className="text-success" />
            ) : (
              <XCircle size={18} className="text-danger" />
            )}
            <span>
              {isBatch ? '批量' : ''}{mode === 'approve' ? '通过审核' : '驳回审核'}
            </span>
            {isBatch && (
              <Chip size="sm" variant="flat" color="primary">
                {targetIds.length}项
              </Chip>
            )}
          </div>
        </ModalHeader>
        <ModalBody className="gap-4">
          {/* 审核意见 */}
          <Textarea
            label="审核意见"
            placeholder={mode === 'reject' ? '请填写驳回原因（必填）' : '请填写审核意见（选填）'}
            isRequired={mode === 'reject'}
            value={auditMind}
            onValueChange={setAuditMind}
            maxRows={4}
          />

          {/* 违规原因选择（仅驳回时显示） */}
          {mode === 'reject' && (
            <div className="space-y-2">
              <label className="text-sm">违规原因（选填）</label>
              {isLoadingReasons ? (
                <div className="flex justify-center py-4">
                  <Spinner size="sm" label="加载违规原因..." />
                </div>
              ) : violationReasons.length === 0 ? (
                <p className="text-xs text-default-400">暂无违规原因数据</p>
              ) : (
                <CheckboxGroup
                  value={selectedViolationIds}
                  onChange={(values) => setSelectedViolationIds(values as string[])}
                  className="gap-1"
                >
                  {violationReasons.map((reason) => (
                    <Checkbox
                      key={reason.id}
                      value={reason.id}
                      classNames={{
                        base: 'w-full max-w-full p-1.5 hover:bg-default-100 rounded-lg transition-colors',
                        label: 'w-full'
                      }}
                    >
                      <span className="text-sm">{reason.label}</span>
                    </Checkbox>
                  ))}
                </CheckboxGroup>
              )}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={() => onOpenChange(false)}>
            取消
          </Button>
          <Button
            color={mode === 'approve' ? 'success' : 'danger'}
            isLoading={isSubmitting}
            onPress={handleSubmit}
          >
            确认{mode === 'approve' ? '通过' : '驳回'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

// ===== 11. 导出区域 =====

/**
 * 前台审批主页面组件
 *
 * 页面布局：
 * - 顶部标题栏：图标 + 标题 + 刷新按钮
 * - Tab切换栏：审核队列 | 审核日志
 * - 审核队列面板：查询工具栏 + 表格 + 分页
 * - 审核日志面板：查询工具栏 + 表格 + 分页
 *
 * 数据流：
 * - 审核队列：getAuditQueue → queueList → 表格展示
 * - 审核日志：getAuditLogs → logList → 表格展示
 * - 审核操作：submitAudit / submitBatchAudit → 刷新列表
 */
export default function FrontAudit() {
  // ===== 3. 状态控制逻辑区域 =====

  /** 当前Tab：queue-审核队列 / logs-审核日志 */
  const [activeTab, setActiveTab] = useState<string>('queue')

  // --- 审核队列状态 ---
  /** 审核队列列表数据 */
  const [queueList, setQueueList] = useState<AuditQueueItem[]>([])
  /** 队列加载状态 */
  const [isQueueLoading, setIsQueueLoading] = useState(false)
  /** 队列目标类型筛选（undefined表示全部） */
  const [queueTargetType, setQueueTargetType] = useState<AuditTargetType | undefined>(undefined)
  /** 队列审核状态筛选 */
  const [queueAuditStatus, setQueueAuditStatus] = useState<AuditStatus | undefined>(undefined)
  /** 队列分页参数 */
  const [queuePage, setQueuePage] = useState(1)
  const [queuePageSize, setQueuePageSize] = useState(DEFAULT_PAGE_SIZE)
  const [queueTotal, setQueueTotal] = useState(0)
  const [queueTotalPages, setQueueTotalPages] = useState(0)
  /** 队列表格多选选中的行 key 集合 */
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())

  // --- 审核日志状态 ---
  /** 审核日志列表数据 */
  const [logList, setLogList] = useState<AuditLogItem[]>([])
  /** 日志加载状态 */
  const [isLogLoading, setIsLogLoading] = useState(false)
  /** 日志目标类型筛选 */
  const [logTargetType, setLogTargetType] = useState<AuditTargetType | undefined>(undefined)
  /** 日志分页参数 */
  const [logPage, setLogPage] = useState(1)
  const [logPageSize, setLogPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [logTotal, setLogTotal] = useState(0)
  const [logTotalPages, setLogTotalPages] = useState(0)

  // --- 弹窗状态 ---
  /** 审核详情弹窗 */
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [detailTargetType, setDetailTargetType] = useState<AuditTargetType>(1)
  const [detailTargetId, setDetailTargetId] = useState('')

  /** 审核操作弹窗 */
  const [actionModalOpen, setActionModalOpen] = useState(false)
  const [actionMode, setActionMode] = useState<'approve' | 'reject'>('approve')
  const [actionIsBatch, setActionIsBatch] = useState(false)
  const [actionTargetType, setActionTargetType] = useState<AuditTargetType>(1)
  const [actionTargetIds, setActionTargetIds] = useState<string[]>([])

  // ===== 6. 错误处理函数区域 =====

  /**
   * 获取审核队列数据
   * 后端分页接口，传入目标类型、审核状态、页码和每页大小
   */
  const fetchQueueList = useCallback(async () => {
    setIsQueueLoading(true)
    try {
      const data: AuditQueuePageData = await getAuditQueue({
        targetType: queueTargetType,
        auditStatus: queueAuditStatus,
        pageNum: queuePage,
        pageSize: queuePageSize
      })
      if (data && data.list) {
        setQueueList(data.list)
        setQueueTotal(data.total)
        setQueueTotalPages(Math.ceil(data.total / queuePageSize))
      } else {
        setQueueList([])
        setQueueTotal(0)
        setQueueTotalPages(0)
      }
    } catch (error) {
      console.error('获取审核队列失败：', error)
      toast.error('获取审核队列失败')
      setQueueList([])
      setQueueTotal(0)
      setQueueTotalPages(0)
    } finally {
      setIsQueueLoading(false)
    }
  }, [queueTargetType, queueAuditStatus, queuePage, queuePageSize])

  /**
   * 获取审核日志数据
   * 后端分页接口，传入目标类型、页码和每页大小
   */
  const fetchLogList = useCallback(async () => {
    setIsLogLoading(true)
    try {
      const data: AuditLogPageData = await getAuditLogs({
        targetType: logTargetType,
        pageNum: logPage,
        pageSize: logPageSize
      })
      if (data && data.list) {
        setLogList(data.list)
        setLogTotal(data.total)
        setLogTotalPages(Math.ceil(data.total / logPageSize))
      } else {
        setLogList([])
        setLogTotal(0)
        setLogTotalPages(0)
      }
    } catch (error) {
      console.error('获取审核日志失败：', error)
      toast.error('获取审核日志失败')
      setLogList([])
      setLogTotal(0)
      setLogTotalPages(0)
    } finally {
      setIsLogLoading(false)
    }
  }, [logTargetType, logPage, logPageSize])

  // ===== 9. 页面初始化与事件绑定 =====

  /** 页面挂载时和参数变化时加载数据 */
  useEffect(() => {
    fetchQueueList()
  }, [fetchQueueList])

  useEffect(() => {
    fetchLogList()
  }, [fetchLogList])

  /**
   * 切换Tab时重置分页
   */
  const handleTabChange = useCallback((key: string) => {
    setActiveTab(key)
  }, [])

  /**
   * 审核队列目标类型变更
   * 切换目标类型时重置分页和选中项
   */
  const handleQueueTargetTypeChange = useCallback((keys: 'all' | Set<React.Key>) => {
    if (keys === 'all') {
      setQueueTargetType(undefined)
    } else {
      const value = Array.from(keys)[0] as string
      if (value === 'all') {
        setQueueTargetType(undefined)
      } else {
        setQueueTargetType(Number(value) as AuditTargetType)
      }
    }
    setQueuePage(1)
    setSelectedKeys(new Set())
  }, [])

  /**
   * 审核队列状态筛选变更
   */
  const handleQueueStatusChange = useCallback((keys: 'all' | Set<React.Key>) => {
    if (keys === 'all') {
      setQueueAuditStatus(undefined)
    } else {
      const value = Array.from(keys)[0] as string
      if (value === 'all') {
        setQueueAuditStatus(undefined)
      } else {
        setQueueAuditStatus(Number(value) as AuditStatus)
      }
    }
    setQueuePage(1)
  }, [])

  /**
   * 审核日志目标类型变更
   */
  const handleLogTargetTypeChange = useCallback((keys: 'all' | Set<React.Key>) => {
    if (keys === 'all') {
      setLogTargetType(undefined)
    } else {
      const value = Array.from(keys)[0] as string
      if (value === 'all') {
        setLogTargetType(undefined)
      } else {
        setLogTargetType(Number(value) as AuditTargetType)
      }
    }
    setLogPage(1)
  }, [])

  /**
   * 重置审核队列筛选条件
   */
  const handleResetQueueQuery = useCallback(() => {
    setQueueTargetType(undefined)
    setQueueAuditStatus(undefined)
    setQueuePage(1)
    setSelectedKeys(new Set())
  }, [])

  /**
   * 重置审核日志筛选条件
   */
  const handleResetLogQuery = useCallback(() => {
    setLogTargetType(undefined)
    setLogPage(1)
  }, [])

  /**
   * 查看审核详情
   */
  const handleViewDetail = useCallback((item: AuditQueueItem) => {
    setDetailTargetType(item.targetType)
    setDetailTargetId(item.targetId)
    setDetailModalOpen(true)
  }, [])

  /**
   * 单条通过审核
   */
  const handleApproveItem = useCallback((item: AuditQueueItem) => {
    setActionMode('approve')
    setActionIsBatch(false)
    setActionTargetType(item.targetType)
    setActionTargetIds([item.targetId])
    setActionModalOpen(true)
  }, [])

  /**
   * 单条驳回审核
   */
  const handleRejectItem = useCallback((item: AuditQueueItem) => {
    setActionMode('reject')
    setActionIsBatch(false)
    setActionTargetType(item.targetType)
    setActionTargetIds([item.targetId])
    setActionModalOpen(true)
  }, [])

  /**
   * 批量通过审核
   */
  const handleBatchApprove = useCallback(() => {
    if (selectedKeys.size === 0) {
      toast.warning('请选择要审核的内容')
      return
    }
    // 获取选中项的目标类型（确保所有选中项类型一致）
    const selectedItems = queueList.filter(item => selectedKeys.has(item.targetId))
    const types = [...new Set(selectedItems.map(item => item.targetType))]
    if (types.length !== 1) {
      toast.warning('批量审核只支持同一类型的内容')
      return
    }
    const ids = Array.from(selectedKeys)
    setActionMode('approve')
    setActionIsBatch(true)
    setActionTargetType(types[0])
    setActionTargetIds(ids)
    setActionModalOpen(true)
  }, [selectedKeys, queueList])

  /**
   * 批量驳回审核
   */
  const handleBatchReject = useCallback(() => {
    if (selectedKeys.size === 0) {
      toast.warning('请选择要审核的内容')
      return
    }
    // 获取选中项的目标类型（确保所有选中项类型一致）
    const selectedItems = queueList.filter(item => selectedKeys.has(item.targetId))
    const types = [...new Set(selectedItems.map(item => item.targetType))]
    if (types.length !== 1) {
      toast.warning('批量审核只支持同一类型的内容')
      return
    }
    const ids = Array.from(selectedKeys)
    setActionMode('reject')
    setActionIsBatch(true)
    setActionTargetType(types[0])
    setActionTargetIds(ids)
    setActionModalOpen(true)
  }, [selectedKeys, queueList])

  /**
   * 审核操作成功后刷新列表
   */
  const handleActionSuccess = useCallback(() => {
    fetchQueueList()
    setSelectedKeys(new Set())
  }, [fetchQueueList])

  /**
   * 审核队列分页大小变更
   */
  const handleQueuePageSizeChange = useCallback((keys: 'all' | Set<React.Key>) => {
    if (keys === 'all') return
    const value = Array.from(keys)[0] as string
    setQueuePageSize(Number(value))
    setQueuePage(1)
  }, [])

  /**
   * 审核日志分页大小变更
   */
  const handleLogPageSizeChange = useCallback((keys: 'all' | Set<React.Key>) => {
    if (keys === 'all') return
    const value = Array.from(keys)[0] as string
    setLogPageSize(Number(value))
    setLogPage(1)
  }, [])

  // ===== 8. UI渲染逻辑区域 =====

  return (
    <div className="flex flex-col gap-4 p-4 md:p-0 h-full">
      <Card className="h-full">
        <CardBody className="p-0 flex flex-col overflow-hidden">
          {/* 顶部标题栏 */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-default-800">
            <div className="flex items-center gap-2">
              <ClipboardCheck size={18} className="text-primary" />
              <span className="font-semibold text-sm">前台审批</span>
            </div>
            <div className="flex items-center gap-1">
              <Tooltip content="刷新" size="sm">
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onPress={activeTab === 'queue' ? fetchQueueList : fetchLogList}
                  isLoading={activeTab === 'queue' ? isQueueLoading : isLogLoading}
                >
                  <RefreshCw size={16} />
                </Button>
              </Tooltip>
            </div>
          </div>

          {/* Tab切换栏 */}
          <div className="px-4 pt-3">
            <Tabs
              selectedKey={activeTab}
              onSelectionChange={(key) => handleTabChange(String(key))}
              variant="underlined"
              color="primary"
              size="sm"
            >
              <Tab
                key="queue"
                title={
                  <div className="flex items-center gap-1.5">
                    <ClipboardCheck size={14} />
                    <span>审核队列</span>
                  </div>
                }
              />
              <Tab
                key="logs"
                title={
                  <div className="flex items-center gap-1.5">
                    <FileText size={14} />
                    <span>审核日志</span>
                  </div>
                }
              />
            </Tabs>
          </div>

          {/* 审核队列面板 */}
          {activeTab === 'queue' && (
            <>
              {/* 查询工具栏 */}
              <div className="px-4 py-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Select
                    size="sm"
                    placeholder="目标类型"
                    className="w-full sm:w-28"
                    aria-label="目标类型筛选"
                    selectedKeys={queueTargetType !== undefined ? [String(queueTargetType)] : []}
                    onSelectionChange={handleQueueTargetTypeChange}
                  >
                    {[<SelectItem key="all" textValue="全部">全部</SelectItem>,
                    ...AUDIT_TARGET_TYPE_OPTIONS.map(option => (
                      <SelectItem key={String(option.value)} textValue={option.label}>
                        {option.label}
                      </SelectItem>
                    ))]}
                  </Select>
                  <Select
                    size="sm"
                    placeholder="审核状态"
                    className="w-full sm:w-28"
                    aria-label="审核状态筛选"
                    selectedKeys={queueAuditStatus !== undefined ? [String(queueAuditStatus)] : []}
                    onSelectionChange={handleQueueStatusChange}
                  >
                    {[<SelectItem key="all" textValue="全部">全部</SelectItem>,
                    ...AUDIT_STATUS_OPTIONS.map(option => (
                      <SelectItem key={String(option.value)} textValue={option.label}>
                        {option.label}
                      </SelectItem>
                    ))]}
                  </Select>
                  <Button size="sm" variant="flat" onPress={handleResetQueueQuery}>
                    重置
                  </Button>
                  <div className="hidden sm:flex-1" />
                  {selectedKeys.size > 0 && (
                    <>
                      <Button
                        size="sm"
                        color="success"
                        variant="flat"
                        startContent={<CheckCircle size={14} />}
                        onPress={handleBatchApprove}
                      >
                        批量通过({selectedKeys.size})
                      </Button>
                      <Button
                        size="sm"
                        color="danger"
                        variant="flat"
                        startContent={<XCircle size={14} />}
                        onPress={handleBatchReject}
                      >
                        批量驳回({selectedKeys.size})
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* 审核队列表格 */}
              <div className="flex-1 p-3">
                {isQueueLoading ? (
                  <StatusState type="loading" scene="admin" />
                ) : (
                  <Table
                    aria-label="审核队列"
                    selectionMode="multiple"
                    selectedKeys={selectedKeys}
                    onSelectionChange={keys => setSelectedKeys(keys as Set<string>)}
                    classNames={{
                      wrapper: 'p-0',
                      thead: '[&>tr]:first:shadow-none',
                    }}
                  >
                    <TableHeader>
                      <TableColumn key="title">标题</TableColumn>
                      <TableColumn key="targetType">类型</TableColumn>
                      <TableColumn key="uploaderName" className="hidden md:table-cell">上传者</TableColumn>
                      <TableColumn key="riskLevel">风险等级</TableColumn>
                      <TableColumn key="isAiChecked" className="hidden lg:table-cell">AI审核</TableColumn>
                      <TableColumn key="status">状态</TableColumn>
                      <TableColumn key="createTime" className="hidden lg:table-cell">创建时间</TableColumn>
                      <TableColumn key="actions">操作</TableColumn>
                    </TableHeader>
                    <TableBody
                      items={queueList.map(item => ({ ...item, key: item.targetId }))}
                      emptyContent={<StatusState type="empty" scene="admin" />}
                    >
                      {(item) => (
                        <TableRow key={item.targetId}>
                          <TableCell>
                            <span className="text-sm font-medium truncate max-w-48 block">
                              {item.title}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Chip size="sm" variant="flat" color={getTargetTypeColor(item.targetType)}>
                              {getTargetTypeLabel(item.targetType)}
                            </Chip>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <span className="text-sm">{item.uploaderName}</span>
                          </TableCell>
                          <TableCell>
                            <Chip size="sm" variant="flat" color={getRiskLevelColor(item.riskLevel)}>
                              {getRiskLevelLabel(item.riskLevel)}
                            </Chip>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <Chip
                              size="sm"
                              variant="flat"
                              color={item.isAiChecked ? 'secondary' : 'default'}
                            >
                              {item.isAiChecked ? '已审核' : '未审核'}
                            </Chip>
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="sm"
                              variant="dot"
                              color={getAuditStatusColor(item.status)}
                            >
                              {getAuditStatusLabel(item.status)}
                            </Chip>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <span className="text-sm">
                              {item.createTime ? formatDateTime(item.createTime) : '-'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Tooltip content="查看详情" size="sm">
                                <Button
                                  isIconOnly
                                  size="sm"
                                  variant="light"
                                  onPress={() => handleViewDetail(item)}
                                >
                                  <Eye size={14} />
                                </Button>
                              </Tooltip>
                              {item.status === 'pending' && (
                                <>
                                  <Tooltip content="通过" size="sm">
                                    <Button
                                      isIconOnly
                                      size="sm"
                                      variant="light"
                                      color="success"
                                      onPress={() => handleApproveItem(item)}
                                    >
                                      <CheckCircle size={14} />
                                    </Button>
                                  </Tooltip>
                                  <Tooltip content="驳回" size="sm">
                                    <Button
                                      isIconOnly
                                      size="sm"
                                      variant="light"
                                      color="danger"
                                      onPress={() => handleRejectItem(item)}
                                    >
                                      <XCircle size={14} />
                                    </Button>
                                  </Tooltip>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </div>

              {/* 底部分页控件 */}
              {queueTotal > 0 && (
                <div className="flex items-center justify-between px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Select
                      size="sm"
                      aria-label="每页条数"
                      className="w-24"
                      selectedKeys={[String(queuePageSize)]}
                      onSelectionChange={handleQueuePageSizeChange}
                      renderValue={() => `${queuePageSize}条/页`}
                    >
                      {PAGE_SIZE_OPTIONS.map(size => (
                        <SelectItem key={String(size)} textValue={`${size}条/页`}>
                          {size}条/页
                        </SelectItem>
                      ))}
                    </Select>
                    <span className="text-xs text-default-400">
                      共 {queueTotal} 条
                    </span>
                  </div>
                  <Pagination
                    total={queueTotalPages}
                    page={queuePage}
                    onChange={setQueuePage}
                    size="sm"
                    showControls
                  />
                </div>
              )}
            </>
          )}

          {/* 审核日志面板 */}
          {activeTab === 'logs' && (
            <>
              {/* 查询工具栏 */}
              <div className="px-4 py-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Select
                    size="sm"
                    placeholder="目标类型"
                    className="w-full sm:w-28"
                    aria-label="日志目标类型筛选"
                    selectedKeys={logTargetType !== undefined ? [String(logTargetType)] : []}
                    onSelectionChange={handleLogTargetTypeChange}
                  >
                    {[<SelectItem key="all" textValue="全部">全部</SelectItem>,
                    ...AUDIT_TARGET_TYPE_OPTIONS.map(option => (
                      <SelectItem key={String(option.value)} textValue={option.label}>
                        {option.label}
                      </SelectItem>
                    ))]}
                  </Select>
                  <Button size="sm" variant="flat" onPress={handleResetLogQuery}>
                    重置
                  </Button>
                </div>
              </div>

              {/* 审核日志表格 */}
              <div className="flex-1 p-3">
                {isLogLoading ? (
                  <StatusState type="loading" scene="admin" />
                ) : (
                  <Table
                    aria-label="审核日志"
                    classNames={{
                      wrapper: 'p-0',
                      thead: '[&>tr]:first:shadow-none',
                    }}
                  >
                    <TableHeader>
                      <TableColumn key="targetTitle">内容标题</TableColumn>
                      <TableColumn key="targetType">类型</TableColumn>
                      <TableColumn key="auditRound" className="hidden md:table-cell">审核轮次</TableColumn>
                      <TableColumn key="auditorName" className="hidden lg:table-cell">审核人</TableColumn>
                      <TableColumn key="result">结果</TableColumn>
                      <TableColumn key="riskLevel" className="hidden lg:table-cell">风险等级</TableColumn>
                      <TableColumn key="auditMind" className="hidden xl:table-cell">审核意见</TableColumn>
                      <TableColumn key="auditTime" className="hidden md:table-cell">审核时间</TableColumn>
                    </TableHeader>
                    <TableBody
                      items={logList.map(item => ({ ...item, key: item.id }))}
                      emptyContent={<StatusState type="empty" scene="admin" />}
                    >
                      {(item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <span className="text-sm font-medium truncate max-w-48 block">
                              {item.targetTitle}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Chip size="sm" variant="flat" color={getTargetTypeColor(item.targetType)}>
                              {getTargetTypeLabel(item.targetType)}
                            </Chip>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Chip size="sm" variant="flat" color="primary">
                              第 {item.auditRound} 轮
                            </Chip>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <span className="text-sm">{item.auditorName}</span>
                          </TableCell>
                          <TableCell>
                            <Chip size="sm" variant="dot" color={getAuditLogResultColor(item.result)}>
                              {getAuditLogResultLabel(item.result)}
                            </Chip>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <Chip size="sm" variant="flat" color={getRiskLevelColor(item.riskLevel)}>
                              {getRiskLevelLabel(item.riskLevel)}
                            </Chip>
                          </TableCell>
                          <TableCell className="hidden xl:table-cell">
                            <span className="text-sm truncate max-w-32 block">
                              {item.auditMind || '-'}
                            </span>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <span className="text-sm">
                              {item.auditTime ? formatDateTime(item.auditTime) : '-'}
                            </span>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </div>

              {/* 底部分页控件 */}
              {logTotal > 0 && (
                <div className="flex items-center justify-between px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Select
                      size="sm"
                      aria-label="每页条数"
                      className="w-24"
                      selectedKeys={[String(logPageSize)]}
                      onSelectionChange={handleLogPageSizeChange}
                      renderValue={() => `${logPageSize}条/页`}
                    >
                      {PAGE_SIZE_OPTIONS.map(size => (
                        <SelectItem key={String(size)} textValue={`${size}条/页`}>
                          {size}条/页
                        </SelectItem>
                      ))}
                    </Select>
                    <span className="text-xs text-default-400">
                      共 {logTotal} 条
                    </span>
                  </div>
                  <Pagination
                    total={logTotalPages}
                    page={logPage}
                    onChange={setLogPage}
                    size="sm"
                    showControls
                  />
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>

      {/* 审核详情弹窗 */}
      <AuditDetailModal
        isOpen={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        targetType={detailTargetType}
        targetId={detailTargetId}
      />

      {/* 审核操作弹窗 */}
      <AuditActionModal
        isOpen={actionModalOpen}
        onOpenChange={setActionModalOpen}
        mode={actionMode}
        isBatch={actionIsBatch}
        targetType={actionTargetType}
        targetIds={actionTargetIds}
        onSuccess={handleActionSuccess}
      />
    </div>
  )
}
