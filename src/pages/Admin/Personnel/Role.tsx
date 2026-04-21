/**
 * 角色管理页面
 *
 * 左右分栏布局：
 * - 左侧：角色列表（表格形式），顶部查询工具栏，底部本地分页
 * - 右侧：选中角色的详情展示，Tab 切换三个面板
 *   - Tab 1：基本信息（角色详情查看/编辑）
 *   - Tab 2：权限配置（菜单权限树形展示与分配）
 *   - Tab 3：关联用户（角色下的用户列表管理）
 *
 * 核心交互：
 * - 点击左侧角色行 → 右侧展示该角色详情
 * - 新增/编辑角色 → 弹窗表单
 * - 权限配置 → 树形勾选，全量更新
 * - 关联用户 → 列表展示，支持添加/移除
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
  Tabs,
  Tab,
  useDisclosure,
  Tooltip,
  Divider
} from '@heroui/react'

// 图标（Lucide React）
import {
  Plus,
  Search,
  Trash2,
  Pencil,
  RefreshCw,
  Shield,
  Users,
  Info,
  Copy,
  UserPlus,
  UserMinus
} from 'lucide-react'

// antd 组件
import { Tree } from 'antd'
import type { TreeProps, DataNode } from 'antd/es/tree'

// 工具函数
import { toast } from '@/utils/toast'
import { cn } from '@/utils'
import { formatDateTime } from '@/utils/format'

// 通用状态组件
import { StatusState } from '@/components/ui/StatusState'

// API 接口
import {
  getRoleList,
  createRole,
  updateRole,
  deleteRole,
  getRoleMenus,
  updateRoleMenus,
  getRoleUsers,
  unbindRoleUsers
} from '@/api/admin/role'
import { getMenuList } from '@/api/admin/menu'

// 类型定义
import type {
  SysRole,
  SysRoleQueryParams,
  SysRoleCreateInput,
  SysRoleUpdateInput,
  RoleStatus
} from '@/types/role.types'
import { ROLE_STATUS_OPTIONS } from '@/types/role.types'
import type { SysMenu } from '@/types/menu.types'

// ===== 2. TODO待处理导入区域 =====

// ===== 3. 常量定义区域 =====



// ===== 4. 通用工具函数区域 =====

/**
 * 获取角色状态的显示标签
 *
 * @param status - 角色状态枚举值
 * @returns 对应的中文标签
 */
function getRoleStatusLabel(status: RoleStatus): string {
  const option = ROLE_STATUS_OPTIONS.find(o => o.value === status)
  return option?.label ?? status
}

/**
 * 获取角色状态对应的 Chip 颜色
 *
 * @param status - 角色状态枚举值
 * @returns 'success' 表示正常，'danger' 表示停用
 */
function getRoleStatusColor(status: RoleStatus): 'success' | 'danger' {
  return status === '0' ? 'success' : 'danger'
}

/**
 * 将扁平菜单数据转换为 antd Tree 树节点格式
 * 用于权限配置面板的菜单树展示
 *
 * @param menus - 后端返回的扁平菜单列表
 * @param parentId - 父菜单ID，用于递归构建子树
 * @returns antd Tree 兼容的树节点数组
 */
function convertMenuToTreeData(menus: SysMenu[], parentId: string = '0'): MenuTreeNodeData[] {
  return menus
    .filter(menu => menu.parentId === parentId)
    .sort((a, b) => a.orderNum - b.orderNum)
    .map(menu => ({
      key: menu.id,
      title: menu.menuName,
      menuType: menu.menuType,
      status: menu.status,
      children: convertMenuToTreeData(menus, menu.id).length > 0
        ? convertMenuToTreeData(menus, menu.id)
        : undefined
    }))
}

/**
 * 将嵌套菜单树展平为一维数组
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

/**
 * 从菜单树中收集所有节点的 key
 * 用于全选/取消全选功能
 *
 * @param treeData - 树节点数组
 * @returns 所有节点的 key 数组
 */
function collectAllKeys(treeData: MenuTreeNodeData[]): string[] {
  const keys: string[] = []
  const traverse = (nodes: MenuTreeNodeData[]) => {
    for (const node of nodes) {
      keys.push(String(node.key))
      if (node.children) {
        traverse(node.children)
      }
    }
  }
  traverse(treeData)
  return keys
}

/**
 * 菜单类型对应的 Chip 颜色
 */
function getMenuTypeColor(type: string): 'primary' | 'secondary' | 'warning' {
  const colorMap: Record<string, 'primary' | 'secondary' | 'warning'> = {
    M: 'primary',
    C: 'secondary',
    F: 'warning'
  }
  return colorMap[type] ?? 'default'
}

