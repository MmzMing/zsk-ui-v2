import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/stores/app'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import 'dayjs/locale/en'

export type Locale = 'zh-CN' | 'en-US'

export const LOCALE_CONFIG = {
  'zh-CN': {
    name: '简体中文',
    flag: '🇨🇳',
    dayjsLocale: 'zh-cn'
  },
  'en-US': {
    name: 'English',
    flag: '🇺🇸',
    dayjsLocale: 'en'
  }
} as const

export function useLocale() {
  const { i18n } = useTranslation()
  const { language, updateSettings } = useAppStore()

  const changeLocale = useCallback(async (newLocale: Locale) => {
    await i18n.changeLanguage(newLocale)
    updateSettings({ language: newLocale })
    localStorage.setItem('locale', newLocale)
    
    // 更新 Day.js 语言
    const dayjsLocale = LOCALE_CONFIG[newLocale].dayjsLocale
    dayjs.locale(dayjsLocale)
  }, [i18n, updateSettings])

  const toggleLocale = useCallback(() => {
    const nextLocale = language === 'zh-CN' ? 'en-US' : 'zh-CN'
    changeLocale(nextLocale)
  }, [language, changeLocale])

  return {
    locale: language,
    changeLocale,
    toggleLocale,
    localeConfig: LOCALE_CONFIG[language]
  }
}
