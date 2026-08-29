import { useState, type ReactNode } from 'react'

import styles from './EstimateSectionLines.module.scss'

type AddPanel = 'price' | 'manual' | null

type EstimateSectionLinesProps = {
  idPrefix: string
  title: string
  lead?: string
  /** Форма «работа из прайса»; если нет — кнопка скрыта (например, стены пока без каталога). */
  pricePanel?: ReactNode
  manualPanel: ReactNode
  children: ReactNode
}

/**
 * Обёртка «Строки сметы»: таблица + компактные действия добавления (по клику).
 */
export function EstimateSectionLines({
  idPrefix,
  title,
  lead = 'Группы можно раскрывать. Итог считается по выбранным строкам.',
  pricePanel,
  manualPanel,
  children,
}: EstimateSectionLinesProps) {
  const [openPanel, setOpenPanel] = useState<AddPanel>(null)
  const titleId = `${idPrefix}-lines-title`

  function toggle(panel: Exclude<AddPanel, null>) {
    setOpenPanel((prev) => (prev === panel ? null : panel))
  }

  return (
    <section className={styles.wrap} aria-labelledby={titleId}>
      <div className={styles.head}>
        <div className={styles.headCopy}>
          <h2 className={styles.title} id={titleId}>
            {title}
          </h2>
          <p className={styles.lead}>{lead}</p>
        </div>
        <div className={styles.actions}>
          {pricePanel ? (
            <button
              type="button"
              className={styles.action}
              data-active={openPanel === 'price' ? 'true' : 'false'}
              aria-expanded={openPanel === 'price'}
              onClick={() => toggle('price')}
            >
              Добавить работу из прайса
            </button>
          ) : null}
          <button
            type="button"
            className={styles.action}
            data-active={openPanel === 'manual' ? 'true' : 'false'}
            aria-expanded={openPanel === 'manual'}
            onClick={() => toggle('manual')}
          >
            Добавить ручную строку
          </button>
        </div>
      </div>

      {openPanel === 'price' && pricePanel ? <div className={styles.panel}>{pricePanel}</div> : null}
      {openPanel === 'manual' ? <div className={styles.panel}>{manualPanel}</div> : null}

      <div className={styles.tableSlot}>{children}</div>
    </section>
  )
}
