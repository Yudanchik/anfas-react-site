import privacyPolicyRaw from '@/shared/content/legal/anfas_privacy_policy.txt?raw'

import { company } from '@/shared/config/company'
import { createSeoMeta } from '@/shared/config/seo'
import { parseLegalDocument } from '@/shared/lib/legal-document'
import { PageWrapper } from '@/shared/ui/page-wrapper'

import styles from './PrivacyRoute.module.scss'

const REVISION_DATE = '16 июля 2026 года'

const privacySummary = [
  { label: 'Оператор', value: company.legalOwner },
  { label: 'Email', value: company.email },
  { label: 'Редакция', value: REVISION_DATE },
] as const

const privacySections = parseLegalDocument(privacyPolicyRaw)

export const meta = () =>
  createSeoMeta({
    title: 'Политика обработки персональных данных — Анфас',
    description:
      'Политика обработки персональных данных ООО «АНФАС»: цели, состав, сроки и порядок обработки персональных данных.',
    path: '/privacy',
    robots: 'noindex, follow',
  })

export default function PrivacyRoute() {
  return (
    <main className={styles.page}>
      <PageWrapper>
        <section className={styles.documentHero}>
          <div>
            <p className={styles.eyebrow}>Документы</p>
            <h1 className={styles.title}>
              Политика
              <br />
              <em>обработки персональных данных.</em>
            </h1>
            <p className={styles.lead}>
              Документ определяет порядок обработки и защиты персональных данных пользователей сайта
              ООО «АНФАС».
            </p>
          </div>

          <aside className={styles.documentSummary} aria-label="Краткая информация о документе">
            {privacySummary.map((item) => (
              <div key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </aside>
        </section>

        <section className={styles.documentLayout}>
          <aside className={styles.documentAside}>
            <span>Реквизиты оператора</span>
            <address>
              <p>{company.legalOwner}</p>
              <p>ИНН {company.legalInn}</p>
              <p>КПП {company.legalKpp}</p>
              <p>
                {company.legalRegLabel} {company.legalRegNumber}
              </p>
              <p>{company.legalAddress}</p>
              <p>{company.phone}</p>
              <p>{company.email}</p>
            </address>
          </aside>

          <div className={styles.documentSections}>
            {privacySections.map((section) => (
              <section className={styles.documentSection} key={section.title}>
                <h2>{section.title}</h2>
                {section.blocks.map((block, index) =>
                  block.kind === 'list' ? (
                    <ul key={`${section.title}-list-${index}`}>
                      {block.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p key={block.text}>{block.text}</p>
                  ),
                )}
              </section>
            ))}
          </div>
        </section>
      </PageWrapper>
    </main>
  )
}
