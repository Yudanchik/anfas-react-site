import { useState, type CSSProperties } from 'react'

import { ArrowIcon } from '@/shared/ui/icons/ArrowIcon'
import { PageWrapper } from '@/shared/ui/page-wrapper'
import { projectControlFeatures } from '../model/project-control.data'

import styles from './HomeProjectControl.module.scss'

type FeatureStyle = CSSProperties & {
  '--feature-y': string
}

export function HomeProjectControl() {
  const [activeFeature, setActiveFeature] = useState<number | null>(null)
  const [mobileScreen, setMobileScreen] = useState(0)
  const feature = activeFeature === null ? null : projectControlFeatures[activeFeature]

  const selectFeature = (index: number) => {
    setActiveFeature((current) => (current === index ? null : index))
  }

  return (
    <section className={styles.section} aria-labelledby="project-control-title">
      <PageWrapper className={styles.layout}>
        <div className={styles.copy}>
          <span className={styles.eyebrow}>
            <span className={styles.eyebrowNumber}>02</span>
            <span>Контроль проекта</span>
          </span>
          <h2 className={styles.title} id="project-control-title">
            Ремонт может быть понятным и <em>спокойным событием</em> в вашей жизни.
          </h2>
          <p className={styles.lead}>
            Всё, что происходит на объекте, вы видите в одном месте. Финансы, фотоотчёты, документы
            и цены на работы всегда под рукой. Нажмите на разделы в телефоне и посмотрите, как
            устроен прозрачный контроль ремонта.
          </p>

          <div className={styles.legend} aria-label="Возможности личного кабинета">
            <span>Финансы</span>
            <span>Фото и видео</span>
            <span>Документы</span>
          </div>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoHeader}>
            <span>Личный кабинет проекта</span>
            <span>Нажмите на раздел</span>
          </div>

          <div className={styles.viewport}>
            <div
              className={styles.canvas}
              data-mobile-screen={mobileScreen}
              style={{ transform: `translateX(-${mobileScreen * 50}%)` }}
            >
              <img
                className={styles.image}
                src="/images/home/project-control-v2.png"
                alt="Два экрана приложения для контроля ремонта: кабинет проекта и согласование работ"
              />

              <div className={styles.hotspots} aria-label="Разделы личного кабинета">
                {projectControlFeatures.map((item, index) => (
                  <button
                    className={`${styles.hotspot} ${index === activeFeature ? styles.hotspotActive : ''} ${activeFeature === null && index === 0 ? styles.hotspotInviting : ''}`}
                    style={{ '--feature-y': item.position } as FeatureStyle}
                    type="button"
                    key={item.id}
                    onClick={() => selectFeature(index)}
                    aria-label={`${item.label}: ${item.title}`}
                    aria-pressed={index === activeFeature}
                  />
                ))}
              </div>

              {feature && (
                <article
                  className={styles.tooltip}
                  style={{ '--feature-y': feature.position } as FeatureStyle}
                  aria-live="polite"
                >
                  <span>Раздел приложения</span>
                  <strong>{feature.label}</strong>
                  <p>{feature.text}</p>
                </article>
              )}
            </div>
          </div>

          {feature && (
            <article className={styles.mobileTooltip} aria-live="polite">
              <span>Раздел приложения</span>
              <strong>{feature.label}</strong>
              <p>{feature.text}</p>
            </article>
          )}

          <div className={styles.mobileControls}>
            <button
              type="button"
              onClick={() => setMobileScreen((current) => (current === 0 ? 1 : 0))}
              aria-label="Предыдущий экран"
            >
              <ArrowIcon size={15} />
            </button>
            <div>
              <button
                className={mobileScreen === 0 ? styles.dotActive : ''}
                type="button"
                onClick={() => setMobileScreen(0)}
                aria-label="Кабинет проекта"
                aria-current={mobileScreen === 0 ? 'true' : undefined}
              />
              <button
                className={mobileScreen === 1 ? styles.dotActive : ''}
                type="button"
                onClick={() => setMobileScreen(1)}
                aria-label="Согласование работ"
                aria-current={mobileScreen === 1 ? 'true' : undefined}
              />
            </div>
            <button
              type="button"
              onClick={() => setMobileScreen((current) => (current === 0 ? 1 : 0))}
              aria-label="Следующий экран"
            >
              <ArrowIcon size={15} />
            </button>
          </div>
        </div>
      </PageWrapper>
    </section>
  )
}
