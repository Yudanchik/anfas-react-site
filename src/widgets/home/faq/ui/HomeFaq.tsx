import { faqItems } from '@/features/faq/model/faq.data'
import { PlusIcon } from '@/shared/ui/icons/PlusIcon'

export function HomeFaq({
  openFaq,
  setOpenFaq,
}: {
  openFaq: number
  setOpenFaq: (value: number) => void
}) {
  return (
<section className="faq section-pad">
        <div className="faq-title">
          <div className="section-kicker" data-reveal>
            <span>05</span>
            <p>Частые вопросы</p>
          </div>
          <h2 data-reveal>
            Закрываем
            <br />
            <em>главные страхи.</em>
          </h2>
          <p data-reveal>
            Здесь собрали короткие ответы про сроки, бюджет, контроль, удалённый ремонт и выбор
            между дизайн-проектом и пакетным решением.
          </p>
        </div>
        <div className="faq-list">
          {faqItems.map((item, index) => (
            <article
              className={`faq-item ${openFaq === index ? 'is-open' : ''}`}
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
              <div className="faq-answer">
                <p>{item.answer}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      
  )
}
