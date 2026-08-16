import { PlusIcon } from '@/shared/ui/icons/PlusIcon'
import { PageWrapper } from '@/shared/ui/page-wrapper'
import { SectionHeader } from '../../ui'
import styles from './HomeFaq.module.scss'
import { tieRussianShortWords } from '@/shared/lib/tie-russian-short-words'

type HomeFaqItem = {
  question: string
  answer: string
}

export function HomeFaq({
  items,
  openFaq,
  setOpenFaq,
}: {
  items: readonly HomeFaqItem[]
  openFaq: number
  setOpenFaq: (value: number) => void
}) {
  return (
    <section className={styles.faq + ' ' + styles.faq_sectionPad}>
      <PageWrapper className={styles.faq__content}>
        <SectionHeader
          className={styles.faq__title}
          tone="light"
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
          {items.map((item, index) => {
            const isOpen = openFaq === index
            const triggerId = `faq-trigger-${index + 1}`
            const answerId = `faq-answer-${index + 1}`
            const question = tieRussianShortWords(item.question)
            const answer = tieRussianShortWords(item.answer)

            return (
              <article
                className={`${styles.faq__item} ${isOpen ? styles.faq__item_open : ''}`}
                key={item.question}
              >
                <button
                  id={triggerId}
                  className={styles.faq__trigger}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                  onClick={() => setOpenFaq(isOpen ? -1 : index)}
                >
                  <span className={styles.faq__number}>0{index + 1}</span>
                  <strong className={styles.faq__question}>{question}</strong>
                  <span className={styles.faq__toggle}>
                    <PlusIcon open={isOpen} />
                  </span>
                </button>
                <div
                  className={styles.faq__answer}
                  id={answerId}
                  role="region"
                  aria-labelledby={triggerId}
                >
                  <div className={styles.faq__answerInner}>
                    <p className={styles.faq__answerText}>{answer}</p>
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
