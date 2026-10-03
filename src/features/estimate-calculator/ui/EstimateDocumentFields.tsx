import type { EstimateDocumentDetails } from '../model/estimate-document'
import styles from './EstimateDocumentPanel.module.scss'
export function EstimateDocumentFields({
  value,
  onChange,
}: {
  value: EstimateDocumentDetails
  onChange: (details: EstimateDocumentDetails) => void
}) {
  return (
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
            value={value[key]}
            onChange={(e) => onChange({ ...value, [key]: e.target.value })}
          />
        </label>
      ))}
      <label className={styles.note}>
        Примечание для заказчика
        <textarea
          rows={2}
          maxLength={2000}
          value={value.note}
          onChange={(e) => onChange({ ...value, note: e.target.value })}
        />
      </label>
    </div>
  )
}
