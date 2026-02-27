import { 
  MediaPlayer, 
  MediaProvider, 
  Poster, 
  Track,
  type MediaPlayerInstance 
} from '@vidstack/react'
import { 
  DefaultVideoLayout, 
  defaultLayoutIcons 
} from '@vidstack/react/player/layouts/default'
import { useRef, useEffect } from 'react'
import '@vidstack/react/player/styles/default/theme.css'
import '@vidstack/react/player/styles/default/layouts/video.css'
import { cn } from '@/utils'
import { CHINESE } from './VideoPlayer.i18n'

export interface VideoTrack {
  src: string
  kind: 'subtitles' | 'captions' | 'chapters'
  label: string
  srcLang: string
  default?: boolean
}

export interface VideoPlayerProps {
  /** 视频源地址 */
  src: string
  /** 视频标题 */
  title?: string
  /** 封面图 */
  poster?: string
  /** 字幕/章节轨道 */
  tracks?: VideoTrack[]
  /** 缩略图 VTT */
  thumbnails?: string
  /** 自定义类名 */
  className?: string
  /** 自动播放 */
  autoPlay?: boolean
  /** 循环播放 */
  loop?: boolean
  /** 静音 */
  muted?: boolean
  /** 
   * 存储键名，用于本地存储播放进度和音量
   * 设置后会自动保存和恢复播放状态
   */
  storageKey?: string
  /** 宽高比，默认 16/9 */
  aspectRatio?: string
}

/**
 * 企业级视频播放器组件
 * 基于 Vidstack 封装，支持：
 * 1. 播放进度自动保存与恢复 (LocalStorage)
 * 2. 音量设置记忆
 * 3. 移动端适配 (PlaysInline + Landscape Fullscreen)
 * 4. 音频增强与音量记忆 (Audio Boost + Volume Persistence)
 * 5. 完整的 UI 定制能力
 * 6. 内置中文汉化
 */
export function VideoPlayer({
  src,
  title,
  poster,
  tracks,
  thumbnails,
  className,
  autoPlay = false,
  loop = false,
  muted = false,
  storageKey = 'vidstack-player-settings',
  aspectRatio = '16/9'
}: VideoPlayerProps) {
  const player = useRef<MediaPlayerInstance>(null)

  // 监听错误
  useEffect(() => {
    const currentPlayer = player.current
    if (!currentPlayer) return

    const unsubscribe = currentPlayer.subscribe(({ error }) => {
      if (error) {
        console.error('Video Player Error:', error)
      }
    })

    return () => unsubscribe()
  }, [])

  return (
    <div className={cn("w-full relative overflow-hidden rounded-xl bg-black shadow-lg", className)}>
      <MediaPlayer
        ref={player}
        title={title}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        playsInline
        storage={storageKey}
        aspectRatio={aspectRatio}
        fullscreenOrientation="landscape"
        className="w-full h-full"
      >
        <MediaProvider>
          {poster && (
            <Poster 
              className="vds-poster absolute inset-0 block h-full w-full opacity-0 transition-opacity data-[visible]:opacity-100 object-cover" 
              src={poster} 
              alt={title} 
            />
          )}
          {tracks?.map((track, i) => (
            <Track key={i.toString()} {...track} />
          ))}
        </MediaProvider>
        
        <DefaultVideoLayout 
          icons={defaultLayoutIcons} 
          thumbnails={thumbnails}
          translations={CHINESE}
          audioGains={{ min: 0, max: 200, step: 5 }}
        />
      </MediaPlayer>
    </div>
  )
}
