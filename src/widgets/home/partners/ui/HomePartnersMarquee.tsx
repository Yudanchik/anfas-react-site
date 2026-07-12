import styles from './HomePartners.module.scss'

type Partner = {
  name: string
  label: string
}

function PartnerCard({ partner }: { partner: Partner }) {
  return (
    <article className={styles.card}>
      <span>{partner.name}</span>
      <small>{partner.label}</small>
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
    <div className={styles.marquee} aria-hidden="true">
      <div className={[styles.marqueeTrack, reverse ? styles.reverse : ''].filter(Boolean).join(' ')}>
        {Array.from({ length: 2 }).map((_, group) => (
          <div className={styles.marqueeGroup} key={group}>
            {items.map((partner, index) => (
              <PartnerCard key={`${group}-${partner.name}-${index}`} partner={partner} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
