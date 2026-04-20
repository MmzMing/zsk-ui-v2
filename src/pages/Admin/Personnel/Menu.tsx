/**
 * 菜单管理页面
 *
 * 左右分栏布局：
 * - 左侧：菜单树结构（antd Tree），支持拖拽排序、展开折叠
 * - 右侧：查询工具栏 + 菜单详情列表，支持新增/编辑/删除/批量操作
 *
 * 核心交互：
 * - 选中左侧菜单节点 → 右侧展示其子菜单列表
 * - 未选中任何节点 → 右侧展示一级菜单列表
 * - 新增子菜单时自动继承父菜单相关属性（路径、状态、权限标识等）
 * - 拖拽排序支持拖入到二级菜单（目录/菜单类型），按钮类型节点禁止拖入
 */

// ===== 1. 依赖导入区域 =====

// React 核心
import { useState, useEffect, useCallback, useMemo } from 'react'

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
  Textarea,
  Card,
  CardBody,
  Spinner,
  useDisclosure,
  Tooltip,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Switch
} from '@heroui/react'

// 图标（Lucide React）
import {
  Plus,
  Search,
  Trash2,
  Pencil,
  RefreshCw,
  FolderTree,
  Folder,
  MousePointerClick,
  Menu as MenuIcon,
  icons as LucideIcons
} from 'lucide-react'

// antd 组件
import { Tree } from 'antd'
import type { TreeProps, DataNode } from 'antd/es/tree'

// 工具函数
import { toast } from '@/utils/toast'
import { cn } from '@/utils'

// 通用状态组件
import { StatusState } from '@/components/ui/StatusState'

// API 接口
import {
  getMenuList,
  createMenu,
  updateMenu,
  deleteMenu,
  batchUpdateMenu
} from '@/api/admin/menu'

// 类型定义
import type {
  SysMenu,
  SysMenuQueryParams,
  SysMenuCreateInput,
  SysMenuUpdateInput,
  SysMenuBatchUpdate,
  MenuNodeData,
  MenuType,
  MenuStatus
} from '@/types/menu.types'
import {
  MENU_TYPE_OPTIONS,
  MENU_STATUS_OPTIONS
} from '@/types/menu.types'

// ===== 2. TODO待处理导入区域 =====

// ===== 3. 常量定义区域 =====

/** 可选图标列表，用于图标选择弹窗 */
const AVAILABLE_ICONS = [
  'home', 'folder', 'file', 'settings', 'menu', 'users', 'shield', 'video',
  'upload', 'check', 'database', 'activity', 'monitor', 'tag', 'key', 'bot',
  'message', 'edit', 'refresh', 'cog', 'list', 'search', 'plus', 'trash',
  'pencil', 'globe', 'mail', 'bell', 'star', 'heart', 'bookmark', 'clock'
]

// ===== 4. 通用工具函数区域 =====

/**
 * 获取菜单类型的显示标签
 *
 * @param type - 菜单类型枚举值
 * @returns 对应的中文标签，未匹配时返回原始值
 */
function getMenuTypeLabel(type: MenuType): string {
  const option = MENU_TYPE_OPTIONS.find(o => o.value === type)
  return option?.label ?? type
}

/**
 * 获取菜单状态的显示标签
 *
 * @param status - 菜单状态枚举值
 * @returns 对应的中文标签，未匹配时返回原始值
 */
function getMenuStatusLabel(status: MenuStatus): string {
  const option = MENU_STATUS_OPTIONS.find(o => o.value === status)
  return option?.label ?? status
}

/**
 * 获取菜单类型对应的 Chip 颜色
 *
 * @param type - 菜单类型枚举值
 * @returns HeroUI Chip 组件的 color 属性值
 */
function getMenuTypeColor(type: MenuType): 'primary' | 'secondary' | 'warning' {
  const colorMap: Record<MenuType, 'primary' | 'secondary' | 'warning'> = {
    M: 'primary',
    C: 'secondary',
    F: 'warning'
  }
  return colorMap[type]
}

/**
 * 将扁平菜单数据转换为 antd Tree 树节点格式
 * 按 orderNum 升序排序，确保菜单树按配置顺序展示
 *
 * @param menus - 后端返回的扁平菜单列表
 * @param parentId - 父菜单ID，用于递归构建子树
 * @returns antd Tree 兼容的树节点数组
 */
function convertToTreeData(menus: SysMenu[], parentId: string = '0'): MenuNodeData[] {
  return menus
    .filter(menu => menu.parentId === parentId)
    .sort((a, b) => a.orderNum - b.orderNum)
    .map(menu => ({
      key: menu.id,
      title: menu.menuName,
      menuType: menu.menuType,
      status: menu.status,
      icon: menu.icon,
      path: menu.path,
      droppable: menu.menuType !== 'F',
      menuData: menu,
      children: convertToTreeData(menus, menu.id)
    }))
}

/**
 * 将嵌套菜单树展平为一维数组
 * 用于在扁平列表中按 ID 查找菜单项
 *
 * @param menus - 嵌套的菜单列表
 * @returns 展平后的一维菜单数组
 */
