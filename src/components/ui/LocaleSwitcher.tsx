/**
 * LocaleSwitcher - 语言切换组件
 * 提供中英文切换功能，基于 react-i18next 和 HeroUI Dropdown
 */
import { useTranslation } from 'react-i18next'
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react'
import { Globe } from 'lucide-react'
import { useLocale, LOCALE_CONFIG, type Locale } from '@/hooks/useLocale'

export function LocaleSwitcher() {
  const { locale, changeLocale } = useLocale()
  const { t } = useTranslation()

  return (
    <Dropdown placement="bottom-end" shouldBlockScroll={false}>
      <DropdownTrigger>
        <Button 
          variant="light" 
          isIconOnly
          type="button"
          aria-label={t('actions.menu') || 'Language'}
          className="!text-default-600 hover:!text-default-900"
        >
          <Globe className="w-5 h-5" />
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="选择语言"
        selectionMode="single"
        selectedKeys={new Set([locale])}
        onSelectionChange={(keys) => {
          const selected = Array.from(keys)[0] as Locale
          if (selected) {
            changeLocale(selected)
          }
        }}
      >
        {(Object.keys(LOCALE_CONFIG) as Locale[]).map((key) => (
          <DropdownItem key={key} textValue={LOCALE_CONFIG[key].name}>
            {LOCALE_CONFIG[key].flag} {LOCALE_CONFIG[key].name}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  )
}
