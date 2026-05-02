/**
 * 参数配置页面
 * 
 * 工具栏 + 表格布局：
 * - 顶部工具栏：搜索框（参数名称/参数键名）、状态筛选、新增按钮
 * - 中部表格：参数列表，支持多选批量操作
 * - 底部：后端分页控件
 * - 弹窗：新增/编辑参数、删除确认
 */

// ===== 1. 依赖导入区域 =====

import { useState, useEffect, useCallback } from 'react'

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
  Textarea
} from '@heroui/react'

import {
  Trash2,
  Plus,
  Pencil,
  Search,
  RefreshCw,
  Settings2
} from 'lucide-react'

import { toast } from '@/utils/toast'
import { formatDateTime } from '@/utils/format'
import { StatusState } from '@/components/ui/StatusState'
import { PAGINATION } from '@/constants'

import {
  getConfigList,
  createConfig,
  updateConfig,
  deleteConfig
} from '@/api/admin/config'

import type {
  SysConfig,
  SysConfigQueryParams,
  SysConfigCreateInput,
  SysConfigUpdateInput,
  SysConfigPageData
} from '@/types/config.types'

// ===== 3. 常量定义区域 =====

const DEFAULT_PAGE_SIZE = PAGINATION.DEFAULT_PAGE_SIZE as number
const PAGE_SIZE_OPTIONS = [...PAGINATION.PAGE_SIZE_OPTIONS] as number[]

// ===== 5. 子组件区域 =====

interface ConfigEditModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  configData: SysConfig | null
  mode: 'create' | 'edit'
  onSuccess: () => void
}

