import type { CSSProperties } from 'react'

import contactBackground from '@/assets/images/contact/contact-background.webp'
import { ModalTriggerButton } from '@/features/brief/ui/ModalTriggerButton'
import styles from './HomeContact.module.scss'

export function HomeContact() {
  return (
    <section id="contacts" className={styles.contact}>
      <img
        className={styles.contact__background}
        src={contactBackground}
        alt=""
        width={1983}
        height={793}
        loading="lazy"
        decoding="async"
        aria-hidden="true"
      />
      <div className={styles.contact__orbit} aria-hidden="true">
        <i className={styles.contact__orbitSpinner} />
      </div>
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
      <ModalTriggerButton
        className={styles.contact__button}
        intent="brief"
        size="lg"
        source="home-contact"
        variant="inverse"
        data-reveal
        style={{ '--reveal-delay': '240ms' } as CSSProperties}
      >
        Заполнить короткий бриф
      </ModalTriggerButton>
    </section>
  )
}
