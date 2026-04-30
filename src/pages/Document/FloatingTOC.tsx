/**
 * 悬浮目录导航（折叠式）
 * 从 Markdown 渲染后的 DOM 中提取 h1-h4 标题
 * 支持折叠/展开、高亮当前阅读位置、点击跳转、自动展开当前路径
 * 已优化：缓存 DOM 引用避免每帧 getElementById，scroll + RAF 节流
 */

// ===== 1. 依赖导入区域 =====
// React 核心
import { useEffect, useState, useCallback, useRef, memo, useMemo } from 'react'

// 图标
import { ChevronRight } from 'lucide-react'

// 工具函数
import { cn } from '@/utils'

// ===== 2. 类型定义区域 =====
export interface TocItem {
  id: string
  text: string
  level: number
}

interface FloatingTOCProps {
  items: TocItem[]
}

interface TocNode {
  item: TocItem
  children: TocNode[]
}

// ===== 3. 通用工具函数区域 =====
/**
 * 将扁平目录列表转为树形结构
 * 根据标题层级构建父子关系：h1 > h2 > h3 > h4
 * @param items - 扁平目录项列表
 * @returns 树形节点列表
 */
function buildTocTree(items: TocItem[]): TocNode[] {
  const roots: TocNode[] = []
  const stack: TocNode[] = []

  for (const item of items) {
    const node: TocNode = { item, children: [] }

    while (stack.length > 0 && stack[stack.length - 1].item.level >= item.level) {
      stack.pop()
    }

    if (stack.length > 0) {
      stack[stack.length - 1].children.push(node)
    } else {
      roots.push(node)
    }

    stack.push(node)
  }

  return roots
}

/**
 * 查找目标 id 在树中的祖先路径
 * @param nodes - 树形节点列表
 * @param targetId - 目标标题 id
 * @returns 从根到目标的路径上的所有节点 id
 */
function findAncestorIds(nodes: TocNode[], targetId: string): Set<string> {
  const result = new Set<string>()

  function dfs(nodeList: TocNode[]): boolean {
    for (const node of nodeList) {
      if (node.item.id === targetId) {
        result.add(node.item.id)
        return true
      }
      if (node.children.length > 0 && dfs(node.children)) {
        result.add(node.item.id)
        return true
      }
    }
    return false
  }

  dfs(nodes)
  return result
}

// ===== 4. 导出区域 =====
/**
 * 悬浮目录导航组件（折叠式）
 * 使用 scroll 事件 + RAF 节流计算当前阅读位置
 * 缓存 DOM 引用，避免每帧重复 getElementById 查询
 * 支持折叠/展开，自动展开当前阅读路径
 */