function ConfigEditModal({ isOpen, onOpenChange, configData, mode, onSuccess }: ConfigEditModalProps) {
  const [formData, setFormData] = useState<SysConfigCreateInput & { id?: string }>({
    configName: '',
    configKey: '',
    configValue: '',
    remark: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && configData) {
        setFormData({
          id: configData.id,
          configName: configData.configName,
          configKey: configData.configKey,
          configValue: configData.configValue,
          remark: configData.remark ?? ''
        })
      } else {
        setFormData({
          configName: '',
          configKey: '',
          configValue: '',
          remark: ''
        })
      }
    }
  }, [mode, configData, isOpen])

  const handleFieldChange = useCallback(<K extends keyof SysConfigCreateInput>(key: K, value: SysConfigCreateInput[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!formData.configName.trim()) {
      toast.warning('请输入参数名称')
      return
    }
    if (!formData.configKey.trim()) {
      toast.warning('请输入参数键名')
      return
    }
    if (!formData.configValue.trim()) {
      toast.warning('请输入参数值')
      return
    }

    setIsSubmitting(true)
    try {
      if (mode === 'edit' && formData.id) {
        const updateData: SysConfigUpdateInput = {
          id: formData.id,
          configName: formData.configName,
          configValue: formData.configValue,
          remark: formData.remark || undefined
        }
        await updateConfig(updateData)
        toast.success('参数修改成功')
      } else {
        const createData: SysConfigCreateInput = {
          configName: formData.configName,
          configKey: formData.configKey,
          configValue: formData.configValue,
          remark: formData.remark || undefined
        }
        await createConfig(createData)
        toast.success('参数创建成功')
      }
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : '操作失败，请稍后重试'
      toast.error(message)
      console.error('参数操作失败：', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, mode, onSuccess, onOpenChange])

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="lg"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader>
          {mode === 'create' ? '新增参数' : '编辑参数'}
        </ModalHeader>
        <ModalBody className="gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="参数名称"
              placeholder="请输入参数名称"
              isRequired
              value={formData.configName}
              onValueChange={v => handleFieldChange('configName', v)}
            />
            <Input
              label="参数键名"
              placeholder="请输入参数键名"
              isRequired
              isDisabled={mode === 'edit'}
              value={formData.configKey}
              onValueChange={v => handleFieldChange('configKey', v)}
              description={mode === 'edit' ? '参数键名不可修改' : undefined}
            />
            <Textarea
              label="参数值"
              placeholder="请输入参数值"
              isRequired
              value={formData.configValue}
              onValueChange={v => handleFieldChange('configValue', v)}
              maxRows={4}
              className="md:col-span-2"
            />
            <Textarea
              label="备注"
              placeholder="请输入备注信息"
              value={formData.remark}
              onValueChange={v => handleFieldChange('remark', v)}
              maxRows={3}
              className="md:col-span-2"
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={() => onOpenChange(false)}>
            取消
          </Button>
          <Button
            color="primary"
            isLoading={isSubmitting}
            onPress={handleSubmit}
          >
            {mode === 'create' ? '创建' : '保存'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

// ===== 11. 导出区域 =====

export default function SystemConfig() {
  // ===== 3. 状态控制逻辑区域 =====

  const [configList, setConfigList] = useState<SysConfig[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())
  const [queryParams, setQueryParams] = useState<SysConfigQueryParams>({})
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const editModal = useDisclosure()
  const [editMode, setEditMode] = useState<'create' | 'edit'>('create')
  const [editingConfig, setEditingConfig] = useState<SysConfig | null>(null)

  const [searchKeyword, setSearchKeyword] = useState('')

  // ===== 6. 错误处理函数区域 =====

  const fetchConfigList = useCallback(async () => {
    setIsLoading(true)
    try {
      const params: SysConfigQueryParams = {
        ...queryParams,
        pageNum: page,
        pageSize
      }
      const data: SysConfigPageData = await getConfigList(params)
      if (data && data.list) {
        setConfigList(data.list)
        setTotal(parseInt(data.total || '0', 10))
        setTotalPages(parseInt(data.totalPages || '0', 10))
      } else {
        setConfigList([])
        setTotal(0)
        setTotalPages(0)
      }
    } catch (error) {
      console.error('获取参数列表失败：', error)
      toast.error('获取参数列表失败')
      setConfigList([])
      setTotal(0)
      setTotalPages(0)
    } finally {
      setIsLoading(false)
    }
  }, [queryParams, page, pageSize])

  const handleDeleteConfig = useCallback(async (ids: string[]) => {
    try {
      await deleteConfig(ids.join(','))
      toast.success('删除成功')
      fetchConfigList()
      setSelectedKeys(new Set())
    } catch (error) {
      const message = error instanceof Error ? error.message : '删除失败'
      toast.error(message)
      console.error('删除参数失败：', error)
    }
  }, [fetchConfigList])

  // ===== 9. 页面初始化与事件绑定 =====

  useEffect(() => {
    fetchConfigList()
  }, [fetchConfigList])

  const handleCreateConfig = useCallback(() => {
    setEditMode('create')
    setEditingConfig(null)
    editModal.onOpen()
  }, [editModal])

  const handleEditConfig = useCallback((config: SysConfig) => {
    setEditMode('edit')
    setEditingConfig(config)
    editModal.onOpen()
  }, [editModal])

  const handleBatchDelete = useCallback(() => {
    if (selectedKeys.size === 0) {
      toast.warning('请选择要删除的参数')
      return
    }
    handleDeleteConfig(Array.from(selectedKeys))
  }, [selectedKeys, handleDeleteConfig])

  const handleSearch = useCallback(() => {
    setQueryParams(prev => ({
      ...prev,
      configName: searchKeyword.trim() || undefined,
      configKey: undefined
    }))
    setPage(1)
  }, [searchKeyword])

  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }, [handleSearch])

  const handleResetQuery = useCallback(() => {
    setQueryParams({})
    setSearchKeyword('')
    setPage(1)
  }, [])

  const handlePageSizeChange = useCallback((keys: 'all' | Set<React.Key>) => {
    if (keys === 'all') return
    const value = Array.from(keys)[0] as string
    setPageSize(Number(value))
    setPage(1)
  }, [])

  // ===== 8. UI渲染逻辑区域 =====

  return (
    <div className="flex flex-col gap-4 p-4 md:p-0 h-full">
      <Card className="h-full">
        <CardBody className="p-0 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-default-800">
            <div className="flex items-center gap-2">
              <Settings2 size={18} className="text-primary" />
              <span className="font-semibold text-sm">参数配置</span>
            </div>
            <div className="flex items-center gap-1">
              <Tooltip content="新增参数" size="sm">
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onPress={handleCreateConfig}
                >
                  <Plus size={16} />
                </Button>
              </Tooltip>
              <Tooltip content="刷新" size="sm">
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onPress={fetchConfigList}
                  isLoading={isLoading}
                >
                  <RefreshCw size={16} />
                </Button>
              </Tooltip>
            </div>
          </div>

          <div className="px-4 py-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Input
              size="sm"
              placeholder="搜索参数名称/键名"
              className="w-full sm:w-56"
              value={searchKeyword}
              onValueChange={setSearchKeyword}
              onKeyDown={handleSearchKeyDown}
              startContent={<Search size={14} className="text-default-400" />}
              isClearable
              onClear={() => {
                setSearchKeyword('')
                setQueryParams(prev => ({ ...prev, configName: undefined }))
              }}
            />
            <Button size="sm" variant="flat" onPress={handleResetQuery}>
                重置
              </Button>
              <div className="hidden sm:flex-1" />
              {selectedKeys.size > 0 && (
                <Button
                  size="sm"
                  color="danger"
                  variant="flat"
                  startContent={<Trash2 size={14} />}
                  onPress={handleBatchDelete}
                >
                  批量删除({selectedKeys.size})
                </Button>
              )}
            </div>
          </div>

          <div className="flex-1 p-3">
            {isLoading ? (
              <StatusState type="loading" scene="admin" />
            ) : (
              <Table
                aria-label="参数列表"
                selectionMode="multiple"
                selectedKeys={selectedKeys}
                onSelectionChange={keys => setSelectedKeys(keys as Set<string>)}
                classNames={{
                  wrapper: 'p-0',
                  thead: '[&>tr]:first:shadow-none',
                }}
              >
                <TableHeader>
                  <TableColumn key="configName">参数名称</TableColumn>
                  <TableColumn key="configKey">参数键名</TableColumn>
                  <TableColumn key="configValue">参数值</TableColumn>
                  <TableColumn key="remark" className="hidden lg:table-cell">备注</TableColumn>
                  <TableColumn key="createTime" className="hidden lg:table-cell">创建时间</TableColumn>
                  <TableColumn key="actions">操作</TableColumn>
                </TableHeader>
                <TableBody
                  items={configList.map(item => ({ ...item, key: item.id }))}
                  emptyContent={<StatusState type="empty" scene="admin" />}
                >
                  {(item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <span className="font-medium text-sm">{item.configName}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-mono">{item.configKey}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm truncate max-w-32">{item.configValue}</span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span className="text-sm">{item.remark || '-'}</span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span className="text-sm">
                          {item.createTime ? formatDateTime(item.createTime) : '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Tooltip content="编辑" size="sm">
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              onPress={() => handleEditConfig(item)}
                            >
                              <Pencil size={14} />
                            </Button>
                          </Tooltip>
                          <Tooltip content="删除" size="sm">
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              color="danger"
                              onPress={() => handleDeleteConfig([item.id])}
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

          {total > 0 && (
            <div className="flex items-center justify-between px-4 py-2">
              <div className="flex items-center gap-2">
                <Select
                  size="sm"
                  aria-label="每页条数"
                  className="w-24"
                  selectedKeys={[String(pageSize)]}
                  onSelectionChange={handlePageSizeChange}
                  renderValue={() => `${pageSize}条/页`}
                >
                  {PAGE_SIZE_OPTIONS.map(size => (
                    <SelectItem key={String(size)} textValue={`${size}条/页`}>{size}条/页</SelectItem>
                  ))}
                </Select>
                <span className="text-xs text-default-400">
                  共 {total} 条
                </span>
              </div>
              <Pagination
                total={totalPages}
                page={page}
                onChange={setPage}
                size="sm"
                showControls
              />
            </div>
          )}
        </CardBody>
      </Card>

      <ConfigEditModal
        isOpen={editModal.isOpen}
        onOpenChange={editModal.onOpenChange}
        configData={editingConfig}
        mode={editMode}
        onSuccess={fetchConfigList}
      />
    </div>
  )
}