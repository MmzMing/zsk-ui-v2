/**
 * 后台-视频合集管理页面
 *
 * 工具栏 + 表格布局：
 * - 顶部工具栏：搜索框（合集名称）、状态筛选、删除状态筛选、新增按钮、刷新按钮
 * - 中部表格：合集列表，支持多选批量操作
 * - 底部：后端分页控件
 * - 弹窗：合集新增/编辑（CollectionFormModal）、合集详情（CollectionDetailModal）、
 *        添加视频到合集（AddVideoModal）、批量删除确认
 *
 * 核心交互：
 * - 搜索/筛选 → 调用后端分页接口刷新列表
 * - 编辑合集 → 打开合集编辑弹窗
 * - 查看详情 → 打开合集详情弹窗（含视频列表管理）
 * - 批量操作 → 批量删除
 * - 状态切换 → 在列表中直接切换合集上架/下架状态
 */

// ===== 1. 依赖导入区域 =====
import { useState, useEffect, useCallback, useRef } from 'react'

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
  Switch,
  Image,
  Textarea,
} from '@heroui/react'

// 图标 (Lucide 优先)
import {
  Plus,
  Search,
  Trash2,
  Pencil,
  RefreshCw,
  FolderOpen,
  Eye,
  ArrowUp,
  ArrowDown,
  X,
  ImageIcon,
  Film,
} from 'lucide-react'

// 工具
import { toast } from '@/utils/toast'
import { formatDateTime } from '@/utils/format'

// 通用组件
import { StatusState } from '@/components/ui/StatusState'

// 图片裁剪组件
import ImageCropModal from '@/components/ui/image-crop/ImageCropModal'

// 常量
import { PAGINATION } from '@/constants'

// API
import {
  getDocVideoCollectionPage,
  deleteDocVideoCollection,
  createDocVideoCollection,
  updateDocVideoCollection,
  getDocVideoCollectionById,
  getDocVideoCollectionVideos,
  addVideoToCollection,
  removeVideoFromCollection,
  updateCollectionVideoOrder,
} from '@/api/admin/videoCollection'
import { getDocVideoPage } from '@/api/admin/video'
import { uploadDocFile } from '@/api/admin/file'

// 类型
import type {
  DocVideoCollection,
  DocVideoCollectionQueryParams,
  DocVideoCollectionStatus,
  DocVideoCollectionCreateInput,
  DocVideoCollectionUpdateInput,
} from '@/types/videoCollection.types'
import {
  DOC_VIDEO_COLLECTION_STATUS_OPTIONS,
  DOC_VIDEO_COLLECTION_DELETED_OPTIONS,
} from '@/types/videoCollection.types'
import type { DocVideo, DocVideoQueryParams } from '@/types/video.types'

// 状态管理
import { useUserStore } from '@/stores/user'

// ===== 2. TODO待处理导入区域 =====

// ===== 3. 状态控制逻辑区域 =====

const DEFAULT_PAGE_SIZE = PAGINATION.DEFAULT_PAGE_SIZE as number
const PAGE_SIZE_OPTIONS = [...PAGINATION.PAGE_SIZE_OPTIONS] as number[]

// ===== 4. 通用工具函数区域 =====

/**
 * 获取合集状态的显示标签
 */
function getCollectionStatusLabel(status: DocVideoCollectionStatus): string {
  const option = DOC_VIDEO_COLLECTION_STATUS_OPTIONS.find((o) => o.value === status)
  return option?.label ?? String(status)
}

/**
 * 获取合集状态对应的 Chip 颜色
 */
