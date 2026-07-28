import { ModalTriggerButton } from '@/features/brief/ui/ModalTriggerButton'
import individualFormatImage from '@/assets/images/formats/individual-format.webp'
import packageFormatImage from '@/assets/images/formats/package-format.webp'
import { PageWrapper } from '@/shared/ui/page-wrapper'
import { SectionHeader } from '../../ui'

import styles from './HomePaths.module.scss'

export function HomePaths() {
  return (
    <section id="paths" className={`${styles.paths} ${styles.paths_sectionPad}`}>
      <PageWrapper className={styles.container}>
        <SectionHeader
          className={styles.paths__header}
          number="05"
          label="Время выбрать"
          title={
            <>
              Теперь вы знаете, как
              <br />
              мы работаем. Что <em>ближе?</em>
            </>
          }
          lead="Оба формата ведут к одной цели: спокойной сдаче квартиры с фиксированным бюджетом и согласованным графиком. Разница в том, сколько решений вы хотите оставить на нашей стороне."
        />

        <div className={styles.paths__grid} data-reveal>
          <article
            className={`${styles.paths__card} ${styles.paths__card_individual}`}
          >
            <h3 className={styles.paths__title}>Индивидуальный проект</h3>
            <p className={styles.paths__description}>
              Подходит, если вы хотите персональный дизайн интерьера, гибкую планировку,
              авторский подбор материалов и реализацию под ваш сценарий жизни.
            </p>
            <ul className={styles.paths__features}>
              <li className={styles.paths__feature}>Архитектурный дизайн-проект и продуманная планировка</li>
              <li className={styles.paths__feature}>Авторский надзор и контроль реализации на каждом этапе</li>
              <li className={styles.paths__feature}>Индивидуальный подбор мебели, света и отделочных материалов</li>
              <li className={styles.paths__feature}>Срок реализации: от 8 до 14 месяцев в зависимости от задачи</li>
            </ul>
            <div className={styles.paths__footer}>
              <span className={styles.paths__price}>
                от <strong>55 000 ₽</strong> / м² · под ключ
              </span>
              <ModalTriggerButton intent="individual" source="home-paths-individual">
                Хочу индивидуальный ремонт
              </ModalTriggerButton>
            </div>
            <div className={`${styles.paths__photo} ${styles.paths__photo_individual}`} aria-hidden="true">
              <img
                className={styles.paths__photoImage}
                src={individualFormatImage}
                alt=""
                width={1448}
                height={1086}
                loading="lazy"
                decoding="async"
              />
              <span className={styles.paths__photoBadge}>Индивидуальный путь</span>
            </div>
          </article>

          <article
            className={`${styles.paths__card} ${styles.paths__card_package}`}
          >
            <h3 className={styles.paths__title}>Пакетный ремонт</h3>
            <p className={styles.paths__description}>
              Готовый формат для тех, кто хочет быстро получить стильный интерьер: цена,
              материалы, сроки и состав работ ясны ещё до старта.
            </p>
            <ul className={styles.paths__features}>
              <li className={styles.paths__feature}>3–4 готовые интерьерные эстетики на выбор</li>
              <li className={styles.paths__feature}>Фиксированная цена и открытая смета без скрытых доплат</li>
              <li className={styles.paths__feature}>Срок реализации: от 3 до 5 месяцев</li>
              <li className={styles.paths__feature}>Собранные решения по мебели, свету, сантехнике и отделке</li>
            </ul>
            <div className={styles.paths__footer}>
              <span className={styles.paths__price}>
                от <strong>49 000 ₽</strong> / м² · под ключ
              </span>
              <ModalTriggerButton intent="package" source="home-paths-package">
                Хочу пакетный ремонт
              </ModalTriggerButton>
            </div>
            <div className={`${styles.paths__photo} ${styles.paths__photo_package}`} aria-hidden="true">
              <img
                className={styles.paths__photoImage}
                src={packageFormatImage}
                alt=""
                width={1448}
                height={1086}
                loading="lazy"
                decoding="async"
              />
              <span className={styles.paths__photoBadge}>Готовый формат</span>
            </div>
          </article>
        </div>
      </PageWrapper>
    </section>
  )
}
