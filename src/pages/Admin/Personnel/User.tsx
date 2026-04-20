/**
 * 用户管理页面
 *
 * 工具栏 + 表格布局：
 * - 顶部工具栏：搜索框（用户名/手机号/邮箱）、状态筛选、新增按钮
 * - 中部表格：用户列表，支持多选批量操作
 * - 底部：后端分页控件
 * - 弹窗：新增/编辑用户、删除确认、切换角色、用户详情
 *
 * 核心交互：
 * - 搜索/筛选 → 调用后端分页接口刷新列表
 * - 新增/编辑 → 弹窗表单提交
 * - 批量操作 → 批量删除
 * - 状态切换 → 调用专用状态切换接口
 * - 角色切换 → 弹窗展示所有角色，勾选绑定
 */

// ===== 1. 依赖导入区域 =====

// React 核心
import { useState, useEffect, useCallback } from 'react'

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
  Card,
  CardBody,
  useDisclosure,
  Tooltip,
  Pagination,
  Avatar,
  Textarea,
  Switch,
  Checkbox,
  CheckboxGroup,
  Divider,
  Spinner
} from '@heroui/react'

// 图标（Lucide React）
import {
  Plus,
  Search,
  Trash2,
  Pencil,
  RefreshCw,
  Users,
  Shield,
  Eye
} from 'lucide-react'

// 工具函数
import { toast } from '@/utils/toast'
import { formatDateTime } from '@/utils/format'

// 通用状态组件
import { StatusState } from '@/components/ui/StatusState'

// 常量配置
import { PAGINATION } from '@/constants'

// API 接口
import {
  getUserList,
  createUser,
  updateUser,
  deleteUser,
  getUserRoles,
  updateUserRoles,
  toggleUserStatus
} from '@/api/admin/user'
import { getRoleList } from '@/api/admin/role'

// 类型定义
import type {
  SysUser,
  SysUserQueryParams,
  SysUserCreateInput,
  SysUserUpdateInput,
  UserStatus,
  UserSex,
  UserSexValue,
  SysUserPageData
} from '@/types/sysuser.types'
import { USER_STATUS_OPTIONS, USER_SEX_OPTIONS } from '@/types/sysuser.types'
import type { SysRole } from '@/types/role.types'

// ===== 2. TODO待处理导入区域 =====

// ===== 3. 常量定义区域 =====

// 使用 constants 中定义的分页常量（转换为普通类型）
const DEFAULT_PAGE_SIZE = PAGINATION.DEFAULT_PAGE_SIZE as number
const PAGE_SIZE_OPTIONS = [...PAGINATION.PAGE_SIZE_OPTIONS] as number[]

// ===== 4. 通用工具函数区域 =====

/**
 * 获取用户状态的显示标签
 *
 * @param status - 用户状态枚举值
 * @returns 对应的中文标签
 */
function getUserStatusLabel(status: UserStatus): string {
  const option = USER_STATUS_OPTIONS.find(o => o.value === status)
  return option?.label ?? status
}

/**
 * 获取用户状态对应的 Chip 颜色
 *
 * @param status - 用户状态枚举值
 * @returns 'success' 表示正常，'danger' 表示停用
 */
function getUserStatusColor(status: UserStatus): 'success' | 'danger' {
  return status === '0' ? 'success' : 'danger'
}

/**
 * 将性别数字值转换为显示标签
 * 后端返回：0-男，1-女，2-未知
 *
 * @param sex - 性别数字值
 * @returns 中文显示标签
 */
function getUserSexLabel(sex?: UserSexValue): UserSex {
  const labelMap: Record<UserSexValue, UserSex> = {
    '0': '男',
    '1': '女',
    '2': '未知'
  }
  return labelMap[sex || '2'] || '未知'
}

/**
 * 获取用户性别对应的 Chip 颜色
 *
 * @param sex - 性别数字值或显示值
 * @returns Chip 颜色
 */
function getUserSexColor(sex?: UserSexValue): 'primary' | 'secondary' | 'default' {
  const colorMap: Record<UserSexValue, 'primary' | 'secondary' | 'default'> = {
    '0': 'primary',
    '1': 'secondary',
    '2': 'default'
  }
  return colorMap[sex || '2'] ?? 'default'
}

// ===== 5. 子组件区域 =====

