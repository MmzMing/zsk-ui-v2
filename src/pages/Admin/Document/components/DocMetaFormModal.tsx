/**
 * 文档元信息编辑弹窗（可复用）
 *
 * 用于「列表-编辑」、「编辑器-提交」两类场景：
 * - 编辑模式 (mode=edit)：仅更新元信息，调用 PUT /docNote
 * - 聚合模式 (mode=aggregate)：返回完整表单结果，由父组件决定调用 createDocNoteAggregate 或 updateDocNoteAggregate
 *
 * 表单结构与字段与 List 页保持一致：
 * - 上方：封面图（裁剪后上传）
 * - 下方：基础信息 + SEO 字段
 */

// React
import { useState, useEffect, useCallback, useRef } from 'react'

// HeroUI
import {
  Button,
  Input,
  Select,
  SelectItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Textarea,
  Switch,
  Spinner,
  Image,
} from '@heroui/react'

// 图标
import { Pencil, Upload } from 'lucide-react'

// 工具
import { toast } from '@/utils/toast'

// 图片裁剪
import ImageCropModal from '@/components/ui/image-crop/ImageCropModal'

// API
import { updateDocNote } from '@/api/admin/document'
import { uploadDocFile } from '@/api/admin/file'

// 类型
import type {
  DocNote,
  DocNoteUpdateInput,
  DocNoteStatus,
  DocAuditStatus,
  DocNoteAggregateMeta,
} from '@/types/document.types'
import {
  DOC_NOTE_STATUS_OPTIONS,
  DOC_AUDIT_STATUS_OPTIONS,
} from '@/types/document.types'

// ===== 常量 =====

/** 图片上传大小上限（3MB） */
const MAX_IMAGE_SIZE = 3 * 1024 * 1024
/** 允许的图片 MIME 类型 */
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

// ===== 工具函数 =====

/**
 * 校验封面图片是否合法
 *
 * @param file - 待校验的文件
 * @returns 错误信息，合法返回 null
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

/** 表单状态（与 DocNoteUpdateInput 同形态） */
type DocMetaFormState = DocNoteUpdateInput & { cover?: string }

/** 默认空表单 */
function buildEmptyForm(): DocMetaFormState {
  return {
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
    status: 3,
    auditStatus: 0,
    isPinned: 0,
    isRecommended: 0,
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
  }
}

/**
 * 由现有文档数据生成表单初值
 */
function buildFormFromDoc(doc: DocNote): DocMetaFormState {
  return {
    id: doc.id,
    noteName: doc.noteName,
    noteTags: doc.noteTags ?? '',
    description: doc.description ?? '',
    coverFileId: doc.coverFile?.fileId ?? '',
    cover: doc.coverFile?.fileUrl ?? '',
    broadCode: doc.broadCode ?? '',
    narrowCode: doc.narrowCode ?? '',
    noteGrade: doc.noteGrade,
    noteMode: doc.noteMode,
    suitableUsers: doc.suitableUsers ?? '',
    status: doc.status,
    auditStatus: doc.auditStatus,
    isPinned: doc.isPinned,
    isRecommended: doc.isRecommended,
    seoTitle: doc.seoTitle ?? '',
    seoDescription: doc.seoDescription ?? '',
    seoKeywords: doc.seoKeywords ?? '',
  }
}

// ===== 类型定义 =====

/** 弹窗工作模式 */
export type DocMetaFormMode = 'edit' | 'aggregate'

/** 表单结果（aggregate 模式向父组件回传） */
export interface DocMetaFormResult {
  /** 元信息（与聚合接口一致的字段集合） */
  meta: DocNoteAggregateMeta
}

export interface DocMetaFormModalProps {
  /** 弹窗是否打开 */
  isOpen: boolean
  /** 弹窗状态变更回调 */
  onOpenChange: (open: boolean) => void
  /** 编辑模式下的原始文档数据；为 null 表示新建 */
  docData: DocNote | null
  /**
   * 工作模式：
   * - edit：仅修改元信息，组件内部直接调用 updateDocNote
   * - aggregate：把表单结果返回父组件，由父组件决定后续调用聚合接口
   */
  mode?: DocMetaFormMode
  /** 标题文案，默认根据 mode 推断 */
  title?: string
  /** 确认按钮文案 */
  confirmText?: string
  /**
   * 操作成功回调：
   * - edit：保存成功后回调（无入参）
   * - aggregate：点击确认时回调，入参为表单结果（父组件需自行调接口、关弹窗）
   */
  onSuccess: (result?: DocMetaFormResult) => void
}

// ===== 组件 =====

/**
 * 文档元信息编辑弹窗
 */
