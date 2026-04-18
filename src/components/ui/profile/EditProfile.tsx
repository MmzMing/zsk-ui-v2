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
      <Card className="overflow-hidden shadow-xl">
        <div className="bg-gradient-to-br from-[var(--primary-color)]/20 via-[var(--primary-color)]/5 to-transparent p-8">
          <div className="flex flex-col items-center">
            <div className="relative group mb-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--primary-color)] to-[var(--primary-color)]/60 p-1 shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:scale-105">
                <Avatar
                  src={profile.avatar || undefined}
                  name={profile.name?.charAt(0)}
                  className="w-full h-full text-3xl"
                  classNames={{
                    base: 'bg-white',
                    name: 'font-bold text-[var(--primary-color)]'
                  }}
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-[var(--primary-color)]/20 transition-all duration-300 group-hover:scale-110 hover:shadow-xl">
                <Button isIconOnly variant="light" color="primary" radius="full" className="w-10 h-10 p-0">
                  <Camera className="w-5 h-5" />
                </Button>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-default-900 mb-1">{t('edit.title')}</h2>
            <p className="text-sm text-default-500">{t('edit.subtitle')}</p>
          </div>
        </div>
        <CardBody className="p-6 space-y-6">
          <div className="space-y-4">
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

          <div className="flex justify-end gap-3 pt-4 border-t border-default-200">
            {isEditing ? (
              <>
                <Button
                  variant="light"
                  onClick={handleCancel}
                  className="transition-all duration-300 hover:scale-105"
                >
                  <X className="w-4 h-4 mr-2" />
                  {t('edit.cancel')}
                </Button>
                <Button
                  variant="solid"
                  color="primary"
                  onClick={handleSave}
                  isLoading={isSaving}
                  className="transition-all duration-300 hover:scale-105"
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
              </>
            ) : (
              <Button
                variant="solid"
                color="primary"
                onClick={() => setIsEditing(true)}
                className="transition-all duration-300 hover:scale-105"
              >
                <Upload className="w-4 h-4 mr-2" />
                {t('edit.editProfile')}
              </Button>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}