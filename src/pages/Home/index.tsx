/**
 * 首页组件
 */

import HomeBanner from './Banner'
import { Card } from '@heroui/react'

// 介绍层占位组件
const IntroSection = () => (
  <section className="py-20 bg-white dark:bg-zinc-900">
    <div className="container mx-auto px-4">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold mb-4">关于项目</h2>
        <div className="w-20 h-1 bg-black mx-auto"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-8 border-none shadow-lg hover:shadow-xl transition-shadow">
            <h3 className="text-xl font-bold mb-4 text-center">核心功能 {i}</h3>
            <p className="text-gray-500 leading-relaxed text-center">
              这是介绍层的占位内容，详细描述了项目的核心功能和技术特点。
            </p>
          </Card>
        ))}
      </div>
    </div>
  </section>
)

// 推荐层占位组件
const RecommendationSection = () => (
  <section className="py-20 bg-zinc-50 dark:bg-zinc-800">
    <div className="container mx-auto px-4">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold mb-4">精选推荐</h2>
        <div className="w-20 h-1 bg-black mx-auto"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="group relative overflow-hidden rounded-xl bg-gray-200 aspect-[3/4]">
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-white font-bold">查看详情</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
)

// 评价层占位组件
const EvaluationSection = () => (
  <section className="py-20 bg-white dark:bg-zinc-900 overflow-hidden">
    <div className="container mx-auto px-4 text-center">
      <div className="mb-16">
        <h2 className="text-4xl font-bold mb-4">用户评价</h2>
        <div className="w-20 h-1 bg-black mx-auto"></div>
      </div>
      <div className="flex flex-wrap justify-center gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="max-w-sm p-6 italic text-gray-600 dark:text-gray-400">
            &ldquo;这是用户评价的占位符。这个项目非常棒，纸戏剧风格的动画让人印象深刻，交互体验也非常流畅。&rdquo;
            <div className="mt-4 font-bold not-italic text-black dark:text-white">— 用户 {i}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
)

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* 1. Banner层 (动画层) */}
      <HomeBanner />

      {/* 2. 介绍层 */}
      <IntroSection />

      {/* 3. 推荐层 */}
      <RecommendationSection />

      {/* 4. 评价层 */}
      <EvaluationSection />
    </main>
  )
}
