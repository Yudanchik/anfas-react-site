import { useId, useState } from 'react'

import type { YoutubeVideo } from '@/shared/content/youtube'

import styles from './YoutubeVideoCard.module.scss'

type YoutubeVideoCardProps = {
  video: YoutubeVideo
}

export function YoutubeVideoCard({ video }: YoutubeVideoCardProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const titleId = useId()

  return (
    <article className={styles.card} aria-labelledby={titleId}>
      <div className={styles.media}>
        {isPlaying ? (
          <iframe
            className={styles.frame}
            src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
        ) : (
          <button
            className={styles.playButton}
            type="button"
            onClick={() => setIsPlaying(true)}
            aria-label={`Смотреть видео: ${video.title}`}
          >
            <img
              className={styles.thumb}
              src={video.thumbnailUrl}
              alt=""
              width={480}
              height={360}
              loading="lazy"
              decoding="async"
            />
            <span className={styles.playIcon} aria-hidden="true">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                <path d="M8.5 6.8v10.4L18 12 8.5 6.8Z" />
              </svg>
            </span>
          </button>
        )}
      </div>
      <h3 className={styles.title} id={titleId}>
        {video.title}
      </h3>
    </article>
  )
}
