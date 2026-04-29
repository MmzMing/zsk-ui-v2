/**
 * 视频信息展示区
 * 描述
 */

import type { HomeVideoDetail } from '@/types/video-home.types'

interface Props {
  detail: HomeVideoDetail
}

export default function VideoInfoSection({ detail }: Props) {
  return (
    <section className="py-5 border-b border-default-200">
      {/* 描述：放大 2 倍 */}
      {detail.description && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">简介</h3>
          <p className="text-2xl text-default-500 leading-relaxed mt-2">
            {detail.description}
          </p>
        </div>
      )}
    </section>
  )
}
