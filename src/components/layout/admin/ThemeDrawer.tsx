/**
 * 主题设置面板组件
 * 后台管理系统的主题设置面板
 * 使用 framer-motion 实现交错动画
 */

import { useCallback, useMemo } from 'react'
import { Button, Switch, Slider } from '@heroui/react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import {
  HiOutlineColorSwatch,
  HiOutlineMoon,
  HiOutlineSun,
  HiOutlineAdjustments,
  HiOutlineTemplate,
  HiOutlineSparkles,
  HiOutlineX,
  HiOutlineRefresh,
  HiOutlineViewList,
  HiOutlineMenuAlt3,
  HiOutlineViewBoards,
  HiOutlineBan,
  HiOutlineArrowRight,
  HiOutlineArrowsExpand
} from 'react-icons/hi'
import { useAppStore, type ThemeMode, type MenuLayout, type PageTransition } from '@/stores/app'
import { useTheme } from '@/hooks/useTheme'
import { LAYOUT } from '@/constants'
import { cn } from '@/utils'

// 背景层配置
const BACKGROUND_LAYERS = 5

// 主题抽屉属性
interface ThemeDrawerProps {
  isOpen: boolean
  onClose: () => void
}

// 遮罩层动画变体
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
}

// 背景层动画变体 - 交错滑入
const backgroundLayerVariants: Variants = {
  hidden: () => ({
    x: '100%',
    opacity: 0,
    scale: 1,
    y: 0
  }),
  visible: (custom: number) => ({
    x: 0,
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      delay: custom * 0.08,
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }),
  exit: (custom: number) => ({
    x: '100%',
    opacity: 0,
    transition: {
      delay: custom * 0.03,
      duration: 0.3,
      ease: 'easeIn'
    }
  })
}
// 内容项动画变体 - 交错显现
const contentItemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.3 + custom * 0.1,
      duration: 0.4,
      ease: 'easeOut'
    }
  })
}

