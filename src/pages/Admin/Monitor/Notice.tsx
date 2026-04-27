/**
 * 通知公告管理页面
 *
 * 工具栏 + 表格布局：
 * - 顶部工具栏：图标标题、新增、3 个推送按钮（B站/邮箱/QQ群）、刷新
 * - 搜索栏：标题搜索、状态筛选、重置、批量删除
 * - 中部表格：公告列表，支持多选
 * - 弹窗：新增/编辑公告
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
  Textarea,
  Chip,
} from '@heroui/react'

import {
  Trash2,
  Plus,
  Pencil,
  Search,
  RefreshCw,
  Bell,
  Mail,
  MessageCircle,
  Send,
} from 'lucide-react'

import { toast } from '@/utils/toast'
import { formatDateTime } from '@/utils/format'
import { StatusState } from '@/components/ui/StatusState'

import {
  getNoticeList,
  createNotice,
  updateNotice,
  deleteNotice,
} from '@/api/admin/notice'

import type {
  SysNotice,
  SysNoticeQueryParams,
  SysNoticeCreateInput,
  SysNoticeUpdateInput,
  NoticeType,
  NoticeStatus,
} from '@/types/notice.types'

import {
  NOTICE_TYPE_OPTIONS,
  NOTICE_STATUS_OPTIONS,
} from '@/types/notice.types'

// ===== 2. 常量 =====

const NOTICE_TYPE_MAP: Record<string, { label: string; color: 'primary' | 'warning' }> = {
  '1': { label: '通知', color: 'primary' },
  '2': { label: '公告', color: 'warning' },
}

// ===== 3. 子组件：编辑弹窗 =====

interface NoticeEditModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  noticeData: SysNotice | null
  mode: 'create' | 'edit'
  onSuccess: () => void
}

function NoticeEditModal({ isOpen, onOpenChange, noticeData, mode, onSuccess }: NoticeEditModalProps) {
  const [formData, setFormData] = useState<SysNoticeCreateInput & { id?: string }>({
    noticeTitle: '',
    noticeType: '1',
    content: '',
    status: '0',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && noticeData) {
        setFormData({
          id: noticeData.id,
          noticeTitle: noticeData.noticeTitle,
          noticeType: noticeData.noticeType,
          content: noticeData.content,
          status: noticeData.status,
        })
      } else {
        setFormData({
          noticeTitle: '',
          noticeType: '1',
          content: '',
          status: '0',
        })
      }
    }
  }, [mode, noticeData, isOpen])

  const handleFieldChange = useCallback(<K extends keyof SysNoticeCreateInput>(key: K, value: SysNoticeCreateInput[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!formData.noticeTitle.trim()) {
      toast.warning('请输入公告标题')
      return
    }
    if (!formData.content.trim()) {
      toast.warning('请输入公告内容')
      return
    }

    setIsSubmitting(true)
    try {
      if (mode === 'edit' && formData.id) {
        const updateData: SysNoticeUpdateInput = {
          id: formData.id,
          noticeTitle: formData.noticeTitle,
          noticeType: formData.noticeType,
          content: formData.content,
          status: formData.status,
        }
        await updateNotice(updateData)
        toast.success('公告修改成功')
      } else {
        const createData: SysNoticeCreateInput = {
          noticeTitle: formData.noticeTitle,
          noticeType: formData.noticeType,
          content: formData.content,
          status: formData.status,
        }
        await createNotice(createData)
        toast.success('公告创建成功')
      }
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : '操作失败，请稍后重试'
      toast.error(message)
      console.error('公告操作失败：', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, mode, onSuccess, onOpenChange])

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader>{mode === 'create' ? '新增公告' : '编辑公告'}</ModalHeader>
        <ModalBody className="gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="公告标题"
              placeholder="请输入公告标题"
              isRequired
              value={formData.noticeTitle}
              onValueChange={v => handleFieldChange('noticeTitle', v)}
              className="md:col-span-2"
            />
            <Select
              label="公告类型"
              placeholder="请选择公告类型"
              isRequired
              selectedKeys={[formData.noticeType]}
              onSelectionChange={keys => {
                const val = Array.from(keys)[0] as NoticeType
                if (val) handleFieldChange('noticeType', val)
              }}
            >
              {NOTICE_TYPE_OPTIONS.map(opt => (
                <SelectItem key={opt.value}>{opt.label}</SelectItem>
              ))}
            </Select>
            <Select
              label="状态"
              placeholder="请选择状态"
              selectedKeys={[formData.status || '0']}
              onSelectionChange={keys => {
                const val = Array.from(keys)[0] as NoticeStatus
                if (val) handleFieldChange('status', val)
              }}
            >
              {NOTICE_STATUS_OPTIONS.map(opt => (
                <SelectItem key={opt.value}>{opt.label}</SelectItem>
              ))}
            </Select>
            <Textarea
              label="公告内容"
              placeholder="请输入公告内容"
              isRequired
              value={formData.content}
              onValueChange={v => handleFieldChange('content', v)}
              minRows={4}
              maxRows={8}
              className="md:col-span-2"
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={() => onOpenChange(false)}>
            取消
          </Button>
          <Button color="primary" isLoading={isSubmitting} onPress={handleSubmit}>
            {mode === 'create' ? '创建' : '保存'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

// ===== 4. 主组件 =====

export default function MonitorNotice() {
  const [noticeList, setNoticeList] = useState<SysNotice[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())
  const [queryParams, setQueryParams] = useState<SysNoticeQueryParams>({})

  const editModal = useDisclosure()
  const [editMode, setEditMode] = useState<'create' | 'edit'>('create')
  const [editingNotice, setEditingNotice] = useState<SysNotice | null>(null)

  const [searchKeyword, setSearchKeyword] = useState('')

  // ===== 数据加载 =====

  const fetchNoticeList = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getNoticeList(queryParams)
      setNoticeList(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('获取公告列表失败：', error)
      toast.error('获取公告列表失败')
      setNoticeList([])
    } finally {
      setIsLoading(false)
    }
  }, [queryParams])

  useEffect(() => {
    fetchNoticeList()
  }, [fetchNoticeList])

  // ===== 操作处理 =====

  const handleCreate = useCallback(() => {
    setEditMode('create')
    setEditingNotice(null)
    editModal.onOpen()
  }, [editModal])

  const handleEdit = useCallback((notice: SysNotice) => {
    setEditMode('edit')
    setEditingNotice(notice)
    editModal.onOpen()
  }, [editModal])

  const handleDelete = useCallback(async (ids: string[]) => {
    try {
      await deleteNotice(ids.join(','))
      toast.success('删除成功')
      fetchNoticeList()
      setSelectedKeys(new Set())
    } catch (error) {
      const message = error instanceof Error ? error.message : '删除失败'
      toast.error(message)
      console.error('删除公告失败：', error)
    }
  }, [fetchNoticeList])

  const handleBatchDelete = useCallback(() => {
    if (selectedKeys.size === 0) {
      toast.warning('请选择要删除的公告')
      return
    }
    handleDelete(Array.from(selectedKeys))
  }, [selectedKeys, handleDelete])

  // ===== 推送按钮（预留） =====

  const handlePushBilibili = useCallback(() => {
    if (selectedKeys.size === 0) {
      toast.warning('请先选择要推送的公告')
      return
    }
    toast.info(`已选择 ${selectedKeys.size} 条公告，B站推送功能待接入`)
  }, [selectedKeys])

  const handlePushEmail = useCallback(() => {
    if (selectedKeys.size === 0) {
      toast.warning('请先选择要推送的公告')
      return
    }
    toast.info(`已选择 ${selectedKeys.size} 条公告，邮箱推送功能待接入`)
  }, [selectedKeys])

  const handlePushQQ = useCallback(() => {
    if (selectedKeys.size === 0) {
      toast.warning('请先选择要推送的公告')
      return
    }
    toast.info(`已选择 ${selectedKeys.size} 条公告，QQ群推送功能待接入`)
  }, [selectedKeys])

  // ===== 搜索 =====

  const handleSearch = useCallback(() => {
    setQueryParams(prev => ({
      ...prev,
      noticeTitle: searchKeyword.trim() || undefined,
    }))
  }, [searchKeyword])

  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }, [handleSearch])

  const handleStatusFilter = useCallback((keys: 'all' | Set<React.Key>) => {
    if (keys === 'all') return
    const value = Array.from(keys)[0] as NoticeStatus | undefined
    setQueryParams(prev => ({ ...prev, status: value }))
  }, [])

  const handleResetQuery = useCallback(() => {
    setQueryParams({})
    setSearchKeyword('')
  }, [])

  // ===== 渲染 =====

  const hasSelection = selectedKeys.size > 0

  return (
    <div className="flex flex-col gap-4 p-4 md:p-0 h-full">
      <Card className="h-full">
        <CardBody className="p-0 flex flex-col overflow-hidden">
          {/* 标题栏 */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-divider">
            <div className="flex items-center gap-2">
              <Bell size={18} className="text-primary" />
              <span className="font-semibold text-sm">通知公告</span>
            </div>
            <div className="flex items-center gap-1">
              <Tooltip content="推送B站" size="sm">
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  color={hasSelection ? 'primary' : 'default'}
                  onPress={handlePushBilibili}
                >
                  <Send size={16} />
                </Button>
              </Tooltip>
              <Tooltip content="推送邮箱" size="sm">
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  color={hasSelection ? 'primary' : 'default'}
                  onPress={handlePushEmail}
                >
                  <Mail size={16} />
                </Button>
              </Tooltip>
              <Tooltip content="推送QQ群" size="sm">
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  color={hasSelection ? 'primary' : 'default'}
                  onPress={handlePushQQ}
                >
                  <MessageCircle size={16} />
                </Button>
              </Tooltip>
              <div className="w-px h-4 bg-divider mx-1" />
              <Tooltip content="新增公告" size="sm">
                <Button isIconOnly size="sm" variant="light" onPress={handleCreate}>
                  <Plus size={16} />
                </Button>
              </Tooltip>
              <Tooltip content="刷新" size="sm">
                <Button isIconOnly size="sm" variant="light" onPress={fetchNoticeList} isLoading={isLoading}>
                  <RefreshCw size={16} />
                </Button>
              </Tooltip>
            </div>
          </div>

          {/* 搜索栏 */}
          <div className="px-4 py-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Input
                size="sm"
                placeholder="搜索公告标题"
                className="w-full sm:w-56"
                value={searchKeyword}
                onValueChange={setSearchKeyword}
                onKeyDown={handleSearchKeyDown}
                startContent={<Search size={14} className="text-default-400" />}
                isClearable
                onClear={() => {
                  setSearchKeyword('')
                  setQueryParams(prev => ({ ...prev, noticeTitle: undefined }))
                }}
              />
              <Select
                size="sm"
                aria-label="按状态筛选"
                placeholder="状态"
                className="w-24"
                selectedKeys={queryParams.status ? [queryParams.status] : []}
                onSelectionChange={handleStatusFilter}
              >
                {NOTICE_STATUS_OPTIONS.map(opt => (
                  <SelectItem key={opt.value}>{opt.label}</SelectItem>
                ))}
              </Select>
              <Button size="sm" variant="flat" onPress={handleResetQuery}>
                重置
              </Button>
              <div className="hidden sm:flex-1" />
              {hasSelection && (
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

          {/* 表格 */}
          <div className="flex-1 p-3">
            {isLoading ? (
              <StatusState type="loading" scene="admin" />
            ) : (
              <Table
                aria-label="公告列表"
                selectionMode="multiple"
                selectedKeys={selectedKeys}
                onSelectionChange={keys => setSelectedKeys(keys as Set<string>)}
                classNames={{
                  wrapper: 'p-0',
                  thead: '[&>tr]:first:shadow-none',
                }}
              >
                <TableHeader>
                  <TableColumn key="noticeTitle">公告标题</TableColumn>
                  <TableColumn key="noticeType">公告类型</TableColumn>
                  <TableColumn key="status">状态</TableColumn>
                  <TableColumn key="createBy" className="hidden lg:table-cell">创建者</TableColumn>
                  <TableColumn key="createTime" className="hidden lg:table-cell">创建时间</TableColumn>
                  <TableColumn key="actions">操作</TableColumn>
                </TableHeader>
                <TableBody
                  items={noticeList.map(item => ({ ...item, key: item.id }))}
                  emptyContent={<StatusState type="empty" scene="admin" />}
                >
                  {(item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <span className="font-medium text-sm">{item.noticeTitle}</span>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="sm"
                          variant="flat"
                          color={NOTICE_TYPE_MAP[item.noticeType]?.color ?? 'default'}
                        >
                          {NOTICE_TYPE_MAP[item.noticeType]?.label ?? '未知'}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="sm"
                          variant="dot"
                          color={item.status === '0' ? 'success' : 'danger'}
                        >
                          {item.status === '0' ? '正常' : '关闭'}
                        </Chip>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span className="text-sm">{item.createBy || '-'}</span>
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
                              onPress={() => handleEdit(item)}
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
                              onPress={() => handleDelete([item.id])}
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
        </CardBody>
      </Card>

      <NoticeEditModal
        isOpen={editModal.isOpen}
        onOpenChange={editModal.onOpenChange}
        noticeData={editingNotice}
        mode={editMode}
        onSuccess={fetchNoticeList}
      />
    </div>
  )
}
