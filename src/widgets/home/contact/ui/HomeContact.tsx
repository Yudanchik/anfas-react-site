import type { CSSProperties } from 'react'

import { ArrowIcon } from '@/shared/ui/icons/ArrowIcon'
import { PageWrapper } from '@/shared/ui/page-wrapper'
import styles from './HomeContact.module.scss'

export function HomeContact({ onOpenBrief }: { onOpenBrief: () => void }) {
  return (
    <section id="contacts" className={styles.contact}>
      <div className={styles.contact__orbit} aria-hidden="true">
        <i className={styles.contact__orbitSpinner} />
      </div>
      <PageWrapper>
        <div className={styles.contact__center}>
          <p
            className={styles.contact__eyebrow}
            data-reveal
            style={{ '--reveal-delay': '0ms' } as CSSProperties}
          >
            <span className={styles.contact__eyebrowLine} /> Есть идея?
          </p>
          <h2
            className={styles.contact__title}
            data-reveal
            style={{ '--reveal-delay': '80ms' } as CSSProperties}
          >
            Давайте посмотрим,
            <br />
            <em className={styles.contact__titleAccent}>что из неё получится.</em>
          </h2>
          <p
            className={styles.contact__lead}
            data-reveal
            style={{ '--reveal-delay': '160ms' } as CSSProperties}
          >
            Расскажите немного о будущем интерьере. <br />
            Мы свяжемся, зададим правильные вопросы и предложим следующий шаг.
          </p>
          <button
            className={styles.contact__button}
            type="button"
            onClick={() => onOpenBrief()}
            data-reveal
            style={{ '--reveal-delay': '240ms' } as CSSProperties}
          >
            <span className={styles.contact__buttonText}>Заполнить короткий бриф</span>
            <i className={styles.contact__buttonIcon}>
              <ArrowIcon size={16} />
            </i>
          </button>
        </div>
      </PageWrapper>
    </section>
  )
}
