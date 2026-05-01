/**
 * 视频元信息编辑弹窗
 *
 * 采用左右分栏布局：
 * - 左侧（约40%）：上方封面图片上传区，下方视频上传与预览区
 * - 右侧（约60%）：元信息表单区域
 *
 * 支持编辑模式（修改视频）和新增模式
 */

// ===== 1. 依赖导入区域 =====
import { useState, useEffect, useCallback, useRef } from 'react'

import {
  Button,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Textarea,
  Spinner,
  Image,
  Switch,
} from '@heroui/react'

import { Pencil, Upload, Trash2, Film } from 'lucide-react'

import { toast } from '@/utils/toast'

import ImageCropModal from '@/components/ui/image-crop/ImageCropModal'
import { VideoPlayer } from '@/components/ui/video/VideoPlayer'
import { DictSelect } from '@/components/ui/dict/DictSelect'

import { createDocVideo, updateDocVideo, saveDocVideoDraft } from '@/api/admin/video'
import { uploadDocFile } from '@/api/admin/file'

import { useUserStore } from '@/stores/user'

import type {
  DocVideo,
  DocVideoCreateInput,
  DocVideoUpdateInput,
  DocVideoStatus,
  DocVideoAuditStatus,
  DocVideoDraftInput,
} from '@/types/video.types'

// ===== 2. TODO待处理导入区域 =====

// ===== 3. 状态控制逻辑区域 =====

/** 图片上传大小上限（3MB） */
const MAX_IMAGE_SIZE = 3 * 1024 * 1024
/** 视频上传大小上限（500MB） */
const MAX_VIDEO_SIZE = 500 * 1024 * 1024
/** 允许的图片 MIME 类型 */
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
/** 允许的视频 MIME 类型 */
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/x-msvideo']

// ===== 4. 通用工具函数区域 =====

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

/**
 * 校验视频文件是否合法
 *
 * @param file - 待校验的文件
 * @returns 错误信息，合法返回 null
 */
function validateVideoFile(file: File): string | null {
  if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
    return '仅支持 MP4、MOV、AVI 格式的视频'
  }
  if (file.size > MAX_VIDEO_SIZE) {
    return '视频大小不能超过 500MB'
  }
  return null
}

/** 表单状态 */
interface VideoMetaFormState {
  id: string
  videoTitle: string
  fileId: string
  coverFileId: string
  tags: string
  fileContent: string
  broadCode: string
  narrowCode: string
  metaData: string
  status: DocVideoStatus
  auditStatus: DocVideoAuditStatus
  isPinned: number
  isRecommended: number
  coverUrl: string
  videoUrl: string
}

/** 默认空表单 */
function buildEmptyForm(): VideoMetaFormState {
  return {
    id: '',
    videoTitle: '',
    fileId: '',
    coverFileId: '',
    tags: '',
    fileContent: '',
    broadCode: '',
    narrowCode: '',
    metaData: '',
    status: 1,
    auditStatus: 0,
    isPinned: 0,
    isRecommended: 0,
    coverUrl: '',
    videoUrl: '',
  }
}

/**
 * 由现有视频数据生成表单初值
 */
function buildFormFromVideo(video: DocVideo): VideoMetaFormState {
  return {
    id: video.id,
    videoTitle: video.videoTitle,
    fileId: video.videoFile?.video?.fileId ?? '',
    coverFileId: video.videoFile?.thumbnail?.fileId ?? '',
    tags: video.tags ?? '',
    fileContent: video.fileContent ?? '',
    broadCode: video.broadCode ?? '',
    narrowCode: video.narrowCode ?? '',
    metaData: '',
    status: video.status,
    auditStatus: video.auditStatus,
    isPinned: video.isPinned,
    isRecommended: video.isRecommended,
    coverUrl: video.videoFile?.thumbnail?.fileUrl ?? '',
    videoUrl: video.videoFile?.video?.fileUrl ?? '',
  }
}

// ===== 5. 注释代码函数区 =====

// ===== 6. 错误处理函数区域 =====

// ===== 7. 数据处理函数区域 =====

// ===== 8. UI渲染逻辑区域 =====

export interface VideoMetaFormModalProps {
  /** 弹窗是否打开 */
  isOpen: boolean
  /** 弹窗状态变更回调 */
  onOpenChange: (open: boolean) => void
  /** 编辑模式下的原始视频数据；为 null 表示新建 */
  videoData: DocVideo | null
  /** 操作成功回调 */
  onSuccess: () => void
}

/**
 * 视频元信息编辑弹窗
 */
