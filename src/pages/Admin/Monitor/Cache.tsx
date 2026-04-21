/**
 * 缓存管理页面
 * 
 * 页面布局：
 * - 顶部标签页区域：缓存概览、缓存键列表
 * - 顶部工具栏区域：搜索框、缓存名称筛选、操作按钮
 * - 中部表格区域：缓存键列表表格
 * - 弹窗组件：缓存详情、批量操作确认
 * 
 * 功能模块：
 * - 缓存概览：展示缓存实例和统计信息
 * - 缓存键列表：分页展示、搜索、筛选、批量操作
 * - 缓存管理：查看详情、删除、刷新、预热、清空
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
  CardHeader,
  Tabs,
  Tab,
  useDisclosure,
  Tooltip,
  Pagination,
  Spinner,
  Badge,
  Divider
} from '@heroui/react'

// 图标（Lucide React）
import {
  Search,
  RefreshCw,
  Trash2,
  Database,
  Clock,
  Zap,
  PieChart as PieChartIcon,
  Cpu,
  HardDrive,
  Play,
  Flame
} from 'lucide-react'

// 工具函数
import { toast } from '@/utils/toast'
import { formatFileSize } from '@/utils/common'

// 常量
import { PAGINATION } from '@/constants'

// 通用状态组件
import { StatusState } from '@/components/ui/StatusState'
// 时间轴组件
import { Timeline } from '@/components/ui/Timeline'
import type { TimelineItem } from '@/components/ui/Timeline'
// ECharts 图表组件
import { PieChart, GaugeChart } from '@/components/ui/ECharts'

// API 接口
import {
  getRedisInfo,
  getCacheStatistics,
  getCacheDistribution,
  getMemoryUsage,
  getCacheKeyList,
  getCacheLogs,
  refreshCacheKey,
  batchRefreshCacheKeys,
  batchDeleteCacheKeys,
  warmupCache,
  clearAllCache,
  deleteCacheKey
} from '@/api/admin/cache'

// 类型定义
import type {
  CacheKeyInfo,
  CacheKeyQueryParams,
  CacheStatistics,
  PieChartDataPoint,
  GaugeChartData,
  RedisInfo,
  WarmupResult,
  CacheOperationLog
} from '@/types/cache.types'

/**
 * 批量操作确认弹窗组件
 */
interface BatchActionModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  actionType: 'delete' | 'refresh'
  selectedCount: number
  onConfirm: () => void
}

