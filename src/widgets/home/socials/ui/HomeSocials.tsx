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
            number="07"
            label="Следите за нами"
            title={
              <>
                Живые проекты,
                <br />
                полезные материалы и <em>новости компании</em>
              </>
            }
            lead="Соцсети помогают быстрее увидеть стиль работы и почувствовать, как мы ведём проекты. В них же мы показываем промежуточные этапы, полезные советы и новости команды."
          />

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

          <p className={styles.metadisclaimer}>{META_DISCLAIMER}</p>
        </div>

        <div className={styles.phonestage} data-reveal>
          <div className={styles.phonepanel}>
            <div className={styles.phoneshell}>
              <img
                className={styles.phonemockup}
                src={SOCIALS_PHONE_MOCKUP_SRC}
                alt=""
                aria-hidden="true"
                decoding="async"
              />
              <div className={styles.phonescreen}>
                <video autoPlay loop muted playsInline preload="metadata" aria-label="Видео с объектов Anfas">
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