/**
 * 用户编辑弹窗组件
 *
 * 支持新增和编辑两种模式：
 * - 新增模式：表单初始为空，需填写用户名和昵称
 * - 编辑模式：回填当前用户数据，用户名不可修改
 */
interface UserEditModalProps {
  /** 弹窗是否打开 */
  isOpen: boolean
  /** 弹窗打开/关闭状态变更回调 */
  onOpenChange: (open: boolean) => void
  /** 编辑模式下的原始用户数据 */
  userData: SysUser | null
  /** 操作模式：create-新增 / edit-编辑 */
  mode: 'create' | 'edit'
  /** 操作成功后的回调 */
  onSuccess: () => void
}

function UserEditModal({ isOpen, onOpenChange, userData, mode, onSuccess }: UserEditModalProps) {
  // ===== 状态控制逻辑区域 =====

  const [formData, setFormData] = useState<SysUserCreateInput & { id?: string }>({
    userName: '',
    nickName: '',
    email: '',
    phonenumber: '',
    sex: '2',
    avatar: '',
    status: '0',
    age: undefined,
    bio: '',
    remark: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ===== 页面初始化与事件绑定 =====

  /** 弹窗打开时根据模式初始化表单数据 */
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && userData) {
        setFormData({
          id: userData.id,
          userName: userData.userName,
          nickName: userData.nickName,
          email: userData.email ?? '',
          phonenumber: userData.phonenumber ?? '',
          sex: userData.sex ?? '2',
          avatar: userData.avatar ?? '',
          status: userData.status,
          age: userData.age,
          bio: userData.bio ?? '',
          remark: userData.remark ?? ''
        })
      } else {
        setFormData({
          userName: '',
          nickName: '',
          email: '',
          phonenumber: '',
          sex: '2',
          avatar: '',
          status: '0',
          age: undefined,
          bio: '',
          remark: ''
        })
      }
    }
  }, [mode, userData, isOpen])

  // ===== 通用工具函数区域 =====

  /** 更新表单指定字段的值 */
  const handleFieldChange = useCallback(<K extends keyof SysUserCreateInput>(key: K, value: SysUserCreateInput[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }, [])

  // ===== 数据处理函数区域 =====

  /**
   * 提交表单数据
   * 根据模式执行新增或修改操作，成功后关闭弹窗并刷新列表
   */
  const handleSubmit = useCallback(async () => {
    if (!formData.userName.trim()) {
      toast.warning('请输入用户名')
      return
    }
    if (!formData.nickName.trim()) {
      toast.warning('请输入昵称')
      return
    }

    setIsSubmitting(true)
    try {
      if (mode === 'edit' && formData.id) {
        const updateData: SysUserUpdateInput = {
          id: formData.id,
          nickName: formData.nickName,
          email: formData.email || undefined,
          phonenumber: formData.phonenumber || undefined,
          sex: formData.sex,
          avatar: formData.avatar || undefined,
          status: formData.status,
          age: formData.age,
          bio: formData.bio || undefined,
          remark: formData.remark || undefined
        }
        await updateUser(updateData)
        toast.success('用户修改成功')
      } else {
        const createData: SysUserCreateInput = {
          userName: formData.userName,
          nickName: formData.nickName,
          email: formData.email || undefined,
          phonenumber: formData.phonenumber || undefined,
          sex: formData.sex,
          avatar: formData.avatar || undefined,
          status: formData.status,
          age: formData.age,
          bio: formData.bio || undefined,
          remark: formData.remark || undefined
        }
        await createUser(createData)
        toast.success('用户创建成功')
      }
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : '操作失败，请稍后重试'
      toast.error(message)
      console.error('用户操作失败：', error)
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
          {mode === 'create' ? '新增用户' : '编辑用户'}
        </ModalHeader>
        <ModalBody className="gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="用户名"
              placeholder="请输入用户名"
              isRequired
              isDisabled={mode === 'edit'}
              value={formData.userName}
              onValueChange={v => handleFieldChange('userName', v)}
              description={mode === 'edit' ? '用户名不可修改' : undefined}
            />
            <Input
              label="昵称"
              placeholder="请输入昵称"
              isRequired
              value={formData.nickName}
              onValueChange={v => handleFieldChange('nickName', v)}
            />
            <Input
              label="邮箱"
              placeholder="请输入邮箱"
              type="email"
              value={formData.email ?? ''}
              onValueChange={v => handleFieldChange('email', v)}
            />
            <Input
              label="手机号"
              placeholder="请输入手机号"
              value={formData.phonenumber ?? ''}
              onValueChange={v => handleFieldChange('phonenumber', v)}
            />
            <Select
              label="性别"
              placeholder="请选择性别"
              selectedKeys={[formData.sex ?? '2']}
              onSelectionChange={keys => {
                const value = Array.from(keys)[0] as UserSexValue
                handleFieldChange('sex', value)
              }}
            >
              {USER_SEX_OPTIONS.map((option) => (
                <SelectItem key={option.value} textValue={option.label}>{option.label}</SelectItem>
              ))}
            </Select>
            <Input
              label="年龄"
              type="number"
              placeholder="请输入年龄"
              value={formData.age?.toString() ?? ''}
              onValueChange={v => handleFieldChange('age', v ? Number(v) : undefined)}
            />
            <Select
              label="用户状态"
              placeholder="请选择用户状态"
              selectedKeys={[formData.status ?? '0']}
              onSelectionChange={keys => {
                const value = Array.from(keys)[0] as UserStatus
                handleFieldChange('status', value)
              }}
            >
              {USER_STATUS_OPTIONS.map(option => (
                <SelectItem key={option.value} textValue={option.label}>{option.label}</SelectItem>
              ))}
            </Select>
            <Input
              label="头像URL"
              placeholder="请输入头像URL"
              value={formData.avatar ?? ''}
              onValueChange={v => handleFieldChange('avatar', v)}
            />
            <Textarea
              label="个人简介"
              placeholder="请输入个人简介"
              value={formData.bio ?? ''}
              onValueChange={v => handleFieldChange('bio', v)}
              maxRows={3}
            />
            <Textarea
              label="备注"
              placeholder="请输入备注信息"
              value={formData.remark ?? ''}
              onValueChange={v => handleFieldChange('remark', v)}
              maxRows={3}
            />
          </div>
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
 * 用户详情弹窗组件
 * 展示用户完整信息，支持从详情页进入编辑模式
 */
interface UserDetailModalProps {
  /** 弹窗是否打开 */
  isOpen: boolean
  /** 弹窗打开/关闭状态变更回调 */
  onOpenChange: (open: boolean) => void
  /** 用户数据 */
  userData: SysUser | null
  /** 编辑按钮回调 */
  onEdit: (user: SysUser) => void
}

function UserDetailModal({ isOpen, onOpenChange, userData, onEdit }: UserDetailModalProps) {
  if (!userData) return null

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="lg"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader>用户详情</ModalHeader>
        <ModalBody className="gap-4">
          <div className="flex items-center gap-4 pb-4 border-b border-divider">
            <Avatar
              src={userData.avatar}
              name={userData.nickName}
              size="lg"
              className="flex-shrink-0"
            />
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">{userData.nickName}</h3>
              <p className="text-sm text-default-400">@{userData.userName}</p>
              <Chip size="sm" variant="dot" color={getUserStatusColor(userData.status)}>
                {getUserStatusLabel(userData.status)}
              </Chip>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-default-400">用户名</label>
              <p className="text-sm font-medium">{userData.userName}</p>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-default-400">昵称</label>
              <p className="text-sm">{userData.nickName}</p>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-default-400">邮箱</label>
              <p className="text-sm">{userData.email || '-'}</p>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-default-400">手机号</label>
              <p className="text-sm">{userData.phonenumber || '-'}</p>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-default-400">性别</label>
              <Chip size="sm" variant="flat" color={getUserSexColor(userData.sex)}>
                {getUserSexLabel(userData.sex)}
              </Chip>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-default-400">状态</label>
              <Chip size="sm" variant="dot" color={getUserStatusColor(userData.status)}>
                {getUserStatusLabel(userData.status)}
              </Chip>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-default-400">创建时间</label>
              <p className="text-sm">
                {userData.createTime ? formatDateTime(userData.createTime) : '-'}
              </p>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-default-400">更新时间</label>
              <p className="text-sm">
                {userData.updateTime ? formatDateTime(userData.updateTime) : '-'}
              </p>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={() => onOpenChange(false)}>
            关闭
          </Button>
          <Button
            color="primary"
            variant="flat"
            startContent={<Pencil size={14} />}
            onPress={() => {
              onEdit(userData)
              onOpenChange(false)
            }}
          >
            编辑
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

// ===== 11. 导出区域 =====

/**
 * 用户角色切换弹窗组件
 *
 * 展示所有可用角色列表，已绑定的角色默认勾选，
 * 支持勾选/取消勾选来更改用户的角色绑定
 * 保存时使用全量替换接口
 */
interface UserRoleModalProps {
  /** 弹窗是否打开 */
  isOpen: boolean
  /** 弹窗打开/关闭状态变更回调 */
  onOpenChange: (open: boolean) => void
  /** 用户数据 */
  userData: SysUser | null
  /** 操作成功后的回调 */
  onSuccess: () => void
}

function UserRoleModal({ isOpen, onOpenChange, userData, onSuccess }: UserRoleModalProps) {
  const [allRoles, setAllRoles] = useState<SysRole[]>([])
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([])
  const [isLoadingRoles, setIsLoadingRoles] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (isOpen && userData) {
      fetchRolesAndUserBindings()
    }
  }, [isOpen, userData])

  const fetchRolesAndUserBindings = async () => {
    if (!userData) return
    setIsLoadingRoles(true)
    try {
      const [roles, userRoleIds] = await Promise.all([
        getRoleList(),
        getUserRoles(userData.id)
      ])
      setAllRoles(roles.filter(r => r.status === '0'))
      setSelectedRoleIds(userRoleIds.map(String))
    } catch (error) {
      console.error('获取角色数据失败：', error)
      toast.error('获取角色数据失败')
    } finally {
      setIsLoadingRoles(false)
    }
  }

  const handleSave = useCallback(async () => {
    if (!userData) return
    setIsSaving(true)
    try {
      await updateUserRoles(userData.id, selectedRoleIds)
      toast.success('角色更新成功')
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : '角色更新失败'
      toast.error(message)
      console.error('角色更新失败：', error)
    } finally {
      setIsSaving(false)
    }
  }, [userData, selectedRoleIds, onSuccess, onOpenChange])

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="md"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader>
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-primary" />
            <span>切换角色 - {userData?.nickName || userData?.userName}</span>
          </div>
        </ModalHeader>
        <ModalBody className="gap-3">
          {isLoadingRoles ? (
            <div className="flex justify-center py-8">
              <Spinner size="sm" label="加载角色数据..." />
            </div>
          ) : allRoles.length === 0 ? (
            <div className="text-center py-8 text-default-400 text-sm">
              暂无可用角色
            </div>
          ) : (
            <>
              <p className="text-xs text-default-400">
                勾选需要绑定的角色，保存后将全量替换当前用户的角色
              </p>
              <Divider />
              <CheckboxGroup
                value={selectedRoleIds}
                onChange={(values) => setSelectedRoleIds(values as string[])}
                className="gap-2"
              >
                {allRoles.map((role) => (
                  <Checkbox
                    key={role.id}
                    value={role.id}
                    classNames={{
                      base: 'w-full max-w-full p-2 hover:bg-default-100 rounded-lg transition-colors',
                      label: 'w-full'
                    }}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{role.roleName}</span>
                        <span className="text-xs text-default-400">{role.roleKey}</span>
                      </div>
                      {role.remark && (
                        <span className="text-xs text-default-300 truncate max-w-32">
                          {role.remark}
                        </span>
                      )}
                    </div>
                  </Checkbox>
                ))}
              </CheckboxGroup>
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={() => onOpenChange(false)}>
            取消
          </Button>
          <Button
            color="primary"
            isLoading={isSaving}
            isDisabled={isLoadingRoles}
            onPress={handleSave}
          >
            保存
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

/**
 * 用户管理主页面组件
 *
 * 页面布局：
 * - 顶部工具栏：搜索、筛选、操作按钮
 * - 中部表格：用户列表
 * - 底部分页：后端分页控件
 *
 * 数据流：
 * - getUserList → userList → 表格展示
 * - 搜索/筛选 → 更新 queryParams → 重新请求后端
 */
export default function PersonnelUser() {
  // ===== 3. 状态控制逻辑区域 =====

  /** 用户列表数据 */
  const [userList, setUserList] = useState<SysUser[]>([])
  /** 列表加载状态 */
  const [isLoading, setIsLoading] = useState(false)
  /** 表格多选选中的行 key 集合 */
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())
  /** 查询参数 */
  const [queryParams, setQueryParams] = useState<SysUserQueryParams>({})
  /** 分页参数 */
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  /** 总条数 */
  const [total, setTotal] = useState(0)
  /** 总页数 */
  const [totalPages, setTotalPages] = useState(0)

  /** 编辑弹窗控制 */
  const editModal = useDisclosure()
  /** 编辑模式：create-新增 / edit-编辑 */
  const [editMode, setEditMode] = useState<'create' | 'edit'>('create')
  /** 编辑中的用户数据 */
  const [editingUser, setEditingUser] = useState<SysUser | null>(null)

  /** 详情弹窗控制 */
  const detailModal = useDisclosure()
  /** 详情查看的用户数据 */
  const [detailUser, setDetailUser] = useState<SysUser | null>(null)

  /** 角色切换弹窗控制 */
  const roleModal = useDisclosure()
  /** 角色切换的用户数据 */
  const [roleUser, setRoleUser] = useState<SysUser | null>(null)

  /** 搜索关键词输入（用于搜索框的即时值，与 queryParams 分离避免频繁请求） */
  const [searchKeyword, setSearchKeyword] = useState('')

  // ===== 6. 错误处理函数区域 =====

  /**
   * 获取用户列表数据
   * 后端分页接口，传入页码和每页大小
   */
  const fetchUserList = useCallback(async () => {
    setIsLoading(true)
    try {
      const params: SysUserQueryParams = {
        ...queryParams,
        pageNum: page,
        pageSize
      }
      const data: SysUserPageData = await getUserList(params)
      // 添加防御性检查，确保数据结构正确
      if (data && data.list) {
        setUserList(data.list)
        setTotal(parseInt(data.total || '0', 10))
        setTotalPages(parseInt(data.totalPages || '0', 10))
      } else {
        setUserList([])
        setTotal(0)
        setTotalPages(0)
        toast.warning('数据格式异常')
      }
    } catch (error) {
      console.error('获取用户列表失败：', error)
      toast.error('获取用户列表失败')
      setUserList([])
      setTotal(0)
      setTotalPages(0)
    } finally {
      setIsLoading(false)
    }
  }, [queryParams, page, pageSize])

  /**
   * 删除用户
   * 支持批量删除（逗号分隔的 ID 列表）
   *
   * @param ids - 待删除的用户 ID 数组
   */
  const handleDeleteUser = useCallback(async (ids: string[]) => {
    try {
      await deleteUser(ids.join(','))
      toast.success('删除成功')
      fetchUserList()
      setSelectedKeys(new Set())
    } catch (error) {
      const message = error instanceof Error ? error.message : '删除失败'
      toast.error(message)
      console.error('删除用户失败：', error)
    }
  }, [fetchUserList])

  /**
   * 切换用户状态
   * @param id - 用户ID
   * @param status - 目标状态
   */
  const handleToggleUserStatus = useCallback(async (id: string, status: UserStatus) => {
    try {
      await toggleUserStatus(id, { status })
      toast.success('状态切换成功')
      fetchUserList()
    } catch (error) {
      const message = error instanceof Error ? error.message : '状态切换失败'
      toast.error(message)
      console.error('切换用户状态失败：', error)
    }
  }, [fetchUserList])

  // ===== 9. 页面初始化与事件绑定 =====

  /** 页面挂载时和参数变化时加载用户列表 */
  useEffect(() => {
    fetchUserList()
  }, [fetchUserList])

  /**
   * 打开新增用户弹窗
   */
  const handleCreateUser = useCallback(() => {
    setEditMode('create')
    setEditingUser(null)
    editModal.onOpen()
  }, [editModal])

  /**
   * 打开编辑用户弹窗
   * 回填当前用户数据到表单
   */
  const handleEditUser = useCallback((user: SysUser) => {
    setEditMode('edit')
    setEditingUser(user)
    editModal.onOpen()
  }, [editModal])

  /**
   * 查看用户详情
   */
  const handleViewUser = useCallback((user: SysUser) => {
    setDetailUser(user)
    detailModal.onOpen()
  }, [detailModal])

  /**
   * 打开角色切换弹窗
   */
  const handleSwitchRole = useCallback((user: SysUser) => {
    setRoleUser(user)
    roleModal.onOpen()
  }, [roleModal])

  /**
   * 批量删除选中的用户
   */
  const handleBatchDelete = useCallback(() => {
    if (selectedKeys.size === 0) {
      toast.warning('请选择要删除的用户')
      return
    }
    handleDeleteUser(Array.from(selectedKeys))
  }, [selectedKeys, handleDeleteUser])

  /** 执行搜索（将搜索关键词同步到查询参数） */
  const handleSearch = useCallback(() => {
    setQueryParams(prev => ({
      ...prev,
      userName: searchKeyword.trim() || undefined,
      phonenumber: undefined,
      email: undefined
    }))
    setPage(1)
  }, [searchKeyword])

  /** 搜索框回车触发搜索 */
  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }, [handleSearch])

  /** 更新查询参数中的指定字段 */
  const handleQueryChange = useCallback(<K extends keyof SysUserQueryParams>(key: K, value: SysUserQueryParams[K]) => {
    setQueryParams(prev => ({ ...prev, [key]: value }))
    setPage(1)
  }, [])

  /** 重置查询条件 */
  const handleResetQuery = useCallback(() => {
    setQueryParams({})
    setSearchKeyword('')
    setPage(1)
  }, [])

  /**
   * 分页大小变更
   */
  const handlePageSizeChange = useCallback((keys: 'all' | Set<React.Key>) => {
    if (keys === 'all') return
    const value = Array.from(keys)[0] as string
    setPageSize(Number(value))
    setPage(1)
  }, [])

  // ===== 8. UI渲染逻辑区域 =====

  return (
    <div className="flex flex-col gap-4 p-4 md:p-0 h-full">
      <Card className="h-full">
        <CardBody className="p-0 flex flex-col overflow-hidden">
          {/* 顶部标题栏 */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-divider">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-primary" />
              <span className="font-semibold text-sm">用户管理</span>
            </div>
            <div className="flex items-center gap-1">
              <Tooltip content="新增用户" size="sm">
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onPress={handleCreateUser}
                >
                  <Plus size={16} />
                </Button>
              </Tooltip>
              <Tooltip content="刷新" size="sm">
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onPress={fetchUserList}
                  isLoading={isLoading}
                >
                  <RefreshCw size={16} />
                </Button>
              </Tooltip>
            </div>
          </div>

          {/* 查询工具栏 */}
          <div className="px-4 py-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Input
                size="sm"
                placeholder="搜索用户名/手机号/邮箱"
                className="w-full sm:w-56"
                value={searchKeyword}
                onValueChange={setSearchKeyword}
                onKeyDown={handleSearchKeyDown}
                startContent={<Search size={14} className="text-default-400" />}
                isClearable
                onClear={() => {
                  setSearchKeyword('')
                  setQueryParams(prev => ({ ...prev, userName: undefined }))
                }}
              />
              <Select
                size="sm"
                placeholder="状态"
                className="w-full sm:w-24"
                aria-label="用户状态筛选"
                selectedKeys={queryParams.status ? [queryParams.status] : []}
                onSelectionChange={keys => {
                  const value = Array.from(keys)[0] as UserStatus | undefined
                  handleQueryChange('status', value)
                }}
              >
                {USER_STATUS_OPTIONS.map(option => (
                  <SelectItem key={option.value} textValue={option.label}>{option.label}</SelectItem>
                ))}
              </Select>
              <Button size="sm" variant="flat" onPress={handleResetQuery}>
                重置
              </Button>
              <div className="hidden sm:flex-1" />
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
          </div>

          {/* 用户列表表格 */}
          <div className="flex-1 p-3">
            {isLoading ? (
              <StatusState type="loading" scene="admin" />
            ) : (
              <Table
                aria-label="用户列表"
                selectionMode="multiple"
                selectedKeys={selectedKeys}
                onSelectionChange={keys => setSelectedKeys(keys as Set<string>)}
                classNames={{
                  wrapper: 'p-0',
                  thead: '[&>tr]:first:shadow-none',
                }}
              >
                <TableHeader>
                  <TableColumn key="userName">用户名</TableColumn>
                  <TableColumn key="nickName">昵称</TableColumn>
                  <TableColumn key="email" className="hidden md:table-cell">邮箱</TableColumn>
                  <TableColumn key="phonenumber" className="hidden lg:table-cell">手机号</TableColumn>
                  <TableColumn key="sex">性别</TableColumn>
                  <TableColumn key="age" className="hidden md:table-cell">年龄</TableColumn>
                  <TableColumn key="bio" className="hidden xl:table-cell">个人简介</TableColumn>
                  <TableColumn key="status">状态</TableColumn>
                  <TableColumn key="createTime" className="hidden lg:table-cell">创建时间</TableColumn>
                  <TableColumn key="actions">操作</TableColumn>
                </TableHeader>
                <TableBody
                  items={userList.map(item => ({ ...item, key: item.id }))}
                  emptyContent={<StatusState type="empty" scene="admin" />}
                >
                  {(item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar
                            src={item.avatar}
                            name={item.nickName}
                            size="sm"
                            className="flex-shrink-0"
                          />
                          <span className="font-medium text-sm">{item.userName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{item.nickName}</span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="text-sm">{item.email || '-'}</span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span className="text-sm">{item.phonenumber || '-'}</span>
                      </TableCell>
                      <TableCell>
                        <Chip size="sm" variant="flat" color={getUserSexColor(item.sex)}>
                          {getUserSexLabel(item.sex)}
                        </Chip>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="text-sm">{item.age || '-'}</span>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        <span className="text-sm truncate max-w-32">{item.bio || '-'}</span>
                      </TableCell>
                      <TableCell>
                        <Switch
                        size="sm"
                        color="primary"
                        isSelected={String(item.status) === '0'}
                        onValueChange={(isSelected) => handleToggleUserStatus(item.id, isSelected ? '0' : '1')}
                        aria-label={getUserStatusLabel(item.status)}
                      />
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span className="text-sm">
                          {item.createTime ? formatDateTime(item.createTime) : '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Tooltip content="查看详情" size="sm">
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              onPress={() => handleViewUser(item)}
                            >
                              <Eye size={14} />
                            </Button>
                          </Tooltip>
                          <Tooltip content="编辑" size="sm">
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              onPress={() => handleEditUser(item)}
                            >
                              <Pencil size={14} />
                            </Button>
                          </Tooltip>
                          <Tooltip content="切换角色" size="sm">
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              color="secondary"
                              onPress={() => handleSwitchRole(item)}
                            >
                              <Shield size={14} />
                            </Button>
                          </Tooltip>
                          <Tooltip content="删除" size="sm">
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              color="danger"
                              onPress={() => handleDeleteUser([item.id])}
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
            )}
          </div>

          {/* 底部分页控件 */}
          {total > 0 && (
            <div className="flex items-center justify-between px-4 py-2">
              <div className="flex items-center gap-2">
                <Select
                  size="sm"
                  aria-label="每页条数"
                  className="w-24"
                  selectedKeys={[String(pageSize)]}
                  onSelectionChange={handlePageSizeChange}
                  renderValue={() => `${pageSize}条/页`}
                >
                  {PAGE_SIZE_OPTIONS.map(size => (
                    <SelectItem key={String(size)} textValue={`${size}条/页`}>{size}条/页</SelectItem>
                  ))}
                </Select>
                <span className="text-xs text-default-400">
                  共 {total} 条
                </span>
              </div>
              <Pagination
                total={totalPages}
                page={page}
                onChange={setPage}
                size="sm"
                showControls
              />
            </div>
          )}
        </CardBody>
      </Card>

      {/* 用户编辑弹窗 */}
      <UserEditModal
        isOpen={editModal.isOpen}
        onOpenChange={editModal.onOpenChange}
        userData={editingUser}
        mode={editMode}
        onSuccess={fetchUserList}
      />

      {/* 用户详情弹窗 */}
      <UserDetailModal
        isOpen={detailModal.isOpen}
        onOpenChange={detailModal.onOpenChange}
        userData={detailUser}
        onEdit={handleEditUser}
      />

      {/* 用户角色切换弹窗 */}
      <UserRoleModal
        isOpen={roleModal.isOpen}
        onOpenChange={roleModal.onOpenChange}
        userData={roleUser}
        onSuccess={fetchUserList}
      />
    </div>
  )
}
