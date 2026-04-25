/**
 * 图片裁剪与压缩通用组件
 * 基于 react-image-crop + browser-image-compression
 * 支持弹窗式裁剪、自定义宽高比、圆形裁剪、上传前压缩
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
  Select,
  SelectItem,
} from '@heroui/react'
import { 
  Crop as CropIcon, 
  ZoomIn, 
  RotateCcw,
  FlipHorizontal,
  FlipVertical 
} from 'lucide-react'
import { cn } from '@/utils'

/** 裁剪比例选项 */
export const ASPECT_RATIO_OPTIONS = [
  { label: '自由', value: 'free' },
  { label: '1:1 正方形', value: '1/1' },
  { label: '3:4', value: '3/4' },
  { label: '4:3', value: '4/3' },
  { label: '16:9', value: '16/9' },
  { label: '9:16', value: '9/16' },
]

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

/** 解析分数字符串为数值（如 '4/3' → 1.333...） */
function parseAspectRatio(value: string): number | undefined {
  if (value === 'free') return undefined
  const [num, den] = value.split('/').map(Number)
  if (!den || den === 0) return undefined
  return num / den
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
  ruleOfThirds = true,
  compressionOptions,
  onCropComplete,
  title = '裁剪封面图片',
  confirmText = '确认并上传',
  cancelText = '取消',
}: ImageCropModalProps) {
  const [imgSrc, setImgSrc] = useState<string>('')
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [confirmLoading, setConfirmLoading] = useState(false)
  // 将传入的数值 aspect 映射为选项中的字符串格式（如 16/9 → '16/9'）
  const getAspectOptionValue = useCallback((numAspect?: number): string => {
    if (!numAspect) return 'free'
    const found = ASPECT_RATIO_OPTIONS.find((opt) => {
      if (opt.value === 'free') return false
      return Math.abs(parseAspectRatio(opt.value)! - numAspect) < 0.001
    })
    return found ? found.value : 'free'
  }, [])

  const [selectedAspect, setSelectedAspect] = useState<string>(getAspectOptionValue(aspect))
  const [imageRotation, setImageRotation] = useState(0)
  const [isFlippedH, setIsFlippedH] = useState(false)
  const [isFlippedV, setIsFlippedV] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)

  // aspect prop 变化时同步内部状态
  useEffect(() => {
    setSelectedAspect(getAspectOptionValue(aspect))
  }, [aspect, getAspectOptionValue])

  // file 变化时读取为 dataURL 并重置相关状态
  useEffect(() => {
    if (!file) {
      setImgSrc('')
      setCrop(undefined)
      setCompletedCrop(undefined)
      setImageRotation(0)
      setIsFlippedH(false)
      setIsFlippedV(false)
      return
    }
    // 每次选择新文件时，根据 aspect prop 重新设置裁剪比例
    setSelectedAspect(getAspectOptionValue(aspect))
    const reader = new FileReader()
    reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''))
    reader.readAsDataURL(file)
  }, [file, aspect, getAspectOptionValue])

  // 图片加载完成时，若有 aspect 则自动居中裁剪
  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget
      const currentAspect = parseAspectRatio(selectedAspect)
      if (currentAspect) {
        setCrop(centerAspectCrop(width, height, currentAspect))
      }
    },
    [selectedAspect],
  )

  // 裁剪区域变化时同步渲染预览 canvas
  useEffect(() => {
    if (!completedCrop?.width || !completedCrop?.height || !imgRef.current || !previewCanvasRef.current) return
    canvasPreview(imgRef.current, previewCanvasRef.current, completedCrop)
  }, [completedCrop])

  // 切换裁剪比例
  const handleAspectChange = useCallback((keys: 'all' | Set<React.Key>) => {
    if (keys === 'all') return
    const value = Array.from(keys)[0] as string
    setSelectedAspect(value)
    
    // 如果选择了固定比例，自动居中裁剪
    const currentAspect = parseAspectRatio(value)
    if (currentAspect && imgRef.current) {
      const { width, height } = imgRef.current
      setCrop(centerAspectCrop(width, height, currentAspect))
    } else {
      setCrop(undefined)
    }
  }, [])

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

  // 重置操作
  const handleReset = useCallback(() => {
    setImageRotation(0)
    setIsFlippedH(false)
    setIsFlippedV(false)
    // 重置裁剪区域
    if (imgRef.current && selectedAspect !== 'free') {
      const { width, height } = imgRef.current
      const currentAspect = parseAspectRatio(selectedAspect)
      if (currentAspect) {
        setCrop(centerAspectCrop(width, height, currentAspect))
      }
    } else {
      setCrop(undefined)
    }
  }, [selectedAspect])

  const currentAspectValue = parseAspectRatio(selectedAspect)

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
              {/* 裁剪区域 */}
              <div className="relative">
                <ReactCrop
                  crop={crop}
                  onChange={(_pixelCrop, percentCrop) => setCrop(percentCrop)}
                  onComplete={(pixelCrop) => setCompletedCrop(pixelCrop)}
                  aspect={currentAspectValue}
                  minWidth={minWidth}
                  minHeight={minHeight}
                  circularCrop={circularCrop}
                  ruleOfThirds={ruleOfThirds}
                  className={cn('max-h-[50vh] overflow-hidden', circularCrop && 'react-crop--circular')}
                >
                  <img
                    ref={imgRef}
                    alt="裁剪预览"
                    src={imgSrc}
                    onLoad={onImageLoad}
                    className="max-h-[50vh] object-contain"
                    style={{
                      transform: `rotate(${imageRotation}deg) scaleX(${isFlippedH ? -1 : 1}) scaleY(${isFlippedV ? -1 : 1})`,
                    }}
                  />
                </ReactCrop>
              </div>

              {/* 工具栏 */}
              <div className="flex items-center justify-between">
                {/* 左侧：比例选择 */}
                <Select
                  size="sm"
                  placeholder="选择裁剪比例"
                  selectedKeys={[selectedAspect]}
                  onSelectionChange={handleAspectChange}
                  className="w-36"
                  aria-label="选择裁剪比例"
                >
                  {ASPECT_RATIO_OPTIONS.map((option) => (
                    <SelectItem key={option.value} textValue={option.label}>
                      {option.label}
                    </SelectItem>
                  ))}
                </Select>

                {/* 中间：操作工具 */}
                <div className="flex items-center gap-1">
                  <TooltipWrapper>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      onPress={() => setImageRotation((prev) => (prev + 90) % 360)}
                      aria-label="旋转90度"
                    >
                      <RotateCcw size={16} />
                    </Button>
                      <span>旋转90°</span>
                  </TooltipWrapper>
                  <TooltipWrapper>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      onPress={() => setIsFlippedH((prev) => !prev)}
                      aria-label="水平翻转"
                    >
                      <FlipHorizontal size={16} />
                    </Button>
                    <span>水平翻转</span>
                  </TooltipWrapper>
                  <TooltipWrapper>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      onPress={() => setIsFlippedV((prev) => !prev)}
                      aria-label="垂直翻转"
                    >
                      <FlipVertical size={16} />
                    </Button>
                    <span>垂直翻转</span>
                  </TooltipWrapper>
                  <TooltipWrapper>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      onPress={handleReset}
                      aria-label="重置"
                    >
                      <RotateCcw size={16} />
                    </Button>
                    <span>重置</span>
                  </TooltipWrapper>
                </div>

                {/* 右侧：裁剪区域信息 */}
                {completedCrop && (
                  <div className="flex items-center gap-2 text-tiny text-default-500">
                    <ZoomIn size={14} />
                    裁剪区域: {Math.round(completedCrop.width)} x {Math.round(completedCrop.height)} px
                  </div>
                )}
              </div>

              {/* 预览 canvas（隐藏，仅用于导出） */}
              <canvas ref={previewCanvasRef} className="hidden" />
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
 * 工具提示包装组件
 */
function TooltipWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative group">
      {children}
    </div>
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
