import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import HttpBackend from 'i18next-http-backend'

// 导入语言包
import zhCN from './zh-CN/common.json'
import zhCNAuth from './zh-CN/auth.json'
import zhCNNavi from './zh-CN/navigation.json'
import zhCNDashboard from './zh-CN/dashboard.json'
import zhCNSetting from './zh-CN/setting.json'

import enUS from './en-US/common.json'
import enUSAuth from './en-US/auth.json'
import enUSNavi from './en-US/navigation.json'
import enUSDashboard from './en-US/dashboard.json'
import enUSSetting from './en-US/setting.json'

const resources = {
  'zh-CN': {
    common: zhCN,
    auth: zhCNAuth,
    navigation: zhCNNavi,
    dashboard: zhCNDashboard,
    setting: zhCNSetting
  },
  'en-US': {
    common: enUS,
    auth: enUSAuth,
    navigation: enUSNavi,
    dashboard: enUSDashboard,
    setting: enUSSetting
  }
}

i18n
  .use(HttpBackend)
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('locale') || 'zh-CN',
    fallbackLng: 'zh-CN',
    debug: import.meta.env.DEV,
    
    interpolation: {
      escapeValue: false
    },
    
    // 命名空间配置
    ns: ['common', 'auth', 'navigation', 'dashboard', 'setting'],
    defaultNS: 'common',
    
    // 加载配置
    load: 'currentOnly',
    
    // 检测浏览器语言
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  })

export default i18n
