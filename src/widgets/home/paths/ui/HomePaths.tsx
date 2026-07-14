import { ArrowIcon } from '@/shared/ui/icons/ArrowIcon'
import { PageWrapper } from '@/shared/ui/page-wrapper'
import { SectionHeader } from '../../ui'

import styles from './HomePaths.module.scss'

export function HomePaths({
  onOpenBrief,
}: {
  onOpenBrief: (service?: 'individual' | 'package') => void
}) {
  return (
    <section id="paths" className={styles.paths + ' ' + styles.sectionpad}>
      <PageWrapper className={styles.container}>
        <SectionHeader
          className={styles.pathsHeader}
          number="05"
          label="Время выбрать"
          title={
            <>
              Теперь вы знаете, как
              <br />
              мы работаем. Что <em>ближе?</em>
            </>
          }
          lead="Оба формата ведут к одной цели: спокойному ремонту квартиры под ключ с понятным бюджетом, прозрачными сроками и контролем результата. Разница в том, сколько решений вы хотите оставить на нашей стороне."
        />

        <div className={styles.grid} data-reveal>
          <button
            className={`${styles.card} ${styles.individual}`}
            type="button"
            onClick={() => onOpenBrief('individual')}
          >
            <h3 className={styles.title}>Индивидуальный проект</h3>
            <p className={styles.desc}>
              Подходит, если вы хотите персональный дизайн интерьера, гибкую планировку,
              авторский подбор материалов и ремонт квартиры под ключ под ваш сценарий жизни.
            </p>
            <ul className={styles.features}>
              <li>Архитектурный дизайн-проект и продуманная планировка</li>
              <li>Авторский надзор и контроль реализации на каждом этапе</li>
              <li>Индивидуальный подбор мебели, света и отделочных материалов</li>
              <li>Срок реализации: от 8 до 14 месяцев в зависимости от задачи</li>
            </ul>
            <div className={styles.foot}>
              <span className={styles.price}>
                от <strong>9 000 ₽</strong> / м² · дизайн
              </span>
              <span className={styles.cta}>
                <span>Оставить заявку</span>
                <i>
                  <ArrowIcon size={16} />
                </i>
              </span>
            </div>
            <div className={`${styles.photo} ${styles.photoIndividual}`} aria-hidden="true">
              <span className={styles.photoBadge}>Индивидуальный путь</span>
              <div className={styles.photoContent}>
                <strong>Планировка, материалы и свет собираются под ваш образ жизни.</strong>
                <span>Без шаблонов и типовых сценариев.</span>
              </div>
            </div>
          </button>

          <button
            className={`${styles.card} ${styles.capsule}`}
            type="button"
            onClick={() => onOpenBrief('package')}
          >
            <h3 className={styles.title}>Капсульный ремонт</h3>
            <p className={styles.desc}>
              Готовый формат для тех, кто хочет быстро получить стильный интерьер: цена,
              материалы, сроки и сценарий комплектации понятны ещё до старта работ.
            </p>
            <ul className={styles.features}>
              <li>3–4 готовые интерьерные эстетики под квартиру под ключ</li>
              <li>Фиксированная цена и прозрачная смета без скрытых доплат</li>
              <li>Срок реализации: от 3 до 5 месяцев</li>
              <li>Собранные решения по мебели, свету, сантехнике и отделке</li>
            </ul>
            <div className={styles.foot}>
              <span className={styles.price}>
                от <strong>49 000 ₽</strong> / м² · под ключ
              </span>
              <span className={styles.cta}>
                <span>Оставить заявку</span>
                <i>
                  <ArrowIcon size={16} />
                </i>
              </span>
            </div>
            <div className={`${styles.photo} ${styles.photoCapsule}`} aria-hidden="true">
              <span className={styles.photoBadge}>Готовый формат</span>
              <div className={styles.photoContent}>
                <strong>Сроки, смета и комплектация понятны ещё до старта ремонта.</strong>
                <span>Быстрее запуск, меньше согласований.</span>
              </div>
            </div>
          </button>
        </div>
      </PageWrapper>
    </section>
  )
}
