/**
 * 后台-文档列表页面
 *
 * 工具栏 + 表格布局：
 * - 顶部工具栏：搜索框（文档标题）、状态筛选、审核状态筛选、分类筛选、新增按钮、刷新按钮
 * - 中部表格：文档列表，支持多选批量操作
 * - 底部：后端分页控件
 * - 弹窗：编辑文档（复用 DocMetaFormModal）、批量删除确认、批量状态更新
 *
 * 核心交互：
 * - 搜索/筛选 → 调用后端分页接口刷新列表
 * - 编辑信息 → 复用元信息弹窗（DocMetaFormModal）
 * - 编辑内容 → 跳转编辑器页 /admin/document/editor/:id
 * - 新增文档 → 跳转入口页 /admin/document/create-edit
 * - 批量操作 → 批量删除、批量上架/下架
 */

// React
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

// HeroUI
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
  Pagination,
  Avatar,
  Switch,
  Image,
} from '@heroui/react'

// 图标
import {
  Plus,
  Search,
  Trash2,
  Pencil,
  RefreshCw,
  FileText,
  Eye,
  ThumbsUp,
  MessageCircle,
  MessageSquare,
} from 'lucide-react'

// 工具
import { toast } from '@/utils/toast'
import { formatDateTime } from '@/utils/format'

// 通用组件
import { StatusState } from '@/components/ui/StatusState'

// 复用组件
import { DocMetaFormModal } from './components/DocMetaFormModal'
import { DocCommentModal } from './components/DocCommentModal'

// 常量
import { PAGINATION } from '@/constants'

// 字典组件
import { DictSelect } from '@/components/ui/dict/DictSelect'
import { getDictLabel, getDictColor } from '@/stores/dict'
import { DICT_NOTE_STATUS, DICT_AUDIT_STATUS } from '@/constants/dict'

// API
import {
  getDocNotePage,
  deleteDocNote,
  batchUpdateDocNoteStatus,
  toggleDocNotePinned,
  toggleDocNoteRecommended,
  getNoteMeta,
} from '@/api/admin/document'

// 类型
import type {
  DocNote,
  DocNoteQueryParams,
  DocNoteStatus,
  DocAuditStatus,
} from '@/types/document.types'

// ===== 3. 常量 =====

const DEFAULT_PAGE_SIZE = PAGINATION.DEFAULT_PAGE_SIZE as number
const PAGE_SIZE_OPTIONS = [...PAGINATION.PAGE_SIZE_OPTIONS] as number[]

// ===== 4. 数据处理函数区域 =====

/**
 * 获取审核状态的显示标签
 */
function getAuditStatusLabel(auditStatus: DocAuditStatus): string {
  return getDictLabel(DICT_AUDIT_STATUS, auditStatus)
}

/**
 * 获取审核状态对应的 Chip 颜色
 */
function getAuditStatusColor(auditStatus: DocAuditStatus): 'warning' | 'success' | 'danger' {
  return getDictColor(DICT_AUDIT_STATUS, auditStatus, 'warning') as 'warning' | 'success' | 'danger'
}

// ===== 子组件 =====

/**
 * 批量删除确认弹窗
 */
interface BatchDeleteModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  ids: string[]
  onConfirm: () => void
}

