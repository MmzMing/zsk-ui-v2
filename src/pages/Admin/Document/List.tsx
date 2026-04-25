/**
 * 后台-文档列表页面
 *
 * 工具栏 + 表格布局：
 * - 顶部工具栏：搜索框（文档标题）、状态筛选、审核状态筛选、分类筛选、新增按钮、刷新按钮
 * - 中部表格：文档列表，支持多选批量操作
 * - 底部：后端分页控件
 * - 弹窗：编辑文档（含图片上传/裁剪）、批量删除确认
 *
 * 核心交互：
 * - 搜索/筛选 → 调用后端分页接口刷新列表
 * - 编辑 → 弹窗表单，支持图片裁剪上传
 * - 批量操作 → 批量删除、批量上架/下架、批量迁移分类
 * - 状态切换 → 置顶、推荐切换
 */

// ===== 1. 依赖导入区域 =====

// React 核心
import { useState, useEffect, useCallback, useRef } from 'react'

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
  Pagination,
  Avatar,
  Textarea,
  Switch,
  Spinner,
  Image
} from '@heroui/react'

// 图标（Lucide React）
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
  Upload
} from 'lucide-react'

// 工具函数
import { toast } from '@/utils/toast'
import { formatDateTime } from '@/utils/format'

// 通用状态组件
import { StatusState } from '@/components/ui/StatusState'

// 图片裁剪组件
import ImageCropModal from '@/components/ui/image-crop/ImageCropModal'

// 常量配置
import { PAGINATION } from '@/constants'

// API 接口
import {
  getDocNotePage,
  updateDocNote,
  deleteDocNote,
  batchUpdateDocNoteStatus,
  toggleDocNotePinned,
  toggleDocNoteRecommended
} from '@/api/admin/document'
import { uploadDocFile } from '@/api/admin/file'

// 类型定义
import type {
  DocNote,
  DocNoteQueryParams,
  DocNoteUpdateInput,
  DocNoteStatus,
  DocAuditStatus
} from '@/types/document.types'
import {
  DOC_NOTE_STATUS_OPTIONS,
  DOC_AUDIT_STATUS_OPTIONS
} from '@/types/document.types'

// ===== 2. TODO待处理导入区域 =====

// ===== 3. 常量定义区域 =====

// 使用 constants 中定义的分页常量
const DEFAULT_PAGE_SIZE = PAGINATION.DEFAULT_PAGE_SIZE as number
const PAGE_SIZE_OPTIONS = [...PAGINATION.PAGE_SIZE_OPTIONS] as number[]

// 图片上传限制
const MAX_IMAGE_SIZE = 3 * 1024 * 1024 // 3MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

// ===== 4. 通用工具函数区域 =====

/**
 * 获取文档状态的显示标签
 *
 * @param status - 文档状态枚举值
 * @returns 对应的中文标签
 */
function getDocStatusLabel(status: DocNoteStatus): string {
  const option = DOC_NOTE_STATUS_OPTIONS.find(o => o.value === status)
  return option?.label ?? String(status)
}

/**
 * 获取文档状态对应的 Chip 颜色
 *
 * @param status - 文档状态枚举值
 * @returns Chip 颜色
 */
function getDocStatusColor(status: DocNoteStatus): 'success' | 'warning' | 'danger' {
  const colorMap: Record<number, 'success' | 'warning' | 'danger'> = {
    1: 'success',
    2: 'danger',
    3: 'warning'
  }
  return colorMap[status] ?? 'default'
}

/**
 * 获取审核状态的显示标签
 *
 * @param auditStatus - 审核状态枚举值
 * @returns 对应的中文标签
 */
function getAuditStatusLabel(auditStatus: DocAuditStatus): string {
  const option = DOC_AUDIT_STATUS_OPTIONS.find(o => o.value === auditStatus)
  return option?.label ?? String(auditStatus)
}

/**
 * 获取审核状态对应的 Chip 颜色
 *
 * @param auditStatus - 审核状态枚举值
 * @returns Chip 颜色
 */
