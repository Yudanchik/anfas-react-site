import { GENERATED_YOUTUBE_VIDEOS } from './youtube-videos.generated'
import { FALLBACK_YOUTUBE_VIDEOS } from './youtube-videos.fallback'

export type { YoutubeVideo } from './youtube-videos.types'

/** Актуальный список для UI: generated, иначе fallback. */
export const youtubeVideos =
  GENERATED_YOUTUBE_VIDEOS.length > 0 ? GENERATED_YOUTUBE_VIDEOS : FALLBACK_YOUTUBE_VIDEOS