/**
 * 菜单类型对应的显示标签
 */
function getMenuTypeLabel(type: string): string {
  const labelMap: Record<string, string> = {
    M: '目录',
    C: '菜单',
    F: '按钮'
  }
  return labelMap[type] ?? type
}

/** 菜单树节点数据结构（兼容 antd Tree） */
interface MenuTreeNodeData {
  key: string
  title: string
  menuType: string
  status: string
  children?: MenuTreeNodeData[]
}

/** 关联用户信息（简化版，用于展示） */
// interface RoleUserInfo {
//   id: string
//   username: string
//   nickname: string
//   email?: string
//   status: string
// }

// ===== 5. 子组件区域 =====

/**
 * 角色编辑弹窗组件
 *
 * 支持新增和编辑两种模式：
 * - 新增模式：表单初始为空，使用系统默认值
 * - 编辑模式：回填当前角色数据
 */
interface RoleEditModalProps {
  /** 弹窗是否打开 */
  isOpen: boolean
  /** 弹窗打开/关闭状态变更回调 */
  onOpenChange: (open: boolean) => void
  /** 编辑模式下的原始角色数据 */
  roleData: SysRole | null
  /** 操作模式：create-新增 / edit-编辑 */
  mode: 'create' | 'edit'
  /** 操作成功后的回调 */
  onSuccess: () => void
}