function getCollectionStatusColor(status: DocVideoCollectionStatus): 'success' | 'danger' {
  const colorMap: Record<number, 'success' | 'danger'> = {
    1: 'success',
    2: 'danger',
  }
  return colorMap[status] ?? 'default'
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
      await deleteDocVideoCollection(ids.join(','))
      toast.success(`成功删除 ${ids.length} 个合集`)
      onConfirm()
      onOpenChange(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : '删除失败'
      toast.error(message)
      console.error('批量删除合集失败：', error)
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
            确定要删除选中的 <span className="font-bold text-danger">{ids.length}</span> 个合集吗？
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
 * 合集表单弹窗（新增/编辑）
 */
interface CollectionFormModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  collectionData: DocVideoCollection | null
  onSuccess: () => void
}

function CollectionFormModal({ isOpen, onOpenChange, collectionData, onSuccess }: CollectionFormModalProps) {
  const { userInfo } = useUserStore()
  const isEdit = !!collectionData

  const [formData, setFormData] = useState<{
    collectionName: string
    description: string
    coverImage: string
    status: DocVideoCollectionStatus
  }>({
    collectionName: '',
    description: '',
    coverImage: '',
    status: 1,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  // 图片裁剪弹窗状态
  const cropModal = useDisclosure()
  const [cropFile, setCropFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 初始化表单数据
  useEffect(() => {
    if (isOpen) {
      if (collectionData) {
        setFormData({
          collectionName: collectionData.collectionName || '',
          description: collectionData.description || '',
          coverImage: collectionData.coverImage || '',
          status: collectionData.status ?? 1,
        })
      } else {
        setFormData({
          collectionName: '',
          description: '',
          coverImage: '',
          status: 1,
        })
      }
    }
  }, [isOpen, collectionData])

  /**
   * 校验表单数据
   */
  const validateForm = useCallback((): boolean => {
    if (!formData.collectionName.trim()) {
      toast.error('合集名称不能为空')
      return false
    }
    if (formData.collectionName.length > 100) {
      toast.error('合集名称不能超过100个字符')
      return false
    }
    if (formData.description && formData.description.length > 500) {
      toast.error('合集描述不能超过500个字符')
      return false
    }
    return true
  }, [formData])

  /**
   * 提交表单
   */
  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return
    if (!userInfo?.id) {
      toast.error('用户信息获取失败，请重新登录')
      return
    }

    setIsSubmitting(true)
    try {
      if (isEdit && collectionData) {
        const data: DocVideoCollectionUpdateInput = {
          id: collectionData.id,
          collectionName: formData.collectionName.trim(),
          description: formData.description.trim() || undefined,
          coverImage: formData.coverImage || undefined,
          status: formData.status,
        }
        await updateDocVideoCollection(data)
        toast.success('合集修改成功')
      } else {
        const data: DocVideoCollectionCreateInput = {
          userId: userInfo.id,
          collectionName: formData.collectionName.trim(),
          description: formData.description.trim() || undefined,
          coverImage: formData.coverImage || undefined,
          status: formData.status,
        }
        await createDocVideoCollection(data)
        toast.success('合集新增成功')
      }
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : '操作失败'
      toast.error(message)
      console.error(isEdit ? '修改合集失败：' : '新增合集失败：', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, isEdit, collectionData, userInfo, validateForm, onSuccess, onOpenChange])

  /**
   * 选择封面图片文件
   */
  const handleSelectCover = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  /**
   * 处理文件选择变化
   */
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      // 校验文件类型
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']
      if (!allowedTypes.includes(file.type)) {
        toast.error('仅支持 jpg、png、jpeg 格式的图片')
        return
      }

      // 校验文件大小（3MB）
      const maxSize = 3 * 1024 * 1024
      if (file.size > maxSize) {
        toast.error('图片大小不能超过 3MB')
        return
      }

      setCropFile(file)
      cropModal.onOpen()

      // 清空 input 值，允许重复选择同一文件
      e.target.value = ''
    },
    [cropModal]
  )

  /**
   * 裁剪完成回调
   */
  const handleCropComplete = useCallback(
    async (file: File) => {
      setIsUploading(true)
      try {
        const result = await uploadDocFile(file)
        if (result.fileUrl) {
          setFormData((prev) => ({ ...prev, coverImage: result.fileUrl }))
          toast.success('封面上传成功')
        } else {
          toast.error('封面上传失败，未返回文件地址')
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : '封面上传失败'
        toast.error(message)
        console.error('封面上传失败：', error)
      } finally {
        setIsUploading(false)
        setCropFile(null)
      }
    },
    []
  )

  /**
   * 删除封面
   */
  const handleRemoveCover = useCallback(() => {
    setFormData((prev) => ({ ...prev, coverImage: '' }))
  }, [])

  return (
    <>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
        <ModalContent>
          <ModalHeader>{isEdit ? '编辑合集' : '新增合集'}</ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-4">
              {/* 封面上传区域 */}
              <div>
                <label className="text-sm font-medium mb-2 block">合集封面</label>
                {formData.coverImage ? (
                  <div className="relative w-40 h-24 rounded-lg overflow-hidden group">
                    <Image
                      src={formData.coverImage}
                      alt="合集封面"
                      className="w-full h-full object-cover"
                      classNames={{ wrapper: 'w-full h-full' }}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button isIconOnly size="sm" variant="light" color="primary" onPress={handleSelectCover}>
                        <Pencil size={14} />
                      </Button>
                      <Button isIconOnly size="sm" variant="light" color="danger" onPress={handleRemoveCover}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white text-xs">上传中...</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    className="w-40 h-24 border-2 border-dashed border-default-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
                    onClick={handleSelectCover}
                  >
                    <ImageIcon size={24} className="text-default-400" />
                    <span className="text-xs text-default-400 mt-1">点击上传封面</span>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {/* 合集名称 */}
              <Input
                label="合集名称"
                placeholder="请输入合集名称"
                value={formData.collectionName}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, collectionName: value }))}
                isRequired
                maxLength={100}
              />

              {/* 合集描述 */}
              <Textarea
                label="合集描述"
                placeholder="请输入合集描述（选填）"
                value={formData.description}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, description: value }))}
                maxLength={500}
                rows={3}
              />

              {/* 状态 */}
              <div className="flex items-center gap-2">
                <span className="text-sm">状态：</span>
                <Switch
                  isSelected={formData.status === 1}
                  onValueChange={(selected) =>
                    setFormData((prev) => ({ ...prev, status: selected ? 1 : 2 }))
                  }
                >
                  {formData.status === 1 ? '正常' : '下架'}
                </Switch>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={() => onOpenChange(false)}>
              取消
            </Button>
            <Button color="primary" isLoading={isSubmitting} onPress={handleSubmit}>
              {isEdit ? '保存修改' : '确认新增'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* 图片裁剪弹窗 */}
      <ImageCropModal
        isOpen={cropModal.isOpen}
        onClose={cropModal.onClose}
        file={cropFile}
        aspect={16 / 9}
        onCropComplete={handleCropComplete}
        title="裁剪合集封面"
        confirmText="确认并上传"
      />
    </>
  )
}

