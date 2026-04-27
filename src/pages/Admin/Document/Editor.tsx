/**
 * 后台-文档编辑器页
 *
 * 路径：
 * - /admin/document/editor       新建（手动创建 / 从导入页带初始内容）
 * - /admin/document/editor/:id   编辑已有文档（拉取聚合详情回填）
 *
 * 布局：
 * - 顶部：标题栏（返回 / 提交按钮）
 * - 桌面端：左编辑右预览
 * - 移动端：编辑/预览 Tab 切换
 *
 * 提交流程：
 * - 编辑器内容非空校验 → 弹出元信息表单（DocMetaFormModal aggregate 模式）
 *   → 收集 meta → 调用 createDocNoteAggregate / updateDocNoteAggregate
 */

// React
import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

// HeroUI
import {
  Button,
  Card,
  CardBody,
  Tab,
  Tabs,
  Tooltip,
  useDisclosure,
} from '@heroui/react'

// 图标
import { ArrowLeft, Eye, EyeOff, FileText, Save } from 'lucide-react'

// 工具
import { toast } from '@/utils/toast'

// 编辑器
import { MarkdownEditor, MarkdownPreview } from '@/components/ui/editor'

// 状态
import { StatusState } from '@/components/ui/StatusState'
import { useUserStore } from '@/stores/user'

// 复用组件
import { DocMetaFormModal, type DocMetaFormResult } from './components/DocMetaFormModal'

// API
import {
  createDocNoteAggregate,
  getDocNoteAggregate,
  updateDocNoteAggregate,
} from '@/api/admin/document'

// 类型
import type { DocNote, DocNoteAggregateInput } from '@/types/document.types'

// ===== 常量 =====

/** 路由 state 字段（来自 CreateEdit 页面的导入流程） */
interface EditorLocationState {
  /** 初始 Markdown 内容（导入文件时） */
  initialContent?: string
  /** 初始标题（来自文件名） */
  initialTitle?: string
}

// ===== 子组件 =====

/**
 * 编辑器页（含元信息提交弹窗）
 */
