/**
 * 系统日志页面
 *
 * 页面布局：
 * - 顶部工具栏区域：搜索框、筛选条件、操作按钮
 * - 中部表格区域：系统日志列表表格
 * - 弹窗组件：日志详情、批量删除确认
 *
 * 功能模块：
 * - 日志列表：分页展示、搜索、筛选、批量操作
 * - 日志查询：支持多条件筛选（分类、请求方式、操作状态、业务类型、时间范围）
 * - 日志详情：查看请求参数、响应结果等完整信息
 * - 日志管理：单个删除、批量删除
 */

// ===== 1. 依赖导入区域 =====

// React 核心
import { useState, useEffect, useCallback, Fragment } from 'react'

// HeroUI 组件
import {
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
  Pagination
} from '@heroui/react'

// 图标（Lucide React）
import {
  Search,
  RefreshCw,
  Trash2,
  FileText,
  Eye,
  RotateCcw,
  Clock,
  AlertCircle,
  CheckCircle2
} from 'lucide-react'

// 工具函数
import { toast } from '@/utils/toast'
import { formatDateTime } from '@/utils/format'

// 常量
import { PAGINATION } from '@/constants'

// 通用状态组件
import { StatusState } from '@/components/ui/StatusState'

// API 接口
import { getSysLogPage, deleteSysLogs } from '@/api/admin/syslog'

// 类型定义
import type {
  SysLog,
  SysLogQueryParams,
  SysLogCategory,
  SysLogStatus,
  SysLogBusinessType
} from '@/types/syslog.types'
import {
  SYS_LOG_CATEGORY_OPTIONS,
  SYS_LOG_STATUS_OPTIONS,
  SYS_LOG_BUSINESS_TYPE_OPTIONS,
  SYS_LOG_REQUEST_METHOD_OPTIONS
} from '@/types/syslog.types'

/**
 * 日志详情弹窗组件
 * 展示日志的完整信息，包括请求参数和响应结果
 */
interface LogDetailModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  log: SysLog | null
}

