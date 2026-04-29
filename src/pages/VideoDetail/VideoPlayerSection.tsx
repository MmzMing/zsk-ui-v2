/**
 * 视频播放器区域
 * 大尺寸播放器，16:9比例
 */

import { VideoPlayer } from '@/components/ui/video/VideoPlayer'
import type { HomeVideoDetail } from '@/types/video-home.types'

interface Props {
  detail: HomeVideoDetail
}

export default function VideoPlayerSection({ detail }: Props) {
  return (
    <section>
      <VideoPlayer
        src={detail.videoUrl}
        title={detail.title}
        poster={detail.coverUrl}
        storageKey={`video-progress-${detail.id}`}
      />
    </section>
  )
}
