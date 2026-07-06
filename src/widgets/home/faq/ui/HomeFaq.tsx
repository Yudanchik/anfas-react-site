import { faqItems } from '@/features/faq/model/faq.data'
import { PlusIcon } from '@/shared/ui/icons/PlusIcon'
import styles from './HomeFaq.module.scss'

export function HomeFaq({
  openFaq,
  setOpenFaq,
}: {
  openFaq: number
  setOpenFaq: (value: number) => void
}) {
  return (
    <section className={styles.faq + ' ' + styles.sectionpad}>
      <div className={styles.faqtitle}>
        <div className={styles.sectionkicker} data-reveal>
          <span>05</span>
          <p>Частые вопросы</p>
        </div>
        <h2 data-reveal>
          Закрываем
          <br />
          <em>главные страхи.</em>
        </h2>
        <p data-reveal>
          Здесь собрали короткие ответы про сроки, бюджет, контроль, удалённый ремонт и выбор между
          дизайн-проектом и пакетным решением.
        </p>
      </div>
      <div className={styles.faqlist}>
        {faqItems.map((item, index) => (
          <article
            className={`${styles.faqitem} ${openFaq === index ? styles.isopen : ''}`}
            key={item.question}
          >
            <button
              type="button"
              aria-expanded={openFaq === index}
              onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
            >
              <span>0{index + 1}</span>
              <strong>{item.question}</strong>
              <PlusIcon open={openFaq === index} />
            </button>
            <div className={styles.faqanswer}>
              <p>{item.answer}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
