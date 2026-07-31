import { ModalTriggerButton } from '@/features/brief/ui/ModalTriggerButton'
import { tieRussianShortWords } from '@/shared/lib/tie-russian-short-words'

import styles from './PricesCta.module.scss'

type PricesCtaProps = {
  title: string
  lead: string
  source: string
  buttonLabel?: string
}

export function PricesCta({ title, lead, source, buttonLabel = 'Получить полный прайс' }: PricesCtaProps) {
  return (
    <aside className={styles.cta}>
      <h2>{tieRussianShortWords(title)}</h2>
      <p>{tieRussianShortWords(lead)}</p>
      <ModalTriggerButton
        className={styles.button}
        intent="price-list"
        source={source}
        analyticsEvent="prices_cta_open"
        size="lg"
      >
        {buttonLabel}
      </ModalTriggerButton>
    </aside>
  )
}
