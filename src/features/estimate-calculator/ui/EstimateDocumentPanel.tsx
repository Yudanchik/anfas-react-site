import { useRef, useState } from 'react'
import type { EstimateLine, SelectedEstimateSectionWithZones } from '@/entities/estimate'
import {
  buildEstimateCsv,
  DOCUMENT_STORAGE_KEY,
  documentFilename,
  downloadEstimateFile,
  emptyDocumentDetails,
  findEstimateIssues,
  parseDocumentDetails,
  readDocumentDetails,
  type EstimateDocumentDetails,
} from '../model/estimate-document'
import {
  parseEstimateCalculatorSnapshot,
  writeEstimateCalculatorSnapshot,
  type EstimateCalculatorSnapshot,
} from '../model/estimate-calculator-persistence'
import { EstimateConfirmDialog } from './EstimateConfirmDialog'
import styles from './EstimateDocumentPanel.module.scss'

type Props = {
  sections: readonly SelectedEstimateSectionWithZones[]
  lines: readonly EstimateLine[]
  snapshot: EstimateCalculatorSnapshot
  onNew: () => void
}

export function EstimateDocumentPanel({ sections, lines, snapshot, onNew }: Props) {
  const [details, setDetails] = useState(readDocumentDetails)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [confirmation, setConfirmation] = useState<'new' | 'import' | null>(null)
  const pendingImport = useRef<{
    snapshot: EstimateCalculatorSnapshot
    details: EstimateDocumentDetails
  } | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const issues = findEstimateIssues(lines)
  const [reviewed, setReviewed] = useState<string | null>(null)
  const issueKey = JSON.stringify([
    issues,
    lines
      .filter((line) => line.enabled)
      .map((line) => [
        line.id,
        line.zoneId,
        line.zoneName,
        line.quantity,
        line.unitPrice,
        line.coefficient,
      ]),
  ])
  const invalid = lines.some(
    (line) =>
      line.enabled &&
      (![line.quantity, line.unitPrice, line.coefficient].every(
        (n) => Number.isFinite(n) && n > 0,
      ) ||
        !Number.isSafeInteger(Math.round(line.quantity * line.unitPrice * line.coefficient))),
  )
  const canExport =
    sections.length > 0 && !invalid && (issues.length === 0 || reviewed === issueKey)

  function update(patch: Partial<EstimateDocumentDetails>) {
    const next = { ...details, ...patch }
    setDetails(next)
    try {
      localStorage.setItem(DOCUMENT_STORAGE_KEY, JSON.stringify(next))
    } catch {
      setError('Данные документа не сохранены в браузере. Скачайте резервную копию.')
    }
  }

  async function pdf() {
    if (!canExport || busy) return
    setBusy(true)
    setError('')
    try {
      const { downloadEstimatePdf } = await import('../model/estimate-pdf')
      await downloadEstimatePdf(sections, details)
    } catch {
      setError('PDF не создан. Проверьте соединение и повторите скачивание.')
    } finally {
      setBusy(false)
    }
  }

  async function importFile(file?: File) {
    if (!file) return
    try {
      if (file.size > 5_000_000) throw new Error('size')
      const data: unknown = JSON.parse(await file.text())
      if (
        !data ||
        typeof data !== 'object' ||
        !('format' in data) ||
        data.format !== 'anfas-estimate-backup' ||
        !('version' in data) ||
        data.version !== 1 ||
        !('snapshot' in data)
      )
        throw new Error('format')
      const parsed = parseEstimateCalculatorSnapshot(data.snapshot)
      if (!parsed) throw new Error('snapshot')
      pendingImport.current = {
        snapshot: parsed,
        details: parseDocumentDetails('details' in data ? data.details : null),
      }
      setConfirmation('import')
      setError('')
    } catch {
      setError(
        'Не удалось открыть файл. Выберите резервную копию сметы Анфас JSON размером до 5 МБ.',
      )
    }
    if (fileInput.current) fileInput.current.value = ''
  }

  function confirm() {
    if (confirmation === 'new') {
      onNew()
      update(emptyDocumentDetails())
      setReviewed(null)
    } else if (pendingImport.current) {
      const next = pendingImport.current
      try {
        const previousDetails = localStorage.getItem(DOCUMENT_STORAGE_KEY)
        localStorage.setItem(DOCUMENT_STORAGE_KEY, JSON.stringify(next.details))
        if (!writeEstimateCalculatorSnapshot(next.snapshot)) {
          // A failed snapshot write must not mix two customers' documents.
          if (previousDetails === null) localStorage.removeItem(DOCUMENT_STORAGE_KEY)
          else localStorage.setItem(DOCUMENT_STORAGE_KEY, previousDetails)
          throw new Error('storage')
        }
        window.location.reload()
      } catch {
        setError('Не удалось сохранить загруженную смету. Освободите место в браузере и повторите.')
      }
    }
    pendingImport.current = null
    setConfirmation(null)
  }

  return (
    <section className={styles.panel} aria-labelledby="estimate-document-title">
      <div className={styles.heading}>
        <h2 id="estimate-document-title">Смета для заказчика</h2>
        <button type="button" className={styles.secondary} onClick={() => setConfirmation('new')}>
          Новая смета
        </button>
      </div>
      <div className={styles.fields}>
        {(
          [
            ['number', 'Номер сметы'],
            ['date', 'Дата'],
            ['customer', 'Заказчик'],
            ['object', 'Объект / адрес'],
            ['estimator', 'Составил'],
          ] as const
        ).map(([key, label]) => (
          <label key={key}>
            {label}
            <input
              type={key === 'date' ? 'date' : 'text'}
              maxLength={240}
              value={details[key]}
              onChange={(e) => update({ [key]: e.target.value })}
            />
          </label>
        ))}
        <label className={styles.note}>
          Примечание для заказчика
          <textarea
            rows={2}
            maxLength={2000}
            value={details.note}
            onChange={(e) => update({ note: e.target.value })}
          />
        </label>
      </div>
      {issues.length > 0 && (
        <div className={styles.issues}>
          <strong>Проверьте перед выдачей</strong>
          <ul>
            {issues.slice(0, 12).map((issue, index) => (
              <li key={index}>{issue}</li>
            ))}
          </ul>
          {issues.length > 12 && <p>Ещё позиций для проверки: {issues.length - 12}</p>}
          {!invalid && (
            <label>
              <input
                type="checkbox"
                checked={reviewed === issueKey}
                onChange={(e) => setReviewed(e.target.checked ? issueKey : null)}
              />{' '}
              Пересечения проверены, это разные объёмы работ
            </label>
          )}
        </div>
      )}
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.primary}
          disabled={!canExport || busy}
          onClick={() => void pdf()}
        >
          {busy ? 'Готовим PDF…' : 'Скачать PDF'}
        </button>
        <button
          type="button"
          className={styles.secondary}
          disabled={!canExport}
          onClick={() =>
            downloadEstimateFile(
              new Blob([buildEstimateCsv(sections)], { type: 'text/csv;charset=utf-8' }),
              documentFilename(details, 'csv'),
            )
          }
        >
          Таблица CSV
        </button>
        <button
          type="button"
          className={styles.secondary}
          onClick={() =>
            downloadEstimateFile(
              new Blob(
                [
                  JSON.stringify(
                    { format: 'anfas-estimate-backup', version: 1, details, snapshot },
                    null,
                    2,
                  ),
                ],
                { type: 'application/json' },
              ),
              documentFilename(details, 'json'),
            )
          }
        >
          Сохранить копию
        </button>
        <button
          type="button"
          className={styles.secondary}
          onClick={() => fileInput.current?.click()}
        >
          Открыть копию
        </button>
        <input
          ref={fileInput}
          className={styles.file}
          type="file"
          accept=".json,application/json"
          aria-label="Резервная копия сметы"
          onChange={(e) => void importFile(e.target.files?.[0])}
        />
      </div>
      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
      <EstimateConfirmDialog
        open={confirmation !== null}
        title={confirmation === 'new' ? 'Начать новую смету?' : 'Открыть другую смету?'}
        description="Текущая смета будет заменена. Сначала сохраните её копию, если планируете вернуться к редактированию."
        confirmLabel={confirmation === 'new' ? 'Начать новую' : 'Открыть'}
        onCancel={() => setConfirmation(null)}
        onConfirm={confirm}
      />
    </section>
  )
}
