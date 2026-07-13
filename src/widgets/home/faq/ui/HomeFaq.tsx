import { faqItems } from '@/features/faq/model/faq.data'
import { PlusIcon } from '@/shared/ui/icons/PlusIcon'
import { PageWrapper } from '@/shared/ui/page-wrapper'
import { SectionHeader } from '../../ui'
import styles from './HomeFaq.module.scss'

export function HomeFaq({
  openFaq,
  setOpenFaq,
}: {
  openFaq: number
  setOpenFaq: (value: number) => void
}) {
  return (
    <section className={styles.section + ' ' + styles.sectionpad}>
      <div className={styles.bgimage} aria-hidden="true" />
      <PageWrapper className={styles.content}>
        <SectionHeader
          className={styles.faqtitle}_heroAside_5j773_122
          tone="dark"
          number="10"
          label="Частые вопросы"
          title={
            <>
              Закрываем
              <br />
              <em>главные страхи.</em>
            </>
          }
          lead="Здесь собрали короткие ответы про сроки, бюджет, контроль, удалённый ремонт и выбор между дизайн-проектом и пакетным решением."
        />
        <div className={styles.faqlist}>
          {faqItems.map((item, index) => {
            const isOpen = openFaq === index

            return (
              <article
                className={`${styles.faqitem} ${isOpen ? styles.isopen : ''}`}
                key={item.question}
              >
                <button
                  className={styles.faqtrigger}
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenFaq(isOpen ? -1 : index)}
                >
                  <span className={styles.faqnumber}>0{index + 1}</span>
                  <strong className={styles.faqquestion}>{item.question}</strong>
                  <span className={styles.faqtoggle}>
                    <PlusIcon open={isOpen} />
                  </span>
                </button>
                <div className={styles.faqanswer}>
                  <div className={styles.faqanswerinner}>
                    <p className={styles.faqanswertext}>{item.answer}</p>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </PageWrapper>
    </section>
  )
}