function BatchActionModal({ isOpen, onOpenChange, actionType, selectedCount, onConfirm }: BatchActionModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="sm"
    >
      <ModalContent>
        <ModalHeader>
          {actionType === 'delete' ? (
            <div className="flex items-center gap-2 text-danger">
              <Trash2 size={18} />
              <span>批量删除确认</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-primary">
              <RefreshCw size={18} />
              <span>批量刷新确认</span>
            </div>
          )}
        </ModalHeader>
        <ModalBody>
          <p className="text-sm text-default-600">
            {actionType === 'delete'
              ? `确定要删除选中的 ${selectedCount} 个缓存键吗？此操作不可恢复。`
              : `确定要刷新选中的 ${selectedCount} 个缓存键吗？`}
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={() => onOpenChange(false)}>
            取消
          </Button>
          <Button
            color={actionType === 'delete' ? 'danger' : 'primary'}
            onPress={() => {
              onConfirm()
              onOpenChange(false)
            }}
          >
            {actionType === 'delete' ? '删除' : '刷新'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

/**
 * 预热结果弹窗组件
 */
interface WarmupResultModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  results: WarmupResult[]
}

function WarmupResultModal({ isOpen, onOpenChange, results }: WarmupResultModalProps) {
  const successCount = results.filter(r => r.success).length
  const failCount = results.filter(r => !r.success).length

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="md"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <Play size={18} className="text-primary" />
          <span>缓存预热结果</span>
        </ModalHeader>
        <ModalBody className="gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-success-50 rounded-lg">
              <div className="text-2xl font-bold text-success">{successCount}</div>
              <div className="text-xs text-success-600">成功预热</div>
            </div>
            <div className="p-3 bg-danger-50 rounded-lg">
              <div className="text-2xl font-bold text-danger">{failCount}</div>
              <div className="text-xs text-danger-600">预热失败</div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs text-default-400">预热详情</label>
            <div className="space-y-2 max-h-60 overflow-auto">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${result.success ? 'bg-default-50' : 'bg-danger-50'}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{result.cacheName}</span>
                    <Badge
                      color={result.success ? 'success' : 'danger'}
                      variant="flat"
                    >
                      {result.success ? '成功' : '失败'}
                    </Badge>
                  </div>
                  <div className="text-xs text-default-400">
                    预热数量: {result.count} | 耗时: {result.duration}ms
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onPress={() => onOpenChange(false)}>
            确定
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

/**
 * 统计卡片组件
 */
interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  color?: 'primary' | 'success' | 'warning' | 'danger'
  subtitle?: string
}

function StatCard({ title, value, icon, color = 'primary', subtitle }: StatCardProps) {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary',
    success: 'bg-success-50 text-success',
    warning: 'bg-warning-50 text-warning',
    danger: 'bg-danger-50 text-danger'
  }

  return (
    <Card className="h-full">
      <CardBody className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs text-default-400">{title}</p>
            <p className="text-2xl font-bold text-default-800">{value}</p>
            {subtitle && (
              <p className="text-xs text-default-400">{subtitle}</p>
            )}
          </div>
          <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
            {icon}
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

/**
 * 缓存管理主页面组件
 */
export default function CachePage() {
  // ===== 3. 状态控制逻辑区域 =====

  /** 当前激活的标签页 */
  const [activeTab, setActiveTab] = useState<'overview' | 'keys'>('keys')

  /** Redis服务器信息 */
  const [redisInfo, setRedisInfo] = useState<RedisInfo | null>(null)
  /** 缓存统计信息 */
  const [statistics, setStatistics] = useState<CacheStatistics | null>(null)
  /** 缓存分布数据 */
  const [distribution, setDistribution] = useState<PieChartDataPoint[]>([])
  /** 内存使用数据 */
  const [memoryUsage, setMemoryUsage] = useState<GaugeChartData | null>(null)
  /** 概览数据加载状态 */
  const [overviewLoading, setOverviewLoading] = useState(false)

  /** 缓存键列表数据 */
  const [cacheKeyList, setCacheKeyList] = useState<CacheKeyInfo[]>([])
  /** 列表加载状态 */
  const [keysLoading, setKeysLoading] = useState(false)
  /** 表格多选选中的行 key 集合 */
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())
  /** 查询参数 */
  const [queryParams, setQueryParams] = useState<CacheKeyQueryParams>({})
  /** 分页参数 */
  const [pageNum, setPageNum] = useState(1)
  const [pageSize, setPageSize] = useState<number>(PAGINATION.DEFAULT_PAGE_SIZE)
  /** 总条数 */
  const [total, setTotal] = useState(0)

  /** 搜索关键词 */
  const [searchKeyword, setSearchKeyword] = useState('')
  /** 当前选中的缓存名称 */
  const [selectedCacheName, setSelectedCacheName] = useState<string>('')

  /** 批量操作弹窗控制 */
  const batchModal = useDisclosure()
  /** 批量操作类型 */
  const [batchActionType, setBatchActionType] = useState<'delete' | 'refresh'>('delete')

  /** 预热结果弹窗控制 */
  const warmupModal = useDisclosure()
  /** 预热结果 */
  const [warmupResults, setWarmupResults] = useState<WarmupResult[]>([])

  /** 操作加载状态 */
  const [actionLoading, setActionLoading] = useState(false)

  /** 缓存操作日志 */
  const [logs, setLogs] = useState<TimelineItem[]>([])
  /** 日志加载状态 */
  const [logsLoading, setLogsLoading] = useState(false)

  // ===== 4. 通用工具函数区域 =====

  /**
   * 获取缓存键列表数据
   */
  const fetchCacheKeyList = useCallback(async () => {
    setKeysLoading(true)
    try {
      const params: CacheKeyQueryParams = {
        ...queryParams,
        pageNum,
        pageSize
      }
      const data = await getCacheKeyList(params)
      
      if (Array.isArray(data)) {
        setCacheKeyList(data)
        setTotal(data.length)
      } else if (data && data.list) {
        setCacheKeyList(data.list)
        setTotal(Number(data.total) || 0)
      } else {
        setCacheKeyList([])
        setTotal(0)
      }
    } catch (error) {
      console.error('获取缓存键列表失败：', error)
      toast.error('获取缓存键列表失败')
      setCacheKeyList([])
      setTotal(0)
    } finally {
      setKeysLoading(false)
    }
  }, [queryParams, pageNum, pageSize])

  /**
   * 获取概览数据
   */
  const fetchOverviewData = useCallback(async () => {
    setOverviewLoading(true)
    try {
      const [redisData, statsData, distributionData, memoryData] = await Promise.all([
        getRedisInfo(),
        getCacheStatistics(),
        getCacheDistribution(),
        getMemoryUsage()
      ])
      setRedisInfo(redisData || null)
      setStatistics(statsData)
      setDistribution(Array.isArray(distributionData) ? distributionData : [])
      setMemoryUsage(memoryData || null)
    } catch (error) {
      console.error('获取概览数据失败：', error)
      toast.error('获取概览数据失败')
      setRedisInfo(null)
      setDistribution([])
      setMemoryUsage(null)
    } finally {
      setOverviewLoading(false)
    }
  }, [])

  /**
   * 获取缓存操作日志
   */
  const fetchLogs = useCallback(async () => {
    setLogsLoading(true)
    try {
      const response: CacheOperationLog[] = await getCacheLogs()
      const logItems: TimelineItem[] = response.map((log) => ({
        id: log.id,
        time: log.operTime,
        type: log.operType,
        message: log.message,
        result: log.result,
        instanceId: log.instanceId
      }))
      setLogs(logItems)
    } catch (error) {
      toast.error('获取缓存操作日志失败')
      console.error('获取缓存日志失败:', error)
    } finally {
      setLogsLoading(false)
    }
  }, [])

  /**
   * 刷新单个缓存键
   */
  const handleRefreshKey = useCallback(async (cacheKey: string) => {
    setActionLoading(true)
    try {
      await refreshCacheKey(cacheKey)
      toast.success('缓存刷新成功')
      fetchCacheKeyList()
    } catch (error) {
      const message = error instanceof Error ? error.message : '刷新失败'
      toast.error(message)
      console.error('刷新缓存失败：', error)
    } finally {
      setActionLoading(false)
    }
  }, [fetchCacheKeyList])

  /**
   * 删除单个缓存键
   */
  const handleDeleteKey = useCallback(async (cacheKey: string) => {
    setActionLoading(true)
    try {
      await deleteCacheKey(cacheKey)
      toast.success('缓存删除成功')
      fetchCacheKeyList()
      setSelectedKeys(prev => {
        const next = new Set(prev)
        next.delete(cacheKey)
        return next
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : '删除失败'
      toast.error(message)
      console.error('删除缓存失败：', error)
    } finally {
      setActionLoading(false)
    }
  }, [fetchCacheKeyList])

  /**
   * 批量刷新缓存键
   */
  const handleBatchRefresh = useCallback(async () => {
    const keys = Array.from(selectedKeys)
    if (keys.length === 0) {
      toast.warning('请选择要刷新的缓存键')
      return
    }
    setActionLoading(true)
    try {
      await batchRefreshCacheKeys(keys)
      toast.success('批量刷新成功')
      fetchCacheKeyList()
      setSelectedKeys(new Set())
    } catch (error) {
      const message = error instanceof Error ? error.message : '批量刷新失败'
      toast.error(message)
      console.error('批量刷新失败：', error)
    } finally {
      setActionLoading(false)
    }
  }, [selectedKeys, fetchCacheKeyList])

  /**
   * 批量删除缓存键
   */
  const handleBatchDelete = useCallback(async () => {
    const keys = Array.from(selectedKeys)
    if (keys.length === 0) {
      toast.warning('请选择要删除的缓存键')
      return
    }
    setActionLoading(true)
    try {
      await batchDeleteCacheKeys(keys)
      toast.success('批量删除成功')
      fetchCacheKeyList()
      setSelectedKeys(new Set())
    } catch (error) {
      const message = error instanceof Error ? error.message : '批量删除失败'
      toast.error(message)
      console.error('批量删除失败：', error)
    } finally {
      setActionLoading(false)
    }
  }, [selectedKeys, fetchCacheKeyList])

  /**
   * 执行缓存预热
   */
  const handleWarmup = useCallback(async () => {
    setActionLoading(true)
    try {
      const results = await warmupCache()
      setWarmupResults(results)
      warmupModal.onOpen()
      toast.success('缓存预热完成')
      fetchOverviewData()
    } catch (error) {
      const message = error instanceof Error ? error.message : '缓存预热失败'
      toast.error(message)
      console.error('缓存预热失败：', error)
    } finally {
      setActionLoading(false)
    }
  }, [fetchOverviewData, warmupModal])

  /**
   * 清空所有缓存
   */
  const handleClearAll = useCallback(async () => {
    if (!window.confirm('确定要清空所有缓存吗？此操作不可恢复！')) {
      return
    }
    setActionLoading(true)
    try {
      const count = await clearAllCache()
      toast.success(`成功清空 ${count} 个缓存`)
      fetchCacheKeyList()
      fetchOverviewData()
    } catch (error) {
      const message = error instanceof Error ? error.message : '清空缓存失败'
      toast.error(message)
      console.error('清空缓存失败：', error)
    } finally {
      setActionLoading(false)
    }
  }, [fetchCacheKeyList, fetchOverviewData])

  /**
   * 打开批量操作弹窗
   */
  const handleOpenBatchModal = useCallback((type: 'delete' | 'refresh') => {
    if (selectedKeys.size === 0) {
      toast.warning('请先选择要操作的缓存键')
      return
    }
    setBatchActionType(type)
    batchModal.onOpen()
  }, [selectedKeys, batchModal])

  /**
   * 执行搜索
   */
  const handleSearch = useCallback(() => {
    setQueryParams(prev => ({
      ...prev,
      keyword: searchKeyword.trim() || undefined
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
   * 缓存名称筛选变更
   */
  const handleCacheNameChange = useCallback((keys: 'all' | Set<React.Key>) => {
    if (keys === 'all') return
    const value = Array.from(keys)[0] as string
    const cacheName = value === '' ? undefined : value
    setSelectedCacheName(value)
    setQueryParams(prev => ({
      ...prev,
      cacheName
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
    setSelectedCacheName('')
    setPageNum(1)
  }, [])

  // ===== 9. 页面初始化与事件绑定 =====

  /** 页面挂载时加载概览数据 */
  useEffect(() => {
    fetchOverviewData()
  }, [fetchOverviewData])

  /** 查询参数变化时重新加载缓存键列表 */
  useEffect(() => {
    fetchCacheKeyList()
  }, [fetchCacheKeyList])

  /** 页面挂载时加载缓存操作日志 */
  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  // ===== 8. UI渲染逻辑区域 =====

  return (
    <div className="flex flex-col gap-4 p-4 md:p-0 h-full">
      <Card className="h-full overflow-hidden">
        <CardBody className="p-0 flex flex-col overflow-hidden">
          {/* 顶部标题栏 */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-divider">
            <div className="flex items-center gap-2">
              <Database size={18} className="text-primary" />
              <span className="font-semibold text-sm">缓存管理</span>
            </div>
            <div className="flex items-center gap-2">
              <Tooltip content="刷新数据" size="sm">
                <Button
                  size="sm"
                  variant="light"
                  isIconOnly
                  startContent={<RefreshCw size={14} />}
                  onPress={() => {
                    fetchOverviewData()
                    fetchCacheKeyList()
                    fetchLogs()
                  }}
                  isLoading={actionLoading}
                />
              </Tooltip>
              <Tooltip content="缓存预热" size="sm">
                <Button
                  size="sm"
                  variant="light"
                  isIconOnly
                  startContent={<Flame size={14} />}
                  onPress={handleWarmup}
                  isLoading={actionLoading}
                />
              </Tooltip>
              <Tooltip content="清空所有缓存" size="sm">
                <Button
                  size="sm"
                  variant="light"
                  color="danger"
                  isIconOnly
                  startContent={<Trash2 size={14} />}
                  onPress={handleClearAll}
                  isLoading={actionLoading}
                />
              </Tooltip>
            </div>
          </div>

          {/* 标签页切换 */}
          <Tabs 
            selectedKey={activeTab} 
            onSelectionChange={(key) => setActiveTab(key as 'overview' | 'keys')}
            variant="underlined"
          >
            {/* 缓存概览面板 */}
            <Tab key="overview" title="缓存概览">
              <Divider />
              <div className="flex-1 p-4 overflow-auto">
                {overviewLoading ? (
                  <div className="flex justify-center py-12">
                    <Spinner label="加载中..." />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* 统计卡片 */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <StatCard
                        title="缓存键总数"
                        value={Number(statistics?.totalKeys) || 0}
                        icon={<Database size={20} />}
                        color="primary"
                      />
                      <StatCard
                        title="命中率"
                        value={`${(statistics?.hitRate || 0).toFixed(2)}%`}
                        icon={<PieChartIcon size={20} />}
                        color="success"
                        subtitle={statistics?.todayHits !== undefined || statistics?.todayMisses !== undefined
                          ? `命中: ${statistics?.todayHits || 0} | 未命中: ${statistics?.todayMisses || 0}`
                          : undefined}
                      />
                      <StatCard
                        title="QPS"
                        value={Number(statistics?.qps) || 0}
                        icon={<Zap size={20} />}
                        color="warning"
                        subtitle={statistics?.avgResponseTime !== undefined
                          ? `平均响应: ${statistics?.avgResponseTime}ms`
                          : undefined}
                      />
                      <StatCard
                        title="总键数"
                        value={Number(redisInfo?.totalKeys) || 0}
                        icon={<Cpu size={20} />}
                        color="primary"
                      />
                    </div>

                    {/* 图表区域 */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="px-4 py-3 pb-0">
                          <h3 className="text-sm font-medium flex items-center gap-2">
                            <PieChartIcon size={16} className="text-primary" />
                            缓存分布
                          </h3>
                        </CardHeader>
                        <CardBody className="p-4">
                          <PieChart
                            data={distribution}
                            title=""
                            height="260px"
                          />
                        </CardBody>
                      </Card>
                      <Card>
                        <CardHeader className="px-4 py-3 pb-0">
                          <h3 className="text-sm font-medium flex items-center gap-2">
                            <HardDrive size={16} className="text-success" />
                            内存使用量
                          </h3>
                        </CardHeader>
                        <CardBody className="p-4">
                          <GaugeChart
                            data={memoryUsage}
                            height="260px"
                          />
                        </CardBody>
                      </Card>
                    </div>

                    {/* Redis服务器信息 */}
                    <Card>
                      <CardHeader className="px-4 py-3 pb-0">
                        <h3 className="text-sm font-medium flex items-center gap-2">
                          <Cpu size={16} className="text-primary" />
                          Redis服务器信息
                        </h3>
                      </CardHeader>
                      <CardBody className="p-4">
                        {!redisInfo ? (
                          <div className="text-center py-8 text-default-400 text-sm">
                            获取Redis信息失败
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-3 bg-default-50 rounded-lg">
                              <div className="flex items-center gap-2 mb-1">
                                <Database size={14} className="text-primary" />
                                <span className="text-xs text-default-400">版本</span>
                              </div>
                              <p className="text-sm font-medium">{redisInfo.redisVersion || '-'}</p>
                            </div>
                            <div className="p-3 bg-default-50 rounded-lg">
                              <div className="flex items-center gap-2 mb-1">
                                <Clock size={14} className="text-primary" />
                                <span className="text-xs text-default-400">运行模式</span>
                              </div>
                              <p className="text-sm font-medium">{redisInfo.mode || '-'}</p>
                            </div>
                            <div className="p-3 bg-default-50 rounded-lg">
                              <div className="flex items-center gap-2 mb-1">
                                <Zap size={14} className="text-primary" />
                                <span className="text-xs text-default-400">运行天数</span>
                              </div>
                              <p className="text-sm font-medium">
                                {redisInfo.uptimeInSeconds !== undefined
                                  ? Math.floor(redisInfo.uptimeInSeconds / 86400)
                                  : 0} 天
                              </p>
                            </div>
                            <div className="p-3 bg-default-50 rounded-lg">
                              <div className="flex items-center gap-2 mb-1">
                                <HardDrive size={14} className="text-primary" />
                                <span className="text-xs text-default-400">内存使用量</span>
                              </div>
                              <p className="text-sm font-medium">
                                {redisInfo.usedMemory !== undefined
                                  ? formatFileSize(redisInfo.usedMemory!)
                                  : '-'}
                              </p>
                            </div>
                          </div>
                        )}
                      </CardBody>
                    </Card>
                  </div>
                )}
              </div>
            </Tab>

            {/* 缓存键列表面板 */}
            <Tab key="keys" title="缓存键列表">
              <Divider />
              <div className="flex-1 flex flex-col overflow-hidden">
              {/* 查询工具栏 */}
              <div className="px-4 py-3 border-b border-divider">
                <div className="flex items-center gap-2 flex-wrap">
                  <Input
                    size="sm"
                    placeholder="搜索缓存键名"
                    className="w-full sm:w-56"
                    value={searchKeyword}
                    onValueChange={setSearchKeyword}
                    onKeyDown={handleSearchKeyDown}
                    startContent={<Search size={14} className="text-default-400" />}
                    isClearable
                    onClear={() => {
                      setSearchKeyword('')
                      setQueryParams(prev => ({ ...prev, keyword: undefined }))
                    }}
                  />
                  <Select
                    size="sm"
                    placeholder="缓存名称"
                    className="w-full sm:w-32"
                    aria-label="缓存名称筛选"
                    selectedKeys={selectedCacheName ? [selectedCacheName] : []}
                    onSelectionChange={handleCacheNameChange}
                  >
                    <Fragment key="select-items">
                      <SelectItem key="all" textValue="全部">全部</SelectItem>
                      {distribution.map((item) => (
                        <SelectItem key={item.name} textValue={item.name}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </Fragment>
                  </Select>
                  <Button size="sm" variant="flat" onPress={handleResetQuery}>
                    重置
                  </Button>
                  <div className="hidden sm:flex-1" />
                  {selectedKeys.size > 0 && (
                    <>
                      <Button
                        size="sm"
                        variant="flat"
                        color="primary"
                        startContent={<RefreshCw size={14} />}
                        onPress={() => handleOpenBatchModal('refresh')}
                      >
                        批量刷新({selectedKeys.size})
                      </Button>
                      <Button
                        size="sm"
                        variant="flat"
                        color="danger"
                        startContent={<Trash2 size={14} />}
                        onPress={() => handleOpenBatchModal('delete')}
                      >
                        批量删除({selectedKeys.size})
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* 缓存键列表表格 */}
              <div className="flex-1 p-3 overflow-auto">
                {keysLoading ? (
                  <StatusState type="loading" scene="admin" />
                ) : (
                  <Table
                    aria-label="缓存键列表"
                    selectionMode="multiple"
                    selectedKeys={selectedKeys}
                    onSelectionChange={keys => setSelectedKeys(keys as Set<string>)}
                    classNames={{
                      wrapper: 'p-0',
                      thead: '[&>tr]:first:shadow-none',
                    }}
                  >
                    <TableHeader>
                      <TableColumn key="cacheKey">缓存键名</TableColumn>
                      <TableColumn key="cacheName" className="hidden md:table-cell">缓存名称</TableColumn>
                      <TableColumn key="cacheValue">缓存值</TableColumn>
                      <TableColumn key="dataType" className="hidden lg:table-cell">数据类型</TableColumn>
                      <TableColumn key="dataSize" className="hidden md:table-cell">数据大小</TableColumn>
                      <TableColumn key="ttlDesc">过期时间</TableColumn>
                      <TableColumn key="actions">操作</TableColumn>
                    </TableHeader>
                    <TableBody
                      items={cacheKeyList.map(item => ({ ...item, key: item.cacheKey }))}
                      emptyContent={<StatusState type="empty" scene="admin" />}
                    >
                      {(item) => (
                        <TableRow key={item.cacheKey}>
                          <TableCell>
                            <span className="text-sm font-medium break-all max-w-40">
                              {item.cacheKey}
                            </span>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <span className="text-sm text-default-600 truncate max-w-32">
                              {item.cacheName}
                            </span>
                          </TableCell>
                          <TableCell>
                            {item.cacheValue && item.cacheValue.length > 0 ? (
                              <Tooltip content={item.cacheValue} size="sm">
                                <span className="text-sm text-default-600 truncate max-w-40 cursor-pointer">
                                  {item.cacheValue.length > 10
                                    ? item.cacheValue.substring(0, 10) + '...'
                                    : item.cacheValue}
                                </span>
                              </Tooltip>
                            ) : (
                              <span className="text-sm text-default-400">-</span>
                            )}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <Chip size="sm" variant="flat" color="secondary">
                              {item.dataType}
                            </Chip>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <span className="text-sm text-default-600">
                              {formatFileSize(item.dataSize)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Clock size={12} className="text-default-400" />
                              <span className={`text-sm ${
                                item.ttl > 0 && item.ttl < 3600
                                  ? 'text-warning'
                                  : 'text-default-600'
                              }`}>
                                {item.ttlDesc}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Tooltip content="刷新缓存" size="sm">
                                <Button
                                  isIconOnly
                                  size="sm"
                                  variant="light"
                                  color="primary"
                                  onPress={() => handleRefreshKey(item.cacheKey)}
                                  isLoading={actionLoading}
                                >
                                  <RefreshCw size={14} />
                                </Button>
                              </Tooltip>
                              <Tooltip content="删除缓存" size="sm">
                                <Button
                                  isIconOnly
                                  size="sm"
                                  variant="light"
                                  color="danger"
                                  onPress={() => handleDeleteKey(item.cacheKey)}
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
              </div>
            </Tab>
          </Tabs>
        </CardBody>
      </Card>

      {/* 批量操作确认弹窗 */}
      <BatchActionModal
        isOpen={batchModal.isOpen}
        onOpenChange={batchModal.onOpenChange}
        actionType={batchActionType}
        selectedCount={selectedKeys.size}
        onConfirm={batchActionType === 'delete' ? handleBatchDelete : handleBatchRefresh}
      />

      {/* 预热结果弹窗 */}
      <WarmupResultModal
        isOpen={warmupModal.isOpen}
        onOpenChange={warmupModal.onOpenChange}
        results={warmupResults}
      />

      {/* 缓存操作日志卡片 */}
      <Card className="h-auto">
        <CardBody className="p-0">
          <div className="flex items-center justify-between px-4 py-3 border-b border-divider">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-primary" />
              <span className="font-semibold text-sm">缓存操作日志</span>
            </div>
            <button
              onClick={fetchLogs}
              disabled={logsLoading}
              className="flex items-center gap-1 text-xs text-default-600 hover:text-primary transition-colors disabled:opacity-50"
            >
              <RefreshCw size={14} className={logsLoading ? 'animate-spin' : ''} />
              刷新
            </button>
          </div>
          <div className="p-4">
            {logsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            ) : (
              <Timeline items={logs} />
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}