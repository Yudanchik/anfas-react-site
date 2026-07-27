import { company } from '@/shared/config/company'

import styles from './YandexOfficeMap.module.scss'

type YandexOfficeMapProps = {
  className?: string
  title?: string
}

export function YandexOfficeMap({
  className,
  title = 'Карта офиса Анфас на Яндекс Картах',
}: YandexOfficeMapProps) {
  return (
    <div className={`${styles.map} ${className ?? ''}`}>
      <iframe
        className={styles.map__frame}
        src={company.mapEmbedSrc}
        title={title}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    </div>
  )
}