export function DocMetaFormModal({
  isOpen,
  onOpenChange,
  docData,
  mode = 'edit',
  title,
  confirmText,
  onSuccess,
}: DocMetaFormModalProps) {
  // ===== 状态 =====
  const [formData, setFormData] = useState<DocMetaFormState>(buildEmptyForm())
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 上传相关
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [uploadError, setUploadError] = useState('')
  const [coverPreviewUrl, setCoverPreviewUrl] = useState('')

  // 图片裁剪
  const cropModal = useDisclosure()
  const [cropFile, setCropFile] = useState<File | null>(null)

  // 文件输入
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ===== 初始化 =====

  /** 弹窗打开时初始化表单数据 */
  useEffect(() => {
    if (isOpen) {
      if (docData) {
        setFormData(buildFormFromDoc(docData))
        setCoverPreviewUrl(docData.coverFile?.fileUrl ?? '')
      } else {
        setFormData(buildEmptyForm())
        setCoverPreviewUrl('')
      }
      setUploadProgress(0)
      setUploadStatus('idle')
      setUploadError('')
    }
  }, [isOpen, docData])

  /** 弹窗关闭时重置上传中状态 */
  useEffect(() => {
    if (!isOpen) {
      setIsUploading(false)
      setCropFile(null)
    }
  }, [isOpen])

  // ===== 工具函数 =====

  /** 更新指定字段 */
  const handleFieldChange = useCallback(
    <K extends keyof DocMetaFormState>(key: K, value: DocMetaFormState[K]) => {
      setFormData((prev) => ({ ...prev, [key]: value }))
    },
    []
  )

  // ===== 封面上传 =====

  /** 选择文件 → 校验 → 打开裁剪弹窗 */
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      const error = validateImageFile(file)
      if (error) {
        toast.error(error)
        return
      }

      setCropFile(file)
      cropModal.onOpen()
      e.target.value = ''
    },
    [cropModal]
  )

  /** 修改现有图片：从 URL 拉取 → 转 File → 打开裁剪 */
  const handleEditImage = useCallback(async () => {
    if (!coverPreviewUrl) return

    try {
      const response = await fetch(coverPreviewUrl)
      if (!response.ok) {
        throw new Error('图片获取失败')
      }
      const blob = await response.blob()
      const urlParts = coverPreviewUrl.split('/')
      const fileName = urlParts[urlParts.length - 1] || 'cover.jpg'
      const file = new File([blob], fileName, { type: blob.type })

      setCropFile(file)
      cropModal.onOpen()
    } catch (error) {
      const message = error instanceof Error ? error.message : '图片加载失败'
      toast.error(message)
      console.error('修改图片失败：', error)
    }
  }, [coverPreviewUrl, cropModal])

  /** 裁剪完成 → 异步上传 */
  const handleCropComplete = useCallback(
    async (file: File) => {
      cropModal.onClose()

      setIsUploading(true)
      setUploadProgress(30)
      setUploadStatus('uploading')
      setUploadError('')

      try {
        setUploadProgress(60)
        const uploadedFile = await uploadDocFile(file)

        if (!uploadedFile || !uploadedFile.id) {
          throw new Error('上传失败，未返回文件ID')
        }

        setUploadProgress(100)
        setUploadStatus('success')

        setFormData((prev) => ({
          ...prev,
          coverFileId: uploadedFile.id,
          cover: uploadedFile.fileUrl,
        }))
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
    },
    [cropModal]
  )

  /** 触发文件选择 */
  const triggerFileSelect = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  // ===== 提交 =====

  /**
   * 提交：
   * - edit 模式：直接调用 updateDocNote
   * - aggregate 模式：组装 meta 后回传给父组件
   */
  const handleSubmit = useCallback(async () => {
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

    if (mode === 'aggregate') {
      const meta: DocNoteAggregateMeta = {
        id: formData.id || undefined,
        noteName: formData.noteName!,
        noteTags: formData.noteTags || undefined,
        description: formData.description || undefined,
        coverFileId: formData.coverFileId || undefined,
        broadCode: formData.broadCode!,
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
        seoKeywords: formData.seoKeywords || undefined,
      }
      onSuccess({ meta })
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
        seoKeywords: formData.seoKeywords || undefined,
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
  }, [formData, mode, onSuccess, onOpenChange])

  // ===== 渲染 =====

  const dialogTitle = title ?? (mode === 'aggregate' ? '完善文档信息' : '编辑文档')
  const submitText = confirmText ?? (mode === 'aggregate' ? '确认提交' : '保存')

  return (
    <>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="3xl" scrollBehavior="inside">
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center gap-2">
              <Pencil size={18} className="text-primary" />
              <span>{dialogTitle}</span>
            </div>
          </ModalHeader>
          <ModalBody className="gap-6">
            {/* 封面图片 */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-full max-w-md aspect-[4/3] rounded-lg overflow-hidden border-2 border-dashed border-default-300 hover:border-primary transition-colors cursor-pointer group">
                {coverPreviewUrl ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={coverPreviewUrl}
                      alt="文档封面"
                      className="w-full h-full object-cover"
                      classNames={{ wrapper: 'w-full h-full' }}
                    />
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

                {isUploading && (
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-20">
                    <Spinner size="md" color="primary" />
                    <span className="text-white text-sm mt-2">上传中... {uploadProgress}%</span>
                  </div>
                )}
              </div>

              {/* 上传进度条 */}
              <div className="w-full max-w-md">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-default-500">
                    {uploadStatus === 'success'
                      ? '上传成功'
                      : uploadStatus === 'error'
                      ? '上传失败'
                      : '上传状态'}
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

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>

            {/* 基础信息 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="文档标题"
                placeholder="请输入文档标题"
                isRequired
                value={formData.noteName}
                onValueChange={(v) => handleFieldChange('noteName', v)}
              />
              <Input
                label="分类编码"
                placeholder="请输入大类编码"
                isRequired
                value={formData.broadCode}
                onValueChange={(v) => handleFieldChange('broadCode', v)}
              />
              <Input
                label="小类编码"
                placeholder="请输入小类编码"
                value={formData.narrowCode ?? ''}
                onValueChange={(v) => handleFieldChange('narrowCode', v)}
              />
              <Input
                label="标签"
                placeholder="多个标签用逗号分隔"
                value={formData.noteTags ?? ''}
                onValueChange={(v) => handleFieldChange('noteTags', v)}
              />
              <Input
                label="适合人群"
                placeholder="请输入适合人群"
                value={formData.suitableUsers ?? ''}
                onValueChange={(v) => handleFieldChange('suitableUsers', v)}
              />
              <Input
                label="笔记等级"
                placeholder="1-入门 2-进阶 3-高级 4-专家"
                type="number"
                value={formData.noteGrade?.toString() ?? ''}
                onValueChange={(v) => handleFieldChange('noteGrade', v ? Number(v) : undefined)}
              />
              <Select
                label="文档状态"
                placeholder="请选择状态"
                selectedKeys={formData.status ? [String(formData.status)] : []}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string
                  handleFieldChange('status', Number(value) as DocNoteStatus)
                }}
              >
                {DOC_NOTE_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={String(option.value)} textValue={option.label}>
                    {option.label}
                  </SelectItem>
                ))}
              </Select>
              <Select
                label="审核状态"
                placeholder="请选择审核状态"
                selectedKeys={formData.auditStatus !== undefined ? [String(formData.auditStatus)] : []}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string
                  handleFieldChange('auditStatus', Number(value) as DocAuditStatus)
                }}
              >
                {DOC_AUDIT_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={String(option.value)} textValue={option.label}>
                    {option.label}
                  </SelectItem>
                ))}
              </Select>
              <Input
                label="SEO标题"
                placeholder="请输入SEO标题"
                value={formData.seoTitle ?? ''}
                onValueChange={(v) => handleFieldChange('seoTitle', v)}
              />
              <Input
                label="SEO关键词"
                placeholder="多个关键词用逗号分隔"
                value={formData.seoKeywords ?? ''}
                onValueChange={(v) => handleFieldChange('seoKeywords', v)}
              />
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  size="sm"
                  isSelected={formData.isPinned === 1}
                  onValueChange={(v) => handleFieldChange('isPinned', v ? 1 : 0)}
                />
                <span className="text-sm">置顶</span>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  size="sm"
                  isSelected={formData.isRecommended === 1}
                  onValueChange={(v) => handleFieldChange('isRecommended', v ? 1 : 0)}
                />
                <span className="text-sm">推荐</span>
              </div>
            </div>

            <Textarea
              label="文档简介"
              placeholder="请输入文档简介"
              value={formData.description ?? ''}
              onValueChange={(v) => handleFieldChange('description', v)}
              maxRows={3}
            />

            <Textarea
              label="SEO描述"
              placeholder="请输入SEO描述"
              value={formData.seoDescription ?? ''}
              onValueChange={(v) => handleFieldChange('seoDescription', v)}
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
              {submitText}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* 图片裁剪 */}
      <ImageCropModal
        isOpen={cropModal.isOpen}
        onClose={cropModal.onClose}
        file={cropFile}
        aspect={4 / 3}
        compressionOptions={{
          maxSizeMB: 3,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          initialQuality: 0.8,
        }}
        onCropComplete={handleCropComplete}
        title="裁剪封面图片"
        confirmText="确认并上传"
        cancelText="取消"
      />
    </>
  )
}

export default DocMetaFormModal
