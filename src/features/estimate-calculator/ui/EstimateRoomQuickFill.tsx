import { EstimateCatalogueVolumeFill } from './EstimateCatalogueVolumeFill'
import { useState } from 'react'
import type { EstimateLine, EstimateZone } from '@/entities/estimate'
import type { RoomSection } from '../model/room-quick-fill'
import {
  buildRoomWorkFillPlan,
  suggestRoomWorkQuantity,
  type RoomFillChange,
  type TileMeasureSurface,
} from '../model/room-work-quantity'
import { useEstimateStatusMessage } from '../model/use-estimate-status-message'
import { EstimateConfirmDialog } from './EstimateConfirmDialog'
import { EstimateSelect } from './EstimateSelect'
import styles from './EstimateRoomQuickFill.module.scss'

export function EstimateRoomQuickFill({
  section,
  zones,
  lines,
  onFill,
  onCatalogueFill,
  onReset,
}: {
  section: RoomSection
  zones: readonly EstimateZone[]
  lines: readonly EstimateLine[]
  onFill: (zone: EstimateZone, changes: readonly RoomFillChange[]) => void
  onCatalogueFill: (changes: readonly RoomFillChange[]) => void
  onReset: () => void
}) {
  const [targetId, setTargetId] = useState('')
  const [excludedIds, setExcludedIds] = useState<ReadonlySet<string>>(new Set())
  const [surface, setSurface] = useState<TileMeasureSurface | undefined>()
  const [confirmReset, setConfirmReset] = useState(false)
  const [pending, setPending] = useState<{ zone: EstimateZone; changes: RoomFillChange[] } | null>(
    null,
  )
  const zone = zones.find((entry) => entry.id === targetId) ?? zones[0]
  const candidates = lines.filter(
    (line) =>
      line.sectionId === section &&
      line.enabled &&
      line.source !== 'manual' &&
      (!line.zoneId || line.zoneId === zone?.id),
  )
  const selectedIds = new Set(
    candidates.filter((line) => !excludedIds.has(line.id)).map((line) => line.id),
  )
  const plan = zone
    ? buildRoomWorkFillPlan(section, zone, lines, selectedIds, surface)
    : { changes: [], skipped: [], conflicts: [] }
  const { status, setSuccess } = useEstimateStatusMessage({ clearTokens: [zone?.id ?? ''] })
  return (
    <>
      <EstimateCatalogueVolumeFill
        section={section}
        zones={zones}
        lines={lines}
        onFill={onCatalogueFill}
      />
      <details className={styles.wrap}>
        <summary>Обновить работы выбранного помещения</summary>
        <p className={styles.hint}>
          Подставьте замеры в отмеченные ниже работы. Здесь доступны включённые строки прайса и
          строки выбранного помещения. Общие строки будут привязаны к этому помещению; другие
          помещения и ручные работы сохранятся.
        </p>
        <div className={styles.actions}>
          {zone ? (
            <EstimateSelect
              value={zone.id}
              ariaLabel="Помещение для заполнения строк"
              options={zones.map((entry) => ({ value: entry.id, label: entry.name }))}
              onChange={(value) => {
                setTargetId(value)
                setExcludedIds(new Set())
              }}
            />
          ) : (
            <span>Сначала добавьте помещение.</span>
          )}
          <button
            type="button"
            className={styles.action}
            disabled={!zone || !plan.changes.length || !!plan.conflicts.length}
            onClick={() => {
              if (zone) setPending({ zone, changes: plan.changes })
            }}
          >
            Подставить объёмы помещения{plan.changes.length ? ` · ${plan.changes.length}` : ''}
          </button>
          <button type="button" className={styles.reset} onClick={() => setConfirmReset(true)}>
            Сбросить раздел
          </button>
        </div>
        {section === 'tile' ? (
          <div className={styles.surface}>
            <span>Площадь для облицовки, подготовки и затирки:</span>
            <EstimateSelect
              value={surface ?? ''}
              ariaLabel="Поверхность для заполнения строк плитки"
              options={[
                { value: '', label: 'Выберите поверхность' },
                { value: 'floor', label: 'Пол' },
                { value: 'walls', label: 'Стены' },
                { value: 'backsplash', label: 'Фартук' },
                { value: 'both', label: 'Пол и стены' },
              ]}
              onChange={(value) => setSurface(value ? (value as TileMeasureSurface) : undefined)}
            />
          </div>
        ) : null}
        {!candidates.length ? (
          <p className={styles.hint}>
            Сначала включите нужную работу в таблице прайса или добавьте её в выбранное помещение.
          </p>
        ) : (
          <ul className={styles.preview}>
            {candidates.map((line) => {
              const suggestion = suggestRoomWorkQuantity(
                section,
                zone,
                { id: line.priceKey, unit: line.unit },
                surface,
              )
              const selected = selectedIds.has(line.id)
              return (
                <li key={line.id}>
                  <label>
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() =>
                        setExcludedIds((previous) => {
                          const next = new Set(previous)
                          if (next.has(line.id)) next.delete(line.id)
                          else next.add(line.id)
                          return next
                        })
                      }
                    />{' '}
                    {line.title}
                  </label>
                  <span>
                    {suggestion.quantity > 0
                      ? `${line.quantity} → ${suggestion.quantity} ${line.unit}${line.zoneId ? '' : ' · привязать к помещению'}`
                      : suggestion.reason}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
        {plan.conflicts.map((message) => (
          <p key={message} className={styles.hint} role="alert">
            {message}
          </p>
        ))}
        {plan.skipped.length ? (
          <details className={styles.hint}>
            <summary>Не будет заполнено · {plan.skipped.length}</summary>
            <ul>
              {plan.skipped.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          </details>
        ) : null}
        {!!candidates.length && !plan.changes.length && !plan.skipped.length ? (
          <p className={styles.hint}>
            Отмеченные объёмы уже соответствуют замерам либо все строки сняты с выбора.
          </p>
        ) : null}
        {status ? (
          <p className={styles.hint} role="status">
            {status.message}
          </p>
        ) : null}
        <EstimateConfirmDialog
          open={pending !== null}
          title="Подставить объёмы помещения?"
          description={
            pending
              ? `Помещение «${pending.zone.name}»: изменится строк — ${pending.changes.length}. Уже введённые количества выбранных строк будут заменены. Общие позиции станут строками этого помещения, сохраняя цену и комментарий. Проверьте, что прежняя альтернативная работа выключена, чтобы не посчитать её дважды.`
              : ''
          }
          confirmLabel="Подставить"
          cancelLabel="Отмена"
          onCancel={() => setPending(null)}
          onConfirm={() => {
            if (pending) {
              onFill(pending.zone, pending.changes)
              setSuccess(
                `Подставлены объёмы: ${pending.changes.length}. Помещение: ${pending.zone.name}.`,
              )
            }
            setPending(null)
          }}
        />
        <EstimateConfirmDialog
          open={confirmReset}
          title="Сбросить раздел?"
          description="Выбранные работы и правки этого раздела будут сброшены. Проверьте, что нужные данные сохранены."
          confirmLabel="Сбросить"
          cancelLabel="Отмена"
          onCancel={() => setConfirmReset(false)}
          onConfirm={() => {
            onReset()
            setConfirmReset(false)
          }}
        />
      </details>
    </>
  )
}