export function VideoMetaFormModal({
  isOpen,
  onOpenChange,
  videoData,
  onSuccess,
}: VideoMetaFormModalProps) {
  // ===== 状态 =====
  const { userInfo } = useUserStore()
  const [formData, setFormData] = useState<VideoMetaFormState>(buildEmptyForm())
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 封面上传相关
  const [isCoverUploading, setIsCoverUploading] = useState(false)
  const [coverUploadProgress, setCoverUploadProgress] = useState(0)
  const [coverUploadStatus, setCoverUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [coverUploadError, setCoverUploadError] = useState('')

  // 视频上传相关
  const [isVideoUploading, setIsVideoUploading] = useState(false)
  const [videoUploadProgress, setVideoUploadProgress] = useState(0)
  const [videoUploadStatus, setVideoUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [videoUploadError, setVideoUploadError] = useState('')

  // 图片裁剪
  const cropModal = useDisclosure()
  const [cropFile, setCropFile] = useState<File | null>(null)

  // 文件输入
  const coverInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  // ===== 9. 页面初始化与事件绑定 =====

  /** 弹窗打开时初始化表单数据 */
  useEffect(() => {
    if (isOpen) {
      if (videoData) {
        setFormData(buildFormFromVideo(videoData))
      } else {
        setFormData(buildEmptyForm())
      }
      // 重置上传状态
      setCoverUploadProgress(0)
      setCoverUploadStatus('idle')
      setCoverUploadError('')
      setVideoUploadProgress(0)
      setVideoUploadStatus('idle')
      setVideoUploadError('')
    }
  }, [isOpen, videoData])

  /** 弹窗关闭时重置上传中状态 */
  useEffect(() => {
    if (!isOpen) {
      setIsCoverUploading(false)
      setIsVideoUploading(false)
      setCropFile(null)
    }
  }, [isOpen])

  // ===== 工具函数 =====

  /** 更新指定字段 */
  const handleFieldChange = useCallback(
    <K extends keyof VideoMetaFormState>(key: K, value: VideoMetaFormState[K]) => {
      setFormData((prev) => ({ ...prev, [key]: value }))
    },
    []
  )

  // ===== 封面上传 =====

  /** 选择封面文件 → 校验 → 打开裁剪弹窗 */
  const handleCoverFileSelect = useCallback(
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

  /** 修改现有封面图片 */
  const handleEditCoverImage = useCallback(async () => {
    if (!formData.coverUrl) {
      coverInputRef.current?.click()
      return
    }

    try {
      const response = await fetch(formData.coverUrl)
      if (!response.ok) {
        throw new Error('图片获取失败')
      }
      const blob = await response.blob()
      const urlParts = formData.coverUrl.split('/')
      const fileName = urlParts[urlParts.length - 1] || 'cover.jpg'
      const file = new File([blob], fileName, { type: blob.type })

      setCropFile(file)
      cropModal.onOpen()
    } catch (error) {
      const message = error instanceof Error ? error.message : '图片加载失败'
      toast.error(message)
      console.error('修改封面图片失败：', error)
    }
  }, [formData.coverUrl])

  /** 裁剪完成 → 异步上传封面 */
  const handleCoverCropComplete = useCallback(
    async (file: File) => {
      cropModal.onClose()

      setIsCoverUploading(true)
      setCoverUploadProgress(30)
      setCoverUploadStatus('uploading')
      setCoverUploadError('')

      try {
        setCoverUploadProgress(60)
        const uploadedFile = await uploadDocFile(file)

        if (!uploadedFile || !uploadedFile.id) {
          throw new Error('上传失败，未返回文件ID')
        }

        setCoverUploadProgress(100)
        setCoverUploadStatus('success')

        setFormData((prev) => ({
          ...prev,
          coverFileId: uploadedFile.id,
          coverUrl: uploadedFile.fileUrl,
        }))

        toast.success('封面上传成功')
      } catch (error) {
        const message = error instanceof Error ? error.message : '封面上传失败'
        setCoverUploadProgress(0)
        setCoverUploadStatus('error')
        setCoverUploadError(message)
        toast.error(message)
        console.error('封面上传失败：', error)
      } finally {
        setIsCoverUploading(false)
      }
    },
    [cropModal]
  )

  /** 删除已上传封面 */
  const handleDeleteCover = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      coverFileId: '',
      coverUrl: '',
    }))
    setCoverUploadStatus('idle')
    setCoverUploadProgress(0)
  }, [])

  /** 触发封面文件选择 */
  const triggerCoverFileSelect = useCallback(() => {
    coverInputRef.current?.click()
  }, [])

  // ===== 视频上传 =====

  /** 选择视频文件 → 校验 → 上传 */
  const handleVideoFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      const error = validateVideoFile(file)
      if (error) {
        toast.error(error)
        e.target.value = ''
        return
      }

      setIsVideoUploading(true)
      setVideoUploadProgress(10)
      setVideoUploadStatus('uploading')
      setVideoUploadError('')

      try {
        // 使用文件上传接口
        setVideoUploadProgress(50)
        const uploadedFile = await uploadDocFile(file)

        if (!uploadedFile || !uploadedFile.id) {
          throw new Error('上传失败，未返回文件ID')
        }

        setVideoUploadProgress(100)
        setVideoUploadStatus('success')

        setFormData((prev) => ({
          ...prev,
          fileId: uploadedFile.id,
          videoUrl: uploadedFile.fileUrl,
        }))

        toast.success('视频上传成功')
      } catch (error) {
        const message = error instanceof Error ? error.message : '视频上传失败'
        setVideoUploadProgress(0)
        setVideoUploadStatus('error')
        setVideoUploadError(message)
        toast.error(message)
        console.error('视频上传失败：', error)
      } finally {
        setIsVideoUploading(false)
        e.target.value = ''
      }
    },
    []
  )

  /** 删除已上传视频 */
  const handleDeleteVideo = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      fileId: '',
      videoUrl: '',
    }))
    setVideoUploadStatus('idle')
    setVideoUploadProgress(0)
  }, [])

  /** 触发视频文件选择 */
  const triggerVideoFileSelect = useCallback(() => {
    videoInputRef.current?.click()
  }, [])

  // ===== 提交 =====

  /**
   * 表单校验
   */
  const validateForm = useCallback((): boolean => {
    if (!formData.videoTitle?.trim()) {
      toast.warning('请输入视频标题')
      return false
    }
    if (!formData.broadCode?.trim()) {
      toast.warning('请输入大类编码')
      return false
    }
    if (!formData.fileId) {
      toast.warning('请上传视频文件')
      return false
    }
    if (!formData.coverFileId) {
      toast.warning('请上传封面图片')
      return false
    }
    if (formData.metaData) {
      try {
        JSON.parse(formData.metaData)
      } catch {
        toast.warning('元数据必须为合法的 JSON 格式')
        return false
      }
    }
    return true
  }, [formData])

  /**
   * 保存为草稿
   */
  const handleSaveDraft = useCallback(async () => {
    if (!formData.videoTitle?.trim()) {
      toast.warning('请输入视频标题')
      return
    }
    if (!formData.broadCode?.trim()) {
      toast.warning('请输入大类编码')
      return
    }

    setIsSubmitting(true)
    try {
      const draftData: DocVideoDraftInput = {
        userId: videoData?.userId ?? '1',
        videoTitle: formData.videoTitle,
        fileId: formData.fileId || undefined,
        coverFileId: formData.coverFileId || undefined,
        tags: formData.tags || undefined,
        fileContent: formData.fileContent || undefined,
        broadCode: formData.broadCode,
        narrowCode: formData.narrowCode || undefined,
      }

      await saveDocVideoDraft(draftData)
      toast.success('草稿保存成功')
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : '草稿保存失败'
      toast.error(message)
      console.error('保存草稿失败：', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, videoData, onSuccess, onOpenChange])

  const isEditMode = !!videoData

  /**
   * 确认发布（更新视频信息）
   */
  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return

    // 新增模式下需校验用户登录态
    if (!isEditMode && !userInfo?.id) {
      toast.error('用户信息获取失败，请重新登录')
      return
    }

    setIsSubmitting(true)
    try {
      if (isEditMode) {
        const updateData: DocVideoUpdateInput = {
          id: formData.id,
          videoTitle: formData.videoTitle,
          fileId: formData.fileId,
          coverFileId: formData.coverFileId,
          tags: formData.tags || undefined,
          fileContent: formData.fileContent || undefined,
          broadCode: formData.broadCode,
          narrowCode: formData.narrowCode || undefined,
          metaData: formData.metaData || undefined,
          status: formData.status,
          auditStatus: formData.auditStatus,
          isPinned: formData.isPinned,
          isRecommended: formData.isRecommended,
        }
        await updateDocVideo(updateData)
        toast.success('视频修改成功')
      } else {
        const createData: DocVideoCreateInput = {
          userId: userInfo!.id,
          videoTitle: formData.videoTitle,
          fileId: formData.fileId,
          coverFileId: formData.coverFileId,
          tags: formData.tags || undefined,
          fileContent: formData.fileContent || undefined,
          broadCode: formData.broadCode,
          narrowCode: formData.narrowCode || undefined,
          metaData: formData.metaData || undefined,
          status: formData.status,
          auditStatus: formData.auditStatus,
          isPinned: formData.isPinned,
          isRecommended: formData.isRecommended,
        }
        await createDocVideo(createData)
        toast.success('视频新增成功')
      }
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : '操作失败，请稍后重试'
      toast.error(message)
      console.error(isEditMode ? '视频修改失败：' : '视频新增失败：', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, validateForm, isEditMode, userInfo, onSuccess, onOpenChange])

  // ===== 10. TODO任务管理区域 =====

  // ===== 11. 导出区域 =====

  const dialogTitle = isEditMode ? '编辑视频信息' : '新增视频'

  return (
    <>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="4xl" scrollBehavior="inside">
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center gap-2">
              <Film size={18} className="text-primary" />
              <span>{dialogTitle}</span>
            </div>
          </ModalHeader>
          <ModalBody className="gap-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* 左侧媒体区域（约40%） */}
              <div className="w-full lg:w-2/5 flex flex-col gap-4">
                {/* 上方：封面图片上传区 */}
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium">封面图片</span>
                  <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border-2 border-dashed border-default-300 hover:border-primary transition-colors cursor-pointer group">
                    {formData.coverUrl ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={formData.coverUrl}
                          alt="视频封面"
                          className="w-full h-full object-cover"
                          classNames={{ wrapper: 'w-full h-full' }}
                        />
                        {/* 悬停操作遮罩 */}
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
                                handleEditCoverImage()
                              }}
                            >
                              修改
                            </Button>
                            <Button
                              size="sm"
                              variant="solid"
                              color="danger"
                              className="opacity-70 hover:opacity-100 transition-opacity duration-200"
                              startContent={<Trash2 size={16} />}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteCover()
                              }}
                            >
                              删除
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="w-full h-full flex flex-col items-center justify-center text-default-400"
                        onClick={triggerCoverFileSelect}
                      >
                        <Upload size={32} className="mb-2" />
                        <span className="text-sm">点击上传封面图片</span>
                        <span className="text-xs mt-1">支持 JPG、PNG、WebP，最大 3MB</span>
                      </div>
                    )}

                    {/* 上传中遮罩 */}
                    {isCoverUploading && (
                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-20">
                        <Spinner size="md" color="primary" />
                        <span className="text-white text-sm mt-2">上传中... {coverUploadProgress}%</span>
                      </div>
                    )}
                  </div>

                  {/* 封面上传进度条 */}
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-default-500">
                        {coverUploadStatus === 'success'
                          ? '上传成功'
                          : coverUploadStatus === 'error'
                            ? '上传失败'
                            : '上传状态'}
                      </span>
                      <span className="text-xs text-default-500">{coverUploadProgress}%</span>
                    </div>
                    <div className="relative h-2 bg-default-200 rounded-full overflow-hidden">
                      <div
                        className={`absolute left-0 top-0 h-full rounded-full transition-all duration-300 ${
                          coverUploadStatus === 'success'
                            ? 'bg-success'
                            : coverUploadStatus === 'error'
                              ? 'bg-danger'
                              : 'bg-primary'
                        }`}
                        style={{ width: `${coverUploadProgress}%` }}
                      />
                    </div>
                    {coverUploadStatus === 'error' && coverUploadError && (
                      <p className="text-xs text-danger mt-1">{coverUploadError}</p>
                    )}
                  </div>

                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleCoverFileSelect}
                  />
                </div>

                {/* 下方：视频上传与预览区 */}
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium">视频文件</span>
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden border-2 border-dashed border-default-300 hover:border-primary transition-colors">
                    {formData.videoUrl ? (
                      <div className="relative w-full h-full">
                        <VideoPlayer
                          src={formData.videoUrl}
                          title={formData.videoTitle}
                          poster={formData.coverUrl}
                          aspectRatio="16/9"
                        />
                        {/* 视频操作按钮 */}
                        <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="solid"
                            color="danger"
                            className="opacity-70 hover:opacity-100 transition-opacity duration-200 min-w-0"
                            isIconOnly
                            onClick={handleDeleteVideo}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="w-full h-full flex flex-col items-center justify-center text-default-400 cursor-pointer"
                        onClick={triggerVideoFileSelect}
                      >
                        <Film size={32} className="mb-2" />
                        <span className="text-sm">点击上传视频</span>
                        <span className="text-xs mt-1">支持 MP4、MOV、AVI，最大 500MB</span>
                      </div>
                    )}

                    {/* 视频上传中遮罩 */}
                    {isVideoUploading && (
                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-20">
                        <Spinner size="md" color="primary" />
                        <span className="text-white text-sm mt-2">上传中... {videoUploadProgress}%</span>
                      </div>
                    )}
                  </div>

                  {/* 视频上传进度条 */}
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-default-500">
                        {videoUploadStatus === 'success'
                          ? '上传成功'
                          : videoUploadStatus === 'error'
                            ? '上传失败'
                            : '上传状态'}
                      </span>
                      <span className="text-xs text-default-500">{videoUploadProgress}%</span>
                    </div>
                    <div className="relative h-2 bg-default-200 rounded-full overflow-hidden">
                      <div
                        className={`absolute left-0 top-0 h-full rounded-full transition-all duration-300 ${
                          videoUploadStatus === 'success'
                            ? 'bg-success'
                            : videoUploadStatus === 'error'
                              ? 'bg-danger'
                              : 'bg-primary'
                        }`}
                        style={{ width: `${videoUploadProgress}%` }}
                      />
                    </div>
                    {videoUploadStatus === 'error' && videoUploadError && (
                      <p className="text-xs text-danger mt-1">{videoUploadError}</p>
                    )}
                  </div>

                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/mp4,video/quicktime,video/x-msvideo"
                    className="hidden"
                    onChange={handleVideoFileSelect}
                  />
                </div>
              </div>

              {/* 右侧元信息表单区域（约60%） */}
              <div className="w-full lg:w-3/5 flex flex-col gap-4">
                {/* 基本信息表单 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="视频标题"
                    placeholder="请输入视频标题"
                    isRequired
                    value={formData.videoTitle}
                    onValueChange={(v) => handleFieldChange('videoTitle', v)}
                  />
                  <Input
                    label="大类编码"
                    placeholder="请输入大类编码"
                    isRequired
                    value={formData.broadCode}
                    onValueChange={(v) => handleFieldChange('broadCode', v)}
                  />
                  <Input
                    label="小类编码"
                    placeholder="请输入小类编码"
                    value={formData.narrowCode}
                    onValueChange={(v) => handleFieldChange('narrowCode', v)}
                  />
                  <Input
                    label="标签"
                    placeholder="多个标签用逗号分隔"
                    value={formData.tags}
                    onValueChange={(v) => handleFieldChange('tags', v)}
                  />
                </div>

                <Textarea
                  label="视频描述"
                  placeholder="请输入视频描述"
                  value={formData.fileContent}
                  onValueChange={(v) => handleFieldChange('fileContent', v)}
                  maxRows={4}
                />

                {/* 元数据表单 */}
                <Textarea
                  label="元数据"
                  placeholder='{"resolution":"1920x1080","duration":"3600"}'
                  value={formData.metaData}
                  onValueChange={(v) => handleFieldChange('metaData', v)}
                  maxRows={3}
                />

                {/* 状态控制 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DictSelect
                    label="发布状态"
                    placeholder="请选择状态"
                    isDisabled={!videoData}
                    dictType="doc_video_status"
                    selectedKeys={formData.status ? [String(formData.status)] : []}
                    onSelectionChange={(keys) => {
                      const value = Array.from(keys)[0] as string
                      handleFieldChange('status', Number(value) as DocVideoStatus)
                    }}
                  />
                  <DictSelect
                    label="审核状态"
                    placeholder="请选择审核状态"
                    isDisabled
                    dictType="doc_audit_status"
                    selectedKeys={formData.auditStatus !== undefined ? [String(formData.auditStatus)] : []}
                    onSelectionChange={(keys) => {
                      const value = Array.from(keys)[0] as string
                      handleFieldChange('auditStatus', Number(value) as DocVideoAuditStatus)
                    }}
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
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={() => onOpenChange(false)}>
              取消
            </Button>
            <Button
              color="secondary"
              isLoading={isSubmitting}
              onPress={handleSaveDraft}
            >
              保存草稿
            </Button>
            <Button
              color="primary"
              isLoading={isSubmitting}
              isDisabled={!formData.coverFileId || !formData.fileId}
              onPress={handleSubmit}
            >
              确认发布
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
          initialQuality: 0.8,
        }}
        onCropComplete={handleCoverCropComplete}
        title="裁剪封面图片"
        confirmText="确认并上传"
        cancelText="取消"
      />
    </>
  )
}

export default VideoMetaFormModal
