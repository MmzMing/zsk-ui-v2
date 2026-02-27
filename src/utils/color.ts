/**
 * 颜色工具函数
 */

/**
 * 将 Hex 颜色转换为 RGB 对象
 * @param hex - Hex 颜色字符串 (#RRGGBB)
 * @returns RGB 对象 { r, g, b }
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : null
}

/**
 * 将 RGB 对象转换为 Hex 颜色字符串
 * @param r - 红色分量 (0-255)
 * @param g - 绿色分量 (0-255)
 * @param b - 蓝色分量 (0-255)
 * @returns Hex 颜色字符串 (#RRGGBB)
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
  )
}

/**
 * 混合两个颜色
 * @param color1 - 第一个颜色 (Hex)
 * @param color2 - 第二个颜色 (Hex)
 * @param weight - 第一个颜色的权重 (0-100)，默认 50
 * @returns 混合后的颜色 (Hex)
 */
export function mixColor(color1: string, color2: string, weight = 50): string {
  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)

  if (!rgb1 || !rgb2) return color1

  const p = weight / 100
  const w = p * 2 - 1
  const a = 0 // alpha difference

  const w1 = ((w * a === -1 ? w : (w + a) / (1 + w * a)) + 1) / 2
  const w2 = 1 - w1

  const r = Math.round(rgb1.r * w1 + rgb2.r * w2)
  const g = Math.round(rgb1.g * w1 + rgb2.g * w2)
  const b = Math.round(rgb1.b * w1 + rgb2.b * w2)

  return rgbToHex(r, g, b)
}

/**
 * 生成色阶
 * @param color - 主色 (Hex)
 * @returns 色阶对象 { 50, 100, ..., 900 }
 */
export function generatePalette(color: string): Record<string, string> {
  return {
    50: mixColor(color, '#ffffff', 10),
    100: mixColor(color, '#ffffff', 20),
    200: mixColor(color, '#ffffff', 40),
    300: mixColor(color, '#ffffff', 60),
    400: mixColor(color, '#ffffff', 80),
    500: color,
    600: mixColor(color, '#000000', 90),
    700: mixColor(color, '#000000', 80),
    800: mixColor(color, '#000000', 60),
    900: mixColor(color, '#000000', 40),
    foreground: '#ffffff', // 默认前景色
    DEFAULT: color,
  }
}