function LogDetailModal({ isOpen, onOpenChange, log }: LogDetailModalProps) {
  if (!log) return null

  /** 尝试格式化JSON字符串，失败则返回原始字符串 */
  const formatJsonString = (str: string): string => {
    if (!str) return '-'
    try {
      return JSON.stringify(JSON.parse(str), null, 2)
    } catch {
      return str
    }
  }

  /** 获取分类标签颜色 */
  const getCategoryColor = (category: SysLogCategory): 'primary' | 'secondary' | 'success' => {
    const colorMap: Record<SysLogCategory, 'primary' | 'secondary' | 'success'> = {
      content: 'primary',
      user: 'secondary',
      system: 'success'
    }
    return colorMap[category] || 'primary'
  }

  /** 获取分类显示文本 */
  const getCategoryLabel = (category: SysLogCategory): string => {
    const labelMap: Record<SysLogCategory, string> = {
      content: '内容',
      user: '用户',
      system: '系统'
    }
    return labelMap[category] || category
  }

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="2xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <FileText size={18} className="text-primary" />
          <span>日志详情</span>
          <Chip size="sm" variant="flat" color={getCategoryColor(log.category)}>
            {getCategoryLabel(log.category)}
          </Chip>
        </ModalHeader>
        <ModalBody className="gap-4 pb-6">
          {/* 基本信息 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-default-50 rounded-lg">
              <div className="text-xs text-default-400 mb-1">日志ID</div>
              <div className="text-sm font-medium">{log.id}</div>
            </div>
            <div className="p-3 bg-default-50 rounded-lg">
              <div className="text-xs text-default-400 mb-1">操作人</div>
              <div className="text-sm font-medium">{log.operator || '-'}</div>
            </div>
            <div className="p-3 bg-default-50 rounded-lg">
              <div className="text-xs text-default-400 mb-1">动作名称</div>
              <div className="text-sm font-medium">{log.action || '-'}</div>
            </div>
            <div className="p-3 bg-default-50 rounded-lg">
              <div className="text-xs text-default-400 mb-1">操作状态</div>
              <div className="flex items-center gap-1">
                {log.status === 0 ? (
                  <CheckCircle2 size={14} className="text-success" />
                ) : (
                  <AlertCircle size={14} className="text-danger" />
                )}
                <span className={`text-sm font-medium ${log.status === 0 ? 'text-success' : 'text-danger'}`}>
                  {log.status === 0 ? '正常' : '异常'}
                </span>
              </div>
            </div>
            <div className="p-3 bg-default-50 rounded-lg">
              <div className="text-xs text-default-400 mb-1">请求方式</div>
              <Chip size="sm" variant="flat" color="secondary">
                {log.requestMethod}
              </Chip>
            </div>
            <div className="p-3 bg-default-50 rounded-lg">
              <div className="text-xs text-default-400 mb-1">消耗时间</div>
              <div className="text-sm font-medium">{log.costTime}ms</div>
            </div>
            <div className="p-3 bg-default-50 rounded-lg">
              <div className="text-xs text-default-400 mb-1">操作IP</div>
              <div className="text-sm font-medium">{log.operIp || '-'}</div>
            </div>
            <div className="p-3 bg-default-50 rounded-lg">
              <div className="text-xs text-default-400 mb-1">创建时间</div>
              <div className="text-sm font-medium">{formatDateTime(log.createdAt)}</div>
            </div>
          </div>

          {/* 详细描述 */}
          {log.detail && (
            <div className="p-3 bg-default-50 rounded-lg">
              <div className="text-xs text-default-400 mb-1">详细描述</div>
              <div className="text-sm">{log.detail}</div>
            </div>
          )}

          {/* 请求URL */}
          <div className="p-3 bg-default-50 rounded-lg">
            <div className="text-xs text-default-400 mb-1">请求URL</div>
            <div className="text-sm font-mono break-all">{log.requestUrl || '-'}</div>
          </div>

          {/* 请求参数 */}
          <div className="p-3 bg-default-50 rounded-lg">
            <div className="text-xs text-default-400 mb-1">请求参数</div>
            <pre className="text-xs font-mono whitespace-pre-wrap break-all max-h-48 overflow-auto bg-default-100 p-2 rounded">
              {formatJsonString(log.requestParam)}
            </pre>
          </div>

          {/* 响应结果 */}
          <div className="p-3 bg-default-50 rounded-lg">
            <div className="text-xs text-default-400 mb-1">响应结果</div>
            <pre className="text-xs font-mono whitespace-pre-wrap break-all max-h-48 overflow-auto bg-default-100 p-2 rounded">
              {formatJsonString(log.responseResult)}
            </pre>
          </div>
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
 * 批量删除确认弹窗组件
 */
interface BatchDeleteModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  selectedCount: number
  onConfirm: () => void
}