function getAuditStatusColor(auditStatus: DocAuditStatus): 'warning' | 'success' | 'danger' {
  const colorMap: Record<number, 'warning' | 'success' | 'danger'> = {
    0: 'warning',
    1: 'success',
    2: 'danger'
  }
  return colorMap[auditStatus] ?? 'default'
}

/**
 * 验证图片文件是否合法
 *
 * @param file - 待验证的文件
 * @returns 验证结果，合法返回 null，不合法返回错误信息
 */
function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return '仅支持 JPG、PNG、WebP 格式的图片'
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return '图片大小不能超过 3MB'
  }
  return null
}

// ===== 5. 子组件区域 =====

/**
 * 文档编辑弹窗组件
 *
 * 支持编辑文档信息：
 * - 上方：封面图片区域（悬停显示"点击修改"，点击后弹出裁剪弹窗）
 * - 下方：文档信息表单
 * - 图片上传流程：选择文件 → 裁剪弹窗 → 上传 → 获取 fileId → 表单提交
 */
interface DocEditModalProps {
  /** 弹窗是否打开 */
  isOpen: boolean
  /** 弹窗打开/关闭状态变更回调 */
  onOpenChange: (open: boolean) => void
  /** 编辑模式下的原始文档数据 */
  docData: DocNote | null
  /** 操作成功后的回调 */
  onSuccess: () => void
}

