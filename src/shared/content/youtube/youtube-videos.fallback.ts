import type { YoutubeVideo } from './youtube-videos.types'
import fallbackVideos from './youtube-videos.fallback.json'

/** Ручной fallback: обычные ролики канала, если feed недоступен или отдаёт только Shorts. */
export const FALLBACK_YOUTUBE_VIDEOS = fallbackVideos as readonly YoutubeVideo[]
