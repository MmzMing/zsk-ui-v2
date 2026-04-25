/**
 * 图片裁剪与压缩通用组件
 * 基于 react-image-crop + browser-image-compression
 * 支持弹窗式裁剪、固定宽高比、圆形裁剪、上传前压缩
 */

import { useState, useRef, useCallback, useEffect } from 'react'
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  type Crop,
  type PixelCrop,
} from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import imageCompression from 'browser-image-compression'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from '@heroui/react'
import { Crop as CropIcon, ZoomIn, RotateCw } from 'lucide-react'
import { cn } from '@/utils'

/** 裁剪组件配置 */
interface ImageCropModalProps {
  /** 是否打开弹窗 */
  isOpen: boolean
  /** 关闭弹窗回调 */
  onClose: () => void
  /** 待裁剪的图片文件 */
  file: File | null
  /** 裁剪宽高比，1 为正方形，undefined 为自由裁剪 */
  aspect?: number
  /** 是否圆形裁剪（需 aspect=1 才会真正圆形） */
  circularCrop?: boolean
  /** 裁剪最小宽度（像素） */
  minWidth?: number
  /** 裁剪最小高度（像素） */
  minHeight?: number
  /** 是否显示三分线 */
  ruleOfThirds?: boolean
  /** 压缩配置，不传则不压缩 */
  compressionOptions?: ImageCompressionOptions
  /** 裁剪+压缩完成回调，返回最终 File */
  onCropComplete: (file: File) => void | Promise<void>
  /** 弹窗标题 */
  title?: string
  /** 确认按钮文案 */
  confirmText?: string
  /** 取消按钮文案 */
  cancelText?: string
}

/** 压缩配置（browser-image-compression Options 子集） */
interface ImageCompressionOptions {
  /** 最大文件大小 MB */
  maxSizeMB?: number
  /** 最大宽/高像素 */
  maxWidthOrHeight?: number
  /** 是否使用 Web Worker */
  useWebWorker?: boolean
  /** 是否保留 EXIF 信息 */
  preserveExif?: boolean
  /** 输出文件类型，如 'image/jpeg' */
  fileType?: string
  /** 初始质量 0-1 */
  initialQuality?: number
}

/** 默认压缩配置 */
const DEFAULT_COMPRESSION: ImageCompressionOptions = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  initialQuality: 0.8,
}

/** 以百分比为单位的居中裁剪 */
function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
): Crop {
  return centerCrop(
    makeAspectCrop({ unit: '%', width: 90 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight,
  )
}

/** canvas 裁剪预览（从原图取裁剪区域输出到 canvas） */
async function canvasPreview(
  image: HTMLImageElement,
  canvas: HTMLCanvasElement,
  crop: PixelCrop,
): Promise<void> {
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('无法获取 canvas 2d 上下文')

  const scaleX = image.naturalWidth / image.width
  const scaleY = image.naturalHeight / image.height
  const pixelRatio = window.devicePixelRatio

  canvas.width = Math.floor(crop.width * scaleX * pixelRatio)
  canvas.height = Math.floor(crop.height * scaleY * pixelRatio)

  ctx.scale(pixelRatio, pixelRatio)
  ctx.imageSmoothingQuality = 'high'

  const cropX = crop.x * scaleX
  const cropY = crop.y * scaleY

  ctx.save()
  ctx.translate(-cropX, -cropY)
  ctx.drawImage(
    image,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight,
  )
  ctx.restore()
}

/** 从 canvas 获取裁剪后的 Blob */
function canvasToBlob(canvas: HTMLCanvasElement, type?: string): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type || 'image/png'))
}

/**
 * 图片裁剪弹窗组件
 * 流程：选图 → 弹窗裁剪 → 确认 → canvas 导出 → 压缩 → 回调
 */