function DocEditModal({ isOpen, onOpenChange, docData, onSuccess }: DocEditModalProps) {
  // ===== 状态控制逻辑区域 =====

  // 表单数据状态
  const [formData, setFormData] = useState<DocNoteUpdateInput>({
    id: '',
    noteName: '',
    noteTags: '',
    description: '',
    coverFileId: '',
    cover: '',
    broadCode: '',
    narrowCode: '',
    noteGrade: undefined,
    noteMode: undefined,
    suitableUsers: '',
    status: 1,
    auditStatus: 0,
    isPinned: 0,
    isRecommended: 0,
    seoTitle: '',
    seoDescription: '',
    seoKeywords: ''
  })

  // 提交加载状态
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 图片上传相关状态
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [uploadError, setUploadError] = useState('')
  const [coverPreviewUrl, setCoverPreviewUrl] = useState('')

  // 图片裁剪弹窗控制
  const cropModal = useDisclosure()
  const [cropFile, setCropFile] = useState<File | null>(null)

  // 文件输入引用（用于触发文件选择）
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ===== 页面初始化与事件绑定 =====

  /**
   * 弹窗打开时初始化表单数据
   * 编辑模式：回填当前文档数据
   */
  useEffect(() => {
    if (isOpen && docData) {
      setFormData({
        id: docData.id,
        noteName: docData.noteName,
        noteTags: docData.noteTags ?? '',
        description: docData.description ?? '',
        coverFileId: docData.coverFile?.fileId ?? '',
        cover: docData.coverFile?.fileUrl ?? '',
        broadCode: docData.broadCode ?? '',
        narrowCode: docData.narrowCode ?? '',
        noteGrade: docData.noteGrade,
        noteMode: docData.noteMode,
        suitableUsers: docData.suitableUsers ?? '',
        status: docData.status,
        auditStatus: docData.auditStatus,
        isPinned: docData.isPinned,
        isRecommended: docData.isRecommended,
        seoTitle: docData.seoTitle ?? '',
        seoDescription: docData.seoDescription ?? '',
        seoKeywords: docData.seoKeywords ?? ''
      })
      setCoverPreviewUrl(docData.coverFile?.fileUrl ?? '')
    }
  }, [isOpen, docData])

  /**
   * 弹窗关闭时重置状态
   */
  useEffect(() => {
    if (!isOpen) {
      setUploadProgress(0)
      setIsUploading(false)
      setCropFile(null)
    }
  }, [isOpen])

  // ===== 通用工具函数区域 =====

  /**
   * 更新表单指定字段的值
   */
  const handleFieldChange = useCallback(<K extends keyof DocNoteUpdateInput>(key: K, value: DocNoteUpdateInput[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }, [])

  // ===== 数据处理函数区域 =====

  /**
   * 处理文件选择
   * 验证文件后打开裁剪弹窗
   */
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 验证文件
    const error = validateImageFile(file)
    if (error) {
      toast.error(error)
      return
    }

    // 设置裁剪文件并打开裁剪弹窗
    setCropFile(file)
    cropModal.onOpen()

    // 清空 input 值，允许重复选择同一文件
    e.target.value = ''
  }, [cropModal])

  /**
   * 处理修改图片（从现有URL加载并裁剪）
   * 将现有图片URL转换为File对象后打开裁剪弹窗
   */
  const handleEditImage = useCallback(async () => {
    if (!coverPreviewUrl) return

    try {
      // 从URL获取图片并转换为Blob
      const response = await fetch(coverPreviewUrl)
      if (!response.ok) {
        throw new Error('图片获取失败')
      }
      const blob = await response.blob()
      
      // 提取文件名
      const urlParts = coverPreviewUrl.split('/')
      const fileName = urlParts[urlParts.length - 1] || 'cover.jpg'
      
      // 转换为File对象
      const file = new File([blob], fileName, { type: blob.type })

      // 设置裁剪文件并打开裁剪弹窗
      setCropFile(file)
      cropModal.onOpen()
    } catch (error) {
      const message = error instanceof Error ? error.message : '图片加载失败'
      toast.error(message)
      console.error('修改图片失败：', error)
    }
  }, [coverPreviewUrl, cropModal])

  /**
   * 处理图片裁剪完成
   * 点击确认后立即关闭裁剪弹窗，然后异步上传文件
   */
  const handleCropComplete = useCallback(async (file: File) => {
    // 立即关闭裁剪弹窗
    cropModal.onClose()
    
    // 设置上传状态，显示加载动画
    setIsUploading(true)
    setUploadProgress(30)
    setUploadStatus('uploading')
    setUploadError('')

    try {
      // 异步上传文件到服务器
      setUploadProgress(60)
      const uploadedFile = await uploadDocFile(file)
      
      
      if (!uploadedFile || !uploadedFile.id) {
        throw new Error('上传失败，未返回文件ID')
      }

      setUploadProgress(100)
      setUploadStatus('success')

      // 更新表单数据
      setFormData(prev => ({
        ...prev,
        coverFileId: uploadedFile.id,
        cover: uploadedFile.fileUrl
      }))
      
      // 设置预览图片（后端返回的URL替换上传位置）
      setCoverPreviewUrl(uploadedFile.fileUrl)

      toast.success('图片上传成功')
    } catch (error) {
      const message = error instanceof Error ? error.message : '图片上传失败'
      setUploadProgress(0)
      setUploadStatus('error')
      setUploadError(message)
      toast.error(message)
      console.error('图片上传失败：', error)
    } finally {
      setIsUploading(false)
    }
  }, [cropModal])

  /**
   * 触发文件选择
   */
  const triggerFileSelect = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  /**
   * 提交表单数据
   * 校验必填项后调用修改接口
   */
  const handleSubmit = useCallback(async () => {
    // 校验必填项
    if (!formData.noteName?.trim()) {
      toast.warning('请输入文档标题')
      return
    }
    if (!formData.broadCode?.trim()) {
      toast.warning('请输入分类编码')
      return
    }
    if (!formData.coverFileId) {
      toast.warning('请上传封面图片')
      return
    }

    setIsSubmitting(true)
    try {
      const updateData: DocNoteUpdateInput = {
        id: formData.id,
        noteName: formData.noteName,
        noteTags: formData.noteTags || undefined,
        description: formData.description || undefined,
        coverFileId: formData.coverFileId,
        cover: formData.cover || undefined,
        broadCode: formData.broadCode,
        narrowCode: formData.narrowCode || undefined,
        noteGrade: formData.noteGrade,
        noteMode: formData.noteMode,
        suitableUsers: formData.suitableUsers || undefined,
        status: formData.status,
        auditStatus: formData.auditStatus,
        isPinned: formData.isPinned,
        isRecommended: formData.isRecommended,
        seoTitle: formData.seoTitle || undefined,
        seoDescription: formData.seoDescription || undefined,
        seoKeywords: formData.seoKeywords || undefined
      }

      await updateDocNote(updateData)
      toast.success('文档修改成功')
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : '操作失败，请稍后重试'
      toast.error(message)
      console.error('文档修改失败：', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, onSuccess, onOpenChange])

  // ===== UI渲染逻辑区域 =====

  return (
    <>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="3xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center gap-2">
              <Pencil size={18} className="text-primary" />
              <span>编辑文档</span>
            </div>
          </ModalHeader>
          <ModalBody className="gap-6">
            {/* 封面图片区域 */}
            <div className="flex flex-col items-center gap-3">
              <div
                className="relative w-full max-w-md aspect-[4/3] rounded-lg overflow-hidden border-2 border-dashed border-default-300 hover:border-primary transition-colors cursor-pointer group"
              >
                {coverPreviewUrl ? (
                  <>
                    <div className="relative w-full h-full">
                      <Image
                        src={coverPreviewUrl}
                        alt="文档封面"
                        className="w-full h-full object-cover"
                        classNames={{
                          wrapper: 'w-full h-full'
                        }}
                      />
                      {/* 悬停遮罩 - 显示两个按钮 */}
                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 z-10">
                        <div className="flex items-center gap-3">
                          <Button
                            size="sm"
                            variant="solid"
                            color="success"
                            className="opacity-70 hover:opacity-100 transition-opacity duration-200"
                            startContent={<Pencil size={16} />}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditImage()
                            }}
                          >
                            修改
                          </Button>
                          <Button
                            size="sm"
                            variant="solid"
                            color="primary"
                            className="opacity-70 hover:opacity-100 transition-opacity duration-200"
                            startContent={<Upload size={16} />}
                            onClick={(e) => {
                              e.stopPropagation()
                              triggerFileSelect()
                            }}
                          >
                            上传
                          </Button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div 
                    className="w-full h-full flex flex-col items-center justify-center text-default-400"
                    onClick={triggerFileSelect}
                  >
                    <Upload size={32} className="mb-2" />
                    <span className="text-sm">点击上传封面图片</span>
                    <span className="text-xs mt-1">支持 JPG、PNG、WebP，最大 3MB</span>
                  </div>
                )}

                {/* 上传进度（遮罩层） */}
                {isUploading && (
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-20">
                    <Spinner size="md" color="primary" />
                    <span className="text-white text-sm mt-2">上传中... {uploadProgress}%</span>
                  </div>
                )}
              </div>

              {/* 上传进度条（始终显示） */}
              <div className="w-full max-w-md">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-default-500">
                    {uploadStatus === 'success' ? '上传成功' : uploadStatus === 'error' ? '上传失败' : '上传状态'}
                  </span>
                  <span className="text-xs text-default-500">{uploadProgress}%</span>
                </div>
                <div className="relative h-2 bg-default-200 rounded-full overflow-hidden">
                  <div
                    className={`absolute left-0 top-0 h-full rounded-full transition-all duration-300 ${
                      uploadStatus === 'success'
                        ? 'bg-success'
                        : uploadStatus === 'error'
                        ? 'bg-danger'
                        : 'bg-primary'
                    }`}
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                {uploadStatus === 'error' && uploadError && (
                  <p className="text-xs text-danger mt-1">{uploadError}</p>
                )}
              </div>

              {/* 隐藏的文件输入 */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>

            {/* 文档信息表单 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="文档标题"
                placeholder="请输入文档标题"
                isRequired
                value={formData.noteName}
                onValueChange={v => handleFieldChange('noteName', v)}
              />
              <Input
                label="分类编码"
                placeholder="请输入分类编码"
                isRequired
                value={formData.broadCode}
                onValueChange={v => handleFieldChange('broadCode', v)}
              />
              <Input
                label="小类编码"
                placeholder="请输入小类编码"
                value={formData.narrowCode ?? ''}
                onValueChange={v => handleFieldChange('narrowCode', v)}
              />
              <Input
                label="标签"
                placeholder="多个标签用逗号分隔"
                value={formData.noteTags ?? ''}
                onValueChange={v => handleFieldChange('noteTags', v)}
              />
              <Input
                label="适合人群"
                placeholder="请输入适合人群"
                value={formData.suitableUsers ?? ''}
                onValueChange={v => handleFieldChange('suitableUsers', v)}
              />
              <Input
                label="笔记等级"
                placeholder="请输入笔记等级"
                type="number"
                value={formData.noteGrade?.toString() ?? ''}
                onValueChange={v => handleFieldChange('noteGrade', v ? Number(v) : undefined)}
              />
              <Select
                label="文档状态"
                placeholder="请选择状态"
                selectedKeys={formData.status ? [String(formData.status)] : []}
                onSelectionChange={keys => {
                  const value = Array.from(keys)[0] as string
                  handleFieldChange('status', Number(value) as DocNoteStatus)
                }}
              >
                {DOC_NOTE_STATUS_OPTIONS.map(option => (
                  <SelectItem key={String(option.value)} textValue={option.label}>{option.label}</SelectItem>
                ))}
              </Select>
              <Select
                label="审核状态"
                placeholder="请选择审核状态"
                selectedKeys={formData.auditStatus !== undefined ? [String(formData.auditStatus)] : []}
                onSelectionChange={keys => {
                  const value = Array.from(keys)[0] as string
                  handleFieldChange('auditStatus', Number(value) as DocAuditStatus)
                }}
              >
                {DOC_AUDIT_STATUS_OPTIONS.map(option => (
                  <SelectItem key={String(option.value)} textValue={option.label}>{option.label}</SelectItem>
                ))}
              </Select>
              <Input
                label="SEO标题"
                placeholder="请输入SEO标题"
                value={formData.seoTitle ?? ''}
                onValueChange={v => handleFieldChange('seoTitle', v)}
              />
              <Input
                label="SEO关键词"
                placeholder="多个关键词用逗号分隔"
                value={formData.seoKeywords ?? ''}
                onValueChange={v => handleFieldChange('seoKeywords', v)}
              />
            </div>

            <Textarea
              label="文档简介"
              placeholder="请输入文档简介"
              value={formData.description ?? ''}
              onValueChange={v => handleFieldChange('description', v)}
              maxRows={3}
            />

            <Textarea
              label="SEO描述"
              placeholder="请输入SEO描述"
              value={formData.seoDescription ?? ''}
              onValueChange={v => handleFieldChange('seoDescription', v)}
              maxRows={3}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={() => onOpenChange(false)}>
              取消
            </Button>
            <Button
              color="primary"
              isLoading={isSubmitting}
              isDisabled={!formData.coverFileId}
              onPress={handleSubmit}
            >
              保存
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* 图片裁剪弹窗 */}
      <ImageCropModal
        isOpen={cropModal.isOpen}
        onClose={cropModal.onClose}
        file={cropFile}
        aspect={4 / 3}
        compressionOptions={{
          maxSizeMB: 3,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          initialQuality: 0.8
        }}
        onCropComplete={handleCropComplete}
        title="裁剪封面图片"
        confirmText="确认并上传"
        cancelText="取消"
      />
    </>
  )
}

