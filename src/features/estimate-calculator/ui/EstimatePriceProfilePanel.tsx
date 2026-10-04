import { useMemo, useRef, useState } from 'react'
import {
  countPriceEditedLines,
  type EstimateLine,
  type EstimatePriceProfile,
} from '@/entities/estimate'
import {
  describePriceProfile,
  downloadEstimatePriceTemplate,
  parseEstimatePriceProfileXlsx,
} from '../model/estimate-price-profile-xlsx'
import styles from './EstimatePriceProfilePanel.module.scss'

export type PriceProfileApplyMode = 'new-only' | 'recalculate'

export type PriceProfileApplyOptions = {
  mode: PriceProfileApplyMode
  overwriteCustom: boolean
}

type Props = {
  profile: EstimatePriceProfile | null
  lines: readonly EstimateLine[]
  estimateProfileLabel?: string | null
  profileMismatchMessage?: string | null
  availableWorkCount: number
  sectionCounts: readonly { label: string; count: number }[]
  onApply: (profile: EstimatePriceProfile | null, options: PriceProfileApplyOptions) => boolean
}

type PendingApply = {
  profile: EstimatePriceProfile | null
  label: string
  warnings: readonly string[]
  changedCount: number
  inactiveCount: number
}

export function EstimatePriceProfilePanel({
  profile,
  lines,
  estimateProfileLabel,
  profileMismatchMessage,
  availableWorkCount,
  sectionCounts,
  onApply,
}: Props) {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState<PendingApply | null>(null)
  const [confirmOverwriteCustom, setConfirmOverwriteCustom] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const customCount = useMemo(() => countPriceEditedLines(lines), [lines])

  async function downloadTemplate() {
    if (busy) return
    setBusy(true)
    setError('')
    setMessage('')
    try {
      await downloadEstimatePriceTemplate()
      setMessage(
        'Шаблон XLSX скачан. Колонка «Использовать = да» — доступность работы в прайсе (не включение в смету).',
      )
    } catch {
      setError('Не удалось скачать XLSX-шаблон. Повторите попытку.')
    } finally {
      setBusy(false)
    }
  }

  async function importTemplate(file?: File) {
    if (!file || busy) return
    setBusy(true)
    setError('')
    setMessage('')
    setConfirmOverwriteCustom(false)
    try {
      const result = await parseEstimatePriceProfileXlsx(file)
      if (!result.profile || result.errors.length > 0) {
        setError(result.errors.slice(0, 4).join(' ') || 'Прайс не загружен.')
        return
      }
      setPending({
        profile: result.profile,
        label: result.profile.name,
        warnings: result.warnings,
        changedCount: result.changedCount,
        inactiveCount: result.inactiveCount,
      })
    } catch {
      setError('Не удалось загрузить прайс. Используйте XLSX, скачанный из этого калькулятора.')
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
      setBusy(false)
    }
  }

  function resetProfile() {
    setError('')
    setMessage('')
    setConfirmOverwriteCustom(false)
    setPending({
      profile: null,
      label: 'Anfas, встроенный прайс',
      warnings: [],
      changedCount: 0,
      inactiveCount: 0,
    })
  }

  function cancelPending() {
    setPending(null)
    setConfirmOverwriteCustom(false)
    setMessage('Импорт прайса отменён. Активный прайс и смета не изменились.')
  }

  function commitPending(mode: PriceProfileApplyMode, overwriteCustom: boolean) {
    if (!pending) return
    if (mode === 'recalculate' && customCount > 0 && !overwriteCustom && !confirmOverwriteCustom) {
      setConfirmOverwriteCustom(true)
      return
    }
    if (
      !onApply(pending.profile, {
        mode,
        overwriteCustom: mode === 'recalculate' ? overwriteCustom || customCount === 0 : false,
      })
    ) {
      setError('Прайс не сохранён в браузере. Освободите место и повторите.')
      return
    }
    const warningText =
      pending.warnings.length > 0
        ? ` ${pending.warnings.slice(0, 3).join(' ')}${pending.warnings.length > 3 ? ` …ещё ${pending.warnings.length - 3}` : ''}`
        : ''
    const modeText =
      mode === 'new-only'
        ? 'Существующие строки сметы не пересчитаны — новый прайс только для новых работ.'
        : overwriteCustom || customCount === 0
          ? 'Прайс-строки сметы пересчитаны по новому прайсу (кроме полностью ручных).'
          : 'Прайс-строки без ручной правки пересчитаны; строки с ручной ценой/названием сохранены.'
    setMessage(
      pending.profile
        ? `Прайс «${pending.label}» активен (изменено ${pending.changedCount}, выключено ${pending.inactiveCount}). ${modeText}${warningText}`
        : `Включён «${pending.label}». ${modeText}`,
    )
    setPending(null)
    setConfirmOverwriteCustom(false)
    setError('')
  }

  return (
    <section className={styles.panel} aria-labelledby="estimate-price-profile-title">
      <div className={styles.heading}>
        <div>
          <span className={styles.eyebrow}>Прайс-лист</span>
          <h2 id="estimate-price-profile-title">Активный прайс</h2>
        </div>
        <strong>
          {describePriceProfile(profile)} · доступно {availableWorkCount} работ
        </strong>
      </div>
      <ul className={styles.sectionCounts} aria-label="Доступные работы по разделам">
        {sectionCounts.map((section) => <li key={section.label}><span>{section.label}</span><strong>{section.count}</strong></li>)}
      </ul>
      <p className={styles.text}>По умолчанию используется встроенный прайс Anfas. Чтобы загрузить свой, скачайте шаблон XLSX, измените цены или доступность работ и загрузите этот файл. В смете учитывается только стоимость работ; существующие суммы изменятся лишь после вашего выбора пересчёта.</p>
      {estimateProfileLabel ? (
        <p className={styles.meta} role="status">
          Смета сохранена с прайсом: {estimateProfileLabel}
        </p>
      ) : null}
      {profileMismatchMessage ? (
        <p className={styles.warning} role="status">
          {profileMismatchMessage}
        </p>
      ) : null}
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.secondary}
          disabled={busy || Boolean(pending)}
          onClick={downloadTemplate}
        >
          Скачать шаблон XLSX
        </button>
        <button
          type="button"
          className={styles.primary}
          disabled={busy || Boolean(pending)}
          onClick={() => fileInputRef.current?.click()}
        >
          Загрузить прайс XLSX
        </button>
        {profile ? (
          <button
            type="button"
            className={styles.secondary}
            disabled={busy || Boolean(pending)}
            onClick={resetProfile}
          >
            Вернуть Anfas
          </button>
        ) : null}
        <input
          ref={fileInputRef}
          className={styles.file}
          type="file"
          accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          aria-label="Загрузить прайс-лист XLSX"
          onChange={(event) => void importTemplate(event.target.files?.[0])}
        />
      </div>

      {pending ? (
        <div className={styles.choice} role="group" aria-label="Как применить прайс">
          <p className={styles.choiceTitle}>
            Применить «{pending.label}». Как использовать относительно текущей сметы?
          </p>
          {pending.warnings.length > 0 ? (
            <ul className={styles.warningList}>
              {pending.warnings.slice(0, 5).map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          ) : null}
          {confirmOverwriteCustom ? (
            <p className={styles.warning}>
              В смете {customCount} прайс-строк с ручной правкой цены или названия. Пересчитать их
              тоже?
            </p>
          ) : null}
          <div className={styles.actions}>
            {!confirmOverwriteCustom ? (
              <>
                <button
                  type="button"
                  className={styles.primary}
                  onClick={() => commitPending('new-only', false)}
                >
                  Только для новых работ
                </button>
                <button
                  type="button"
                  className={styles.secondary}
                  onClick={() => commitPending('recalculate', false)}
                >
                  Пересчитать прайс-строки
                </button>
                <button type="button" className={styles.secondary} onClick={cancelPending}>
                  Отмена
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className={styles.secondary}
                  onClick={() => commitPending('recalculate', false)}
                >
                  Сохранить ручные правки
                </button>
                <button
                  type="button"
                  className={styles.primary}
                  onClick={() => commitPending('recalculate', true)}
                >
                  Перезаписать и ручные цены
                </button>
                <button
                  type="button"
                  className={styles.secondary}
                  onClick={() => setConfirmOverwriteCustom(false)}
                >
                  Назад
                </button>
              </>
            )}
          </div>
        </div>
      ) : null}

      {message ? (
        <p className={styles.message} role="status">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </section>
  )
}
