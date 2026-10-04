import type { useRoomScenarioBatch } from '../model/use-room-scenario-batch'
import styles from './EstimateScenarioWizard.module.scss'

export function EstimateScenarioRooms({
  batch,
  onSelect,
}: {
  batch: ReturnType<typeof useRoomScenarioBatch>
  onSelect: (id: string) => void
}) {
  return (
    <div className={styles.roomOverview}>
      <p className={styles.hint}>
        Работы по сценарию добавлены в {batch.rooms.filter((room) => room.applied).length} из{' '}
        {batch.rooms.length} помещений
      </p>
      <div className={styles.roomList}>
        {batch.rooms.map(({ zone, text, applied }) => (
          <button
            type="button"
            key={zone.id}
            className={styles.room}
            data-applied={applied}
            onClick={() => onSelect(zone.id)}
          >
            <strong>{zone.name}</strong>
            <span>{text}</span>
          </button>
        ))}
      </div>
      {batch.all ? (
        <>
          <p className={styles.hint}>
            Один набор ответов для всех помещений. Объёмы берутся отдельно из каждого. Готовы:{' '}
            {batch.ready.map(({ zone }) => zone.name).join(', ') || 'нет'}.
          </p>
          {batch.excluded.map(({ zone, check }) => (
            <p key={zone.id} className={styles.hint}>
              Будет пропущено: {zone.name} — {check.message}
            </p>
          ))}
        </>
      ) : null}
    </div>
  )
}
