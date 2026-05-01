/**
 * 后台-视频列表页面
 *
 * 工具栏 + 表格布局：
 * - 顶部工具栏：搜索框（视频标题）、状态筛选、审核状态筛选、分类筛选、新增按钮、刷新按钮
 * - 中部表格：视频列表，支持多选批量操作
 * - 底部：后端分页控件
 * - 弹窗：编辑视频元信息（VideoMetaFormModal）、批量删除确认、批量状态更新
 *
 * 核心交互：
 * - 搜索/筛选 → 调用后端分页接口刷新列表
 * - 编辑信息 → 打开元信息编辑弹窗
 * - 批量操作 → 批量删除、批量上架/下架
 * - 状态切换 → 置顶/推荐开关直接在列表中切换
 */

// ===== 1. 依赖导入区域 =====
import { useState, useEffect, useCallback } from 'react'

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
  useDisclosure,
  Pagination,
  Image,
  Card,
  CardBody,
  Tooltip,
  Avatar,
  Switch,
} from '@heroui/react'

// 图标
import {
  Plus,
  Search,
  Trash2,
  Pencil,
  RefreshCw,
  Film,
  Eye,
  ThumbsUp,
  MessageCircle,
  MessageSquare,
} from 'lucide-react'

// 工具
import { toast } from '@/utils/toast'
import { formatDateTime } from '@/utils/format'

// 字典组件
import { DictSelect } from '@/components/ui/dict/DictSelect'
import { getDictLabel, getDictColor } from '@/stores/dict'
import { DICT_VIDEO_STATUS, DICT_AUDIT_STATUS } from '@/constants/dict'

// 通用组件
import { StatusState } from '@/components/ui/StatusState'

import { VideoMetaFormModal } from './components/VideoMetaFormModal'
import { VideoCommentModal } from './components/VideoCommentModal'

// 常量
import { PAGINATION } from '@/constants'

// API
import {
  getDocVideoPage,
  deleteDocVideo,
  batchUpdateDocVideoStatus,
  toggleDocVideoPinned,
  toggleDocVideoRecommended,
  getDocVideoById,
} from '@/api/admin/video'

// 类型
import type {
  DocVideo,
  DocVideoQueryParams,
  DocVideoStatus,
  DocVideoAuditStatus,
} from '@/types/video.types'

// ===== 3. 状态控制逻辑区域 =====

const DEFAULT_PAGE_SIZE = PAGINATION.DEFAULT_PAGE_SIZE as number
const PAGE_SIZE_OPTIONS = [...PAGINATION.PAGE_SIZE_OPTIONS] as number[]

// ===== 4. 通用工具函数区域 =====

/**
 * 获取审核状态的显示标签
 */
function getAuditStatusLabel(auditStatus: DocVideoAuditStatus): string {
  return getDictLabel(DICT_AUDIT_STATUS, auditStatus)
}

/**
 * 获取审核状态对应的 Chip 颜色
 */
function getAuditStatusColor(auditStatus: DocVideoAuditStatus): 'warning' | 'success' | 'danger' {
  return getDictColor(DICT_AUDIT_STATUS, auditStatus, 'warning') as 'warning' | 'success' | 'danger'
}

// ===== 5. 注释代码函数区 =====

// ===== 6. 错误处理函数区域 =====

// ===== 7. 数据处理函数区域 =====

