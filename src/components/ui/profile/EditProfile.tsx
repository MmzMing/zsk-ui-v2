/**
 * EditProfile 编辑个人信息组件
 * 支持头像上传、昵称修改、个人简介、手机号、年龄等信息的编辑
 * 数据从系统用户接口 /system/user/{id} 获取
 */

// ===== 1. 依赖导入区域 =====
import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Input, Textarea, Card, CardBody, Avatar } from '@heroui/react'
import { Upload, Check, X, User, Image, Link } from 'lucide-react'
import type { UserInfo, SysUser } from '@/types'
import { getSystemUserInfo, updateSystemUserInfo } from '@/api/profile'

/**
 * EditProfile 属性定义
 */
interface EditProfileProps {
  /** 用户基础信息（包含用户ID，用于请求系统用户数据） */
  userInfo?: UserInfo | null
}

/**
 * EditProfile 编辑个人信息组件
 * @param props - 组件属性
 */
export function EditProfile({ userInfo }: EditProfileProps) {
  // ===== 2. 状态控制逻辑区域 =====
  const { t } = useTranslation('profile')
  
  /** 系统用户信息（从 /system/user/{id} 获取） */
  const [sysUser, setSysUser] = useState<SysUser | null>(null)
  
  /** 编辑状态下的用户数据 */
  const [editSysUser, setEditSysUser] = useState<Partial<SysUser>>({})
  
  /** 头像文件（用于上传） */
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  
  /** 头像URL（用于手动输入链接） */
  const [avatarUrl, setAvatarUrl] = useState('')
  
  /** 是否正在编辑 */
  const [isEditing, setIsEditing] = useState(false)
  
  /** 是否正在保存 */
  const [isSaving, setIsSaving] = useState(false)
  
  /** 是否已保存成功 */
  const [saved, setSaved] = useState(false)
  
  /** 是否显示头像菜单 */
  const [showAvatarMenu, setShowAvatarMenu] = useState(false)
  
  /** 文件输入框引用 */
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  /** 头像上传错误提示 */
  const [avatarError, setAvatarError] = useState('')
  
  /** 头像文件大小限制（2MB） */
  const MAX_FILE_SIZE = 2 * 1024 * 1024

  // ===== 3. 数据处理函数区域 =====
  
  /**
   * 初始化时获取系统用户信息
   * 根据 userInfo 中的用户ID请求系统用户数据
   */
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (userInfo?.id) {
        try {
          const userId = parseInt(userInfo.id, 10)
          const data = await getSystemUserInfo(userId)
          setSysUser(data)
          setEditSysUser({
            id: data.id,
            nickName: data.nickName,
            avatar: data.avatar,
            age: data.age,
            phonenumber: data.phonenumber,
            bio: data.bio,
            email: data.email,
          })
        } catch (error) {
          console.error('获取用户信息失败：', error)
        }
      }
    }
    fetchUserInfo()
  }, [userInfo?.id])

  // ===== 4. 显示数据计算 =====
  
  /** 显示用的昵称（优先取编辑状态，其次系统用户，最后基础用户信息） */
  const displayName = editSysUser.nickName || sysUser?.nickName || userInfo?.name
  
  /** 显示用的头像 */
  const displayAvatar = editSysUser.avatar || sysUser?.avatar || userInfo?.avatar
  
  /** 显示用的个人简介 */
  const displayBio = editSysUser.bio || sysUser?.bio
  
  /** 显示用的邮箱 */
  const displayEmail = editSysUser.email || sysUser?.email || userInfo?.email
  
  /** 显示用的手机号 */
  const displayPhone = editSysUser.phonenumber || sysUser?.phonenumber
  
  /** 显示用的年龄 */
  const displayAge = editSysUser.age || sysUser?.age

  // ===== 5. 事件处理函数区域 =====
  
  /**
   * 处理头像文件上传
   * 将选择的图片文件转换为 Base64 格式并更新头像
   * @param e - 文件选择事件
   */
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // 检查文件大小
      if (file.size > MAX_FILE_SIZE) {
        setAvatarError(`文件大小不能超过 ${MAX_FILE_SIZE / 1024 / 1024}MB`)
        setTimeout(() => setAvatarError(''), 3000)
        setShowAvatarMenu(false)
        return
      }
      
      // 检查文件类型
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      if (!validTypes.includes(file.type)) {
        setAvatarError('请选择有效的图片格式（JPEG、PNG、GIF、WebP）')
        setTimeout(() => setAvatarError(''), 3000)
        setShowAvatarMenu(false)
        return
      }
      
      setAvatarFile(file)
      setAvatarError('')
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        setEditSysUser(prev => ({ ...prev, avatar: result }))
      }
      reader.readAsDataURL(file)
    }
    setShowAvatarMenu(false)
  }

  /**
   * 处理系统用户字段变化
   * @param field - 字段名
   * @param value - 字段值
   */
  const handleSysUserChange = <K extends keyof SysUser>(field: K, value: SysUser[K]) => {
    setEditSysUser(prev => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  /**
   * 保存用户资料
   * 调用 updateSystemUserInfo API 更新用户信息
   */
  const handleSave = async () => {
    setIsSaving(true)
    try {
      const updateData: Partial<SysUser> = {
        id: editSysUser.id,
        nickName: editSysUser.nickName,
        bio: editSysUser.bio,
        phonenumber: editSysUser.phonenumber,
        age: editSysUser.age,
      }
      const result = await updateSystemUserInfo(updateData, avatarFile || undefined)
      setSysUser(result)
      setEditSysUser({
        id: result.id,
        nickName: result.nickName,
        avatar: result.avatar,
        age: result.age,
        phonenumber: result.phonenumber,
        bio: result.bio,
        email: result.email,
      })
      setAvatarFile(null)
      setSaved(true)
      setIsEditing(false)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('保存失败：', error)
    } finally {
      setIsSaving(false)
    }
  }

  /**
   * 取消编辑
   * 重置表单数据并退出编辑模式
   */
  const handleCancel = () => {
    setIsEditing(false)
    setAvatarFile(null)
    setAvatarUrl('')
    if (sysUser) {
      setEditSysUser({
        id: sysUser.id,
        nickName: sysUser.nickName,
        avatar: sysUser.avatar,
        age: sysUser.age,
        phonenumber: sysUser.phonenumber,
        bio: sysUser.bio,
        email: sysUser.email,
      })
    }
  }

  // ===== 6. UI渲染逻辑区域 =====
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Card className="shadow-lg">
        <CardBody className="p-0">
          {/* 头部区域：头像 + 昵称 + 编辑按钮 */}
          <div className="p-4 border-b border-default-200 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* 头像区域 */}
              <div 
                className="relative group"
                onMouseEnter={() => setShowAvatarMenu(true)}
                onMouseLeave={() => setShowAvatarMenu(false)}
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--primary-color)] to-[var(--primary-color)]/60 p-1 shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:scale-105">
                  <Avatar
                    src={displayAvatar || undefined}
                    name={displayName?.charAt(0)}
                    className="w-full h-full text-xl"
                    classNames={{
                      base: 'bg-white',
                      name: 'font-bold text-[var(--primary-color)]'
                    }}
                  />
                </div>
                {/* 头像操作菜单 */}
                <div className={`absolute -bottom-0.5 right-0 flex items-center gap-1 transition-all duration-300 ${showAvatarMenu ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0 pointer-events-none'}`}>
                  <div 
                    className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md border-2 border-[var(--primary-color)]/20 hover:scale-110 transition-all duration-300 cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Image className="w-3.5 h-3.5 text-primary" />
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
              {/* 用户名称区域 */}
              <div>
                <p className="font-medium text-default-900">{displayName || t('card.notSet')}</p>
                <p className="text-xs text-default-500">{t('edit.subtitle')}</p>
              </div>
            </div>
            {/* 编辑按钮 */}
            {!isEditing && (
              <Button
                variant="light"
                onClick={() => setIsEditing(true)}
                className="bg-default-200/50 text-default-700 hover:bg-default-300/50 transition-all duration-300 hover:scale-105"
              >
                <Upload className="w-4 h-4 mr-2" />
                {t('edit.editProfile')}
              </Button>
            )}
          </div>

          {/* 表单内容区域 */}
          <div className="p-6 space-y-4">
            {/* 头像上传错误提示 */}
            {avatarError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {avatarError}
              </div>
            )}
            
            {/* 昵称输入 */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-default-700">
                <User className="w-4 h-4" />
                {t('edit.name')}
              </label>
              <Input
                value={isEditing ? (editSysUser.nickName || displayName) : displayName}
                onChange={(e) => handleSysUserChange('nickName', e.target.value)}
                disabled={!isEditing}
                placeholder={t('edit.placeholderName')}
                className="transition-all duration-300"
              />
            </div>

            {/* 头像链接输入 */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-default-700">
                <Link className="w-4 h-4" />
                {t('edit.avatarUrl')}
              </label>
              <Input
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder={t('edit.placeholderAvatarUrl')}
                disabled={!isEditing}
                className="transition-all duration-300"
              />
            </div>

            {/* 个人简介输入 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-default-700">{t('edit.bio')}</label>
              <Textarea
                value={isEditing ? (editSysUser.bio || displayBio) : displayBio}
                onChange={(e) => handleSysUserChange('bio', e.target.value)}
                disabled={!isEditing}
                placeholder={t('edit.placeholderBio')}
                rows={4}
                className="transition-all duration-300"
              />
            </div>

            {/* 邮箱显示（只读） */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-default-700">{t('edit.email')}</label>
              <Input
                value={displayEmail || t('card.unbound')}
                disabled
                className="transition-all duration-300"
              />
            </div>

            {/* 手机号输入 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-default-700">{t('edit.phone')}</label>
              <Input
                value={isEditing ? (editSysUser.phonenumber || displayPhone) : displayPhone || t('card.notSet')}
                onChange={(e) => handleSysUserChange('phonenumber', e.target.value)}
                disabled={!isEditing}
                placeholder={t('edit.placeholderPhone')}
                className="transition-all duration-300"
              />
            </div>

            {/* 年龄输入（修复报黄问题：非编辑模式显示文本，编辑模式显示数字输入） */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-default-700">{t('edit.age')}</label>
              {isEditing ? (
                <Input
                  type="number"
                  value={editSysUser.age?.toString() || displayAge?.toString() || ''}
                  onChange={(e) => {
                    const value = e.target.value
                    handleSysUserChange('age', value ? parseInt(value, 10) : undefined)
                  }}
                  disabled={!isEditing}
                  placeholder={t('edit.placeholderAge')}
                  min="1"
                  max="120"
                  className="transition-all duration-300"
                />
              ) : (
                <Input
                  value={displayAge?.toString() || t('card.notSet')}
                  disabled
                  className="transition-all duration-300"
                />
              )}
            </div>
          </div>

          {/* 编辑操作按钮 */}
          {isEditing && (
            <div className="flex justify-end gap-3 px-6 pb-6">
              <Button
                variant="light"
                onClick={handleCancel}
                className="transition-all duration-300 hover:scale-105"
              >
                <X className="w-4 h-4 mr-2" />
                {t('edit.cancel')}
              </Button>
              <Button
                variant="light"
                onClick={handleSave}
                isLoading={isSaving}
                className="bg-default-200/50 text-default-700 hover:bg-default-300/50 transition-all duration-300 hover:scale-105"
              >
                {saved ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    {t('edit.saved')}
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    {t('edit.save')}
                  </>
                )}
              </Button>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}