export default function ImageCropModal({
  isOpen,
  onClose,
  file,
  aspect,
  circularCrop = false,
  minWidth = 50,
  minHeight = 50,
  ruleOfThirds = false,
  compressionOptions,
  onCropComplete,
  title = '裁剪图片',
  confirmText = '确认裁剪',
  cancelText = '取消',
}: ImageCropModalProps) {
  const [imgSrc, setImgSrc] = useState<string>('')
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [confirmLoading, setConfirmLoading] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)

  // file 变化时读取为 dataURL
  useEffect(() => {
    if (!file) {
      setImgSrc('')
      setCrop(undefined)
      setCompletedCrop(undefined)
      return
    }
    const reader = new FileReader()
    reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''))
    reader.readAsDataURL(file)
  }, [file])

  // 图片加载完成时，若有 aspect 则自动居中裁剪
  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget
      if (aspect) {
        setCrop(centerAspectCrop(width, height, aspect))
      }
    },
    [aspect],
  )

  // 裁剪区域变化时同步渲染预览 canvas
  useEffect(() => {
    if (!completedCrop?.width || !completedCrop?.height || !imgRef.current || !previewCanvasRef.current) return
    canvasPreview(imgRef.current, previewCanvasRef.current, completedCrop)
  }, [completedCrop])

  // 确认裁剪：canvas → blob → 压缩 → 回调
  const handleConfirm = useCallback(async () => {
    if (!completedCrop?.width || !completedCrop?.height || !imgRef.current || !previewCanvasRef.current) return

    setConfirmLoading(true)
    try {
      // 1. canvas 导出裁剪结果
      await canvasPreview(imgRef.current, previewCanvasRef.current, completedCrop)
      const outputType = compressionOptions?.fileType || file?.type || 'image/png'
      const blob = await canvasToBlob(previewCanvasRef.current, outputType)

      if (!blob) throw new Error('裁剪导出失败')

      // 2. 构造 File 对象
      const croppedFile = new File([blob], file?.name || 'cropped.png', { type: outputType })

      // 3. 如有压缩配置则压缩
      const finalOptions = compressionOptions
        ? { ...DEFAULT_COMPRESSION, ...compressionOptions }
        : undefined

      const finalFile = finalOptions
        ? await imageCompression(croppedFile, finalOptions)
        : croppedFile

      // 4. 回调
      await onCropComplete(finalFile)
      onClose()
    } catch (err) {
      console.error('裁剪/压缩失败:', err)
    } finally {
      setConfirmLoading(false)
    }
  }, [completedCrop, compressionOptions, file, onCropComplete, onClose])

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" backdrop="blur" isDismissable={!confirmLoading}>
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <CropIcon size={18} />
          {title}
        </ModalHeader>
        <ModalBody>
          {imgSrc && (
            <div className="flex flex-col gap-4">
              <ReactCrop
                crop={crop}
                onChange={(pixelCrop, percentCrop) => setCrop(percentCrop)}
                onComplete={(pixelCrop) => setCompletedCrop(pixelCrop)}
                aspect={aspect}
                minWidth={minWidth}
                minHeight={minHeight}
                circularCrop={circularCrop}
                ruleOfThirds={ruleOfThirds}
                className={cn('max-h-[60vh] overflow-hidden', circularCrop && 'react-crop--circular')}
              >
                <img
                  ref={imgRef}
                  alt="裁剪预览"
                  src={imgSrc}
                  onLoad={onImageLoad}
                  className="max-h-[60vh] object-contain"
                />
              </ReactCrop>

              {/* 预览 canvas（隐藏，仅用于导出） */}
              <canvas ref={previewCanvasRef} className="hidden" />

              {completedCrop && (
                <div className="flex items-center gap-2 text-tiny text-default-500">
                  <ZoomIn size={14} />
                  裁剪区域: {Math.round(completedCrop.width)} x {Math.round(completedCrop.height)} px
                </div>
              )}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="default" variant="light" onPress={onClose} isDisabled={confirmLoading}>
            {cancelText}
          </Button>
          <Button
            color="primary"
            onPress={handleConfirm}
            isLoading={confirmLoading}
            isDisabled={!completedCrop?.width}
          >
            {confirmText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

/**
 * 独立压缩函数（无需裁剪，直接压缩图片文件）
 * 适用于只压缩不裁剪的场景
 */
export async function compressImage(
  file: File,
  options?: ImageCompressionOptions,
): Promise<File> {
  const finalOptions = { ...DEFAULT_COMPRESSION, ...options }
  return imageCompression(file, finalOptions)
}

export { type ImageCropModalProps, type ImageCompressionOptions }