function RoleEditModal({ isOpen, onOpenChange, roleData, mode, onSuccess }: RoleEditModalProps) {
  // ===== 状态控制逻辑区域 =====

  const [formData, setFormData] = useState<SysRoleCreateInput & { id?: string }>({
    roleName: '',
    roleKey: '',
    roleSort: 0,
    status: '0',
    remark: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ===== 页面初始化与事件绑定 =====

  /** 弹窗打开时根据模式初始化表单数据 */
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && roleData) {
        setFormData({
          id: roleData.id,
          roleName: roleData.roleName,
          roleKey: roleData.roleKey,
          roleSort: roleData.roleSort,
          status: roleData.status,
          remark: roleData.remark ?? ''
        })
      } else {
        setFormData({
          roleName: '',
          roleKey: '',
          roleSort: 0,
          status: '0',
          remark: ''
        })
      }
    }
  }, [mode, roleData, isOpen])

  // ===== 通用工具函数区域 =====

  /** 更新表单指定字段的值 */
  const handleFieldChange = useCallback(<K extends keyof SysRoleCreateInput>(key: K, value: SysRoleCreateInput[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }, [])

  // ===== 数据处理函数区域 =====

  /**
   * 提交表单数据
   * 根据模式执行新增或修改操作，成功后关闭弹窗并刷新列表
   */
  const handleSubmit = useCallback(async () => {
    if (!formData.roleName.trim()) {
      toast.warning('请输入角色名称')
      return
    }
    if (!formData.roleKey.trim()) {
      toast.warning('请输入角色权限字符串')
      return
    }

    setIsSubmitting(true)
    try {
      if (mode === 'edit' && formData.id) {
        const updateData: SysRoleUpdateInput = {
          id: formData.id,
          roleName: formData.roleName,
          roleKey: formData.roleKey,
          roleSort: formData.roleSort,
          status: formData.status,
          remark: formData.remark || undefined
        }
        await updateRole(updateData)
        toast.success('角色修改成功')
      } else {
        const createData: SysRoleCreateInput = {
          roleName: formData.roleName,
          roleKey: formData.roleKey,
          roleSort: formData.roleSort,
          status: formData.status,
          remark: formData.remark || undefined
        }
        await createRole(createData)
        toast.success('角色创建成功')
      }
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : '操作失败，请稍后重试'
      toast.error(message)
      console.error('角色操作失败：', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, mode, onSuccess, onOpenChange])

  // ===== UI渲染逻辑区域 =====

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="lg"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader>
          {mode === 'create' ? '新增角色' : '编辑角色'}
        </ModalHeader>
        <ModalBody className="gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="角色名称"
              placeholder="请输入角色名称"
              isRequired
              value={formData.roleName}
              onValueChange={v => handleFieldChange('roleName', v)}
            />
            <Input
              label="角色权限字符串"
              placeholder="请输入角色权限字符串"
              isRequired
              value={formData.roleKey}
              onValueChange={v => handleFieldChange('roleKey', v)}
            />
            <Input
              label="排序号"
              type="number"
              placeholder="请输入排序号"
              value={String(formData.roleSort ?? 0)}
              onValueChange={v => handleFieldChange('roleSort', Number(v))}
            />
            <Select
              label="角色状态"
              placeholder="请选择角色状态"
              selectedKeys={[formData.status ?? '0']}
              onSelectionChange={keys => {
                const value = Array.from(keys)[0] as RoleStatus
                handleFieldChange('status', value)
              }}
            >
              {ROLE_STATUS_OPTIONS.map(option => (
                <SelectItem key={option.value}>{option.label}</SelectItem>
              ))}
            </Select>
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

/**
 * 添加用户弹窗组件
 * 从系统用户列表中选择用户添加到角色
 * 简化版：使用输入用户ID的方式，后续可替换为用户选择器
 */
interface AddUserModalProps {
  /** 弹窗是否打开 */
  isOpen: boolean
  /** 弹窗打开/关闭状态变更回调 */
  onOpenChange: (open: boolean) => void
  /** 当前角色ID */
  roleId: string
  /** 已关联的用户ID列表（用于过滤已存在的用户） */
  existingUserIds: string[]
  /** 操作成功后的回调 */
  onSuccess: () => void
}

function AddUserModal({ isOpen, onOpenChange, roleId, existingUserIds, onSuccess }: AddUserModalProps) {
  const [userIdsInput, setUserIdsInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  /** 弹窗关闭时重置输入 */
  useEffect(() => {
    if (!isOpen) {
      setUserIdsInput('')
    }
  }, [isOpen])

  /**
   * 提交添加用户
   * 解析输入的用户ID列表，过滤已存在的用户后提交
   */
  const handleSubmit = useCallback(async () => {
    if (!userIdsInput.trim()) {
      toast.warning('请输入用户ID')
      return
    }

    const parsedIds = userIdsInput
      .split(/[,，\s]+/)
      .map(id => id.trim())
      .filter(id => id !== '')

    if (parsedIds.length === 0) {
      toast.warning('请输入有效的用户ID')
      return
    }

    const newIds = parsedIds.filter(id => !existingUserIds.includes(id))
    if (newIds.length === 0) {
      toast.warning('输入的用户ID已全部存在于当前角色中')
      return
    }

    setIsSubmitting(true)
    try {
      const { bindRoleUsers } = await import('@/api/admin/role')
      await bindRoleUsers(roleId, { userIds: newIds })
      toast.success('用户添加成功')
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : '添加用户失败'
      toast.error(message)
      console.error('添加用户失败：', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [userIdsInput, roleId, existingUserIds, onSuccess, onOpenChange])

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="md"
    >
      <ModalContent>
        <ModalHeader>添加用户</ModalHeader>
        <ModalBody className="gap-4">
          <Input
            label="用户ID"
            placeholder="请输入用户ID，多个用逗号分隔"
            value={userIdsInput}
            onValueChange={setUserIdsInput}
            description="输入用户ID，多个ID用逗号或空格分隔"
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
            添加
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

// ===== 11. 导出区域 =====

/**
 * 角色管理主页面组件
 *
 * 页面布局：
 * - 左侧卡片：角色列表，顶部查询工具栏，底部本地分页
 * - 右侧卡片：选中角色的详情展示，Tab 切换三个面板
 *
 * 数据流：
 * - getRoleList → roleList → 过滤/分页 → 左侧表格
 * - 选中角色 → selectedRole → 右侧详情/权限/用户
 */
export default function PersonnelRole() {
  // ===== 3. 状态控制逻辑区域 =====

  /** 角色列表全量数据（后端一次性返回） */
  const [roleList, setRoleList] = useState<SysRole[]>([])
  /** 列表加载状态 */
  const [isLoading, setIsLoading] = useState(false)
  /** 当前选中的角色数据 */
  const [selectedRole, setSelectedRole] = useState<SysRole | null>(null)
  /** 表格多选选中的行 key 集合 */
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())
  /** 查询参数 */
  const [queryParams, setQueryParams] = useState<SysRoleQueryParams>({})

  /** 编辑弹窗控制 */
  const editModal = useDisclosure()
  /** 编辑模式：create-新增 / edit-编辑 */
  const [editMode, setEditMode] = useState<'create' | 'edit'>('create')
  /** 编辑中的角色数据 */
  const [editingRole, setEditingRole] = useState<SysRole | null>(null)

  /** 右侧 Tab 选中状态 */
  const [activeTab, setActiveTab] = useState<string>('info')

  /** 权限配置 - 菜单树数据 */
  const [menuTreeData, setMenuTreeData] = useState<MenuTreeNodeData[]>([])
  /** 权限配置 - 当前角色已选中的菜单ID列表 */
  const [checkedMenuKeys, setCheckedMenuKeys] = useState<string[]>([])
  /** 权限配置 - 加载状态 */
  const [isMenuLoading, setIsMenuLoading] = useState(false)
  /** 权限配置 - 保存中状态 */
  const [isMenuSaving, setIsMenuSaving] = useState(false)

  /** 关联用户 - 用户ID列表 */
  const [roleUserIds, setRoleUserIds] = useState<string[]>([])
  /** 关联用户 - 加载状态 */
  const [isUserLoading, setIsUserLoading] = useState(false)
  /** 关联用户 - 选中待移除的用户ID */
  const [selectedUserKeys, setSelectedUserKeys] = useState<Set<string>>(new Set())

  /** 添加用户弹窗控制 */
  const addUserModal = useDisclosure()

  // ===== 7. 数据处理函数区域 =====

  /**
   * 根据查询条件过滤角色列表
   * 支持角色名称模糊查询和状态筛选
   */
  const filteredRoleList = useMemo(() => {
    let data = [...roleList]

    if (queryParams.roleName) {
      const keyword = queryParams.roleName.toLowerCase()
      data = data.filter(r => r.roleName.toLowerCase().includes(keyword))
    }
    if (queryParams.status) {
      data = data.filter(r => r.status === queryParams.status)
    }

    data.sort((a, b) => a.roleSort - b.roleSort)
    return data
  }, [roleList, queryParams])

  // ===== 6. 错误处理函数区域 =====

  /**
   * 获取角色列表数据
   * 失败时显示错误提示
   */
  const fetchRoleList = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getRoleList()
      setRoleList(data)
    } catch (error) {
      console.error('获取角色列表失败：', error)
      toast.error('获取角色列表失败')
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * 删除角色
   * 支持批量删除（逗号分隔的 ID 列表）
   *
   * @param ids - 待删除的角色 ID 数组
   */
  const handleDeleteRole = useCallback(async (ids: string[]) => {
    try {
      await deleteRole(ids.join(','))
      toast.success('删除成功')
      fetchRoleList()
      setSelectedKeys(new Set())
      if (selectedRole && ids.includes(selectedRole.id)) {
        setSelectedRole(null)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '删除失败'
      toast.error(message)
      console.error('删除角色失败：', error)
    }
  }, [fetchRoleList, selectedRole])

  /**
   * 加载菜单树数据
   * 用于权限配置面板
   */
  const fetchMenuTree = useCallback(async () => {
    setIsMenuLoading(true)
    try {
      const menus = await getMenuList()
      const flatMenus = flattenMenus(menus)
      setMenuTreeData(convertMenuToTreeData(flatMenus))
    } catch (error) {
      console.error('获取菜单树失败：', error)
      toast.error('获取菜单树失败')
    } finally {
      setIsMenuLoading(false)
    }
  }, [])

  /**
   * 获取所有有效的菜单ID（从treeData中提取）
   */
  const getAllValidMenuKeys = useCallback((treeData: MenuTreeNodeData[]): string[] => {
    const keys: string[] = []
    const traverse = (nodes: MenuTreeNodeData[]) => {
      for (const node of nodes) {
        keys.push(String(node.key))
        if (node.children) {
          traverse(node.children)
        }
      }
    }
    traverse(treeData)
    return keys
  }, [])

  /**
   * 加载角色已分配的菜单权限
   *
   * @param roleId - 角色ID
   */
  const fetchRoleMenus = useCallback(async (roleId: string) => {
    setIsMenuLoading(true)
    try {
      const menuIds = await getRoleMenus(roleId)
      const validKeys = getAllValidMenuKeys(menuTreeData)
      const filteredIds = menuIds
        .map(String)
        .filter(id => validKeys.includes(id))
      setCheckedMenuKeys(filteredIds)
    } catch (error) {
      console.error('获取角色权限失败：', error)
      toast.error('获取角色权限失败')
    } finally {
      setIsMenuLoading(false)
    }
  }, [menuTreeData, getAllValidMenuKeys])

  /**
   * 加载角色关联的用户ID列表
   *
   * @param roleId - 角色ID
   */
  const fetchRoleUsers = useCallback(async (roleId: string) => {
    setIsUserLoading(true)
    try {
      const userIds = await getRoleUsers(roleId)
      setRoleUserIds(userIds)
    } catch (error) {
      console.error('获取角色用户失败：', error)
      toast.error('获取角色用户失败')
    } finally {
      setIsUserLoading(false)
    }
  }, [])

  // ===== 9. 页面初始化与事件绑定 =====

  /** 页面挂载时加载角色列表 */
  useEffect(() => {
    fetchRoleList()
  }, [fetchRoleList])

  /** 页面挂载时加载菜单树（权限配置面板使用） */
  useEffect(() => {
    fetchMenuTree()
  }, [fetchMenuTree])

  /** 选中角色变化时加载权限和用户数据 */
  useEffect(() => {
    if (selectedRole) {
      fetchRoleMenus(selectedRole.id)
      fetchRoleUsers(selectedRole.id)
      setSelectedUserKeys(new Set())
    } else {
      setCheckedMenuKeys([])
      setRoleUserIds([])
    }
  }, [selectedRole, fetchRoleMenus, fetchRoleUsers])

  

  /**
   * 点击角色行选中角色
   * 右侧展示该角色的详情信息
   */
  const handleSelectRole = useCallback((role: SysRole) => {
    setSelectedRole(role)
    setActiveTab('info')
  }, [])

  /**
   * 打开新增角色弹窗
   */
  const handleCreateRole = useCallback(() => {
    setEditMode('create')
    setEditingRole(null)
    editModal.onOpen()
  }, [editModal])

  

  /**
   * 打开编辑角色弹窗
   */
  const handleOpenEditModal = useCallback(() => {
    if (!selectedRole) return
    setEditMode('edit')
    setEditingRole(selectedRole)
    editModal.onOpen()
  }, [selectedRole, editModal])

  /**
   * 批量删除选中的角色
   * 未选中任何角色时给出提示
   */
  const handleBatchDelete = useCallback(() => {
    if (selectedKeys.size === 0) {
      toast.warning('请选择要删除的角色')
      return
    }
    handleDeleteRole(Array.from(selectedKeys))
  }, [selectedKeys, handleDeleteRole])

  /** 更新查询参数中的指定字段 */
  const handleQueryChange = useCallback(<K extends keyof SysRoleQueryParams>(key: K, value: SysRoleQueryParams[K]) => {
    setQueryParams(prev => ({ ...prev, [key]: value }))
  }, [])

  /** 重置查询条件 */
  const handleResetQuery = useCallback(() => {
    setQueryParams({})
  }, [])

  /**
   * 权限配置 - 树形勾选变更
   * 勾选变更时调用全量更新接口
   */
  const handleMenuCheck: TreeProps['onCheck'] = useCallback(async (checkedKeysValue: React.Key[] | { checked: React.Key[]; halfChecked: React.Key[] }) => {
    if (!selectedRole) return

    const checkedKeys = Array.isArray(checkedKeysValue)
      ? checkedKeysValue.map(String)
      : (checkedKeysValue as { checked: React.Key[] }).checked.map(String)

    setCheckedMenuKeys(checkedKeys)
    setIsMenuSaving(true)
    try {
      await updateRoleMenus(selectedRole.id, { menuIds: checkedKeys })
      toast.success('权限更新成功')
    } catch (error) {
      console.error('权限更新失败：', error)
      toast.error('权限更新失败')
      fetchRoleMenus(selectedRole.id)
    } finally {
      setIsMenuSaving(false)
    }
  }, [selectedRole, fetchRoleMenus])

  /**
   * 权限配置 - 全选
   */
  const handleSelectAllMenus = useCallback(async () => {
    if (!selectedRole) return
    const allKeys = collectAllKeys(menuTreeData)
    setCheckedMenuKeys(allKeys)
    setIsMenuSaving(true)
    try {
      await updateRoleMenus(selectedRole.id, { menuIds: allKeys })
      toast.success('已全选所有权限')
    } catch (error) {
      console.error('全选权限失败：', error)
      toast.error('全选权限失败')
      fetchRoleMenus(selectedRole.id)
    } finally {
      setIsMenuSaving(false)
    }
  }, [selectedRole, menuTreeData, fetchRoleMenus])

  /**
   * 权限配置 - 取消全选
   */
  const handleDeselectAllMenus = useCallback(async () => {
    if (!selectedRole) return
    setCheckedMenuKeys([])
    setIsMenuSaving(true)
    try {
      await updateRoleMenus(selectedRole.id, { menuIds: [] })
      toast.success('已取消所有权限')
    } catch (error) {
      console.error('取消权限失败：', error)
      toast.error('取消权限失败')
      fetchRoleMenus(selectedRole.id)
    } finally {
      setIsMenuSaving(false)
    }
  }, [selectedRole, fetchRoleMenus])

  /**
   * 关联用户 - 移除选中的用户
   */
  const handleRemoveUsers = useCallback(async () => {
    if (!selectedRole) return
    if (selectedUserKeys.size === 0) {
      toast.warning('请选择要移除的用户')
      return
    }

    const userIdsToRemove = Array.from(selectedUserKeys)
    try {
      await unbindRoleUsers(selectedRole.id, { userIds: userIdsToRemove })
      toast.success('用户移除成功')
      fetchRoleUsers(selectedRole.id)
      setSelectedUserKeys(new Set())
    } catch (error) {
      const message = error instanceof Error ? error.message : '移除用户失败'
      toast.error(message)
      console.error('移除用户失败：', error)
    }
  }, [selectedRole, selectedUserKeys, fetchRoleUsers])

  // ===== 8. UI渲染逻辑区域 =====

  /**
   * antd Tree 自定义节点渲染
   * 展示每个菜单节点：类型标签 + 菜单名称
   */
  const renderMenuTreeTitle = useCallback((nodeData: DataNode) => {
    const data = nodeData as unknown as MenuTreeNodeData
    return (
      <div className="flex items-center gap-2 py-0.5">
        <span className="truncate text-sm">{data.title}</span>
        <Chip
          size="sm"
          variant="flat"
          color={getMenuTypeColor(data.menuType)}
          className="ml-auto flex-shrink-0 text-tiny"
        >
          {getMenuTypeLabel(data.menuType)}
        </Chip>
      </div>
    )
  }, [])

  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-4 p-4 md:p-0 h-full">
      {/* 左侧角色列表 */}
      <Card className="w-full md:w-[35%] md:min-w-[320px] md:flex-shrink-0 max-h-[40vh] md:max-h-full">
        <CardBody className="p-0 flex flex-col overflow-hidden">
          {/* 顶部标题栏 */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-divider">
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-primary" />
              <span className="font-semibold text-sm">角色列表</span>
            </div>
            <div className="flex items-center gap-1">
              <Tooltip content="新增角色" size="sm">
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onPress={handleCreateRole}
                >
                  <Plus size={16} />
                </Button>
              </Tooltip>
              {selectedKeys.size > 0 && (
                <Tooltip content={`批量删除(${selectedKeys.size})`} size="sm">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    color="danger"
                    onPress={handleBatchDelete}
                  >
                    <Trash2 size={16} />
                  </Button>
                </Tooltip>
              )}
              <Tooltip content="刷新" size="sm">
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onPress={fetchRoleList}
                  isLoading={isLoading}
                >
                  <RefreshCw size={16} />
                </Button>
              </Tooltip>
            </div>
          </div>

          {/* 查询工具栏 */}
          <div className="p-3 py-2 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Input
                size="sm"
                placeholder="角色名称"
                className="w-full sm:w-56"
                value={queryParams.roleName ?? ''}
                onValueChange={v => handleQueryChange('roleName', v || undefined)}
                startContent={<Search size={14} className="text-default-400" />}
                isClearable
                onClear={() => handleQueryChange('roleName', undefined)}
              />
              <Select
                size="sm"
                placeholder="状态"
                className="w-full sm:w-24"
                aria-label="角色状态筛选"
                selectedKeys={queryParams.status ? [queryParams.status] : []}
                onSelectionChange={keys => {
                  const value = Array.from(keys)[0] as RoleStatus | undefined
                  handleQueryChange('status', value)
                }}
              >
                {ROLE_STATUS_OPTIONS.map(option => (
                  <SelectItem key={option.value}>{option.label}</SelectItem>
                ))}
              </Select>
              <Button size="sm" variant="flat" onPress={handleResetQuery}>
                重置
              </Button>
            </div>
          </div>

          {/* 角色列表表格 */}
          <div className="flex-1 p-3 overflow-auto mt-2">
            {isLoading ? (
              <StatusState type="loading" scene="admin" />
            ) : (
              <Table
                aria-label="角色列表"
                selectionMode="multiple"
                selectedKeys={selectedKeys}
                onSelectionChange={keys => setSelectedKeys(keys as Set<string>)}
                classNames={{
                  wrapper: 'p-0',
                  thead: '[&>tr]:first:shadow-none',
                }}
              >
                <TableHeader>
                  <TableColumn key="roleName">角色名称</TableColumn>
                  <TableColumn key="roleKey" className="hidden md:table-cell">权限字符</TableColumn>
                  <TableColumn key="roleSort">排序</TableColumn>
                  <TableColumn key="status">状态</TableColumn>
                </TableHeader>
                <TableBody
                  items={filteredRoleList.map(item => ({ ...item, key: item.id }))}
                  emptyContent={<StatusState type="empty" scene="admin" />}
                >
                  {(item) => (
                    <TableRow
                      key={item.id}
                      className={cn(
                        'cursor-pointer',
                        selectedRole?.id === item.id && 'bg-primary/10'
                      )}
                      onClick={() => handleSelectRole(item)}
                    >
                      <TableCell>
                        <span className="font-medium text-sm">{item.roleName}</span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <code className="text-xs bg-default-100 px-1.5 py-0.5 rounded">
                          {item.roleKey}
                        </code>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{item.roleSort}</span>
                      </TableCell>
                      <TableCell>
                        <Chip size="sm" variant="dot" color={getRoleStatusColor(item.status)}>
                          {getRoleStatusLabel(item.status)}
                        </Chip>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>

          </CardBody>
      </Card>

      {/* 右侧详情区域 */}
      <Card className="flex-1 min-w-0">
        <CardBody className="p-3 flex flex-col overflow-hidden">
          {selectedRole ? (
            <>
              {/* 右侧顶部标题 */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-divider">
                <div className="flex items-center gap-2">
                  <Shield size={18} className="text-primary" />
                  <span className="font-semibold text-sm">{selectedRole.roleName}</span>
                  <Chip size="sm" variant="dot" color={getRoleStatusColor(selectedRole.status)}>
                    {getRoleStatusLabel(selectedRole.status)}
                  </Chip>
                </div>
                <div className="flex items-center gap-1">
                  <Tooltip content="删除角色" size="sm">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      color="danger"
                      onPress={() => handleDeleteRole([selectedRole.id])}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </Tooltip>
                </div>
              </div>

              {/* Tab 切换面板 */}
              <div className="flex-1 overflow-auto">
                <Tabs
                  selectedKey={activeTab}
                  onSelectionChange={key => setActiveTab(key as string)}
                  className="pt-3"
                  variant="underlined"
                >
                  {/* Tab 1：基本信息 */}
                  <Tab
                    key="info"
                    title={
                      <div className="flex items-center gap-1.5">
                        <Info size={14} />
                        <span>基本信息</span>
                        
                      </div>
                    }
                  >
                    <Divider />
                    <div className="px-3 pt-4 space-y-4">

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="角色名称"
                          size="sm"
                          isDisabled
                          value={selectedRole.roleName}
                          placeholder="请输入角色名称"
                        />
                        <Input
                          label="角色权限字符串"
                          size="sm"
                          isDisabled
                          value={selectedRole.roleKey}
                          placeholder="请输入角色权限字符串"
                        />
                        <Input
                          label="排序号"
                          size="sm"
                          type="number"
                          isDisabled
                          value={String(selectedRole.roleSort ?? 0)}
                          placeholder="请输入排序号"
                        />
                        <Input
                          label="状态"
                          size="sm"
                          isDisabled
                          value={getRoleStatusLabel(selectedRole.status)}
                          placeholder="请选择状态"
                        />
                        <Textarea
                          label="备注"
                          size="sm"
                          isDisabled
                          value={selectedRole.remark || ''}
                          placeholder="请输入备注信息"
                          maxRows={3}
                        />
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-xs text-default-400">创建时间</label>
                          <p className="text-sm">
                            {selectedRole.createTime ? formatDateTime(selectedRole.createTime) : '-'}
                          </p>
                        </div>
                      </div>

                      {/* 操作按钮 */}
                      <div className="flex items-center justify-end gap-2 pt-4 border-t border-divider">
                        <Button
                          size="sm"
                          color="primary"
                          variant="flat"
                          startContent={<Pencil size={14} />}
                          onPress={handleOpenEditModal}
                        >
                          编辑
                        </Button>
                      </div>
                    </div>
                  </Tab>

                  {/* Tab 2：权限配置 */}
                  <Tab
                    key="permission"
                    title={
                      <div className="flex items-center gap-1.5">
                        <Shield size={14} />
                        <span>权限配置</span>
                      </div>
                    }
                  >
                    <Divider />
                    <div className="px-3 pt-4 space-y-3">

                      {/* 权限操作工具栏 */}
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="flat"
                          startContent={<Copy size={14} />}
                          onPress={handleSelectAllMenus}
                          isDisabled={isMenuSaving}
                        >
                          全选
                        </Button>
                        <Button
                          size="sm"
                          variant="flat"
                          onPress={handleDeselectAllMenus}
                          isDisabled={isMenuSaving}
                        >
                          取消全选
                        </Button>
                        <div className="flex-1" />
                        {isMenuSaving && <Spinner size="sm" />}
                        <span className="text-xs text-default-400">
                          已选 {checkedMenuKeys.length} 项权限
                        </span>
                      </div>

                      {/* 菜单权限树 */}
                      {isMenuLoading ? (
                        <StatusState type="loading" scene="admin" />
                      ) : menuTreeData.length > 0 ? (
                        <div className="max-h-[50vh] overflow-auto">
                          <Tree
                            treeData={menuTreeData as unknown as DataNode[]}
                            checkable
                            checkedKeys={checkedMenuKeys}
                            onCheck={handleMenuCheck as TreeProps['onCheck']}
                            selectable={false}
                            defaultExpandAll
                            titleRender={renderMenuTreeTitle as (node: DataNode) => React.ReactNode}
                          />
                        </div>
                      ) : (
                        <StatusState type="empty" scene="admin" />
                      )}
                    </div>
                  </Tab>

                  {/* Tab 3：关联用户 */}
                  <Tab
                    key="users"
                    title={
                      <div className="flex items-center gap-1.5">
                        <Users size={14} />
                        <span>关联用户</span>
                      </div>
                    }
                  >
                    <Divider />
                    <div className="px-3 pt-4 space-y-3">

                      {/* 用户操作工具栏 */}
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          color="primary"
                          variant="flat"
                          startContent={<UserPlus size={14} />}
                          onPress={addUserModal.onOpen}
                          isDisabled={isUserLoading}
                        >
                          添加用户
                        </Button>
                        {selectedUserKeys.size > 0 && (
                          <Button
                            size="sm"
                            color="danger"
                            variant="flat"
                            startContent={<UserMinus size={14} />}
                            onPress={handleRemoveUsers}
                          >
                            移除选中({selectedUserKeys.size})
                          </Button>
                        )}
                        <div className="flex-1" />
                        <span className="text-xs text-default-400">
                          共 {roleUserIds.length} 个用户
                        </span>
                      </div>

                      <Divider />

                      {/* 关联用户列表 */}
                      {isUserLoading ? (
                        <StatusState type="loading" scene="admin" />
                      ) : roleUserIds.length > 0 ? (
                        <Table
                          aria-label="关联用户列表"
                          selectionMode="multiple"
                          selectedKeys={selectedUserKeys}
                          onSelectionChange={keys => setSelectedUserKeys(keys as Set<string>)}
                          classNames={{
                            wrapper: 'p-0',
                            thead: '[&>tr]:first:shadow-none',
                          }}
                        >
                          <TableHeader>
                            <TableColumn key="id">用户ID</TableColumn>
                            <TableColumn key="actions">操作</TableColumn>
                          </TableHeader>
                          <TableBody
                            items={roleUserIds.map(id => ({ id, key: id }))}
                          >
                            {(item) => (
                              <TableRow key={item.id}>
                                <TableCell>
                                  <span className="text-sm">用户 {item.id}</span>
                                </TableCell>
                                <TableCell>
                                  <Tooltip content="移除用户" size="sm">
                                    <Button
                                      isIconOnly
                                      size="sm"
                                      variant="light"
                                      color="danger"
                                      onPress={async () => {
                                        if (!selectedRole) return
                                        try {
                                          await unbindRoleUsers(selectedRole.id, { userIds: [item.id] })
                                          toast.success('用户移除成功')
                                          fetchRoleUsers(selectedRole.id)
                                        } catch (error) {
                                          const message = error instanceof Error ? error.message : '移除用户失败'
                                          toast.error(message)
                                          console.error('移除用户失败：', error)
                                        }
                                      }}
                                    >
                                      <UserMinus size={14} />
                                    </Button>
                                  </Tooltip>
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      ) : (
                        <StatusState type="empty" scene="admin" />
                      )}
                    </div>
                  </Tab>
                </Tabs>
              </div>
            </>
          ) : (
            /* 未选中角色时的空状态 */
            <StatusState 
              type="empty" 
              scene="admin"
              title="请选择角色"
              description="请从左侧选择一个角色查看详情"
              full
            />
          )}
        </CardBody>
      </Card>

      {/* 角色编辑弹窗 */}
      <RoleEditModal
        isOpen={editModal.isOpen}
        onOpenChange={editModal.onOpenChange}
        roleData={editingRole}
        mode={editMode}
        onSuccess={fetchRoleList}
      />

      {/* 添加用户弹窗 */}
      <AddUserModal
        isOpen={addUserModal.isOpen}
        onOpenChange={addUserModal.onOpenChange}
        roleId={selectedRole?.id ?? ''}
        existingUserIds={roleUserIds}
        onSuccess={() => {
          if (selectedRole) {
            fetchRoleUsers(selectedRole.id)
          }
        }}
      />
    </div>
  )
}