// ===== 8. UI渲染逻辑区域 =====

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
      await deleteDocVideo(ids.join(','))
      toast.success(`成功删除 ${ids.length} 个视频`)
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
            确定要删除选中的 <span className="font-bold text-danger">{ids.length}</span> 个视频吗？
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
  const [targetStatus, setTargetStatus] = useState<DocVideoStatus>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleConfirm = useCallback(async () => {
    if (ids.length === 0) return

    setIsSubmitting(true)
    try {
      await batchUpdateDocVideoStatus({ ids, status: targetStatus })
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
            选中视频数量：<span className="font-bold">{ids.length}</span>
          </p>
          <DictSelect
            label="目标状态"
            dictType={DICT_VIDEO_STATUS}
            selectedKeys={[String(targetStatus)]}
            onSelectionChange={(keys) => {
              const value = Array.from(keys)[0] as string
              setTargetStatus(Number(value) as DocVideoStatus)
            }}
          />
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

// ===== 9. 页面初始化与事件绑定 =====

/**
 * 视频列表主页面
 */
export default function VideoList() {
  // ===== 状态 =====
  const [videoList, setVideoList] = useState<DocVideo[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())
  const [queryParams, setQueryParams] = useState<DocVideoQueryParams>({})
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const editModal = useDisclosure()
  const [editingVideo, setEditingVideo] = useState<DocVideo | null>(null)

  const deleteModal = useDisclosure()
  const statusModal = useDisclosure()

  const commentModal = useDisclosure()
  const [commentVideoId, setCommentVideoId] = useState('')
  const [commentVideoTitle, setCommentVideoTitle] = useState('')

  const [searchKeyword, setSearchKeyword] = useState('')

  // ===== 数据请求 =====

  /**
   * 获取视频列表
   */
  const fetchVideoList = useCallback(async () => {
    setIsLoading(true)
    try {
      const params: DocVideoQueryParams = {
        ...queryParams,
        pageNum: page,
        pageSize,
      }
      const data = await getDocVideoPage(params)

      if (data && data.list) {
        setVideoList(data.list)
        setTotal(data.total || 0)
        const calculatedTotalPages = Math.ceil((data.total || 0) / pageSize)
        setTotalPages(calculatedTotalPages > 0 ? calculatedTotalPages : 1)
      } else {
        setVideoList([])
        setTotal(0)
        setTotalPages(0)
      }
    } catch (error) {
      console.error('获取视频列表失败：', error)
      toast.error('获取视频列表失败')
      setVideoList([])
      setTotal(0)
      setTotalPages(0)
    } finally {
      setIsLoading(false)
    }
  }, [queryParams, page, pageSize])

  /**
   * 删除视频（支持批量）
   */
  const handleDeleteVideo = useCallback(
    async (ids: string[]) => {
      try {
        await deleteDocVideo(ids.join(','))
        toast.success('删除成功')
        fetchVideoList()
        setSelectedKeys(new Set())
      } catch (error) {
        const message = error instanceof Error ? error.message : '删除失败'
        toast.error(message)
        console.error('删除视频失败：', error)
      }
    },
    [fetchVideoList]
  )

  /**
   * 切换置顶状态
   */
  const handleTogglePinned = useCallback(
    async (id: string, currentPinned: number) => {
      try {
        const newPinned = currentPinned === 1 ? 0 : 1
        await toggleDocVideoPinned(id, newPinned)
        toast.success('置顶状态切换成功')
        setVideoList((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, isPinned: newPinned } : item
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
    async (id: string, currentRecommended: number) => {
      try {
        const newRecommended = currentRecommended === 1 ? 0 : 1
        await toggleDocVideoRecommended(id, newRecommended)
        toast.success('推荐状态切换成功')
        setVideoList((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, isRecommended: newRecommended } : item
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
    fetchVideoList()
  }, [fetchVideoList])

  // ===== 事件 =====

  /**
   * 打开编辑视频弹窗（先查询视频详情）
   */
  const handleEditVideo = useCallback(
    async (video: DocVideo) => {
      try {
        const detail = await getDocVideoById(video.id)
        // 将详情数据合并到列表数据中，保持类型一致
        const mergedVideo: DocVideo = {
          ...video,
          ...detail,
        }
        setEditingVideo(mergedVideo)
        editModal.onOpen()
      } catch (error) {
        const message = error instanceof Error ? error.message : '获取视频详情失败'
        toast.error(message)
        console.error('获取视频详情失败：', error)
      }
    },
    [editModal]
  )

  /**
   * 打开新增视频弹窗
   */
  const handleCreateNew = useCallback(() => {
    setEditingVideo(null)
    editModal.onOpen()
  }, [editModal])

  /**
   * 打开视频评论弹窗
   */
  const handleOpenCommentModal = useCallback(
    (video: DocVideo) => {
      setCommentVideoId(video.id)
      setCommentVideoTitle(video.videoTitle)
      commentModal.onOpen()
    },
    [commentModal]
  )

  /**
   * 批量删除
   */
  const handleBatchDelete = useCallback(() => {
    if (selectedKeys.size === 0) {
      toast.warning('请选择要删除的视频')
      return
    }
    deleteModal.onOpen()
  }, [selectedKeys, deleteModal])

  /**
   * 批量状态更新
   */
  const handleBatchStatus = useCallback(() => {
    if (selectedKeys.size === 0) {
      toast.warning('请选择要更新状态的视频')
      return
    }
    statusModal.onOpen()
  }, [selectedKeys, statusModal])

  const handleSearch = useCallback(() => {
    setQueryParams((prev) => ({
      ...prev,
      videoTitle: searchKeyword.trim() || undefined,
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
    <K extends keyof DocVideoQueryParams>(key: K, value: DocVideoQueryParams[K]) => {
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

  // ===== 10. TODO任务管理区域 =====

  // ===== 11. 导出区域 =====

  return (
    <div className="flex flex-col gap-4 p-4 md:p-0 h-full">
      <Card className="h-full">
        <CardBody className="p-0 flex flex-col overflow-hidden">
          {/* 顶部标题栏 */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-divider">
            <div className="flex items-center gap-2">
              <Film size={18} className="text-primary" />
              <span className="font-semibold text-sm">视频管理</span>
            </div>
            <div className="flex items-center gap-1">
              <Tooltip content="新增视频" size="sm">
                <Button isIconOnly size="sm" variant="light" onPress={handleCreateNew}>
                  <Plus size={16} />
                </Button>
              </Tooltip>
              <Tooltip content="刷新" size="sm">
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onPress={fetchVideoList}
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
                placeholder="搜索视频标题"
                className="w-full sm:w-56"
                value={searchKeyword}
                onValueChange={setSearchKeyword}
                onKeyDown={handleSearchKeyDown}
                startContent={<Search size={14} className="text-default-400" />}
                isClearable
                onClear={() => {
                  setSearchKeyword('')
                  setQueryParams((prev) => ({ ...prev, videoTitle: undefined }))
                }}
              />
              <DictSelect
                size="sm"
                placeholder="视频状态"
                className="w-full sm:w-28"
                aria-label="视频状态筛选"
                dictType="doc_video_status"
                selectedKeys={queryParams.status ? [String(queryParams.status)] : []}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string | undefined
                  handleQueryChange(
                    'status',
                    value ? (Number(value) as DocVideoStatus) : undefined
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
                    value !== undefined ? (Number(value) as DocVideoAuditStatus) : undefined
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

          {/* 视频列表表格 */}
          <div className="flex-1 p-3 overflow-auto">
            {isLoading ? (
              <StatusState type="loading" scene="admin" />
            ) : (
              <Table
                aria-label="视频列表"
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
                  <TableColumn key="videoTitle">视频标题</TableColumn>
                  <TableColumn key="author">作者</TableColumn>
                  <TableColumn key="stats">数据</TableColumn>
                  <TableColumn key="broadCode" className="hidden md:table-cell">
                    分类
                  </TableColumn>
                  <TableColumn key="status">状态</TableColumn>
                  <TableColumn key="auditStatus" className="hidden md:table-cell">
                    审核
                  </TableColumn>
                  <TableColumn key="createTime" className="hidden xl:table-cell">
                    创建时间
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
                  items={videoList.map((item) => ({ ...item, key: item.id }))}
                  emptyContent={<StatusState type="empty" scene="admin" />}
                >
                  {(item) => (
                    <TableRow key={item.id}>
                      {/* 视频封面 */}
                      <TableCell>
                        {item.videoFile?.thumbnail?.fileUrl ? (
                          <Image
                            src={item.videoFile.thumbnail.fileUrl}
                            alt={item.videoTitle}
                            className="w-16 h-10 object-cover rounded"
                            classNames={{ wrapper: 'w-16 h-10' }}
                            fallbackSrc="https://via.placeholder.com/64x40?text=No+Cover"
                          />
                        ) : (
                          <div className="w-16 h-10 bg-default-100 rounded flex items-center justify-center">
                            <Film size={16} className="text-default-400" />
                          </div>
                        )}
                      </TableCell>

                      {/* 视频标题 */}
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm max-w-32 truncate">
                            {item.videoTitle}
                          </span>
                          {item.tags && (
                            <span className="text-xs text-default-400 truncate max-w-32">
                              {item.tags}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* 作者信息 */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar
                            src={item.user?.avatar}
                            name={item.user?.name}
                            size="sm"
                            className="flex-shrink-0"
                          />
                          <span className="text-sm">{item.user?.name || '-'}</span>
                        </div>
                      </TableCell>

                      {/* 统计数据 */}
                      <TableCell>
                        <div className="flex flex-col gap-1 text-xs">
                          <div className="flex items-center gap-1 text-default-500">
                            <Eye size={12} />
                            <span>{item.statsInfo?.views ?? 0}</span>
                          </div>
                          <div className="flex items-center gap-1 text-default-500">
                            <ThumbsUp size={12} />
                            <span>{item.statsInfo?.likes ?? 0}</span>
                          </div>
                          <div className="flex items-center gap-1 text-default-500">
                            <MessageCircle size={12} />
                            <span>{item.statsInfo?.favorites ?? 0}</span>
                          </div>
                        </div>
                      </TableCell>

                      {/* 分类 */}
                      <TableCell className="hidden md:table-cell">
                        <div className="flex flex-col">
                          <span className="text-sm">{item.broadCode || '-'}</span>
                          {item.narrowCode && (
                            <span className="text-xs text-default-400">{item.narrowCode}</span>
                          )}
                        </div>
                      </TableCell>

                      {/* 状态 */}
                      <TableCell>
                        <Chip size="sm" variant="flat" color={getDictColor(DICT_VIDEO_STATUS, item.status)}>
                          {getDictLabel(DICT_VIDEO_STATUS, item.status)}
                        </Chip>
                      </TableCell>

                      {/* 审核状态 */}
                      <TableCell className="hidden md:table-cell">
                        <Chip
                          size="sm"
                          variant="dot"
                          color={getAuditStatusColor(item.auditStatus)}
                        >
                          {getAuditStatusLabel(item.auditStatus)}
                        </Chip>
                      </TableCell>

                      {/* 创建时间 */}
                      <TableCell className="hidden xl:table-cell">
                        <span className="text-sm">
                          {item.createTime ? formatDateTime(item.createTime) : '-'}
                        </span>
                      </TableCell>

                      {/* 置顶开关 */}
                      <TableCell className="hidden md:table-cell">
                        <Switch
                          size="sm"
                          color="primary"
                          isSelected={item.isPinned === 1}
                          onValueChange={() => handleTogglePinned(item.id, item.isPinned)}
                          aria-label="置顶"
                        />
                      </TableCell>

                      {/* 推荐开关 */}
                      <TableCell className="hidden md:table-cell">
                        <Switch
                          size="sm"
                          color="primary"
                          isSelected={item.isRecommended === 1}
                          onValueChange={() => handleToggleRecommended(item.id, item.isRecommended)}
                          aria-label="推荐"
                        />
                      </TableCell>

                      {/* 操作按钮 */}
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {/* 编辑元信息 */}
                          <Tooltip content="编辑信息" size="sm">
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              onPress={() => handleEditVideo(item)}
                            >
                              <Pencil size={14} />
                            </Button>
                          </Tooltip>
                          {/* 查看评论 */}
                          <Tooltip content="查看评论" size="sm">
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
                          {/* 删除 */}
                          <Tooltip content="删除" size="sm">
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              color="danger"
                              onPress={() => handleDeleteVideo([item.id])}
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

      {/* 视频元信息编辑弹窗 */}
      <VideoMetaFormModal
        isOpen={editModal.isOpen}
        onOpenChange={editModal.onOpenChange}
        videoData={editingVideo}
        onSuccess={fetchVideoList}
      />

      {/* 批量删除确认弹窗 */}
      <BatchDeleteModal
        isOpen={deleteModal.isOpen}
        onOpenChange={deleteModal.onOpenChange}
        ids={Array.from(selectedKeys)}
        onConfirm={() => {
          handleDeleteVideo(Array.from(selectedKeys))
          setSelectedKeys(new Set())
        }}
      />

      {/* 批量状态更新弹窗 */}
      <BatchStatusModal
        isOpen={statusModal.isOpen}
        onOpenChange={statusModal.onOpenChange}
        ids={Array.from(selectedKeys)}
        onConfirm={() => {
          fetchVideoList()
          setSelectedKeys(new Set())
        }}
      />

      {/* 视频评论管理弹窗 */}
      <VideoCommentModal
        isOpen={commentModal.isOpen}
        onOpenChange={commentModal.onOpenChange}
        videoId={commentVideoId}
        videoTitle={commentVideoTitle}
      />
    </div>
  )
}
