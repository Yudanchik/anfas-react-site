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
    <section className={`${styles.socials} ${styles.socials_sectionPad}`}>
      <PageWrapper className={styles.socials__layout}>
        <div className={styles.socials__left}>
          <SectionHeader
            className={styles.socials__intro}
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

          <div className={styles.socials__links} data-reveal>
            {socialLinks.map((social) => (
              <a
                className={styles.socials__card}
                href={social.href}
                key={social.title}
                target="_blank"
                rel="noreferrer"
              >
                <div className={styles.socials__cardMain}>
                  <strong className={styles.socials__cardTitle}>{social.title}</strong>
                  <p className={styles.socials__cardText}>{social.text}</p>
                </div>
                <span className={styles.socials__cardAction} aria-hidden="true">
                  <ArrowIcon size={16} />
                </span>
              </a>
            ))}
          </div>

          <div className={styles.socials__note}>
            <p className={styles.socials__metaDisclaimer}>{META_DISCLAIMER}</p>
            <p className={styles.socials__caption}>
              Основной упор делаем на VK, Telegram и YouTube: там регулярно показываем этапы реализации,
              дизайн-проекты, ответы на частые вопросы и полезный контент про ремонт в Санкт-Петербурге.
            </p>
          </div>
        </div>

        <div className={styles.socials__phoneStage} data-reveal>
          <div className={styles.socials__phonePanel}>
            <div className={styles.socials__phoneShell}>
              <img
                className={styles.socials__phoneMockup}
                src={SOCIALS_PHONE_MOCKUP_SRC}
                alt=""
                loading="lazy"
                aria-hidden="true"
                decoding="async"
              />
              <div className={styles.socials__phoneScreen}>
                <video autoPlay loop muted playsInline preload="none" aria-label="Видео с объектов Анфас">
                  <source src={SOCIALS_VIDEO_SRC} type="video/mp4" />
                </video>
              </div>
            </div>
          </div>
        </div>
      </PageWrapper>
    </section>
  )
}
