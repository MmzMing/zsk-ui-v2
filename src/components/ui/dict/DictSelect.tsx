/**
 * 字典选择器组件
 * 自动对接 useDict Hook，使用缓存数据渲染选项
 */

import { Select, SelectItem, Spinner } from '@heroui/react'
import { useDict } from '@/hooks/useDict'
import type { SelectProps } from '@heroui/react'
import type { SysDictDataCache } from '@/types/dict.types'

interface DictSelectProps extends Omit<SelectProps, 'children'> {
  /**
   * 字典类型编码
   * 例如：sys_user_sex、sys_yes_no
   */
  dictType: string

  /**
   * 选项值字段，默认为 dictValue
   */
  valueField?: keyof SysDictDataCache

  /**
   * 选项标签字段，默认为 dictLabel
   */
  labelField?: keyof SysDictDataCache

  /**
   * 自定义选项过滤函数
   * 默认显示所有选项，不根据 status 过滤
   */
  filterOption?: (item: SysDictDataCache) => boolean
}

/**
 * 字典选择器
 * 根据 dictType 自动获取/刷新字典数据，渲染为 Select 选项
 *
 * @example
 * <DictSelect
 *   dictType="sys_user_sex"
 *   label="性别"
 *   placeholder="请选择性别"
 *   value={selectedSex}
 *   onChange={(e) => setSelectedSex(e.target.value)}
 * />
 */
export function DictSelect({
  dictType,
  valueField = 'dictValue',
  labelField = 'dictLabel',
  filterOption,
  label,
  placeholder,
  ...restProps
}: DictSelectProps) {
  const { data, loading } = useDict(dictType)

  // 默认过滤：仅显示正常状态
  const defaultFilter = (item: SysDictDataCache) => item.status === '0'
  const filter = filterOption || defaultFilter

  const options = data.filter(filter)

  return (
    <Select
      label={label}
      placeholder={loading ? '加载中...' : placeholder || '请选择'}
      isLoading={loading}
      {...restProps}
    >
      {loading ? (
        <SelectItem key="_loading" isDisabled>
          <div className="flex items-center gap-2">
            <Spinner size="sm" />
            加载中...
          </div>
        </SelectItem>
      ) : (
        options.map((item) => (
          <SelectItem key={String(item[valueField])}>
            {String(item[labelField])}
          </SelectItem>
        ))
      )}
    </Select>
  )
}

/**
 * 字典标签组件
 * 根据字典值显示对应的标签文本
 *
 * @example
 * <DictLabel dictType="sys_user_sex" value="0" />
 * // 显示：男
 */
interface DictLabelProps {
  /** 字典类型编码 */
  dictType: string

  /** 字典值 */
  value: string

  /** 未找到匹配项时的默认显示 */
  fallback?: string

  /** 自定义类名 */
  className?: string
}

export function DictLabel({ dictType, value, fallback = '-', className }: DictLabelProps) {
  const { data } = useDict(dictType)

  const item = data.find((d) => d.dictValue === value)

  if (!item) {
    return <span className={className}>{fallback}</span>
  }

  return <span className={className}>{item.dictLabel}</span>
}