function flattenMenus(menus: SysMenu[]): SysMenu[] {
  const result: SysMenu[] = []
  const traverse = (items: SysMenu[]) => {
    for (const item of items) {
      result.push(item)
      if (item.children && item.children.length > 0) {
        traverse(item.children)
      }
    }
  }
  traverse(menus)
  return result
}

// ===== 图标动态解析工具 =====

/** Lucide 图标组件类型定义 */
type LucideIconComponent = React.ComponentType<{ size?: number; className?: string }>

/**
 * 将 kebab-case / snake_case 字符串转换为 PascalCase
 * 用于从 Lucide 图标库中按名称动态查找图标组件
 *
 * @param str - 原始字符串（如 'home', 'folder-tree'）
 * @returns PascalCase 格式字符串（如 'Home', 'FolderTree'）
 */
function toPascalCase(str: string): string {
  return str
    .split(/[-_\s]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('')
}

/**
 * 根据图标名称动态获取 Lucide 图标组件
 * 图标名称会自动转换为 PascalCase 以匹配 Lucide 导出键名
 *
 * @param iconName - 图标名称（如 'home', 'folder-tree'）
 * @returns 匹配的图标组件，未找到时返回 null
 */
function getLucideIcon(iconName: string): LucideIconComponent | null {
  const pascalName = toPascalCase(iconName)
  const IconComponent = (LucideIcons as Record<string, LucideIconComponent>)[pascalName]
  return IconComponent ?? null
}

/**
 * 渲染菜单图标
 * 根据图标名称动态解析并渲染对应的 Lucide 图标组件
 *
 * @param iconName - 图标名称
 * @param size - 图标尺寸，默认 16
 * @param className - 额外的 CSS 类名
 * @returns 渲染后的图标 JSX，未找到时返回 null
 */
function renderIcon(iconName?: string, size = 16, className?: string) {
  if (!iconName) return null
  const IconComponent = getLucideIcon(iconName)
  if (!IconComponent) return null
  return <IconComponent size={size} className={className} />
}

// ===== 5. 子组件区域 =====

/**
 * 图标选择组件
 *
 * 基于 Popover 实现的图标选择器，支持：
 * - 关键字搜索过滤图标
 * - 网格布局展示可选图标
 * - 选中状态高亮
 */
interface IconSelectProps {
  /** 当前选中的图标名称 */
  value?: string
  /** 图标变更回调 */
  onChange: (icon: string) => void
}

function IconSelect({ value, onChange }: IconSelectProps) {
  const [search, setSearch] = useState('')
  const filtered = AVAILABLE_ICONS.filter(name =>
    name.toLowerCase().includes(search.toLowerCase())
  )

  const SelectedIcon = value ? getLucideIcon(value) : null

  return (
    <Popover placement="bottom-start">
      <PopoverTrigger>
        <Button
          variant="bordered"
          className="w-full justify-start"
          startContent={
            SelectedIcon ? <SelectedIcon size={16} className="text-default-500" /> : null
          }
        >
          {value || '选择图标'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72">
        <div className="p-2 space-y-2">
          <Input
            size="sm"
            placeholder="搜索图标..."
            value={search}
            onValueChange={setSearch}
            startContent={<Search size={14} />}
          />
          <div className="grid grid-cols-6 gap-1 max-h-48 overflow-y-auto">
            {filtered.map(name => {
              const IconComponent = getLucideIcon(name)
              return (
                <Tooltip key={name} content={name} size="sm" delay={300}>
                  <button
                    className={cn(
                      'p-2 rounded-md text-center transition-colors hover:bg-primary/10',
                      value === name && 'bg-primary/20 text-primary'
                    )}
                    onClick={() => onChange(name)}
                  >
                    {IconComponent
                      ? <IconComponent size={18} />
                      : <span className="text-xs">{name.slice(0, 2)}</span>
                    }
                  </button>
                </Tooltip>
              )
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

/**
 * 菜单编辑弹窗组件
 *
 * 支持新增和编辑两种模式：
 * - 新增模式：根据父菜单自动填充默认值（菜单类型、路径、状态等）
 * - 编辑模式：回填当前菜单数据
 *
 * 自动填充规则：
 * - 一级菜单：menuType 默认为 M（目录），其余使用系统默认值
 * - 父菜单为 M（目录）：menuType 默认为 C（菜单），继承父菜单路径
 * - 父菜单为 C（菜单）/ F（按钮）：menuType 默认为 F（按钮），继承父菜单路径和组件路径
 * - orderNum 自动取同级菜单数量 + 1
 */
interface MenuEditModalProps {
  /** 弹窗是否打开 */
  isOpen: boolean
  /** 弹窗打开/关闭状态变更回调 */
  onOpenChange: (open: boolean) => void
  /** 编辑模式下的原始菜单数据 */
  menuData: SysMenu | null
  /** 父菜单 ID，顶级菜单传 '0' */
  parentId: string
  /** 父菜单完整数据，用于自动填充子菜单默认值 */
  parentMenu: SysMenu | null
  /** 操作模式：create-新增 / edit-编辑 */
  mode: 'create' | 'edit'
  /** 同级菜单数量，用于自动计算下一个排序号 */
  siblingCount: number
  /** 操作成功后的回调 */
  onSuccess: () => void
}

function MenuEditModal({ isOpen, onOpenChange, menuData, parentId, parentMenu, mode, siblingCount, onSuccess }: MenuEditModalProps) {
  // ===== 状态控制逻辑区域 =====

  /**
   * 根据父菜单类型推断新增菜单的默认类型
   * 遵循层级递进规则：目录(M) → 菜单(C) → 按钮(F)
   */
  const getDefaultMenuType = useCallback((): MenuType => {
    if (mode === 'edit') return menuData?.menuType ?? 'M'
    if (!parentMenu || parentId === '0') return 'M'
    if (parentMenu.menuType === 'M') return 'C'
    return 'F'
  }, [mode, menuData, parentMenu, parentId])

  /**
   * 根据父菜单信息生成新增菜单的默认表单数据
   * 自动继承父菜单的路径、状态、权限标识等属性
   */
  const getDefaultFormData = useCallback((): SysMenuCreateInput & { id?: string } => {
    const nextOrderNum = siblingCount + 1
    const isTopLevel = !parentMenu || parentId === '0'

    if (isTopLevel) {
      return {
        menuName: '',
        parentId: '0',
        menuType: 'M',
        path: '',
        component: '',
        perms: '',
        icon: '',
        status: '0',
        orderNum: nextOrderNum,
        visible: '0',
        isFrame: 1,
        isCache: 0,
        query: '',
        remark: ''
      }
    }

    return {
      menuName: '',
      parentId: parentMenu.id,
      menuType: getDefaultMenuType(),
      path: parentMenu.path ?? '',
      component: parentMenu.menuType === 'M' ? '' : (parentMenu.component ?? ''),
      perms: parentMenu.perms ?? '',
      icon: '',
      status: parentMenu.status,
      orderNum: nextOrderNum,
      visible: parentMenu.visible ?? '0',
      isFrame: parentMenu.isFrame ?? 1,
      isCache: parentMenu.isCache ?? 0,
      query: '',
      remark: ''
    }
  }, [parentMenu, parentId, siblingCount, getDefaultMenuType])

  const [formData, setFormData] = useState<SysMenuCreateInput & { id?: string }>({
    menuName: '',
    parentId: '0',
    menuType: 'M',
    path: '',
    component: '',
    perms: '',
    icon: '',
    status: '0',
    orderNum: 0,
    visible: '0',
    isFrame: 1,
    isCache: 0,
    query: '',
    remark: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ===== 页面初始化与事件绑定 =====

  /** 弹窗打开时根据模式初始化表单数据 */
  useEffect(() => {
    if (mode === 'edit' && menuData) {
      setFormData({
        id: menuData.id,
        menuName: menuData.menuName,
        parentId: menuData.parentId,
        menuType: menuData.menuType,
        path: menuData.path ?? '',
        component: menuData.component ?? '',
        perms: menuData.perms ?? '',
        icon: menuData.icon ?? '',
        status: menuData.status,
        orderNum: menuData.orderNum,
        visible: menuData.visible ?? '0',
        isFrame: menuData.isFrame ?? 1,
        isCache: menuData.isCache ?? 0,
        query: menuData.query ?? '',
        remark: menuData.remark ?? ''
      })
    } else {
      setFormData(getDefaultFormData())
    }
  }, [mode, menuData, parentId, parentMenu, siblingCount, isOpen, getDefaultFormData])

  // ===== 通用工具函数区域 =====

  /** 更新表单指定字段的值 */
  const handleFieldChange = useCallback(<K extends keyof SysMenuCreateInput>(key: K, value: SysMenuCreateInput[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }, [])

  // ===== 错误处理函数区域 =====

  // ===== 数据处理函数区域 =====

  /**
   * 提交表单数据
   * 根据模式执行新增或修改操作，成功后关闭弹窗并刷新列表
   */
  const handleSubmit = useCallback(async () => {
    if (!formData.menuName.trim()) {
      toast.warning('请输入菜单名称')
      return
    }
    if (!formData.menuType) {
      toast.warning('请选择菜单类型')
      return
    }

    setIsSubmitting(true)
    try {
      if (mode === 'edit' && formData.id) {
        const updateData: SysMenuUpdateInput = {
          id: formData.id,
          menuName: formData.menuName,
          parentId: formData.parentId,
          menuType: formData.menuType,
          path: formData.path || undefined,
          component: formData.component || undefined,
          perms: formData.perms || undefined,
          icon: formData.icon || undefined,
          status: formData.status,
          orderNum: formData.orderNum,
          visible: formData.visible,
          isFrame: formData.isFrame,
          isCache: formData.isCache,
          query: formData.query || undefined,
          remark: formData.remark || undefined
        }
        await updateMenu(updateData)
        toast.success('菜单修改成功')
      } else {
        const createData: SysMenuCreateInput = {
          menuName: formData.menuName,
          parentId: formData.parentId,
          menuType: formData.menuType,
          path: formData.path || undefined,
          component: formData.component || undefined,
          perms: formData.perms || undefined,
          icon: formData.icon || undefined,
          status: formData.status,
          orderNum: formData.orderNum,
          visible: formData.visible,
          isFrame: formData.isFrame,
          isCache: formData.isCache,
          query: formData.query || undefined,
          remark: formData.remark || undefined
        }
        await createMenu(createData)
        toast.success('菜单创建成功')
      }
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : '操作失败，请稍后重试'
      toast.error(message)
      console.error('菜单操作失败：', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, mode, onSuccess, onOpenChange])

  // ===== UI渲染逻辑区域 =====

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="2xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader>
          {mode === 'create'
            ? (parentMenu ? `新增子菜单（${parentMenu.menuName}）` : '新增一级菜单')
            : '编辑菜单'}
        </ModalHeader>
        <ModalBody className="gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="菜单名称"
              placeholder="请输入菜单名称"
              isRequired
              value={formData.menuName}
              onValueChange={v => handleFieldChange('menuName', v)}
            />
            <Select
              label="菜单类型"
              placeholder="请选择菜单类型"
              isRequired
              selectedKeys={[formData.menuType]}
              onSelectionChange={keys => {
                const value = Array.from(keys)[0] as MenuType
                handleFieldChange('menuType', value)
              }}
            >
              {MENU_TYPE_OPTIONS.map(option => (
                <SelectItem key={option.value} description={option.description}>
                  {option.label}
                </SelectItem>
              ))}
            </Select>
            <Input
              label="路由路径"
              placeholder="请输入路由路径"
              value={formData.path ?? ''}
              onValueChange={v => handleFieldChange('path', v)}
            />
            <Input
              label="组件路径"
              placeholder="请输入组件路径"
              value={formData.component ?? ''}
              onValueChange={v => handleFieldChange('component', v)}
            />
            <Input
              label="权限标识"
              placeholder="请输入权限标识"
              value={formData.perms ?? ''}
              onValueChange={v => handleFieldChange('perms', v)}
            />
            <Input
              label="显示顺序"
              type="number"
              placeholder="请输入显示顺序"
              value={String(formData.orderNum ?? 0)}
              onValueChange={v => handleFieldChange('orderNum', Number(v))}
            />
            <Select
              label="菜单状态"
              placeholder="请选择菜单状态"
              selectedKeys={[formData.status ?? '0']}
              onSelectionChange={keys => {
                const value = Array.from(keys)[0] as MenuStatus
                handleFieldChange('status', value)
              }}
            >
              {MENU_STATUS_OPTIONS.map(option => (
                <SelectItem key={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </Select>
            <Select
              label="是否显示"
              placeholder="请选择"
              selectedKeys={[formData.visible ?? '0']}
              onSelectionChange={keys => {
                const value = Array.from(keys)[0] as '0' | '1'
                handleFieldChange('visible', value)
              }}
            >
              <SelectItem key="0">显示</SelectItem>
              <SelectItem key="1">隐藏</SelectItem>
            </Select>
            <Select
              label="是否外链"
              placeholder="请选择"
              selectedKeys={[String(formData.isFrame ?? 1)]}
              onSelectionChange={keys => {
                const value = Number(Array.from(keys)[0])
                handleFieldChange('isFrame', value)
              }}
            >
              <SelectItem key="0">是</SelectItem>
              <SelectItem key="1">否</SelectItem>
            </Select>
            <Select
              label="是否缓存"
              placeholder="请选择"
              selectedKeys={[String(formData.isCache ?? 0)]}
              onSelectionChange={keys => {
                const value = Number(Array.from(keys)[0])
                handleFieldChange('isCache', value)
              }}
            >
              <SelectItem key="0">缓存</SelectItem>
              <SelectItem key="1">不缓存</SelectItem>
            </Select>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-foreground">菜单图标</span>
              <IconSelect
                value={formData.icon ?? ''}
                onChange={v => handleFieldChange('icon', v)}
              />
            </div>
            <Input
              label="路由参数"
              placeholder="请输入路由参数"
              value={formData.query ?? ''}
              onValueChange={v => handleFieldChange('query', v)}
            />
          </div>
          <Textarea
            label="备注"
            placeholder="请输入备注信息"
            value={formData.remark ?? ''}
            onValueChange={v => handleFieldChange('remark', v)}
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
            onPress={handleSubmit}
          >
            {mode === 'create' ? '创建' : '保存'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

// ===== 11. 导出区域 =====

/**
 * 菜单管理主页面组件
 *
 * 页面布局：
 * - 左侧卡片：菜单树结构，支持展开/折叠/拖拽排序
 * - 右侧卡片：查询工具栏 + 菜单详情表格
 *
 * 数据流：
 * - getMenuList → menuList → treeData（左侧树）/ tableData（右侧表格）
 * - 选中树节点 → selectedMenuId → 过滤右侧表格展示对应子菜单
 */
export default function PersonnelMenu() {
  // ===== 3. 状态控制逻辑区域 =====

  /** 菜单列表数据（后端返回的树形结构） */
  const [menuList, setMenuList] = useState<SysMenu[]>([])
  /** 列表加载状态 */
  const [isLoading, setIsLoading] = useState(false)
  /** 当前选中的菜单节点 ID */
  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null)
  /** 表格多选选中的行 key 集合 */
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())
  /** 查询参数 */
  const [queryParams, setQueryParams] = useState<SysMenuQueryParams>({})
  /** antd Tree 展开的节点 key 列表 */
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([])

  /** 编辑弹窗控制 */
  const editModal = useDisclosure()
  /** 编辑模式：create-新增 / edit-编辑 */
  const [editMode, setEditMode] = useState<'create' | 'edit'>('create')
  /** 编辑中的菜单数据 */
  const [editingMenu, setEditingMenu] = useState<SysMenu | null>(null)
  /** 新增菜单的父菜单 ID */
  const [createParentId, setCreateParentId] = useState('0')
  /** 新增菜单的父菜单完整数据，用于自动填充默认值 */
  const [createParentMenu, setCreateParentMenu] = useState<SysMenu | null>(null)

  // ===== 7. 数据处理函数区域 =====

  /** 将后端菜单数据转换为树节点格式，按 orderNum 排序 */
  const treeData = useMemo(() => convertToTreeData(menuList), [menuList])

  /** 当前选中的菜单完整数据 */
  const selectedMenu = useMemo(() => {
    if (!selectedMenuId) return null
    const flatList = flattenMenus(menuList)
    return flatList.find(m => m.id === selectedMenuId) ?? null
  }, [selectedMenuId, menuList])

  /**
   * 右侧表格展示的数据
   * - 选中菜单节点 → 展示其子菜单列表
   * - 未选中节点 → 展示一级菜单列表
   * 结果按 orderNum 升序排列
   */
  const tableData = useMemo(() => {
    let data: SysMenu[] = []

    if (selectedMenu) {
      data = menuList.filter(m => m.parentId === selectedMenu.id)
    } else if (!selectedMenuId) {
      data = menuList.filter(m => m.parentId === '0')
    }

    if (queryParams.menuName) {
      data = data.filter(m =>
        m.menuName.toLowerCase().includes(queryParams.menuName!.toLowerCase())
      )
    }
    if (queryParams.status) {
      data = data.filter(m => m.status === queryParams.status)
    }
    if (queryParams.menuType) {
      data = data.filter(m => m.menuType === queryParams.menuType)
    }

    data.sort((a, b) => a.orderNum - b.orderNum)

    return data
  }, [selectedMenu, selectedMenuId, menuList, queryParams])

  /**
   * 新增菜单时同级菜单的数量
   * 用于自动计算下一个排序号（orderNum = siblingCount + 1）
   */
  const createSiblingCount = useMemo(() => {
    return menuList.filter(m => m.parentId === createParentId).length
  }, [createParentId, menuList])

  // ===== 6. 错误处理函数区域 =====

  /**
   * 获取菜单列表数据
   * 失败时显示错误提示
   */
  const fetchMenuList = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getMenuList()
      setMenuList(data)
    } catch (error) {
      console.error('获取菜单列表失败：', error)
      toast.error('获取菜单列表失败')
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * 删除菜单
   * 支持批量删除（逗号分隔的 ID 列表）
   *
   * @param ids - 待删除的菜单 ID 数组
   */
  const handleDeleteMenu = useCallback(async (ids: string[]) => {
    try {
      await deleteMenu(ids.join(','))
      toast.success('删除成功')
      fetchMenuList()
      setSelectedKeys(new Set())
    } catch (error) {
      const message = error instanceof Error ? error.message : '删除失败'
      toast.error(message)
      console.error('删除菜单失败：', error)
    }
  }, [fetchMenuList])

  /**
   * 切换菜单状态
   * @param id - 菜单ID
   * @param status - 目标状态
   */
  const handleToggleMenuStatus = useCallback(async (id: string, status: MenuStatus) => {
    try {
      await updateMenu({ id, status })
      toast.success('状态切换成功')
      fetchMenuList()
    } catch (error) {
      const message = error instanceof Error ? error.message : '状态切换失败'
      toast.error(message)
      console.error('切换菜单状态失败：', error)
    }
  }, [fetchMenuList])

  // ===== 9. 页面初始化与事件绑定 =====

  /** 页面挂载时加载菜单列表 */
  useEffect(() => {
    fetchMenuList()
  }, [fetchMenuList])

  /**
   * antd Tree 节点选中事件
   * 更新当前选中的菜单 ID，右侧表格随之切换展示内容
   */
  const handleTreeSelect: TreeProps['onSelect'] = useCallback((selectedKeysValue: React.Key[]) => {
    if (selectedKeysValue.length > 0) {
      setSelectedMenuId(String(selectedKeysValue[0]))
    } else {
      setSelectedMenuId(null)
    }
  }, [])

  /**
   * antd Tree 节点展开/折叠事件
   */
  const handleExpand: TreeProps['onExpand'] = useCallback((expandedKeysValue: React.Key[]) => {
    setExpandedKeys(expandedKeysValue)
  }, [])

  /**
   * 打开新增菜单弹窗
   * 根据父菜单 ID 查找父菜单数据，用于自动填充表单默认值
   *
   * @param parentId - 父菜单 ID，不传或 '0' 表示新增一级菜单
   */
  const handleCreateMenu = useCallback((parentId?: string) => {
    setEditMode('create')
    setEditingMenu(null)
    const pid = parentId ?? '0'
    setCreateParentId(pid)
    if (pid === '0') {
      setCreateParentMenu(null)
    } else {
      const flatList = flattenMenus(menuList)
      const parent = flatList.find(m => m.id === pid) ?? null
      setCreateParentMenu(parent)
    }
    editModal.onOpen()
  }, [editModal, menuList])

  /**
   * 打开编辑菜单弹窗
   * 回填当前菜单数据到表单
   *
   * @param menu - 待编辑的菜单数据
   */
  const handleEditMenu = useCallback((menu: SysMenu) => {
    setEditMode('edit')
    setEditingMenu(menu)
    editModal.onOpen()
  }, [editModal])

  /**
   * 批量删除选中的菜单
   * 未选中任何菜单时给出提示
   */
  const handleBatchDelete = useCallback(() => {
    if (selectedKeys.size === 0) {
      toast.warning('请选择要删除的菜单')
      return
    }
    handleDeleteMenu(Array.from(selectedKeys))
  }, [selectedKeys, handleDeleteMenu])

  /**
   * 在树形数据中按 key 查找节点及其父节点信息
   * 用于拖拽时判断目标节点的层级和类型
   */
  const findNodeInTree = useCallback((nodes: MenuNodeData[], targetKey: React.Key): {
    node: MenuNodeData | null
    parent: MenuNodeData | null
    depth: number
  } => {
    const find = (items: MenuNodeData[], parent: MenuNodeData | null, depth: number): {
      node: MenuNodeData | null
      parent: MenuNodeData | null
      depth: number
    } => {
      for (const item of items) {
        if (item.key === targetKey) {
          return { node: item, parent, depth }
        }
        if (item.children) {
          const result = find(item.children, item, depth + 1)
          if (result.node) return result
        }
      }
      return { node: null, parent: null, depth: 0 }
    }
    return find(nodes, null, 0)
  }, [])

  /**
   * antd Tree 拖拽放置事件
   * 支持拖拽到二级菜单（目录/菜单类型），按钮类型节点禁止作为放置目标
   * 先乐观更新本地状态，再调用批量更新接口同步到后端
   * 失败时回滚到快照数据
   */
  const handleDrop: TreeProps['onDrop'] = useCallback(async (info: {
    dragNode: { key: React.Key }
    node: { key: React.Key }
    dropPosition: number
    dropToGap: boolean
  }) => {
    const dragKey = info.dragNode.key
    const dropKey = info.node.key
    const dropPosition = info.dropPosition
    const dropToGap = info.dropToGap

    const dropInfo = findNodeInTree(treeData, dropKey)

    if (!dropInfo.node) return

    if (!dropToGap && dropInfo.node.menuType === 'F') {
      toast.warning('按钮类型节点不能作为父节点')
      return
    }

    if (!dropToGap && dropInfo.depth >= 2) {
      toast.warning('最多支持二级菜单层级')
      return
    }

    if (dropToGap && dropInfo.depth > 2) {
      toast.warning('最多支持二级菜单层级')
      return
    }

    const snapshot = menuList

    try {
      setMenuList(prev => {
        const updated = JSON.parse(JSON.stringify(prev)) as SysMenu[]

        const dragNodes: SysMenu[] = []
        const removeNode = (list: SysMenu[], id: string): boolean => {
          const idx = list.findIndex(m => m.id === id)
          if (idx !== -1) {
            dragNodes.push(list[idx])
            list.splice(idx, 1)
            return true
          }
          for (const item of list) {
            if (item.children && removeNode(item.children, id)) return true
          }
          return false
        }

        removeNode(updated, String(dragKey))

        const dragNode = dragNodes[0]
        if (!dragNode) return prev

        if (dropToGap) {
          const dropParentId = dropInfo.parent?.key
          const newParentId = dropParentId ? String(dropParentId) : '0'

          const insertInto = (list: SysMenu[], targetParentId: string, insertIndex: number): boolean => {
            if (targetParentId === '0') {
              const targetIdx = list.findIndex(m => m.id === String(dropKey))
              if (targetIdx !== -1) {
                const finalIdx = dropPosition < 0 ? targetIdx : Math.min(dropPosition, list.length)
                list.splice(finalIdx, 0, dragNode)
                return true
              }
            }
            for (const item of list) {
              if (item.id === targetParentId) {
                if (!item.children) item.children = []
                const targetIdx = item.children.findIndex(m => m.id === String(dropKey))
                if (targetIdx !== -1) {
                  const finalIdx = dropPosition < 0 ? targetIdx : Math.min(dropPosition, item.children.length)
                  item.children.splice(finalIdx, 0, dragNode)
                  return true
                }
              }
              if (item.children && insertInto(item.children, targetParentId, insertIndex)) return true
            }
            return false
          }

          insertInto(updated, newParentId, dropPosition)
          dragNode.parentId = newParentId
        } else {
          const insertAsChild = (list: SysMenu[]): boolean => {
            for (const item of list) {
              if (item.id === String(dropKey)) {
                if (!item.children) item.children = []
                item.children.push(dragNode)
                dragNode.parentId = item.id
                return true
              }
              if (item.children && insertAsChild(item.children)) return true
            }
            return false
          }

          insertAsChild(updated)
        }

        return updated
      })

      const newParentId = dropToGap
        ? (dropInfo.parent?.key ? String(dropInfo.parent.key) : '0')
        : String(dropKey)

      const batchData: SysMenuBatchUpdate[] = [{
        id: String(dragKey),
        parentId: newParentId,
        orderNum: Math.max(0, dropPosition)
      }]

      await batchUpdateMenu(batchData)
      toast.success('排序更新成功')
    } catch (error) {
      console.error('排序更新失败：', error)
      toast.error('排序更新失败，已恢复')
      setMenuList(snapshot)
    }
  }, [menuList, treeData, findNodeInTree])

  /**
   * antd Tree 是否允许放置
   * 按钮类型节点（F）禁止拖入子节点
   */
  const allowDrop: TreeProps['allowDrop'] = useCallback(({ dropNode, dropPosition }: {
    dropNode: { key: React.Key; menuType?: MenuType }
    dropPosition: number
  }) => {
    const nodeData = dropNode as unknown as MenuNodeData
    if (nodeData.menuType === 'F' && dropPosition === 0) {
      return false
    }
    return true
  }, [])

  /** 更新查询参数中的指定字段 */
  const handleQueryChange = useCallback(<K extends keyof SysMenuQueryParams>(key: K, value: SysMenuQueryParams[K]) => {
    setQueryParams(prev => ({ ...prev, [key]: value }))
  }, [])

  /** 重置查询条件 */
  const handleResetQuery = useCallback(() => {
    setQueryParams({})
  }, [])

  // ===== 8. UI渲染逻辑区域 =====

  /**
   * antd Tree 自定义节点渲染
   * 展示每个菜单节点：类型图标 + 菜单名称 + 类型标签
   */
  const renderTreeTitle = useCallback((nodeData: DataNode) => {
    const data = nodeData as unknown as MenuNodeData
    const menuType = data.menuType
    const status = data.status
    const isDisabled = status === '1'

    const TypeIcon = menuType === 'M' ? MenuIcon : menuType === 'C' ? Folder : MousePointerClick
    const CustomIcon = data.icon ? getLucideIcon(data.icon) : null
    const DisplayIcon = CustomIcon || TypeIcon

    return (
      <div
        className={cn(
          'flex items-center gap-2 py-1 cursor-pointer',
          isDisabled && 'opacity-50'
        )}
      >
        <DisplayIcon size={16} className="flex-shrink-0 text-default-400" />
        <span className="truncate text-sm">{data.title}</span>
        <Chip
          size="sm"
          variant="flat"
          color={getMenuTypeColor(menuType)}
          className="ml-auto flex-shrink-0 text-tiny"
        >
          {getMenuTypeLabel(menuType)}
        </Chip>
      </div>
    )
  }, [])

  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-4 p-4 md:p-0 h-full">
      {/* 左侧菜单树 */}
      <Card className="w-full md:w-[35%] md:min-w-[280px] md:flex-shrink-0 max-h-[40vh] md:max-h-full">
        <CardBody className="p-0 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-divider">
            <div className="flex items-center gap-2">
              <FolderTree size={18} className="text-primary" />
              <span className="font-semibold text-sm">菜单结构</span>
            </div>
            <div className="flex items-center gap-1">
              <Tooltip content="新增一级菜单" size="sm">
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onPress={() => handleCreateMenu('0')}
                >
                  <Plus size={16} />
                </Button>
              </Tooltip>
              <Tooltip content="刷新" size="sm">
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onPress={fetchMenuList}
                  isLoading={isLoading}
                >
                  <RefreshCw size={16} />
                </Button>
              </Tooltip>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-3">
            {isLoading ? (
              <StatusState type="loading" scene="admin" />
            ) : treeData.length > 0 ? (
              <Tree
                treeData={treeData as DataNode[]}
                selectable
                selectedKeys={selectedMenuId ? [selectedMenuId] : []}
                expandedKeys={expandedKeys}
                onSelect={handleTreeSelect}
                onExpand={handleExpand}
                draggable
                blockNode
                allowDrop={allowDrop}
                onDrop={handleDrop}
                titleRender={renderTreeTitle}
                className="p-2 bg-default-900"
              />
            ) : (
              <StatusState type="empty" scene="admin" />
            )}
          </div>
        </CardBody>
      </Card>

      {/* 右侧内容区 */}
      <Card className="flex-1 min-w-0">
        <CardBody className="p-0 flex flex-col overflow-hidden">
          {/* 查询工具栏 */}
          <div className="p-3 py-3 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Input
                size="sm"
                placeholder="菜单名称"
                className="w-full sm:w-40"
                value={queryParams.menuName ?? ''}
                onValueChange={v => handleQueryChange('menuName', v || undefined)}
                startContent={<Search size={14} className="text-default-400" />}
                isClearable
                onClear={() => handleQueryChange('menuName', undefined)}
              />
              <Select
                size="sm"
                placeholder="菜单状态"
                className="w-full sm:w-28"
                aria-label="菜单状态筛选"
                selectedKeys={queryParams.status ? [queryParams.status] : []}
                onSelectionChange={keys => {
                  const value = Array.from(keys)[0] as MenuStatus | undefined
                  handleQueryChange('status', value)
                }}
              >
                {MENU_STATUS_OPTIONS.map(option => (
                  <SelectItem key={option.value}>{option.label}</SelectItem>
                ))}
              </Select>
              <Select
                size="sm"
                placeholder="菜单类型"
                className="w-full sm:w-28"
                aria-label="菜单类型筛选"
                selectedKeys={queryParams.menuType ? [queryParams.menuType] : []}
                onSelectionChange={keys => {
                  const value = Array.from(keys)[0] as MenuType | undefined
                  handleQueryChange('menuType', value)
                }}
              >
                {MENU_TYPE_OPTIONS.map(option => (
                  <SelectItem key={option.value}>{option.label}</SelectItem>
                ))}
              </Select>
              <Button size="sm" variant="flat" onPress={handleResetQuery}>
                重置
              </Button>
              <div className="hidden sm:flex-1" />
              <Button
                size="sm"
                color="primary"
                startContent={<Plus size={14} />}
                onPress={() => handleCreateMenu(selectedMenuId ?? '0')}
              >
                {selectedMenuId ? '新增子菜单' : '新增菜单'}
              </Button>
              {selectedKeys.size > 0 && (
                <Button
                  size="sm"
                  color="danger"
                  variant="flat"
                  startContent={<Trash2 size={14} />}
                  onPress={handleBatchDelete}
                >
                  批量删除({selectedKeys.size})
                </Button>
              )}
            </div>
            {selectedMenu && (
              <div className="flex items-center gap-1 text-xs text-default-400">
                <span>当前选中：</span>
                <Chip size="sm" variant="flat" color="primary">{selectedMenu.menuName}</Chip>
                <span>下的子菜单</span>
              </div>
            )}
          </div>

          {/* 菜单详情列表 */}
          <div className="flex-1 p-3 overflow-auto">
            <Table
              aria-label="菜单详情列表"
              selectionMode="multiple"
              selectedKeys={selectedKeys}
              onSelectionChange={keys => setSelectedKeys(keys as Set<string>)}
                classNames={{
                  wrapper: 'p-0',
                  thead: '[&>tr]:first:shadow-none',
                }}
            >
              <TableHeader>
                <TableColumn key="menuName">菜单名称</TableColumn>
                <TableColumn key="icon">图标</TableColumn>
                <TableColumn key="menuType">类型</TableColumn>
                <TableColumn key="path" className="hidden md:table-cell">路由路径</TableColumn>
                <TableColumn key="perms" className="hidden lg:table-cell">权限标识</TableColumn>
                <TableColumn key="orderNum">排序</TableColumn>
                <TableColumn key="status">状态</TableColumn>
                <TableColumn key="actions">操作</TableColumn>
              </TableHeader>
              <TableBody
                items={tableData.map(item => ({ ...item, key: item.id }))}
                emptyContent={
                    selectedMenuId 
                      ? <StatusState type="empty" scene="admin" title="暂无子菜单" description="该菜单下暂无子菜单" />
                      : <StatusState type="empty" scene="admin" />
                  }
              >
                {(item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <span className="font-medium text-sm">{item.menuName}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center">
                        {renderIcon(item.icon, 16, 'text-default-400') || <span className="text-xs text-default-300">-</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip size="sm" variant="flat" color={getMenuTypeColor(item.menuType)}>
                        {getMenuTypeLabel(item.menuType)}
                      </Chip>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="text-xs text-default-500 font-mono">{item.path || '-'}</span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="text-xs text-default-500 font-mono">{item.perms || '-'}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{item.orderNum}</span>
                    </TableCell>
                    <TableCell>
                      <Switch
                        size="sm"
                        color="primary"
                        isSelected={String(item.status) === '0'}
                        onValueChange={(isSelected) => handleToggleMenuStatus(item.id, isSelected ? '0' : '1')}
                        aria-label={getMenuStatusLabel(item.status as MenuStatus)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Tooltip content="编辑" size="sm">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            onPress={() => handleEditMenu(item)}
                          >
                            <Pencil size={14} className="text-default-400" />
                          </Button>
                        </Tooltip>
                        <Tooltip content="新增子菜单" size="sm">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            onPress={() => handleCreateMenu(item.id)}
                          >
                            <Plus size={14} className="text-default-400" />
                          </Button>
                        </Tooltip>
                        <Tooltip content="删除" size="sm">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            color="danger"
                            onPress={() => handleDeleteMenu([item.id])}
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
          </div>
        </CardBody>
      </Card>

      {/* 菜单编辑弹窗 */}
      <MenuEditModal
        isOpen={editModal.isOpen}
        onOpenChange={editModal.onOpenChange}
        menuData={editingMenu}
        parentId={createParentId}
        parentMenu={createParentMenu}
        mode={editMode}
        siblingCount={createSiblingCount}
        onSuccess={fetchMenuList}
      />
    </div>
  )
}
