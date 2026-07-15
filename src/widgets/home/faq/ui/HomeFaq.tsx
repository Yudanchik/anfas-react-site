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
    <section className={styles.faq + ' ' + styles.faq_sectionPad}>
      <div className={styles.faq__bgImage} aria-hidden="true" />
      <PageWrapper className={styles.faq__content}>
        <SectionHeader
          className={styles.faq__title}
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
        <div className={styles.faq__list}>
          {faqItems.map((item, index) => {
            const isOpen = openFaq === index

            return (
              <article
                className={`${styles.faq__item} ${isOpen ? styles.faq__item_open : ''}`}
                key={item.question}
              >
                <button
                  className={styles.faq__trigger}
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenFaq(isOpen ? -1 : index)}
                >
                  <span className={styles.faq__number}>0{index + 1}</span>
                  <strong className={styles.faq__question}>{item.question}</strong>
                  <span className={styles.faq__toggle}>
                    <PlusIcon open={isOpen} />
                  </span>
                </button>
                <div className={styles.faq__answer}>
                  <div className={styles.faq__answerInner}>
                    <p className={styles.faq__answerText}>{item.answer}</p>
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
