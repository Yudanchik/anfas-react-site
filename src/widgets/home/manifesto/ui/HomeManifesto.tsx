import { PageWrapper } from '@/shared/ui/page-wrapper'
import { company } from '@/shared/config/company'

import { BuildingIcon, ColumnIcon, RubleIcon, ShieldIcon } from './HomeManifestoIcons'

import styles from './HomeManifesto.module.scss'

const manifestoStats = [
  {
    value: company.foundedYear,
    label: 'год начала работы',
    description: 'Опыт сложных проектов',
    Icon: ColumnIcon,
  },
  {
    value: '67',
    label: 'сданных объектов',
    description: 'Квартиры и частные дома',
    Icon: BuildingIcon,
  },
  {
    value: `${company.warranty.finishingMonths} мес`,
    label: 'гарантия',
    description: 'На отделочные работы',
    Icon: ShieldIcon,
  },
  {
    value: '24/7',
    label: 'доступ к отчетности',
    description: 'Прозрачный контроль проекта',
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