// 主题设置面板内容
function ThemeSettingsContent({ onClose }: { onClose?: () => void }) {
  const { t } = useTranslation('setting')
  const {
    adminSettings,
    updateAdminSettings,
    resetAdminSettings
  } = useAppStore()

  // 预设颜色
  const presetColors = useMemo(() => [
    { label: t('primaryColor.default'), value: '#537BF9' },
    { label: t('primaryColor.green'), value: '#54B83E' },
    { label: t('primaryColor.purple'), value: '#7E0DF5' },
    { label: t('primaryColor.orange'), value: '#FF7416' },
    { label: t('primaryColor.pink'), value: '#FF98C3' }
  ], [t])

  // 菜单布局选项
  const menuLayouts: Array<{
    value: MenuLayout
    icon: React.ComponentType<{ className?: string }>
    label: string
  }> = useMemo(() => [
    { value: 'vertical', icon: HiOutlineViewList, label: t('menuLayout.vertical') },
    { value: 'horizontal', icon: HiOutlineMenuAlt3, label: t('menuLayout.horizontal') },
    { value: 'mixed', icon: HiOutlineTemplate, label: t('menuLayout.mixed') },
    { value: 'dual', icon: HiOutlineViewBoards, label: t('menuLayout.dual') },
    { value: 'dock', icon: HiOutlineViewBoards, label: t('menuLayout.dock') }
  ], [t])

  // 页面切换动效选项
  const pageTransitions: Array<{
    value: PageTransition
    icon: React.ComponentType<{ className?: string }>
    label: string
  }> = useMemo(() => [
    { value: 'none', icon: HiOutlineBan, label: t('pageTransition.none') },
    { value: 'fade', icon: HiOutlineSparkles, label: t('pageTransition.fade') },
    { value: 'slide', icon: HiOutlineArrowRight, label: t('pageTransition.slide') },
    { value: 'scale', icon: HiOutlineArrowsExpand, label: t('pageTransition.zoom') },
    { value: 'layered', icon: HiOutlineViewBoards, label: t('pageTransition.layered') }
  ], [t])

  const {
    themeMode,
    primaryColor,
    menuLayout,
    enableBorder,
    enableShadow,
    multiTab,
    showBreadcrumb,
    sidebarAccordion,
    colorWeak,
    clickEffect,
    menuWidth,
    borderRadius,
    fontSize,
    pageTransition,
  } = adminSettings

  const { actualTheme } = useTheme()

  // 根据主题模式设置文字颜色
  const drawerTextColor = actualTheme === 'dark' ? 'text-white' : 'text-gray-800'

  // 根据主题模式获取按钮样式
  const getButtonClass = (isActive: boolean) => {
    if (actualTheme === 'dark') {
      return isActive 
        ? 'bg-white/20 ring-2 ring-white/40' 
        : 'bg-white/5 hover:bg-white/10'
    }
    return isActive 
      ? 'bg-gray-100 ring-2 ring-gray-400/50' 
      : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
  }

  // 根据主题模式获取重置按钮样式（红色）
  const getResetButtonClass = () => {
    if (actualTheme === 'dark') {
      return 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
    }
    return 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
  }

  // 根据主题模式获取关闭按钮样式
  const getCloseButtonClass = () => {
    if (actualTheme === 'dark') {
      return 'text-white/80 hover:text-white'
    }
    return 'text-gray-500 hover:text-gray-700'
  }

  // 根据主题模式获取开关样式
  const getSwitchClassNames = () => ({
    thumb: actualTheme === 'dark' ? 'bg-white' : 'bg-white'
  })

  // 重置设置
  const handleReset = useCallback(() => {
    resetAdminSettings()
  }, [resetAdminSettings])

  // 更新设置帮助函数
  const updateSettings = useCallback((settings: Partial<typeof adminSettings>) => {
    updateAdminSettings(settings)
  }, [updateAdminSettings])

  // 渲染带动画的设置项
  const renderAnimatedSection = (
    children: React.ReactNode,
    index: number
  ) => (
    <motion.div
      custom={index}
      variants={contentItemVariants}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.div>
  )

  return (
    <div className={cn('h-full overflow-y-auto p-6', drawerTextColor)}>
      {/* 头部 */}
      <motion.div
        className="flex items-center justify-between mb-6"
        variants={contentItemVariants}
        custom={0}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-xl font-bold">{t('title')}</h2>
        <div className="flex items-center gap-1">
          <Button
            variant="light"
            isIconOnly
            size="sm"
            onPress={handleReset}
            className={getResetButtonClass()}
            aria-label={t('reset')}
          >
            <HiOutlineRefresh className="text-lg" />
          </Button>
          {onClose && (
            <Button
              variant="light"
              isIconOnly
              size="sm"
              onPress={onClose}
              className={getCloseButtonClass()}
              aria-label={t('close')}
            >
              <HiOutlineX className="text-lg" />
            </Button>
          )}
        </div>
      </motion.div>

      {/* 设置内容 */}
      <div className="flex flex-col gap-6">
        {/* 主题模式 */}
        {renderAnimatedSection(
          <section>
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <HiOutlineAdjustments className="text-lg" />
              {t('themeMode.title')}
            </h3>
            <div className="flex gap-2">
              {[
                { value: 'light' as ThemeMode, icon: HiOutlineSun, label: t('themeMode.light') },
                { value: 'dark' as ThemeMode, icon: HiOutlineMoon, label: t('themeMode.dark') },
                { value: 'system' as ThemeMode, icon: HiOutlineAdjustments, label: t('themeMode.system') }
              ].map((mode) => (
                <button
                  key={mode.value}
                  className={cn(
                    'flex-1 flex flex-col items-center gap-1 p-3 rounded-lg transition-all',
                    getButtonClass(themeMode === mode.value)
                  )}
                  onClick={() => updateSettings({ themeMode: mode.value })}
                >
                  <mode.icon className="text-xl" />
                  <span className="text-xs">{mode.label}</span>
                </button>
              ))}
            </div>
          </section>,
          1
        )}

        {/* 主色调 */}
        {renderAnimatedSection(
          <section>
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <HiOutlineColorSwatch className="text-lg" />
              {t('primaryColor.title')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {presetColors.map((color) => (
                <button
                  key={color.value}
                  className={cn(
                    'w-10 h-10 rounded-full transition-transform hover:scale-110',
                    primaryColor === color.value ? 'ring-2 ring-offset-2 ring-offset-transparent ring-white' : ''
                  )}
                  style={{ backgroundColor: color.value }}
                  onClick={() => updateSettings({ primaryColor: color.value })}
                  title={color.label}
                  aria-label={`${t('primaryColor.title')}: ${color.label}`}
                />
              ))}
            </div>
          </section>,
          2
        )}

        {/* 菜单布局 - 图标按钮 */}
        {renderAnimatedSection(
          <section>
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <HiOutlineTemplate className="text-lg" />
              {t('menuLayout.title')}
            </h3>
            <div className="flex gap-2">
              {menuLayouts.map((layout) => {
                const Icon = layout.icon
                return (
                  <button
                    key={layout.value}
                    className={cn(
                      'flex-1 flex flex-col items-center gap-1 p-3 rounded-lg transition-all',
                      getButtonClass(menuLayout === layout.value)
                    )}
                    onClick={() => updateSettings({ menuLayout: layout.value })}
                    title={layout.label}
                  >
                    <Icon className="text-xl" />
                    <span className="text-xs">{layout.label}</span>
                  </button>
                )
              })}
            </div>
          </section>,
          3
        )}

        {/* 页面切换动效 */}
        {renderAnimatedSection(
          <section>
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <HiOutlineSparkles className="text-lg" />
              {t('pageTransition.title')}
            </h3>
            <div className="flex gap-2">
              {pageTransitions.map((transition) => {
                const Icon = transition.icon
                return (
                  <button
                    key={transition.value}
                    className={cn(
                      'flex-1 flex flex-col items-center gap-1 p-3 rounded-lg transition-all',
                      getButtonClass(pageTransition === transition.value)
                    )}
                    onClick={() => updateSettings({ pageTransition: transition.value })}
                    title={transition.label}
                  >
                    <Icon className="text-xl" />
                    <span className="text-xs">{transition.label}</span>
                  </button>
                )
              })}
            </div>
          </section>,
          4
        )}

        {/* 布局设置 */}
        {renderAnimatedSection(
          <section>
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <HiOutlineAdjustments className="text-lg" />
              {t('layoutSettings.title')}
            </h3>
            <div className="flex flex-col gap-2">
              {[
                { key: 'multiTab', value: multiTab, label: t('layoutSettings.multiTab') },
                { key: 'showBreadcrumb', value: showBreadcrumb, label: t('layoutSettings.breadcrumb') },
                { key: 'sidebarAccordion', value: sidebarAccordion, label: t('layoutSettings.sidebarAccordion') },
                { key: 'enableBorder', value: enableBorder, label: t('layoutSettings.enableBorder') },
                { key: 'enableShadow', value: enableShadow, label: t('layoutSettings.enableShadow') }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between py-1">
                  <span className="text-sm">{item.label}</span>
                  <Switch
                    size="sm"
                    color="primary"
                    isSelected={item.value as boolean}
                    onValueChange={(value) => updateSettings({ [item.key]: value })}
                    classNames={getSwitchClassNames()}
                  />
                </div>
              ))}
            </div>
          </section>,
          5
        )}

        {/* 动效设置 */}
        {renderAnimatedSection(
          <section>
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <HiOutlineSparkles className="text-lg" />
              {t('animationSettings.title')}
            </h3>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between py-1">
                <span className="text-sm">{t('animationSettings.clickSpark')}</span>
                <Switch
                  size="sm"
                  color="primary"
                  isSelected={clickEffect}
                  onValueChange={(value) => updateSettings({ clickEffect: value })}
                  classNames={getSwitchClassNames()}
                />
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-sm">{t('animationSettings.colorWeak')}</span>
                <Switch
                  size="sm"
                  color="primary"
                  isSelected={colorWeak}
                  onValueChange={(value) => updateSettings({ colorWeak: value })}
                  classNames={getSwitchClassNames()}
                />
              </div>
            </div>
          </section>,
          6
        )}

        {/* 菜单宽度 */}
        {renderAnimatedSection(
          <section>
            <Slider
              label={t('menuWidth')}
              size="sm"
              step={10}
              minValue={LAYOUT.MIN_MENU_WIDTH}
              maxValue={LAYOUT.MAX_MENU_WIDTH}
              value={menuWidth}
              onChange={(value) => updateSettings({ menuWidth: value as number })}
              getValue={(value) => `${value}px`}
              showSteps={true}
              showOutline
              color="primary"
              className="max-w-md"
              aria-label={t('menuWidth')}
            />
          </section>,
          7
        )}

        {/* 全局圆角 */}
        {renderAnimatedSection(
          <section>
            <Slider
              label={t('globalRadius')}
              size="sm"
              step={2}
              minValue={LAYOUT.MIN_BORDER_RADIUS}
              maxValue={LAYOUT.MAX_BORDER_RADIUS}
              value={borderRadius}
              onChange={(value) => updateSettings({ borderRadius: value as number })}
              getValue={(value) => `${value}px`}
              showSteps={true}
              showOutline
              color="primary"
              className="max-w-md"
              aria-label={t('globalRadius')}
            />
          </section>,
          8
        )}

        {/* 字体大小 */}
        {renderAnimatedSection(
          <section>
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <HiOutlineAdjustments className="text-lg" />
              {t('fontSize')}
            </h3>
            <div className="flex gap-2">
              {LAYOUT.FONT_SIZE_OPTIONS.map((size) => (
                <button
                  key={size}
                  className={cn(
                    'flex-1 py-2 rounded-lg text-sm transition-all',
                    getButtonClass(fontSize === size)
                  )}
                  onClick={() => updateSettings({ fontSize: size })}
                >
                  {size}px
                </button>
              ))}
            </div>
          </section>,
          9
        )}


      </div>
    </div>
  )
}

export default function ThemeDrawer({ isOpen, onClose }: ThemeDrawerProps) {
  const { actualTheme } = useTheme()

  // 根据主题模式设置背景色（与卡片一致）
  const backgroundColor = actualTheme === 'dark' 
    ? '#18181B'  // 深色模式：深灰背景
    : '#ffffff'  // 浅色模式：白色背景

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* 遮罩层 */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50"
            onClick={onClose}
          />

          {/* 多层背景 - 交错动画 */}
          {Array.from({ length: BACKGROUND_LAYERS }).map((_, index) => (
            <motion.div
              key={`bg-layer-${index}`}
              custom={index}
              variants={backgroundLayerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md shadow-2xl"
              style={{
                backgroundColor,
                // 每层稍微偏移，产生层次感
                clipPath: `inset(0 0 0 0)`,
                zIndex: 50 - index
              }}
            />
          ))}

          {/* 抽屉内容 */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{
              delay: 0.2,
              type: 'spring',
              damping: 25,
              stiffness: 200
            }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md"
            style={{ pointerEvents: 'none' }}
          >
            <div className="h-full pointer-events-auto" style={{ pointerEvents: 'auto' }}>
              <ThemeSettingsContent onClose={onClose} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
