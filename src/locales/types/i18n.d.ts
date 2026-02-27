import 'react-i18next'
import type common from '../zh-CN/common.json'
import type auth from '../zh-CN/auth.json'
import type navigation from '../zh-CN/navigation.json'

declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common'
    resources: {
      common: typeof common
      auth: typeof auth
      navigation: typeof navigation
    }
  }
}