export default function DocumentEditor() {
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams<{ id?: string }>()
  const userInfo = useUserStore((s) => s.userInfo)

  /** 是否编辑模式 */
  const isEdit = Boolean(id)

  /** 编辑器内容 */
  const [content, setContent] = useState<string>('')
  /** 已有文档（编辑模式回填用） */
  const [existingDoc, setExistingDoc] = useState<DocNote | null>(null)
  /** 编辑模式回填加载中 */
  const [isLoading, setIsLoading] = useState<boolean>(isEdit)
  /** 移动端 Tab 选项 */
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit')
  /** 提交中（聚合接口调用） */
  const [isSubmitting, setIsSubmitting] = useState(false)
  /** 桌面端实时预览显示/隐藏 */
  const [showPreview, setShowPreview] = useState(true)

  /** 元信息提交弹窗 */
  const metaModal = useDisclosure()

  // ===== 初始化 =====

  /** 路由 state：导入文件带来的初始内容 */
  useEffect(() => {
    if (isEdit) return
    const state = location.state as EditorLocationState | null
    if (state?.initialContent) {
      setContent(state.initialContent)
    }
  }, [isEdit, location.state])

  /** 编辑模式：拉取聚合详情回填 */
  useEffect(() => {
    if (!isEdit || !id) return
    let cancelled = false

    const fetchDetail = async () => {
      setIsLoading(true)
      try {
        const detail = await getDocNoteAggregate(id)
        if (cancelled) return
        const { content: docContent, ...meta } = detail
        setContent(docContent ?? '')
        setExistingDoc(meta as DocNote)
      } catch (error) {
        const message = error instanceof Error ? error.message : '获取文档详情失败'
        toast.error(message)
        console.error('获取文档详情失败：', error)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchDetail()
    return () => {
      cancelled = true
    }
  }, [isEdit, id])

  // ===== 事件 =====

  /** 返回 */
  const handleBack = useCallback(() => {
    navigate(-1)
  }, [navigate])

  /** 点击提交 → 校验内容 → 打开元信息弹窗 */
  const handleSubmit = useCallback(() => {
    if (!content.trim()) {
      toast.warning('文档正文不能为空')
      return
    }
    metaModal.onOpen()
  }, [content, metaModal])

  /**
   * 元信息弹窗确认 → 调用聚合接口
   */
  const handleMetaConfirm = useCallback(
    async (result?: DocMetaFormResult) => {
      if (!result) return
      const { meta } = result

      const initialTitle = (location.state as EditorLocationState | null)?.initialTitle
      if (!meta.noteName?.trim() && initialTitle) {
        meta.noteName = initialTitle
      }

      setIsSubmitting(true)
      try {
        if (isEdit && id) {
          const payload: DocNoteAggregateInput = {
            docNote: { ...meta, id },
            content,
          }
          await updateDocNoteAggregate(id, payload)
          toast.success('文档更新成功')
        } else {
          const userId = userInfo?.id ?? meta.userId ?? '0'
          const payload: DocNoteAggregateInput = {
            docNote: { ...meta, userId },
            content,
          }
          await createDocNoteAggregate(payload)
          toast.success('文档创建成功')
        }
        metaModal.onClose()
        navigate('/admin/document/list')
      } catch (error) {
        const message = error instanceof Error ? error.message : '提交失败，请稍后重试'
        toast.error(message)
        console.error('文档提交失败：', error)
      } finally {
        setIsSubmitting(false)
      }
    },
    [isEdit, id, content, userInfo, metaModal, navigate, location.state]
  )

  // ===== 渲染 =====

  if (isEdit && isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <StatusState type="loading" scene="admin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full p-4 md:p-0">
      <Card className="h-full">
        <CardBody className="p-0 flex flex-col overflow-hidden">
          {/* 顶部标题栏 */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-divider">
            <div className="flex items-center gap-2">
              <Tooltip content="返回" size="sm">
                <Button isIconOnly size="sm" variant="light" onPress={handleBack}>
                  <ArrowLeft size={16} />
                </Button>
              </Tooltip>
              <FileText size={18} className="text-primary" />
              <span className="font-semibold text-sm">
                {isEdit ? '编辑文档' : '创建文档'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Tooltip content={showPreview ? '隐藏预览' : '显示预览'} size="sm">
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onPress={() => setShowPreview((v) => !v)}
                  className="hidden md:flex"
                >
                  {showPreview ? <Eye size={16} /> : <EyeOff size={16} />}
                </Button>
              </Tooltip>
              <Button
                size="sm"
                color="primary"
                startContent={<Save size={14} />}
                isLoading={isSubmitting}
                onPress={handleSubmit}
              >
                提交
              </Button>
            </div>
          </div>

          {/* 移动端 Tab 切换 */}
          <div className="md:hidden px-3 pt-2">
            <Tabs
              size="sm"
              selectedKey={mobileTab}
              onSelectionChange={(key) => setMobileTab(key as 'edit' | 'preview')}
              aria-label="编辑器视图切换"
            >
              <Tab key="edit" title="编辑" />
              <Tab key="preview" title="预览" />
            </Tabs>
          </div>

          {/* 编辑/预览主体 */}
          <div className="flex-1 overflow-hidden p-3">
            {/* 桌面端：左右分栏（flex 实现平滑切换动效） */}
            <div className="hidden md:flex gap-4 h-full overflow-hidden">
              <div
                className={`flex flex-col gap-2 min-h-0 transition-all duration-300 ease-in-out ${
                  showPreview ? 'w-1/2' : 'w-full'
                }`}
              >
                <h3 className="text-sm font-semibold text-default-700">编辑区</h3>
                <div className="flex-1 min-h-0">
                  <MarkdownEditor
                    value={content}
                    onChange={setContent}
                    placeholder="开始输入 Markdown..."
                    height="100%"
                  />
                </div>
              </div>
              <div
                className={`flex flex-col gap-2 min-h-0 transition-all duration-300 ease-in-out overflow-hidden ${
                  showPreview ? 'w-1/2 opacity-100' : 'w-0 opacity-0'
                }`}
              >
                <h3 className="text-sm font-semibold text-primary whitespace-nowrap">实时预览</h3>
                <div className="flex-1 min-h-0 p-4 bg-content1 rounded-md border border-default-200 overflow-auto">
                  <MarkdownPreview value={content} />
                </div>
              </div>
            </div>

            {/* 移动端：单视图 */}
            <div className="md:hidden h-full">
              {mobileTab === 'edit' ? (
                <div className="h-full">
                  <MarkdownEditor
                    value={content}
                    onChange={setContent}
                    placeholder="开始输入 Markdown..."
                    height="100%"
                  />
                </div>
              ) : (
                <div className="h-full p-4 bg-content1 rounded-md border border-default-200 overflow-auto">
                  <MarkdownPreview value={content} />
                </div>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 元信息提交弹窗（aggregate 模式） */}
      <DocMetaFormModal
        isOpen={metaModal.isOpen}
        onOpenChange={metaModal.onOpenChange}
        docData={existingDoc}
        mode="aggregate"
        title={isEdit ? '更新文档信息' : '完善文档信息'}
        confirmText={isSubmitting ? '提交中...' : '确认提交'}
        onSuccess={handleMetaConfirm}
      />
    </div>
  )
}
