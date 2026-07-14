import { ArrowIcon } from '@/shared/ui/icons/ArrowIcon'
import { PageWrapper } from '@/shared/ui/page-wrapper'

import { SectionHeader } from '../../ui'
import {
  META_DISCLAIMER,
  SOCIALS_PHONE_MOCKUP_SRC,
  SOCIALS_VIDEO_SRC,
  socialLinks,
} from '../model/socials.data'
import styles from './HomeSocials.module.scss'

export function HomeSocials() {
  return (
    <section className={styles.socials + ' ' + styles.sectionpad}>
      <PageWrapper className={styles.socialslayout}>
        <div className={styles.socialsleft}>
          <SectionHeader
            className={styles.socialsintro}
            number="08"
            label="Соцсети и видео"
            title={
              <>
                Следите за проектами,
                <br />
                материалами и <em>ходом ремонта</em>
              </>
            }
            lead="Показываем реальные объекты, решения по интерьеру, подбор материалов и то, как идёт ремонт квартиры под ключ вживую. Это помогает быстрее понять наш стиль работы и уровень детализации."
          />

          <article className={styles.spotlight} data-reveal>
            <div className={styles.spotlightTop}>
              <span className={styles.spotlightTag}>Анфас media</span>
              <strong>Реальный процесс, а не витрина без контекста.</strong>
            </div>
            <div className={styles.spotlightStats}>
              <div>
                <b>3+</b>
                <span>ключевых канала с живым контентом</span>
              </div>
              <div>
                <b>Объекты</b>
                <span>показываем этапы, а не только финал</span>
              </div>
            </div>
          </article>

          <div className={styles.sociallinks} data-reveal>
            {socialLinks.map((social) => (
              <a
                className={styles.socialcard}
                href={social.href}
                key={social.title}
                target="_blank"
                rel="noreferrer"
              >
                <div className={styles.socialcardmain}>
                  <strong>{social.title}</strong>
                  <p>{social.text}</p>
                </div>
                <span className={styles.socialcardaction} aria-hidden="true">
                  <ArrowIcon size={16} />
                </span>
              </a>
            ))}
          </div>

          <div className={styles.socialsnote}>
            <p className={styles.metadisclaimer}>{META_DISCLAIMER}</p>
            <p className={styles.socialscaption}>
              Основной упор делаем на VK, Telegram и YouTube: там регулярно показываем этапы реализации,
              дизайн-проекты, ответы на частые вопросы и полезный контент про ремонт в Санкт-Петербурге.
            </p>
          </div>
        </div>

        <div className={styles.phonestage} data-reveal>
          <div className={styles.phonepanel}>
            <div className={styles.phonepanelHeader}>
              <span className={styles.phonepanelTag}>Анфас online</span>
              <p>Видео с объектов, короткие обзоры интерьеров и понятные апдейты по этапам ремонта.</p>
            </div>

            <div className={styles.phoneshell}>
              <img
                className={styles.phonemockup}
                src={SOCIALS_PHONE_MOCKUP_SRC}
                alt=""
                aria-hidden="true"
                decoding="async"
              />
              <div className={styles.phonescreen}>
                <video autoPlay loop muted playsInline preload="metadata" aria-label="Видео с объектов Анфас">
                  <source src={SOCIALS_VIDEO_SRC} type="video/mp4" />
                </video>
              </div>
            </div>

            <div className={styles.phonepanelFooter} aria-hidden="true">
              <span>Объекты в работе</span>
              <span>Разборы решений</span>
              <span>Реальные сроки</span>
            </div>
          </div>
        </div>
      </PageWrapper>
    </section>
  )
}
