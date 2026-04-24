/**
 * 第3层 — 技术成长热力图
 *
 * 参考 GitHub 贻动热力图风格，使用 SVG 绘制方格矩阵
 * 入场动画使用 BlurFade 逐列渐入
 */

import { useState, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { BlurFade } from '@/components/ui/magicui/BlurFade'
import { generateHeatmapData } from '../about-data'
import type { HeatmapDay, HeatmapLevel } from '../about-data'

/** 方格尺寸 */
const CELL_SIZE = 14
/** 方格间距 */
const CELL_GAP = 3
/** 每列代表一周（7 天） */
const DAYS_PER_WEEK = 7

/** 热力图颜色映射（使用主题色） */
const LEVEL_COLORS: Record<HeatmapLevel, string> = {
  0: 'var(--color-default-100)',
  1: 'hsl(var(--color-primary-100))',
  2: 'hsl(var(--color-primary-200))',
  3: 'hsl(var(--color-primary-400))',
  4: 'hsl(var(--color-primary-600))',
}

/** 月份标签 */
function getMonthLabels(weeks: HeatmapDay[][]): { label: string; x: number }[] {
  const labels: { label: string; x: number }[] = []
  const seenMonths = new Set<string>()

  weeks.forEach((week, weekIndex) => {
    const firstDay = week[0]
    if (!firstDay) return
    const date = new Date(firstDay.date)
    const monthKey = `${date.getFullYear()}-${date.getMonth()}`
    if (!seenMonths.has(monthKey)) {
      seenMonths.add(monthKey)
      labels.push({
        label: `${date.getMonth() + 1}月`,
        x: weekIndex * (CELL_SIZE + CELL_GAP),
      })
    }
  })

  return labels
}

export function GrowthHeatmap() {
  const { t } = useTranslation('about')
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null)

  // 生成热力图数据并按周分组
  const { weeks, monthLabels, totalCount, svgWidth, svgHeight } = useMemo(() => {
    const data = generateHeatmapData()
    const weeks: HeatmapDay[][] = []
    let currentWeek: HeatmapDay[] = []

    // 从第一个周日开始分组
    data.forEach((day) => {
      const date = new Date(day.date)
      const dayOfWeek = date.getDay()
      if (dayOfWeek === 0 && currentWeek.length > 0) {
        weeks.push(currentWeek)
        currentWeek = []
      }
      currentWeek.push(day)
    })
    if (currentWeek.length > 0) {
      weeks.push(currentWeek)
    }

    const totalCount = data.filter((d) => d.level > 0).length
    const labels = getMonthLabels(weeks)

    return {
      weeks,
      monthLabels: labels,
      totalCount,
      svgWidth: weeks.length * (CELL_SIZE + CELL_GAP) + 40,
      svgHeight: DAYS_PER_WEEK * (CELL_SIZE + CELL_GAP) + 30,
    }
  }, [])

  const handleCellHover = useCallback((day: HeatmapDay, weekIndex: number, dayIndex: number) => {
    if (day.level === 0) {
      setTooltip(null)
      return
    }
    setTooltip({
      x: weekIndex * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2,
      y: dayIndex * (CELL_SIZE + CELL_GAP) - 8,
      text: `${day.date}: ${day.desc}`,
    })
  }, [])

  return (
    <section className="py-12 px-4">
      <BlurFade direction="up" delay={0.5} duration={0.5}>
        <div className="flex flex-col gap-2 mb-6 text-center">
          <h2 className="text-2xl font-bold text-default-900">{t('heatmap.title')}</h2>
          <p className="text-default-500 text-sm">
            {t('heatmap.subtitle', { count: totalCount })}
          </p>
        </div>
      </BlurFade>

      <BlurFade direction="up" delay={0.6} duration={0.5}>
        <div className="w-full overflow-x-auto">
          <svg
            width={svgWidth}
            height={svgHeight}
            className="block mx-auto"
            style={{ minWidth: Math.min(svgWidth, 800) }}
          >
            {/* 月份标签 */}
            {monthLabels.map((ml) => (
              <text
                key={`${ml.label}-${ml.x}`}
                x={ml.x + 40}
                y={12}
                className="fill-default-500 text-xs"
                style={{ fontSize: 11 }}
              >
                {ml.label}
              </text>
            ))}

            {/* 热力图方格 */}
            {weeks.map((week, weekIndex) =>
              week.map((day, dayIndex) => (
                <rect
                  key={day.date}
                  x={weekIndex * (CELL_SIZE + CELL_GAP) + 40}
                  y={dayIndex * (CELL_SIZE + CELL_GAP) + 20}
                  width={CELL_SIZE}
                  height={CELL_SIZE}
                  rx={2}
                  ry={2}
                  fill={LEVEL_COLORS[day.level]}
                  onMouseEnter={() => handleCellHover(day, weekIndex, dayIndex)}
                  onMouseLeave={() => setTooltip(null)}
                  className="cursor-pointer transition-opacity duration-150 hover:opacity-80"
                />
              )),
            )}

            {/* Tooltip */}
            {tooltip && (
              <g>
                <rect
                  x={tooltip.x + 40 - 60}
                  y={tooltip.y + 20 - 26}
                  width={140}
                  height={24}
                  rx={4}
                  ry={4}
                  fill="var(--color-content1)"
                  stroke="var(--color-default-200)"
                />
                <text
                  x={tooltip.x + 40}
                  y={tooltip.y + 20 - 10}
                  textAnchor="middle"
                  className="fill-default-900"
                  style={{ fontSize: 11 }}
                >
                  {tooltip.text}
                </text>
              </g>
            )}
          </svg>
        </div>
      </BlurFade>
    </section>
  )
}