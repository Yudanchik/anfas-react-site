import { useState, type ReactNode } from 'react'

import styles from './EstimateScenarioWizard.module.scss'

type Step = { label: string; title: string; content: ReactNode; blockedReason?: string }

/** Общая раскладка мастеров; состав работ остаётся в модели соответствующего раздела. */
export function EstimateScenarioWizard({
  title,
  context,
  steps,
  preview,
  canApply,
  disabledHint,
  onApply,
  status,
  roomOverview,
  applyLabel,
  allRooms,
}: {
  title: string
  context: ReactNode
  steps: readonly Step[]
  preview: ReactNode
  canApply: boolean
  disabledHint?: string | null
  onApply: () => boolean
  roomOverview?: ReactNode
  allRooms?: boolean
  applyLabel?: string
  status?: ReactNode
}) {
  const [step, setStep] = useState(0)
  const current = steps[step]
  return (
    <section className={styles.wrap} aria-label={title}>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.lead}>
        Выберите помещение, ответьте на вопросы и проверьте предложенные работы.
      </p>
      <div className={styles.context}>{context}</div>
      {roomOverview}
      <p className={styles.stepLabel}>
        Шаг {step + 1} из {steps.length} · {current.label}
      </p>
      <div className={styles.grid}>
        <div className={styles.questions}>
          <h3 className={styles.cardTitle}>{current.title}</h3>
          {current.content}
          <div className={styles.navigation}>
            {step > 0 ? (
              <button type="button" className={styles.back} onClick={() => setStep(step - 1)}>
                Назад
              </button>
            ) : null}
            {step < steps.length - 1 ? (
              <button
                type="button"
                className={styles.action}
                disabled={Boolean(current.blockedReason)}
                onClick={() => setStep(step + 1)}
              >
                {step === steps.length - 2 ? 'Проверить работы' : 'Далее'}
              </button>
            ) : (
              <button
                type="button"
                className={styles.action}
                disabled={!canApply}
                onClick={() => {
                  if (onApply()) setStep(0)
                }}
              >
                {applyLabel ?? 'Добавить работы в смету'}
              </button>
            )}
          </div>
          {current.blockedReason || (step === steps.length - 1 && disabledHint) ? (
            <p className={styles.hint} role="status">
              {current.blockedReason || disabledHint}
            </p>
          ) : null}
        </div>
        <aside className={styles.preview} aria-label="Что войдёт в смету">
          <h3 className={styles.cardTitle}>Что войдёт в смету</h3>
          <p className={styles.hint}>
            Список меняется с ответами.{' '}
            {allRooms
              ? 'Объёмы берутся отдельно из замеров каждого готового помещения.'
              : 'Объёмы берутся из замеров выбранного помещения.'}
          </p>
          {preview}
        </aside>
      </div>
      {status}
    </section>
  )
}
