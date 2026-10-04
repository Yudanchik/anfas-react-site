import { useState } from 'react'
import type { EstimateLine, EstimateZone } from '@/entities/estimate'
import type { RoomSection } from '../model/room-quick-fill'
import type { RoomFillChange } from '../model/room-work-quantity'
import { unifiedCatalogueTargets } from '../model/catalogue-volume-fill'
import { EstimateSelect } from './EstimateSelect'
import styles from './EstimateRoomQuickFill.module.scss'

export function EstimateCatalogueVolumeFill({
  section,
  zones,
  lines,
  onFill,
}: {
  section: RoomSection
  zones: readonly EstimateZone[]
  lines: readonly EstimateLine[]
  onFill: (changes: readonly RoomFillChange[]) => void
}) {
  const [roomId, setRoomId] = useState('')
  const [message, setMessage] = useState('')
  const room = zones.find((zone) => zone.id === roomId) ?? zones[0]
  const targets = room ? unifiedCatalogueTargets(section, room, lines) : []
  return (
    <section className={styles.wrap} aria-label="Заполнение объёмов прайса">
      <p className={styles.hint}>
        Заполните подходящие выключенные строки замерами помещения одной кнопкой. Включённые работы
        и ручные количества сохраняются. Неоднозначные объёмы, например площадь облицовки пола или
        стен, уточняются при добавлении работы.
      </p>
      <div className={styles.actions}>
        {room ? (
          <EstimateSelect
            value={room.id}
            ariaLabel="Помещение для заполнения прайса"
            options={zones.map((zone) => ({ value: zone.id, label: zone.name }))}
            onChange={(value) => {
              setRoomId(value)
              setMessage('')
            }}
          />
        ) : (
          <span>Добавьте помещение</span>
        )}
        <button
          type="button"
          className={styles.action}
          disabled={!targets.length}
          onClick={() => {
            onFill(targets.map((target) => ({ id: target.line.id, quantity: target.quantity })))
            setMessage(
              `Заполнено выключенных строк: ${targets.length}. Включённые работы не изменились.`,
            )
          }}
        >
          Заполнить объёмы прайса{targets.length ? ` · ${targets.length}` : ''}
        </button>
      </div>
      {targets.length ? (
        <details className={styles.hint}>
          <summary>Какие объёмы подставятся · {targets.length}</summary>
          <ul>
            {targets.map(({ line, quantity }) => (
              <li key={line.id}>
                {line.title}: {line.quantity} → {quantity} {line.unit}
              </li>
            ))}
          </ul>
        </details>
      ) : (
        <p className={styles.hint}>
          Нет подходящих строк для заполнения: объёмы уже актуальны, сохранены ручные значения или
          не хватает однозначных замеров.
        </p>
      )}
      {message ? (
        <p role="status" className={styles.hint}>
          {message}
        </p>
      ) : null}
    </section>
  )
}
