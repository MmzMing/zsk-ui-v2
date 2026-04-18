/**
 * EditProfile 编辑个人信息组件
 * 支持头像上传、昵称修改、简介编辑等功能
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Input, Textarea, Card, CardBody, Avatar } from '@heroui/react'
import { Upload, Camera, Check, X, User } from 'lucide-react'
import type { UserProfile } from '@/api/profile'
import { updateUserProfile } from '@/api/profile'

interface EditProfileProps {
  initialProfile?: UserProfile
}

export function EditProfile({ initialProfile }: EditProfileProps) {
  const { t } = useTranslation('profile')
  const [profile, setProfile] = useState<UserProfile>(initialProfile || {
    id: '',
    name: '',
    avatar: '',
    bio: '',
    role: '',
    following: 0,
    followers: 0,
    likes: 0,
    createdAt: '',
  })
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateUserProfile({
        name: profile.name,
        bio: profile.bio,
      })
      setSaved(true)
      setIsEditing(false)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('保存失败：', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    if (initialProfile) {
      setProfile(initialProfile)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-gradient-to-br from-[var(--primary-color)]/20 via-[var(--primary-color)]/5 to-transparent p-6 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-default-900">{t('edit.title')}</h2>
            <p className="text-sm text-default-500">{t('edit.subtitle')}</p>
          </div>
        </div>
      </div>

      <Card className="shadow-lg">
        <CardBody className="p-0">
          <div className="p-4 border-b border-default-200 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--primary-color)] to-[var(--primary-color)]/60 p-1 shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:scale-105">
                  <Avatar
                    src={profile.avatar || undefined}
                    name={profile.name?.charAt(0)}
                    className="w-full h-full text-xl"
                    classNames={{
                      base: 'bg-white',
                      name: 'font-bold text-[var(--primary-color)]'
                    }}
                  />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md border-2 border-[var(--primary-color)]/20 transition-all duration-300 group-hover:scale-110">
                  <Button isIconOnly variant="light" color="primary" radius="full" className="w-7 h-7 p-0">
                    <Camera className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              <div>
                <p className="font-medium text-default-900">{profile.name || t('card.notSet')}</p>
                <p className="text-xs text-default-500">{t('edit.subtitle')}</p>
              </div>
            </div>
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

          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-default-700">
                <User className="w-4 h-4" />
                {t('edit.name')}
              </label>
              <Input
                value={profile.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                disabled={!isEditing}
                placeholder={t('edit.placeholderName')}
                className="transition-all duration-300"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-default-700">{t('edit.bio')}</label>
              <Textarea
                value={profile.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                disabled={!isEditing}
                placeholder={t('edit.placeholderBio')}
                rows={4}
                className="transition-all duration-300"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-default-700">{t('edit.email')}</label>
              <Input
                value={profile.email || t('card.unbound')}
                disabled={!isEditing}
                className="transition-all duration-300"
              />
            </div>
          </div>

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