function BatchDeleteModal({ isOpen, onOpenChange, selectedCount, onConfirm }: BatchDeleteModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="sm"
    >
      <ModalContent>
        <ModalHeader>
          <div className="flex items-center gap-2 text-danger">
            <Trash2 size={18} />
            <span>批量删除确认</span>
          </div>
        </ModalHeader>
        <ModalBody>
          <p className="text-sm text-default-600">
            确定要删除选中的 {selectedCount} 条日志吗？此操作不可恢复。
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
            删除
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

/**
 * 系统日志主页面组件
 */
export default function SysLogPage() {
  // ===== 3. 状态控制逻辑区域 =====

  /** 日志列表数据 */
  const [logList, setLogList] = useState<SysLog[]>([])
  /** 列表加载状态 */
  const [loading, setLoading] = useState(false)
  /** 表格多选选中的行 key 集合 */
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())
  /** 查询参数 */
  const [queryParams, setQueryParams] = useState<SysLogQueryParams>({})
  /** 分页参数 */
  const [pageNum, setPageNum] = useState<number>(PAGINATION.DEFAULT_PAGE)
  const [pageSize, setPageSize] = useState<number>(PAGINATION.DEFAULT_PAGE_SIZE)
  /** 总条数 */
  const [total, setTotal] = useState(0)

  /** 搜索关键词（操作人） */
  const [searchKeyword, setSearchKeyword] = useState('')

  /** 筛选条件：分类 */
  const [filterCategory, setFilterCategory] = useState<string>('')
  /** 筛选条件：请求方式 */
  const [filterRequestMethod, setFilterRequestMethod] = useState<string>('')
  /** 筛选条件：操作状态 */
  const [filterStatus, setFilterStatus] = useState<string>('')
  /** 筛选条件：业务类型 */
  const [filterBusinessType, setFilterBusinessType] = useState<string>('')
  /** 筛选条件：开始时间 */
  const [filterBeginTime, setFilterBeginTime] = useState('')
  /** 筛选条件：结束时间 */
  const [filterEndTime, setFilterEndTime] = useState('')

  /** 日志详情弹窗控制 */
  const detailModal = useDisclosure()
  /** 当前查看的日志详情 */
  const [currentLog, setCurrentLog] = useState<SysLog | null>(null)

  /** 批量删除弹窗控制 */
  const batchDeleteModal = useDisclosure()
  /** 操作加载状态 */
  const [actionLoading, setActionLoading] = useState(false)

  // ===== 4. 通用工具函数区域 =====

  /**
   * 获取分类标签颜色
   */
  const getCategoryColor = useCallback((category: SysLogCategory): 'primary' | 'secondary' | 'success' => {
    const colorMap: Record<SysLogCategory, 'primary' | 'secondary' | 'success'> = {
      content: 'primary',
      user: 'secondary',
      system: 'success'
    }
    return colorMap[category] || 'primary'
  }, [])

  /**
   * 获取分类显示文本
   */
  const getCategoryLabel = useCallback((category: SysLogCategory): string => {
    const labelMap: Record<SysLogCategory, string> = {
      content: '内容',
      user: '用户',
      system: '系统'
    }
    return labelMap[category] || category
  }, [])

  // ===== 6. 错误处理函数区域 =====

  // ===== 7. 数据处理函数区域 =====

  /**
   * 获取日志列表数据
   */
  const fetchLogList = useCallback(async () => {
    setLoading(true)
    try {
      const params: SysLogQueryParams = {
        ...queryParams,
        pageNum,
        pageSize
      }
      const data = await getSysLogPage(params)

      if (data && data.list) {
        setLogList(data.list)
        setTotal(Number(data.total) || 0)
      } else {
        setLogList([])
        setTotal(0)
      }
    } catch (error) {
      console.error('获取系统日志列表失败：', error)
      toast.error('获取系统日志列表失败')
      setLogList([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [queryParams, pageNum, pageSize])

  /**
   * 批量删除日志
   */
  const handleBatchDelete = useCallback(async () => {
    const ids = Array.from(selectedKeys)
    if (ids.length === 0) {
      toast.warning('请选择要删除的日志')
      return
    }
    setActionLoading(true)
    try {
      await deleteSysLogs(ids.join(','))
      toast.success('批量删除成功')
      fetchLogList()
      setSelectedKeys(new Set())
    } catch (error) {
      const message = error instanceof Error ? error.message : '批量删除失败'
      toast.error(message)
      console.error('批量删除日志失败：', error)
    } finally {
      setActionLoading(false)
    }
  }, [selectedKeys, fetchLogList])

  /**
   * 单个删除日志
   */
  const handleDeleteSingle = useCallback(async (id: string) => {
    setActionLoading(true)
    try {
      await deleteSysLogs(id)
      toast.success('删除成功')
      fetchLogList()
      setSelectedKeys(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : '删除失败'
      toast.error(message)
      console.error('删除日志失败：', error)
    } finally {
      setActionLoading(false)
    }
  }, [fetchLogList])

  // ===== 8. UI渲染逻辑区域 =====

  /**
   * 执行搜索
   */
  const handleSearch = useCallback(() => {
    setQueryParams(prev => ({
      ...prev,
      operator: searchKeyword.trim() || undefined
    }))
    setPageNum(1)
  }, [searchKeyword])

  /**
   * 搜索框回车触发搜索
   */
  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }, [handleSearch])

  /**
   * 分类筛选变更
   */
  const handleCategoryChange = useCallback((keys: 'all' | Set<React.Key>) => {
    if (keys === 'all') return
    const value = Array.from(keys)[0] as string
    setFilterCategory(value)
    setQueryParams(prev => ({
      ...prev,
      category: value ? (value as SysLogCategory) : undefined
    }))
    setPageNum(1)
  }, [])

  /**
   * 请求方式筛选变更
   */
  const handleRequestMethodChange = useCallback((keys: 'all' | Set<React.Key>) => {
    if (keys === 'all') return
    const value = Array.from(keys)[0] as string
    setFilterRequestMethod(value)
    setQueryParams(prev => ({
      ...prev,
      requestMethod: value || undefined
    }))
    setPageNum(1)
  }, [])

  /**
   * 操作状态筛选变更
   */
  const handleStatusChange = useCallback((keys: 'all' | Set<React.Key>) => {
    if (keys === 'all') return
    const value = Array.from(keys)[0] as string
    setFilterStatus(value)
    setQueryParams(prev => ({
      ...prev,
      status: value !== '' ? (Number(value) as SysLogStatus) : undefined
    }))
    setPageNum(1)
  }, [])

  /**
   * 业务类型筛选变更
   */
  const handleBusinessTypeChange = useCallback((keys: 'all' | Set<React.Key>) => {
    if (keys === 'all') return
    const value = Array.from(keys)[0] as string
    setFilterBusinessType(value)
    setQueryParams(prev => ({
      ...prev,
      businessType: value !== '' ? (Number(value) as SysLogBusinessType) : undefined
    }))
    setPageNum(1)
  }, [])

  /**
   * 开始时间筛选变更
   */
  const handleBeginTimeChange = useCallback((value: string) => {
    setFilterBeginTime(value)
    setQueryParams(prev => ({
      ...prev,
      beginTime: value || undefined
    }))
    setPageNum(1)
  }, [])

  /**
   * 结束时间筛选变更
   */
  const handleEndTimeChange = useCallback((value: string) => {
    setFilterEndTime(value)
    setQueryParams(prev => ({
      ...prev,
      endTime: value || undefined
    }))
    setPageNum(1)
  }, [])

  /**
   * 分页大小变更
   */
  const handlePageSizeChange = useCallback((keys: 'all' | Set<React.Key>) => {
    if (keys === 'all') return
    const value = Array.from(keys)[0] as string
    setPageSize(Number(value))
    setPageNum(1)
  }, [])

  /**
   * 重置查询条件
   */
  const handleResetQuery = useCallback(() => {
    setQueryParams({})
    setSearchKeyword('')
    setFilterCategory('')
    setFilterRequestMethod('')
    setFilterStatus('')
    setFilterBusinessType('')
    setFilterBeginTime('')
    setFilterEndTime('')
    setPageNum(1)
  }, [])

  /**
   * 查看日志详情
   */
  const handleViewDetail = useCallback((log: SysLog) => {
    setCurrentLog(log)
    detailModal.onOpen()
  }, [detailModal])

  /**
   * 打开批量删除弹窗
   */
  const handleOpenBatchDelete = useCallback(() => {
    if (selectedKeys.size === 0) {
      toast.warning('请先选择要删除的日志')
      return
    }
    batchDeleteModal.onOpen()
  }, [selectedKeys, batchDeleteModal])

  // ===== 9. 页面初始化与事件绑定 =====

  /** 查询参数变化时重新加载日志列表 */
  useEffect(() => {
    fetchLogList()
  }, [fetchLogList])

  return (
    <div className="flex flex-col gap-4 p-4 md:p-0 h-full">
      <Card className="h-full overflow-hidden">
        <CardBody className="p-0 flex flex-col overflow-hidden">
          {/* 顶部标题栏 */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-divider">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-primary" />
              <span className="font-semibold text-sm">系统日志</span>
            </div>
            <div className="flex items-center gap-2">
              <Tooltip content="刷新数据" size="sm">
                <Button
                  size="sm"
                  variant="light"
                  isIconOnly
                  startContent={<RefreshCw size={14} />}
                  onPress={fetchLogList}
                  isLoading={actionLoading}
                />
              </Tooltip>
            </div>
          </div>

          {/* 查询工具栏 */}
          <div className="px-4 py-3 border-b border-divider">
            <div className="flex items-center gap-2 flex-wrap">
              {/* 操作人搜索 */}
              <Input
                size="sm"
                placeholder="搜索操作人"
                className="w-full sm:w-48"
                value={searchKeyword}
                onValueChange={setSearchKeyword}
                onKeyDown={handleSearchKeyDown}
                startContent={<Search size={14} className="text-default-400" />}
                isClearable
                onClear={() => {
                  setSearchKeyword('')
                  setQueryParams(prev => ({ ...prev, operator: undefined }))
                }}
              />
              {/* 分类筛选 */}
              <Select
                size="sm"
                placeholder="分类"
                className="w-full sm:w-28"
                aria-label="日志分类筛选"
                selectedKeys={filterCategory ? [filterCategory] : []}
                onSelectionChange={handleCategoryChange}
              >
                <Fragment key="category-items">
                  {SYS_LOG_CATEGORY_OPTIONS.map(option => (
                    <SelectItem key={option.value} textValue={option.label}>
                      {option.label}
                    </SelectItem>
                  ))}
                </Fragment>
              </Select>
              {/* 请求方式筛选 */}
              <Select
                size="sm"
                placeholder="请求方式"
                className="w-full sm:w-28"
                aria-label="请求方式筛选"
                selectedKeys={filterRequestMethod ? [filterRequestMethod] : []}
                onSelectionChange={handleRequestMethodChange}
              >
                <Fragment key="method-items">
                  {SYS_LOG_REQUEST_METHOD_OPTIONS.map(option => (
                    <SelectItem key={option.value} textValue={option.label}>
                      {option.label}
                    </SelectItem>
                  ))}
                </Fragment>
              </Select>
              {/* 操作状态筛选 */}
              <Select
                size="sm"
                placeholder="操作状态"
                className="w-full sm:w-28"
                aria-label="操作状态筛选"
                selectedKeys={filterStatus !== '' ? [filterStatus] : []}
                onSelectionChange={handleStatusChange}
              >
                <Fragment key="status-items">
                  {SYS_LOG_STATUS_OPTIONS.map(option => (
                    <SelectItem key={String(option.value)} textValue={option.label}>
                      {option.label}
                    </SelectItem>
                  ))}
                </Fragment>
              </Select>
              {/* 业务类型筛选 */}
              <Select
                size="sm"
                placeholder="业务类型"
                className="w-full sm:w-28"
                aria-label="业务类型筛选"
                selectedKeys={filterBusinessType !== '' ? [filterBusinessType] : []}
                onSelectionChange={handleBusinessTypeChange}
              >
                <Fragment key="business-type-items">
                  {SYS_LOG_BUSINESS_TYPE_OPTIONS.map(option => (
                    <SelectItem key={String(option.value)} textValue={option.label}>
                      {option.label}
                    </SelectItem>
                  ))}
                </Fragment>
              </Select>
              {/* 开始时间筛选 */}
              <Input
                size="sm"
                type="datetime-local"
                placeholder="开始时间"
                className="w-full sm:w-44"
                aria-label="操作开始时间"
                value={filterBeginTime}
                onValueChange={handleBeginTimeChange}
                isClearable
                onClear={() => handleBeginTimeChange('')}
              />
              {/* 结束时间筛选 */}
              <Input
                size="sm"
                type="datetime-local"
                placeholder="结束时间"
                className="w-full sm:w-44"
                aria-label="操作结束时间"
                value={filterEndTime}
                onValueChange={handleEndTimeChange}
                isClearable
                onClear={() => handleEndTimeChange('')}
              />
              {/* 重置按钮 */}
              <Button size="sm" variant="flat" startContent={<RotateCcw size={14} />} onPress={handleResetQuery}>
                重置
              </Button>
              {/* 弹性占位 */}
              <div className="hidden sm:flex-1" />
              {/* 批量删除按钮 */}
              {selectedKeys.size > 0 && (
                <Button
                  size="sm"
                  variant="flat"
                  color="danger"
                  startContent={<Trash2 size={14} />}
                  onPress={handleOpenBatchDelete}
                >
                  批量删除({selectedKeys.size})
                </Button>
              )}
            </div>
          </div>

          {/* 日志列表表格 */}
          <div className="flex-1 p-3 overflow-auto">
            {loading ? (
              <StatusState type="loading" scene="admin" />
            ) : (
              <Table
                aria-label="系统日志列表"
                selectionMode="multiple"
                selectedKeys={selectedKeys}
                onSelectionChange={keys => setSelectedKeys(keys as Set<string>)}
                classNames={{
                  wrapper: 'p-0',
                  thead: '[&>tr]:first:shadow-none',
                }}
              >
                <TableHeader>
                  <TableColumn key="category">分类</TableColumn>
                  <TableColumn key="operator">操作人</TableColumn>
                  <TableColumn key="action">动作名称</TableColumn>
                  <TableColumn key="detail" className="hidden lg:table-cell">详细描述</TableColumn>
                  <TableColumn key="requestMethod">请求方式</TableColumn>
                  <TableColumn key="requestUrl" className="hidden md:table-cell">请求URL</TableColumn>
                  <TableColumn key="status">状态</TableColumn>
                  <TableColumn key="costTime" className="hidden md:table-cell">耗时</TableColumn>
                  <TableColumn key="operIp" className="hidden lg:table-cell">操作IP</TableColumn>
                  <TableColumn key="createdAt">创建时间</TableColumn>
                  <TableColumn key="actions">操作</TableColumn>
                </TableHeader>
                <TableBody
                  items={logList.map(item => ({ ...item, key: item.id }))}
                  emptyContent={<StatusState type="empty" scene="admin" />}
                >
                  {(item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Chip size="sm" variant="flat" color={getCategoryColor(item.category)}>
                          {getCategoryLabel(item.category)}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium">{item.operator || '-'}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{item.action || '-'}</span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {item.detail ? (
                          <Tooltip content={item.detail} size="sm">
                            <span className="text-sm text-default-600 truncate max-w-48 cursor-pointer block">
                              {item.detail.length > 30 ? item.detail.substring(0, 30) + '...' : item.detail}
                            </span>
                          </Tooltip>
                        ) : (
                          <span className="text-sm text-default-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip size="sm" variant="flat" color="secondary">
                          {item.requestMethod}
                        </Chip>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {item.requestUrl ? (
                          <Tooltip content={item.requestUrl} size="sm">
                            <span className="text-sm text-default-600 truncate max-w-36 cursor-pointer block font-mono">
                              {item.requestUrl.length > 25 ? item.requestUrl.substring(0, 25) + '...' : item.requestUrl}
                            </span>
                          </Tooltip>
                        ) : (
                          <span className="text-sm text-default-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.status === 0 ? (
                          <Chip
                            size="sm"
                            variant="flat"
                            color="success"
                            startContent={<CheckCircle2 size={12} />}
                          >
                            正常
                          </Chip>
                        ) : (
                          <Chip
                            size="sm"
                            variant="flat"
                            color="danger"
                            startContent={<AlertCircle size={12} />}
                          >
                            异常
                          </Chip>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-1">
                          <Clock size={12} className="text-default-400" />
                          <span className={`text-sm ${
                            item.costTime > 3000 ? 'text-danger' :
                            item.costTime > 1000 ? 'text-warning' :
                            'text-default-600'
                          }`}>
                            {item.costTime}ms
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span className="text-sm text-default-600 font-mono">{item.operIp || '-'}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-default-600">
                          {formatDateTime(item.createdAt)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Tooltip content="查看详情" size="sm">
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              color="primary"
                              onPress={() => handleViewDetail(item)}
                            >
                              <Eye size={14} />
                            </Button>
                          </Tooltip>
                          <Tooltip content="删除日志" size="sm">
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              color="danger"
                              onPress={() => handleDeleteSingle(item.id)}
                              isLoading={actionLoading}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>

          {/* 底部分页控件 */}
          {total > 0 && (
            <div className="flex items-center justify-between px-4 py-2 border-t border-divider">
              <div className="flex items-center gap-2">
                <Select
                  size="sm"
                  aria-label="每页条数"
                  className="w-24"
                  selectedKeys={[String(pageSize)]}
                  onSelectionChange={handlePageSizeChange}
                  renderValue={() => `${pageSize}条/页`}
                >
                  {PAGINATION.PAGE_SIZE_OPTIONS.map(size => (
                    <SelectItem key={String(size)} textValue={String(size)}>
                      {size}条/页
                    </SelectItem>
                  ))}
                </Select>
                <span className="text-xs text-default-400">
                  共 {total} 条
                </span>
              </div>
              <Pagination
                total={Math.ceil(total / pageSize)}
                page={pageNum}
                onChange={setPageNum}
                size="sm"
                showControls
              />
            </div>
          )}
        </CardBody>
      </Card>

      {/* 日志详情弹窗 */}
      <LogDetailModal
        isOpen={detailModal.isOpen}
        onOpenChange={detailModal.onOpenChange}
        log={currentLog}
      />

      {/* 批量删除确认弹窗 */}
      <BatchDeleteModal
        isOpen={batchDeleteModal.isOpen}
        onOpenChange={batchDeleteModal.onOpenChange}
        selectedCount={selectedKeys.size}
        onConfirm={handleBatchDelete}
      />
    </div>
  )
}
