import cookiePolicyRaw from '@/shared/content/legal/anfas_cookie_policy.txt?raw'

import { company } from '@/shared/config/company'
import { createSeoMeta } from '@/shared/config/seo'
import { parseLegalDocument } from '@/shared/lib/legal-document'
import { PageWrapper } from '@/shared/ui/page-wrapper'

import styles from './CookiesRoute.module.scss'

const REVISION_DATE = '16 июля 2026 года'

const cookieSummary = [
  { label: 'Оператор', value: company.legalOwner },
  { label: 'Email', value: company.email },
  { label: 'Редакция', value: REVISION_DATE },
] as const

const cookieSections = parseLegalDocument(cookiePolicyRaw)

export const meta = () =>
  createSeoMeta({
    title: 'Политика использования cookie — Анфас',
    description:
      'Информация об использовании локального хранения и технических данных на сайте ООО «АНФАС».',
    path: '/cookies',
    robots: 'noindex, follow',
  })

export default function CookiesRoute() {
  return (
    <main className={styles.page}>
      <PageWrapper>
        <section className={styles.documentHero}>
          <div>
            <p className={styles.eyebrow}>Документы</p>
            <h1 className={styles.title}>
              Политика
              <br />
              <em>использования cookie.</em>
            </h1>
            <p className={styles.lead}>
              Документ объясняет использование технических данных и локального хранилища браузера на
              сайте ООО «АНФАС».
            </p>
          </div>

          <aside className={styles.documentSummary} aria-label="Краткая информация о документе">
            {cookieSummary.map((item) => (
              <div key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </aside>
        </section>

        <section className={styles.documentLayout}>
          <aside className={styles.documentAside}>
            <span>Контакты оператора</span>
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
            {cookieSections.map((section) => (
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