/**
 * 合集详情弹窗（含视频列表管理）
 */
interface CollectionDetailModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  collectionId: string
  onEdit: (collection: DocVideoCollection) => void
  onRefresh: () => void
}

function CollectionDetailModal({ isOpen, onOpenChange, collectionId, onEdit, onRefresh }: CollectionDetailModalProps) {
  const [collection, setCollection] = useState<DocVideoCollection | null>(null)
  const [videos, setVideos] = useState<DocVideo[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isRemoving, setIsRemoving] = useState<string | null>(null)
  const [isReordering, setIsReordering] = useState(false)

  const addVideoModal = useDisclosure()

  /**
   * 获取合集详情和视频列表
   */
  const fetchDetail = useCallback(async () => {
    if (!collectionId || !isOpen) return

    setIsLoading(true)
    try {
      const detail = await getDocVideoCollectionById(collectionId)
      setCollection(detail)
      // 从详情中获取视频列表，如果没有则单独请求
      if (detail.videos) {
        setVideos(detail.videos)
      } else {
        const videoList = await getDocVideoCollectionVideos(collectionId)
        setVideos(videoList)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '获取合集详情失败'
      toast.error(message)
      console.error('获取合集详情失败：', error)
    } finally {
      setIsLoading(false)
    }
  }, [collectionId, isOpen])

  useEffect(() => {
    fetchDetail()
  }, [fetchDetail])

  /**
   * 移除视频
   */
  const handleRemoveVideo = useCallback(
    async (videoId: string) => {
      setIsRemoving(videoId)
      try {
        await removeVideoFromCollection(collectionId, videoId)
        toast.success('视频已从合集中移除')
        setVideos((prev) => prev.filter((v) => v.id !== videoId))
        onRefresh()
      } catch (error) {
        const message = error instanceof Error ? error.message : '移除视频失败'
        toast.error(message)
        console.error('移除视频失败：', error)
      } finally {
        setIsRemoving(null)
      }
    },
    [collectionId, onRefresh]
  )

  /**
   * 上移视频
   */
  const handleMoveUp = useCallback(
    async (index: number) => {
      if (index <= 0 || isReordering) return

      const newVideos = [...videos]
      const temp = newVideos[index]
      newVideos[index] = newVideos[index - 1]
      newVideos[index - 1] = temp

      setIsReordering(true)
      try {
        const videoOrders = newVideos.map((v, i) => ({
          videoId: v.id,
          sortOrder: i + 1,
        }))
        await updateCollectionVideoOrder(collectionId, { videoOrders })
        setVideos(newVideos)
        toast.success('排序更新成功')
        onRefresh()
      } catch (error) {
        const message = error instanceof Error ? error.message : '排序更新失败'
        toast.error(message)
        console.error('排序更新失败：', error)
      } finally {
        setIsReordering(false)
      }
    },
    [videos, collectionId, isReordering, onRefresh]
  )

  /**
   * 下移视频
   */
  const handleMoveDown = useCallback(
    async (index: number) => {
      if (index >= videos.length - 1 || isReordering) return

      const newVideos = [...videos]
      const temp = newVideos[index]
      newVideos[index] = newVideos[index + 1]
      newVideos[index + 1] = temp

      setIsReordering(true)
      try {
        const videoOrders = newVideos.map((v, i) => ({
          videoId: v.id,
          sortOrder: i + 1,
        }))
        await updateCollectionVideoOrder(collectionId, { videoOrders })
        setVideos(newVideos)
        toast.success('排序更新成功')
        onRefresh()
      } catch (error) {
        const message = error instanceof Error ? error.message : '排序更新失败'
        toast.error(message)
        console.error('排序更新失败：', error)
      } finally {
        setIsReordering(false)
      }
    },
    [videos, collectionId, isReordering, onRefresh]
  )

  return (
    <>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="3xl" scrollBehavior="inside">
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center gap-2">
              <FolderOpen size={18} className="text-primary" />
              <span>合集详情</span>
            </div>
          </ModalHeader>
          <ModalBody>
            {isLoading ? (
              <StatusState type="loading" scene="admin" />
            ) : collection ? (
              <div className="flex flex-col gap-4">
                {/* 合集信息区 */}
                <div className="flex gap-4">
                  {collection.coverImage ? (
                    <Image
                      src={collection.coverImage}
                      alt={collection.collectionName}
                      className="w-32 h-20 object-cover rounded-lg flex-shrink-0"
                      classNames={{ wrapper: 'w-32 h-20 flex-shrink-0' }}
                    />
                  ) : (
                    <div className="w-32 h-20 bg-default-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <ImageIcon size={24} className="text-default-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg">{collection.collectionName}</h3>
                    <p className="text-sm text-default-500 mt-1 line-clamp-2">
                      {collection.description || '暂无描述'}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-default-400">
                      <Chip size="sm" variant="flat" color={getCollectionStatusColor(collection.status)}>
                        {getCollectionStatusLabel(collection.status)}
                      </Chip>
                      <span>创建时间：{formatDateTime(collection.createTime)}</span>
                      <span>更新时间：{formatDateTime(collection.updateTime)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button size="sm" variant="flat" startContent={<Pencil size={14} />} onPress={() => onEdit(collection)}>
                      编辑合集
                    </Button>
                    <Button
                      size="sm"
                      color="primary"
                      startContent={<Plus size={14} />}
                      onPress={addVideoModal.onOpen}
                    >
                      添加视频
                    </Button>
                  </div>
                </div>

                {/* 视频列表区 */}
                <div>
                  <h4 className="text-sm font-medium mb-2">
                    合集内视频（{videos.length}）
                  </h4>
                  {videos.length === 0 ? (
                    <div className="text-center py-8 text-default-400 text-sm">
                      <Film size={32} className="mx-auto mb-2 opacity-50" />
                      <p>暂无视频，点击上方按钮添加</p>
                    </div>
                  ) : (
                    <Table
                      aria-label="合集内视频列表"
                      classNames={{
                        wrapper: 'p-0',
                        thead: '[&>tr]:first:shadow-none',
                      }}
                    >
                      <TableHeader>
                        <TableColumn key="cover">封面</TableColumn>
                        <TableColumn key="videoTitle">视频标题</TableColumn>
                        <TableColumn key="author">作者</TableColumn>
                        <TableColumn key="sort">排序</TableColumn>
                        <TableColumn key="actions">操作</TableColumn>
                      </TableHeader>
                      <TableBody
                        items={videos.map((item, index) => ({ ...item, key: item.id, index }))}
                      >
                        {(item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              {item.videoFile?.thumbnail?.fileUrl ? (
                                <Image
                                  src={item.videoFile.thumbnail.fileUrl}
                                  alt={item.videoTitle}
                                  className="w-16 h-10 object-cover rounded"
                                  classNames={{ wrapper: 'w-16 h-10' }}
                                />
                              ) : (
                                <div className="w-16 h-10 bg-default-100 rounded flex items-center justify-center">
                                  <Film size={16} className="text-default-400" />
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <span className="text-sm font-medium max-w-48 truncate block">
                                {item.videoTitle}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">{item.user?.name || '-'}</span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button
                                  isIconOnly
                                  size="sm"
                                  variant="light"
                                  isDisabled={item.index === 0 || isReordering}
                                  onPress={() => handleMoveUp(item.index)}
                                >
                                  <ArrowUp size={14} />
                                </Button>
                                <span className="text-sm text-default-500 w-6 text-center">
                                  {item.index + 1}
                                </span>
                                <Button
                                  isIconOnly
                                  size="sm"
                                  variant="light"
                                  isDisabled={item.index === videos.length - 1 || isReordering}
                                  onPress={() => handleMoveDown(item.index)}
                                >
                                  <ArrowDown size={14} />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                color="danger"
                                isLoading={isRemoving === item.id}
                                onPress={() => handleRemoveVideo(item.id)}
                              >
                                <X size={14} />
                              </Button>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </div>
            ) : (
              <StatusState type="empty" scene="admin" />
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={() => onOpenChange(false)}>
              关闭
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* 添加视频弹窗 */}
      <AddVideoModal
        isOpen={addVideoModal.isOpen}
        onOpenChange={addVideoModal.onOpenChange}
        collectionId={collectionId}
        existingVideoIds={videos.map((v) => v.id)}
        onSuccess={() => {
          fetchDetail()
          onRefresh()
        }}
      />
    </>
  )
}

/**
 * 添加视频到合集弹窗
 */
interface AddVideoModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  collectionId: string
  existingVideoIds: string[]
  onSuccess: () => void
}

function AddVideoModal({ isOpen, onOpenChange, collectionId, existingVideoIds, onSuccess }: AddVideoModalProps) {
  const [videoList, setVideoList] = useState<DocVideo[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedVideoIds, setSelectedVideoIds] = useState<Set<string>>(new Set())
  const [searchKeyword, setSearchKeyword] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [total, setTotal] = useState(0)

  /**
   * 获取可选视频列表
   */
  const fetchVideoList = useCallback(async () => {
    if (!isOpen) return

    setIsLoading(true)
    try {
      const params: DocVideoQueryParams = {
        videoTitle: searchKeyword.trim() || undefined,
        pageNum: page,
        pageSize,
        status: 1,
      }
      const data = await getDocVideoPage(params)
      if (data && data.list) {
        setVideoList(data.list)
        setTotal(data.total || 0)
      } else {
        setVideoList([])
        setTotal(0)
      }
    } catch (error) {
      console.error('获取视频列表失败：', error)
      toast.error('获取视频列表失败')
      setVideoList([])
      setTotal(0)
    } finally {
      setIsLoading(false)
    }
  }, [isOpen, searchKeyword, page, pageSize])

  useEffect(() => {
    fetchVideoList()
  }, [fetchVideoList])

  /**
   * 确认添加视频
   */
  const handleSubmit = useCallback(async () => {
    if (selectedVideoIds.size === 0) {
      toast.warning('请选择要添加的视频')
      return
    }

    setIsSubmitting(true)
    try {
      const ids = Array.from(selectedVideoIds)
      // 逐个添加视频到合集
      for (let i = 0; i < ids.length; i++) {
        await addVideoToCollection(collectionId, {
          videoId: ids[i],
          sortOrder: existingVideoIds.length + i + 1,
        })
      }
      toast.success(`成功添加 ${ids.length} 个视频到合集`)
      onSuccess()
      onOpenChange(false)
      setSelectedVideoIds(new Set())
    } catch (error) {
      const message = error instanceof Error ? error.message : '添加视频失败'
      toast.error(message)
      console.error('添加视频到合集失败：', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [selectedVideoIds, collectionId, existingVideoIds, onSuccess, onOpenChange])

  const totalPages = Math.ceil(total / pageSize) || 1

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
      <ModalContent>
        <ModalHeader>
          <div className="flex items-center gap-2">
            <Plus size={18} className="text-primary" />
            <span>添加视频到合集</span>
          </div>
        </ModalHeader>
        <ModalBody>
          {/* 搜索区 */}
          <div className="flex items-center gap-2">
            <Input
              size="sm"
              placeholder="搜索视频标题"
              value={searchKeyword}
              onValueChange={setSearchKeyword}
              startContent={<Search size={14} className="text-default-400" />}
              isClearable
              onClear={() => setSearchKeyword('')}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setPage(1)
                  fetchVideoList()
                }
              }}
            />
            <Button size="sm" color="primary" onPress={() => { setPage(1); fetchVideoList() }}>
              搜索
            </Button>
          </div>

          {/* 视频列表 */}
          <div className="max-h-80 overflow-auto">
            {isLoading ? (
              <StatusState type="loading" scene="admin" />
            ) : videoList.length === 0 ? (
              <StatusState type="empty" scene="admin" />
            ) : (
              <Table
                aria-label="可选视频列表"
                selectionMode="multiple"
                selectedKeys={selectedVideoIds}
                onSelectionChange={(keys) => setSelectedVideoIds(keys as Set<string>)}
                classNames={{
                  wrapper: 'p-0',
                  thead: '[&>tr]:first:shadow-none',
                }}
              >
                <TableHeader>
                  <TableColumn key="cover">封面</TableColumn>
                  <TableColumn key="videoTitle">视频标题</TableColumn>
                  <TableColumn key="author">作者</TableColumn>
                  <TableColumn key="status">状态</TableColumn>
                </TableHeader>
                <TableBody
                  items={videoList.map((item) => ({ ...item, key: item.id }))}
                >
                  {(item) => {
                    const isAdded = existingVideoIds.includes(item.id)
                    return (
                      <TableRow key={item.id} className={isAdded ? 'opacity-50' : ''}>
                        <TableCell>
                          {item.videoFile?.thumbnail?.fileUrl ? (
                            <Image
                              src={item.videoFile.thumbnail.fileUrl}
                              alt={item.videoTitle}
                              className="w-16 h-10 object-cover rounded"
                              classNames={{ wrapper: 'w-16 h-10' }}
                            />
                          ) : (
                            <div className="w-16 h-10 bg-default-100 rounded flex items-center justify-center">
                              <Film size={16} className="text-default-400" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{item.videoTitle}</span>
                            {isAdded && (
                              <Chip size="sm" color="success" variant="flat" className="w-fit mt-1">
                                已添加
                              </Chip>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{item.user?.name || '-'}</span>
                        </TableCell>
                        <TableCell>
                          <Chip size="sm" variant="flat" color={item.status === 1 ? 'success' : 'danger'}>
                            {item.status === 1 ? '正常' : '下架'}
                          </Chip>
                        </TableCell>
                      </TableRow>
                    )
                  }}
                </TableBody>
              </Table>
            )}
          </div>

          {/* 分页 */}
          {total > 0 && (
            <div className="flex items-center justify-end">
              <Pagination
                total={totalPages}
                page={page}
                onChange={setPage}
                size="sm"
                showControls
              />
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <div className="flex items-center justify-between w-full">
            <span className="text-sm text-default-500">
              已选择 <span className="font-bold text-primary">{selectedVideoIds.size}</span> 个视频
            </span>
            <div className="flex gap-2">
              <Button variant="flat" onPress={() => onOpenChange(false)}>
                取消
              </Button>
              <Button
                color="primary"
                isLoading={isSubmitting}
                isDisabled={selectedVideoIds.size === 0}
                onPress={handleSubmit}
              >
                确认添加
              </Button>
            </div>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

// ===== 9. 页面初始化与事件绑定 =====

/**
 * 视频合集管理主页面
 */
export default function VideoCollection() {
  // ===== 状态 =====
  const [collectionList, setCollectionList] = useState<DocVideoCollection[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())
  const [queryParams, setQueryParams] = useState<DocVideoCollectionQueryParams>({})
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const formModal = useDisclosure()
  const [editingCollection, setEditingCollection] = useState<DocVideoCollection | null>(null)

  const detailModal = useDisclosure()
  const [detailCollectionId, setDetailCollectionId] = useState('')

  const deleteModal = useDisclosure()

  const [searchKeyword, setSearchKeyword] = useState('')

  // ===== 数据请求 =====

  /**
   * 获取合集列表
   */
  const fetchCollectionList = useCallback(async () => {
    setIsLoading(true)
    try {
      const params: DocVideoCollectionQueryParams = {
        ...queryParams,
        pageNum: page,
        pageSize,
      }
      const data = await getDocVideoCollectionPage(params)

      if (data && data.list) {
        setCollectionList(data.list)
        setTotal(data.total || 0)
        const calculatedTotalPages = Math.ceil((data.total || 0) / pageSize)
        setTotalPages(calculatedTotalPages > 0 ? calculatedTotalPages : 1)
      } else {
        setCollectionList([])
        setTotal(0)
        setTotalPages(0)
      }
    } catch (error) {
      console.error('获取合集列表失败：', error)
      toast.error('获取合集列表失败')
      setCollectionList([])
      setTotal(0)
      setTotalPages(0)
    } finally {
      setIsLoading(false)
    }
  }, [queryParams, page, pageSize])

  /**
   * 删除合集（支持批量）
   */
  const handleDeleteCollection = useCallback(
    async (ids: string[]) => {
      try {
        await deleteDocVideoCollection(ids.join(','))
        toast.success('删除成功')
        fetchCollectionList()
        setSelectedKeys(new Set())
      } catch (error) {
        const message = error instanceof Error ? error.message : '删除失败'
        toast.error(message)
        console.error('删除合集失败：', error)
      }
    },
    [fetchCollectionList]
  )

  /**
   * 切换合集状态
   */
  const handleToggleStatus = useCallback(
    async (collection: DocVideoCollection) => {
      try {
        const newStatus = collection.status === 1 ? 2 : 1
        await updateDocVideoCollection({
          id: collection.id,
          status: newStatus,
        })
        toast.success('状态切换成功')
        setCollectionList((prev) =>
          prev.map((item) =>
            item.id === collection.id ? { ...item, status: newStatus } : item
          )
        )
      } catch (error) {
        const message = error instanceof Error ? error.message : '状态切换失败'
        toast.error(message)
        console.error('切换合集状态失败：', error)
      }
    },
    []
  )

  // ===== 副作用 =====

  useEffect(() => {
    fetchCollectionList()
  }, [fetchCollectionList])

  // ===== 事件 =====

  /**
   * 打开编辑合集弹窗
   */
  const handleEditCollection = useCallback(
    (collection: DocVideoCollection) => {
      setEditingCollection(collection)
      formModal.onOpen()
    },
    [formModal]
  )

  /**
   * 打开新增合集弹窗
   */
  const handleCreateNew = useCallback(() => {
    setEditingCollection(null)
    formModal.onOpen()
  }, [formModal])

  /**
   * 打开合集详情弹窗
   */
  const handleOpenDetail = useCallback(
    (collection: DocVideoCollection) => {
      setDetailCollectionId(collection.id)
      detailModal.onOpen()
    },
    [detailModal]
  )

  /**
   * 批量删除
   */
  const handleBatchDelete = useCallback(() => {
    if (selectedKeys.size === 0) {
      toast.warning('请选择要删除的合集')
      return
    }
    deleteModal.onOpen()
  }, [selectedKeys, deleteModal])

  const handleSearch = useCallback(() => {
    setQueryParams((prev) => ({
      ...prev,
      collectionName: searchKeyword.trim() || undefined,
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
    <K extends keyof DocVideoCollectionQueryParams>(key: K, value: DocVideoCollectionQueryParams[K]) => {
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
              <FolderOpen size={18} className="text-primary" />
              <span className="font-semibold text-sm">视频合集管理</span>
            </div>
            <div className="flex items-center gap-1">
              <Tooltip content="新增合集" size="sm">
                <Button isIconOnly size="sm" variant="light" onPress={handleCreateNew}>
                  <Plus size={16} />
                </Button>
              </Tooltip>
              <Tooltip content="刷新" size="sm">
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onPress={fetchCollectionList}
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
                placeholder="搜索合集名称"
                className="w-full sm:w-56"
                value={searchKeyword}
                onValueChange={setSearchKeyword}
                onKeyDown={handleSearchKeyDown}
                startContent={<Search size={14} className="text-default-400" />}
                isClearable
                onClear={() => {
                  setSearchKeyword('')
                  setQueryParams((prev) => ({ ...prev, collectionName: undefined }))
                }}
              />
              <Select
                size="sm"
                placeholder="合集状态"
                className="w-full sm:w-28"
                aria-label="合集状态筛选"
                selectedKeys={queryParams.status ? [String(queryParams.status)] : []}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string | undefined
                  handleQueryChange(
                    'status',
                    value ? (Number(value) as DocVideoCollectionStatus) : undefined
                  )
                }}
              >
                {DOC_VIDEO_COLLECTION_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={String(option.value)} textValue={option.label}>
                    {option.label}
                  </SelectItem>
                ))}
              </Select>
              <Select
                size="sm"
                placeholder="删除状态"
                className="w-full sm:w-28"
                aria-label="删除状态筛选"
                selectedKeys={queryParams.deleted !== undefined ? [String(queryParams.deleted)] : []}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string | undefined
                  handleQueryChange(
                    'deleted',
                    value !== undefined ? (Number(value) as 0 | 1) : undefined
                  )
                }}
              >
                {DOC_VIDEO_COLLECTION_DELETED_OPTIONS.map((option) => (
                  <SelectItem key={String(option.value)} textValue={option.label}>
                    {option.label}
                  </SelectItem>
                ))}
              </Select>
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
                </div>
              )}
            </div>
          </div>

          {/* 合集列表表格 */}
          <div className="flex-1 p-3 overflow-auto">
            {isLoading ? (
              <StatusState type="loading" scene="admin" />
            ) : (
              <Table
                aria-label="合集列表"
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
                  <TableColumn key="collectionName">合集名称</TableColumn>
                  <TableColumn key="description" className="hidden md:table-cell">
                    描述
                  </TableColumn>
                  <TableColumn key="status">状态</TableColumn>
                  <TableColumn key="createTime" className="hidden xl:table-cell">
                    创建时间
                  </TableColumn>
                  <TableColumn key="updateTime" className="hidden xl:table-cell">
                    更新时间
                  </TableColumn>
                  <TableColumn key="actions">操作</TableColumn>
                </TableHeader>
                <TableBody
                  items={collectionList.map((item) => ({ ...item, key: item.id }))}
                  emptyContent={<StatusState type="empty" scene="admin" />}
                >
                  {(item) => (
                    <TableRow key={item.id}>
                      {/* 合集封面 */}
                      <TableCell>
                        {item.coverImage ? (
                          <Image
                            src={item.coverImage}
                            alt={item.collectionName}
                            className="w-16 h-10 object-cover rounded"
                            classNames={{ wrapper: 'w-16 h-10' }}
                          />
                        ) : (
                          <div className="w-16 h-10 bg-default-100 rounded flex items-center justify-center">
                            <ImageIcon size={16} className="text-default-400" />
                          </div>
                        )}
                      </TableCell>

                      {/* 合集名称 */}
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm max-w-32 truncate">
                            {item.collectionName}
                          </span>
                        </div>
                      </TableCell>

                      {/* 合集描述 */}
                      <TableCell className="hidden md:table-cell">
                        <span className="text-sm text-default-500 max-w-48 truncate block">
                          {item.description || '-'}
                        </span>
                      </TableCell>

                      {/* 状态 */}
                      <TableCell>
                        <Switch
                          size="sm"
                          color="primary"
                          isSelected={item.status === 1}
                          onValueChange={() => handleToggleStatus(item)}
                          aria-label="合集状态"
                        />
                      </TableCell>

                      {/* 创建时间 */}
                      <TableCell className="hidden xl:table-cell">
                        <span className="text-sm">
                          {item.createTime ? formatDateTime(item.createTime) : '-'}
                        </span>
                      </TableCell>

                      {/* 更新时间 */}
                      <TableCell className="hidden xl:table-cell">
                        <span className="text-sm">
                          {item.updateTime ? formatDateTime(item.updateTime) : '-'}
                        </span>
                      </TableCell>

                      {/* 操作按钮 */}
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {/* 查看详情 */}
                          <Tooltip content="查看详情" size="sm">
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              onPress={() => handleOpenDetail(item)}
                            >
                              <Eye size={14} />
                            </Button>
                          </Tooltip>
                          {/* 编辑 */}
                          <Tooltip content="编辑合集" size="sm">
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              onPress={() => handleEditCollection(item)}
                            >
                              <Pencil size={14} />
                            </Button>
                          </Tooltip>
                          {/* 删除 */}
                          <Tooltip content="删除" size="sm">
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              color="danger"
                              onPress={() => handleDeleteCollection([item.id])}
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

      {/* 合集表单弹窗（新增/编辑） */}
      <CollectionFormModal
        isOpen={formModal.isOpen}
        onOpenChange={formModal.onOpenChange}
        collectionData={editingCollection}
        onSuccess={fetchCollectionList}
      />

      {/* 合集详情弹窗 */}
      <CollectionDetailModal
        isOpen={detailModal.isOpen}
        onOpenChange={detailModal.onOpenChange}
        collectionId={detailCollectionId}
        onEdit={(collection) => {
          detailModal.onClose()
          setEditingCollection(collection)
          formModal.onOpen()
        }}
        onRefresh={fetchCollectionList}
      />

      {/* 批量删除确认弹窗 */}
      <BatchDeleteModal
        isOpen={deleteModal.isOpen}
        onOpenChange={deleteModal.onOpenChange}
        ids={Array.from(selectedKeys)}
        onConfirm={() => {
          handleDeleteCollection(Array.from(selectedKeys))
          setSelectedKeys(new Set())
        }}
      />
    </div>
  )
}
