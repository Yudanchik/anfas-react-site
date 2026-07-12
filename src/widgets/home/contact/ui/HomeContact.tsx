import type { CSSProperties } from 'react'

import { ArrowIcon } from '@/shared/ui/icons/ArrowIcon'
import styles from './HomeContact.module.scss'

export function HomeContact({ onOpenBrief }: { onOpenBrief: () => void }) {
  return (
    <section id="contacts" className={styles.contact}>
      <div className={styles.contactorbit} aria-hidden="true">
        <span />
        <i />
      </div>
      <p
        className={styles.eyebrow}
        data-reveal
        style={{ '--reveal-delay': '0ms' } as CSSProperties}
      >
        <span /> Есть идея?
      </p>
      <h2 data-reveal style={{ '--reveal-delay': '80ms' } as CSSProperties}>
        Давайте посмотрим,
        <br />
        <em>что из неё получится.</em>
      </h2>
      <p
        className={styles.contactlead}
        data-reveal
        style={{ '--reveal-delay': '160ms' } as CSSProperties}
      >
        Расскажите немного о будущем интерьере. Мы свяжемся, зададим правильные вопросы и предложим
        следующий шаг.
      </p>
      <button
        className={styles.contactbutton}
        type="button"
        onClick={() => onOpenBrief()}
        data-reveal
        style={{ '--reveal-delay': '240ms' } as CSSProperties}
      >
        <span>Заполнить короткий бриф</span>
        <i>
          <ArrowIcon size={16} />
        </i>
      </button>
    </section>
  )
}