/**
 * 批量删除确认弹窗组件
 */
interface BatchDeleteModalProps {
  /** 弹窗是否打开 */
  isOpen: boolean
  /** 弹窗打开/关闭状态变更回调 */
  onOpenChange: (open: boolean) => void
  /** 待删除的文档ID列表 */
  ids: string[]
  /** 确认删除后的回调 */
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
          <Button
            color="danger"
            isLoading={isDeleting}
            onPress={handleConfirm}
          >
            确认删除
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

/**
 * 批量状态更新弹窗组件
 */
interface BatchStatusModalProps {
  /** 弹窗是否打开 */
  isOpen: boolean
  /** 弹窗打开/关闭状态变更回调 */
  onOpenChange: (open: boolean) => void
  /** 待更新的文档ID列表 */
  ids: string[]
  /** 确认更新后的回调 */
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
            onSelectionChange={keys => {
              const value = Array.from(keys)[0] as 'published' | 'offline'
              setTargetStatus(value)
            }}
          >
            <SelectItem key="published" textValue="发布">发布</SelectItem>
            <SelectItem key="offline" textValue="下架">下架</SelectItem>
          </Select>
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={() => onOpenChange(false)}>
            取消
          </Button>
          <Button
            color="primary"
            isLoading={isSubmitting}
            onPress={handleConfirm}
          >
            确认更新
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

// ===== 11. 导出区域 =====

/**
 * 文档列表主页面组件
 *
 * 页面布局：
 * - 顶部工具栏：搜索、筛选、操作按钮
 * - 中部表格：文档列表
 * - 底部分页：后端分页控件
 *
 * 数据流：
 * - getDocNotePage → docList → 表格展示
 * - 搜索/筛选 → 更新 queryParams → 重新请求后端
 */
export default function DocumentList() {
  // ===== 3. 状态控制逻辑区域 =====

  /** 文档列表数据 */
  const [docList, setDocList] = useState<DocNote[]>([])
  /** 列表加载状态 */
  const [isLoading, setIsLoading] = useState(false)
  /** 表格多选选中的行 key 集合 */
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())
  /** 查询参数 */
  const [queryParams, setQueryParams] = useState<DocNoteQueryParams>({})
  /** 分页参数 */
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  /** 总条数 */
  const [total, setTotal] = useState(0)
  /** 总页数 */
  const [totalPages, setTotalPages] = useState(0)

