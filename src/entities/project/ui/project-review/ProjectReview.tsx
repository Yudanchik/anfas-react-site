import type { ProjectReviewData } from '../../model/project.types'
import { tieRussianShortWords } from '@/shared/lib/tie-russian-short-words'
import { HomeIcon, QuoteIcon, StarIcon, UsersIcon } from './ProjectReviewIcons'
import styles from './ProjectReview.module.scss'

type ProjectReviewProps = {
  review: ProjectReviewData
  className?: string
}

const ratingScale = [1, 2, 3, 4, 5] as const

export function ProjectReview({ review, className }: ProjectReviewProps) {
  const hasProjectMeta = Boolean(review.projectInfo || review.location)
  const rootClassName = [styles.projectReview, className].filter(Boolean).join(' ')

  return (
    <section className={rootClassName} aria-label="Отзыв клиента">
      <article className={styles.projectReview__card}>
        <p className={styles.projectReview__eyebrow}>Отзыв клиента</p>

        <blockquote className={styles.projectReview__quote}>
          <div className={styles.projectReview__quoteContent}>
            <p className={styles.projectReview__quoteText}>
              <span className={styles.projectReview__quoteOpen}>
                <QuoteIcon className={styles.projectReview__quoteIcon} direction="open" />
              </span>
              {tieRussianShortWords(review.quote)}
              <span className={styles.projectReview__quoteClose}>
                <QuoteIcon className={styles.projectReview__quoteIcon} direction="close" />
              </span>
            </p>
          </div>
        </blockquote>

        {review.details ? (
          <p className={styles.projectReview__details}>{review.details}</p>
        ) : null}

        <div
          className={styles.projectReview__rating}
          role="img"
          aria-label={`Оценка: ${review.rating} из 5`}
        >
          {ratingScale.map((value) => (
            <StarIcon
              className={
                value <= review.rating
                  ? styles.projectReview__star_active
                  : styles.projectReview__star_inactive
              }
              key={value}
            />
          ))}
        </div>

        <div className={styles.projectReview__divider} aria-hidden="true" />

        <footer className={styles.projectReview__footer}>
          <div className={styles.projectReview__author}>
            <span className={styles.projectReview__authorIcon}>
              <UsersIcon className={styles.projectReview__authorGlyph} />
            </span>
            <div className={styles.projectReview__authorCopy}>
              <strong className={styles.projectReview__authorName}>{review.author}</strong>
              {hasProjectMeta ? (
                <p className={styles.projectReview__authorMeta}>
                  {review.projectInfo ? <span>{review.projectInfo}</span> : null}
                  {review.projectInfo && review.location ? (
                    <span className={styles.projectReview__authorSeparator} aria-hidden="true" />
                  ) : null}
                  {review.location ? <span>{review.location}</span> : null}
                </p>
              ) : null}
            </div>
          </div>

          {review.service ? (
            <div className={styles.projectReview__service}>
              <HomeIcon className={styles.projectReview__serviceIcon} />
              <span>{review.service}</span>
            </div>
          ) : null}
        </footer>
      </article>
    </section>
  )
}
