import { useEffect, useRef, useMemo } from 'react'
import * as echarts from 'echarts'

interface EChartsProps {
  option: echarts.EChartsOption
  style?: React.CSSProperties
  className?: string
}

export function ECharts({
  option,
  style = { height: '200px', width: '100%' },
  className = ''
}: EChartsProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    chartInstance.current = echarts.init(chartRef.current)
    chartInstance.current.setOption(option)

    const handleResize = () => {
      chartInstance.current?.resize()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chartInstance.current?.dispose()
    }
  }, [option])

  return (
    <div
      ref={chartRef}
      style={style}
      className={className}
    />
  )
}

export interface PieChartDataPoint {
  name: string
  value: number
}

export interface PieChartProps {
  data: PieChartDataPoint[]
  title?: string
  height?: string
}

const PIE_COLORS = ['#6366f1', '#3b82f6', '#22c55e', '#eab308', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6']

export function PieChart({
  data,
  title = '',
  height = '260px'
}: PieChartProps) {
  const chartData = useMemo(() => {
    if (data && data.length > 0) return data
    return [{ name: '暂无数据', value: 1 }]
  }, [data])

  const option = useMemo<echarts.EChartsOption>(() => ({
    backgroundColor: 'transparent',
    title: title ? {
      text: title,
      left: 'left',
      top: 0,
      textStyle: {
        fontSize: 13,
        fontWeight: 500,
        color: '#374151'
      }
    } : undefined,
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      padding: [10, 14],
      textStyle: {
        color: '#374151',
        fontSize: 12
      },
      formatter: (params: unknown) => {
        const item = params as { name: string; value: number; percent: number }
        return `${item.name}<br/>数量: <strong>${item.value}</strong><br/>占比: <strong>${item.percent}%</strong>`
      }
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: {
        color: '#6b7280',
        fontSize: 12
      },
      itemWidth: 12,
      itemHeight: 12,
      itemGap: 12
    },
    color: PIE_COLORS,
    series: [{
      name: title || '分布',
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['35%', '55%'],
      avoidLabelOverlap: true,
      itemStyle: {
        borderRadius: 6,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: false
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 14,
          fontWeight: 'bold'
        },
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.2)'
        }
      },
      labelLine: {
        show: false
      },
      data: chartData
    }]
  }), [chartData, title])

  return <ECharts option={option} style={{ height, width: '100%' }} />
}

export interface GaugeChartData {
  value: number
  min: number
  max: number
  name: string
}

export interface GaugeChartProps {
  data: GaugeChartData | null
  height?: string
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function GaugeChart({
  data,
  height = '260px'
}: GaugeChartProps) {
  const percent = data ? Math.round((data.value / data.max) * 100) : 0
  const displayValue = data ? formatBytes(data.value) : '0 B'
  const displayMax = data ? formatBytes(data.max) : '0 B'

  const option = useMemo<echarts.EChartsOption>(() => ({
    backgroundColor: 'transparent',
    series: [{
      type: 'gauge',
      startAngle: 210,
      endAngle: -30,
      min: 0,
      max: 100,
      splitNumber: 5,
      center: ['50%', '55%'],
      radius: '85%',
      progress: {
        show: true,
        width: 16,
        roundCap: true,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#22c55e' },
            { offset: 0.5, color: '#eab308' },
            { offset: 1, color: '#ef4444' }
          ])
        }
      },
      pointer: {
        show: false
      },
      axisLine: {
        lineStyle: {
          width: 16,
          color: [[1, '#e5e7eb']]
        },
        roundCap: true
      },
      axisTick: {
        show: false
      },
      splitLine: {
        show: false
      },
      axisLabel: {
        show: false
      },
      title: {
        show: true,
        offsetCenter: [0, '70%'],
        fontSize: 13,
        color: '#6b7280'
      },
      detail: {
        valueAnimation: true,
        fontSize: 28,
        fontWeight: 'bold',
        offsetCenter: [0, '10%'],
        formatter: () => `${percent}%`,
        color: '#374151'
      },
      data: [{
        value: percent,
        name: data?.name || ''
      }]
    }],
    graphic: [{
      type: 'text',
      left: 'center',
      bottom: '8%',
      style: {
        text: `${displayValue} / ${displayMax}`,
        fontSize: 12,
        fill: '#9ca3af'
      }
    }]
  }), [percent, data?.name, displayValue, displayMax])

  return <ECharts option={option} style={{ height, width: '100%' }} />
}
