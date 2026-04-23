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
import React, { useState, useEffect, useCallback, useMemo } from 'react'

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
  useDisclosure,
  Tooltip,
  Popover,
  PopoverTrigger,
  PopoverContent,
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
  ArrowLeft
} from 'lucide-react'

// antd 组件
import { Tree } from 'antd'
import type { TreeProps, DataNode } from 'antd/es/tree'

// 工具函数
import { toast } from '@/utils/toast'
import { cn } from '@/utils'
import { AVAILABLE_ICONS, getLucideIcon, renderIcon } from '@/utils/icons'

// 通用状态组件
import { StatusState } from '@/components/ui/StatusState'
import ConfirmPopover from '@/components/ui/ConfirmPopover'

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

// 图标列表从 @/utils/icons 导入
const MAX_MENU_DEPTH = 2

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

const IconSelect = React.memo(function IconSelect({ value, onChange }: IconSelectProps) {
  const [search, setSearch] = useState('')
  const filtered = useMemo(() => {
    if (!search) return AVAILABLE_ICONS
    const lowerSearch = search.toLowerCase()
    return AVAILABLE_ICONS.filter(name => name.toLowerCase().includes(lowerSearch))
  }, [search])

  const SelectedIcon = useMemo(() => value ? getLucideIcon(value) : null, [value])

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
      <PopoverContent className="w-80">
        <div className="p-2 space-y-2">
          <Input
            size="sm"
            placeholder="搜索图标..."
            value={search}
            onValueChange={setSearch}
            startContent={<Search size={14} />}
          />
          <div className="grid grid-cols-8 gap-1">
            {filtered.map(name => {
              const IconComponent = getLucideIcon(name)
              return (
                <button
                  key={name}
                  title={name}
                  className={cn(
                    'p-2 rounded-md text-center transition-colors hover:bg-primary/10',
                    value === name && 'bg-primary/20 text-primary'
                  )}
                  onClick={() => onChange(name)}
                  aria-label={`选择图标: ${name}`}
                >
                  {IconComponent
                    ? <IconComponent size={18} />
                    : <span className="text-xs">{name.slice(0, 2)}</span>
                  }
                </button>
              )
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
})

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

const MenuEditModal = React.memo(function MenuEditModal({ 
  isOpen, 
  onOpenChange, 
  menuData, 
  parentId, 
  parentMenu, 
  mode, 
  siblingCount, 
  onSuccess 
}: MenuEditModalProps) {
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
    if (!isOpen) return
    
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
  }, [isOpen, mode, menuData, getDefaultFormData])

  // ===== 通用工具函数区域 =====

  /** 更新表单指定字段的值 */
  const handleFieldChange = useCallback(<K extends keyof SysMenuCreateInput>(key: K, value: SysMenuCreateInput[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }, [])

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
              aria-label="菜单类型"
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
              aria-label="菜单状态"
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
              aria-label="是否显示"
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
              aria-label="是否外链"
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
              aria-label="是否缓存"
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
})

// ===== 6. 树节点渲染组件 =====

interface TreeTitleProps {
  menuType: MenuType
  status: MenuStatus
  title: string
  icon?: string
}

const TreeTitle = React.memo(function TreeTitle({ menuType, status, title, icon }: TreeTitleProps) {
  const isDisabled = status === '1'
  const TypeIcon = menuType === 'M' ? MenuIcon : menuType === 'C' ? Folder : MousePointerClick
  const CustomIcon = useMemo(() => icon ? getLucideIcon(icon) : null, [icon])
  const DisplayIcon = CustomIcon || TypeIcon

  return (
    <div
      className={cn(
        'flex items-center gap-2 py-1 cursor-pointer',
        isDisabled && 'opacity-50'
      )}
    >
      <DisplayIcon size={16} className="flex-shrink-0 text-default-400" />
      <span className="truncate text-sm">{title}</span>
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
})

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

  /** 展平的菜单列表，用于快速查找 */
  const flatMenuList = useMemo(() => flattenMenus(menuList), [menuList])

  /** 当前选中的菜单完整数据 */
  const selectedMenu = useMemo(() => {
    if (!selectedMenuId) return null
    return flatMenuList.find(m => m.id === selectedMenuId) ?? null
  }, [selectedMenuId, flatMenuList])

  const nodeLevelMap = useMemo(() => {
    const map = new Map<string, number>()
    const parentIndex = new Map<string, string>()
    for (const menu of flatMenuList) {
      parentIndex.set(menu.id, menu.parentId)
    }

    const getLevel = (id: string): number => {
      if (map.has(id)) return map.get(id)!
      const pid = parentIndex.get(id)
      if (!pid || pid === '0') {
        map.set(id, 1)
        return 1
      }
      const level = getLevel(pid) + 1
      map.set(id, level)
      return level
    }

    for (const menu of flatMenuList) {
      getLevel(menu.id)
    }
    return map
  }, [flatMenuList])

  /**
   * 获取节点层级（使用预计算的映射）
   */
  const getNodeLevel = useCallback((menuId: string): number => {
    return nodeLevelMap.get(menuId) ?? 1
  }, [nodeLevelMap])

  /**
   * 右侧表格展示的数据
   * - 选中菜单节点 → 展示其子菜单列表
   * - 未选中节点 → 展示一级菜单列表
   * 结果按 orderNum 升序排列
   */
  const tableData = useMemo(() => {
    const parentId = selectedMenu?.id ?? '0'
    
    let data = menuList.filter(m => m.parentId === parentId)

    const { menuName, status, menuType } = queryParams
    if (menuName) {
      const lowerName = menuName.toLowerCase()
      data = data.filter(m => m.menuName.toLowerCase().includes(lowerName))
    }
    if (status) {
      data = data.filter(m => m.status === status)
    }
    if (menuType) {
      data = data.filter(m => m.menuType === menuType)
    }

    data.sort((a, b) => a.orderNum - b.orderNum)

    return data
  }, [selectedMenu, menuList, queryParams])

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
      const parent = flatMenuList.find(m => m.id === pid) ?? null
      setCreateParentMenu(parent)
    }
    editModal.onOpen()
  }, [editModal, flatMenuList])

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
   * antd Tree 拖拽放置事件
   * 使用 antd 内置的拖拽参数处理：
   * - dropPosition: -1=前置, 0=子节点, 1=后置
   * - dropToGap: 是否放置到间隙中
   * 
   * 先调用后端批量更新接口，成功后刷新菜单列表
   */
  const handleDrop: TreeProps['onDrop'] = useCallback(async (info: {
    dragNode: { key: React.Key }
    node: { key: React.Key }
    dropPosition: number
    dropToGap: boolean
  }) => {
    const dragKey = String(info.dragNode.key)
    const dropKey = String(info.node.key)
    const dropPosition = info.dropPosition
    const dropToGap = info.dropToGap

    const dragMenu = flatMenuList.find(m => m.id === dragKey)
    const dropMenu = flatMenuList.find(m => m.id === dropKey)

    if (!dragMenu || !dropMenu) {
      toast.warning('节点数据异常')
      return
    }

    if (!dropToGap && dropMenu.menuType === 'F') {
      toast.warning('按钮类型节点不能作为父节点')
      return
    }

    const targetLevel = dropToGap ? getNodeLevel(dropKey) : getNodeLevel(dropKey) + 1
    if (targetLevel > MAX_MENU_DEPTH) {
      toast.warning(`最多支持${MAX_MENU_DEPTH}级菜单`)
      return
    }

    const sourceLevel = getNodeLevel(dragKey)
    if (!dropToGap && sourceLevel >= MAX_MENU_DEPTH) {
      toast.warning('当前节点已是最深层级，无法继续嵌套')
      return
    }

    try {
      const newParentId = dropToGap ? dropMenu.parentId : dropKey

      await batchUpdateMenu([{
        id: dragKey,
        parentId: newParentId,
        orderNum: dropPosition
      }])

      toast.success('排序更新成功')
      fetchMenuList()
    } catch (error) {
      console.error('排序更新失败：', error)
      toast.error('排序更新失败')
    }
  }, [flatMenuList, fetchMenuList, getNodeLevel])

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

  /**
   * antd Tree 自定义节点渲染
   * 展示每个菜单节点：类型图标 + 菜单名称 + 类型标签
   */
  const renderTreeTitle = useCallback((nodeData: DataNode) => {
    const data = nodeData as unknown as MenuNodeData
    return (
      <TreeTitle
        menuType={data.menuType}
        status={data.status}
        title={data.title}
        icon={data.icon}
      />
    )
  }, [])

  // ===== 8. UI渲染逻辑区域 =====

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
                className="p-2"
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
                <ConfirmPopover
                  title="批量删除"
                  description={`确认删除选中的 ${selectedKeys.size} 个菜单？`}
                  confirmText="删除"
                  onConfirm={handleBatchDelete}
                >
                  <Button
                    size="sm"
                    color="danger"
                    variant="flat"
                    startContent={<Trash2 size={14} />}
                  >
                    批量删除({selectedKeys.size})
                  </Button>
                </ConfirmPopover>
              )}
            </div>
            {selectedMenu && (
              <div className="flex items-center gap-2 text-xs text-default-400">
                <Button
                  size="sm"
                  variant="flat"
                  startContent={<ArrowLeft size={14} />}
                  onPress={() => setSelectedMenuId(null)}
                >
                  返回一级菜单
                </Button>
                <span>当前查看：</span>
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
                items={tableData}
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
                      <Chip
                        size="sm"
                        variant="flat"
                        color={String(item.status) === '0' ? 'success' : 'default'}
                        className="cursor-pointer"
                      >
                        {String(item.status) === '0' ? '正常' : '停用'}
                      </Chip>
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
                        <ConfirmPopover
                          title="确认删除"
                          description={`将删除菜单「${item.menuName}」及其子菜单`}
                          confirmText="删除"
                          onConfirm={() => handleDeleteMenu([item.id])}
                        >
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            color="danger"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </ConfirmPopover>
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