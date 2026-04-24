/**
 * 关于博主页面
 *
 * 4 层纵向布局：博主信息区 → 技术栈跑马灯 → 成长热力图 → 气泡对话
 */

import { AvatarSection } from './sections/AvatarSection'
import { TechStackMarquee } from './sections/TechStackMarquee'
import { GrowthHeatmap } from './sections/GrowthHeatmap'
import { ChatSection } from './sections/ChatSection'

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-5xl">
      <AvatarSection />
      <TechStackMarquee />
      <GrowthHeatmap />
      <ChatSection />
    </div>
  )
}