function BatchDeleteModal({ isOpen, onOpenChange, ids, onConfirm }: BatchDeleteModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleConfirm = useCallback(async () => {
    if (ids.length === 0) return

    setIsDeleting(true)
    try {
      await deleteDocNote(ids.join(','))
      toast.success(`成功删除 ${ids.length} 个文档`)
      onConfirm()
      onOpenChange(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : '删除失败'
      toast.error(message)
      console.error('批量删除失败：', error)
    } finally {
      setIsDeleting(false)
    }
  }, [ids, onConfirm, onOpenChange])

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="sm">
      <ModalContent>
        <ModalHeader>
          <div className="flex items-center gap-2 text-danger">
            <Trash2 size={18} />
            <span>确认删除</span>
          </div>
        </ModalHeader>
        <ModalBody>
          <p className="text-sm text-default-600">
            确定要删除选中的 <span className="font-bold text-danger">{ids.length}</span> 个文档吗？
          </p>
          <p className="text-xs text-default-400 mt-1">此操作不可恢复，请谨慎操作。</p>
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={() => onOpenChange(false)}>
            取消
          </Button>
          <Button color="danger" isLoading={isDeleting} onPress={handleConfirm}>
            确认删除
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

/**
 * 批量状态更新弹窗
 */
interface BatchStatusModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  ids: string[]
  onConfirm: () => void
}

function BatchStatusModal({ isOpen, onOpenChange, ids, onConfirm }: BatchStatusModalProps) {
  const [targetStatus, setTargetStatus] = useState<'published' | 'offline'>('published')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleConfirm = useCallback(async () => {
    if (ids.length === 0) return

    setIsSubmitting(true)
    try {
      await batchUpdateDocNoteStatus({ ids, status: targetStatus })
      toast.success('状态更新成功')
      onConfirm()
      onOpenChange(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : '状态更新失败'
      toast.error(message)
      console.error('批量状态更新失败：', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [ids, targetStatus, onConfirm, onOpenChange])

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="sm">
      <ModalContent>
        <ModalHeader>批量更新状态</ModalHeader>
        <ModalBody>
          <p className="text-sm text-default-600 mb-3">
            选中文档数量：<span className="font-bold">{ids.length}</span>
          </p>
          <Select
            label="目标状态"
            selectedKeys={[targetStatus]}
            onSelectionChange={(keys) => {
              const value = Array.from(keys)[0] as 'published' | 'offline'
              setTargetStatus(value)
            }}
          >
            <SelectItem key="published" textValue="发布">
              发布
            </SelectItem>
            <SelectItem key="offline" textValue="下架">
              下架
            </SelectItem>
          </Select>
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={() => onOpenChange(false)}>
            取消
          </Button>
          <Button color="primary" isLoading={isSubmitting} onPress={handleConfirm}>
            确认更新
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

// ===== 主组件 =====

/**
 * 文档列表主页面
 */
export default function DocumentList() {
  // ===== 路由 =====
  const navigate = useNavigate()

  // ===== 状态 =====
  const [docList, setDocList] = useState<DocNote[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())
  const [queryParams, setQueryParams] = useState<DocNoteQueryParams>({})
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const editModal = useDisclosure()
  const [editingDoc, setEditingDoc] = useState<DocNote | null>(null)

  const deleteModal = useDisclosure()
  const statusModal = useDisclosure()
  const commentModal = useDisclosure()

  const [searchKeyword, setSearchKeyword] = useState('')
  const [commentDoc, setCommentDoc] = useState<DocNote | null>(null)

  // ===== 数据请求 =====

  /**
   * 获取文档列表
   */
  const fetchDocList = useCallback(async () => {
    setIsLoading(true)
    try {
      const params: DocNoteQueryParams = {
        ...queryParams,
        pageNum: page,
        pageSize,
      }
      const data = await getDocNotePage(params)

      if (data && data.list) {
        setDocList(data.list)
        setTotal(data.total || 0)
        const calculatedTotalPages = Math.ceil((data.total || 0) / pageSize)
        setTotalPages(calculatedTotalPages > 0 ? calculatedTotalPages : 1)
      } else {
        setDocList([])
        setTotal(0)
        setTotalPages(0)
      }
    } catch (error) {
      console.error('获取文档列表失败：', error)
      toast.error('获取文档列表失败')
      setDocList([])
      setTotal(0)
      setTotalPages(0)
    } finally {
      setIsLoading(false)
    }
  }, [queryParams, page, pageSize])

  /**
   * 删除文档（支持批量）
   */
  const handleDeleteDoc = useCallback(
    async (ids: string[]) => {
      try {
        await deleteDocNote(ids.join(','))
        toast.success('删除成功')
        fetchDocList()
        setSelectedKeys(new Set())
      } catch (error) {
        const message = error instanceof Error ? error.message : '删除失败'
        toast.error(message)
        console.error('删除文档失败：', error)
      }
    },
    [fetchDocList]
  )

  /**
   * 切换置顶状态
   */
  const handleTogglePinned = useCallback(
    async (id: string) => {
      try {
        await toggleDocNotePinned(id)
        toast.success('置顶状态切换成功')
        setDocList((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, isPinned: item.isPinned === 1 ? 0 : 1 } : item
          )
        )
      } catch (error) {
        const message = error instanceof Error ? error.message : '置顶状态切换失败'
        toast.error(message)
        console.error('切换置顶状态失败：', error)
      }
    },
    []
  )

  /**
   * 切换推荐状态
   */
  const handleToggleRecommended = useCallback(
    async (id: string) => {
      try {
        await toggleDocNoteRecommended(id)
        toast.success('推荐状态切换成功')
        setDocList((prev) =>
          prev.map((item) =>
            item.id === id
              ? { ...item, isRecommended: item.isRecommended === 1 ? 0 : 1 }
              : item
          )
        )
      } catch (error) {
        const message = error instanceof Error ? error.message : '推荐状态切换失败'
        toast.error(message)
        console.error('切换推荐状态失败：', error)
      }
    },
    []
  )

  // ===== 副作用 =====

  useEffect(() => {
    fetchDocList()
  }, [fetchDocList])

  // ===== 事件 =====

  /**
   * 打开编辑信息弹窗（先查询元信息）
   */
  const handleEditDoc = useCallback(
    async (doc: DocNote) => {
      try {
        const meta = await getNoteMeta(doc.id)
        setEditingDoc(meta)
        editModal.onOpen()
      } catch (error) {
        const message = error instanceof Error ? error.message : '获取文档元信息失败'
        toast.error(message)
        console.error('获取文档元信息失败：', error)
      }
    },
    [editModal]
  )

  /**
   * 跳转编辑器页面（编辑正文）
   */
  const handleEditContent = useCallback(
    (doc: DocNote) => {
      navigate(`/admin/document/editor/${doc.id}`)
    },
    [navigate]
  )

  /**
   * 打开评论管理弹窗
   */
  const handleOpenCommentModal = useCallback(
    (doc: DocNote) => {
      setCommentDoc(doc)
      commentModal.onOpen()
    },
    [commentModal]
  )

  /**
   * 跳转新增入口
   */
  const handleCreateNew = useCallback(() => {
    navigate('/admin/document/create-edit')
  }, [navigate])

  /**
   * 批量删除
   */
  const handleBatchDelete = useCallback(() => {
    if (selectedKeys.size === 0) {
      toast.warning('请选择要删除的文档')
      return
    }
    deleteModal.onOpen()
  }, [selectedKeys, deleteModal])

  /**
   * 批量状态更新
   */
  const handleBatchStatus = useCallback(() => {
    if (selectedKeys.size === 0) {
      toast.warning('请选择要更新状态的文档')
      return
    }
    statusModal.onOpen()
  }, [selectedKeys, statusModal])

  const handleSearch = useCallback(() => {
    setQueryParams((prev) => ({
      ...prev,
      noteName: searchKeyword.trim() || undefined,
    }))
    setPage(1)
  }, [searchKeyword])

  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSearch()
      }
    },
    [handleSearch]
  )

  const handleQueryChange = useCallback(
    <K extends keyof DocNoteQueryParams>(key: K, value: DocNoteQueryParams[K]) => {
      setQueryParams((prev) => ({ ...prev, [key]: value }))
      setPage(1)
    },
    []
  )

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

  // ===== 渲染 =====

  return (
    <div className="flex flex-col gap-4 p-4 md:p-0 h-full">
      <Card className="h-full">
        <CardBody className="p-0 flex flex-col overflow-hidden">
          {/* 顶部标题栏 */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-default-800">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-primary" />
              <span className="font-semibold text-sm">文档管理</span>
            </div>
            <div className="flex items-center gap-1">
              <Tooltip content="新增文档" size="sm">
                <Button isIconOnly size="sm" variant="light" onPress={handleCreateNew}>
                  <Plus size={16} />
                </Button>
              </Tooltip>
              <Tooltip content="刷新" size="sm">
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onPress={fetchDocList}
                  isLoading={isLoading}
                >
                  <RefreshCw size={16} />
                </Button>
              </Tooltip>
            </div>
          </div>

          {/* 查询工具栏 */}
          <div className="px-4 py-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Input
                size="sm"
                placeholder="搜索文档标题"
                className="w-full sm:w-56"
                value={searchKeyword}
                onValueChange={setSearchKeyword}
                onKeyDown={handleSearchKeyDown}
                startContent={<Search size={14} className="text-default-400" />}
                isClearable
                onClear={() => {
                  setSearchKeyword('')
                  setQueryParams((prev) => ({ ...prev, noteName: undefined }))
                }}
              />
              <DictSelect
                size="sm"
                placeholder="文档状态"
                className="w-full sm:w-28"
                aria-label="文档状态筛选"
                dictType={DICT_NOTE_STATUS}
                selectedKeys={queryParams.status ? [String(queryParams.status)] : []}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string | undefined
                  handleQueryChange(
                    'status',
                    value ? (Number(value) as DocNoteStatus) : undefined
                  )
                }}
              />
              <DictSelect
                size="sm"
                placeholder="审核状态"
                className="w-full sm:w-28"
                aria-label="审核状态筛选"
                dictType={DICT_AUDIT_STATUS}
                selectedKeys={
                  queryParams.auditStatus !== undefined ? [String(queryParams.auditStatus)] : []
                }
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string | undefined
                  handleQueryChange(
                    'auditStatus',
                    value !== undefined ? (Number(value) as DocAuditStatus) : undefined
                  )
                }}
              />
              <Button size="sm" variant="flat" onPress={handleResetQuery}>
                重置
              </Button>
              <div className="hidden sm:flex-1" />
              {selectedKeys.size > 0 && (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    color="danger"
                    variant="flat"
                    startContent={<Trash2 size={14} />}
                    onPress={handleBatchDelete}
                  >
                    批量删除({selectedKeys.size})
                  </Button>
                  <Button size="sm" color="primary" variant="flat" onPress={handleBatchStatus}>
                    批量上架/下架
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* 文档列表表格 */}
          <div className="flex-1 p-3 overflow-auto">
            {isLoading ? (
              <StatusState type="loading" scene="admin" />
            ) : (
              <Table
                aria-label="文档列表"
                selectionMode="multiple"
                selectedKeys={selectedKeys}
                onSelectionChange={(keys) => setSelectedKeys(keys as Set<string>)}
                classNames={{
                  wrapper: 'p-0',
                  thead: '[&>tr]:first:shadow-none',
                }}
              >
                <TableHeader>
                  <TableColumn key="cover">封面</TableColumn>
                  <TableColumn key="noteName">文档标题</TableColumn>
                  <TableColumn key="author">作者</TableColumn>
                  <TableColumn key="stats">数据</TableColumn>
                  <TableColumn key="broadCode" className="hidden md:table-cell">
                    分类
                  </TableColumn>
                  <TableColumn key="noteGrade" className="hidden lg:table-cell">
                    等级
                  </TableColumn>
                  <TableColumn key="suitableUsers" className="hidden xl:table-cell">
                    适合人群
                  </TableColumn>
                  <TableColumn key="status">状态</TableColumn>
                  <TableColumn key="auditStatus" className="hidden md:table-cell">
                    审核
                  </TableColumn>
                  <TableColumn key="createTime" className="hidden xl:table-cell">
                    创建时间
                  </TableColumn>
                  <TableColumn key="publishTime" className="hidden lg:table-cell">
                    发布时间
                  </TableColumn>
                  <TableColumn key="isPinned" className="hidden md:table-cell">
                    置顶
                  </TableColumn>
                  <TableColumn key="isRecommended" className="hidden md:table-cell">
                    推荐
                  </TableColumn>
                  <TableColumn key="actions">操作</TableColumn>
                </TableHeader>
                <TableBody
                  items={docList.map((item) => ({ ...item, key: item.id }))}
                  emptyContent={<StatusState type="empty" scene="admin" />}
                >
                  {(item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {item.coverFile?.fileUrl ? (
                          <Image
                            src={item.coverFile.fileUrl}
                            alt={item.noteName}
                            className="w-12 h-12 object-cover rounded"
                            classNames={{ wrapper: 'w-12 h-12' }}
                            fallbackSrc="https://via.placeholder.com/48?text=No+Cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-default-100 rounded flex items-center justify-center">
                            <FileText size={20} className="text-default-400" />
                          </div>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm max-w-32 truncate">
                            {item.noteName}
                          </span>
                          {item.noteTags && (
                            <span className="text-xs text-default-400 truncate max-w-32">
                              {item.noteTags}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar
                            src={item.author?.avatar}
                            name={item.author?.name}
                            size="sm"
                            className="flex-shrink-0"
                          />
                          <span className="text-sm">{item.author?.name || '-'}</span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col gap-1 text-xs">
                          <div className="flex items-center gap-1 text-default-500">
                            <Eye size={12} />
                            <span>{item.stats?.views ?? 0}</span>
                          </div>
                          <div className="flex items-center gap-1 text-default-500">
                            <ThumbsUp size={12} />
                            <span>{item.stats?.likes ?? 0}</span>
                          </div>
                          <div className="flex items-center gap-1 text-default-500">
                            <MessageCircle size={12} />
                            <span>{item.stats?.favorites ?? 0}</span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="hidden md:table-cell">
                        <div className="flex flex-col">
                          <span className="text-sm">{item.broadCode || '-'}</span>
                          {item.narrowCode && (
                            <span className="text-xs text-default-400">{item.narrowCode}</span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="hidden lg:table-cell">
                        <span className="text-sm">{item.noteGrade ?? '-'}</span>
                      </TableCell>

                      <TableCell className="hidden xl:table-cell">
                        <span className="text-sm truncate max-w-24">
                          {item.suitableUsers || '-'}
                        </span>
                      </TableCell>

                      <TableCell>
                        <Chip size="sm" variant="flat" color={getDictColor(DICT_NOTE_STATUS, item.status)}>
                          {getDictLabel(DICT_NOTE_STATUS, item.status)}
                        </Chip>
                      </TableCell>

                      <TableCell className="hidden md:table-cell">
                        <Chip
                          size="sm"
                          variant="dot"
                          color={getAuditStatusColor(item.auditStatus)}
                        >
                          {getAuditStatusLabel(item.auditStatus)}
                        </Chip>
                      </TableCell>

                      <TableCell className="hidden xl:table-cell">
                        <span className="text-sm">
                          {item.createTime ? formatDateTime(item.createTime) : '-'}
                        </span>
                      </TableCell>

                      <TableCell className="hidden lg:table-cell">
                        <span className="text-sm">
                          {item.publishTime ? formatDateTime(item.publishTime) : '-'}
                        </span>
                      </TableCell>

                      <TableCell className="hidden md:table-cell">
                        <Switch
                          size="sm"
                          color="primary"
                          isSelected={item.isPinned === 1}
                          onValueChange={() => handleTogglePinned(item.id)}
                          aria-label="置顶"
                        />
                      </TableCell>

                      <TableCell className="hidden md:table-cell">
                        <Switch
                          size="sm"
                          color="primary"
                          isSelected={item.isRecommended === 1}
                          onValueChange={() => handleToggleRecommended(item.id)}
                          aria-label="推荐"
                        />
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Tooltip content="编辑信息" size="sm">
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              onPress={() => handleEditDoc(item)}
                            >
                              <Pencil size={14} />
                            </Button>
                          </Tooltip>
                          <Tooltip content="编辑内容" size="sm">
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              onPress={() => handleEditContent(item)}
                            >
                              <FileText size={14} />
                            </Button>
                          </Tooltip>
                          <Tooltip content="评论管理" size="sm">
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              color="secondary"
                              onPress={() => handleOpenCommentModal(item)}
                            >
                              <MessageSquare size={14} />
                            </Button>
                          </Tooltip>
                          <Tooltip content="删除" size="sm">
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              color="danger"
                              onPress={() => handleDeleteDoc([item.id])}
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
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <SelectItem key={String(size)} textValue={`${size}条/页`}>
                      {size}条/页
                    </SelectItem>
                  ))}
                </Select>
                <span className="text-xs text-default-400">共 {total} 条</span>
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

      {/* 文档元信息编辑弹窗 */}
      <DocMetaFormModal
        isOpen={editModal.isOpen}
        onOpenChange={editModal.onOpenChange}
        docData={editingDoc}
        mode="edit"
        onSuccess={fetchDocList}
      />

      {/* 批量删除确认弹窗 */}
      <BatchDeleteModal
        isOpen={deleteModal.isOpen}
        onOpenChange={deleteModal.onOpenChange}
        ids={Array.from(selectedKeys)}
        onConfirm={() => {
          handleDeleteDoc(Array.from(selectedKeys))
          setSelectedKeys(new Set())
        }}
      />

      {/* 批量状态更新弹窗 */}
      <BatchStatusModal
        isOpen={statusModal.isOpen}
        onOpenChange={statusModal.onOpenChange}
        ids={Array.from(selectedKeys)}
        onConfirm={() => {
          fetchDocList()
          setSelectedKeys(new Set())
        }}
      />

      {/* 评论管理弹窗 */}
      <DocCommentModal
        isOpen={commentModal.isOpen}
        onOpenChange={commentModal.onOpenChange}
        docId={commentDoc?.id ?? ''}
        docTitle={commentDoc?.noteName}
      />
    </div>
  )
}