export default memo(function FloatingTOC({ items }: FloatingTOCProps) {
  const [activeId, setActiveId] = useState<string>('')
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const rafRef = useRef<number | null>(null)
  const lastActiveRef = useRef<string>('')
  const elementCacheRef = useRef<Map<string, HTMLElement>>(new Map())

  const tocTree = useMemo(() => buildTocTree(items), [items])

  // 缓存标题 DOM 引用，避免每帧 getElementById
  const getCachedElement = useCallback((id: string): HTMLElement | null => {
    const cache = elementCacheRef.current
    const cached = cache.get(id)
    if (cached && cached.isConnected) return cached
    const el = document.getElementById(id)
    if (el) cache.set(id, el)
    return el
  }, [])

  // items 变化时清空缓存与展开状态（文档内容切换）
  useEffect(() => {
    elementCacheRef.current.clear()
    setExpandedIds(new Set())
  }, [items])

  // 活跃标题变化时自动展开其祖先路径
  useEffect(() => {
    if (!activeId || tocTree.length === 0) return

    setExpandedIds((prev) => {
      const ancestors = findAncestorIds(tocTree, activeId)
      if (ancestors.size === 0) return prev

      const next = new Set(prev)
      let changed = false
      for (const id of ancestors) {
        if (!next.has(id)) {
          next.add(id)
          changed = true
        }
      }
      return changed ? next : prev
    })
  }, [activeId, tocTree])

  // 监听滚动高亮当前标题
  useEffect(() => {
    if (items.length === 0) return

    const handleScroll = () => {
      if (rafRef.current) return
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null

        let bestId = ''
        let bestOffset = -Infinity
        const offsetTop = 120

        for (const item of items) {
          const el = getCachedElement(item.id)
          if (!el) continue
          const rect = el.getBoundingClientRect()
          const offset = rect.top - offsetTop
          if (offset <= 0 && offset > bestOffset) {
            bestOffset = offset
            bestId = item.id
          }
        }

        if (!bestId && items.length > 0) {
          for (const item of items) {
            const el = getCachedElement(item.id)
            if (el) {
              bestId = item.id
              break
            }
          }
        }

        if (bestId && bestId !== lastActiveRef.current) {
          lastActiveRef.current = bestId
          setActiveId(bestId)
        }
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [items, getCachedElement])

  // 点击跳转
  const handleClick = useCallback((id: string) => {
    const el = getCachedElement(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }, [getCachedElement])

  // 切换折叠/展开
  const handleToggle = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  if (items.length === 0) return null

  return (
    <nav className="hidden md:block w-52 shrink-0">
      <div className="sticky top-20">
        <h4 className="text-sm font-semibold text-default-600 uppercase tracking-wider mb-3">
          目录
        </h4>
        <ul className="space-y-0.5">
          {tocTree.map((node) => (
            <TocTreeNode
              key={node.item.id}
              node={node}
              activeId={activeId}
              expandedIds={expandedIds}
              depth={0}
              onToggle={handleToggle}
              onClick={handleClick}
            />
          ))}
        </ul>
      </div>
    </nav>
  )
})

// ===== 5. 子组件区域 =====
interface TocTreeNodeProps {
  node: TocNode
  activeId: string
  expandedIds: Set<string>
  depth: number
  onToggle: (id: string) => void
  onClick: (id: string) => void
}

/**
 * 目录树节点组件
 * 递归渲染目录树，支持折叠/展开
 */
const TocTreeNode = memo(function TocTreeNode({
  node,
  activeId,
  expandedIds,
  depth,
  onToggle,
  onClick,
}: TocTreeNodeProps) {
  const { item, children } = node
  const isActive = activeId === item.id
  const hasChildren = children.length > 0
  const isExpanded = expandedIds.has(item.id)

  const paddingLeftMap: Record<number, string> = {
    0: 'pl-2',
    1: 'pl-5',
    2: 'pl-8',
    3: 'pl-11',
  }

  return (
    <li>
      <div
        className={cn(
          'group flex items-center gap-0.5 rounded-md transition-colors',
          isActive && 'bg-primary/10'
        )}
      >
        {hasChildren && (
          <button
            className="shrink-0 p-0.5 rounded hover:bg-default-100 transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              onToggle(item.id)
            }}
            aria-label={isExpanded ? '折叠' : '展开'}
          >
            <ChevronRight
              size={14}
              className={cn(
                'text-default-400 transition-transform duration-200',
                isExpanded && 'rotate-90'
              )}
            />
          </button>
        )}
        {!hasChildren && <span className="w-5 shrink-0" />}

        <button
          className={cn(
            'flex-1 text-left text-sm leading-relaxed py-1.5 transition-colors truncate',
            paddingLeftMap[depth] ?? 'pl-2',
            isActive
              ? 'text-primary font-medium'
              : 'text-default-400 hover:text-default-600'
          )}
          onClick={() => onClick(item.id)}
        >
          {item.text}
        </button>
      </div>

      {hasChildren && (
        <div
          className={cn(
            'overflow-hidden transition-all duration-200',
            isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          <ul className="space-y-0.5">
            {children.map((child) => (
              <TocTreeNode
                key={child.item.id}
                node={child}
                activeId={activeId}
                expandedIds={expandedIds}
                depth={depth + 1}
                onToggle={onToggle}
                onClick={onClick}
              />
            ))}
          </ul>
        </div>
      )}
    </li>
  )
})
