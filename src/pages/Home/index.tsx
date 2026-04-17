/**
 * 首页组件
 */

import HomeBanner from './Banner'

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* 1. Banner层 (动画层) */}
      <HomeBanner />
    </main>
  )
}
