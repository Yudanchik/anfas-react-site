import { ArrowIcon } from '@/shared/ui/icons/ArrowIcon'
import { SectionHeader } from '../../ui'

import styles from './HomePaths.module.scss'

export function HomePaths({ onOpenBrief }: { onOpenBrief: () => void }) {
  return (
    <section id="paths" className={styles.paths + ' ' + styles.sectionpad}>
      <div className={styles.container}>
        <SectionHeader
          number="04"
          label="Время выбрать"
          title={
            <>
              Теперь вы знаете, как
              <br />
              мы работаем. Что <em>ближе?</em>
            </>
          }
          lead="Оба пути ведут к одной цели — готовой квартире без головной боли. Разница в том, сколько решений вы делаете сами."
        />

        <div className={styles.grid} data-reveal>
          <button className={`${styles.card} ${styles.individual}`} type="button" onClick={onOpenBrief}>
            <h3 className={styles.title}>Индивидуальный проект</h3>
            <p className={styles.desc}>
              Уникальный дизайн, авторская мебель, нестандартные планировки. Создаём с нуля под вас.
            </p>
            <ul className={styles.features}>
              <li>Архитектурный дизайн-проект</li>
              <li>Авторский надзор</li>
              <li>Любые материалы и бренды</li>
              <li>Срок: 8–14 месяцев</li>
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
            <div className={styles.photo} aria-hidden="true" />
          </button>

          <button className={`${styles.card} ${styles.capsule}`} type="button" onClick={onOpenBrief}>
            <h3 className={styles.title}>Капсульный ремонт</h3>
            <p className={styles.desc}>
              Готовый комплект решений: стиль, материалы, сроки и цена — известны до начала работ.
            </p>
            <ul className={styles.features}>
              <li>3–4 готовых стиля на выбор</li>
              <li>Фиксированная цена</li>
              <li>Срок: 3–5 месяцев</li>
              <li>Без сюрпризов в смете</li>
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
            <div className={styles.photo} aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  )
}

