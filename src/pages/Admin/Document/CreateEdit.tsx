/**
 * 后台-文档创建与编辑入口页
 *
 * 路径：/admin/document/create-edit
 *
 * 页面布局：
 * - 中央两个卡片：编辑已有文档 / 创建新文档
 * - 创建新文档 → 弹窗选择「手动创建」或「导入 Markdown」
 *
 * 流转：
 * - 编辑已有文档 → 跳转 /admin/document/list
 * - 手动创建 → 跳转 /admin/document/editor
 * - 导入 Markdown → 触发文件选择 → 解析 → 跳转 /admin/document/editor 并附带初始内容
 */

// React
import { useCallback, useRef, useState, memo } from 'react'
import { useNavigate } from 'react-router-dom'

// HeroUI
import {
  Button,
  Card,
  CardBody,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalFooter,
  Spinner,
  useDisclosure,
} from '@heroui/react'

// 图标
import { AlertTriangle, FilePlus2, FilePen, Pencil, Upload } from 'lucide-react'

// 工具
import { toast } from '@/utils/toast'

// ===== 常量 =====

/** 允许的 Markdown 文件后缀 */
const ALLOWED_MD_EXTENSIONS = ['.md', '.markdown']
/** Markdown 文件大小上限：2MB */
const MAX_MD_SIZE = 2 * 1024 * 1024



/**
 * 以 UTF-8 读取文件文本内容
 */
function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result === 'string') {
        resolve(result)
      } else {
        reject(new Error('文件读取失败：返回结果不是文本'))
      }
    }
    reader.onerror = () => reject(reader.error ?? new Error('文件读取失败'))
    reader.readAsText(file, 'UTF-8')
  })
}

// ===== 组件 =====

/**
 * 文档创建与编辑入口
 */
function DocumentCreateEdit() {
  const navigate = useNavigate()

  /** 创建方式选择弹窗 */
  const createModal = useDisclosure()
  /** 解析中遮罩 */
  const [isParsing, setIsParsing] = useState(false)
  /** 隐藏的文件输入 */
  const fileInputRef = useRef<HTMLInputElement>(null)
  /** 文件过大警告弹窗 */
  const [showSizeWarning, setShowSizeWarning] = useState(false)

  /** 编辑已有文档 → 跳转列表页 */
  const handleGoList = useCallback(() => {
    navigate('/admin/document/list')
  }, [navigate])

  /** 创建新文档 → 打开方式选择弹窗 */
  const handleOpenCreate = useCallback(() => {
    createModal.onOpen()
  }, [createModal])

  /** 手动创建 → 跳转空白编辑器 */
  const handleManualCreate = useCallback(() => {
    createModal.onClose()
    navigate('/admin/document/editor')
  }, [navigate, createModal])

  /** 触发文件选择 */
  const triggerImport = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  /** 选择文件 → 校验 → 解析 → 携带内容跳转编辑器 */
  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      e.target.value = ''
      if (!file) return

      const lower = file.name.toLowerCase()
      const isValidExtension = ALLOWED_MD_EXTENSIONS.some((ext) => lower.endsWith(ext))
      if (!isValidExtension) {
        toast.error('文件格式不支持：仅支持 .md 和 .markdown 格式的文件')
        return
      }

      if (file.size > MAX_MD_SIZE) {
        setShowSizeWarning(true)
        return
      }

      setIsParsing(true)
      try {
        const content = await readFileAsText(file)
        if (!content.trim()) {
          toast.warning('Markdown 文件内容为空')
          return
        }
        createModal.onClose()
        navigate('/admin/document/editor', {
          state: {
            initialContent: content,
            initialTitle: file.name.replace(/\.(md|markdown)$/i, ''),
          },
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : '文件解析失败'
        toast.error(message)
        console.error('解析 Markdown 文件失败：', error)
      } finally {
        setIsParsing(false)
      }
    },
    [navigate, createModal]
  )

  return (
    <div className="flex items-center justify-center min-h-full p-6">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">文档创建与编辑</h1>
          <p className="mt-2 text-sm text-default-500">选择下方操作以编辑已有文档或创建新文档</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 编辑已有文档 */}
          <Card
            className="bg-content1 border border-default-200"
          >
            <CardBody className="flex flex-col items-center text-center gap-4 py-10">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <FilePen size={32} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">编辑已有文档</h2>
                <p className="mt-2 text-sm text-default-500">查看并编辑已创建的文档内容</p>
              </div>
              <Button color="primary" variant="flat" onPress={handleGoList}>
                进入列表
              </Button>
            </CardBody>
          </Card>

          {/* 创建新文档 */}
          <Card
            className="bg-content1 border border-default-200"
          >
            <CardBody className="flex flex-col items-center text-center gap-4 py-10">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center text-success">
                <FilePlus2 size={32} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">创建新文档</h2>
                <p className="mt-2 text-sm text-default-500">手动创建新文档或导入 Markdown 文件</p>
              </div>
              <Button color="success" variant="flat" onPress={handleOpenCreate}>
                立即创建
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* 选择创建方式弹窗 */}
      <Modal isOpen={createModal.isOpen} onOpenChange={createModal.onOpenChange} size="2xl">
        <ModalContent>
          <ModalHeader>选择创建方式</ModalHeader>
          <ModalBody className="pb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card
                isPressable
                isHoverable
                onPress={handleManualCreate}
                className="bg-content1 border border-default-200 hover:border-primary transition-colors"
              >
                <CardBody className="flex flex-col items-center text-center gap-3 py-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Pencil size={24} />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">手动创建</h3>
                  <p className="text-xs text-default-500">创建一个空白文档，手动编辑内容</p>
                </CardBody>
              </Card>

              <Card
                isPressable
                isHoverable
                onPress={triggerImport}
                className="bg-content1 border border-default-200 hover:border-primary transition-colors"
              >
                <CardBody className="flex flex-col items-center text-center gap-3 py-6">
                  <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center text-success">
                    <Upload size={24} />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">导入 Markdown</h3>
                  <p className="text-xs text-default-500">上传 .md 或 .markdown 文件，自动解析内容</p>
                </CardBody>
              </Card>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".md,.markdown,text/markdown"
              className="hidden"
              onChange={handleFileSelect}
            />
          </ModalBody>
        </ModalContent>

        {/* 解析中遮罩（覆盖整个弹窗） */}
        {isParsing && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-50 rounded-large">
            <Spinner size="lg" color="primary" />
            <span className="text-sm text-default-600">正在解析文件...</span>
          </div>
        )}
      </Modal>

      {/* 文件过大警告弹窗 */}
      <Modal isOpen={showSizeWarning} onOpenChange={setShowSizeWarning}>
        <ModalContent>
          <ModalHeader className="flex items-center gap-3">
            <AlertTriangle className="text-warning" size={20} />
            <span>文件过大</span>
          </ModalHeader>
          <ModalBody className="text-sm">
            <p className="text-default-600">
              您选择的文件超过了允许的最大大小（2MB）。请选择较小的 Markdown 文件或拆分文件后重新导入。
            </p>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onPress={() => setShowSizeWarning(false)}>
              我知道了
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}

export default memo(DocumentCreateEdit)
