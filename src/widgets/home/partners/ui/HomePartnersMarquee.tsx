import styles from './HomePartners.module.scss'

type Partner = {
  name: string
  label: string
}

function PartnerCard({ partner }: { partner: Partner }) {
  return (
    <article className={styles.partnerCard}>
      <span className={styles.partnerCard__name}>{partner.name}</span>
      <small className={styles.partnerCard__label}>{partner.label}</small>
    </article>
  )
}

export function HomePartnersMarquee({
  items,
  reverse = false,
}: {
  items: ReadonlyArray<Partner>
  reverse?: boolean
}) {
  return (
    <div className={styles.partnersMarquee} aria-hidden="true">
      <div className={[styles.partnersMarquee__track, reverse ? styles.partnersMarquee__track_reverse : ''].filter(Boolean).join(' ')}>
        {Array.from({ length: 2 }).map((_, group) => (
          <div className={styles.partnersMarquee__group} key={group}>
            {items.map((partner, index) => (
              <PartnerCard key={`${group}-${partner.name}-${index}`} partner={partner} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