  /** 编辑弹窗控制 */
  const editModal = useDisclosure()
  /** 编辑中的文档数据 */
  const [editingDoc, setEditingDoc] = useState<DocNote | null>(null)

  /** 批量删除弹窗控制 */
  const deleteModal = useDisclosure()

  /** 批量状态更新弹窗控制 */
  const statusModal = useDisclosure()

  /** 搜索关键词输入 */
  const [searchKeyword, setSearchKeyword] = useState('')

  // ===== 6. 错误处理函数区域 =====

  /**
   * 获取文档列表数据
   * 后端分页接口，传入页码和每页大小
   */
  const fetchDocList = useCallback(async () => {
    setIsLoading(true)
    try {
      const params: DocNoteQueryParams = {
        ...queryParams,
        pageNum: page,
        pageSize
      }
      const data = await getDocNotePage(params)

      // 添加防御性检查，确保数据结构正确
      if (data && data.list) {
        setDocList(data.list)
        setTotal(data.total || 0)
        // 计算总页数
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
   * 删除文档
   * 支持批量删除（逗号分隔的 ID 列表）
   *
   * @param ids - 待删除的文档 ID 数组
   */
  const handleDeleteDoc = useCallback(async (ids: string[]) => {
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
  }, [fetchDocList])

  /**
   * 切换文档置顶状态
   *
   * @param id - 文档ID
   */
  const handleTogglePinned = useCallback(async (id: string) => {
    try {
      await toggleDocNotePinned(id)
      toast.success('置顶状态切换成功')
      fetchDocList()
    } catch (error) {
      const message = error instanceof Error ? error.message : '置顶状态切换失败'
      toast.error(message)
      console.error('切换置顶状态失败：', error)
    }
  }, [fetchDocList])

  /**
   * 切换文档推荐状态
   *
   * @param id - 文档ID
   */
  const handleToggleRecommended = useCallback(async (id: string) => {
    try {
      await toggleDocNoteRecommended(id)
      toast.success('推荐状态切换成功')
      fetchDocList()
    } catch (error) {
      const message = error instanceof Error ? error.message : '推荐状态切换失败'
      toast.error(message)
      console.error('切换推荐状态失败：', error)
    }
  }, [fetchDocList])

  // ===== 9. 页面初始化与事件绑定 =====

  /** 页面挂载时和参数变化时加载文档列表 */
  useEffect(() => {
    fetchDocList()
  }, [fetchDocList])

  /**
   * 打开编辑文档弹窗
   * 回填当前文档数据到表单
   */
  const handleEditDoc = useCallback((doc: DocNote) => {
    setEditingDoc(doc)
    editModal.onOpen()
  }, [editModal])

  /**
   * 批量删除选中的文档
   */
  const handleBatchDelete = useCallback(() => {
    if (selectedKeys.size === 0) {
      toast.warning('请选择要删除的文档')
      return
    }
    deleteModal.onOpen()
  }, [selectedKeys, deleteModal])

  /**
   * 批量更新状态
   */
  const handleBatchStatus = useCallback(() => {
    if (selectedKeys.size === 0) {
      toast.warning('请选择要更新状态的文档')
      return
    }
    statusModal.onOpen()
  }, [selectedKeys, statusModal])

  /** 执行搜索（将搜索关键词同步到查询参数） */
  const handleSearch = useCallback(() => {
    setQueryParams(prev => ({
      ...prev,
      noteName: searchKeyword.trim() || undefined
    }))
    setPage(1)
  }, [searchKeyword])

  /** 搜索框回车触发搜索 */
  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }, [handleSearch])

  /** 更新查询参数中的指定字段 */
  const handleQueryChange = useCallback(<K extends keyof DocNoteQueryParams>(key: K, value: DocNoteQueryParams[K]) => {
    setQueryParams(prev => ({ ...prev, [key]: value }))
    setPage(1)
  }, [])

  /** 重置查询条件 */
  const handleResetQuery = useCallback(() => {
    setQueryParams({})
    setSearchKeyword('')
    setPage(1)
  }, [])

  /**
   * 分页大小变更
   */
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
          {/* 顶部标题栏 */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-divider">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-primary" />
              <span className="font-semibold text-sm">文档管理</span>
            </div>
            <div className="flex items-center gap-1">
              <Tooltip content="新增文档" size="sm">
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onPress={() => {
                    // 新增文档功能，先跳转或提示
                    toast.info('新增文档功能开发中')
                  }}
                >
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
                  setQueryParams(prev => ({ ...prev, noteName: undefined }))
                }}
              />
              <Select
                size="sm"
                placeholder="文档状态"
                className="w-full sm:w-28"
                aria-label="文档状态筛选"
                selectedKeys={queryParams.status ? [String(queryParams.status)] : []}
                onSelectionChange={keys => {
                  const value = Array.from(keys)[0] as string | undefined
                  handleQueryChange('status', value ? Number(value) as DocNoteStatus : undefined)
                }}
              >
                {DOC_NOTE_STATUS_OPTIONS.map(option => (
                  <SelectItem key={String(option.value)} textValue={option.label}>{option.label}</SelectItem>
                ))}
              </Select>
              <Select
                size="sm"
                placeholder="审核状态"
                className="w-full sm:w-28"
                aria-label="审核状态筛选"
                selectedKeys={queryParams.auditStatus !== undefined ? [String(queryParams.auditStatus)] : []}
                onSelectionChange={keys => {
                  const value = Array.from(keys)[0] as string | undefined
                  handleQueryChange('auditStatus', value !== undefined ? Number(value) as DocAuditStatus : undefined)
                }}
              >
                {DOC_AUDIT_STATUS_OPTIONS.map(option => (
                  <SelectItem key={String(option.value)} textValue={option.label}>{option.label}</SelectItem>
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
                  <Button
                    size="sm"
                    color="primary"
                    variant="flat"
                    onPress={handleBatchStatus}
                  >
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
                onSelectionChange={keys => setSelectedKeys(keys as Set<string>)}
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
                  <TableColumn key="broadCode" className="hidden md:table-cell">分类</TableColumn>
                  <TableColumn key="noteGrade" className="hidden lg:table-cell">等级</TableColumn>
                  <TableColumn key="suitableUsers" className="hidden xl:table-cell">适合人群</TableColumn>
                  <TableColumn key="status">状态</TableColumn>
                  <TableColumn key="auditStatus" className="hidden md:table-cell">审核</TableColumn>
                  <TableColumn key="createTime" className="hidden xl:table-cell">创建时间</TableColumn>
                  <TableColumn key="publishTime" className="hidden lg:table-cell">发布时间</TableColumn>
                  <TableColumn key="isPinned" className="hidden md:table-cell">置顶</TableColumn>
                  <TableColumn key="isRecommended" className="hidden md:table-cell">推荐</TableColumn>
                  <TableColumn key="actions">操作</TableColumn>
                </TableHeader>
                <TableBody
                  items={docList.map(item => ({ ...item, key: item.id }))}
                  emptyContent={<StatusState type="empty" scene="admin" />}
                >
                  {(item) => (
                    <TableRow key={item.id}>
                      {/* 封面 */}
                      <TableCell>
                        {item.coverFile?.fileUrl ? (
                          <Image
                            src={item.coverFile.fileUrl}
                            alt={item.noteName}
                            className="w-12 h-12 object-cover rounded"
                            classNames={{
                              wrapper: 'w-12 h-12'
                            }}
                            fallbackSrc="https://via.placeholder.com/48?text=No+Cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-default-100 rounded flex items-center justify-center">
                            <FileText size={20} className="text-default-400" />
                          </div>
                        )}
                      </TableCell>

                      {/* 文档标题 */}
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm max-w-32 truncate">{item.noteName}</span>
                          {item.noteTags && (
                            <span className="text-xs text-default-400 truncate max-w-32">{item.noteTags}</span>
                          )}
                        </div>
                      </TableCell>

                      {/* 作者 */}
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

                      {/* 统计数据 */}
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

                      {/* 分类 */}
                      <TableCell className="hidden md:table-cell">
                        <div className="flex flex-col">
                          <span className="text-sm">{item.broadCode || '-'}</span>
                          {item.narrowCode && (
                            <span className="text-xs text-default-400">{item.narrowCode}</span>
                          )}
                        </div>
                      </TableCell>

                      {/* 等级 */}
                      <TableCell className="hidden lg:table-cell">
                        <span className="text-sm">{item.noteGrade ?? '-'}</span>
                      </TableCell>

                      {/* 适合人群 */}
                      <TableCell className="hidden xl:table-cell">
                        <span className="text-sm truncate max-w-24">{item.suitableUsers || '-'}</span>
                      </TableCell>

                      {/* 状态 */}
                      <TableCell>
                        <Chip size="sm" variant="flat" color={getDocStatusColor(item.status)}>
                          {getDocStatusLabel(item.status)}
                        </Chip>
                      </TableCell>

                      {/* 审核状态 */}
                      <TableCell className="hidden md:table-cell">
                        <Chip size="sm" variant="dot" color={getAuditStatusColor(item.auditStatus)}>
                          {getAuditStatusLabel(item.auditStatus)}
                        </Chip>
                      </TableCell>

                      {/* 创建时间 */}
                      <TableCell className="hidden xl:table-cell">
                        <span className="text-sm">
                          {item.createTime ? formatDateTime(item.createTime) : '-'}
                        </span>
                      </TableCell>

                      {/* 发布时间 */}
                      <TableCell className="hidden lg:table-cell">
                        <span className="text-sm">
                          {item.publishTime ? formatDateTime(item.publishTime) : '-'}
                        </span>
                      </TableCell>

                      {/* 置顶 */}
                      <TableCell className="hidden md:table-cell">
                        <Switch
                          size="sm"
                          color="primary"
                          isSelected={item.isPinned === 1}
                          onValueChange={() => handleTogglePinned(item.id)}
                          aria-label="置顶"
                        />
                      </TableCell>

                      {/* 推荐 */}
                      <TableCell className="hidden md:table-cell">
                        <Switch
                          size="sm"
                          color="primary"
                          isSelected={item.isRecommended === 1}
                          onValueChange={() => handleToggleRecommended(item.id)}
                          aria-label="推荐"
                        />
                      </TableCell>

                      {/* 操作 */}
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
                              onPress={() => {
                                // 编辑内容功能开发中
                                toast.info('编辑内容功能开发中')
                              }}
                            >
                              <FileText size={14} />
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

      {/* 文档编辑弹窗 */}
      <DocEditModal
        isOpen={editModal.isOpen}
        onOpenChange={editModal.onOpenChange}
        docData={editingDoc}
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
    </div>
  )
}
