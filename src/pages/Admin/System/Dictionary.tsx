/**
 * 字典管理页面
 * 
 * 双层表格布局：
 * - 顶部工具栏：搜索框（字典名称/字典编码）、状态筛选、新增按钮
 * - 上部表格：字典类型列表
 * - 下部表格：选中字典类型后显示其字典数据列表
 * - 底部：后端分页控件
 * - 弹窗：新增/编辑字典类型、新增/编辑字典数据、删除确认
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
  Textarea,
  Switch
} from '@heroui/react'

import {
  Trash2,
  Plus,
  Pencil,
  Search,
  RefreshCw,
  BookOpen,
  Database,
  Flame,
  RotateCw,
  XCircle
} from 'lucide-react'

import { toast } from '@/utils/toast'
import { getDictLabel } from '@/stores/dict'
import { StatusState } from '@/components/ui/StatusState'
import { DICT_COMMON_STATUS } from '@/constants/dict'
import { DictSelect } from '@/components/ui/dict/DictSelect'
import { PAGINATION } from '@/constants'

import {
  getDictTypeList,
  getDictDataList,
  createDictType,
  updateDictType,
  deleteDictType,
  createDictData,
  updateDictData,
  deleteDictData,
  warmUpDictCache,
  getDictCacheTags,
  getDictCacheByTag,
  refreshDictCache,
  deleteDictCache,
  clearAllDictCache
} from '@/api/admin/dict'

import type {
  SysDictType,
  SysDictData,
  SysDictTypeQueryParams,
  SysDictDataQueryParams,
  SysDictTypeCreateInput,
  SysDictTypeUpdateInput,
  SysDictDataCreateInput,
  SysDictDataUpdateInput,
  DictStatus,
  SysDictTypePageData,
  SysDictDataPageData,
  DictCacheVO
} from '@/types/dict.types'

// ===== 3. 常量定义区域 =====

const DEFAULT_PAGE_SIZE = PAGINATION.DEFAULT_PAGE_SIZE as number
const PAGE_SIZE_OPTIONS = [...PAGINATION.PAGE_SIZE_OPTIONS] as number[]

// ===== 5. 子组件区域 =====

interface DictCachePanelProps {
  isOpen: boolean
  onClose: () => void
}

function DictCachePanel({ isOpen, onClose }: DictCachePanelProps) {
  const [cacheTags, setCacheTags] = useState<string[]>([])
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [cacheData, setCacheData] = useState<DictCacheVO | null>(null)
  const [isLoadingTags, setIsLoadingTags] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [isWarmingUp, setIsWarmingUp] = useState(false)

  const fetchCacheTags = useCallback(async () => {
    setIsLoadingTags(true)
    try {
      const tags = await getDictCacheTags()
      setCacheTags(tags ?? [])
    } catch (error) {
      console.error('获取缓存标签失败：', error)
      toast.error('获取缓存标签失败')
      setCacheTags([])
    } finally {
      setIsLoadingTags(false)
    }
  }, [])

  const fetchCacheData = useCallback(async (tag: string) => {
    setIsLoadingData(true)
    try {
      const data = await getDictCacheByTag(tag)
      setCacheData(data ?? null)
    } catch (error) {
      console.error('获取缓存数据失败：', error)
      toast.error('获取缓存数据失败')
      setCacheData(null)
    } finally {
      setIsLoadingData(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      fetchCacheTags()
      setSelectedTag(null)
      setCacheData(null)
    }
  }, [isOpen, fetchCacheTags])

  useEffect(() => {
    if (selectedTag) {
      fetchCacheData(selectedTag)
    } else {
      setCacheData(null)
    }
  }, [selectedTag, fetchCacheData])

  const handleWarmUp = useCallback(async () => {
    setIsWarmingUp(true)
    try {
      await warmUpDictCache()
      toast.success('缓存预热成功')
      fetchCacheTags()
    } catch (error) {
      const message = error instanceof Error ? error.message : '缓存预热失败'
      toast.error(message)
      console.error('缓存预热失败：', error)
    } finally {
      setIsWarmingUp(false)
    }
  }, [fetchCacheTags])

  const handleRefreshCache = useCallback(async (tag: string) => {
    try {
      await refreshDictCache(tag)
      toast.success(`缓存 ${tag} 刷新成功`)
      if (selectedTag === tag) {
        fetchCacheData(tag)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '刷新缓存失败'
      toast.error(message)
      console.error('刷新缓存失败：', error)
    }
  }, [selectedTag, fetchCacheData])

  const handleDeleteCache = useCallback(async (tag: string) => {
    try {
      await deleteDictCache(tag)
      toast.success(`缓存 ${tag} 已删除`)
      fetchCacheTags()
      if (selectedTag === tag) {
        setSelectedTag(null)
        setCacheData(null)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '删除缓存失败'
      toast.error(message)
      console.error('删除缓存失败：', error)
    }
  }, [fetchCacheTags, selectedTag])

  const handleClearAllCache = useCallback(async () => {
    try {
      await clearAllDictCache()
      toast.success('所有缓存已清空')
      setCacheTags([])
      setSelectedTag(null)
      setCacheData(null)
    } catch (error) {
      const message = error instanceof Error ? error.message : '清空缓存失败'
      toast.error(message)
      console.error('清空缓存失败：', error)
    }
  }, [])

  if (!isOpen) return null

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(open) => { if (!open) onClose() }}
      size="2xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader>
          <div className="flex items-center gap-2">
            <Database size={18} className="text-primary" />
            <span>字典缓存管理</span>
          </div>
        </ModalHeader>
        <ModalBody className="gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              color="primary"
              variant="flat"
              startContent={<Flame size={14} />}
              isLoading={isWarmingUp}
              onPress={handleWarmUp}
            >
              缓存预热
            </Button>
            <Button
              size="sm"
              variant="flat"
              startContent={<RefreshCw size={14} />}
              isLoading={isLoadingTags}
              onPress={fetchCacheTags}
            >
              刷新标签
            </Button>
            <div className="flex-1" />
            <Button
              size="sm"
              color="danger"
              variant="flat"
              startContent={<XCircle size={14} />}
              onPress={handleClearAllCache}
              isDisabled={cacheTags.length === 0}
            >
              清空所有缓存
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <div className="text-xs text-default-400 mb-2">
                缓存标签 ({cacheTags.length})
              </div>
              <div className="border border-default-800 rounded-lg max-h-64 overflow-y-auto">
                {cacheTags.length === 0 ? (
                  <div className="p-3 text-center text-xs text-default-400">
                    暂无缓存标签
                  </div>
                ) : (
                  cacheTags.map(tag => (
                    <div
                      key={tag}
                      className={`flex items-center justify-between px-3 py-2 cursor-pointer transition-colors border-b border-default-800 last:border-b-0 ${
                        selectedTag === tag
                          ? 'bg-primary/10'
                          : 'hover:bg-default-100'
                      }`}
                      onClick={() => setSelectedTag(tag)}
                    >
                      <span className="text-xs font-mono truncate">{tag}</span>
                      <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                        <Tooltip content="刷新" size="sm">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            className="min-w-6 w-6 h-6"
                            onPress={() => {
                              handleRefreshCache(tag)
                            }}
                            onMouseDown={(e) => e.stopPropagation()}
                          >
                            <RotateCw size={12} />
                          </Button>
                        </Tooltip>
                        <Tooltip content="删除" size="sm">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            color="danger"
                            className="min-w-6 w-6 h-6"
                            onPress={() => {
                              handleDeleteCache(tag)
                            }}
                            onMouseDown={(e) => e.stopPropagation()}
                          >
                            <Trash2 size={12} />
                          </Button>
                        </Tooltip>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="text-xs text-default-400 mb-2 flex items-center gap-2">
                <span>缓存数据 {selectedTag ? `- ${selectedTag}` : ''}</span>
                {cacheData && (
                  <span className="text-xs text-default-500 font-mono">
                    版本: {cacheData.version}
                  </span>
                )}
              </div>
              {!selectedTag ? (
                <div className="border border-default-800 rounded-lg p-6 text-center text-xs text-default-400">
                  请选择左侧标签查看缓存数据
                </div>
              ) : isLoadingData ? (
                <div className="border border-default-800 rounded-lg p-6 text-center">
                  <StatusState type="loading" scene="admin" />
                </div>
              ) : !cacheData || cacheData.data.length === 0 ? (
                <div className="border border-default-800 rounded-lg p-6 text-center text-xs text-default-400">
                  暂无缓存数据
                </div>
              ) : (
                <div className="border border-default-800 rounded-lg max-h-64 overflow-y-auto">
                  <Table
                    aria-label="缓存数据列表"
                    classNames={{
                      wrapper: 'p-0',
                      thead: '[&>tr]:first:shadow-none',
                    }}
                  >
                    <TableHeader>
                      <TableColumn key="dictLabel">标签</TableColumn>
                      <TableColumn key="dictValue">值</TableColumn>
                      <TableColumn key="dictSort">排序</TableColumn>
                      <TableColumn key="listClass">样式</TableColumn>
                      <TableColumn key="isDefault">默认</TableColumn>
                    </TableHeader>
                    <TableBody
                      items={cacheData.data.map(d => ({ ...d, key: String(d.id) }))}
                    >
                      {(item) => (
                        <TableRow key={item.key}>
                          <TableCell>
                            <span className="text-xs">{item.dictLabel}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs font-mono">{item.dictValue}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs">{item.dictSort}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs">{item.listClass || '-'}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs">{item.isDefault ? '是' : '否'}</span>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose}>
            关闭
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

interface DictTypeEditModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  dictTypeData: SysDictType | null
  mode: 'create' | 'edit'
  onSuccess: () => void
}

function DictTypeEditModal({ isOpen, onOpenChange, dictTypeData, mode, onSuccess }: DictTypeEditModalProps) {
  const [formData, setFormData] = useState<SysDictTypeCreateInput & { id?: string }>({
    dictName: '',
    dictType: '',
    status: '0',
    remark: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && dictTypeData) {
        setFormData({
          id: dictTypeData.id,
          dictName: dictTypeData.dictName,
          dictType: dictTypeData.dictType,
          status: dictTypeData.status,
          remark: dictTypeData.remark ?? ''
        })
      } else {
        setFormData({
          dictName: '',
          dictType: '',
          status: '0',
          remark: ''
        })
      }
    }
  }, [mode, dictTypeData, isOpen])

  const handleFieldChange = useCallback(<K extends keyof SysDictTypeCreateInput>(key: K, value: SysDictTypeCreateInput[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!formData.dictName.trim()) {
      toast.warning('请输入字典名称')
      return
    }
    if (!formData.dictType.trim()) {
      toast.warning('请输入字典编码')
      return
    }

    setIsSubmitting(true)
    try {
      if (mode === 'edit' && formData.id) {
        const updateData: SysDictTypeUpdateInput = {
          id: formData.id,
          dictName: formData.dictName,
          status: formData.status,
          remark: formData.remark || undefined
        }
        await updateDictType(updateData)
        toast.success('字典类型修改成功')
      } else {
        const createData: SysDictTypeCreateInput = {
          dictName: formData.dictName,
          dictType: formData.dictType,
          status: formData.status,
          remark: formData.remark || undefined
        }
        await createDictType(createData)
        toast.success('字典类型创建成功')
      }
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : '操作失败，请稍后重试'
      toast.error(message)
      console.error('字典类型操作失败：', error)
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
          {mode === 'create' ? '新增字典类型' : '编辑字典类型'}
        </ModalHeader>
        <ModalBody className="gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="字典名称"
              placeholder="请输入字典名称"
              isRequired
              value={formData.dictName}
              onValueChange={v => handleFieldChange('dictName', v)}
            />
            <Input
              label="字典编码"
              placeholder="请输入字典编码"
              isRequired
              isDisabled={mode === 'edit'}
              value={formData.dictType}
              onValueChange={v => handleFieldChange('dictType', v)}
              description={mode === 'edit' ? '字典编码不可修改' : '建议使用小写字母和下划线'}
            />
            <DictSelect
              label="状态"
              placeholder="请选择状态"
              dictType={DICT_COMMON_STATUS}
              selectedKeys={[formData.status as string]}
              onSelectionChange={keys => {
                const value = Array.from(keys)[0] as DictStatus
                handleFieldChange('status', value)
              }}
            />
            <div className="hidden md:block" />
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

interface DictDataEditModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  dictData: SysDictData | null
  dictType: string
  mode: 'create' | 'edit'
  onSuccess: () => void
}

function DictDataEditModal({ isOpen, onOpenChange, dictData, dictType, mode, onSuccess }: DictDataEditModalProps) {
  const [formData, setFormData] = useState<SysDictDataCreateInput & { id?: string }>({
    dictType: dictType,
    dictLabel: '',
    dictValue: '',
    dictSort: 0,
    status: '0',
    remark: '',
    cssClass: '',
    listClass: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && dictData) {
        setFormData({
          id: dictData.id,
          dictType: dictData.dictType,
          dictLabel: dictData.dictLabel,
          dictValue: dictData.dictValue,
          dictSort: dictData.dictSort,
          status: dictData.status,
          remark: dictData.remark ?? '',
          cssClass: dictData.cssClass ?? '',
          listClass: dictData.listClass ?? ''
        })
      } else {
        setFormData({
          dictType: dictType,
          dictLabel: '',
          dictValue: '',
          dictSort: 0,
          status: '0',
          remark: '',
          cssClass: '',
          listClass: ''
        })
      }
    }
  }, [mode, dictData, dictType, isOpen])

  const handleFieldChange = useCallback(<K extends keyof SysDictDataCreateInput>(key: K, value: SysDictDataCreateInput[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!formData.dictLabel.trim()) {
      toast.warning('请输入字典标签')
      return
    }
    if (!formData.dictValue.trim()) {
      toast.warning('请输入字典值')
      return
    }

    setIsSubmitting(true)
    try {
      if (mode === 'edit' && formData.id) {
        const updateData: SysDictDataUpdateInput = {
          id: formData.id,
          dictLabel: formData.dictLabel,
          dictValue: formData.dictValue,
          dictSort: formData.dictSort,
          status: formData.status,
          remark: formData.remark || undefined,
          cssClass: formData.cssClass || undefined,
          listClass: formData.listClass || undefined
        }
        await updateDictData(updateData)
        toast.success('字典数据修改成功')
      } else {
        const createData: SysDictDataCreateInput = {
          dictType: formData.dictType,
          dictLabel: formData.dictLabel,
          dictValue: formData.dictValue,
          dictSort: formData.dictSort,
          status: formData.status,
          remark: formData.remark || undefined,
          cssClass: formData.cssClass || undefined,
          listClass: formData.listClass || undefined
        }
        await createDictData(createData)
        toast.success('字典数据创建成功')
      }
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : '操作失败，请稍后重试'
      toast.error(message)
      console.error('字典数据操作失败：', error)
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
          {mode === 'create' ? '新增字典数据' : '编辑字典数据'}
        </ModalHeader>
        <ModalBody className="gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="字典类型"
              placeholder="字典类型"
              value={formData.dictType}
              isDisabled
            />
            <Input
              label="字典标签"
              placeholder="请输入字典标签（显示值）"
              isRequired
              value={formData.dictLabel}
              onValueChange={v => handleFieldChange('dictLabel', v)}
            />
            <Input
              label="字典值"
              placeholder="请输入字典值（实际值）"
              isRequired
              value={formData.dictValue}
              onValueChange={v => handleFieldChange('dictValue', v)}
            />
            <Input
              label="排序"
              type="number"
              placeholder="请输入排序号"
              value={(formData.dictSort ?? 0).toString()}
              onValueChange={v => handleFieldChange('dictSort', Number(v) || 0)}
            />
            <DictSelect
              label="状态"
              placeholder="请选择状态"
              dictType="sys_common_status"
              selectedKeys={[formData.status as string]}
              onSelectionChange={keys => {
                const value = Array.from(keys)[0] as DictStatus
                handleFieldChange('status', value)
              }}
            />
            <Input
              label="样式类"
              placeholder="CSS样式类"
              value={formData.cssClass}
              onValueChange={v => handleFieldChange('cssClass', v)}
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

export default function SystemDictionary() {
  // ===== 3. 状态控制逻辑区域 =====

  const [dictTypeList, setDictTypeList] = useState<SysDictType[]>([])
  const [dictDataList, setDictDataList] = useState<SysDictData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTypeKeys, setSelectedTypeKeys] = useState<Set<string>>(new Set())
  const [selectedDataKeys, setSelectedDataKeys] = useState<Set<string>>(new Set())
  const [queryParams, setQueryParams] = useState<SysDictTypeQueryParams>({})
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [selectedDictType, setSelectedDictType] = useState<SysDictType | null>(null)

  const typeEditModal = useDisclosure()
  const [typeEditMode, setTypeEditMode] = useState<'create' | 'edit'>('create')
  const [editingType, setEditingType] = useState<SysDictType | null>(null)

  const dataEditModal = useDisclosure()
  const [dataEditMode, setDataEditMode] = useState<'create' | 'edit'>('create')
  const [editingData, setEditingData] = useState<SysDictData | null>(null)

  const [cachePanelOpen, setCachePanelOpen] = useState(false)

  const [searchKeyword, setSearchKeyword] = useState('')

  // ===== 6. 错误处理函数区域 =====

  const fetchDictTypeList = useCallback(async () => {
    setIsLoading(true)
    try {
      const params: SysDictTypeQueryParams = {
        ...queryParams,
        pageNum: page,
        pageSize
      }
      const data: SysDictTypePageData = await getDictTypeList(params)
      if (data && data.list) {
        setDictTypeList(data.list)
        setTotal(parseInt(data.total || '0', 10))
        setTotalPages(parseInt(data.totalPages || '0', 10))
      } else {
        setDictTypeList([])
        setTotal(0)
        setTotalPages(0)
      }
    } catch (error) {
      console.error('获取字典类型列表失败：', error)
      toast.error('获取字典类型列表失败')
      setDictTypeList([])
      setTotal(0)
      setTotalPages(0)
    } finally {
      setIsLoading(false)
    }
  }, [queryParams, page, pageSize])

  const fetchDictDataList = useCallback(async (dictType: string) => {
    if (!dictType) {
      setDictDataList([])
      return
    }
    try {
      const params: SysDictDataQueryParams = {
        dictType
      }
      const data: SysDictDataPageData = await getDictDataList(params)
      if (data && data.list) {
        setDictDataList(data.list)
      } else {
        setDictDataList([])
      }
    } catch (error) {
      console.error('获取字典数据列表失败：', error)
      toast.error('获取字典数据列表失败')
      setDictDataList([])
    }
  }, [])

  const handleDeleteDictType = useCallback(async (ids: string[]) => {
    try {
      await deleteDictType(ids.join(','))
      toast.success('删除成功')
      fetchDictTypeList()
      setSelectedTypeKeys(new Set())
      if (selectedDictType && ids.includes(selectedDictType.id)) {
        setSelectedDictType(null)
        setDictDataList([])
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '删除失败'
      toast.error(message)
      console.error('删除字典类型失败：', error)
    }
  }, [fetchDictTypeList, selectedDictType])

  const handleDeleteDictData = useCallback(async (ids: string[]) => {
    if (!selectedDictType) return
    try {
      await deleteDictData(ids.join(','))
      toast.success('删除成功')
      fetchDictDataList(selectedDictType.dictType)
      setSelectedDataKeys(new Set())
    } catch (error) {
      const message = error instanceof Error ? error.message : '删除失败'
      toast.error(message)
      console.error('删除字典数据失败：', error)
    }
  }, [selectedDictType, fetchDictDataList])

  // ===== 9. 页面初始化与事件绑定 =====

  useEffect(() => {
    fetchDictTypeList()
  }, [fetchDictTypeList])

  useEffect(() => {
    if (selectedDictType) {
      fetchDictDataList(selectedDictType.dictType)
    } else {
      setDictDataList([])
    }
  }, [selectedDictType, fetchDictDataList])

  const handleCreateDictType = useCallback(() => {
    setTypeEditMode('create')
    setEditingType(null)
    typeEditModal.onOpen()
  }, [typeEditModal])

  const handleEditDictType = useCallback((dictType: SysDictType) => {
    setTypeEditMode('edit')
    setEditingType(dictType)
    typeEditModal.onOpen()
  }, [typeEditModal])

  const handleCreateDictData = useCallback(() => {
    if (!selectedDictType) {
      toast.warning('请先选择一个字典类型')
      return
    }
    setDataEditMode('create')
    setEditingData(null)
    dataEditModal.onOpen()
  }, [selectedDictType, dataEditModal])

  const handleEditDictData = useCallback((dictData: SysDictData) => {
    setDataEditMode('edit')
    setEditingData(dictData)
    dataEditModal.onOpen()
  }, [dataEditModal])

  const handleBatchDeleteType = useCallback(() => {
    if (selectedTypeKeys.size === 0) {
      toast.warning('请选择要删除的字典类型')
      return
    }
    handleDeleteDictType(Array.from(selectedTypeKeys))
  }, [selectedTypeKeys, handleDeleteDictType])

  const handleSearch = useCallback(() => {
    setQueryParams(prev => ({
      ...prev,
      dictName: searchKeyword.trim() || undefined,
      dictType: undefined
    }))
    setPage(1)
  }, [searchKeyword])

  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }, [handleSearch])

  const handleQueryChange = useCallback(<K extends keyof SysDictTypeQueryParams>(key: K, value: SysDictTypeQueryParams[K]) => {
    setQueryParams(prev => ({ ...prev, [key]: value }))
    setPage(1)
  }, [])

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

  const handleTypeSelect = useCallback((dictType: SysDictType) => {
    setSelectedDictType(prev => prev?.id === dictType.id ? null : dictType)
  }, [])

  const handleTypeStatusChange = useCallback(async (id: string, status: DictStatus) => {
    setDictTypeList(prev => prev.map(t => t.id === id ? { ...t, status } : t))
    try {
      await updateDictType({ id, status })
      toast.success('状态更新成功')
    } catch (error) {
      const message = error instanceof Error ? error.message : '状态更新失败'
      toast.error(message)
      console.error('更新字典类型状态失败：', error)
      fetchDictTypeList()
    }
  }, [fetchDictTypeList])

  const handleDataStatusChange = useCallback(async (id: string, status: DictStatus) => {
    setDictDataList(prev => prev.map(d => d.id === id ? { ...d, status } : d))
    try {
      await updateDictData({ id, status })
      toast.success('状态更新成功')
    } catch (error) {
      const message = error instanceof Error ? error.message : '状态更新失败'
      toast.error(message)
      console.error('更新字典数据状态失败：', error)
      if (selectedDictType) {
        fetchDictDataList(selectedDictType.dictType)
      }
    }
  }, [fetchDictDataList, selectedDictType])

  // ===== 8. UI渲染逻辑区域 =====

  return (
    <div className="flex flex-col gap-4 p-4 md:p-0 h-full">
      <Card className="w-full flex-1 overflow-hidden flex flex-col">
        <CardBody className="p-0 overflow-visible flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-default-800">
            <div className="flex items-center gap-2">
              <BookOpen size={18} className="text-primary" />
              <span className="font-semibold text-sm">字典类型</span>
            </div>
            <div className="flex items-center gap-1">
              <Tooltip content="缓存管理" size="sm">
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onPress={() => setCachePanelOpen(true)}
                >
                  <Database size={16} />
                </Button>
              </Tooltip>
              <Tooltip content="新增字典类型" size="sm">
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onPress={handleCreateDictType}
                >
                  <Plus size={16} />
                </Button>
              </Tooltip>
              <Tooltip content="刷新" size="sm">
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onPress={fetchDictTypeList}
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
                placeholder="搜索字典名称/编码"
                className="w-full sm:w-56"
                value={searchKeyword}
                onValueChange={setSearchKeyword}
                onKeyDown={handleSearchKeyDown}
                startContent={<Search size={14} className="text-default-400" />}
                isClearable
                onClear={() => {
                  setSearchKeyword('')
                  setQueryParams(prev => ({ ...prev, dictName: undefined }))
                }}
              />
              <DictSelect
                size="sm"
                placeholder="状态"
                className="w-full sm:w-24"
                aria-label="字典状态筛选"
                dictType="sys_common_status"
                selectedKeys={queryParams.status ? [queryParams.status] as const : []}
                onSelectionChange={keys => {
                  const value = Array.from(keys)[0] as DictStatus | undefined
                  handleQueryChange('status', value)
                }}
              />
              <Button size="sm" variant="flat" onPress={handleResetQuery}>
                重置
              </Button>
              <div className="hidden sm:flex-1" />
              {selectedTypeKeys.size > 0 && (
                <Button
                  size="sm"
                  color="danger"
                  variant="flat"
                  startContent={<Trash2 size={14} />}
                  onPress={handleBatchDeleteType}
                >
                  批量删除({selectedTypeKeys.size})
                </Button>
              )}
            </div>
          </div>

          <div className="p-3 max-h-72 overflow-auto">
            {isLoading ? (
              <StatusState type="loading" scene="admin" />
            ) : (
              <Table
                aria-label="字典类型列表"
                selectionMode="multiple"
                selectedKeys={selectedTypeKeys}
                onSelectionChange={keys => setSelectedTypeKeys(keys as Set<string>)}
                onRowAction={(key) => {
                  const item = dictTypeList.find(t => t.id === String(key))
                  if (item) handleTypeSelect(item)
                }}
                classNames={{
                  wrapper: 'p-0',
                  thead: '[&>tr]:first:shadow-none',
                }}
              >
                <TableHeader>
                  <TableColumn key="dictName">字典名称</TableColumn>
                  <TableColumn key="dictType">字典编码</TableColumn>
                  <TableColumn key="status">状态</TableColumn>
                  <TableColumn key="actions">操作</TableColumn>
                </TableHeader>
                <TableBody
                  items={dictTypeList.map(item => ({ ...item, key: `type-${item.id}` }))}
                  emptyContent={<StatusState type="empty" scene="admin" />}
                >
                  {(item) => (
                    <TableRow
                      key={item.id}
                      className={`cursor-pointer transition-colors ${
                        selectedDictType?.id === item.id
                          ? 'bg-primary/10'
                          : 'hover:bg-default-100'
                      }`}
                    >
                      <TableCell>
                        <span className="font-medium text-sm">{item.dictName}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-mono">{item.dictType}</span>
                      </TableCell>
                      <TableCell>
                        <Switch
                          size="sm"
                          color="primary"
                          isSelected={String(item.status) === '0'}
                          onValueChange={(isSelected) => handleTypeStatusChange(item.id, isSelected ? '0' : '1')}
                          aria-label={getDictLabel(DICT_COMMON_STATUS, item.status)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Tooltip content="编辑" size="sm">
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              onPress={() => handleEditDictType(item)}
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
                              onPress={() => handleDeleteDictType([item.id])}
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

      <Card className="w-full flex-1 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-default-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-primary" />
            <span className="font-semibold text-sm">字典数据</span>
            {selectedDictType && (
              <span className="text-sm text-default-400">- {selectedDictType.dictName}</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Tooltip content="新增字典数据" size="sm">
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={handleCreateDictData}
                isDisabled={!selectedDictType}
              >
                <Plus size={16} />
              </Button>
            </Tooltip>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-auto p-3">
          {!selectedDictType ? (
            <div className="flex items-center justify-center h-full">
              <StatusState type="empty" scene="admin" description="请先选择一个字典类型" />
            </div>
          ) : (
            <Table
              aria-label="字典数据列表"
              selectionMode="multiple"
              selectedKeys={selectedDataKeys}
              onSelectionChange={keys => setSelectedDataKeys(keys as Set<string>)}
              classNames={{
                wrapper: 'p-0',
                thead: '[&>tr]:first:shadow-none',
              }}
            >
              <TableHeader>
                <TableColumn key="dictLabel">字典标签</TableColumn>
                <TableColumn key="dictValue">字典值</TableColumn>
                <TableColumn key="dictSort" className="hidden md:table-cell">排序</TableColumn>
                <TableColumn key="status">状态</TableColumn>
                <TableColumn key="remark" className="hidden lg:table-cell">备注</TableColumn>
                <TableColumn key="actions">操作</TableColumn>
              </TableHeader>
              <TableBody
                items={dictDataList.map(d => ({ ...d, key: `data-${d.id}` }))}
                emptyContent={
                  <div className="text-center py-4 text-sm text-default-400">
                    暂无字典数据
                  </div>
                }
              >
                {(dataItem) => (
                  <TableRow key={dataItem.id}>
                    <TableCell>
                      <span className="text-sm">{dataItem.dictLabel}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-mono">{dataItem.dictValue}</span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="text-sm">{dataItem.dictSort}</span>
                    </TableCell>
                    <TableCell>
                      <Switch
                        size="sm"
                        color="primary"
                        isSelected={String(dataItem.status) === '0'}
                        onValueChange={(isSelected) => handleDataStatusChange(dataItem.id, isSelected ? '0' : '1')}
                        aria-label={getDictLabel(DICT_COMMON_STATUS, dataItem.status)}
                      />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="text-sm">{dataItem.remark || '-'}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Tooltip content="编辑" size="sm">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            onPress={() => handleEditDictData(dataItem)}
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
                            onPress={() => handleDeleteDictData([dataItem.id])}
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
      </Card>

      <DictTypeEditModal
        isOpen={typeEditModal.isOpen}
        onOpenChange={typeEditModal.onOpenChange}
        dictTypeData={editingType}
        mode={typeEditMode}
        onSuccess={fetchDictTypeList}
      />

      <DictDataEditModal
        isOpen={dataEditModal.isOpen}
        onOpenChange={dataEditModal.onOpenChange}
        dictData={editingData}
        dictType={selectedDictType?.dictType || ''}
        mode={dataEditMode}
        onSuccess={() => selectedDictType && fetchDictDataList(selectedDictType.dictType)}
      />

      <DictCachePanel
        isOpen={cachePanelOpen}
        onClose={() => setCachePanelOpen(false)}
      />
    </div>
  )
}