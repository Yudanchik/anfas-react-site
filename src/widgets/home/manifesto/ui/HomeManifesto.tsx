import { PageWrapper } from '@/shared/ui/page-wrapper'

import { BuildingIcon, ColumnIcon, RubleIcon, ShieldIcon } from './HomeManifestoIcons'

import styles from './HomeManifesto.module.scss'

const manifestoStats = [
  {
    value: '13',
    label: 'лет на рынке',
    description: 'Опыт сложных проектов',
    Icon: ColumnIcon,
  },
  {
    value: '100+',
    label: 'сданных объектов',
    description: 'Квартиры и частные дома',
    Icon: BuildingIcon,
  },
  {
    value: '36 мес',
    label: 'гарантия',
    description: 'На инженерные работы',
    Icon: ShieldIcon,
  },
  {
    value: '0 ₽',
    label: 'скрытых расходов',
    description: 'Прозрачная смета',
    Icon: RubleIcon,
  },
] as const

export function HomeManifesto() {
  return (
    <section className={styles.manifesto + ' ' + styles.manifesto_sectionPad}>
      <PageWrapper>
        <div className={styles.manifesto__statsPanel} data-reveal>
          {manifestoStats.map(({ value, label, description, Icon }) => (
            <article className={styles.manifesto__stat} key={label}>
              <div className={styles.manifesto__icon} aria-hidden="true">
                <Icon />
              </div>

              <div className={styles.manifesto__content}>
                <span className={styles.manifesto__number}>{value}</span>
                <span className={styles.manifesto__label}>{label}</span>
                <p className={styles.manifesto__description}>{description}</p>
              </div>
            </article>
          ))}
        </div>
      </PageWrapper>
    </section>
  )
}
